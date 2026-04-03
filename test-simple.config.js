import { defineConfig } from 'vitest/config';
import { simpleReporter } from './test-simple-reporter.js';
export default defineConfig({
    test: {
        environment: 'node',
        reporters: ['default', simpleReporter]
    },
});
//# sourceMappingURL=test-simple.config.js.map