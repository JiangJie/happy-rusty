[**happy-rusty**](../README.md) • **Docs**

***

[happy-rusty](../README.md) / Option

# Interface: Option\<T\>

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

## Type parameters

| Type parameter | Description |
| :------ | :------ |
| `T` | The type of the value contained in the `Some` variant. |

## Properties

| Property | Modifier | Type | Description |
| :------ | :------ | :------ | :------ |
| `[optionKindSymbol]` | `private` | `"Some"` \| `"None"` | Identify `Some` or `None`. |

## Methods

### and()

```ts
and<U>(other): Option<U>
```

Returns `None` if the Option is `None`, otherwise returns `other`.
This is sometimes called "and then" because it is similar to a logical AND operation.

#### Type parameters

| Type parameter | Description |
| :------ | :------ |
| `U` | The type of the value in the other `Option`. |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `other` | [`Option`](Option.md)\<`U`\> | The `Option` to return if `this` is `Some`. |

#### Returns

[`Option`](Option.md)\<`U`\>

`None` if `this` is `None`, otherwise returns `other`.

#### Source

[enum/prelude.ts:224](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L224)

***

### andThen()

```ts
andThen<U>(fn): Option<U>
```

Returns `None` if the Option is `None`, otherwise calls `fn` with the wrapped value and returns the result.
This function can be used for control flow based on `Option` values.

#### Type parameters

| Type parameter | Description |
| :------ | :------ |
| `U` | The type of the value returned by the function. |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `fn` | (`value`) => [`Option`](Option.md)\<`U`\> | A function that takes the contained value and returns an `Option`. |

#### Returns

[`Option`](Option.md)\<`U`\>

The result of `fn` if `this` is `Some`, otherwise `None`.

#### Source

[enum/prelude.ts:233](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L233)

***

### eq()

```ts
eq(other): boolean
```

Tests whether `this` and `other` are both `Some` containing equal values, or both are `None`.
This method can be used for comparing `Option` instances in a value-sensitive manner.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `other` | [`Option`](Option.md)\<`T`\> | The other `Option` to compare with. |

#### Returns

`boolean`

`true` if `this` and `other` are both `Some` with equal values, or both are `None`, otherwise `false`.

#### Source

[enum/prelude.ts:277](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L277)

***

### expect()

```ts
expect(msg): T
```

Returns the contained `Some` value, with a provided error message if the value is a `None`.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `msg` | `string` | The error message to provide if the value is a `None`. |

#### Returns

`T`

#### Throws

Throws an error with the provided message if the Option is a `None`.

#### Source

[enum/prelude.ts:80](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L80)

***

### filter()

```ts
filter(predicate): Option<T>
```

Returns `None` if the Option is `None`, otherwise calls predicate with the wrapped value and returns:
- `Some(t)` if predicate returns `true` (where `t` is the wrapped value), and
- `None` if predicate returns `false`.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`) => `boolean` | A function that takes the contained value and returns a boolean. |

#### Returns

[`Option`](Option.md)\<`T`\>

#### Source

[enum/prelude.ts:142](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L142)

***

### flatten()

```ts
flatten<T>(this): Option<T>
```

Converts from `Option<Option<T>>` to `Option<T>`.

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `this` | [`Option`](Option.md)\<[`Option`](Option.md)\<`T`\>\> |

#### Returns

[`Option`](Option.md)\<`T`\>

`None` if the Option is `None`, otherwise returns the contained `Option`.

#### Source

[enum/prelude.ts:148](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L148)

***

### inspect()

```ts
inspect(fn): this
```

Calls the provided function with the contained value if `this` is `Some`.
This is primarily for side effects and does not transform the `Option`.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `fn` | (`value`) => `void` | A function to call with the contained value. |

#### Returns

`this`

`this`, unmodified, for chaining additional methods.

#### Source

[enum/prelude.ts:267](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L267)

***

### isNone()

```ts
isNone(): boolean
```

Returns `true` if the Option is a `None` value.

#### Returns

`boolean`

#### Source

[enum/prelude.ts:59](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L59)

***

### isSome()

```ts
isSome(): boolean
```

Returns `true` if the Option is a `Some` value.

#### Returns

`boolean`

#### Source

[enum/prelude.ts:54](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L54)

***

### isSomeAnd()

```ts
isSomeAnd(predicate): boolean
```

Returns `true` if the Option is a `Some` value and the predicate returns `true` for the contained value.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`) => `boolean` | A function that takes the contained value and returns a boolean. |

#### Returns

`boolean`

#### Source

[enum/prelude.ts:65](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L65)

***

### map()

```ts
map<U>(fn): Option<U>
```

Maps an `Option<T>` to `Option<U>` by applying a function to a contained value.

#### Type parameters

| Type parameter | Description |
| :------ | :------ |
| `U` | The type of the value returned by the map function. |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `fn` | (`value`) => `U` | A function that takes the contained value and returns a new value. |

#### Returns

[`Option`](Option.md)\<`U`\>

#### Source

[enum/prelude.ts:155](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L155)

***

### mapOr()

```ts
mapOr<U>(defaultValue, fn): U
```

Maps an `Option<T>` to `U` by applying a function to the contained value (if any), or returns the provided default (if not).

#### Type parameters

| Type parameter | Description |
| :------ | :------ |
| `U` | The type of the value returned by the map function or the default value. |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `defaultValue` | `U` | The value to return if the Option is `None`. |
| `fn` | (`value`) => `U` | A function that takes the contained value and returns a new value. |

#### Returns

`U`

#### Source

[enum/prelude.ts:163](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L163)

***

### mapOrElse()

```ts
mapOrElse<U>(defaultFn, fn): U
```

Maps an `Option<T>` to `U` by applying a function to a contained value (if any), or computes a default (if not).

#### Type parameters

| Type parameter | Description |
| :------ | :------ |
| `U` | The type of the value returned by the map function or the default function. |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `defaultFn` | () => `U` | A function that returns the default value. |
| `fn` | (`value`) => `U` | A function that takes the contained value and returns a new value. |

#### Returns

`U`

#### Source

[enum/prelude.ts:171](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L171)

***

### okOr()

```ts
okOr<E>(error): Result<T, E>
```

Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and `None` to `Err(err)`.

#### Type parameters

| Type parameter | Description |
| :------ | :------ |
| `E` | The type of the error value in the `Err` variant of the resulting `Result`. |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `error` | `E` | The error value to use if the Option is a `None`. |

#### Returns

[`Result`](Result.md)\<`T`, `E`\>

#### Source

[enum/prelude.ts:113](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L113)

***

### okOrElse()

```ts
okOrElse<E>(err): Result<T, E>
```

Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and `None` to `Err(err())`.

#### Type parameters

| Type parameter | Description |
| :------ | :------ |
| `E` | The type of the error value in the `Err` variant of the resulting `Result`. |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `err` | () => `E` | A function that returns the error value. |

#### Returns

[`Result`](Result.md)\<`T`, `E`\>

#### Source

[enum/prelude.ts:120](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L120)

***

### or()

```ts
or(other): Option<T>
```

Returns the Option if it contains a value, otherwise returns `other`.
This can be used for providing a fallback `Option`.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `other` | [`Option`](Option.md)\<`T`\> | The fallback `Option` to use if `this` is `None`. |

#### Returns

[`Option`](Option.md)\<`T`\>

`this` if it is `Some`, otherwise `other`.

#### Source

[enum/prelude.ts:241](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L241)

***

### orElse()

```ts
orElse(fn): Option<T>
```

Returns the Option if it contains a value, otherwise calls `fn` and returns the result.
This method can be used for lazy fallbacks, as `fn` is only evaluated if `this` is `None`.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `fn` | () => [`Option`](Option.md)\<`T`\> | A function that produces an `Option`. |

#### Returns

[`Option`](Option.md)\<`T`\>

`this` if it is `Some`, otherwise the result of `fn`.

#### Source

[enum/prelude.ts:249](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L249)

***

### transpose()

```ts
transpose<T, E>(this): Result<Option<T>, E>
```

Transposes an `Option` of a `Result` into a `Result` of an `Option`.

#### Type parameters

| Type parameter | Description |
| :------ | :------ |
| `T` | The type of the success value in the `Ok` variant of the `Result`. |
| `E` | The type of the error value in the `Err` variant of the `Result`. |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `this` | [`Option`](Option.md)\<[`Result`](Result.md)\<`T`, `E`\>\> |

#### Returns

[`Result`](Result.md)\<[`Option`](Option.md)\<`T`\>, `E`\>

`Ok` containing `Some` if the Option is a `Some` containing `Ok`,
         `Err` containing the error if the Option is a `Some` containing `Err`,
         `Ok` containing `None` if the Option is `None`.

#### Source

[enum/prelude.ts:130](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L130)

***

### unwrap()

```ts
unwrap(): T
```

Returns the contained `Some` value.

#### Returns

`T`

#### Throws

Throws an error if the value is a `None`.

#### Source

[enum/prelude.ts:86](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L86)

***

### unwrapOr()

```ts
unwrapOr(defaultValue): T
```

Returns the contained `Some` value or a provided default.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `defaultValue` | `T` | The value to return if the Option is a `None`. |

#### Returns

`T`

#### Source

[enum/prelude.ts:92](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L92)

***

### unwrapOrElse()

```ts
unwrapOrElse(fn): T
```

Returns the contained `Some` value or computes it from a closure.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `fn` | () => `T` | A function that returns the default value. |

#### Returns

`T`

#### Source

[enum/prelude.ts:98](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L98)

***

### unzip()

```ts
unzip<T, U>(this): [Option<T>, Option<U>]
```

Converts from `Option<[T, U]>` to `[Option<T>, Option<U>]`.
If `this` is `Some([a, b])`, returns `[Some(a), Some(b)]`.
If `this` is `None`, returns `[None, None]`.

#### Type parameters

| Type parameter | Description |
| :------ | :------ |
| `T` | The type of the first value in the tuple. |
| `U` | The type of the second value in the tuple. |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `this` | [`Option`](Option.md)\<[`T`, `U`]\> |

#### Returns

[[`Option`](Option.md)\<`T`\>, [`Option`](Option.md)\<`U`\>]

A tuple of `Options`, one for each element in the original `Option` of a tuple.

#### Source

[enum/prelude.ts:207](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L207)

***

### xor()

```ts
xor(other): Option<T>
```

Returns `Some` if exactly one of `this`, `other` is `Some`, otherwise returns `None`.
This can be thought of as an exclusive or operation on `Option` values.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `other` | [`Option`](Option.md)\<`T`\> | The other `Option` to compare with. |

#### Returns

[`Option`](Option.md)\<`T`\>

`Some` if exactly one of `this` and `other` is `Some`, otherwise `None`.

#### Source

[enum/prelude.ts:257](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L257)

***

### zip()

```ts
zip<U>(other): Option<[T, U]>
```

Combines `this` with another `Option` by zipping their contained values.
If `this` is `Some(s)` and `other` is `Some(o)`, returns `Some([s, o])`.
If either `this` or `other` is `None`, returns `None`.

#### Type parameters

| Type parameter | Description |
| :------ | :------ |
| `U` | The type of the value in the other `Option`. |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `other` | [`Option`](Option.md)\<`U`\> | The other `Option` to zip with. |

#### Returns

[`Option`](Option.md)\<[`T`, `U`]\>

An `Option` containing a tuple of the values if both are `Some`, otherwise `None`.

#### Source

[enum/prelude.ts:185](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L185)

***

### zipWith()

```ts
zipWith<U, R>(other, fn): Option<R>
```

Zips `this` with another `Option` using a provided function to combine their contained values.
If `this` is `Some(s)` and `other` is `Some(o)`, returns `Some(fn(s, o))`.
If either `this` or `other` is `None`, returns `None`.

#### Type parameters

| Type parameter | Description |
| :------ | :------ |
| `U` | The type of the value in the other `Option`. |
| `R` | The return type of the combining function. |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `other` | [`Option`](Option.md)\<`U`\> | The other `Option` to zip with. |
| `fn` | (`value`, `otherValue`) => `R` | The function to combine the values from both `Options`. |

#### Returns

[`Option`](Option.md)\<`R`\>

An `Option` containing the result of `fn` if both `Options` are `Some`, otherwise `None`.

#### Source

[enum/prelude.ts:197](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L197)
