import { defineConfig } from 'vitest/config';

export default defineConfig({
    build: {
        target: 'esnext',
        minify: false,
        sourcemap: true,
        outDir: 'dist',
        lib: {
            entry: 'src/mod.ts',
            fileName: format => `main.${format === 'esm' ? 'mjs' : 'cjs'}`,
        },
        rollupOptions: {
            output: [
                {
                    format: 'cjs',
                    topLevelVar: false,
                },
                {
                    format: 'esm',
                    topLevelVar: false,
                },
            ],
            treeshake: {
                moduleSideEffects: false,
                propertyReadSideEffects: false,
            },
        },
    },
    test: {
        include: ['**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            include: ['src/**/*.ts'],
        },
    },
});