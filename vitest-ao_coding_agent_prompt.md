
# Project: vitest-ao

## Overview

`vitest-ao` is a **Vitest plugin** designed to optimize test output for AI agents (e.g., Cursor, Devin, GitHub Copilot CLI). It replaces verbose, human-readable test output with **compact, structured JSON**, reducing token usage by up to 99.8% compared to default Vitest output.

Inspired by [PAO](https://github.com/nunomaduro/pao) for PHP, `vitest-ao` works with any JavaScript/TypeScript project using Vitest.

---

## Features

- **Agent Detection**: Automatically detects AI agent environments.
- **Compact JSON Output**: Always ~20 tokens, regardless of test suite size.
- **Zero Config**: Install and use without manual setup.
- **Plugin Compatibility**: Captures and cleans output from Vitest plugins (e.g., coverage, profiling).
- **Failure Details**: Includes file paths, line numbers, and error messages for failures.
- **Customizable**: Allow users to define custom JSON output format.

---

## Installation

```bash
npm install --save-dev vitest-ao
```

---

## Usage

### 1. Configure Vitest

Add `vitest-ao` to your `vitest.config.ts`:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { vitestAoReporter } from 'vitest-ao';

export default defineConfig({
  test: {
    reporters: ['default', vitestAoReporter],
  },
});
```

### 2. Run Tests

```bash
npx vitest run
```

---

## Example Output

### Before

```
 ✓ src/calculator.test.ts  (4 tests)  10ms
   ✓ add
   ✓ subtract
   ✓ multiply
   ✓ divide
```

### After

```json
{
  "result": "passed",
  "tests": 4,
  "passed": 4,
  "failed": 0,
  "skipped": 0,
  "duration_ms": 10,
  "failures": [],
  "output": [
    "Coverage: 95%",
    "Profile: 100ms"
  ]
}
```

---

## Implementation Details

### Agent Detection

- Check for environment variables like `process.env.CURSOR_ENV`, `process.env.DEVIN_RUN_ID`, or `process.env.VITEST_AO_MODE`.
- If detected, switch to compact JSON output.

### Reporter API

- Use Vitest’s `Reporter` interface to customize output.
- Override `onTestRunEnd` to emit JSON.

### Failure Handling

- Include file, line, and error message for each failure in the `failures` array.

### Plugin Support

- Capture output from Vitest plugins (e.g., coverage, profiling) and include in the `output` array.

---

## Project Structure

```
vitest-ao/
├── src/
│   ├── index.ts          # Main plugin entry
│   ├── reporter.ts       # Reporter logic
│   └── types.ts          # TypeScript types
├── test/
│   ├── __fixtures__/     # Test fixtures
│   └── unit.test.ts      # Unit tests
├── vitest.config.ts      # Example config
├── package.json          # Project metadata
└── README.md             # This file
```

---

## Next Steps

1. **Implement the plugin**: Write the reporter and agent detection logic.
2. **Add tests**: Unit tests for reporter and edge cases.
3. **Documentation**: Update README with installation, usage, and examples.
4. **Publish**: Package and publish to npm.

---

## License

MIT
