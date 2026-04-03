export interface TestResult {
  result: 'passed' | 'failed' | 'skipped';
  tests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration_ms: number;
  failures: Failure[];
  output: string[];
}

export interface Failure {
  file: string;
  line: number;
  message: string;
}
