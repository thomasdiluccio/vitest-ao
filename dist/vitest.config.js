import { defineConfig } from 'vitest/config';
import { vitestAoReporter } from './src/index.js';
export default defineConfig({
    test: {
        reporters: ['default', vitestAoReporter],
    },
});
//# sourceMappingURL=vitest.config.js.map