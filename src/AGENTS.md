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
- The API key exists only in React state (`src/App.tsx:15`) and is sent only when non-empty (`src/hooks/useComponentGenerator.ts:26`).
- Preview remount is done by bumping a `key` (`src/components/ComponentCard.tsx:18,56`), not by re-fetching.

## Testing Strategy

- Vitest + Testing Library + jsdom; `src/test/setup.ts` adds jest-dom matchers and `cleanup` after each test.
- Test files sit next to components as `*.test.tsx`. Run with `bun run test -- src/`.
- Query by role and accessible name (Korean labels), as in `src/components/PromptInput.test.tsx:9`. Use `userEvent.setup()` for interactions.
- Only `PromptInput` is tested. `LivePreview` (react-live evaluation) and `useComponentGenerator` (fetch) have no tests; mock `fetch` with `vi.fn` if adding hook tests.

## Local Golden Rules

- Do keep `noInline` on `LiveProvider` (`src/components/LivePreview.tsx:10`). Server output always ends with `render(...)` (`server/generator.ts:16-24`); inline mode would break every preview.
- Do keep accessible names stable when changing UI text; tests select buttons by exact Korean name (`src/components/PromptInput.test.tsx:9,27`).
- Don't persist the API key (localStorage, URL, cookies). It is intentionally reset on provider change (`src/App.tsx:42-45`).
- Don't remove the client-side key guard (`src/App.tsx:35`); it pairs with the server check and depends on `/api/config` booleans (`src/App.tsx:25-30`).
- Don't pass `scope` with extra globals to `LiveProvider` without also updating the server system prompt; generated code assumes only `React` and `render` are in scope (`server/index.ts:11`).
