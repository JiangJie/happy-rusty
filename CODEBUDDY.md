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
  - `match.ts` - Pattern matching utilities
  - `mod.ts` - Re-exports all public APIs

### Key Design Patterns

1. **Tagged Union Pattern**: Uses internal symbols (`OptionKindSymbol`, `ResultKindSymbol`) to distinguish between variants (Some/None, Ok/Err)

2. **Immutable Design**: `None` is a frozen singleton object; `Some`, `Ok`, and `Err` return frozen objects

3. **Method Chaining**: All transformation methods (`map`, `andThen`, etc.) return new `Option` or `Result` instances

4. **Async Support**: Parallel async versions of methods (e.g., `isSomeAndAsync`, `andThenAsync`) and `AsyncOption`/`AsyncResult` type aliases

### Runtime vs Build Environments

- **Runtime**: Supports Deno, Node.js (CommonJS/ESM), browsers, and Bun
- **Build**: Uses pnpm for dependency management, Rollup for bundling
- **Testing**: Uses Deno's built-in test runner (not Jest/Vitest)
- **Types**: Strict TypeScript with `bundler` module resolution

### Publishing

Dual publishing to:
- npm (via `dist/` built with Rollup)
- JSR (directly from `src/mod.ts` source)

## Testing

- Test files: `tests/enum/option.test.ts` and `tests/enum/result.test.ts`
- Uses Deno standard library: `@std/assert` and `@std/testing/mock`
- Run with: `deno test --coverage --clean`

### Running a Single Test

```bash
# Run specific test file
deno test tests/enum/option.test.ts

# Run with coverage
deno test tests/enum/option.test.ts --coverage
```

## Code Style

- ESLint with TypeScript strict and stylistic configs
- No semicolons (enforced by linter)
- Strict TypeScript settings: `noUnusedLocals`, `noUnusedParameters`, `strictNullChecks`
- File extensions required in imports (`.ts` suffix)
