import type { TestResult } from './types.js';

// Define types from Vitest (not exported from vitest package)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Vitest = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type File = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TaskResultPack = any;

export class VitestAoReporter {
  private testResults: TestResult = {
    result: 'passed',
    tests: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration_ms: 0,
    failures: [],
    output: [],
  };

  private isAgentEnvironment(): boolean {
    return (
      process.env.CURSOR_ENV !== undefined ||
      process.env.DEVIN_RUN_ID !== undefined ||
      process.env.VITEST_AO_MODE !== undefined ||
      process.env.CLAUDE_CODE !== undefined ||
      process.env.MISTRAL_VIBE_CLI !== undefined ||
      process.env.CODEX_ENV !== undefined
    );
  }

  onInit(_ctx: Vitest): void {
    // Initialization logic if needed
  }

  onTaskUpdate(packs: TaskResultPack[]): void {
    for (const pack of packs) {
      for (const task of pack.tasks) {
        // Track test results
        if (task.type === 'test') {
          this.testResults.tests++;
          
          if (task.result?.state === 'passed') {
            this.testResults.passed++;
          } else if (task.result?.state === 'failed') {
            this.testResults.failed++;
            this.testResults.failures.push({
              file: task.file?.filepath || '',
              line: task.line || 0,
              message: task.result?.errors?.[0]?.message || '',
            });
          } else if (task.result?.state === 'skipped') {
            this.testResults.skipped++;
          }
        }
      }
    }
  }

  onFinished(files?: File[], _errors?: unknown[]): void {
    // Calculate duration from files
    const duration_ms = files?.reduce((acc, file) => acc + (file.result?.duration || 0), 0) || 0;
    
    // Update final result
    this.testResults = {
      result: this.testResults.failed === 0 ? 'passed' : 'failed',
      tests: this.testResults.tests,
      passed: this.testResults.passed,
      failed: this.testResults.failed,
      skipped: this.testResults.skipped,
      duration_ms,
      failures: this.testResults.failures,
      output: [],
    };

    // Only output JSON when in agent environment
    if (this.isAgentEnvironment()) {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(this.testResults, null, 2));
    }
  }
}

export const vitestAoReporter = new VitestAoReporter();
