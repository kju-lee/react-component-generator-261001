# server/AGENTS.md

## Module Context

Bun HTTP server that proxies prompts to Anthropic or Gemini and returns normalized component code. The frontend reaches it only through the Vite `/api` proxy.

## Tech Stack and Constraints

- Runtime is Bun (`Bun.serve`, `process.env`). Bun loads `.env` automatically; do not add dotenv.
- Provider calls use plain `fetch`. No Anthropic or Google SDK is installed; do not add one without being asked.
- Not covered by any `tsconfig` include, so `bun run build` does not type-check this folder.
- Anthropic model is fixed at `server/index.ts:77`; Gemini models are an ordered fallback list at `server/index.ts:5`.

## Implementation Patterns

- Every response, including errors and 404, carries `CORS_HEADERS` (`server/index.ts:51-55`). Add them to any new route.
- Errors return `{ error: string }`; the client reads `data.error` (`src/hooks/useComponentGenerator.ts:32`). Keep that shape.
- Provider call functions throw `Error` with the status code in the message, e.g. `` `Gemini API error: ${response.status}` ``.
- Fallback across models goes through `withModelFallback` (`server/fallback.ts`), which tries in order and rethrows the last error.

## Testing Strategy

- Tests are Vitest files named `*.test.ts` next to the source (`vite.config.ts:20`). Run with `bun run test -- server/`.
- Only pure modules are tested (`generator.ts`, `fallback.ts`). Do not import `server/index.ts` in tests: it starts a server on port 3002 at import time (`server/index.ts:138`).
- To test new request-handling logic, extract it to a pure function first, then test that function. Mock the attempt callback with `vi.fn` as in `server/fallback.test.ts:6`.

## Local Golden Rules

- Do keep the system prompt rules and the normalizers aligned. If you relax a prompt rule (for example allowing fences), the normalizer must still handle it; if you change `ensureRenderCall`'s detection regex (`server/generator.ts:19`), add a case to `server/generator.test.ts`.
- Do keep `stripCodeFences` language tags in sync with what models emit (`server/generator.ts:7`); an unlisted tag leaves a stray `jsx`-style line in the code.
- Don't change the 503/429 substring checks (`server/index.ts:194,201`) without changing how provider errors are thrown; they are coupled only by message text.
- Don't return or log the resolved API key. `resolveApiKey` (`server/index.ts:64-66`) output must only be passed to provider calls.
- Don't raise Anthropic `max_tokens` (4096, `server/index.ts:78`) or Gemini `maxOutputTokens` (8192, `server/index.ts:107`) silently; Gemini truncation is surfaced as a Korean error at `server/index.ts:123-125`, Anthropic truncation is not detected.
