import type { Failure, TestResult } from './types.js';

interface TaskLike {
  type?: string;
  result?: {
    state?: string;
    duration?: number;
    errors?: Array<{ message?: string }>;
  };
  tasks?: TaskLike[];
  file?: { filepath?: string };
  location?: { line?: number };
}

interface FileLike {
  result?: { duration?: number };
  tasks?: TaskLike[];
}

export class VitestAoReporter {
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

  private collectTests(
    tasks: TaskLike[],
    counts: { tests: number; passed: number; failed: number; skipped: number; failures: Failure[] },
  ): void {
    for (const task of tasks) {
      if (task.type === 'test' || task.type === 'custom') {
        counts.tests++;
        const state = task.result?.state;
        if (state === 'pass') {
          counts.passed++;
        } else if (state === 'fail') {
          counts.failed++;
          counts.failures.push({
            file: task.file?.filepath ?? '',
            line: task.location?.line ?? 0,
            message: task.result?.errors?.[0]?.message ?? '',
          });
        } else {
          counts.skipped++;
        }
      }
      if (task.tasks && task.tasks.length > 0) {
        this.collectTests(task.tasks, counts);
      }
    }
  }

  onFinished(files?: FileLike[], _errors?: unknown[]): void {
    const counts = {
      tests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      failures: [] as Failure[],
    };

    for (const file of files ?? []) {
      this.collectTests(file.tasks ?? [], counts);
    }

    const duration_ms =
      files?.reduce((acc, file) => acc + (file.result?.duration ?? 0), 0) ?? 0;

    const result: TestResult = {
      result: counts.failed > 0 ? 'failed' : 'passed',
      tests: counts.tests,
      passed: counts.passed,
      failed: counts.failed,
      skipped: counts.skipped,
      duration_ms,
      failures: counts.failures,
      output: [],
    };

    if (this.isAgentEnvironment()) {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(result, null, 2));
    }
  }
}

export const vitestAoReporter = new VitestAoReporter();
