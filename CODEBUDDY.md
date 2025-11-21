# CODEBUDDY.md

This file provides guidance to CodeBuddy Code when working with code in this repository.

## Project Overview

`happy-rusty` is a TypeScript library that ports Rust's `Option` and `Result` enum types to JavaScript/TypeScript, providing better error handling and null-safety patterns.

## Development Commands

### Testing
```bash
# Run all tests with coverage (uses Deno)
pnpm run test

# Run tests with HTML coverage report
pnpm run test:html

# Run example code
pnpm run eg
```

### Building
```bash
# Full build (includes type check, lint, and rollup)
pnpm run build

# Type checking only
pnpm run check

# Linting only
pnpm run lint
```

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
  - `prelude.ts` - Exports `Some()`, `None`, `Ok()`, and `Err()` constructors and specialized interfaces
  - `defines.ts` - Type aliases like `VoidResult<E>`, `IOResult<T>`, `AsyncIOResult<T>`
  - `symbols.ts` - Internal symbols for type discrimination (`OptionKindSymbol`, `ResultKindSymbol`)
  - `utils.ts` - Type guard utilities (`isOption()`, `isResult()`)
  - `extensions.ts` - Additional utility functions
  - `constants.ts` - Shared constants
  - `mod.ts` - Re-exports all public APIs

### Key Design Patterns

1. **Tagged Union Pattern**: Uses internal symbols (`OptionKindSymbol`, `ResultKindSymbol`) to distinguish between variants (Some/None, Ok/Err)

2. **Immutable Design**: `None` is a frozen singleton object; `Some`, `Ok`, and `Err` return frozen objects

3. **Method Chaining**: All transformation methods (`map`, `andThen`, etc.) return new `Option` or `Result` instances

4. **Async Support**: Parallel async versions of methods (e.g., `isSomeAndAsync`, `andThenAsync`) and `AsyncOption`/`AsyncResult` type aliases

### Dual Toolchain Architecture (Important!)

This project uses **two separate, non-conflicting** package managers:

#### pnpm (Build & Development Tools)
- **Purpose**: Manages Node.js build toolchain
- **Dependencies**: TypeScript, ESLint, Rollup, TypeDoc
- **Location**: `node_modules/` (from npm registry)
- **Used for**: Building npm packages, linting, type checking, documentation

#### Deno (Testing & Examples)
- **Purpose**: Runs tests and examples
- **Dependencies**: `@std/assert`, `@std/testing` (from JSR)
- **Location**: `~/.cache/deno/` (not in node_modules)
- **Used for**: Test execution, running examples

**Key Point**: These toolchains are completely isolated:
- Test code (`tests/`) is NEVER bundled into `dist/`
- Deno dependencies are NEVER mixed with pnpm dependencies
- `pnpm test` simply invokes `deno test` as a command

### Runtime vs Build Environments

- **Runtime**: Supports Deno, Node.js (CommonJS/ESM), browsers, and Bun
- **Build**: Uses pnpm for dependency management, Rollup for bundling
- **Testing**: Uses Deno's built-in test runner (isolated from build toolchain)
- **Types**: Strict TypeScript with `bundler` module resolution

### Publishing

Dual publishing to:
- **npm**: Via `dist/` built with Rollup (CJS + ESM)
- **JSR**: Directly from `src/mod.ts` source (Deno-native)

## Testing

- Test files: `tests/enum/option.test.ts` and `tests/enum/result.test.ts`
- Uses Deno standard library: `@std/assert` and `@std/testing/mock`
- Tests import from `'happy-rusty'` (path mapped in deno.json) instead of relative paths
- Deno lock file is disabled (`"lock": false` in deno.json)
- Run with: `deno test --coverage --clean`

### Running a Single Test

```bash
# Run specific test file
deno test tests/enum/option.test.ts

# Run with coverage
deno test tests/enum/option.test.ts --coverage

# Run specific test by name
deno test --filter "Option:Some"
```

### Updating Dependencies

```bash
# Update pnpm dependencies (build tools)
pnpm update --latest

# Update deno dependencies (manually edit deno.json)
# Check latest versions at: https://jsr.io/@std/assert
```

## Code Style

- ESLint with TypeScript strict and stylistic configs
- No semicolons (enforced by linter)
- Strict TypeScript settings: `noUnusedLocals`, `noUnusedParameters`, `strictNullChecks`
- File extensions required in imports (`.ts` suffix)
