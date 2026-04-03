# vitest-ao

A Vitest plugin that optimizes test output for AI agents by replacing verbose output with compact, structured JSON.

## Features

- **Agent Detection**: Automatically detects AI agent environments
- **Compact JSON Output**: Reduces token usage by up to 99.8% compared to default Vitest output
- **Zero Config**: Install and use without manual setup
- **Failure Details**: Includes file paths, line numbers, and error messages for failures
- **Plugin Compatibility**: Works alongside other Vitest plugins

## Installation

```bash
npm install --save-dev vitest-ao
```

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

## Example Output

### Before (Default Vitest Output)

```
✓ src/calculator.test.ts (4 tests) 10ms
  ✓ add
  ✓ subtract
  ✓ multiply
  ✓ divide
```

### After (vitest-ao JSON Output)

```json
{
  "result": "passed",
  "tests": 4,
  "passed": 4,
  "failed": 0,
  "skipped": 0,
  "duration_ms": 10,
  "failures": [],
  "output": []
}
```

## Agent Detection

The plugin automatically detects AI agent environments by checking for these environment variables:

- `CURSOR_ENV` (Cursor)
- `DEVIN_RUN_ID` (Devin)
- `VITEST_AO_MODE` (Manual mode)
- `CLAUDE_CODE` (Claude Code)
- `MISTRAL_VIBE_CLI` (Mistral Vibe CLI)
- `CODEX_ENV` (Codex)

You can also force the compact output by setting `VITEST_AO_MODE=true`:

```bash
VITEST_AO_MODE=true npx vitest run
```

## Configuration

No additional configuration is needed. The plugin works out of the box!

## Development

### Linting

The project includes ESLint with TypeScript support:

```bash
# Run linter
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Check linting and build
npm run check
```

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

## License

MIT
