[**happy-rusty**](../README.md)

***

[happy-rusty](../README.md) / None

# Interface: None

Defined in: [prelude.ts:21](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L21)

Represents the absence of a value, as a specialized `Option` type.
The type parameter is set to `never` because `None` does not hold a value.

## Extends

- [`Option`](Option.md)\<`never`\>

## Properties

| Property | Modifier | Type | Description | Overrides | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="optionkindsymbol"></a> `[OptionKindSymbol]` | `readonly` | `"None"` | When using `None` alone, the following overrides can make type inference more accurate. | `Option.[OptionKindSymbol]` | [prelude.ts:26](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L26) |

## Methods

### and()

```ts
and<U>(other): None;
```

Defined in: [prelude.ts:53](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L53)

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

`None`

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

#### Overrides

[`Option`](Option.md).[`and`](Option.md#and)

***

### andThen()

```ts
andThen<U>(fn): None;
```

Defined in: [prelude.ts:54](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L54)

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

`None`

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

#### Overrides

[`Option`](Option.md).[`andThen`](Option.md#andthen)

***

### andThenAsync()

```ts
andThenAsync<U>(fn): Promise<None>;
```

Defined in: [prelude.ts:55](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L55)

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

`Promise`\<`None`\>

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

#### Overrides

[`Option`](Option.md).[`andThenAsync`](Option.md#andthenasync)

***

### eq()

```ts
eq<T>(other): boolean;
```

Defined in: [prelude.ts:63](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L63)

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

***

### expect()

```ts
expect(msg): never;
```

Defined in: [prelude.ts:33](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L33)

Returns the contained `Some` value, with a provided error message if the value is a `None`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `msg` | `string` | The error message to provide if the value is a `None`. |

#### Returns

`never`

#### Throws

Throws an error with the provided message if the Option is a `None`.

#### See

unwrap

#### Overrides

[`Option`](Option.md).[`expect`](Option.md#expect)

***

### filter()

```ts
filter(predicate): None;
```

Defined in: [prelude.ts:43](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L43)

Returns `None` if the Option is `None`, otherwise calls predicate with the wrapped value and returns:
- `Some(t)` if predicate returns `true` (where `t` is the wrapped value), and
- `None` if predicate returns `false`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `predicate` | (`value`) => `boolean` | A function that takes the contained value and returns a boolean. |

#### Returns

`None`

#### Example

```ts
const x = Some(4);
console.log(x.filter(v => v > 2).isSome()); // true
console.log(x.filter(v => v > 5).isNone()); // true
```

#### Overrides

[`Option`](Option.md).[`filter`](Option.md#filter)

***

### flatten()

```ts
flatten(): None;
```

Defined in: [prelude.ts:44](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L44)

Converts from `Option<Option<T>>` to `Option<T>`.

#### Returns

`None`

`None` if the Option is `None`, otherwise returns the contained `Option`.

#### Example

```ts
const x = Some(Some(5));
console.log(x.flatten().unwrap()); // 5

const y = Some(None);
console.log(y.flatten().isNone()); // true
```

#### Overrides

[`Option`](Option.md).[`flatten`](Option.md#flatten)

***

### inspect()

```ts
inspect(fn): this;
```

Defined in: [prelude.ts:61](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L61)

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

***

### isNone()

```ts
isNone(): true;
```

Defined in: [prelude.ts:29](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L29)

Returns `true` if the Option is a `None` value.

#### Returns

`true`

#### Overrides

[`Option`](Option.md).[`isNone`](Option.md#isnone)

***

### isSome()

```ts
isSome(): false;
```

Defined in: [prelude.ts:28](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L28)

Returns `true` if the Option is a `Some` value.

#### Returns

`false`

#### Overrides

[`Option`](Option.md).[`isSome`](Option.md#issome)

***

### isSomeAnd()

```ts
isSomeAnd(predicate): false;
```

Defined in: [prelude.ts:30](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L30)

Returns `true` if the Option is a `Some` value and the predicate returns `true` for the contained value.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `predicate` | (`value`) => `boolean` | A function that takes the contained value and returns a boolean. |

#### Returns

`false`

#### Example

```ts
const x = Some(2);
console.log(x.isSomeAnd(v => v > 1)); // true
console.log(x.isSomeAnd(v => v > 5)); // false
```

#### Overrides

[`Option`](Option.md).[`isSomeAnd`](Option.md#issomeand)

***

### isSomeAndAsync()

```ts
isSomeAndAsync(predicate): Promise<false>;
```

Defined in: [prelude.ts:31](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L31)

Asynchronous version of `isSomeAnd`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `predicate` | (`value`) => `Promise`\<`boolean`\> | An async function that takes the contained value and returns a `Promise<boolean>`. |

#### Returns

`Promise`\<`false`\>

A promise that resolves to `true` if the Option is `Some` and the predicate resolves to `true`.

#### See

isSomeAnd

#### Example

```ts
const x = Some(2);
await x.isSomeAndAsync(async v => v > 1); // true
```

#### Overrides

[`Option`](Option.md).[`isSomeAndAsync`](Option.md#issomeandasync)

***

### map()

```ts
map<U>(fn): None;
```

Defined in: [prelude.ts:45](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L45)

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

`None`

#### See

andThen

#### Example

```ts
const x = Some(5);
console.log(x.map(v => v * 2).unwrap()); // 10

const y = None;
console.log(y.map(v => v * 2).isNone()); // true
```

#### Overrides

[`Option`](Option.md).[`map`](Option.md#map)

***

### mapOr()

```ts
mapOr<U>(defaultValue, fn): U;
```

Defined in: [prelude.ts:46](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L46)

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

#### Overrides

[`Option`](Option.md).[`mapOr`](Option.md#mapor)

***

### mapOrElse()

```ts
mapOrElse<U>(defaultFn, fn): U;
```

Defined in: [prelude.ts:47](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L47)

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

#### Overrides

[`Option`](Option.md).[`mapOrElse`](Option.md#maporelse)

***

### okOr()

```ts
okOr<E>(error): Result<never, E>;
```

Defined in: [prelude.ts:39](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L39)

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

#### See

okOrElse

#### Example

```ts
const x = Some(5);
console.log(x.okOr('error').isOk()); // true

const y = None;
console.log(y.okOr('error').unwrapErr()); // 'error'
```

#### Overrides

[`Option`](Option.md).[`okOr`](Option.md#okor)

***

### okOrElse()

```ts
okOrElse<E>(err): Result<never, E>;
```

Defined in: [prelude.ts:40](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L40)

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

#### See

okOr

#### Example

```ts
const x = None;
console.log(x.okOrElse(() => 'error').unwrapErr()); // 'error'
```

#### Overrides

[`Option`](Option.md).[`okOrElse`](Option.md#okorelse)

***

### or()

```ts
or<T>(other): Option<T>;
```

Defined in: [prelude.ts:56](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L56)

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

#### Overrides

[`Option`](Option.md).[`or`](Option.md#or)

***

### orElse()

```ts
orElse<T>(fn): Option<T>;
```

Defined in: [prelude.ts:57](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L57)

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

#### Overrides

[`Option`](Option.md).[`orElse`](Option.md#orelse)

***

### orElseAsync()

```ts
orElseAsync<T>(fn): AsyncOption<T>;
```

Defined in: [prelude.ts:58](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L58)

Asynchronous version of `orElse`.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

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

#### Overrides

[`Option`](Option.md).[`orElseAsync`](Option.md#orelseasync)

***

### toString()

```ts
toString(): string;
```

Defined in: [core.ts:487](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L487)

Custom `toString` implementation that uses the `Option`'s contained value.

#### Returns

`string`

#### Inherited from

[`Option`](Option.md).[`toString`](Option.md#tostring)

***

### transpose()

```ts
transpose(): Result<None, never>;
```

Defined in: [prelude.ts:41](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L41)

Transposes an `Option` of a `Result` into a `Result` of an `Option`.

#### Returns

[`Result`](Result.md)\<`None`, `never`\>

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

#### Overrides

[`Option`](Option.md).[`transpose`](Option.md#transpose)

***

### unwrap()

```ts
unwrap(): never;
```

Defined in: [prelude.ts:34](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L34)

Returns the contained `Some` value.

#### Returns

`never`

#### Throws

Throws an error if the value is a `None`.

#### See

 - expect
 - unwrapOr

#### Overrides

[`Option`](Option.md).[`unwrap`](Option.md#unwrap)

***

### unwrapOr()

```ts
unwrapOr<T>(defaultValue): T;
```

Defined in: [prelude.ts:35](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L35)

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

#### See

unwrapOrElse

#### Overrides

[`Option`](Option.md).[`unwrapOr`](Option.md#unwrapor)

***

### unwrapOrElse()

```ts
unwrapOrElse<T>(fn): T;
```

Defined in: [prelude.ts:36](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L36)

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

#### See

unwrapOr

#### Example

```ts
const x = None;
console.log(x.unwrapOrElse(() => 10)); // 10
```

#### Overrides

[`Option`](Option.md).[`unwrapOrElse`](Option.md#unwraporelse)

***

### unwrapOrElseAsync()

```ts
unwrapOrElseAsync<T>(fn): Promise<T>;
```

Defined in: [prelude.ts:37](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L37)

Asynchronous version of `unwrapOrElse`.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

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

#### Overrides

[`Option`](Option.md).[`unwrapOrElseAsync`](Option.md#unwraporelseasync)

***

### unzip()

```ts
unzip(): [None, None];
```

Defined in: [prelude.ts:51](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L51)

Converts from `Option<[T, U]>` to `[Option<T>, Option<U>]`.
If `this` is `Some([a, b])`, returns `[Some(a), Some(b)]`.
If `this` is `None`, returns `[None, None]`.

#### Returns

\[`None`, `None`\]

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

#### Overrides

[`Option`](Option.md).[`unzip`](Option.md#unzip)

***

### xor()

```ts
xor<T>(other): Option<T>;
```

Defined in: [prelude.ts:59](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L59)

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

#### Overrides

[`Option`](Option.md).[`xor`](Option.md#xor)

***

### zip()

```ts
zip<U>(other): None;
```

Defined in: [prelude.ts:49](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L49)

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

`None`

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

#### Overrides

[`Option`](Option.md).[`zip`](Option.md#zip)

***

### zipWith()

```ts
zipWith<U, R>(other, fn): None;
```

Defined in: [prelude.ts:50](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L50)

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

`None`

An `Option` containing the result of `fn` if both `Options` are `Some`, otherwise `None`.

#### See

zip

#### Example

```ts
const x = Some(2);
const y = Some(3);
console.log(x.zipWith(y, (a, b) => a * b).unwrap()); // 6
```

#### Overrides

[`Option`](Option.md).[`zipWith`](Option.md#zipwith)
