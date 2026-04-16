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

This is an **Expo + React Native** app (Expo SDK 54, RN 0.81, React 19) using **expo-router** for file-based routing. The Expo entry point is `expo-router/entry` (set via `package.json#main`). Despite the repo name `dating`, `app.json` still identifies the project as `Template` — treat it as a starter template that hasn't been rebranded yet.

Experimental Expo flags enabled in `app.json`: `newArchEnabled` (Fabric/TurboModules), `experiments.typedRoutes`, `experiments.reactCompiler`. New Architecture means avoid legacy bridge-only APIs.

### Routing (`app/`)

`app/_layout.tsx` is the root and wires global providers in this order: `QueryClientProvider` → `GestureHandlerRootView` → `ThemeProvider` → `<Stack>`. It also reads the persisted language out of Zustand and calls `configureLocalization` once on mount.

Top-level routes:
- `index.tsx` — splash; checks `AsyncStorage['hasSeenOnboarding']` and redirects to `/OnBoardingScreen` or `/SigninStack/SigninScreen` after a 2s delay
- `OnBoardingScreen.tsx`
- `SigninStack/` — nested stack for `SigninScreen` and `SignupScreen`
- `(tabs)/` — bottom-tab group (`HomeScreen`, `ExploreScreen`) using a custom `CustomTabBar`
- `DetailToDoScreen.tsx` — uses the shared `useCustomHeader()` for its header

### State (`src/zustand/`)

Two stores by design:
- `persist.ts` (`ZustandPersist`, default export) — persisted to AsyncStorage under key `app-storage`. Holds `ThemeApp`, `Localization`, `accessToken`, `refreshToken`, `user`. Use the helpers (`save`, `setTokens`, `setUser`, `logout`) instead of mutating directly. `partialize` controls what's persisted — add new persisted keys there.
- `session.ts` (`ZustandSession`, named export) — ephemeral session state (e.g. debug modal flags) using `devtools` middleware, not persisted.

### API layers (two coexist — pick the new one)

- **`src/api/` (current)** — `apiClient` singleton in `axios/client.ts` with request/response interceptors in `axios/interceptors.ts` (injects `Bearer` from `ZustandPersist.accessToken`, calls `logout()` on 401). React Query lives in `axios/queryClient.ts` (5min staleTime, 10min gcTime, retry 3). Service modules in `services/`, mutation/query hooks in `hooks/`. Endpoints constants in `axios/config.ts` (note `baseUrl.value` is the placeholder `https://api.example.com`).
- **`src/data/api/` (legacy)** — older `ApiGateway` with custom interceptor classes (`AuthenticationInterceptor`, `MetadataInterceptor`, `RetryInterceptor`, etc.) and a different token field (`Token` rather than `accessToken`). Prefer the `src/api/` layer for new work; only touch `src/data/api/` if you're explicitly migrating or the task requires it.

`src/api/axios/axiosClient.ts` is a third, unused stub — don't add to it.

### Theming (`src/theme/`)

`ThemeProvider` exposes an `ITheme` (color, dimensions, fontSize, font, `changeTheme`) via React Context. The active palette is selected from `ZustandPersist.ThemeApp` (`ModeTheme.Dark` default, `ModeTheme.Light` alternate). Consume with `useAppTheme()`. Build `StyleSheet`s inside `useMemo(() => createStyles(theme), [theme])` so they rebuild on theme change — see `app/index.tsx` for the canonical pattern.

### Localization (`src/localization/`)

`i18next` + `react-i18next`, English (`en.ts`) + Vietnamese (`vi.ts`) resources. Use `getString(key, params?, language?)` for non-component code and `useTranslation` in components. The active language is mirrored into `ZustandPersist.Localization`; change it via `changeLanguage(LANGUAGES.X)`.

## Conventions

- **Absolute imports only.** Never use `../` or `../../` across modules. The TS `paths` (also see `.github/prompts.md`) define: `components/*`, `assets/*`, `constants/*`, `utils/*`, `theme/*`, `zustand/*`, `localization/*`, `api/*`. Example: `import { useAppTheme } from 'theme/index'` — not `'../theme'`.
- **Code comments must be in English**, regardless of the conversation language.
- **`console.log` is an ESLint error** (`eslint.config.js`). Allowed: `error`, `warn`, `info`, `debug`, `table`, `trace`.
- Use the `AppText` wrapper (`components/text/AppText`) instead of RN `Text` — it disables `allowFontScaling` and applies a sensible default style.
- `.github/prompts.md` is stale (mentions a Three.js 3D project and `yarn`); ignore those bits. The absolute-imports and English-comments rules in it still apply.

## Notes on the repo state

- No iOS/Android native folders are committed (`/ios`, `/android` are gitignored — managed Expo workflow).
- `expo-env.d.ts` is checked in even though `.gitignore` lists it; leave it alone unless asked.
- Several `.DS_Store` files are tracked. Don't add more.

## Outer Harness (`.harness/`)

This repo uses an Outer Harness for AI-assisted work — process and audit artifacts that wrap the model. **Read `.harness/AGENTS.md` first** at the start of every session; it tells you what context to load, how to log runs, and what boundaries to respect.

Key entrypoints:
- `.harness/AGENTS.md` — agent operating instructions (load this first)
- `.harness/knowledge/project.md` — bridges org rules → this CLAUDE.md
- `.harness/init.sh <task-id> "<title>"` — bootstrap a new tracked task
- `.harness/gates/run-gates.sh` — pre-merge lint + typecheck + test
- `.harness/logs/runs.jsonl` — append-only audit trail (auto-populated by the `Stop` hook wired in `.claude/settings.json`)

Do not edit anything inside `.harness/` (other than appending to `runs.jsonl`, `tasks/INDEX.md`, or creating new task dirs) without recording the change in `.harness/governance/CHANGELOG.md`.
