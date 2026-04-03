type Vitest = any;
type File = any;
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