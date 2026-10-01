# AGENTS.md

Prompt-to-React-component generator: a Bun proxy server calls an LLM, and the browser renders the returned code live with react-live.

## Operational Commands

- Package manager and runtime: `bun` only. Do not use npm, yarn, or pnpm (`bun.lock` is the only lockfile; `package.json` scripts call `bun run`).
- `bun install` — install dependencies.
- `bun run dev` — API server (port 3002) + Vite dev server together via concurrently.
- `bun run server` — API server alone, with `--watch`.
- `bun run test` — Vitest, single run. Do NOT use `bun test`: that invokes Bun's built-in runner, which ignores `vite.config.ts` (jsdom environment, `src/test/setup.ts`, include globs).
- `bun run test:watch` — Vitest watch mode.
- `bun run lint` — ESLint.
- `bun run build` — `tsc -b` then `vite build`. Note: this does not type-check `server/` (see Golden Rules).
- Single test file: `bun run test -- server/generator.test.ts`.

## Golden Rules

### Immutable

- API keys never reach the client bundle or any client-visible response. `/api/config` returns only booleans for env keys (`server/index.ts:148-153`). Keep it that way.
- Never commit `.env`. It is ignored in `.gitignore` and copied into worktrees through `.worktreeinclude`.
- Never log request URLs for Gemini calls: the key is in the query string (`server/index.ts:99`).

### Do

- Keep port 3002 in sync in both places: `server/index.ts:139` and the Vite proxy target `vite.config.ts:11`.
- Keep the generated-code contract consistent end to end. The system prompt forbids imports, TypeScript syntax, and markdown fences, and requires a `render(...)` call (`server/index.ts:7-21`); react-live runs with `noInline` (`src/components/LivePreview.tsx:10`), which only draws when `render(...)` is called.
- Keep both defenses for that contract (Double Defense). Prompt rules in `server/index.ts:12,16` are backed by `stripCodeFences` and `ensureRenderCall` in `server/generator.ts:5,16`, applied at `server/index.ts:188`. Removing either side reintroduces blank previews when the model ignores instructions.
- Keep the API-key check on both sides (Double Defense): client guard `src/App.tsx:35` and server guard `server/index.ts:169`. Client-entered keys override env keys (`server/index.ts:65`).
- Put new pure logic in side-effect-free modules under `server/` and test it there. `server/index.ts` calls `Bun.serve` at import time and is untested; `generator.ts` and `fallback.ts` exist precisely so logic can be unit tested (`server/generator.ts:1-2`) (Test Boundary).

### Don't

- Don't drop the HTTP status code from provider error messages. The handler maps errors to 503/429 by searching the message text (`server/index.ts:194,201`); the messages are built at `server/index.ts:85,112`.
- Don't assume `tsc -b` covers server code. `tsconfig.app.json` includes only `src`, `tsconfig.node.json` only `vite.config.ts`. After editing `server/`, rely on `bun run test` and `bun run lint`.
- Don't add a provider path without matching the Gemini safeguards (Asymmetry): Gemini has model fallback (`server/index.ts:134-136`) and a `MAX_TOKENS` truncation check (`server/index.ts:123`); Anthropic has neither. Decide explicitly whether a new provider needs them.

## Project Context

- Tech stack: React 19, TypeScript 5.9, Vite 8, react-live 4, Bun (server), Vitest 4 + Testing Library + jsdom, ESLint 9.
- Providers: Anthropic Messages API and Google Gemini, called with raw `fetch` (no SDK).
- User-facing strings (UI text, error messages, test names, code comments) are in Korean.

## Standards and References

- Setup and feature overview: `README.md`. Do not duplicate it here.
- Commit format: `<type>: <Korean summary>` with type in `feat | fix | refactor | chore`. Details in `.claude/skills/commit/SKILL.md`. Do not push unless asked.
- Agent skills live in `.claude/skills/` (Claude Code) and `.agents/skills/` (Codex), pinned by `skills-lock.json`.
- Maintenance Policy: if these rules diverge from the code (line numbers drift, a rule no longer holds, a new provider or module appears), propose an update to the relevant `AGENTS.md` in the same change.

## Context Map

- **[API server and AI provider calls (Bun)](./server/AGENTS.md)** — when editing provider calls, the system prompt, response normalization, or server tests.
- **[Frontend UI and live preview (React)](./src/AGENTS.md)** — when editing components, the generator hook, react-live preview, or UI tests.
