[**happy-rusty**](../README.md) • **Docs**

***

[happy-rusty](../README.md) / Result

# Interface: Result\<T, E\>

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

## Type parameters

| Type parameter | Description |
| :------ | :------ |
| `T` | The type of the value contained in a successful `Result`. |
| `E` | The type of the error contained in an unsuccessful `Result`. |

## Properties

| Property | Modifier | Type | Description |
| :------ | :------ | :------ | :------ |
| `[resultKindSymbol]` | `private` | `"Ok"` \| `"Err"` | Identify `Ok` or `Err`. |

## Methods

### and()

```ts
and<U>(other): Result<U, E>
```

Returns `this` if the result is `Err`, otherwise returns the passed `Result`.

#### Type parameters

| Type parameter | Description |
| :------ | :------ |
| `U` | The type of the value in the other `Result`. |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `other` | [`Result`](Result.md)\<`U`, `E`\> | The `Result` to return if `this` is `Ok`. |

#### Returns

[`Result`](Result.md)\<`U`, `E`\>

The passed `Result` if `this` is `Ok`, otherwise returns `this` (which is `Err`).

#### Source

[enum/prelude.ts:518](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L518)

***

### andThen()

```ts
andThen<U>(fn): Result<U, E>
```

Calls the provided function with the contained value if `this` is `Ok`, otherwise returns `this` as `Err`.

#### Type parameters

| Type parameter | Description |
| :------ | :------ |
| `U` | The type of the value returned by the function. |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `fn` | (`value`) => [`Result`](Result.md)\<`U`, `E`\> | A function that takes the `Ok` value and returns a `Result`. |

#### Returns

[`Result`](Result.md)\<`U`, `E`\>

The result of `fn` if `this` is `Ok`, otherwise `this` as `Err`.

#### Source

[enum/prelude.ts:534](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L534)

***

### eq()

```ts
eq(other): boolean
```

Tests whether `this` and `other` are both `Ok` containing equal values, or both are `Err` containing equal errors.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `other` | [`Result`](Result.md)\<`T`, `E`\> | The other `Result` to compare with. |

#### Returns

`boolean`

`true` if `this` and `other` are both `Ok` with equal values, or both are `Err` with equal errors, otherwise `false`.

#### Source

[enum/prelude.ts:569](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L569)

***

### err()

```ts
err(): Option<E>
```

Converts from `Result<T, E>` to `Option<E>`.
If the result is `Err`, returns `Some(E)`.
If the result is `Ok`, returns `None`.

#### Returns

[`Option`](Option.md)\<`E`\>

#### Source

[enum/prelude.ts:442](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L442)

***

### expect()

```ts
expect(msg): T
```

Returns the contained `Ok` value, with a provided error message if the result is `Err`.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `msg` | `string` | The error message to provide if the result is an `Err`. |

#### Returns

`T`

#### Throws

Throws an error with the provided message if the result is an `Err`.

#### Source

[enum/prelude.ts:385](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L385)

***

### expectErr()

```ts
expectErr(msg): E
```

Returns the contained `Err` value, with a provided error message if the result is `Ok`.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `msg` | `string` | The error message to provide if the result is an `Ok`. |

#### Returns

`E`

#### Throws

Throws an error with the provided message if the result is an `Ok`.

#### Source

[enum/prelude.ts:414](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L414)

***

### flatten()

```ts
flatten<T>(this): Result<T, E>
```

Converts from `Result<Result<T, E>, E>` to `Result<T, E>`.
If the result is `Ok(Ok(T))`, returns `Ok(T)`.
If the result is `Ok(Err(E))` or `Err(E)`, returns `Err(E)`.

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `this` | [`Result`](Result.md)\<[`Result`](Result.md)\<`T`, `E`\>, `E`\> |

#### Returns

[`Result`](Result.md)\<`T`, `E`\>

#### Source

[enum/prelude.ts:502](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L502)

***

### inspect()

```ts
inspect(fn): this
```

Calls the provided function with the contained value if `this` is `Ok`, for side effects only.
Does not modify the `Result`.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `fn` | (`value`) => `void` | A function to call with the `Ok` value. |

#### Returns

`this`

`this`, unmodified.

#### Source

[enum/prelude.ts:552](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L552)

***

### inspectErr()

```ts
inspectErr(fn): this
```

Calls the provided function with the contained error if `this` is `Err`, for side effects only.
Does not modify the `Result`.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `fn` | (`error`) => `void` | A function to call with the `Err` value. |

#### Returns

`this`

`this`, unmodified.

#### Source

[enum/prelude.ts:560](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L560)

***

### isErr()

```ts
isErr(): boolean
```

Returns `true` if the result is `Err`.

#### Returns

`boolean`

#### Source

[enum/prelude.ts:358](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L358)

***

### isErrAnd()

```ts
isErrAnd(predicate): boolean
```

Returns `true` if the result is `Err` and the provided predicate returns `true` for the contained error.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`error`) => `boolean` | A function that takes the `Err` value and returns a boolean. |

#### Returns

`boolean`

#### Source

[enum/prelude.ts:370](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L370)

***

### isOk()

```ts
isOk(): boolean
```

Returns `true` if the result is `Ok`.

#### Returns

`boolean`

#### Source

[enum/prelude.ts:353](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L353)

***

### isOkAnd()

```ts
isOkAnd(predicate): boolean
```

Returns `true` if the result is `Ok` and the provided predicate returns `true` for the contained value.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`) => `boolean` | A function that takes the `Ok` value and returns a boolean. |

#### Returns

`boolean`

#### Source

[enum/prelude.ts:364](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L364)

***

### map()

```ts
map<U>(fn): Result<U, E>
```

Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `Ok` value,
leaving an `Err` value untouched.

#### Type parameters

| Type parameter | Description |
| :------ | :------ |
| `U` | The type of the value returned by the map function. |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `fn` | (`value`) => `U` | A function that takes the `Ok` value and returns a new value. |

#### Returns

[`Result`](Result.md)\<`U`, `E`\>

#### Source

[enum/prelude.ts:463](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L463)

***

### mapErr()

```ts
mapErr<F>(fn): Result<T, F>
```

Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained `Err` value,
leaving an `Ok` value untouched.

#### Type parameters

| Type parameter | Description |
| :------ | :------ |
| `F` | The type of the error returned by the map function. |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `fn` | (`error`) => `F` | A function that takes the `Err` value and returns a new error value. |

#### Returns

[`Result`](Result.md)\<`T`, `F`\>

#### Source

[enum/prelude.ts:475](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L475)

***

### mapOr()

```ts
mapOr<U>(defaultValue, fn): U
```

Maps a `Result<T, E>` to `U` by applying a function to the contained `Ok` value (if `Ok`), or returns the provided default (if `Err`).

#### Type parameters

| Type parameter | Description |
| :------ | :------ |
| `U` | The type of the value returned by the map function or the default value. |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `defaultValue` | `U` | The value to return if the result is `Err`. |
| `fn` | (`value`) => `U` | A function that takes the `Ok` value and returns a new value. |

#### Returns

`U`

#### Source

[enum/prelude.ts:487](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L487)

***

### mapOrElse()

```ts
mapOrElse<U>(defaultFn, fn): U
```

Maps a `Result<T, E>` to `U` by applying a function to the contained `Ok` value (if `Ok`), or computes a default (if `Err`).

#### Type parameters

| Type parameter | Description |
| :------ | :------ |
| `U` | The type of the value returned by the map function or the default function. |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `defaultFn` | (`error`) => `U` | A function that returns the default value. |
| `fn` | (`value`) => `U` | A function that takes the `Ok` value and returns a new value. |

#### Returns

`U`

#### Source

[enum/prelude.ts:495](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L495)

***

### ok()

```ts
ok(): Option<T>
```

Converts from `Result<T, E>` to `Option<T>`.
If the result is `Ok`, returns `Some(T)`.
If the result is `Err`, returns `None`.

#### Returns

[`Option`](Option.md)\<`T`\>

#### Source

[enum/prelude.ts:435](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L435)

***

### or()

```ts
or<F>(other): Result<T, F>
```

Returns `this` if it is `Ok`, otherwise returns the passed `Result`.

#### Type parameters

| Type parameter | Description |
| :------ | :------ |
| `F` | The type of the error in the other `Result`. |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `other` | [`Result`](Result.md)\<`T`, `F`\> | The `Result` to return if `this` is `Err`. |

#### Returns

[`Result`](Result.md)\<`T`, `F`\>

`this` if it is `Ok`, otherwise returns `other`.

#### Source

[enum/prelude.ts:526](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L526)

***

### orElse()

```ts
orElse<F>(fn): Result<T, F>
```

Calls the provided function with the contained error if `this` is `Err`, otherwise returns `this` as `Ok`.

#### Type parameters

| Type parameter | Description |
| :------ | :------ |
| `F` | The type of the error returned by the function. |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `fn` | (`error`) => [`Result`](Result.md)\<`T`, `F`\> | A function that takes the `Err` value and returns a `Result`. |

#### Returns

[`Result`](Result.md)\<`T`, `F`\>

The result of `fn` if `this` is `Err`, otherwise `this` as `Ok`.

#### Source

[enum/prelude.ts:542](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L542)

***

### transpose()

```ts
transpose<T>(this): Option<Result<T, E>>
```

Transposes a `Result` of an `Option` into an `Option` of a `Result`.

#### Type parameters

| Type parameter | Description |
| :------ | :------ |
| `T` | The type of the success value in the `Ok` variant of the `Option`. |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `this` | [`Result`](Result.md)\<[`Option`](Option.md)\<`T`\>, `E`\> |

#### Returns

[`Option`](Option.md)\<[`Result`](Result.md)\<`T`, `E`\>\>

`Some` containing `Ok` if the result is `Ok` containing `Some`,
         `Some` containing `Err` if the result is `Err`,
         `None` if the result is `Ok` containing `None`.

#### Source

[enum/prelude.ts:451](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L451)

***

### unwrap()

```ts
unwrap(): T
```

Returns the contained `Ok` value.

#### Returns

`T`

#### Throws

Throws an error if the result is an `Err`.

#### Source

[enum/prelude.ts:391](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L391)

***

### unwrapErr()

```ts
unwrapErr(): E
```

Returns the contained `Err` value.

#### Returns

`E`

#### Throws

Throws an error if the result is an `Ok`.

#### Source

[enum/prelude.ts:420](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L420)

***

### unwrapOr()

```ts
unwrapOr(defaultValue): T
```

Returns the contained `Ok` value or a provided default.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `defaultValue` | `T` | The value to return if the result is an `Err`. |

#### Returns

`T`

#### Source

[enum/prelude.ts:397](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L397)

***

### unwrapOrElse()

```ts
unwrapOrElse(fn): T
```

Returns the contained `Ok` value or computes it from a closure if the result is `Err`.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `fn` | (`error`) => `T` | A function that takes the `Err` value and returns an `Ok` value. |

#### Returns

`T`

#### Source

[enum/prelude.ts:403](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L403)
