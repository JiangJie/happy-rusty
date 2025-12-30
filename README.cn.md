# happy-rusty

[![License](https://img.shields.io/npm/l/happy-rusty.svg)](LICENSE)
[![Build Status](https://github.com/JiangJie/happy-rusty/actions/workflows/test.yml/badge.svg)](https://github.com/JiangJie/happy-rusty/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/JiangJie/happy-rusty/graph/badge.svg)](https://codecov.io/gh/JiangJie/happy-rusty)
[![NPM version](https://img.shields.io/npm/v/happy-rusty.svg)](https://npmjs.org/package/happy-rusty)
[![NPM downloads](https://badgen.net/npm/dm/happy-rusty)](https://npmjs.org/package/happy-rusty)
[![JSR Version](https://jsr.io/badges/@happy-js/happy-rusty)](https://jsr.io/@happy-js/happy-rusty)
[![JSR Score](https://jsr.io/badges/@happy-js/happy-rusty/score)](https://jsr.io/@happy-js/happy-rusty/score)

将 Rust 的 `Option`、`Result` 和同步原语带入 JavaScript/TypeScript - 更好的错误处理和空值安全模式。

---

[English](README.md) | [API 文档](https://jiangjie.github.io/happy-rusty/)

---

## 特性

- **Option&lt;T&gt;** - 表示可选值：每个 `Option` 要么是 `Some(T)`，要么是 `None`
- **Result&lt;T, E&gt;** - 表示成功（`Ok(T)`）或失败（`Err(E)`）
- **同步原语** - Rust 风格的 `Once<T>`、`OnceAsync<T>`、`Lazy<T>`、`LazyAsync<T>`、`Mutex<T>`、`RwLock<T>` 和 `Channel<T>`
- **控制流** - 用于短路操作的 `ControlFlow<B, C>`，包含 `Break` 和 `Continue`
- **FnOnce** - 一次性可调用函数封装（`FnOnce` 和 `FnOnceAsync`）
- **完整的 TypeScript 支持**，具有严格的类型推断
- **异步支持** - 所有转换方法都有异步版本
- **零依赖**
- **运行时不可变** - 所有实例都通过 `Object.freeze()` 冻结
- **跨运行时** - 支持 Node.js、Deno、Bun 和浏览器

## 安装

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

## 快速开始

```ts
import { Some, None, Ok, Err } from 'happy-rusty';

// Option - 处理可空值
function findUser(id: number): Option<User> {
    const user = database.get(id);
    return user ? Some(user) : None;
}

const user = findUser(1)
    .map(u => u.name)
    .unwrapOr('Guest');

// Result - 处理错误
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
        console.error('解析失败:', err);
        return defaultSettings;
    });
```

## API 概览

### Option&lt;T&gt;

| 分类 | 方法 |
|------|------|
| **构造器** | `Some(value)`, `None` |
| **查询** | `isSome()`, `isNone()`, `isSomeAnd(fn)` |
| **提取** | `expect(msg)`, `unwrap()`, `unwrapOr(default)`, `unwrapOrElse(fn)` |
| **转换** | `map(fn)`, `mapOr(default, fn)`, `mapOrElse(defaultFn, fn)`, `filter(fn)`, `flatten()` |
| **布尔操作** | `and(other)`, `andThen(fn)`, `or(other)`, `orElse(fn)`, `xor(other)` |
| **类型转换** | `okOr(err)`, `okOrElse(fn)`, `transpose()` |
| **组合** | `zip(other)`, `zipWith(other, fn)`, `unzip()` |
| **副作用** | `inspect(fn)` |
| **比较** | `eq(other)` |

### Result&lt;T, E&gt;

| 分类 | 方法 |
|------|------|
| **构造器** | `Ok(value)`, `Ok()` (void), `Err(error)` |
| **查询** | `isOk()`, `isErr()`, `isOkAnd(fn)`, `isErrAnd(fn)` |
| **提取 Ok** | `expect(msg)`, `unwrap()`, `unwrapOr(default)`, `unwrapOrElse(fn)` |
| **提取 Err** | `expectErr(msg)`, `unwrapErr()` |
| **转换** | `map(fn)`, `mapErr(fn)`, `mapOr(default, fn)`, `mapOrElse(defaultFn, fn)`, `flatten()` |
| **布尔操作** | `and(other)`, `andThen(fn)`, `or(other)`, `orElse(fn)` |
| **类型转换** | `ok()`, `err()`, `transpose()` |
| **类型断言** | `asOk<F>()`, `asErr<U>()` |
| **副作用** | `inspect(fn)`, `inspectErr(fn)` |
| **比较** | `eq(other)` |

### 异步方法

所有转换方法都有带 `Async` 后缀的异步变体（如 `andThenAsync`、`mapAsync`、`unwrapOrElseAsync`）。

### 类型别名

```ts
type AsyncOption<T> = Promise<Option<T>>;
type AsyncResult<T, E> = Promise<Result<T, E>>;
type IOResult<T> = Result<T, Error>;          // 用于 I/O 操作
type AsyncIOResult<T> = Promise<IOResult<T>>; // 异步 I/O 操作
```

### 工具函数

```ts
import { tryResult, tryAsyncResult } from 'happy-rusty';

// 捕获异常为 Result（类似 Promise.try，但返回 Result）
const parsed = tryResult(JSON.parse, jsonString);  // Ok(value) 或 Err(error)
const response = await tryAsyncResult(fetch, '/api/data');
```

### 同步原语

```ts
import { Lazy, LazyAsync, Mutex, Channel } from 'happy-rusty';

// Lazy - 首次访问时计算一次
const expensive = Lazy(() => computeExpensiveValue());
expensive.force();  // 计算一次后缓存

// LazyAsync - 异步惰性初始化（并发安全）
const db = LazyAsync(async () => Database.connect(url));
await db.force();  // 只建立一次连接，并发调用会等待

// Mutex - 异步互斥锁
const state = Mutex({ count: 0 });
await state.withLock(async (s) => { s.count += 1; });

// Channel - MPMC 异步消息传递
const ch = Channel<string>(10);  // 有界容量
await ch.send('hello');
for await (const msg of ch) { console.log(msg); }
```

## 示例

- [Option](examples/core/option/option.ts) / [AsyncOption](examples/core/option/option.async.ts)
- [Result](examples/core/result/result.ts) / [AsyncResult](examples/core/result/result.async.ts)
- [Once](examples/std/sync/once.ts) / [OnceAsync](examples/std/sync/once_async.ts)
- [Lazy](examples/std/sync/lazy.ts) / [LazyAsync](examples/std/sync/lazy_async.ts)
- [Mutex](examples/std/sync/mutex.ts)
- [RwLock](examples/std/sync/rwlock.ts)
- [Channel](examples/std/sync/channel.ts)
- [ControlFlow](examples/std/ops/control_flow.ts)
- [FnOnce](examples/std/ops/fn_once.ts) / [FnOnceAsync](examples/std/ops/fn_once_async.ts)

## 设计说明

### 不可变性

所有类型（`Option`、`Result`、`ControlFlow`、`Lazy`、`LazyAsync`、`Once`、`OnceAsync`、`Mutex`、`MutexGuard`、`RwLock`、`Channel`、`Sender`、`Receiver`、`FnOnce`、`FnOnceAsync`）都通过 `Object.freeze()` 实现**运行时不可变**。这可以防止意外修改方法或属性：

```ts
const some = Some(42);
some.unwrap = () => 0;  // TypeError: Cannot assign to read only property
```

**为什么 TypeScript 接口没有使用 `readonly`？**

我们有意在接口的方法签名中省略了 `readonly` 修饰符。虽然这看起来可能会降低类型安全性，但有以下几个原因：

1. **继承兼容性** - `None` 类型继承自 `Option<never>`。TypeScript 的箭头函数属性语法（`readonly prop: () => T`）使用逆变参数检查，这会导致 `None`（参数为 `never`）与 `Option<T>` 不兼容。方法语法（`method(): T`）使用双变参数检查，使继承能够正常工作。

2. **运行时保护已足够** - `Object.freeze()` 已经在运行时阻止了重新赋值。添加 `readonly` 只提供编译时检查，在已有运行时保护的情况下收益有限。

3. **更简洁的 API** - 避免使用 `Mutable*` + `Readonly<>` 模式可以保持导出类型的简洁和文档的可读性。

4. **测试验证不可变性** - 我们的测试套件明确验证了所有实例都被冻结并且会拒绝属性修改。

## 为什么选择 happy-rusty？

JavaScript 的 `null`/`undefined` 和 try-catch 模式会导致：
- 未捕获的空引用错误
- 遗忘的错误处理
- 冗长的 try-catch 代码块
- 不清晰的函数契约

`happy-rusty` 提供了 Rust 久经考验的模式：
- **显式可选性** - `Option<T>` 在类型中明确表示值的缺失
- **显式错误** - `Result<T, E>` 强制考虑错误处理
- **链式调用** - 无需嵌套 if-else 或 try-catch 即可转换值
- **类型安全** - 完整的 TypeScript 支持，具有严格的类型推断

## 许可证

[MIT](LICENSE)
