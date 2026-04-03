import type { SerializedError, TestAnnotation } from 'vitest';
type TestCase = any;
type TestModule = any;
type TestRunEndReason = any;
export declare class VitestAoReporter {
    private testResults;
    private isAgentEnvironment;
    onTestRunEnd(testModules: readonly TestModule[], unhandledErrors: readonly SerializedError[], reason: TestRunEndReason): void;
    onTestCaseResult(testCase: TestCase): void;
    onTestCaseReady(testCase: TestCase): void;
    onTestCaseAnnotate(testCase: TestCase, annotation: TestAnnotation): void;
}
export declare const vitestAoReporter: VitestAoReporter;
export {};
//# sourceMappingURL=reporter.d.ts.map