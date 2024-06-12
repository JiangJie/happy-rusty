[**happy-rusty**](../README.md) • **Docs**

***

[happy-rusty](../README.md) / Ok

# Function: Ok()

```ts
function Ok<T, E>(value): Result<T, E>
```

Creates a `Result<T, E>` representing a successful outcome containing a value.
This function is used to construct a `Result` that signifies the operation was successful by containing the value `T`.

## Type parameters

| Type parameter | Description |
| :------ | :------ |
| `T` | The type of the value to be contained in the `Ok` result. |
| `E` | The type of the error that the result could potentially contain (not used in this case). |

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `value` | `T` | The value to wrap as an `Ok` result. |

## Returns

[`Result`](../interfaces/Result.md)\<`T`, `E`\>

A `Result<T, E>` that contains the provided value, representing the `Ok` case.

## Example

```ts
const goodResult = Ok<number, Error>(1); // Result<number, Error> with a value
if (goodResult.isOk()) {
  console.log(goodResult.unwrap()); // Outputs: 1
}
```

## Source

[enum/prelude.ts:776](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L776)
