import { defineConfig } from 'vitest/config';
import { VitestAoReporter } from './dist/src/reporter.js';
export default defineConfig({
    test: {
        reporters: ['default', new VitestAoReporter()],
    },
});
//# sourceMappingURL=vitest.config.js.map