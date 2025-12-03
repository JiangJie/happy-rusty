# happy-rusty

将 Rust 的 `Option` 和 `Result` 带入 JavaScript/TypeScript - 更好的错误处理和空值安全模式。

[![NPM version](https://img.shields.io/npm/v/happy-rusty.svg)](https://npmjs.org/package/happy-rusty)
[![NPM downloads](https://badgen.net/npm/dm/happy-rusty)](https://npmjs.org/package/happy-rusty)
[![JSR Version](https://jsr.io/badges/@happy-js/happy-rusty)](https://jsr.io/@happy-js/happy-rusty)
[![JSR Score](https://jsr.io/badges/@happy-js/happy-rusty/score)](https://jsr.io/@happy-js/happy-rusty/score)
[![Build Status](https://github.com/JiangJie/happy-rusty/actions/workflows/test.yml/badge.svg)](https://github.com/JiangJie/happy-rusty/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/JiangJie/happy-rusty/graph/badge.svg)](https://codecov.io/gh/JiangJie/happy-rusty)

---

[English](README.md)

---

## 特性

- **Option&lt;T&gt;** - 表示可选值：每个 `Option` 要么是 `Some(T)`，要么是 `None`
- **Result&lt;T, E&gt;** - 表示成功（`Ok(T)`）或失败（`Err(E)`）
- **完整的 TypeScript 支持**，具有严格的类型推断
- **异步支持** - 所有转换方法都有异步版本
- **零依赖**
- **不可变** - 所有实例都是冻结对象
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

所有转换方法都有带 `Async` 后缀的异步变体：

```ts
// 异步 Option 方法
isSomeAndAsync(asyncFn)
unwrapOrElseAsync(asyncFn)
andThenAsync(asyncFn)
orElseAsync(asyncFn)

// 异步 Result 方法
isOkAndAsync(asyncFn)
isErrAndAsync(asyncFn)
unwrapOrElseAsync(asyncFn)
andThenAsync(asyncFn)
orElseAsync(asyncFn)
```

### 类型别名

```ts
// 常用模式的便捷类型别名
type AsyncOption<T> = Promise<Option<T>>;
type AsyncResult<T, E> = Promise<Result<T, E>>;

// 用于 I/O 操作
type IOResult<T> = Result<T, Error>;
type AsyncIOResult<T> = Promise<IOResult<T>>;

// 用于 void 返回值
type VoidResult<E> = Result<void, E>;
type VoidIOResult = IOResult<void>;
type AsyncVoidResult<E> = Promise<VoidResult<E>>;
type AsyncVoidIOResult = Promise<VoidIOResult>;
```

### 工具函数

```ts
import { isOption, isResult, promiseToAsyncResult } from 'happy-rusty';

// 类型守卫
if (isOption(value)) { /* ... */ }
if (isResult(value)) { /* ... */ }

// 将 Promise 转换为 Result
const result = await promiseToAsyncResult(fetch('/api/data'));
result.inspect(data => console.log(data))
      .inspectErr(err => console.error(err));
```

### 常量

```ts
import { RESULT_TRUE, RESULT_FALSE, RESULT_ZERO, RESULT_VOID } from 'happy-rusty';

// 可复用的不可变 Result 常量
function validate(): Result<boolean, Error> {
    return isValid ? RESULT_TRUE : RESULT_FALSE;
}

function doSomething(): Result<void, Error> {
    // ...
    return RESULT_VOID;
}
```

## 示例

- [Option 基础用法](examples/option.ts)
- [AsyncOption](examples/option.async.ts)
- [Result 基础用法](examples/result.ts)
- [AsyncResult](examples/result.async.ts)

## 文档

完整的 API 文档请查看 [docs/README.md](docs/README.md)。

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

[GPL-3.0](LICENSE)
