# CODEBUDDY.md

This file provides guidance to CodeBuddy Code when working with code in this repository.

## Project Overview

`happy-rusty` is a TypeScript library that ports Rust's `Option` and `Result` enum types to JavaScript/TypeScript, providing better error handling and null-safety patterns.

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
# Generate TypeDoc markdown documentation
pnpm run docs
```

## Architecture

### Core Structure

The codebase is organized around implementing Rust-style enums for JavaScript:

- **`src/enum/`** - Main implementation directory
  - `core.ts` - Defines the `Option<T>` and `Result<T, E>` interfaces with all their methods
  - `prelude.ts` - Exports `Some()`, `None`, `Ok()`, and `Err()` constructors; includes `None` interface with type overrides for better inference
  - `defines.ts` - Type aliases like `VoidResult<E>`, `IOResult<T>`, `AsyncIOResult<T>`
  - `symbols.ts` - Internal symbols for type discrimination (`OptionKindSymbol`, `ResultKindSymbol`)
  - `utils.ts` - Type guard utilities (`isOption()`, `isResult()`)
  - `extensions.ts` - Bridge utilities like `promiseToAsyncResult()` for converting Promise-based APIs to Result pattern
  - `constants.ts` - Pre-defined immutable Result constants (`RESULT_TRUE`, `RESULT_FALSE`, `RESULT_ZERO`, `RESULT_VOID`)
  - `mod.ts` - Re-exports all public APIs

### Key Design Patterns

1. **Tagged Union Pattern**: Uses internal symbols (`OptionKindSymbol`, `ResultKindSymbol`) to distinguish between variants (Some/None, Ok/Err)

2. **Immutable Design**: `None` is a frozen singleton object; `Some`, `Ok`, and `Err` return frozen objects

3. **Method Chaining**: All transformation methods (`map`, `andThen`, etc.) return new `Option` or `Result` instances

4. **Async Support**: Parallel async versions of methods (e.g., `isSomeAndAsync`, `andThenAsync`) and `AsyncOption`/`AsyncResult` type aliases

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

- Test files: `tests/enum/option.test.ts` and `tests/enum/result.test.ts`
- Uses Vitest with `@vitest/coverage-v8` for coverage
- Tests import from `../../src/mod.ts` using relative paths
- Run with: `pnpm run test`

### Running a Single Test

```bash
# Run specific test file
pnpm exec vitest run tests/enum/option.test.ts

# Run tests matching a pattern
pnpm exec vitest run -t "Option:Some"

# Run in watch mode for a specific file
pnpm exec vitest tests/enum/option.test.ts
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
