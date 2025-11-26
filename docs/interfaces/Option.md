[**happy-rusty**](../README.md)

***

[happy-rusty](../README.md) / Option

# Interface: Option\<T\>

Defined in: [core.ts:24](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L24)

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

Defined in: [core.ts:232](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L232)

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

***

### andThen()

```ts
andThen<U>(fn): Option<U>;
```

Defined in: [core.ts:241](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L241)

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

***

### andThenAsync()

```ts
andThenAsync<U>(fn): AsyncOption<U>;
```

Defined in: [core.ts:246](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L246)

Asynchronous version of `andThen`.

#### Type Parameters

| Type Parameter |
| ------ |
| `U` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `fn` | (`value`) => [`AsyncOption`](../type-aliases/AsyncOption.md)\<`U`\> |

#### Returns

[`AsyncOption`](../type-aliases/AsyncOption.md)\<`U`\>

***

### eq()

```ts
eq(other): boolean;
```

Defined in: [core.ts:295](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L295)

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

Defined in: [core.ts:83](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L83)

Returns the contained `Some` value, with a provided error message if the value is a `None`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `msg` | `string` | The error message to provide if the value is a `None`. |

#### Returns

`T`

#### Throws

Throws an error with the provided message if the Option is a `None`.

***

### filter()

```ts
filter(predicate): Option<T>;
```

Defined in: [core.ts:150](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L150)

Returns `None` if the Option is `None`, otherwise calls predicate with the wrapped value and returns:
- `Some(t)` if predicate returns `true` (where `t` is the wrapped value), and
- `None` if predicate returns `false`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `predicate` | (`value`) => `boolean` | A function that takes the contained value and returns a boolean. |

#### Returns

`Option`\<`T`\>

***

### flatten()

```ts
flatten<T>(this): Option<T>;
```

Defined in: [core.ts:156](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L156)

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

***

### inspect()

```ts
inspect(fn): this;
```

Defined in: [core.ts:285](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L285)

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

Defined in: [core.ts:57](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L57)

Returns `true` if the Option is a `None` value.

#### Returns

`boolean`

***

### isSome()

```ts
isSome(): boolean;
```

Defined in: [core.ts:52](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L52)

Returns `true` if the Option is a `Some` value.

#### Returns

`boolean`

***

### isSomeAnd()

```ts
isSomeAnd(predicate): boolean;
```

Defined in: [core.ts:63](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L63)

Returns `true` if the Option is a `Some` value and the predicate returns `true` for the contained value.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `predicate` | (`value`) => `boolean` | A function that takes the contained value and returns a boolean. |

#### Returns

`boolean`

***

### isSomeAndAsync()

```ts
isSomeAndAsync(predicate): Promise<boolean>;
```

Defined in: [core.ts:68](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L68)

Asynchronous version of `isSomeAnd`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | (`value`) => `Promise`\<`boolean`\> |

#### Returns

`Promise`\<`boolean`\>

***

### map()

```ts
map<U>(fn): Option<U>;
```

Defined in: [core.ts:163](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L163)

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

***

### mapOr()

```ts
mapOr<U>(defaultValue, fn): U;
```

Defined in: [core.ts:171](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L171)

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

***

### mapOrElse()

```ts
mapOrElse<U>(defaultFn, fn): U;
```

Defined in: [core.ts:179](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L179)

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

***

### okOr()

```ts
okOr<E>(error): Result<T, E>;
```

Defined in: [core.ts:121](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L121)

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

***

### okOrElse()

```ts
okOrElse<E>(err): Result<T, E>;
```

Defined in: [core.ts:128](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L128)

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

***

### or()

```ts
or(other): Option<T>;
```

Defined in: [core.ts:254](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L254)

Returns the Option if it contains a value, otherwise returns `other`.
This can be used for providing a fallback `Option`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | `Option`\<`T`\> | The fallback `Option` to use if `this` is `None`. |

#### Returns

`Option`\<`T`\>

`this` if it is `Some`, otherwise `other`.

***

### orElse()

```ts
orElse(fn): Option<T>;
```

Defined in: [core.ts:262](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L262)

Returns the Option if it contains a value, otherwise calls `fn` and returns the result.
This method can be used for lazy fallbacks, as `fn` is only evaluated if `this` is `None`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | () => `Option`\<`T`\> | A function that produces an `Option`. |

#### Returns

`Option`\<`T`\>

`this` if it is `Some`, otherwise the result of `fn`.

***

### orElseAsync()

```ts
orElseAsync(fn): AsyncOption<T>;
```

Defined in: [core.ts:267](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L267)

Asynchronous version of `orElse`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `fn` | () => [`AsyncOption`](../type-aliases/AsyncOption.md)\<`T`\> |

#### Returns

[`AsyncOption`](../type-aliases/AsyncOption.md)\<`T`\>

***

### toString()

```ts
toString(): string;
```

Defined in: [core.ts:302](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L302)

Custom `toString` implementation that uses the `Option`'s contained value.

#### Returns

`string`

***

### transpose()

```ts
transpose<T, E>(this): Result<Option<T>, E>;
```

Defined in: [core.ts:138](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L138)

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

***

### unwrap()

```ts
unwrap(): T;
```

Defined in: [core.ts:89](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L89)

Returns the contained `Some` value.

#### Returns

`T`

#### Throws

Throws an error if the value is a `None`.

***

### unwrapOr()

```ts
unwrapOr(defaultValue): T;
```

Defined in: [core.ts:95](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L95)

Returns the contained `Some` value or a provided default.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `defaultValue` | `T` | The value to return if the Option is a `None`. |

#### Returns

`T`

***

### unwrapOrElse()

```ts
unwrapOrElse(fn): T;
```

Defined in: [core.ts:101](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L101)

Returns the contained `Some` value or computes it from a closure.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | () => `T` | A function that returns the default value. |

#### Returns

`T`

***

### unwrapOrElseAsync()

```ts
unwrapOrElseAsync(fn): Promise<T>;
```

Defined in: [core.ts:106](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L106)

Asynchronous version of `unwrapOrElse`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `fn` | () => `Promise`\<`T`\> |

#### Returns

`Promise`\<`T`\>

***

### unzip()

```ts
unzip<T, U>(this): [Option<T>, Option<U>];
```

Defined in: [core.ts:215](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L215)

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

***

### xor()

```ts
xor(other): Option<T>;
```

Defined in: [core.ts:275](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L275)

Returns `Some` if exactly one of `this`, `other` is `Some`, otherwise returns `None`.
This can be thought of as an exclusive or operation on `Option` values.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | `Option`\<`T`\> | The other `Option` to compare with. |

#### Returns

`Option`\<`T`\>

`Some` if exactly one of `this` and `other` is `Some`, otherwise `None`.

***

### zip()

```ts
zip<U>(other): Option<[T, U]>;
```

Defined in: [core.ts:193](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L193)

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

***

### zipWith()

```ts
zipWith<U, R>(other, fn): Option<R>;
```

Defined in: [core.ts:205](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L205)

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
