// Define types from Vitest (not exported from vitest package)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Vitest = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type File = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TaskResultPack = any;
export declare class VitestAoReporter {
    private testResults;
    private isAgentEnvironment;
    onInit(ctx: Vitest): void;
    onTaskUpdate(packs: TaskResultPack[]): void;
    onFinished(files?: File[], errors?: unknown[]): void;
}
export declare const vitestAoReporter: VitestAoReporter;
export {};
//# sourceMappingURL=reporter.d.ts.map