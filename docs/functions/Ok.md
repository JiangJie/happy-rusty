[**happy-rusty**](../README.md)

***

[happy-rusty](../README.md) / Ok

# Function: Ok()

## Call Signature

```ts
function Ok<T, E>(value): Result<T, E>;
```

Defined in: [prelude.ts:335](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L335)

Creates a `Result<T, E>` representing a successful outcome containing a value.
This function is used to construct a `Result` that signifies the operation was successful by containing the value `T`.

### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | The type of the value to be contained in the `Ok` result. |
| `E` | The type of the error that the result could potentially contain (not used in this case). |

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `value` | `T` | The value to wrap as an `Ok` result. |

### Returns

[`Result`](../interfaces/Result.md)\<`T`, `E`\>

A `Result<T, E>` that contains the provided value, representing the `Ok` case.

### Example

```ts
const goodResult = Ok<number, Error>(1); // Result<number, Error> with a value
if (goodResult.isOk()) {
  console.log(goodResult.unwrap()); // Outputs: 1
}
```

## Call Signature

```ts
function Ok<E>(): Result<void, E>;
```

Defined in: [prelude.ts:339](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/prelude.ts#L339)

Because javascript does not have a `()` type, use `void` instead.

### Type Parameters

| Type Parameter |
| ------ |
| `E` |

### Returns

[`Result`](../interfaces/Result.md)\<`void`, `E`\>
