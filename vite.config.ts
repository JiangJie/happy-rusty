import { defineConfig } from 'vite-plus';

export default defineConfig({
    test: {
        include: ['**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            include: ['src/**/*.ts'],
        },
    },
    lint: {
        plugins: ['typescript', 'oxc', 'eslint'],
        ignorePatterns: ['dist', 'coverage'],
        options: {
            typeAware: true,
            typeCheck: true,
        },
        categories: {
            correctness: 'error',
            suspicious: 'warn',
        },
        rules: {
            eqeqeq: ['error', 'always', { null: 'ignore' }],
            'no-cond-assign': ['error', 'always'],
            'no-self-compare': 'error',
            'no-template-curly-in-string': 'error',
            'default-case-last': 'error',
            'no-new-wrappers': 'error',
            radix: 'error',
            'prefer-template': 'error',
            'object-shorthand': 'error',
            'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            'typescript/no-non-null-assertion': 'error',
            'typescript/no-explicit-any': 'error',
            // Type-aware rules disabled: frozen-literal construction (`Object.freeze({...}) as Option<T>`)
            // and intentional generic stringification in toString are core design patterns of this library.
            'typescript/no-unsafe-type-assertion': 'off',
            'typescript/restrict-template-expressions': 'off',
            // Phantom generics like `None.map<U>` are required for type inference at call sites.
            'typescript/no-unnecessary-type-parameters': 'off',
            'no-underscore-dangle': 'off',
            'no-shadow': 'off',
        },
        overrides: [
            {
                files: ['**/*.test.ts'],
                rules: {
                    'no-empty-function': ['error', { allow: ['arrowFunctions', 'functions'] }],
                    // Deliberate patterns in tests: unawaited promises in race tests, unbound method references.
                    'typescript/no-floating-promises': 'off',
                    'typescript/unbound-method': 'off',
                },
            },
        ],
    },
    fmt: {
        printWidth: 100,
        tabWidth: 4,
        singleQuote: true,
        arrowParens: 'avoid',
        semi: true,
        trailingComma: 'all',
        sortPackageJson: false,
        ignorePatterns: [
            'dist',
            'coverage',
            'pnpm-lock.yaml',
            '**/*.md',
            '**/*.yml',
            '**/*.yaml',
            '.github/**',
            '.vscode/**',
        ],
        overrides: [
            {
                files: ['*.json', '*.jsonc'],
                options: {
                    tabWidth: 2,
                },
            },
        ],
    },
    pack: {
        entry: ['src/mod.ts'],
        format: ['esm', 'cjs'],
        dts: true,
        sourcemap: true,
        fixedExtension: true,
        treeshake: {
            moduleSideEffects: false,
            propertyReadSideEffects: false,
        },
        outputOptions: {
            topLevelVar: false,
        },
    },
});
