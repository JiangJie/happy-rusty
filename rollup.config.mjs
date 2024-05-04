import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';

const input = 'src/mod.ts';

/**
 * @type {import('rollup').RollupOptions[]}
 */
export default [
    {
        input,
        plugins: [
            esbuild(),
        ],
        output: [
            {
                file: 'dist/main.cjs',
                format: 'cjs',
                sourcemap: true,
            },
            {
                file: 'dist/main.mjs',
                format: 'esm',
                sourcemap: true,
            },
        ],
    },
    {
        input,
        plugins: [
            dts(),
        ],
        output: {
            file: 'dist/types.d.ts',
            format: 'esm',
            sourcemap: true,
        },
    },
];