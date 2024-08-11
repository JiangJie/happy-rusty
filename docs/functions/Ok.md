[**happy-rusty**](../README.md) • **Docs**

***

[happy-rusty](../README.md) / Ok

# Function: Ok()

## Ok(value)

```ts
function Ok<T, E>(value): Result<T, E>
```

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

### Defined in

[prelude.ts:326](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L326)

## Ok()

```ts
function Ok<E>(): Result<void, E>
```

Because javascript does not have a `()` type, use `void` instead.

### Type Parameters

| Type Parameter |
| ------ |
| `E` |

### Returns

[`Result`](../interfaces/Result.md)\<`void`, `E`\>

### Defined in

[prelude.ts:330](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/prelude.ts#L330)
