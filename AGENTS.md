# AGENTS.md

Guidance for coding agents operating in `study-mentor-ai`.
This reflects the repository as currently configured.

## 1) Project Snapshot
- Stack: React 19 + TypeScript + Vite 7 + Tailwind CSS 4.
- Integrations: Supabase (`@supabase/supabase-js`), React Query.
- Routing: `react-router-dom`; markdown: `react-markdown`.
- Languages in product copy: Portuguese (`pt`) and English (`en`).
- TypeScript is strict (`strict`, `noUnusedLocals`, `noUnusedParameters`).

## 2) Important Paths
- App entry: `src/main.tsx`, `src/App.tsx`.
- Feature pages: `src/features/**/page/*.tsx`.
- Reusable UI: `src/components/**`.
- Core hooks: `src/hooks/useChatApp.ts`, `src/hooks/useCloudSync.ts`.
- Contexts: `src/context/AppContext.tsx`, `src/context/AuthContext.tsx`.
- Domain types: `src/types/chat.ts`.
- Utilities: `src/utils/*.ts`, `src/utils/*.tsx`.
- Supabase config/migrations: `supabase/config.toml`, `supabase/migrations/*.sql`.

## 3) Build / Run / Perf Commands
- Install deps: `npm install`.
- Dev server: `npm run dev`.
- Production build + typecheck: `npm run build`.
- Preview build: `npm run preview`.
- Lighthouse workflow: `npm run perf`.
- Perf subcommands: `npm run perf:build`, `npm run perf:check`.

## 4) Lint / Format / Typecheck Reality
- No `lint` script exists in `package.json`.
- No ESLint config detected.
- No Prettier config detected.
- Canonical validation command is `npm run build` (`tsc -b && vite build`).
- Do not assume `npm run lint` is available.

## 5) Test Commands (especially single-test)
- No `test` script exists right now.
- No `*.test.*` or `*.spec.*` files are present.
- No test runner config (Vitest/Jest) is present.
- Result: there is no native single-test command in the current repo.

If tests are added (recommended with Vite: Vitest), use:
- All tests: `npx vitest run`.
- Single file: `npx vitest run src/path/to/file.test.ts`.
- Single test name: `npx vitest run src/path/to/file.test.ts -t "test name"`.
- Watch one file: `npx vitest src/path/to/file.test.ts`.

For this repo today, default verification is:
- `npm run build` for most code changes.
- `npm run perf` only for perf/accessibility-impacting changes.

## 6) Supabase Commands (when backend schema changes)
- Start local stack: `supabase start`.
- Stop local stack: `supabase stop`.
- Reset/apply migrations locally: `supabase db reset`.
- Push migrations to linked remote: `supabase db push`.
- Create migration: `supabase migration new <name>`.
- Add new migration files; do not rewrite historical migrations.

## 7) Import and Module Style
- Use ES modules and TypeScript.
- Prefer `import type { ... }` for type-only imports.
- Keep third-party imports above local imports.
- Keep one blank line between external and local groups.
- Use relative imports; path aliases are not configured.
- Avoid circular deps across `context`, `hooks`, and `utils`.

Observed import order pattern:
1. React / external packages.
2. Blank line.
3. Local modules (`../`, `./`).

## 8) Formatting Conventions
- String quotes: single quotes.
- Semicolons: omitted.
- Indentation: 2 spaces.
- Keep long JSX props split across lines.
- Prefer descriptive constants over dense inline expressions.
- Keep file edits ASCII unless non-ASCII is required.

## 9) Types and Data Contracts
- Keep strict typing; do not relax TS compiler settings.
- Model domain states with explicit unions (see `src/types/chat.ts`).
- Reuse shared interfaces/types from `src/types/chat.ts`.
- Validate/narrow external data (API responses, localStorage, env).
- Prefer safe fallbacks instead of propagating `undefined`.
- Avoid `any`; if unavoidable, isolate the boundary.

## 10) Naming Conventions
- Components/pages/providers: PascalCase (`ChatPage`, `AuthProvider`).
- Hooks: `use` + camelCase (`useChatApp`).
- Utilities: camelCase, verb-first (`parseAssistantReply`, `getLocale`).
- Types/interfaces: PascalCase (`Conversation`, `Message`).
- Local constants: camelCase with unit suffixes (`debounceMs`, `nowMs`).
- Env vars: `VITE_*`, read from `import.meta.env`.

## 11) Error Handling Expectations
- Throw only for truly unrecoverable setup issues.
- Guard optional services early (missing Supabase or API key).
- Keep user-facing errors language-aware (`pt`/`en`).
- Parse LLM/API JSON defensively before use.
- Keep retry/backoff logic explicit and testable.
- Do not silently swallow errors unless intentionally best-effort.

## 12) React State Patterns
- Keep business logic in hooks, presentation in components/pages.
- Use context providers for cross-feature shared state/actions.
- Memoize provider values when appropriate.
- Prefer derived/computed values over duplicate state.
- Use refs for mutable non-render data (timers/in-flight guards).
- Always clean up intervals/subscriptions in effects.

## 13) UI / Styling Guidance
- Tailwind utilities are the primary styling approach.
- Preserve CSS variable driven theming and gradient layers.
- Keep dark/light theme behavior consistent with existing toggles.
- Preserve responsive behavior for sidebar/drawer/chat layouts.

## 14) Security and Secrets
- Never commit real values from `.env`.
- Treat `VITE_GOOGLE_AI_API_KEY` and Supabase keys as sensitive.
- Preserve authenticated-user boundaries in cloud sync behavior.
- Keep RLS-aware SQL patterns in Supabase migrations.

## 15) Cursor and Copilot Rules
Repository scan found:
- No `.cursorrules` file.
- No `.cursor/rules/` directory.
- No `.github/copilot-instructions.md` file.

If any of these appear later, update this file and follow them as repo-local agent rules.

## 16) Agent Completion Checklist
- Run `npm run build` and resolve all errors.
- For UI changes, manually verify `/`, `/auth`, `/chat`, `/profile`.
- For perf-sensitive UI work, run `npm run perf`.
- For DB changes, add a migration and validate with `supabase db reset`.
- Keep diffs focused; avoid incidental refactors.
