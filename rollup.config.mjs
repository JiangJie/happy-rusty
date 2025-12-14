import { dts } from 'rollup-plugin-dts';

/**
 * @type {import('rollup').RollupOptions[]}
 */
export default [
    {
        input: 'src/mod.ts',
        plugins: [
            dts(),
        ],
        output: {
            file: 'dist/types.d.ts',
            format: 'esm',
            sourcemap: false,
        },
        treeshake: 'smallest',
    },
];