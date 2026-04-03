import { defineConfig } from 'vitest/config';
import { VitestAoReporter } from './dist/src/reporter.js';
const reporter = new VitestAoReporter();
console.log('Reporter created:', reporter);
export default defineConfig({
    test: {
        environment: 'node',
        reporters: ['default', reporter]
    },
});
//# sourceMappingURL=test-minimal.config.js.map