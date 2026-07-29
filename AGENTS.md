# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Project Overview

`happy-rusty` is a TypeScript library that brings Rust's error handling and synchronization patterns to JavaScript/TypeScript:

- **Option\<T\>** - Represents optional values (`Some(T)` or `None`) for null-safe programming
- **Result\<T, E\>** - Represents success (`Ok(T)`) or failure (`Err(E)`) for explicit error handling
- **Sync Primitives** - `Once<T>`, `OnceAsync<T>`, `Lazy<T>`, `LazyAsync<T>`, `Mutex<T>`, `RwLock<T>`, `Semaphore`, `Channel<T>` for initialization and concurrency control
- **ControlFlow\<B, C\>** - `Break(value)` and `Continue(value)` for short-circuiting operations
- **FnOnce** - One-time callable function wrappers (`FnOnce` and `FnOnceAsync`)

Key characteristics:
- Zero dependencies
- Runtime immutability via `Object.freeze()`
- Full async support with `*Async` method variants
- Cross-runtime: Node.js (CJS/ESM), Deno, Bun, browsers

## Development Commands

### Testing
```bash
# Run all tests with coverage
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests with UI
pnpm run test:ui
```

### Building
```bash
# Full build (gated by vp check, then vp pack: JS + d.ts in one pass)
pnpm run build

# Format + lint + type-aware type check in one command (tsgo-powered)
pnpm exec vp check

# Type checking only (local tsc, editor-consistent reference)
pnpm run check

# Linting / formatting
pnpm run lint
pnpm run fmt
```

`pnpm run build` is gated by a `prebuild` hook (`pnpm exec vp check`), so it always runs format check, lint, and type check first — a "build" failure is often actually a format/lint/type error.

All tooling config lives in a single `vite.config.ts` (imported from `vite-plus`): `test` (Vitest), `lint` (oxlint + tsgolint), `fmt` (oxfmt), and `pack` (tsdown) blocks. Coverage is scoped to `src/**/*.ts`.

### Build Architecture

The project uses **Vite+** (VoidZero's unified toolchain) as a single devDependency that bundles Vite, Vitest, oxlint, tsgolint, oxfmt, and tsdown:

1. **`vp pack`** (tsdown, powered by Rolldown) - Compiles TypeScript to JavaScript (`dist/mod.mjs` + `dist/mod.cjs`) AND bundles type declarations (`dist/mod.d.mts` + `dist/mod.d.cts`) in one pass
2. **`vp check`** - Format check (oxfmt) + lint (oxlint) + type-aware linting and type checking (tsgolint, powered by tsgo — the TypeScript 7 Go compiler)

**Declaration bundling notes:**

- `.d.ts` bundling goes through `rolldown-plugin-dts` (the Rolldown port of `rollup-plugin-dts`, same author). It preserves source order and correctly handles interface inheritance like `None extends Option<never>` without renaming artifacts.
- **Never use api-extractor-based tools** (`@microsoft/api-extractor`, `vite-plugin-dts`): they sort exports alphabetically, which renames `Option` to `Option_2` when `None extends Option<never>` is processed first. See [rushstack#3017](https://github.com/microsoft/rushstack/issues/3017).
- Dual `mod.d.mts`/`mod.d.cts` declaration files are emitted (one per module format) — the `exports` map in `package.json` points `import`/`require` at their respective files.
- Treeshake is configured via object form `{ moduleSideEffects: false, propertyReadSideEffects: false }` (Rolldown does not accept string presets like `'smallest'`); `topLevelVar: false` is set in `outputOptions` to preserve top-level `const` (Rolldown defaults to `var`).

### Documentation
```bash
# Generate TypeDoc HTML documentation (deployed to GitHub Pages)
# TypeDoc cleans the `docs/` output dir automatically; no separate cleanup step.
pnpm run docs
```

Online API documentation: https://jiangjie.github.io/happy-rusty/

The repo ships a bilingual README: `README.md` (English) and `README.cn.md` (Chinese). When editing one, keep the other in sync.

### Running Examples
```bash
# Runs examples/main.ts via Deno (requires Deno installed; not part of the npm test pipeline)
pnpm run eg
```

### Publish Hook
`prepublishOnly` runs the full `build` automatically before `npm publish`, so local publishes also produce a fresh `dist/`. CI handles publishing on tags — see Releasing below.

## Architecture

### Core Structure

The codebase is organized into two main modules mirroring Rust's structure:

- **`src/core/`** - Core types (Option and Result)
  - **`src/core/option/`** - Option type implementation
    - `option.ts` - Defines the `Option<T>` interface with all its methods
    - `extensions.ts` - Bridge utilities `tryOption()`, `tryAsyncOption()` for converting try-catch patterns to Option
    - `guards.ts` - Type guard utility `isOption()`
    - `symbols.ts` - Internal symbol `OptionKindSymbol` for type discrimination
    - `mod.ts` - Re-exports all Option public APIs
  - **`src/core/result/`** - Result type implementation
    - `result.ts` - Defines the `Result<T, E>` interface with all its methods
    - `extensions.ts` - Bridge utilities `tryResult()`, `tryAsyncResult()` for converting try-catch patterns to Result
    - `guards.ts` - Type guard utility `isResult()`
    - `symbols.ts` - Internal symbol `ResultKindSymbol` for type discrimination
    - `aliases.ts` - Type aliases like `VoidResult<E>`, `IOResult<T>`, `AsyncIOResult<T>`
    - `constants.ts` - Pre-defined immutable Result constants (`RESULT_TRUE`, `RESULT_FALSE`, `RESULT_ZERO`, `RESULT_VOID`)
    - `mod.ts` - Re-exports all Result public APIs
  - `prelude.ts` - Exports `Some()`, `None`, `Ok()`, and `Err()` constructors; includes `None` interface with type overrides for better inference
  - `mod.ts` - Re-exports all core public APIs

- **`src/std/`** - Standard library types (sync primitives and control flow)
  - **`src/std/sync/`** - Rust-inspired synchronization primitives
    - `once.ts` - `Once<T>` for sync one-time initialization (like Rust's `OnceLock`)
    - `once_async.ts` - `OnceAsync<T>` for async one-time initialization with concurrent call handling
    - `lazy.ts` - `Lazy<T>` for sync lazy initialization (like Rust's `LazyLock`)
    - `lazy_async.ts` - `LazyAsync<T>` for async lazy initialization
    - `mutex.ts` - `Mutex<T>` for async mutual exclusion
    - `rwlock.ts` - `RwLock<T>` for async read-write lock (multiple readers or single writer)
    - `semaphore.ts` - `Semaphore` for limiting async concurrency (counting semaphore, inspired by tokio)
    - `channel.ts` - `Channel<T>` for MPMC async message passing with optional bounded capacity
    - `mod.ts` - Re-exports all sync primitives
  - **`src/std/ops/`** - Rust-inspired control flow and function types
    - `control_flow.ts` - `ControlFlow<B, C>` with `Break(value)` and `Continue(value)` variants
    - `fn_once.ts` - `FnOnce` for sync one-time callable functions
    - `fn_once_async.ts` - `FnOnceAsync` for async one-time callable functions
    - `guards.ts` - Type guard utility `isControlFlow()`
    - `symbols.ts` - Internal symbol `ControlFlowKindSymbol` for type discrimination
    - `mod.ts` - Re-exports all ops types
  - `mod.ts` - Re-exports all std public APIs

- **`src/internal/`** - Internal shared modules, NOT re-exported by `src/mod.ts`
  - `constants.ts` - Internal cached Promise constants (`ASYNC_TRUE`, `ASYNC_FALSE`) shared by `core/prelude.ts` and `std/sync/channel.ts` to avoid duplicate allocations. Placing these in a separate module under `src/internal/` (rather than `export const` in a file that `src/mod.ts` re-exports) prevents the symbols from leaking into the public API surface (`dist/mod.d.mts`). `@internal` JSDoc alone does NOT prevent `export *` from physically re-exporting a symbol — use a module not covered by `export *` for true isolation.

- **`src/mod.ts`** - Main entry point, re-exports everything from core/ and std/

### Key Design Patterns

1. **Tagged Union Pattern**: Uses internal symbols (`OptionKindSymbol`, `ResultKindSymbol`) to distinguish between variants (Some/None, Ok/Err)

2. **Runtime Immutability**: All instances (`Some`, `None`, `Ok`, `Err`, `Break`, `Continue`, `Lazy`, `LazyAsync`, `Once`, `OnceAsync`, `Mutex`, `MutexGuard`, `RwLock`, `Semaphore`, `SemaphorePermit`, `Channel`, `Sender`, `Receiver`, `FnOnce`, `FnOnceAsync`) are frozen with `Object.freeze()`. TypeScript interfaces intentionally omit `readonly` modifiers because:
   - `None extends Option<never>` requires method syntax (bivariant) rather than arrow function property syntax (contravariant) for type compatibility
   - Runtime protection via `Object.freeze()` is sufficient; compile-time `readonly` provides marginal additional benefit
   - Avoiding `Mutable* + Readonly<>` pattern keeps exported types clean

3. **Method Chaining**: All transformation methods (`map`, `andThen`, etc.) return new `Option` or `Result` instances

4. **Async Support**: Parallel async versions of methods (e.g., `isSomeAndAsync`, `andThenAsync`) and `AsyncOption`/`AsyncResult` type aliases

5. **Concurrent-Safe Async Primitives**: `OnceAsync`, `LazyAsync`, `Mutex`, `RwLock`, `Semaphore`, and `Channel` handle concurrent async calls correctly - only one initialization runs, others wait for it

### Performance Optimizations

- **Result.map()/mapErr()**: When the Result variant doesn't match (e.g., calling `map()` on `Err`), the methods now return `this` instead of creating a new instance. This reduces object allocations in transformation chains where operations might short-circuit.

- **Channel buffer**: Uses internal `Queue` data structure instead of `Array` for O(1) shift operations when consuming messages.

- **Tree-shaking annotations**: All module-level function call expressions are annotated with `/*#__PURE__*/` to help bundlers safely remove unused code. This includes `Symbol()`, `Promise.resolve()`, `Object.freeze()`, `Ok()`, etc. When adding new top-level constants, always include the `/*#__PURE__*/` annotation before the function call.

- **Tree-shaking limitations**: Option and Result are coupled through `prelude.ts` — importing any single constructor (e.g., `None`) pulls in `Some`, `Ok`, `Err`, `OptionKindSymbol`, `ResultKindSymbol`, `isOption`, and `isResult`. This is because `None`'s method closures reference `Ok`/`Err` (e.g., `okOr`, `transpose`). The `std/` modules (Channel, Mutex, etc.) are independently tree-shakeable.

### Non-Standard Extensions

The codebase includes some methods not present in Rust's standard library, placed in `// #region Try extensions` at the end of the `Result<T, E>` interface:

- **`andTryAsync<U>(fn: (value: T) => PromiseLike<U>): Promise<Result<U, E | unknown>>`** 
  - Like `andThenAsync`, but auto-catches exceptions/Promise rejections and converts them to `Err`
  - Useful when chaining async operations that may throw without wrapping each call in `tryAsyncResult`
  
- **`orTryAsync<F>(fn: (error: E) => PromiseLike<F>): Promise<Result<T, F | unknown>>`**
  - Like `orElseAsync`, but auto-catches exceptions in recovery logic
  - Handles cases where recovery logic itself might fail

These are useful for chaining operations that may throw without wrapping in `tryAsyncResult`.

### Type Aliases

Common type aliases for convenience:

```ts
// Async variants
import type { AsyncOption, AsyncResult } from 'happy-rusty';
type AsyncOption<T> = Promise<Option<T>>;
type AsyncResult<T, E> = Promise<Result<T, E>>;

// I/O operations (Error as failure type)
import type { IOResult, AsyncIOResult } from 'happy-rusty';
type IOResult<T> = Result<T, Error>;
type AsyncIOResult<T> = Promise<IOResult<T>>;

// Void operations (no value on success)
import type { VoidResult, AsyncVoidResult } from 'happy-rusty';
type VoidResult<E> = Result<void, E>;
type AsyncVoidResult<E> = Promise<VoidResult<E>>;
type VoidIOResult = IOResult<void>;
type AsyncVoidIOResult = AsyncIOResult<void>;

// Infallible operations (never fail)
import type { SafeResult, AsyncSafeResult } from 'happy-rusty';
type SafeResult<T> = Result<T, never>;
type AsyncSafeResult<T> = Promise<SafeResult<T>>;
```

### Examples

Example files are located in `examples/` directory, mirroring `src/` structure:
- `examples/core/option/` - Option usage examples (sync `option.ts` + `option.async.ts`)
- `examples/core/result/` - Result usage examples (sync `result.ts` + `result.async.ts`, including async with Try extensions)
- `examples/std/sync/` - Sync primitives examples (Once, OnceAsync, Lazy, LazyAsync, Mutex, RwLock, Semaphore, Channel)
- `examples/std/ops/` - ControlFlow, FnOnce, and FnOnceAsync examples
- `examples/main.ts` - Aggregates and runs all examples (entry for `pnpm run eg`)

See "Running Examples" above for the run command.

### Toolchain

This project uses **pnpm** for all development tasks:

#### pnpm (Build, Test & Development Tools)
- **Purpose**: Manages the Node.js toolchain (`vite-plus` CLI) and testing
- **Dependencies**: `vite-plus` (+ `@voidzero-dev/vite-plus-core`), Vitest coverage/UI addons, TypeScript, TypeDoc
- **Location**: `node_modules/` (from npm registry)
- **Used for**: Building npm packages, testing, linting, formatting, type checking, documentation

**Dependency version management with Vite+:**
- `vite` is aliased to `npm:@voidzero-dev/vite-plus-core` via `overrides` in `pnpm-workspace.yaml`; `vitest` is pinned to the version bundled by Vite+ (`4.1.10`). `@vitest/coverage-v8` and `@vitest/ui` are NOT bundled and must stay pinned to the same Vitest version.
- Upgrading the toolchain means bumping `vite-plus` + `@voidzero-dev/vite-plus-core` and syncing the `vite` override version and the `vitest` pin — NOT running a blanket devDeps upgrade. Check the Vite+ changelog for breaking changes first (pre-1.0).
- The direct `vite` devDependency must stay declared: without it, pnpm auto-installs upstream vite for vitest's peer dependency, splitting vite into two instances.
- `typescript` stays pinned to `^6.0.3` — do NOT upgrade to TS 7. TypeDoc and the dts bundling path consume the TypeScript JS API, which TS 7 removed (7.0 ships CLI/LSP only). Type checking in `vp check` already runs on tsgo (the TS 7 compiler), so upgrading the local package adds no value.

**Key Point**: Test code (`tests/`) is NEVER bundled into `dist/`.

### Runtime vs Build Environments

- **Runtime**: Supports Deno, Node.js (CommonJS/ESM), browsers, and Bun
- **Build**: Uses pnpm for dependency management, `vp pack` (tsdown/Rolldown) for JS bundling and `.d.ts` generation
- **Testing**: Uses Vitest test runner with V8 coverage
- **Types**: Strict TypeScript with `bundler` module resolution

### Publishing

Dual publishing to:
- **npm**: Via `dist/` built with `vp pack` (CJS + ESM + dual `.d.ts`)
- **JSR**: Directly from `src/mod.ts` source (Deno-native)

## Testing

- Test files located in `tests/` directory, mirroring `src/` structure:
  - `tests/core/option/option.test.ts` - Option tests
  - `tests/core/result/result.test.ts` - Result tests
  - `tests/core/result/constants.test.ts` - Pre-defined Result constants tests
  - `tests/core/result/guards.test.ts` - Type guard utilities tests
  - `tests/std/sync/once.test.ts` - Once tests
  - `tests/std/sync/once_async.test.ts` - OnceAsync tests
  - `tests/std/sync/lazy.test.ts` - Lazy tests
  - `tests/std/sync/lazy_async.test.ts` - LazyAsync tests
  - `tests/std/sync/mutex.test.ts` - Mutex tests
  - `tests/std/sync/rwlock.test.ts` - RwLock tests
  - `tests/std/sync/semaphore.test.ts` - Semaphore tests
  - `tests/std/sync/channel.test.ts` - Channel tests
  - `tests/std/ops/control_flow.test.ts` - ControlFlow tests
  - `tests/std/ops/fn_once.test.ts` - FnOnce tests
  - `tests/std/ops/fn_once_async.test.ts` - FnOnceAsync tests
- Uses Vitest with `@vitest/coverage-v8` for coverage
- Tests import from `../../../src/mod.ts` using relative paths
- Run with: `pnpm run test`
- **Branch coverage**: any new branch (a new `toString` state, a `typeof` fast path, conditional logic, etc.) must be accompanied by tests covering that branch. New code should reach 100% branch coverage; never leave a newly introduced branch untested

### Running a Single Test

```bash
# Run specific test file
pnpm exec vp test run tests/core/option/option.test.ts

# Run tests matching a pattern
pnpm exec vp test run -t "Option:Some"

# Run in watch mode for a specific file
pnpm exec vp test tests/core/option/option.test.ts
```

## Code Style

- Lint and format config lives in `vite.config.ts` (`lint` block = oxlint + tsgolint schema, `fmt` block = oxfmt schema). Do NOT create standalone `oxlint.config.ts` / `.oxlintrc.json` files — Vite+ requires centralized config.
- TypeScript config (`tsconfig.json`) enables: `strict`, `strictNullChecks`, `noUnusedLocals`, `noUnusedParameters`, `noPropertyAccessFromIndexSignature` (access index-signature properties via bracket notation `obj['key']`, not `obj.key`), `verbatimModuleSyntax`, `bundler` module resolution with `.ts` import extensions required
  - Lint: oxlint `correctness` category (error) + `suspicious` category (warn) + type-aware tsgolint rules, plus explicit rules:
    - `eqeqeq` (with `{ null: 'ignore' }` to allow `== null` checks)
    - `no-cond-assign` (prevents `if (a = 1)` typos)
    - `no-self-compare`, `no-template-curly-in-string`
    - `default-case-last`, `no-new-wrappers`, `radix`
    - `prefer-template`, `object-shorthand`
  - Formatting (oxfmt): 4-space indent, single quotes, `arrowParens: 'avoid'` (keeps single-arg arrows parenthesis-free), semicolons, trailing commas, JSON files 2-space via override; md/yml/lockfiles are excluded via `ignorePatterns`
  - Type-aware rules explicitly OFF (conflict with core design patterns — see comments in `vite.config.ts`): `typescript/no-unsafe-type-assertion` (frozen-literal construction `Object.freeze({...}) as Option<T>`), `typescript/restrict-template-expressions` (intentional generic stringification in `toString`), `typescript/no-unnecessary-type-parameters` (phantom generics like `None.map<U>` required for inference)
  - No non-null assertions: `typescript/no-non-null-assertion` is `error`. Do not use the `!` operator — use `??=`, `?? fallback`, or explicit `if (x !== null)` guards instead.
- Strict TypeScript settings: `noUnusedLocals`, `noUnusedParameters`, `strictNullChecks`
- File extensions required in imports (`.ts` suffix)
- Use `@internal` JSDoc tag for exported functions/types that should not appear in public API docs
- Non-exported functions (like `safeStringify`, `assertOption`, `assertResult` in `prelude.ts`) are automatically excluded from TypeDoc output
- All public APIs should have `@since` tags indicating the version they were introduced
- `@example` tags should directly follow the previous `@` tag without blank lines
- JSDoc, inline comments, and `@example` blocks are written in **English**
- Do not use TypeScript `namespace` declarations — attach static helpers via direct assignment (`Func.prop = fn`). TS 6 infers the shape and cross-file visibility works; the generated `.d.ts` emits the expected `declare namespace` automatically

## CI/CD

- **test.yml** - Runs tests on push to main; reusable via `workflow_call`
- **docs.yml** - Deploys TypeDoc HTML to GitHub Pages on push to main
- **npm-publish.yml** - Publishes to npm on version tags (v*)
- **npm-publish-github-packages.yml** - Publishes to GitHub Packages on version tags
- **jsr-publish.yml** - Publishes to JSR on version tags

## Releasing

Use the `/release` skill which automates:
1. Update version in `package.json` and `jsr.json`
2. Update `CHANGELOG.md` (follow [Keep a Changelog](https://keepachangelog.com/) format), including comparison link at bottom
3. Commit: `git commit -m "release: vX.Y.Z"`
4. Create tag: `git tag vX.Y.Z`
5. Push: `git push && git push --tags`
6. CI automatically publishes to npm, GitHub Packages, and JSR

Removed/deprecated APIs are tracked in `CHANGELOG.md`.
