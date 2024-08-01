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

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | The type of the value contained in a successful `Result`. |
| `E` | The type of the error contained in an unsuccessful `Result`. |

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `[toStringTag]` | `"Result"` | [object Result]. | [core.ts:304](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L304) |

## Methods

### and()

```ts
and<U>(other): Result<U, E>
```

Returns `this` if the result is `Err`, otherwise returns the passed `Result`.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `U` | The type of the value in the other `Result`. |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | [`Result`](Result.md)\<`U`, `E`\> | The `Result` to return if `this` is `Ok`. |

#### Returns

[`Result`](Result.md)\<`U`, `E`\>

The passed `Result` if `this` is `Ok`, otherwise returns `this` (which is `Err`).

#### Defined in

[core.ts:489](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L489)

***

### andThen()

```ts
andThen<U>(fn): Result<U, E>
```

Calls the provided function with the contained value if `this` is `Ok`, otherwise returns `this` as `Err`.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `U` | The type of the value returned by the function. |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | (`value`) => [`Result`](Result.md)\<`U`, `E`\> | A function that takes the `Ok` value and returns a `Result`. |

#### Returns

[`Result`](Result.md)\<`U`, `E`\>

The result of `fn` if `this` is `Ok`, otherwise `this` as `Err`.

#### Defined in

[core.ts:505](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L505)

***

### asErr()

```ts
asErr<U>(): Result<U, E>
```

Transforms the current Result into a new Result where the type of the success result is replaced with a new type `U`.
The type of the error result remains unchanged.
Useful where you need to return an Error chained to another type.
Just same as `result as unknown as Result<U, E>`.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `U` | The new type for the success result. |

#### Returns

[`Result`](Result.md)\<`U`, `E`\>

`this` but the success result type is `U`.

#### Defined in

[core.ts:563](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L563)

***

### asOk()

```ts
asOk<F>(): Result<T, F>
```

Transforms the current Result into a new Result where the type of the error result is replaced with a new type `F`.
The type of the success result remains unchanged.
Just same as `result as unknown as Result<T, F>`.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `F` | The new type for the error result. |

#### Returns

[`Result`](Result.md)\<`T`, `F`\>

`this` but the error result type is `F`.

#### Defined in

[core.ts:552](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L552)

***

### eq()

```ts
eq(other): boolean
```

Tests whether `this` and `other` are both `Ok` containing equal values, or both are `Err` containing equal errors.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | [`Result`](Result.md)\<`T`, `E`\> | The other `Result` to compare with. |

#### Returns

`boolean`

`true` if `this` and `other` are both `Ok` with equal values, or both are `Err` with equal errors, otherwise `false`.

#### Defined in

[core.ts:540](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L540)

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

#### Defined in

[core.ts:413](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L413)

***

### expect()

```ts
expect(msg): T
```

Returns the contained `Ok` value, with a provided error message if the result is `Err`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `msg` | `string` | The error message to provide if the result is an `Err`. |

#### Returns

`T`

#### Throws

Throws an error with the provided message if the result is an `Err`.

#### Defined in

[core.ts:356](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L356)

***

### expectErr()

```ts
expectErr(msg): E
```

Returns the contained `Err` value, with a provided error message if the result is `Ok`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `msg` | `string` | The error message to provide if the result is an `Ok`. |

#### Returns

`E`

#### Throws

Throws an error with the provided message if the result is an `Ok`.

#### Defined in

[core.ts:385](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L385)

***

### flatten()

```ts
flatten<T>(this): Result<T, E>
```

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
| `this` | [`Result`](Result.md)\<[`Result`](Result.md)\<`T`, `E`\>, `E`\> |

#### Returns

[`Result`](Result.md)\<`T`, `E`\>

#### Defined in

[core.ts:473](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L473)

***

### inspect()

```ts
inspect(fn): this
```

Calls the provided function with the contained value if `this` is `Ok`, for side effects only.
Does not modify the `Result`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | (`value`) => `void` | A function to call with the `Ok` value. |

#### Returns

`this`

`this`, unmodified.

#### Defined in

[core.ts:523](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L523)

***

### inspectErr()

```ts
inspectErr(fn): this
```

Calls the provided function with the contained error if `this` is `Err`, for side effects only.
Does not modify the `Result`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | (`error`) => `void` | A function to call with the `Err` value. |

#### Returns

`this`

`this`, unmodified.

#### Defined in

[core.ts:531](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L531)

***

### isErr()

```ts
isErr(): boolean
```

Returns `true` if the result is `Err`.

#### Returns

`boolean`

#### Defined in

[core.ts:329](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L329)

***

### isErrAnd()

```ts
isErrAnd(predicate): boolean
```

Returns `true` if the result is `Err` and the provided predicate returns `true` for the contained error.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `predicate` | (`error`) => `boolean` | A function that takes the `Err` value and returns a boolean. |

#### Returns

`boolean`

#### Defined in

[core.ts:341](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L341)

***

### isOk()

```ts
isOk(): boolean
```

Returns `true` if the result is `Ok`.

#### Returns

`boolean`

#### Defined in

[core.ts:324](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L324)

***

### isOkAnd()

```ts
isOkAnd(predicate): boolean
```

Returns `true` if the result is `Ok` and the provided predicate returns `true` for the contained value.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `predicate` | (`value`) => `boolean` | A function that takes the `Ok` value and returns a boolean. |

#### Returns

`boolean`

#### Defined in

[core.ts:335](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L335)

***

### map()

```ts
map<U>(fn): Result<U, E>
```

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

[`Result`](Result.md)\<`U`, `E`\>

#### Defined in

[core.ts:434](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L434)

***

### mapErr()

```ts
mapErr<F>(fn): Result<T, F>
```

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

[`Result`](Result.md)\<`T`, `F`\>

#### Defined in

[core.ts:446](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L446)

***

### mapOr()

```ts
mapOr<U>(defaultValue, fn): U
```

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

#### Defined in

[core.ts:458](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L458)

***

### mapOrElse()

```ts
mapOrElse<U>(defaultFn, fn): U
```

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

#### Defined in

[core.ts:466](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L466)

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

#### Defined in

[core.ts:406](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L406)

***

### or()

```ts
or<F>(other): Result<T, F>
```

Returns `this` if it is `Ok`, otherwise returns the passed `Result`.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `F` | The type of the error in the other `Result`. |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | [`Result`](Result.md)\<`T`, `F`\> | The `Result` to return if `this` is `Err`. |

#### Returns

[`Result`](Result.md)\<`T`, `F`\>

`this` if it is `Ok`, otherwise returns `other`.

#### Defined in

[core.ts:497](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L497)

***

### orElse()

```ts
orElse<F>(fn): Result<T, F>
```

Calls the provided function with the contained error if `this` is `Err`, otherwise returns `this` as `Ok`.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `F` | The type of the error returned by the function. |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | (`error`) => [`Result`](Result.md)\<`T`, `F`\> | A function that takes the `Err` value and returns a `Result`. |

#### Returns

[`Result`](Result.md)\<`T`, `F`\>

The result of `fn` if `this` is `Err`, otherwise `this` as `Ok`.

#### Defined in

[core.ts:513](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L513)

***

### toString()

```ts
toString(): string
```

Custom `toString` implementation that uses the `Result`'s contained value.

#### Returns

`string`

#### Defined in

[core.ts:568](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L568)

***

### transpose()

```ts
transpose<T>(this): Option<Result<T, E>>
```

Transposes a `Result` of an `Option` into an `Option` of a `Result`.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | The type of the success value in the `Ok` variant of the `Option`. |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `this` | [`Result`](Result.md)\<[`Option`](Option.md)\<`T`\>, `E`\> |

#### Returns

[`Option`](Option.md)\<[`Result`](Result.md)\<`T`, `E`\>\>

`Some` containing `Ok` if the result is `Ok` containing `Some`,
         `Some` containing `Err` if the result is `Err`,
         `None` if the result is `Ok` containing `None`.

#### Defined in

[core.ts:422](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L422)

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

#### Defined in

[core.ts:362](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L362)

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

#### Defined in

[core.ts:391](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L391)

***

### unwrapOr()

```ts
unwrapOr(defaultValue): T
```

Returns the contained `Ok` value or a provided default.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `defaultValue` | `T` | The value to return if the result is an `Err`. |

#### Returns

`T`

#### Defined in

[core.ts:368](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L368)

***

### unwrapOrElse()

```ts
unwrapOrElse(fn): T
```

Returns the contained `Ok` value or computes it from a closure if the result is `Err`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | (`error`) => `T` | A function that takes the `Err` value and returns an `Ok` value. |

#### Returns

`T`

#### Defined in

[core.ts:374](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/core.ts#L374)
