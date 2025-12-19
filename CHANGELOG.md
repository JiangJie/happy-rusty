# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.1] - 2025-12-19

### Changed
- License changed from GPL-3.0 to MIT for broader adoption and easier integration

### Added
- Navigation links (GitHub, npm, JSR) in TypeDoc documentation header

## [1.6.0] - 2025-12-18

### Added
- **Sync Primitives**: `Once<T>`, `Lazy<T>`, `LazyAsync<T>`, `Mutex<T>` for Rust-style synchronization
- **Control Flow**: `ControlFlow<B, C>` with `Break` and `Continue` variants
- `Symbol.toStringTag` property to all types for better type identification
- Custom `toString()` method to all types for debugging
- `isControlFlow()` type guard utility
- `isNoneOr()` and `isNoneOrAsync()` methods for Option
- `exports` field in package.json for modern Node.js module resolution
- GitHub Pages workflow for automatic API documentation deployment
- Immutability tests to verify `Object.freeze()` is working correctly
- 100% test coverage
- CHANGELOG.md with full version history

### Changed
- All instances are now frozen with `Object.freeze()` for runtime immutability
- TypeDoc output format from Markdown to HTML for GitHub Pages compatibility
- Migrated from Deno test to Vitest
- Build process split into Vite (JS) and Rollup (dts)

### Fixed
- Symbol property syntax and duplicate declaration issues
- Type inference improvements for `None` interface methods

## [1.5.0] - 2024-08-11

### Added
- Async versions of methods: `isSomeAndAsync`, `isOkAndAsync`, `isErrAndAsync`, `unwrapOrElseAsync`, `andThenAsync`, `orElseAsync`
- Async examples

### Changed
- Updated pnpm to v9.7.0
- Updated ESLint configuration

## [1.4.0] - 2024-08-05

### Added
- `Ok()` constructor without arguments (similar to Rust's `Ok(())`)
- `RESULT_VOID` constant for void Result returns
- `VoidResult<E>`, `VoidIOResult`, `AsyncVoidResult<E>`, `AsyncVoidIOResult` type aliases

## [1.3.2] - 2024-08-04

### Changed
- Renamed `helpers` to `utils`
- Improved `@example` annotations in JSDoc

## [1.3.1] - 2024-08-03

### Fixed
- `map` methods now correctly return new objects instead of mutating

### Changed
- Updated Rollup to v4.20.0

## [1.3.0] - 2024-08-01

### Added
- `RESULT_TRUE`, `RESULT_FALSE`, `RESULT_ZERO` constants

### Fixed
- Circular dependency issues

### Changed
- Reorganized code structure

## [1.2.0] - 2024-08-01

### Added
- `isOption()` and `isResult()` type guard utilities
- Custom string conversion for Option and Result

### Changed
- Replaced arrow functions with normal functions for better debug experience
- Updated ESLint to v9

## [1.1.2] - 2024-07-17

### Added
- `asOk<F>()` and `asErr<U>()` methods for type casting

## [1.1.1] - 2024-07-13

### Fixed
- TypeDoc configuration issues

### Changed
- Updated dependencies

## [1.1.0] - 2024-06-09

### Added
- `Option.filter()` method
- Many new Option and Result APIs
- Comprehensive code comments and documentation

### Changed
- Improved type inference
- `Option.filter()` now returns `Option<T>` instead of boolean

## [1.0.9] - 2024-05-14

### Added
- Documentation for exported symbols
- README examples

## [1.0.8] - 2024-05-13

### Changed
- Switched from npm to pnpm
- Added GitHub Actions test workflow with Codecov

## [1.0.7] - 2024-05-08

### Changed
- `Some` value type changed to `NonNullable<T>`

### Fixed
- Can now invoke `err()` from `Ok` variant

## [1.0.6] - 2024-05-08

### Added
- Commonly used type exports

### Changed
- Set `type: "module"` in package.json
- Build target set to ESNext

## [1.0.5] - 2024-05-05

### Changed
- Throw `TypeError` instead of generic `Error`
- Switched to Rollup for building
- Added Bun support in CI

## [1.0.4] - 2024-05-04

### Added
- Chinese README (`README.cn.md`)
- JSR publishing workflow
- npm publishing workflows

### Changed
- Replaced Parcel with Rollup for building
- Replaced Jest with Bun test

## [1.0.3] - 2024-04-27

### Added
- Installation and Examples sections in README

### Changed
- Force return const for better type inference

## [1.0.2] - 2024-04-26

### Added
- JSR publishing support

### Changed
- Improved code comments

## [1.0.1] - 2024-04-26

### Changed
- Replaced enum with const for better tree-shaking
- Marked package as side-effect free

## [1.0.0] - 2024-04-24

### Added
- Initial release
- `Option<T>` type with `Some` and `None` variants
- `Result<T, E>` type with `Ok` and `Err` variants
- Full TypeScript support
- Comprehensive API matching Rust's Option and Result

[1.6.1]: https://github.com/JiangJie/happy-rusty/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/JiangJie/happy-rusty/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/JiangJie/happy-rusty/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/JiangJie/happy-rusty/compare/v1.3.2...v1.4.0
[1.3.2]: https://github.com/JiangJie/happy-rusty/compare/v1.3.1...v1.3.2
[1.3.1]: https://github.com/JiangJie/happy-rusty/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/JiangJie/happy-rusty/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/JiangJie/happy-rusty/compare/v1.1.2...v1.2.0
[1.1.2]: https://github.com/JiangJie/happy-rusty/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/JiangJie/happy-rusty/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/JiangJie/happy-rusty/compare/v1.0.9...v1.1.0
[1.0.9]: https://github.com/JiangJie/happy-rusty/compare/v1.0.8...v1.0.9
[1.0.8]: https://github.com/JiangJie/happy-rusty/compare/v1.0.7...v1.0.8
[1.0.7]: https://github.com/JiangJie/happy-rusty/compare/v1.0.6...v1.0.7
[1.0.6]: https://github.com/JiangJie/happy-rusty/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/JiangJie/happy-rusty/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/JiangJie/happy-rusty/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/JiangJie/happy-rusty/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/JiangJie/happy-rusty/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/JiangJie/happy-rusty/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/JiangJie/happy-rusty/releases/tag/v1.0.0
