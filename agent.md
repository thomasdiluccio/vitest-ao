# vitest-ao Agent

## Overview

This document outlines the implementation of the `vitest-ao` agent, a Vitest plugin designed to optimize test output for AI agents by replacing verbose output with compact, structured JSON.

## Goals

- **Agent Detection**: Automatically detect AI agent environments.
- **Compact JSON Output**: Reduce token usage by up to 99.8%.
- **Zero Config**: Install and use without manual setup.
- **Plugin Compatibility**: Capture and clean output from Vitest plugins.
- **Failure Details**: Include file paths, line numbers, and error messages for failures.

## Implementation Plan

### 1. Agent Detection

- Check for environment variables:
  - `process.env.CURSOR_ENV`
  - `process.env.DEVIN_RUN_ID`
  - `process.env.VITEST_AO_MODE`
- If any of these are detected, switch to compact JSON output.

### 2. Reporter API

- Use Vitest’s `Reporter` interface to customize output.
- Override `onTestRunEnd` to emit JSON.

### 3. Failure Handling

- Include file, line, and error message for each failure in the `failures` array.

### 4. Plugin Support

- Capture output from Vitest plugins (e.g., coverage, profiling) and include in the `output` array.

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
└── README.md             # Documentation
```

## Next Steps

1. **Implement the plugin**: Write the reporter and agent detection logic.
2. **Add tests**: Unit tests for reporter and edge cases.
3. **Documentation**: Update README with installation, usage, and examples.
4. **Publish**: Package and publish to npm.

## License

MIT
