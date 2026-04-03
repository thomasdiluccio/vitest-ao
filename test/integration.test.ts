import { spy } from 'sinon';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { VitestAoReporter } from '../src/reporter.js';

const ENV_VARS = [
  'CURSOR_ENV',
  'DEVIN_RUN_ID',
  'VITEST_AO_MODE',
  'CLAUDE_CODE',
  'MISTRAL_VIBE_CLI',
  'CODEX_ENV',
] as const;

function clearAgentEnvVars() {
  for (const key of ENV_VARS) {
    delete process.env[key];
  }
}

function makeFile(tests: Array<{ state: string; errors?: Array<{ message: string }>; line?: number }>) {
  return {
    result: { duration: 10 },
    tasks: tests.map((t, i) => ({
      type: 'test' as const,
      result: { state: t.state, errors: t.errors },
      file: { filepath: 'test.ts' },
      location: { line: t.line ?? i + 1 },
      tasks: [],
    })),
  };
}

describe('VitestAoReporter Integration Tests', () => {
  let reporter: VitestAoReporter;
  let consoleSpy: ReturnType<typeof spy>;

  beforeEach(() => {
    clearAgentEnvVars();
    reporter = new VitestAoReporter();
    consoleSpy = spy(console, 'log');
  });

  afterEach(() => {
    consoleSpy.restore();
    clearAgentEnvVars();
  });

  describe('Agent Detection', () => {
    it('should detect Cursor environment', () => {
      process.env.CURSOR_ENV = 'true';
      expect(reporter['isAgentEnvironment']()).toBe(true);
    });

    it('should detect Devin environment', () => {
      process.env.DEVIN_RUN_ID = 'test-run';
      expect(reporter['isAgentEnvironment']()).toBe(true);
    });

    it('should detect VITEST_AO_MODE environment', () => {
      process.env.VITEST_AO_MODE = 'true';
      expect(reporter['isAgentEnvironment']()).toBe(true);
    });

    it('should detect Claude Code environment', () => {
      process.env.CLAUDE_CODE = 'true';
      expect(reporter['isAgentEnvironment']()).toBe(true);
    });

    it('should detect Mistral Vibe CLI environment', () => {
      process.env.MISTRAL_VIBE_CLI = 'true';
      expect(reporter['isAgentEnvironment']()).toBe(true);
    });

    it('should detect Codex environment', () => {
      process.env.CODEX_ENV = 'true';
      expect(reporter['isAgentEnvironment']()).toBe(true);
    });

    it('should not detect human environment', () => {
      expect(reporter['isAgentEnvironment']()).toBe(false);
    });
  });

  describe('Human Output (No Agent Detection)', () => {
    it('should not output JSON when no agent environment is detected', () => {
      reporter.onFinished([makeFile([{ state: 'pass' }])]);
      expect(consoleSpy.called).toBe(false);
    });
  });

  describe('AI Agent Output', () => {
    beforeEach(() => {
      process.env.VITEST_AO_MODE = 'true';
    });

    it('should output compact JSON for passing tests', () => {
      reporter.onFinished([makeFile([{ state: 'pass' }])]);

      expect(consoleSpy.calledOnce).toBe(true);
      const json = JSON.parse(consoleSpy.firstCall.args[0] as string);

      expect(json.result).toBe('passed');
      expect(json.tests).toBe(1);
      expect(json.passed).toBe(1);
      expect(json.failed).toBe(0);
      expect(json.failures).toEqual([]);
    });

    it('should output compact JSON for failing tests', () => {
      reporter.onFinished([
        makeFile([{ state: 'fail', errors: [{ message: 'Test failed' }], line: 1 }]),
      ]);

      expect(consoleSpy.calledOnce).toBe(true);
      const json = JSON.parse(consoleSpy.firstCall.args[0] as string);

      expect(json.result).toBe('failed');
      expect(json.tests).toBe(1);
      expect(json.passed).toBe(0);
      expect(json.failed).toBe(1);
      expect(json.failures.length).toBe(1);
      expect(json.failures[0].message).toBe('Test failed');
      expect(json.failures[0].file).toBe('test.ts');
      expect(json.failures[0].line).toBe(1);
    });

    it('should handle multiple tests with mixed results', () => {
      reporter.onFinished([
        makeFile([
          { state: 'pass', line: 1 },
          { state: 'fail', errors: [{ message: 'Test 2 failed' }], line: 5 },
        ]),
      ]);

      expect(consoleSpy.calledOnce).toBe(true);
      const json = JSON.parse(consoleSpy.firstCall.args[0] as string);

      expect(json.result).toBe('failed');
      expect(json.tests).toBe(2);
      expect(json.passed).toBe(1);
      expect(json.failed).toBe(1);
      expect(json.failures.length).toBe(1);
      expect(json.failures[0].message).toBe('Test 2 failed');
    });

    it('should handle skipped tests', () => {
      reporter.onFinished([makeFile([{ state: 'skip' }])]);

      expect(consoleSpy.calledOnce).toBe(true);
      const json = JSON.parse(consoleSpy.firstCall.args[0] as string);

      expect(json.skipped).toBe(1);
      expect(json.result).toBe('passed');
    });

    it('should aggregate tests across multiple files', () => {
      reporter.onFinished([
        makeFile([{ state: 'pass' }]),
        makeFile([{ state: 'pass' }, { state: 'fail', errors: [{ message: 'err' }] }]),
      ]);

      const json = JSON.parse(consoleSpy.firstCall.args[0] as string);
      expect(json.tests).toBe(3);
      expect(json.passed).toBe(2);
      expect(json.failed).toBe(1);
    });

    it('should walk nested suites to find tests', () => {
      reporter.onFinished([
        {
          result: { duration: 5 },
          tasks: [
            {
              type: 'suite',
              tasks: [
                {
                  type: 'test',
                  result: { state: 'pass' },
                  file: { filepath: 'test.ts' },
                  location: { line: 3 },
                  tasks: [],
                },
              ],
            },
          ],
        },
      ]);

      const json = JSON.parse(consoleSpy.firstCall.args[0] as string);
      expect(json.tests).toBe(1);
      expect(json.passed).toBe(1);
    });

    it('should sum duration_ms across files', () => {
      reporter.onFinished([
        { result: { duration: 10 }, tasks: [{ type: 'test', result: { state: 'pass' }, file: { filepath: 'a.ts' }, location: { line: 1 }, tasks: [] }] },
        { result: { duration: 20 }, tasks: [{ type: 'test', result: { state: 'pass' }, file: { filepath: 'b.ts' }, location: { line: 1 }, tasks: [] }] },
      ]);

      const json = JSON.parse(consoleSpy.firstCall.args[0] as string);
      expect(json.duration_ms).toBe(30);
    });
  });

  describe('All Supported AI Agents', () => {
    const agents: Array<{ env: (typeof ENV_VARS)[number]; value: string }> = [
      { env: 'CURSOR_ENV', value: 'true' },
      { env: 'DEVIN_RUN_ID', value: 'test-run' },
      { env: 'VITEST_AO_MODE', value: 'true' },
      { env: 'CLAUDE_CODE', value: 'true' },
      { env: 'MISTRAL_VIBE_CLI', value: 'true' },
      { env: 'CODEX_ENV', value: 'true' },
    ];

    agents.forEach(({ env, value }) => {
      it(`should output JSON for ${env}`, () => {
        process.env[env] = value;

        reporter.onFinished([makeFile([{ state: 'pass' }])]);

        expect(consoleSpy.calledOnce).toBe(true);
        const json = JSON.parse(consoleSpy.firstCall.args[0] as string);
        expect(json.result).toBe('passed');
      });
    });
  });
});
