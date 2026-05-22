# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **Bun** (see `bun.lock`). Scripts shell out to the Expo CLI:

- `bun start` — start Metro/Expo dev server
- `bun ios` / `bun android` / `bun web` — start with a target platform
- `bun lint` / `bun lint:fix` — run `expo lint` (ESLint flat config)

There is no test runner configured. The `reset-project` script in `package.json` references `./scripts/reset-project.js`, which does not exist in the repo.

A Husky `pre-commit` hook runs `lint-staged`, which executes `expo lint --fix` on staged `*.{ts,tsx,js,jsx}`. Don't use `--no-verify`; fix the lint failure instead.

## High-level architecture

This is an **Expo + React Native** app (Expo SDK 54, RN 0.81, React 19) using **expo-router** for file-based routing. The Expo entry point is `expo-router/entry` (set via `package.json#main`). `app.json` identifies the project as `Dating` (slug `dating`, scheme `dating`) — rebranded from the original Template starter.

Experimental Expo flags enabled in `app.json`: `newArchEnabled` (Fabric/TurboModules), `experiments.typedRoutes`, `experiments.reactCompiler`. New Architecture means avoid legacy bridge-only APIs.

### Routing (`app/`)

`app/_layout.tsx` is the root and wires global providers in this order: `QueryClientProvider` → `GestureHandlerRootView` → `ThemeProvider` → `BottomSheetModalProvider` → `<Stack>`. It also reads the persisted language out of Zustand and calls `configureLocalization` once on mount.

Top-level routes:
- `index.tsx` — splash screen; waits for **both** Zustand hydration and a 1500ms minimum delay, then routes:
  - `userProfile.completed === true` → `/(tabs)/SwipeScreen`
  - `accessToken` + `onboardingStep` → resume onboarding at saved step
  - otherwise → `OnboardingStack/NameScreen` (step 1)
- `OnboardingStack/` — 10-screen onboarding flow (see below)
- `(tabs)/` — bottom-tab group (Swipe, Discover, Likes, Chat, Profile) using a custom `CustomTabBar`

### Onboarding (`app/OnboardingStack/`)

10 screens in order, managed by `useOnboardingStep` hook (`src/components/onboarding/useOnboardingStep.ts`):

| Step | Screen | Key behavior |
|------|--------|-------------|
| 1 | `NameScreen` | displayName |
| 2 | `PhoneScreen` | Registers via `POST /auth/phone` → async `onSuccess`: saves tokens → `GET /user/profile` → saves user.id → `goNext` |
| 3 | `BirthdayScreen` | Day/Month/Year with auto-focus (2 digits → next field). Zodiac badge |
| 4 | `GenderScreen` | SelectionCard |
| 5 | `LookingForScreen` | SelectionCard |
| 6 | `AgeRangeScreen` | Dual stepper |
| 7 | `InterestsScreen` | Chip multi-select, min 3 |
| 8 | `PhotosScreen` | expo-image-picker, 1–6 photos |
| 9 | `DistanceScreen` | Custom PanResponder slider |
| 10 | `RelationshipTypeScreen` | On "Finish": calls `useSubmitOnboarding` → `PATCH /user/profile` (see API notes) → sets `userProfile.completed = true` → `queryClient.clear()` → navigate to SwipeScreen |

`goNext`/`goBack` use `router.replace` (no stack history). Each step saves to `ZustandPersist` so progress survives app restarts.

**phoneCode** is stored and sent without the `+` prefix (e.g. `84` not `+84`).

### State (`src/zustand/`)

Two stores:
- `persist.ts` (`ZustandPersist`, default export) — persisted to AsyncStorage under key `app-storage`. Fields: `ThemeApp`, `Localization`, `accessToken`, `refreshToken`, `user` (id, phoneCode, phoneNumber, displayName?, avatar?), `userProfile`, `matchPreferences`, `onboardingStep`, `iLiked`, `iPassed`. Actions: `save`, `setTokens`, `setUser`, `setUserProfile`, `setMatchPreferences`, `setOnboardingStep`, `addLiked`, `addPassed`, `clearProfile`, `logout`, `reset`. Use helpers, never mutate directly. `partialize` controls what's persisted.
- `session.ts` (`ZustandSession`, named export) — ephemeral session state using `devtools` middleware, not persisted.

### API layer (`src/api/`)

`apiClient` singleton in `axios/client.ts`. Base URL: `http://192.168.1.83:4000/api` (local dev server — update `axios/config.ts` for prod).

**Interceptors** (`axios/interceptors.ts`):
- Request: injects `Authorization: Bearer <accessToken>` from `ZustandPersist`
- Response success: logs `response.data`, returns response as-is
- Response error: logs error; on **401** calls `ZustandPersist.getState().logout()`

**API response shape**: the backend wraps all responses as `{ data: T, success: boolean, message?: string }`. Hooks that consume auth endpoints access the inner payload via `response?.data` (e.g. `useRegister.onSuccess`). The interceptor does NOT auto-unwrap — callers handle it explicitly.

**Endpoints** (`axios/config.ts`):
```
AUTH.REGISTER        POST /auth/phone        → { data: { accessToken, refreshToken, isNewUser } }
AUTH.REQUEST_OTP     POST /auth/otp/request
AUTH.VERIFY_OTP      POST /auth/otp/verify   → { data: { accessToken, refreshToken, isNewUser } }
AUTH.LOGOUT          POST /auth/logout
AUTH.REFRESH_TOKEN   POST /auth/refresh
USER.PROFILE         GET  /user/profile      → { data: User }
USER.UPDATE_PROFILE  PATCH /user/profile
```

**Service modules** (`services/`): `authService`, `userService`, `onboardingService`, `matchService`, `chatService`.

**Hooks** (`hooks/`): `useRegister`, `useRequestOtp`, `useVerifyOtp`, `useLogout` (in `useAuth.ts`); `useUserProfile`, `useUpdateProfile` (in `useUser.ts`); `useSubmitOnboarding` (in `useOnboarding.ts`); match + chat hooks. All exported from `hooks/index.ts`.

**`useSubmitOnboarding`** — `PATCH /user/profile` body: all `userProfile` fields except `phoneCode`/`phoneNumber`, with photos mapped as `{ url, order }` (not `{ id, uri, order }`), plus all `matchPreferences` fields spread in.

React Query config (`axios/queryClient.ts`): 5min staleTime, 10min gcTime, retry 3.

### Theming (`src/theme/`)

`ThemeProvider` exposes `ITheme` via React Context. Consume with `useAppTheme()`. Build `StyleSheet`s inside `useMemo(() => createStyles(theme), [theme])`.

### Localization (`src/localization/`)

`i18next` + `react-i18next`, English (`en.ts`) + Vietnamese (`vi.ts`). Use `getString(key, params?, language?)` for non-component code and `useTranslation` in components.

## Conventions

- **Absolute imports only.** Never use `../` or `../../` across modules. TS `paths` define: `components/*`, `assets/*`, `constants/*`, `utils/*`, `theme/*`, `zustand/*`, `localization/*`, `api/*`, `src/*`. Example: `import { useAppTheme } from 'theme/index'`.
- **Code comments must be in English**, regardless of the conversation language.
- **`console.log` is an ESLint error** (`eslint.config.js`). Allowed: `error`, `warn`, `info`, `debug`, `table`, `trace`.
- Use `AppText` (`components/text/AppText`) instead of RN `Text`.
- Chip/selection components: change only border color on select — do NOT change `fontWeight` or size, as that causes layout reflow in wrapped chip rows.

## Notes on the repo state

- No iOS/Android native folders (`/ios`, `/android` gitignored — managed Expo workflow).
- `expo-env.d.ts` is checked in even though `.gitignore` lists it; leave it alone.
- Several `.DS_Store` files are tracked. Don't add more.
- `src/api/axios/axiosClient.ts` is an unused stub — don't add to it.
- `src/data/api/` is a legacy API layer — do not use for new work.
- `.github/prompts.md` is stale (Three.js / yarn references) — ignore those parts; absolute-imports and English-comments rules still apply.

## Outer Harness (`.harness/`)

This repo uses an Outer Harness for AI-assisted work. **Read `.harness/AGENTS.md` first** at the start of every session.

Key entrypoints:
- `.harness/AGENTS.md` — agent operating instructions (load this first)
- `.harness/knowledge/project.md` — bridges org rules → this CLAUDE.md
- `.harness/init.sh <task-id> "<title>"` — bootstrap a new tracked task
- `.harness/gates/run-gates.sh` — pre-merge lint + typecheck + test
- `.harness/logs/runs.jsonl` — append-only audit trail

Do not edit anything inside `.harness/` (other than appending to `runs.jsonl`, `tasks/INDEX.md`, or creating new task dirs) without recording the change in `.harness/governance/CHANGELOG.md`.
