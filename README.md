# happy-rusty

Rust's `Option` and `Result` for JavaScript/TypeScript - Better error handling and null-safety patterns.

[![NPM version](https://img.shields.io/npm/v/happy-rusty.svg)](https://npmjs.org/package/happy-rusty)
[![NPM downloads](https://badgen.net/npm/dm/happy-rusty)](https://npmjs.org/package/happy-rusty)
[![JSR Version](https://jsr.io/badges/@happy-js/happy-rusty)](https://jsr.io/@happy-js/happy-rusty)
[![JSR Score](https://jsr.io/badges/@happy-js/happy-rusty/score)](https://jsr.io/@happy-js/happy-rusty/score)
[![Build Status](https://github.com/JiangJie/happy-rusty/actions/workflows/test.yml/badge.svg)](https://github.com/JiangJie/happy-rusty/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/JiangJie/happy-rusty/graph/badge.svg)](https://codecov.io/gh/JiangJie/happy-rusty)

---

[中文](README.cn.md)

---

## Features

- **Option&lt;T&gt;** - Represents an optional value: every `Option` is either `Some(T)` or `None`
- **Result&lt;T, E&gt;** - Represents either success (`Ok(T)`) or failure (`Err(E)`)
- **Sync Primitives** - Rust-inspired `Once<T>`, `Lazy<T>`, `LazyAsync<T>`, and `Mutex<T>`
- **Control Flow** - `ControlFlow<B, C>` with `Break` and `Continue` for short-circuiting operations
- **Full TypeScript support** with strict type inference
- **Async support** - Async versions of all transformation methods
- **Zero dependencies**
- **Immutable** - All instances are frozen objects
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

All transformation methods have async variants with `Async` suffix:

```ts
// Async Option methods
isSomeAndAsync(asyncFn)
unwrapOrElseAsync(asyncFn)
andThenAsync(asyncFn)
orElseAsync(asyncFn)

// Async Result methods
isOkAndAsync(asyncFn)
isErrAndAsync(asyncFn)
unwrapOrElseAsync(asyncFn)
andThenAsync(asyncFn)
orElseAsync(asyncFn)
```

### Type Aliases

```ts
// Convenient type aliases for common patterns
type AsyncOption<T> = Promise<Option<T>>;
type AsyncResult<T, E> = Promise<Result<T, E>>;

// For I/O operations
type IOResult<T> = Result<T, Error>;
type AsyncIOResult<T> = Promise<IOResult<T>>;

// For void returns
type VoidResult<E> = Result<void, E>;
type VoidIOResult = IOResult<void>;
type AsyncVoidResult<E> = Promise<VoidResult<E>>;
type AsyncVoidIOResult = Promise<VoidIOResult>;
```

### Utility Functions

```ts
import { isOption, isResult, promiseToAsyncResult } from 'happy-rusty';

// Type guards
if (isOption(value)) { /* ... */ }
if (isResult(value)) { /* ... */ }

// Convert Promise to Result
const result = await promiseToAsyncResult(fetch('/api/data'));
result.inspect(data => console.log(data))
      .inspectErr(err => console.error(err));
```

### Constants

```ts
import { RESULT_TRUE, RESULT_FALSE, RESULT_ZERO, RESULT_VOID } from 'happy-rusty';

// Reusable immutable Result constants
function validate(): Result<boolean, Error> {
    return isValid ? RESULT_TRUE : RESULT_FALSE;
}

function doSomething(): Result<void, Error> {
    // ...
    return RESULT_VOID;
}
```

### Sync Primitives

```ts
import { Once, Lazy, LazyAsync, Mutex } from 'happy-rusty';

// Once - one-time initialization (like Rust's OnceLock)
const config = Once<Config>();
config.set(loadConfig());           // Set once
config.get();                       // Some(config) or None
config.getOrInit(() => defaultCfg); // Get or initialize

// Lazy - lazy initialization with initializer at construction
const expensive = Lazy(() => computeExpensiveValue());
expensive.force();  // Compute on first access, cached thereafter

// LazyAsync - async lazy initialization
const db = LazyAsync(async () => await Database.connect(url));
await db.force();  // Only one connection, concurrent calls wait

// Mutex - async mutual exclusion
const state = Mutex({ count: 0 });
await state.withLock(async (s) => {
    s.count += 1;  // Exclusive access
});
```

### Control Flow

```ts
import { Break, Continue, ControlFlow } from 'happy-rusty';

// Short-circuit operations
function findFirst<T>(arr: T[], pred: (t: T) => boolean): Option<T> {
    for (const item of arr) {
        const flow = pred(item) ? Break(item) : Continue();
        if (flow.isBreak()) {
            return Some(flow.breakValue().unwrap());
        }
    }
    return None;
}

// Custom fold with early exit
function tryFold<T, Acc>(
    arr: T[],
    init: Acc,
    f: (acc: Acc, item: T) => ControlFlow<Acc, Acc>
): Acc {
    let acc = init;
    for (const item of arr) {
        const flow = f(acc, item);
        if (flow.isBreak()) return flow.breakValue().unwrap();
        acc = flow.continueValue().unwrap();
    }
    return acc;
}
```

## Examples

- [Option basics](examples/option.ts)
- [AsyncOption](examples/option.async.ts)
- [Result basics](examples/result.ts)
- [AsyncResult](examples/result.async.ts)
- [Once](examples/once.ts)
- [Lazy](examples/lazy.ts)
- [Mutex](examples/mutex.ts)
- [ControlFlow](examples/control_flow.ts)

## Documentation

Full API documentation is available at [docs/README.md](docs/README.md).

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

[GPL-3.0](LICENSE)
