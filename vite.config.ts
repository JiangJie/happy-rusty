import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        target: 'esnext',
        minify: false,
        sourcemap: true,
        outDir: 'dist',
        lib: {
            entry: 'src/mod.ts',
            fileName: format => `main.${ format === 'esm' ? 'mjs' : 'cjs' }`,
        },
        rollupOptions: {
            output: [
                {
                    format: 'cjs',
                },
                {
                    format: 'esm',
                },
            ],
            treeshake: 'smallest',
        },
    },
});