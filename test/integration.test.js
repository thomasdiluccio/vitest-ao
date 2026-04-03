import { spy } from 'sinon';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VitestAoReporter } from '../src/reporter.js';
// Mock console.log to capture output
const consoleSpy = spy(console, 'log');
describe('VitestAoReporter Integration Tests', () => {
    let reporter;
    beforeEach(() => {
        // Clean up environment variables before creating reporter
        delete process.env.CURSOR_ENV;
        delete process.env.DEVIN_RUN_ID;
        delete process.env.VITEST_AO_MODE;
        delete process.env.CLAUDE_CODE;
        delete process.env.MISTRAL_VIBE_CLI;
        delete process.env.CODEX_ENV;
        reporter = new VitestAoReporter();
        consoleSpy.resetHistory();
    });
    afterEach(() => {
        // Clean up environment variables
        delete process.env.CURSOR_ENV;
        delete process.env.DEVIN_RUN_ID;
        delete process.env.VITEST_AO_MODE;
        delete process.env.CLAUDE_CODE;
        delete process.env.MISTRAL_VIBE_CLI;
        delete process.env.CODEX_ENV;
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
            // Simulate test run
            reporter.onTaskUpdate([{
                    tasks: [{
                            type: 'test',
                            name: 'test1',
                            result: { state: 'passed' },
                            file: { filepath: 'test.ts' },
                            line: 1
                        }]
                }]);
            reporter.onFinished([], []);
            // Should not have logged anything
            expect(consoleSpy.called).toBe(false);
        });
        it('should track test results even when not in agent mode', () => {
            // Start with fresh results
            expect(reporter['testResults'].tests).toBe(0);
            expect(reporter['testResults'].passed).toBe(0);
            expect(reporter['testResults'].failed).toBe(0);
            // Simulate task update
            reporter.onTaskUpdate([{
                    tasks: [{
                            type: 'test',
                            name: 'test1',
                            result: { state: 'passed' },
                            file: { filepath: 'test.ts' },
                            line: 1
                        }]
                }]);
            expect(reporter['testResults'].tests).toBe(1);
            // The test results are tracked in real-time
            const results = reporter['testResults'];
            expect(results.tests).toBe(1);
            expect(results.passed).toBe(1);
            expect(results.failed).toBe(0);
            // When not in agent mode, onFinished should not output JSON
            reporter.onFinished([], []);
            // Results should still be the same
            const resultsAfterEnd = reporter['testResults'];
            expect(resultsAfterEnd.tests).toBe(1);
            expect(resultsAfterEnd.passed).toBe(1);
            expect(resultsAfterEnd.failed).toBe(0);
        });
    });
    describe('AI Agent Output', () => {
        beforeEach(() => {
            process.env.VITEST_AO_MODE = 'true';
        });
        it('should output compact JSON for passing tests', () => {
            // Simulate task updates
            reporter.onTaskUpdate([{
                    tasks: [{
                            type: 'test',
                            name: 'test1',
                            result: { state: 'passed' },
                            file: { filepath: 'test.ts' },
                            line: 1
                        }]
                }]);
            reporter.onFinished([], []);
            expect(consoleSpy.calledOnce).toBe(true);
            const output = consoleSpy.firstCall.args[0];
            const json = JSON.parse(output);
            expect(json.result).toBe('passed');
            expect(json.tests).toBe(1);
            expect(json.passed).toBe(1);
            expect(json.failed).toBe(0);
            expect(json.failures).toEqual([]);
        });
        it('should output compact JSON for failing tests', () => {
            // Simulate task updates with failure
            reporter.onTaskUpdate([{
                    tasks: [{
                            type: 'test',
                            name: 'test1',
                            result: {
                                state: 'failed',
                                errors: [{ message: 'Test failed' }]
                            },
                            file: { filepath: 'test.ts' },
                            line: 1
                        }]
                }]);
            reporter.onFinished([], []);
            expect(consoleSpy.calledOnce).toBe(true);
            const output = consoleSpy.firstCall.args[0];
            const json = JSON.parse(output);
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
            // Simulate multiple task updates
            reporter.onTaskUpdate([{
                    tasks: [{
                            type: 'test',
                            name: 'test1',
                            result: { state: 'passed' },
                            file: { filepath: 'test.ts' },
                            line: 1
                        }]
                }]);
            reporter.onTaskUpdate([{
                    tasks: [{
                            type: 'test',
                            name: 'test2',
                            result: {
                                state: 'failed',
                                errors: [{ message: 'Test 2 failed' }]
                            },
                            file: { filepath: 'test.ts' },
                            line: 5
                        }]
                }]);
            reporter.onFinished([], []);
            expect(consoleSpy.calledOnce).toBe(true);
            const output = consoleSpy.firstCall.args[0];
            const json = JSON.parse(output);
            expect(json.result).toBe('failed');
            expect(json.tests).toBe(2);
            expect(json.passed).toBe(1);
            expect(json.failed).toBe(1);
            expect(json.failures.length).toBe(1);
        });
        it('should handle skipped tests', () => {
            // Simulate skipped test
            reporter.onTaskUpdate([{
                    tasks: [{
                            type: 'test',
                            name: 'test1',
                            result: { state: 'skipped' },
                            file: { filepath: 'test.ts' },
                            line: 1
                        }]
                }]);
            reporter.onFinished([], []);
            expect(consoleSpy.calledOnce).toBe(true);
            const output = consoleSpy.firstCall.args[0];
            const json = JSON.parse(output);
            expect(json.skipped).toBe(1);
        });
    });
    describe('All Supported AI Agents', () => {
        const agents = [
            { env: 'CURSOR_ENV', value: 'true' },
            { env: 'DEVIN_RUN_ID', value: 'test-run' },
            { env: 'VITEST_AO_MODE', value: 'true' },
            { env: 'CLAUDE_CODE', value: 'true' },
            { env: 'MISTRAL_VIBE_CLI', value: 'true' },
            { env: 'CODEX_ENV', value: 'true' }
        ];
        agents.forEach(({ env, value }) => {
            it(`should output JSON for ${env}`, () => {
                process.env[env] = value;
                reporter.onTaskUpdate([{
                        tasks: [{
                                type: 'test',
                                name: 'test1',
                                result: { state: 'passed' },
                                file: { filepath: 'test.ts' },
                                line: 1
                            }]
                    }]);
                reporter.onFinished([], []);
                expect(consoleSpy.calledOnce).toBe(true);
                const output = consoleSpy.firstCall.args[0];
                // Verify it's valid JSON
                const json = JSON.parse(output);
                expect(json.result).toBe('passed');
            });
        });
    });
});
//# sourceMappingURL=integration.test.js.map