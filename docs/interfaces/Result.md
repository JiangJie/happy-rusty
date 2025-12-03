[**happy-rusty**](../README.md)

***

[happy-rusty](../README.md) / Result

# Interface: Result\<T, E\>

Defined in: [core.ts:505](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L505)

The `Result` type is used for returning and propagating errors.
It is an enum with the variants, `Ok(T)`, representing success and containing a value, and `Err(E)`, representing error and containing an error value.
This interface includes methods that act on the `Result` type, similar to Rust's `Result` enum.

As Rust Code:
```rust
pub enum Result<T, E> {
   Ok(T),
   Err(E),
}
```

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | The type of the value contained in a successful `Result`. |
| `E` | The type of the error contained in an unsuccessful `Result`. |

## Methods

### and()

```ts
and<U>(other): Result<U, E>;
```

Defined in: [core.ts:834](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L834)

Returns `this` if the result is `Err`, otherwise returns the passed `Result`.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `U` | The type of the value in the other `Result`. |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | `Result`\<`U`, `E`\> | The `Result` to return if `this` is `Ok`. |

#### Returns

`Result`\<`U`, `E`\>

The passed `Result` if `this` is `Ok`, otherwise returns `this` (which is `Err`).

#### See

or

#### Example

```ts
const x = Ok(2);
const y = Err('late error');
console.log(x.and(y).unwrapErr()); // 'late error'

const a = Err('early error');
const b = Ok(5);
console.log(a.and(b).unwrapErr()); // 'early error'
```

***

### andThen()

```ts
andThen<U>(fn): Result<U, E>;
```

Defined in: [core.ts:872](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L872)

Calls the provided function with the contained value if `this` is `Ok`, otherwise returns `this` as `Err`.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `U` | The type of the value returned by the function. |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | (`value`) => `Result`\<`U`, `E`\> | A function that takes the `Ok` value and returns a `Result`. |

#### Returns

`Result`\<`U`, `E`\>

The result of `fn` if `this` is `Ok`, otherwise `this` as `Err`.

#### See

 - map
 - orElse

#### Example

```ts
const x = Ok(2);
const result = x.andThen(v => v > 0 ? Ok(v * 2) : Err('negative'));
console.log(result.unwrap()); // 4

const y = Err('error');
console.log(y.andThen(v => Ok(v * 2)).unwrapErr()); // 'error'
```

***

### andThenAsync()

```ts
andThenAsync<U>(fn): AsyncResult<U, E>;
```

Defined in: [core.ts:888](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L888)

Asynchronous version of `andThen`.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `U` | The type of the value returned by the async function. |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | (`value`) => [`AsyncResult`](../type-aliases/AsyncResult.md)\<`U`, `E`\> | An async function that takes the `Ok` value and returns a `Promise<Result<U, E>>`. |

#### Returns

[`AsyncResult`](../type-aliases/AsyncResult.md)\<`U`, `E`\>

A promise that resolves to `this` as `Err` if `this` is `Err`, otherwise the result of `fn`.

#### See

 - andThen
 - orElseAsync

#### Example

```ts
const x = Ok(2);
const result = await x.andThenAsync(async v => Ok(v * 2));
console.log(result.unwrap()); // 4
```

***

### asErr()

```ts
asErr<U>(): Result<U, E>;
```

Defined in: [core.ts:998](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L998)

Transforms the current Result into a new Result where the type of the success value is replaced with a new type `U`.
The type of the error remains unchanged.
This is a type-level only operation, equivalent to `result as unknown as Result<U, E>`.
Useful when you need to propagate an error to a different success type context.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `U` | The new type for the success value. |

#### Returns

`Result`\<`U`, `E`\>

`this` with the success type cast to `U`.

#### See

asOk

#### Example

```ts
const x: Result<number, string> = Err('error');
const y: Result<string, string> = x.asErr<string>();
console.log(y.unwrapErr()); // 'error'
```

***

### asOk()

```ts
asOk<F>(): Result<T, F>;
```

Defined in: [core.ts:980](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L980)

Transforms the current Result into a new Result where the type of the error is replaced with a new type `F`.
The type of the success value remains unchanged.
This is a type-level only operation, equivalent to `result as unknown as Result<T, F>`.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `F` | The new type for the error. |

#### Returns

`Result`\<`T`, `F`\>

`this` with the error type cast to `F`.

#### See

asErr

#### Example

```ts
const x: Result<number, string> = Ok(5);
const y: Result<number, Error> = x.asOk<Error>();
console.log(y.unwrap()); // 5
```

***

### eq()

```ts
eq(other): boolean;
```

Defined in: [core.ts:961](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L961)

Tests whether `this` and `other` are both `Ok` containing equal values, or both are `Err` containing equal errors.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | `Result`\<`T`, `E`\> | The other `Result` to compare with. |

#### Returns

`boolean`

`true` if `this` and `other` are both `Ok` with equal values, or both are `Err` with equal errors, otherwise `false`.

***

### err()

```ts
err(): Option<E>;
```

Defined in: [core.ts:710](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L710)

Converts from `Result<T, E>` to `Option<E>`.
If the result is `Err`, returns `Some(E)`.
If the result is `Ok`, returns `None`.

#### Returns

[`Option`](Option.md)\<`E`\>

#### See

ok

#### Example

```ts
const x = Err('error');
console.log(x.err().unwrap()); // 'error'

const y = Ok(5);
console.log(y.err().isNone()); // true
```

***

### expect()

```ts
expect(msg): T;
```

Defined in: [core.ts:608](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L608)

Returns the contained `Ok` value, with a provided error message if the result is `Err`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `msg` | `string` | The error message to provide if the result is an `Err`. |

#### Returns

`T`

#### Throws

Throws an error with the provided message if the result is an `Err`.

#### See

 - unwrap
 - expectErr

***

### expectErr()

```ts
expectErr(msg): E;
```

Defined in: [core.ts:662](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L662)

Returns the contained `Err` value, with a provided error message if the result is `Ok`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `msg` | `string` | The error message to provide if the result is an `Ok`. |

#### Returns

`E`

#### Throws

Throws an error with the provided message if the result is an `Ok`.

#### See

 - unwrapErr
 - expect

***

### flatten()

```ts
flatten<T>(this): Result<T, E>;
```

Defined in: [core.ts:807](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L807)

Converts from `Result<Result<T, E>, E>` to `Result<T, E>`.
If the result is `Ok(Ok(T))`, returns `Ok(T)`.
If the result is `Ok(Err(E))` or `Err(E)`, returns `Err(E)`.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `this` | `Result`\<`Result`\<`T`, `E`\>, `E`\> |

#### Returns

`Result`\<`T`, `E`\>

#### Example

```ts
const x = Ok(Ok(5));
console.log(x.flatten().unwrap()); // 5

const y = Ok(Err('error'));
console.log(y.flatten().unwrapErr()); // 'error'
```

***

### inspect()

```ts
inspect(fn): this;
```

Defined in: [core.ts:938](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L938)

Calls the provided function with the contained value if `this` is `Ok`, for side effects only.
Does not modify the `Result`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | (`value`) => `void` | A function to call with the `Ok` value. |

#### Returns

`this`

`this`, unmodified.

#### See

inspectErr

#### Example

```ts
const x = Ok(5);
x.inspect(v => console.log(v)); // prints 5
```

***

### inspectErr()

```ts
inspectErr(fn): this;
```

Defined in: [core.ts:952](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L952)

Calls the provided function with the contained error if `this` is `Err`, for side effects only.
Does not modify the `Result`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | (`error`) => `void` | A function to call with the `Err` value. |

#### Returns

`this`

`this`, unmodified.

#### See

inspect

#### Example

```ts
const x = Err('error');
x.inspectErr(e => console.log(e)); // prints 'error'
```

***

### isErr()

```ts
isErr(): boolean;
```

Defined in: [core.ts:538](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L538)

Returns `true` if the result is `Err`.

#### Returns

`boolean`

***

### isErrAnd()

```ts
isErrAnd(predicate): boolean;
```

Defined in: [core.ts:577](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L577)

Returns `true` if the result is `Err` and the provided predicate returns `true` for the contained error.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `predicate` | (`error`) => `boolean` | A function that takes the `Err` value and returns a boolean. |

#### Returns

`boolean`

#### See

isOkAnd

#### Example

```ts
const x = Err('error');
console.log(x.isErrAnd(e => e === 'error')); // true
```

***

### isErrAndAsync()

```ts
isErrAndAsync(predicate): Promise<boolean>;
```

Defined in: [core.ts:591](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L591)

Asynchronous version of `isErrAnd`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `predicate` | (`error`) => `Promise`\<`boolean`\> | An async function that takes the `Err` value and returns a `Promise<boolean>`. |

#### Returns

`Promise`\<`boolean`\>

A promise that resolves to `true` if the Result is `Err` and the predicate resolves to `true`.

#### See

 - isErrAnd
 - isOkAndAsync

#### Example

```ts
const x = Err('error');
await x.isErrAndAsync(async e => e.length > 0); // true
```

***

### isOk()

```ts
isOk(): boolean;
```

Defined in: [core.ts:533](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L533)

Returns `true` if the result is `Ok`.

#### Returns

`boolean`

***

### isOkAnd()

```ts
isOkAnd(predicate): boolean;
```

Defined in: [core.ts:551](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L551)

Returns `true` if the result is `Ok` and the provided predicate returns `true` for the contained value.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `predicate` | (`value`) => `boolean` | A function that takes the `Ok` value and returns a boolean. |

#### Returns

`boolean`

#### See

isErrAnd

#### Example

```ts
const x = Ok(2);
console.log(x.isOkAnd(v => v > 1)); // true
console.log(x.isOkAnd(v => v > 5)); // false
```

***

### isOkAndAsync()

```ts
isOkAndAsync(predicate): Promise<boolean>;
```

Defined in: [core.ts:565](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L565)

Asynchronous version of `isOkAnd`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `predicate` | (`value`) => `Promise`\<`boolean`\> | An async function that takes the `Ok` value and returns a `Promise<boolean>`. |

#### Returns

`Promise`\<`boolean`\>

A promise that resolves to `true` if the Result is `Ok` and the predicate resolves to `true`.

#### See

 - isOkAnd
 - isErrAndAsync

#### Example

```ts
const x = Ok(2);
await x.isOkAndAsync(async v => v > 1); // true
```

***

### map()

```ts
map<U>(fn): Result<U, E>;
```

Defined in: [core.ts:752](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L752)

Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `Ok` value,
leaving an `Err` value untouched.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `U` | The type of the value returned by the map function. |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | (`value`) => `U` | A function that takes the `Ok` value and returns a new value. |

#### Returns

`Result`\<`U`, `E`\>

#### See

 - mapErr
 - andThen

#### Example

```ts
const x = Ok(5);
console.log(x.map(v => v * 2).unwrap()); // 10

const y = Err('error');
console.log(y.map(v => v * 2).unwrapErr()); // 'error'
```

***

### mapErr()

```ts
mapErr<F>(fn): Result<T, F>;
```

Defined in: [core.ts:770](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L770)

Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained `Err` value,
leaving an `Ok` value untouched.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `F` | The type of the error returned by the map function. |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | (`error`) => `F` | A function that takes the `Err` value and returns a new error value. |

#### Returns

`Result`\<`T`, `F`\>

#### See

map

#### Example

```ts
const x = Err('error');
console.log(x.mapErr(e => e.toUpperCase()).unwrapErr()); // 'ERROR'
```

***

### mapOr()

```ts
mapOr<U>(defaultValue, fn): U;
```

Defined in: [core.ts:783](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L783)

Maps a `Result<T, E>` to `U` by applying a function to the contained `Ok` value (if `Ok`), or returns the provided default (if `Err`).

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `U` | The type of the value returned by the map function or the default value. |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `defaultValue` | `U` | The value to return if the result is `Err`. |
| `fn` | (`value`) => `U` | A function that takes the `Ok` value and returns a new value. |

#### Returns

`U`

#### See

mapOrElse

***

### mapOrElse()

```ts
mapOrElse<U>(defaultFn, fn): U;
```

Defined in: [core.ts:792](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L792)

Maps a `Result<T, E>` to `U` by applying a function to the contained `Ok` value (if `Ok`), or computes a default (if `Err`).

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `U` | The type of the value returned by the map function or the default function. |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `defaultFn` | (`error`) => `U` | A function that returns the default value. |
| `fn` | (`value`) => `U` | A function that takes the `Ok` value and returns a new value. |

#### Returns

`U`

#### See

mapOr

***

### ok()

```ts
ok(): Option<T>;
```

Defined in: [core.ts:694](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L694)

Converts from `Result<T, E>` to `Option<T>`.
If the result is `Ok`, returns `Some(T)`.
If the result is `Err`, returns `None`.

#### Returns

[`Option`](Option.md)\<`T`\>

#### See

err

#### Example

```ts
const x = Ok(5);
console.log(x.ok().unwrap()); // 5

const y = Err('error');
console.log(y.ok().isNone()); // true
```

***

### or()

```ts
or<F>(other): Result<T, F>;
```

Defined in: [core.ts:853](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L853)

Returns `this` if it is `Ok`, otherwise returns the passed `Result`.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `F` | The type of the error in the other `Result`. |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | `Result`\<`T`, `F`\> | The `Result` to return if `this` is `Err`. |

#### Returns

`Result`\<`T`, `F`\>

`this` if it is `Ok`, otherwise returns `other`.

#### See

and

#### Example

```ts
const x = Err('error');
const y = Ok(5);
console.log(x.or(y).unwrap()); // 5

const a = Ok(2);
const b = Ok(100);
console.log(a.or(b).unwrap()); // 2
```

***

### orElse()

```ts
orElse<F>(fn): Result<T, F>;
```

Defined in: [core.ts:906](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L906)

Calls the provided function with the contained error if `this` is `Err`, otherwise returns `this` as `Ok`.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `F` | The type of the error returned by the function. |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | (`error`) => `Result`\<`T`, `F`\> | A function that takes the `Err` value and returns a `Result`. |

#### Returns

`Result`\<`T`, `F`\>

The result of `fn` if `this` is `Err`, otherwise `this` as `Ok`.

#### See

andThen

#### Example

```ts
const x = Err('error');
const result = x.orElse(e => Ok(e.length));
console.log(result.unwrap()); // 5

const y = Ok(2);
console.log(y.orElse(e => Ok(0)).unwrap()); // 2
```

***

### orElseAsync()

```ts
orElseAsync<F>(fn): AsyncResult<T, F>;
```

Defined in: [core.ts:922](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L922)

Asynchronous version of `orElse`.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `F` | The type of the error returned by the async function. |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | (`error`) => [`AsyncResult`](../type-aliases/AsyncResult.md)\<`T`, `F`\> | An async function that takes the `Err` value and returns a `Promise<Result<T, F>>`. |

#### Returns

[`AsyncResult`](../type-aliases/AsyncResult.md)\<`T`, `F`\>

A promise that resolves to `this` as `Ok` if `this` is `Ok`, otherwise the result of `fn`.

#### See

 - orElse
 - andThenAsync

#### Example

```ts
const x = Err('error');
const result = await x.orElseAsync(async e => Ok(e.length));
console.log(result.unwrap()); // 5
```

***

### toString()

```ts
toString(): string;
```

Defined in: [core.ts:1003](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L1003)

Custom `toString` implementation that uses the `Result`'s contained value.

#### Returns

`string`

***

### transpose()

```ts
transpose<T>(this): Option<Result<T, E>>;
```

Defined in: [core.ts:730](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L730)

Transposes a `Result` of an `Option` into an `Option` of a `Result`.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | The type of the success value in the `Ok` variant of the `Option`. |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `this` | `Result`\<[`Option`](Option.md)\<`T`\>, `E`\> |

#### Returns

[`Option`](Option.md)\<`Result`\<`T`, `E`\>\>

`Some` containing `Ok` if the result is `Ok` containing `Some`,
         `Some` containing `Err` if the result is `Err`,
         `None` if the result is `Ok` containing `None`.

#### Example

```ts
const x = Ok(Some(5));
console.log(x.transpose().unwrap().unwrap()); // 5

const y: Result<Option<number>, string> = Err('error');
console.log(y.transpose().unwrap().unwrapErr()); // 'error'

const z = Ok(None);
console.log(z.transpose().isNone()); // true
```

***

### unwrap()

```ts
unwrap(): T;
```

Defined in: [core.ts:617](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L617)

Returns the contained `Ok` value.

#### Returns

`T`

#### Throws

Throws an error if the result is an `Err`.

#### See

 - expect
 - unwrapOr
 - unwrapErr

***

### unwrapErr()

```ts
unwrapErr(): E;
```

Defined in: [core.ts:670](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L670)

Returns the contained `Err` value.

#### Returns

`E`

#### Throws

Throws an error if the result is an `Ok`.

#### See

 - expectErr
 - unwrap

***

### unwrapOr()

```ts
unwrapOr(defaultValue): T;
```

Defined in: [core.ts:624](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L624)

Returns the contained `Ok` value or a provided default.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `defaultValue` | `T` | The value to return if the result is an `Err`. |

#### Returns

`T`

#### See

unwrapOrElse

***

### unwrapOrElse()

```ts
unwrapOrElse(fn): T;
```

Defined in: [core.ts:636](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L636)

Returns the contained `Ok` value or computes it from a closure if the result is `Err`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | (`error`) => `T` | A function that takes the `Err` value and returns an `Ok` value. |

#### Returns

`T`

#### See

unwrapOr

#### Example

```ts
const x = Err('error');
console.log(x.unwrapOrElse(e => e.length)); // 5
```

***

### unwrapOrElseAsync()

```ts
unwrapOrElseAsync(fn): Promise<T>;
```

Defined in: [core.ts:649](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L649)

Asynchronous version of `unwrapOrElse`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | (`error`) => `Promise`\<`T`\> | An async function that takes the `Err` value and returns a `Promise<T>`. |

#### Returns

`Promise`\<`T`\>

A promise that resolves to the contained `Ok` value or the result of the async function.

#### See

unwrapOrElse

#### Example

```ts
const x = Err('error');
await x.unwrapOrElseAsync(async e => e.length); // 5
```
