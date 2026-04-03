import { defineConfig } from 'vitest/config';
import { VitestAoReporter } from './src/reporter.js';
export default defineConfig({
    test: {
        reporters: ['default', new VitestAoReporter()],
    },
});
//# sourceMappingURL=vitest.config.js.map