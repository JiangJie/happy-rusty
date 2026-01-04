# CODEBUDDY.md

This file provides guidance to CodeBuddy Code when working with code in this repository.

## Project Overview

`happy-rusty` is a TypeScript library that brings Rust's error handling and synchronization patterns to JavaScript/TypeScript:

- **Option\<T\>** - Represents optional values (`Some(T)` or `None`) for null-safe programming
- **Result\<T, E\>** - Represents success (`Ok(T)`) or failure (`Err(E)`) for explicit error handling
- **Sync Primitives** - `Once<T>`, `OnceAsync<T>`, `Lazy<T>`, `LazyAsync<T>`, `Mutex<T>`, `RwLock<T>`, `Channel<T>` for initialization and concurrency control
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
# Full build (includes type check, lint, vite build, and rollup dts)
pnpm run build

# Type checking only
pnpm run check

# Linting only
pnpm run lint
```

### Build Architecture

The build process is split into two separate steps:

1. **Vite** - Compiles TypeScript to JavaScript (CJS + ESM)
2. **Rollup + rollup-plugin-dts** - Generates bundled `.d.ts` type declarations

**Why not use a single tool?**

- **api-extractor issue**: When using `@microsoft/api-extractor` to generate `.d.ts` files, it sorts exports alphabetically. This causes issues when `None extends Option<never>` because `None` (N) is processed before `Option` (O), resulting in internal renaming like `Option_2`. See [rushstack#3017](https://github.com/microsoft/rushstack/issues/3017).

- **vite-plugin-dts issue**: The popular `vite-plugin-dts` uses `@microsoft/api-extractor` internally for bundling declarations, so it produces the same `Option_2` renaming artifact.

- **rollup-plugin-dts** preserves source order and correctly handles interface inheritance, producing clean `.d.ts` output without renaming artifacts.

- **Vite** provides fast, optimized JavaScript bundling with esbuild under the hood, while Rollup with `rollup-plugin-dts` specializes in type declaration bundling.

### Documentation
```bash
# Generate TypeDoc HTML documentation (deployed to GitHub Pages)
pnpm run docs
```

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

- **`src/mod.ts`** - Main entry point, re-exports everything from core/ and std/

### Key Design Patterns

1. **Tagged Union Pattern**: Uses internal symbols (`OptionKindSymbol`, `ResultKindSymbol`) to distinguish between variants (Some/None, Ok/Err)

2. **Runtime Immutability**: All instances (`Some`, `None`, `Ok`, `Err`, `Break`, `Continue`, `Lazy`, `LazyAsync`, `Once`, `OnceAsync`, `Mutex`, `MutexGuard`, `RwLock`, `Channel`, `Sender`, `Receiver`, `FnOnce`, `FnOnceAsync`) are frozen with `Object.freeze()`. TypeScript interfaces intentionally omit `readonly` modifiers because:
   - `None extends Option<never>` requires method syntax (bivariant) rather than arrow function property syntax (contravariant) for type compatibility
   - Runtime protection via `Object.freeze()` is sufficient; compile-time `readonly` provides marginal additional benefit
   - Avoiding `Mutable* + Readonly<>` pattern keeps exported types clean

3. **Method Chaining**: All transformation methods (`map`, `andThen`, etc.) return new `Option` or `Result` instances

4. **Async Support**: Parallel async versions of methods (e.g., `isSomeAndAsync`, `andThenAsync`) and `AsyncOption`/`AsyncResult` type aliases

5. **Concurrent-Safe Async Primitives**: `OnceAsync`, `LazyAsync`, `Mutex`, `RwLock`, and `Channel` handle concurrent async calls correctly - only one initialization runs, others wait for it

### Non-Standard Extensions

The codebase includes some methods not present in Rust's standard library, placed in `// #region Try extensions` at the end of the `Result<T, E>` interface:

- **`andTryAsync<U>`** - Like `andThenAsync`, but auto-catches exceptions/Promise rejections and converts them to `Err`
- **`orTryAsync<F>`** - Like `orElseAsync`, but auto-catches exceptions in recovery logic

These are useful for chaining operations that may throw without wrapping in `tryAsyncResult`.

### Examples

Example files are located in `examples/` directory, mirroring `src/` structure:
- `examples/core/option/` - Option usage examples
- `examples/core/result/` - Result usage examples (including async with Try extensions)
- `examples/std/sync/` - Sync primitives examples (Once, Lazy, Mutex, RwLock, Channel)
- `examples/std/ops/` - ControlFlow and FnOnce examples

Run examples with: `pnpm run eg`

### Toolchain

This project uses **pnpm** for all development tasks:

#### pnpm (Build, Test & Development Tools)
- **Purpose**: Manages Node.js build toolchain and testing
- **Dependencies**: TypeScript, ESLint, Vite, Vitest, Rollup, TypeDoc
- **Location**: `node_modules/` (from npm registry)
- **Used for**: Building npm packages, testing, linting, type checking, documentation

**Key Point**: Test code (`tests/`) is NEVER bundled into `dist/`.

### Runtime vs Build Environments

- **Runtime**: Supports Deno, Node.js (CommonJS/ESM), browsers, and Bun
- **Build**: Uses pnpm for dependency management, Vite for JS bundling, Rollup for `.d.ts` generation
- **Testing**: Uses Vitest test runner with V8 coverage
- **Types**: Strict TypeScript with `bundler` module resolution

### Publishing

Dual publishing to:
- **npm**: Via `dist/` built with Vite (CJS + ESM) and Rollup (`.d.ts`)
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
  - `tests/std/sync/channel.test.ts` - Channel tests
  - `tests/std/ops/control_flow.test.ts` - ControlFlow tests
  - `tests/std/ops/fn_once.test.ts` - FnOnce tests
  - `tests/std/ops/fn_once_async.test.ts` - FnOnceAsync tests
- Uses Vitest with `@vitest/coverage-v8` for coverage
- Tests import from `../../../src/mod.ts` using relative paths
- Run with: `pnpm run test`

### Running a Single Test

```bash
# Run specific test file
pnpm exec vitest run tests/core/option/option.test.ts

# Run tests matching a pattern
pnpm exec vitest run -t "Option:Some"

# Run in watch mode for a specific file
pnpm exec vitest tests/core/option/option.test.ts
```

### Updating Dependencies

```bash
# Update pnpm dependencies
pnpm update --latest
```

## Code Style

- ESLint with TypeScript strict and stylistic configs, plus `@stylistic/eslint-plugin`
- Semicolons required (enforced by `@stylistic/semi`)
- Trailing commas required in multiline (enforced by `@stylistic/comma-dangle`)
- Strict TypeScript settings: `noUnusedLocals`, `noUnusedParameters`, `strictNullChecks`
- File extensions required in imports (`.ts` suffix)
- Use `@internal` JSDoc tag for exported functions/types that should not appear in public API docs
- Non-exported functions (like `safeStringify`, `assertOption`, `assertResult` in `prelude.ts`) are automatically excluded from TypeDoc output

## CI/CD

- **test.yml** - Runs tests on push to main; reusable via `workflow_call`
- **docs.yml** - Deploys TypeDoc HTML to GitHub Pages on push to main
- **npm-publish.yml** - Publishes to npm on version tags (v*)
- **npm-publish-github-packages.yml** - Publishes to GitHub Packages on version tags
- **jsr-publish.yml** - Publishes to JSR on version tags

## Releasing

1. Update version in `package.json` and `jsr.json`
2. Update `CHANGELOG.md` (follow [Keep a Changelog](https://keepachangelog.com/) format)
3. Commit: `git commit -m "chore(release): bump version to vX.Y.Z"`
4. Create and push tag: `git tag vX.Y.Z && git push origin main --tags`
5. CI automatically publishes to npm, GitHub Packages, and JSR
