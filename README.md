# happy-rusty

[![License](https://img.shields.io/npm/l/happy-rusty.svg)](LICENSE)
[![Build Status](https://github.com/JiangJie/happy-rusty/actions/workflows/test.yml/badge.svg)](https://github.com/JiangJie/happy-rusty/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/JiangJie/happy-rusty/graph/badge.svg)](https://codecov.io/gh/JiangJie/happy-rusty)
[![NPM version](https://img.shields.io/npm/v/happy-rusty.svg)](https://npmjs.org/package/happy-rusty)
[![NPM downloads](https://badgen.net/npm/dm/happy-rusty)](https://npmjs.org/package/happy-rusty)
[![JSR Version](https://jsr.io/badges/@happy-js/happy-rusty)](https://jsr.io/@happy-js/happy-rusty)
[![JSR Score](https://jsr.io/badges/@happy-js/happy-rusty/score)](https://jsr.io/@happy-js/happy-rusty/score)

Rust's `Option`, `Result`, and sync primitives for JavaScript/TypeScript - Better error handling and null-safety patterns.

---

[中文](README.cn.md) | [API Documentation](https://jiangjie.github.io/happy-rusty/)

---

## Features

- **Option&lt;T&gt;** - Represents an optional value: every `Option` is either `Some(T)` or `None`
- **Result&lt;T, E&gt;** - Represents either success (`Ok(T)`) or failure (`Err(E)`)
- **Sync Primitives** - Rust-inspired `Once<T>`, `OnceAsync<T>`, `Lazy<T>`, `LazyAsync<T>`, `Mutex<T>`, and `RwLock<T>`
- **Control Flow** - `ControlFlow<B, C>` with `Break` and `Continue` for short-circuiting operations
- **FnOnce** - One-time callable function wrappers (`FnOnce` and `FnOnceAsync`)
- **Full TypeScript support** with strict type inference
- **Async support** - Async versions of all transformation methods
- **Zero dependencies**
- **Runtime immutability** - All instances are frozen with `Object.freeze()`
- **Cross-runtime** - Works in Node.js, Deno, Bun, and browsers

## Installation

```sh
# npm
npm install happy-rusty

# yarn
yarn add happy-rusty

# pnpm
pnpm add happy-rusty

# JSR (Deno)
deno add @happy-js/happy-rusty

# JSR (Bun)
bunx jsr add @happy-js/happy-rusty
```

## Quick Start

```ts
import { Some, None, Ok, Err } from 'happy-rusty';

// Option - handling nullable values
function findUser(id: number): Option<User> {
    const user = database.get(id);
    return user ? Some(user) : None;
}

const user = findUser(1)
    .map(u => u.name)
    .unwrapOr('Guest');

// Result - handling errors
function parseJSON<T>(json: string): Result<T, Error> {
    try {
        return Ok(JSON.parse(json));
    } catch (e) {
        return Err(e as Error);
    }
}

const config = parseJSON<Config>(jsonStr)
    .map(c => c.settings)
    .unwrapOrElse(err => {
        console.error('Parse failed:', err);
        return defaultSettings;
    });
```

## API Overview

### Option&lt;T&gt;

| Category | Methods |
|----------|---------|
| **Constructors** | `Some(value)`, `None` |
| **Querying** | `isSome()`, `isNone()`, `isSomeAnd(fn)` |
| **Extracting** | `expect(msg)`, `unwrap()`, `unwrapOr(default)`, `unwrapOrElse(fn)` |
| **Transforming** | `map(fn)`, `mapOr(default, fn)`, `mapOrElse(defaultFn, fn)`, `filter(fn)`, `flatten()` |
| **Boolean ops** | `and(other)`, `andThen(fn)`, `or(other)`, `orElse(fn)`, `xor(other)` |
| **Converting** | `okOr(err)`, `okOrElse(fn)`, `transpose()` |
| **Combining** | `zip(other)`, `zipWith(other, fn)`, `unzip()` |
| **Side effects** | `inspect(fn)` |
| **Comparison** | `eq(other)` |

### Result&lt;T, E&gt;

| Category | Methods |
|----------|---------|
| **Constructors** | `Ok(value)`, `Ok()` (void), `Err(error)` |
| **Querying** | `isOk()`, `isErr()`, `isOkAnd(fn)`, `isErrAnd(fn)` |
| **Extracting Ok** | `expect(msg)`, `unwrap()`, `unwrapOr(default)`, `unwrapOrElse(fn)` |
| **Extracting Err** | `expectErr(msg)`, `unwrapErr()` |
| **Transforming** | `map(fn)`, `mapErr(fn)`, `mapOr(default, fn)`, `mapOrElse(defaultFn, fn)`, `flatten()` |
| **Boolean ops** | `and(other)`, `andThen(fn)`, `or(other)`, `orElse(fn)` |
| **Converting** | `ok()`, `err()`, `transpose()` |
| **Type casting** | `asOk<F>()`, `asErr<U>()` |
| **Side effects** | `inspect(fn)`, `inspectErr(fn)` |
| **Comparison** | `eq(other)` |

### Async Methods

All transformation methods have async variants with `Async` suffix (e.g., `andThenAsync`, `mapAsync`, `unwrapOrElseAsync`).

### Type Aliases

```ts
type AsyncOption<T> = Promise<Option<T>>;
type AsyncResult<T, E> = Promise<Result<T, E>>;
type IOResult<T> = Result<T, Error>;          // For I/O operations
type AsyncIOResult<T> = Promise<IOResult<T>>; // Async I/O operations
```

### Utility Functions

```ts
import { tryResult, tryAsyncResult } from 'happy-rusty';

// Capture exceptions as Result (like Promise.try, but returns Result)
const parsed = tryResult(JSON.parse, jsonString);  // Ok(value) or Err(error)
const response = await tryAsyncResult(fetch, '/api/data');
```

### Sync Primitives

```ts
import { Lazy, LazyAsync, Mutex } from 'happy-rusty';

// Lazy - compute once on first access
const expensive = Lazy(() => computeExpensiveValue());
expensive.force();  // Computed once, cached thereafter

// LazyAsync - async lazy initialization (concurrent-safe)
const db = LazyAsync(async () => Database.connect(url));
await db.force();  // Only one connection, concurrent calls wait

// Mutex - async mutual exclusion
const state = Mutex({ count: 0 });
await state.withLock(async (s) => { s.count += 1; });
```

## Examples

- [Option](examples/core/option/option.ts) / [AsyncOption](examples/core/option/option.async.ts)
- [Result](examples/core/result/result.ts) / [AsyncResult](examples/core/result/result.async.ts)
- [Once](examples/std/sync/once.ts) / [OnceAsync](examples/std/sync/once_async.ts)
- [Lazy](examples/std/sync/lazy.ts) / [LazyAsync](examples/std/sync/lazy_async.ts)
- [Mutex](examples/std/sync/mutex.ts)
- [RwLock](examples/std/sync/rwlock.ts)
- [ControlFlow](examples/std/ops/control_flow.ts)
- [FnOnce](examples/std/ops/fn_once.ts) / [FnOnceAsync](examples/std/ops/fn_once_async.ts)

## Design Notes

### Immutability

All types (`Option`, `Result`, `ControlFlow`, `Lazy`, `LazyAsync`, `Once`, `OnceAsync`, `Mutex`, `MutexGuard`, `RwLock`, `FnOnce`, `FnOnceAsync`) are **immutable at runtime** via `Object.freeze()`. This prevents accidental modification of methods or properties:

```ts
const some = Some(42);
some.unwrap = () => 0;  // TypeError: Cannot assign to read only property
```

**Why no `readonly` in TypeScript interfaces?**

We intentionally omit `readonly` modifiers from method signatures in interfaces. While this might seem to reduce type safety, there are compelling reasons:

1. **Inheritance compatibility** - The `None` type extends `Option<never>`. TypeScript's arrow function property syntax (`readonly prop: () => T`) uses contravariant parameter checking, which causes `None` (with `never` parameters) to be incompatible with `Option<T>`. Method syntax (`method(): T`) uses bivariant checking, allowing the inheritance to work correctly.

2. **Runtime protection is sufficient** - `Object.freeze()` already prevents reassignment at runtime. Adding `readonly` only provides compile-time checking, which offers marginal benefit when runtime protection exists.

3. **Cleaner API** - Avoiding the `Mutable*` + `Readonly<>` pattern keeps the exported types clean and documentation readable.

4. **Testing validates immutability** - Our test suite explicitly verifies that all instances are frozen and reject property modifications.

## Why happy-rusty?

JavaScript's `null`/`undefined` and try-catch patterns lead to:
- Uncaught null reference errors
- Forgotten error handling
- Verbose try-catch blocks
- Unclear function contracts

`happy-rusty` provides Rust's battle-tested patterns:
- **Explicit optionality** - `Option<T>` makes absence visible in types
- **Explicit errors** - `Result<T, E>` forces error handling consideration
- **Method chaining** - Transform values without nested if-else or try-catch
- **Type safety** - Full TypeScript support with strict type inference

## License

[MIT](LICENSE)
