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
            // Tier 1 — proven catches and daily-active conventions. The first three rules earned
            // their place with real catches: a cast-then-check in prelude unzip, redundant
            // `Promise.resolve` in async fns, and global parseInt/isNaN. The rest enforce project
            // conventions on every new file (`.ts` extensions, no `!`, no unused vars outside
            // the `_` prefix escape hatch).
            'typescript/no-unnecessary-condition': 'error',
            'unicorn/no-useless-promise-resolve-reject': 'error',
            'unicorn/prefer-number-properties': 'error',
            // Enforce the explicit `.ts` extension convention on relative imports.
            'import/extensions': ['error', 'always', { ignorePackages: true }],
            'typescript/no-non-null-assertion': 'error',
            'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

            // Tier 2 — fuses: zero hits means they are working. Each prevents an accident that
            // is expensive when it slips through: `||` vs `??` semantics in an Option/Result
            // library, unhandled switch arms when a variant is added, import cycles, promise
            // misuse, weakened type safety in the public d.ts, `==` / assign-in-condition typos.
            'typescript/prefer-nullish-coalescing': 'error',
            'typescript/switch-exhaustiveness-check': 'error',
            'typescript/no-misused-promises': 'error',
            'typescript/ban-ts-comment': 'error',
            'typescript/no-explicit-any': 'error',
            'import/no-cycle': 'error',
            'import/no-self-import': 'error',
            eqeqeq: ['error', 'always', { null: 'ignore' }],
            'no-cond-assign': ['error', 'always'],
            radix: 'error',

            // Tier 3 — review automation: the machine enforces style so human review does not
            // have to. The weakest guards here (no-new-wrappers, symbol-description,
            // no-self-compare) target patterns rare in hand-written code but common in AI
            // output; they cost zero friction while unhit.
            'no-self-compare': 'error',
            'no-template-curly-in-string': 'error',
            'default-case-last': 'error',
            'no-new-wrappers': 'error',
            'prefer-template': 'error',
            'object-shorthand': 'error',
            'symbol-description': 'error',
            'logical-assignment-operators': 'error',
            'no-implicit-coercion': 'error',
            'typescript/array-type': 'error',
            'typescript/prefer-includes': 'error',
            'import/no-duplicates': 'error',
            'unicorn/no-instanceof-array': 'error',
            'unicorn/prefer-optional-catch-binding': 'error',
            'unicorn/throw-new-error': 'error',
            'vitest/no-disabled-tests': 'warn',
            'vitest/no-identical-title': 'error',

            // Off — disabled for false-positive cost against this library's design.
            // Deliberate thenables: the fn_once_async example implements a lazy query object
            // (`then(resolve, reject)`) and its test mirrors it.
            'unicorn/no-thenable': 'off',
            // Frozen-literal construction (`Object.freeze({...}) as Option<T>`) and intentional
            // generic stringification in toString are core design patterns of this library.
            'typescript/no-unsafe-type-assertion': 'off',
            'typescript/restrict-template-expressions': 'off',
            // Phantom generics like `None.map<U>` are required for type inference at call sites.
            'typescript/no-unnecessary-type-parameters': 'off',
            // `_`-prefixed names are the escape hatch for intentionally unused vars (see Tier 1).
            'no-underscore-dangle': 'off',
            // Local closures shadowing outer names are idiomatic in this codebase.
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
        ignorePatterns: ['coverage', 'dist', 'docs', 'pnpm-lock.yaml'],
        overrides: [
            {
                files: ['**/*.json', '**/*.jsonc', '**/*.yaml', '**/*.yml'],
                options: {
                    tabWidth: 2,
                },
            },
            {
                files: ['**/*.md'],
                options: {
                    tabWidth: 2,
                    embeddedLanguageFormatting: 'off',
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
