export class VitestAoReporter {
    testResults = {
        result: 'passed',
        tests: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration_ms: 0,
        failures: [],
        output: [],
    };
    isAgentEnvironment() {
        return (process.env.CURSOR_ENV !== undefined ||
            process.env.DEVIN_RUN_ID !== undefined ||
            process.env.VITEST_AO_MODE !== undefined);
    }
    onTestRunEnd(testModules, unhandledErrors, reason) {
        if (!this.isAgentEnvironment()) {
            return;
        }
        const tests = testModules.reduce((acc, module) => acc + (module.result?.tests || 0), 0);
        const passed = testModules.reduce((acc, module) => acc + (module.result?.passed || 0), 0);
        const failed = testModules.reduce((acc, module) => acc + (module.result?.failed || 0), 0);
        const skipped = testModules.reduce((acc, module) => acc + (module.result?.skipped || 0), 0);
        const duration_ms = testModules.reduce((acc, module) => acc + (module.result?.duration || 0), 0);
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
        console.log(JSON.stringify(this.testResults, null, 2));
    }
    onTestCaseResult(testCase) {
        if (!this.isAgentEnvironment()) {
            return;
        }
        const result = testCase.result();
        if (result?.state === 'failed') {
            this.testResults.failed++;
            this.testResults.failures.push({
                file: testCase.file?.filepath || '',
                line: testCase.line || 0,
                message: result.errors?.[0]?.message || '',
            });
        }
        else if (result?.state === 'passed') {
            this.testResults.passed++;
        }
    }
    onTestCaseReady(testCase) {
        if (!this.isAgentEnvironment()) {
            return;
        }
        this.testResults.tests++;
    }
    onTestCaseAnnotate(testCase, annotation) {
        if (!this.isAgentEnvironment()) {
            return;
        }
        if (annotation.type === 'skip') {
            this.testResults.skipped++;
        }
    }
}
export const vitestAoReporter = new VitestAoReporter();
//# sourceMappingURL=reporter.js.map