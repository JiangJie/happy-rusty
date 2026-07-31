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
        plugins: ['typescript', 'oxc', 'eslint', 'import', 'unicorn', 'vitest'],
        ignorePatterns: ['coverage', 'dist', 'docs'],
        options: {
            typeAware: true,
            typeCheck: true,
            maxWarnings: 0,
            reportUnusedDisableDirectives: 'warn',
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
            'symbol-description': 'error',
            'logical-assignment-operators': 'error',
            'no-implicit-coercion': 'error',
            'typescript/no-non-null-assertion': 'error',
            'typescript/no-explicit-any': 'error',
            'typescript/array-type': 'error',
            'typescript/ban-ts-comment': 'error',
            'typescript/no-misused-promises': 'error',
            'typescript/prefer-nullish-coalescing': 'error',
            'typescript/prefer-includes': 'error',
            'typescript/switch-exhaustiveness-check': 'error',
            'typescript/no-unnecessary-condition': 'error',
            // Enforce the explicit `.ts` extension convention on relative imports.
            'import/extensions': ['error', 'always', { ignorePackages: true }],
            'import/no-duplicates': 'error',
            'import/no-self-import': 'error',
            'import/no-cycle': 'error',
            'unicorn/no-instanceof-array': 'error',
            'unicorn/prefer-number-properties': 'error',
            'unicorn/no-useless-promise-resolve-reject': 'error',
            'unicorn/prefer-optional-catch-binding': 'error',
            'unicorn/throw-new-error': 'error',
            // Deliberate thenables: the fn_once_async example implements a lazy query object
            // (`then(resolve, reject)`) and its test mirrors it.
            'unicorn/no-thenable': 'off',
            'vitest/no-focused-tests': 'error',
            'vitest/no-disabled-tests': 'warn',
            'vitest/no-identical-title': 'error',
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
                    // Inferred mock type parameters and message-less toThrow are fine in tests.
                    'vitest/require-mock-type-parameters': 'off',
                    'vitest/require-to-throw-message': 'off',
                    // Per-`it` local closures are idiomatic in tests; hoisting hurts locality.
                    'unicorn/consistent-function-scoping': 'off',
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
            '**/*.md',
            '**/*.yaml',
            '**/*.yml',
            '.github/**',
            '.vscode/**',
            'coverage',
            'dist',
            'docs',
            'pnpm-lock.yaml',
        ],
        overrides: [
            {
                files: ['**/*.json', '**/*.jsonc'],
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
