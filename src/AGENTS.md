# src/AGENTS.md

## Module Context

React 19 single-page UI with a retro desktop theme. It collects a prompt and provider, calls `/api/generate` through `useComponentGenerator`, and renders results with react-live.

## Tech Stack and Constraints

- Styling is plain CSS in `App.css` and `index.css` with class names; no CSS modules, Tailwind, or UI library.
- All API calls use relative paths (`/api/...`) so the Vite proxy (`vite.config.ts:9-14`) routes them. Never hardcode `http://localhost:3002`.
- Window chrome is shared via `RetroWindow`; new panels should use it with the `as` prop for the semantic element (`src/App.tsx:68,72,137`).
- `tsconfig.app.json` enables `verbatimModuleSyntax` and `erasableSyntaxOnly`: use `import type` for types and avoid `enum`/parameter properties.

## Implementation Patterns

- Shared types live in `src/types/index.ts`. `Provider` there must match the server's `Provider` union (`server/index.ts:57`).
- State that crosses components lives in hooks under `src/hooks/`; components receive callbacks as props.
- API keys are kept per provider in localStorage (`src/App.tsx:19-24`) by user decision, and sent only when non-empty (`src/hooks/useComponentGenerator.ts:32`).
- Persisted state goes through `usePersistentState` with a `parse*` validator from `src/utils/persistedState.ts`; register new keys in `STORAGE_KEYS` (`src/utils/persistedState.ts:4`). Never read `localStorage` directly in components.
- Preview remount is done by bumping a `key` (`src/components/ComponentCard.tsx:18,56`), not by re-fetching.

## Testing Strategy

- Vitest + Testing Library + jsdom; `src/test/setup.ts` adds jest-dom matchers and `cleanup` after each test.
- Test files sit next to components as `*.test.tsx`. Run with `bun run test -- src/`.
- Query by role and accessible name (Korean labels), as in `src/components/PromptInput.test.tsx:9`. Use `userEvent.setup()` for interactions.
- `LivePreview` (react-live evaluation) and the fetch path of `useComponentGenerator` are untested. App-level tests stub `fetch` with `vi.stubGlobal` and route by URL (`src/App.test.tsx:6-13`); clear `localStorage` in `beforeEach`.

## Local Golden Rules

- Do keep `noInline` on `LiveProvider` (`src/components/LivePreview.tsx:10`). Server output always ends with `render(...)` (`server/generator.ts:16-24`); inline mode would break every preview.
- Do keep accessible names stable when changing UI text; tests select buttons by exact Korean name (`src/components/PromptInput.test.tsx:9,27`).
- Don't expand API key exposure beyond localStorage (no URL, cookies, or logs). Generated code runs in the same origin via react-live and can read localStorage, so treat stored keys as readable by previews.
- Don't trust stored data shape: every `parse*` returns null or drops bad items so stale or edited localStorage cannot crash rendering (`src/utils/persistedState.ts`).
- Don't remove the client-side key guard (`src/App.tsx:48`); it pairs with the server check and depends on `/api/config` booleans (`src/App.tsx:38-43`).
- Don't pass `scope` with extra globals to `LiveProvider` without also updating the server system prompt; generated code assumes only `React` and `render` are in scope (`server/index.ts:11`).
