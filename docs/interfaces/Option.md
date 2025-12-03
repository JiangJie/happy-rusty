[**happy-rusty**](../README.md)

***

[happy-rusty](../README.md) / Option

# Interface: Option\<T\>

Defined in: [core.ts:24](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L24)

Type `Option` represents an optional value: every `Option` is either `Some` and contains a value, or `None`, and does not.
This interface includes methods that act on the `Option` type, similar to Rust's `Option` enum.

As Rust Code:
```rust
pub enum Option<T> {
   None,
   Some(T),
}
```

## Extended by

- [`None`](None.md)

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | The type of the value contained in the `Some` variant. |

## Methods

### and()

```ts
and<U>(other): Option<U>;
```

Defined in: [core.ts:352](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L352)

Returns `None` if the Option is `None`, otherwise returns `other`.
This is sometimes called "and then" because it is similar to a logical AND operation.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `U` | The type of the value in the other `Option`. |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | `Option`\<`U`\> | The `Option` to return if `this` is `Some`. |

#### Returns

`Option`\<`U`\>

`None` if `this` is `None`, otherwise returns `other`.

#### See

 - or
 - xor

#### Example

```ts
const x = Some(2);
const y = Some('hello');
console.log(x.and(y).unwrap()); // 'hello'

const z = None;
console.log(z.and(y).isNone()); // true
```

***

### andThen()

```ts
andThen<U>(fn): Option<U>;
```

Defined in: [core.ts:372](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L372)

Returns `None` if the Option is `None`, otherwise calls `fn` with the wrapped value and returns the result.
This function can be used for control flow based on `Option` values.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `U` | The type of the value returned by the function. |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | (`value`) => `Option`\<`U`\> | A function that takes the contained value and returns an `Option`. |

#### Returns

`Option`\<`U`\>

The result of `fn` if `this` is `Some`, otherwise `None`.

#### See

 - map
 - orElse

#### Example

```ts
const x = Some(2);
const result = x.andThen(v => v > 0 ? Some(v * 2) : None);
console.log(result.unwrap()); // 4

const y = None;
console.log(y.andThen(v => Some(v * 2)).isNone()); // true
```

***

### andThenAsync()

```ts
andThenAsync<U>(fn): AsyncOption<U>;
```

Defined in: [core.ts:388](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L388)

Asynchronous version of `andThen`.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `U` | The type of the value returned by the async function. |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | (`value`) => [`AsyncOption`](../type-aliases/AsyncOption.md)\<`U`\> | An async function that takes the contained value and returns a `Promise<Option<U>>`. |

#### Returns

[`AsyncOption`](../type-aliases/AsyncOption.md)\<`U`\>

A promise that resolves to `None` if `this` is `None`, otherwise the result of `fn`.

#### See

 - andThen
 - orElseAsync

#### Example

```ts
const x = Some(2);
const result = await x.andThenAsync(async v => Some(v * 2));
console.log(result.unwrap()); // 4
```

***

### eq()

```ts
eq(other): boolean;
```

Defined in: [core.ts:480](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L480)

Tests whether `this` and `other` are both `Some` containing equal values, or both are `None`.
This method can be used for comparing `Option` instances in a value-sensitive manner.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | `Option`\<`T`\> | The other `Option` to compare with. |

#### Returns

`boolean`

`true` if `this` and `other` are both `Some` with equal values, or both are `None`, otherwise `false`.

***

### expect()

```ts
expect(msg): T;
```

Defined in: [core.ts:98](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L98)

Returns the contained `Some` value, with a provided error message if the value is a `None`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `msg` | `string` | The error message to provide if the value is a `None`. |

#### Returns

`T`

#### Throws

Throws an error with the provided message if the Option is a `None`.

#### See

unwrap

***

### filter()

```ts
filter(predicate): Option<T>;
```

Defined in: [core.ts:214](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L214)

Returns `None` if the Option is `None`, otherwise calls predicate with the wrapped value and returns:
- `Some(t)` if predicate returns `true` (where `t` is the wrapped value), and
- `None` if predicate returns `false`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `predicate` | (`value`) => `boolean` | A function that takes the contained value and returns a boolean. |

#### Returns

`Option`\<`T`\>

#### Example

```ts
const x = Some(4);
console.log(x.filter(v => v > 2).isSome()); // true
console.log(x.filter(v => v > 5).isNone()); // true
```

***

### flatten()

```ts
flatten<T>(this): Option<T>;
```

Defined in: [core.ts:228](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L228)

Converts from `Option<Option<T>>` to `Option<T>`.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `this` | `Option`\<`Option`\<`T`\>\> |

#### Returns

`Option`\<`T`\>

`None` if the Option is `None`, otherwise returns the contained `Option`.

#### Example

```ts
const x = Some(Some(5));
console.log(x.flatten().unwrap()); // 5

const y = Some(None);
console.log(y.flatten().isNone()); // true
```

***

### inspect()

```ts
inspect(fn): this;
```

Defined in: [core.ts:470](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L470)

Calls the provided function with the contained value if `this` is `Some`.
This is primarily for side effects and does not transform the `Option`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | (`value`) => `void` | A function to call with the contained value. |

#### Returns

`this`

`this`, unmodified, for chaining additional methods.

***

### isNone()

```ts
isNone(): boolean;
```

Defined in: [core.ts:57](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L57)

Returns `true` if the Option is a `None` value.

#### Returns

`boolean`

***

### isSome()

```ts
isSome(): boolean;
```

Defined in: [core.ts:52](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L52)

Returns `true` if the Option is a `Some` value.

#### Returns

`boolean`

***

### isSomeAnd()

```ts
isSomeAnd(predicate): boolean;
```

Defined in: [core.ts:69](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L69)

Returns `true` if the Option is a `Some` value and the predicate returns `true` for the contained value.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `predicate` | (`value`) => `boolean` | A function that takes the contained value and returns a boolean. |

#### Returns

`boolean`

#### Example

```ts
const x = Some(2);
console.log(x.isSomeAnd(v => v > 1)); // true
console.log(x.isSomeAnd(v => v > 5)); // false
```

***

### isSomeAndAsync()

```ts
isSomeAndAsync(predicate): Promise<boolean>;
```

Defined in: [core.ts:82](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L82)

Asynchronous version of `isSomeAnd`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `predicate` | (`value`) => `Promise`\<`boolean`\> | An async function that takes the contained value and returns a `Promise<boolean>`. |

#### Returns

`Promise`\<`boolean`\>

A promise that resolves to `true` if the Option is `Some` and the predicate resolves to `true`.

#### See

isSomeAnd

#### Example

```ts
const x = Some(2);
await x.isSomeAndAsync(async v => v > 1); // true
```

***

### map()

```ts
map<U>(fn): Option<U>;
```

Defined in: [core.ts:244](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L244)

Maps an `Option<T>` to `Option<U>` by applying a function to a contained value.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `U` | The type of the value returned by the map function. |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | (`value`) => `U` | A function that takes the contained value and returns a new value. |

#### Returns

`Option`\<`U`\>

#### See

andThen

#### Example

```ts
const x = Some(5);
console.log(x.map(v => v * 2).unwrap()); // 10

const y = None;
console.log(y.map(v => v * 2).isNone()); // true
```

***

### mapOr()

```ts
mapOr<U>(defaultValue, fn): U;
```

Defined in: [core.ts:253](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L253)

Maps an `Option<T>` to `U` by applying a function to the contained value (if any), or returns the provided default (if not).

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `U` | The type of the value returned by the map function or the default value. |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `defaultValue` | `U` | The value to return if the Option is `None`. |
| `fn` | (`value`) => `U` | A function that takes the contained value and returns a new value. |

#### Returns

`U`

#### See

mapOrElse

***

### mapOrElse()

```ts
mapOrElse<U>(defaultFn, fn): U;
```

Defined in: [core.ts:262](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L262)

Maps an `Option<T>` to `U` by applying a function to a contained value (if any), or computes a default (if not).

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `U` | The type of the value returned by the map function or the default function. |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `defaultFn` | () => `U` | A function that returns the default value. |
| `fn` | (`value`) => `U` | A function that takes the contained value and returns a new value. |

#### Returns

`U`

#### See

mapOr

***

### okOr()

```ts
okOr<E>(error): Result<T, E>;
```

Defined in: [core.ts:162](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L162)

Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and `None` to `Err(err)`.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `E` | The type of the error value in the `Err` variant of the resulting `Result`. |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `error` | `E` | The error value to use if the Option is a `None`. |

#### Returns

[`Result`](Result.md)\<`T`, `E`\>

#### See

okOrElse

#### Example

```ts
const x = Some(5);
console.log(x.okOr('error').isOk()); // true

const y = None;
console.log(y.okOr('error').unwrapErr()); // 'error'
```

***

### okOrElse()

```ts
okOrElse<E>(err): Result<T, E>;
```

Defined in: [core.ts:175](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L175)

Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and `None` to `Err(err())`.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `E` | The type of the error value in the `Err` variant of the resulting `Result`. |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `err` | () => `E` | A function that returns the error value. |

#### Returns

[`Result`](Result.md)\<`T`, `E`\>

#### See

okOr

#### Example

```ts
const x = None;
console.log(x.okOrElse(() => 'error').unwrapErr()); // 'error'
```

***

### or()

```ts
or(other): Option<T>;
```

Defined in: [core.ts:407](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L407)

Returns the Option if it contains a value, otherwise returns `other`.
This can be used for providing a fallback `Option`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | `Option`\<`T`\> | The fallback `Option` to use if `this` is `None`. |

#### Returns

`Option`\<`T`\>

`this` if it is `Some`, otherwise `other`.

#### See

 - and
 - xor

#### Example

```ts
const x = None;
const y = Some(5);
console.log(x.or(y).unwrap()); // 5

const z = Some(2);
console.log(z.or(y).unwrap()); // 2
```

***

### orElse()

```ts
orElse(fn): Option<T>;
```

Defined in: [core.ts:425](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L425)

Returns the Option if it contains a value, otherwise calls `fn` and returns the result.
This method can be used for lazy fallbacks, as `fn` is only evaluated if `this` is `None`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | () => `Option`\<`T`\> | A function that produces an `Option`. |

#### Returns

`Option`\<`T`\>

`this` if it is `Some`, otherwise the result of `fn`.

#### See

andThen

#### Example

```ts
const x = None;
const result = x.orElse(() => Some(10));
console.log(result.unwrap()); // 10

const y = Some(5);
console.log(y.orElse(() => Some(10)).unwrap()); // 5
```

***

### orElseAsync()

```ts
orElseAsync(fn): AsyncOption<T>;
```

Defined in: [core.ts:440](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L440)

Asynchronous version of `orElse`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | () => [`AsyncOption`](../type-aliases/AsyncOption.md)\<`T`\> | An async function that produces a `Promise<Option<T>>`. |

#### Returns

[`AsyncOption`](../type-aliases/AsyncOption.md)\<`T`\>

A promise that resolves to `this` if it is `Some`, otherwise the result of `fn`.

#### See

 - orElse
 - andThenAsync

#### Example

```ts
const x = None;
const result = await x.orElseAsync(async () => Some(10));
console.log(result.unwrap()); // 10
```

***

### toString()

```ts
toString(): string;
```

Defined in: [core.ts:487](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L487)

Custom `toString` implementation that uses the `Option`'s contained value.

#### Returns

`string`

***

### transpose()

```ts
transpose<T, E>(this): Result<Option<T>, E>;
```

Defined in: [core.ts:196](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L196)

Transposes an `Option` of a `Result` into a `Result` of an `Option`.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | The type of the success value in the `Ok` variant of the `Result`. |
| `E` | The type of the error value in the `Err` variant of the `Result`. |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `this` | `Option`\<[`Result`](Result.md)\<`T`, `E`\>\> |

#### Returns

[`Result`](Result.md)\<`Option`\<`T`\>, `E`\>

`Ok` containing `Some` if the Option is a `Some` containing `Ok`,
         `Err` containing the error if the Option is a `Some` containing `Err`,
         `Ok` containing `None` if the Option is `None`.

#### Example

```ts
const x = Some(Ok(5));
console.log(x.transpose().unwrap().unwrap()); // 5

const y = Some(Err('error'));
console.log(y.transpose().unwrapErr()); // 'error'

const z: Option<Result<number, string>> = None;
console.log(z.transpose().unwrap().isNone()); // true
```

***

### unwrap()

```ts
unwrap(): T;
```

Defined in: [core.ts:106](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L106)

Returns the contained `Some` value.

#### Returns

`T`

#### Throws

Throws an error if the value is a `None`.

#### See

 - expect
 - unwrapOr

***

### unwrapOr()

```ts
unwrapOr(defaultValue): T;
```

Defined in: [core.ts:113](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L113)

Returns the contained `Some` value or a provided default.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `defaultValue` | `T` | The value to return if the Option is a `None`. |

#### Returns

`T`

#### See

unwrapOrElse

***

### unwrapOrElse()

```ts
unwrapOrElse(fn): T;
```

Defined in: [core.ts:125](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L125)

Returns the contained `Some` value or computes it from a closure.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | () => `T` | A function that returns the default value. |

#### Returns

`T`

#### See

unwrapOr

#### Example

```ts
const x = None;
console.log(x.unwrapOrElse(() => 10)); // 10
```

***

### unwrapOrElseAsync()

```ts
unwrapOrElseAsync(fn): Promise<T>;
```

Defined in: [core.ts:138](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L138)

Asynchronous version of `unwrapOrElse`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | () => `Promise`\<`T`\> | An async function that returns a `Promise<T>` as the default value. |

#### Returns

`Promise`\<`T`\>

A promise that resolves to the contained value or the result of the async function.

#### See

unwrapOrElse

#### Example

```ts
const x = None;
await x.unwrapOrElseAsync(async () => 10); // 10
```

***

### unzip()

```ts
unzip<T, U>(this): [Option<T>, Option<U>];
```

Defined in: [core.ts:324](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L324)

Converts from `Option<[T, U]>` to `[Option<T>, Option<U>]`.
If `this` is `Some([a, b])`, returns `[Some(a), Some(b)]`.
If `this` is `None`, returns `[None, None]`.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | The type of the first value in the tuple. |
| `U` | The type of the second value in the tuple. |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `this` | `Option`\<\[`T`, `U`\]\> |

#### Returns

\[`Option`\<`T`\>, `Option`\<`U`\>\]

A tuple of `Options`, one for each element in the original `Option` of a tuple.

#### See

zip

#### Example

```ts
const x = Some([1, 'hello'] as [number, string]);
const [a, b] = x.unzip();
console.log(a.unwrap()); // 1
console.log(b.unwrap()); // 'hello'
```

***

### xor()

```ts
xor(other): Option<T>;
```

Defined in: [core.ts:460](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L460)

Returns `Some` if exactly one of `this`, `other` is `Some`, otherwise returns `None`.
This can be thought of as an exclusive or operation on `Option` values.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | `Option`\<`T`\> | The other `Option` to compare with. |

#### Returns

`Option`\<`T`\>

`Some` if exactly one of `this` and `other` is `Some`, otherwise `None`.

#### See

 - and
 - or

#### Example

```ts
const x = Some(2);
const y = None;
console.log(x.xor(y).unwrap()); // 2

const a = Some(2);
const b = Some(3);
console.log(a.xor(b).isNone()); // true
```

***

### zip()

```ts
zip<U>(other): Option<[T, U]>;
```

Defined in: [core.ts:287](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L287)

Combines `this` with another `Option` by zipping their contained values.
If `this` is `Some(s)` and `other` is `Some(o)`, returns `Some([s, o])`.
If either `this` or `other` is `None`, returns `None`.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `U` | The type of the value in the other `Option`. |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | `Option`\<`U`\> | The other `Option` to zip with. |

#### Returns

`Option`\<\[`T`, `U`\]\>

An `Option` containing a tuple of the values if both are `Some`, otherwise `None`.

#### See

 - zipWith
 - unzip

#### Example

```ts
const x = Some(1);
const y = Some('hello');
console.log(x.zip(y).unwrap()); // [1, 'hello']

const z = None;
console.log(x.zip(z).isNone()); // true
```

***

### zipWith()

```ts
zipWith<U, R>(other, fn): Option<R>;
```

Defined in: [core.ts:306](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L306)

Zips `this` with another `Option` using a provided function to combine their contained values.
If `this` is `Some(s)` and `other` is `Some(o)`, returns `Some(fn(s, o))`.
If either `this` or `other` is `None`, returns `None`.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `U` | The type of the value in the other `Option`. |
| `R` | The return type of the combining function. |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | `Option`\<`U`\> | The other `Option` to zip with. |
| `fn` | (`value`, `otherValue`) => `R` | The function to combine the values from both `Options`. |

#### Returns

`Option`\<`R`\>

An `Option` containing the result of `fn` if both `Options` are `Some`, otherwise `None`.

#### See

zip

#### Example

```ts
const x = Some(2);
const y = Some(3);
console.log(x.zipWith(y, (a, b) => a * b).unwrap()); // 6
```
