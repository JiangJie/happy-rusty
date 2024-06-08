[**happy-rusty**](../index.md) • **Docs**

***

[happy-rusty](../index.md) / Option

# Interface: Option\<T\>

option::Option type

Type `Option` represents an optional value: every `Option` is either `Some` and contains a value, or `None`, and does not.
This interface includes methods that act on the `Option` type, similar to Rust's `Option` enum.

As Rust Code:
```rust
pub enum Option<T> {
   None,
   Some(T),
}
```

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

[enum/prelude.ts:227](https://github.com/JiangJie/happy-rusty/blob/4e351bc0f871ad0e25514a05e881fc61245e329e/src/enum/prelude.ts#L227)

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

[enum/prelude.ts:236](https://github.com/JiangJie/happy-rusty/blob/4e351bc0f871ad0e25514a05e881fc61245e329e/src/enum/prelude.ts#L236)

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

[enum/prelude.ts:280](https://github.com/JiangJie/happy-rusty/blob/4e351bc0f871ad0e25514a05e881fc61245e329e/src/enum/prelude.ts#L280)

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

[enum/prelude.ts:83](https://github.com/JiangJie/happy-rusty/blob/4e351bc0f871ad0e25514a05e881fc61245e329e/src/enum/prelude.ts#L83)

***

### filter()

```ts
filter(predicate): this
```

Returns `None` if the Option is `None`, otherwise calls predicate with the wrapped value and returns:
- `Some(t)` if predicate returns `true` (where `t` is the wrapped value), and
- `None` if predicate returns `false`.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`) => `boolean` | A function that takes the contained value and returns a boolean. |

#### Returns

`this`

#### Source

[enum/prelude.ts:145](https://github.com/JiangJie/happy-rusty/blob/4e351bc0f871ad0e25514a05e881fc61245e329e/src/enum/prelude.ts#L145)

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

[enum/prelude.ts:151](https://github.com/JiangJie/happy-rusty/blob/4e351bc0f871ad0e25514a05e881fc61245e329e/src/enum/prelude.ts#L151)

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

[enum/prelude.ts:270](https://github.com/JiangJie/happy-rusty/blob/4e351bc0f871ad0e25514a05e881fc61245e329e/src/enum/prelude.ts#L270)

***

### isNone()

```ts
isNone(): boolean
```

Returns `true` if the Option is a `None` value.

#### Returns

`boolean`

#### Source

[enum/prelude.ts:62](https://github.com/JiangJie/happy-rusty/blob/4e351bc0f871ad0e25514a05e881fc61245e329e/src/enum/prelude.ts#L62)

***

### isSome()

```ts
isSome(): boolean
```

Returns `true` if the Option is a `Some` value.

#### Returns

`boolean`

#### Source

[enum/prelude.ts:57](https://github.com/JiangJie/happy-rusty/blob/4e351bc0f871ad0e25514a05e881fc61245e329e/src/enum/prelude.ts#L57)

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

[enum/prelude.ts:68](https://github.com/JiangJie/happy-rusty/blob/4e351bc0f871ad0e25514a05e881fc61245e329e/src/enum/prelude.ts#L68)

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

[enum/prelude.ts:158](https://github.com/JiangJie/happy-rusty/blob/4e351bc0f871ad0e25514a05e881fc61245e329e/src/enum/prelude.ts#L158)

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

[enum/prelude.ts:166](https://github.com/JiangJie/happy-rusty/blob/4e351bc0f871ad0e25514a05e881fc61245e329e/src/enum/prelude.ts#L166)

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

[enum/prelude.ts:174](https://github.com/JiangJie/happy-rusty/blob/4e351bc0f871ad0e25514a05e881fc61245e329e/src/enum/prelude.ts#L174)

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

[enum/prelude.ts:116](https://github.com/JiangJie/happy-rusty/blob/4e351bc0f871ad0e25514a05e881fc61245e329e/src/enum/prelude.ts#L116)

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

[enum/prelude.ts:123](https://github.com/JiangJie/happy-rusty/blob/4e351bc0f871ad0e25514a05e881fc61245e329e/src/enum/prelude.ts#L123)

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

[enum/prelude.ts:244](https://github.com/JiangJie/happy-rusty/blob/4e351bc0f871ad0e25514a05e881fc61245e329e/src/enum/prelude.ts#L244)

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

[enum/prelude.ts:252](https://github.com/JiangJie/happy-rusty/blob/4e351bc0f871ad0e25514a05e881fc61245e329e/src/enum/prelude.ts#L252)

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

[enum/prelude.ts:133](https://github.com/JiangJie/happy-rusty/blob/4e351bc0f871ad0e25514a05e881fc61245e329e/src/enum/prelude.ts#L133)

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

[enum/prelude.ts:89](https://github.com/JiangJie/happy-rusty/blob/4e351bc0f871ad0e25514a05e881fc61245e329e/src/enum/prelude.ts#L89)

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

[enum/prelude.ts:95](https://github.com/JiangJie/happy-rusty/blob/4e351bc0f871ad0e25514a05e881fc61245e329e/src/enum/prelude.ts#L95)

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

[enum/prelude.ts:101](https://github.com/JiangJie/happy-rusty/blob/4e351bc0f871ad0e25514a05e881fc61245e329e/src/enum/prelude.ts#L101)

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

[enum/prelude.ts:210](https://github.com/JiangJie/happy-rusty/blob/4e351bc0f871ad0e25514a05e881fc61245e329e/src/enum/prelude.ts#L210)

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

[enum/prelude.ts:260](https://github.com/JiangJie/happy-rusty/blob/4e351bc0f871ad0e25514a05e881fc61245e329e/src/enum/prelude.ts#L260)

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

[enum/prelude.ts:188](https://github.com/JiangJie/happy-rusty/blob/4e351bc0f871ad0e25514a05e881fc61245e329e/src/enum/prelude.ts#L188)

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

[enum/prelude.ts:200](https://github.com/JiangJie/happy-rusty/blob/4e351bc0f871ad0e25514a05e881fc61245e329e/src/enum/prelude.ts#L200)
