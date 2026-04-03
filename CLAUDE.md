# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build        # Compile TypeScript to dist/
npm run test         # Run tests with vitest
npm run lint         # Lint src/ and test/
npm run lint:fix     # Auto-fix lint issues
npm run check        # lint + build (runs before every commit via Husky)
```

To run a single test file:
```bash
npx vitest run test/unit.test.ts
```

The pre-commit hook runs `npm run check` (lint + build). Fix both before committing.

## Architecture

`vitest-ao` is a Vitest reporter plugin that outputs compact JSON instead of human-readable test results when an AI agent environment is detected.

**Core flow:**
1. `src/reporter.ts` — `VitestAoReporter` class implements the Vitest `Reporter` interface. It accumulates test counts and failures via `onTaskUpdate`, then in `onFinished` it emits JSON to stdout only when `isAgentEnvironment()` returns true.
2. `src/index.ts` — re-exports `vitestAoReporter` (a singleton instance).
3. `src/types.ts` — defines `TestResult` and `Failure` interfaces that match the JSON output shape.

**Agent detection** (`isAgentEnvironment`): checks for any of these env vars: `CURSOR_ENV`, `DEVIN_RUN_ID`, `VITEST_AO_MODE`, `CLAUDE_CODE`, `MISTRAL_VIBE_CLI`, `CODEX_ENV`.

**Output shape** (only emitted in agent environments):
```json
{ "result": "passed|failed", "tests": N, "passed": N, "failed": N, "skipped": N, "duration_ms": N, "failures": [{"file": "...", "line": N, "message": "..."}], "output": [] }
```

The package is ESM-only (`"type": "module"`), uses `module: nodenext` in tsconfig, and requires `.js` extensions on imports. Build output goes to `dist/`.
