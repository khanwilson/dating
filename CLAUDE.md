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
  - `userProfile.relationshipType` present → `/(tabs)/SwipeScreen`
  - `accessToken` present but no `relationshipType` → `OnboardingStack/BirthdayScreen` (step 3), also resets `onboardingStep` to 3
  - otherwise → `SignInScreen`
- `SignInScreen.tsx` — auth entry point (phone OTP login + register redirect)
- `OnboardingStack/` — 10-screen onboarding flow (see below)
- `(tabs)/` — bottom-tab group (Swipe, Discover, Likes, Chat, Profile) using a custom `CustomTabBar`

### Auth flow

**SignInScreen** (`app/SignInScreen.tsx`):
- Entrance animation: typewriter "Welcome back" → lifts to top → staggered fade-in of UI elements + corner hearts
- Phone input with country picker → "Send OTP" → OTP modal (slide-up sheet)
- OTP countdown 59 s; resend available after countdown
- On 404 `PHONE_NOT_REGISTERED` error: shows `PopupPhone404` → user can navigate to onboarding (step 1)
- "Start as new user" button: `clearProfile()` + `logout()` → NameScreen (step 1)
- `useConfirmPhoneOtp.onSuccess`: saves tokens → calls `GET /user/profile` → unwraps `response.data` → if `profile.relationshipType` → SwipeScreen, else → BirthdayScreen (step 3) with `setOnboardingStep(3)`

**401 handling** (`axios/interceptors.ts`): on 401 → `logout()` + `router.replace('/SignInScreen')`. `logout()` clears tokens but preserves `userProfile` and `onboardingStep` so routing works correctly after re-auth.

### Onboarding (`app/OnboardingStack/`)

10 screens in order, managed by `useOnboardingStep` hook (`src/components/onboarding/useOnboardingStep.ts`):

| Step | Screen | Key behavior |
|------|--------|-------------|
| 1 | `NameScreen` | displayName → saved to `userProfile` |
| 2 | `PhoneScreen` | Phone number input only (no OTP here). On Next: saves `{ phoneCode, phoneNumber }` → calls `POST /auth/phone` (`useRegister`) → saves tokens → `goNext` |
| 3 | `BirthdayScreen` | Day/Month/Year with auto-focus (2 digits → next field). Zodiac badge. **Back → SignInScreen** (not PhoneScreen) |
| 4 | `GenderScreen` | SelectionCard |
| 5 | `LookingForScreen` | SelectionCard → saves to `userProfile.matchPreferences.lookingFor` |
| 6 | `AgeRangeScreen` | Dual stepper → saves to `userProfile.matchPreferences.ageMin/ageMax` |
| 7 | `InterestsScreen` | Chip multi-select, min 3 |
| 8 | `PhotosScreen` | expo-image-picker, 1–6 photos |
| 9 | `DistanceScreen` | Custom PanResponder slider → saves to `userProfile.matchPreferences.maxDistanceKm` |
| 10 | `RelationshipTypeScreen` | On "Finish": saves to `userProfile.matchPreferences.relationshipType` → calls `useSubmitOnboarding` → `PATCH /user/profile` → `queryClient.clear()` → SwipeScreen |

`goNext`/`goBack` use `router.replace` (no stack history). Each step saves to `ZustandPersist` so progress survives app restarts.

**Back at step 3**: `useOnboardingStep.goBack` always navigates to `/SignInScreen` when `currentStep === 3`.

**phoneCode** is stored and sent without the `+` prefix (e.g. `84` not `+84`).

### State (`src/zustand/`)

Two stores:
- `persist.ts` (`ZustandPersist`, default export) — persisted to AsyncStorage under key `app-storage`. Fields: `ThemeApp`, `Localization`, `accessToken`, `refreshToken`, `user` (id, phoneCode, phoneNumber, displayName?, avatar?), `userProfile` (includes nested `matchPreferences?: MatchPreferences`), `onboardingStep`, `iLiked`, `iPassed`. Actions: `save`, `setTokens`, `setUser`, `setUserProfile`, `setOnboardingStep`, `addLiked`, `addPassed`, `clearProfile`, `logout`, `reset`. Use helpers, never mutate directly. `partialize` controls what's persisted.
- `session.ts` (`ZustandSession`, named export) — ephemeral session state using `devtools` middleware, not persisted.

**`matchPreferences` is now nested inside `userProfile.matchPreferences`** — there is no separate top-level `matchPreferences` field or `setMatchPreferences` action. All match preference writes go through `setUserProfile({ matchPreferences: { ...existing, key: value } })`.

**`logout()`** clears `accessToken`, `refreshToken`, `user`, `iLiked`, `iPassed` — but preserves `userProfile` and `onboardingStep` so re-auth routing works correctly.

### API layer (`src/api/`)

`apiClient` singleton in `axios/client.ts`. Base URL set in `axios/config.ts` (local dev server — update for prod).

**Interceptors** (`axios/interceptors.ts`):
- Request: injects `Authorization: Bearer <accessToken>` from `ZustandPersist`
- Response success: logs full response object via `console.info`
- Response error: on **401** calls `logout()` + `router.replace('/SignInScreen')`; wraps error into `ApiError` (`src/api/axios/common.ts`) with `statusCode` and `data` fields

**API response shape**: backend wraps all responses as `{ data: T, success: boolean, message?: string }`. `apiClient.get/post/patch()` returns `response.data` (the HTTP body). So callers receive `{ data: T, success: bool }` and must unwrap via `(response as any)?.data ?? response` to get the inner payload.

**Endpoints** (`axios/config.ts`):
```
AUTH.REGISTER            POST /auth/phone              → { data: { accessToken, refreshToken, isNewUser } }
AUTH.PHONE_OTP_REQUEST   POST /auth/phone-otp/request
AUTH.PHONE_OTP_CONFIRM   POST /auth/phone-otp/confirm  → { data: { accessToken, refreshToken, isNewUser } }
AUTH.LOGOUT              POST /auth/logout
AUTH.REFRESH_TOKEN       POST /auth/refresh
USER.PROFILE             GET  /user/profile            → { data: User }
USER.UPDATE_PROFILE      PATCH /user/profile
SWIPES.CANDIDATES        GET  /swipes/candidates       → { data: Candidate[], nextCursor: string | null }
```

**Service modules** (`services/`): `authService`, `userService`, `onboardingService`, `matchService`, `chatService`.

**Hooks** (`hooks/`): `useRegister`, `useRequestPhoneOtp`, `useConfirmPhoneOtp`, `useLogout` (in `useAuth.ts`); `useUserProfile`, `useUpdateProfile` (in `useUser.ts`); `useSubmitOnboarding` (in `useOnboarding.ts`); match + chat hooks. All exported from `hooks/index.ts`.

**`useSubmitOnboarding`** — `PATCH /user/profile` body: all `userProfile` fields except `phoneCode`/`phoneNumber`, photos mapped as `{ url, order }`, plus `...userProfile.matchPreferences` spread in. Takes `{ userProfile: UserProfile }` only — no separate `matchPreferences` param.

**`useConfirmPhoneOtp.onSuccess`**: unwraps tokens via `(response as any)?.data ?? response`, saves tokens, calls `GET /user/profile`, unwraps profile via `(rawProfile as any)?.data ?? rawProfile`, saves user, routes based on `profile.relationshipType`.

**Swipe candidates**: `GET /swipes/candidates` returns `{ data: Candidate[], nextCursor }`. `matchService.getCandidates` maps this to `{ candidates, nextCursor }` for the internal `CandidatesPage` type. `Candidate.photos` is `{ url: string, order: number }[]` — always access `.url` to get the image URI.

React Query config (`axios/queryClient.ts`): 5min staleTime, 10min gcTime, retry 3.

### Components (`src/components/`)

**`modal/BasePopup.tsx`** — reusable full-screen modal wrapper: backdrop `TouchableOpacity` (closes on tap) containing inner `TouchableOpacity activeOpacity={1}` (blocks backdrop tap) with `children` rendered inside. Use for any confirmation/info popup.

**`modal/PopupPhone404.tsx`** — uses `BasePopup`; shown when sign-in returns 404 `PHONE_NOT_REGISTERED`. Two actions: "Huỷ" (close) and "Đăng ký" (navigate to NameScreen).

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
- `runOnJS` deprecation warnings in SwipeScreen and DistanceScreen are pre-existing; leave them as-is.

## Outer Harness (`.harness/`)

This repo uses an Outer Harness for AI-assisted work. **Read `.harness/AGENTS.md` first** at the start of every session.

Key entrypoints:
- `.harness/AGENTS.md` — agent operating instructions (load this first)
- `.harness/knowledge/project.md` — bridges org rules → this CLAUDE.md
- `.harness/init.sh <task-id> "<title>"` — bootstrap a new tracked task
- `.harness/gates/run-gates.sh` — pre-merge lint + typecheck + test
- `.harness/logs/runs.jsonl` — append-only audit trail

Do not edit anything inside `.harness/` (other than appending to `runs.jsonl`, `tasks/INDEX.md`, or creating new task dirs) without recording the change in `.harness/governance/CHANGELOG.md`.
