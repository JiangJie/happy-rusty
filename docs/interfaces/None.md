[**happy-rusty**](../README.md) • **Docs**

***

[happy-rusty](../README.md) / None

# Interface: None

Represents the absence of a value, as a specialized `Option` type.
The type parameter is set to `never` because `None` does not hold a value.

## Extends

- [`Option`](Option.md)\<`never`\>

## Properties

| Property | Modifier | Type | Description | Overrides | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| `[OptionKindSymbol]` | `readonly` | `"None"` | When using `None` alone, the following overrides can make type inference more accurate. | `Option.[OptionKindSymbol]` | [prelude.ts:15](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L15) |

## Methods

### and()

```ts
and<U>(other): None
```

Returns `None` if the Option is `None`, otherwise returns `other`.
This is sometimes called "and then" because it is similar to a logical AND operation.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `U` | The type of the value in the other `Option`. |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | [`Option`](Option.md)\<`U`\> | The `Option` to return if `this` is `Some`. |

#### Returns

[`None`](None.md)

`None` if `this` is `None`, otherwise returns `other`.

#### Overrides

[`Option`](Option.md).[`and`](Option.md#and)

#### Defined in

[prelude.ts:42](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L42)

***

### andThen()

```ts
andThen<U>(fn): None
```

Returns `None` if the Option is `None`, otherwise calls `fn` with the wrapped value and returns the result.
This function can be used for control flow based on `Option` values.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `U` | The type of the value returned by the function. |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | (`value`) => [`Option`](Option.md)\<`U`\> | A function that takes the contained value and returns an `Option`. |

#### Returns

[`None`](None.md)

The result of `fn` if `this` is `Some`, otherwise `None`.

#### Overrides

[`Option`](Option.md).[`andThen`](Option.md#andthen)

#### Defined in

[prelude.ts:43](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L43)

***

### andThenAsync()

```ts
andThenAsync<U>(fn): Promise<None>
```

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

`Promise`\<[`None`](None.md)\>

#### Overrides

[`Option`](Option.md).[`andThenAsync`](Option.md#andthenasync)

#### Defined in

[prelude.ts:44](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L44)

***

### eq()

```ts
eq<T>(other): boolean
```

Tests whether `this` and `other` are both `Some` containing equal values, or both are `None`.
This method can be used for comparing `Option` instances in a value-sensitive manner.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | [`Option`](Option.md)\<`T`\> | The other `Option` to compare with. |

#### Returns

`boolean`

`true` if `this` and `other` are both `Some` with equal values, or both are `None`, otherwise `false`.

#### Overrides

[`Option`](Option.md).[`eq`](Option.md#eq)

#### Defined in

[prelude.ts:52](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L52)

***

### expect()

```ts
expect(msg): never
```

Returns the contained `Some` value, with a provided error message if the value is a `None`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `msg` | `string` | The error message to provide if the value is a `None`. |

#### Returns

`never`

#### Throws

Throws an error with the provided message if the Option is a `None`.

#### Overrides

[`Option`](Option.md).[`expect`](Option.md#expect)

#### Defined in

[prelude.ts:22](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L22)

***

### filter()

```ts
filter(predicate): None
```

Returns `None` if the Option is `None`, otherwise calls predicate with the wrapped value and returns:
- `Some(t)` if predicate returns `true` (where `t` is the wrapped value), and
- `None` if predicate returns `false`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `predicate` | (`value`) => `boolean` | A function that takes the contained value and returns a boolean. |

#### Returns

[`None`](None.md)

#### Overrides

[`Option`](Option.md).[`filter`](Option.md#filter)

#### Defined in

[prelude.ts:32](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L32)

***

### flatten()

```ts
flatten(): None
```

Converts from `Option<Option<T>>` to `Option<T>`.

#### Returns

[`None`](None.md)

`None` if the Option is `None`, otherwise returns the contained `Option`.

#### Overrides

[`Option`](Option.md).[`flatten`](Option.md#flatten)

#### Defined in

[prelude.ts:33](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L33)

***

### inspect()

```ts
inspect(fn): this
```

Calls the provided function with the contained value if `this` is `Some`.
This is primarily for side effects and does not transform the `Option`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | (`value`) => `void` | A function to call with the contained value. |

#### Returns

`this`

`this`, unmodified, for chaining additional methods.

#### Overrides

[`Option`](Option.md).[`inspect`](Option.md#inspect)

#### Defined in

[prelude.ts:50](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L50)

***

### isNone()

```ts
isNone(): true
```

Returns `true` if the Option is a `None` value.

#### Returns

`true`

#### Overrides

[`Option`](Option.md).[`isNone`](Option.md#isnone)

#### Defined in

[prelude.ts:18](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L18)

***

### isSome()

```ts
isSome(): false
```

Returns `true` if the Option is a `Some` value.

#### Returns

`false`

#### Overrides

[`Option`](Option.md).[`isSome`](Option.md#issome)

#### Defined in

[prelude.ts:17](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L17)

***

### isSomeAnd()

```ts
isSomeAnd(predicate): false
```

Returns `true` if the Option is a `Some` value and the predicate returns `true` for the contained value.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `predicate` | (`value`) => `boolean` | A function that takes the contained value and returns a boolean. |

#### Returns

`false`

#### Overrides

[`Option`](Option.md).[`isSomeAnd`](Option.md#issomeand)

#### Defined in

[prelude.ts:19](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L19)

***

### isSomeAndAsync()

```ts
isSomeAndAsync(predicate): Promise<false>
```

Asynchronous version of `isSomeAnd`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | (`value`) => `Promise`\<`boolean`\> |

#### Returns

`Promise`\<`false`\>

#### Overrides

[`Option`](Option.md).[`isSomeAndAsync`](Option.md#issomeandasync)

#### Defined in

[prelude.ts:20](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L20)

***

### map()

```ts
map<U>(fn): None
```

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

[`None`](None.md)

#### Overrides

[`Option`](Option.md).[`map`](Option.md#map)

#### Defined in

[prelude.ts:34](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L34)

***

### mapOr()

```ts
mapOr<U>(defaultValue, fn): U
```

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

#### Overrides

[`Option`](Option.md).[`mapOr`](Option.md#mapor)

#### Defined in

[prelude.ts:35](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L35)

***

### mapOrElse()

```ts
mapOrElse<U>(defaultFn, fn): U
```

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

#### Overrides

[`Option`](Option.md).[`mapOrElse`](Option.md#maporelse)

#### Defined in

[prelude.ts:36](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L36)

***

### okOr()

```ts
okOr<E>(error): Result<never, E>
```

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

[`Result`](Result.md)\<`never`, `E`\>

#### Overrides

[`Option`](Option.md).[`okOr`](Option.md#okor)

#### Defined in

[prelude.ts:28](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L28)

***

### okOrElse()

```ts
okOrElse<E>(err): Result<never, E>
```

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

[`Result`](Result.md)\<`never`, `E`\>

#### Overrides

[`Option`](Option.md).[`okOrElse`](Option.md#okorelse)

#### Defined in

[prelude.ts:29](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L29)

***

### or()

```ts
or<T>(other): Option<T>
```

Returns the Option if it contains a value, otherwise returns `other`.
This can be used for providing a fallback `Option`.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | [`Option`](Option.md)\<`T`\> | The fallback `Option` to use if `this` is `None`. |

#### Returns

[`Option`](Option.md)\<`T`\>

`this` if it is `Some`, otherwise `other`.

#### Overrides

[`Option`](Option.md).[`or`](Option.md#or)

#### Defined in

[prelude.ts:45](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L45)

***

### orElse()

```ts
orElse<T>(fn): Option<T>
```

Returns the Option if it contains a value, otherwise calls `fn` and returns the result.
This method can be used for lazy fallbacks, as `fn` is only evaluated if `this` is `None`.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | () => [`Option`](Option.md)\<`T`\> | A function that produces an `Option`. |

#### Returns

[`Option`](Option.md)\<`T`\>

`this` if it is `Some`, otherwise the result of `fn`.

#### Overrides

[`Option`](Option.md).[`orElse`](Option.md#orelse)

#### Defined in

[prelude.ts:46](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L46)

***

### orElseAsync()

```ts
orElseAsync<T>(fn): AsyncOption<T>
```

Asynchronous version of `orElse`.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `fn` | () => [`AsyncOption`](../type-aliases/AsyncOption.md)\<`T`\> |

#### Returns

[`AsyncOption`](../type-aliases/AsyncOption.md)\<`T`\>

#### Overrides

[`Option`](Option.md).[`orElseAsync`](Option.md#orelseasync)

#### Defined in

[prelude.ts:47](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L47)

***

### toString()

```ts
toString(): string
```

Custom `toString` implementation that uses the `Option`'s contained value.

#### Returns

`string`

#### Inherited from

[`Option`](Option.md).[`toString`](Option.md#tostring)

#### Defined in

[core.ts:302](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/core.ts#L302)

***

### transpose()

```ts
transpose(): Result<None, never>
```

Transposes an `Option` of a `Result` into a `Result` of an `Option`.

#### Returns

[`Result`](Result.md)\<[`None`](None.md), `never`\>

`Ok` containing `Some` if the Option is a `Some` containing `Ok`,
         `Err` containing the error if the Option is a `Some` containing `Err`,
         `Ok` containing `None` if the Option is `None`.

#### Overrides

[`Option`](Option.md).[`transpose`](Option.md#transpose)

#### Defined in

[prelude.ts:30](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L30)

***

### unwrap()

```ts
unwrap(): never
```

Returns the contained `Some` value.

#### Returns

`never`

#### Throws

Throws an error if the value is a `None`.

#### Overrides

[`Option`](Option.md).[`unwrap`](Option.md#unwrap)

#### Defined in

[prelude.ts:23](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L23)

***

### unwrapOr()

```ts
unwrapOr<T>(defaultValue): T
```

Returns the contained `Some` value or a provided default.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `defaultValue` | `T` | The value to return if the Option is a `None`. |

#### Returns

`T`

#### Overrides

[`Option`](Option.md).[`unwrapOr`](Option.md#unwrapor)

#### Defined in

[prelude.ts:24](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L24)

***

### unwrapOrElse()

```ts
unwrapOrElse<T>(fn): T
```

Returns the contained `Some` value or computes it from a closure.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | () => `T` | A function that returns the default value. |

#### Returns

`T`

#### Overrides

[`Option`](Option.md).[`unwrapOrElse`](Option.md#unwraporelse)

#### Defined in

[prelude.ts:25](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L25)

***

### unwrapOrElseAsync()

```ts
unwrapOrElseAsync<T>(fn): Promise<T>
```

Asynchronous version of `unwrapOrElse`.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `fn` | () => `Promise`\<`T`\> |

#### Returns

`Promise`\<`T`\>

#### Overrides

[`Option`](Option.md).[`unwrapOrElseAsync`](Option.md#unwraporelseasync)

#### Defined in

[prelude.ts:26](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L26)

***

### unzip()

```ts
unzip(): [None, None]
```

Converts from `Option<[T, U]>` to `[Option<T>, Option<U>]`.
If `this` is `Some([a, b])`, returns `[Some(a), Some(b)]`.
If `this` is `None`, returns `[None, None]`.

#### Returns

[[`None`](None.md), [`None`](None.md)]

A tuple of `Options`, one for each element in the original `Option` of a tuple.

#### Overrides

[`Option`](Option.md).[`unzip`](Option.md#unzip)

#### Defined in

[prelude.ts:40](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L40)

***

### xor()

```ts
xor<T>(other): Option<T>
```

Returns `Some` if exactly one of `this`, `other` is `Some`, otherwise returns `None`.
This can be thought of as an exclusive or operation on `Option` values.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | [`Option`](Option.md)\<`T`\> | The other `Option` to compare with. |

#### Returns

[`Option`](Option.md)\<`T`\>

`Some` if exactly one of `this` and `other` is `Some`, otherwise `None`.

#### Overrides

[`Option`](Option.md).[`xor`](Option.md#xor)

#### Defined in

[prelude.ts:48](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L48)

***

### zip()

```ts
zip<U>(other): None
```

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
| `other` | [`Option`](Option.md)\<`U`\> | The other `Option` to zip with. |

#### Returns

[`None`](None.md)

An `Option` containing a tuple of the values if both are `Some`, otherwise `None`.

#### Overrides

[`Option`](Option.md).[`zip`](Option.md#zip)

#### Defined in

[prelude.ts:38](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L38)

***

### zipWith()

```ts
zipWith<U, R>(other, fn): None
```

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
| `other` | [`Option`](Option.md)\<`U`\> | The other `Option` to zip with. |
| `fn` | (`value`, `otherValue`) => `R` | The function to combine the values from both `Options`. |

#### Returns

[`None`](None.md)

An `Option` containing the result of `fn` if both `Options` are `Some`, otherwise `None`.

#### Overrides

[`Option`](Option.md).[`zipWith`](Option.md#zipwith)

#### Defined in

[prelude.ts:39](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L39)
