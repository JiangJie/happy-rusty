[**happy-rusty**](../README.md) • **Docs**

***

[happy-rusty](../README.md) / Err

# Function: Err()

```ts
function Err<T, E>(error): Result<T, E>
```

Creates a `Result<T, E>` representing a failed outcome containing an error.
This function is used to construct a `Result` that signifies the operation failed by containing the error `E`.

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | The type of the value that the result could potentially contain (not used in this case). |
| `E` | The type of the error to be wrapped in the `Err` result. |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `error` | `E` | The error to wrap as an `Err` result. |

## Returns

[`Result`](../interfaces/Result.md)\<`T`, `E`\>

A `Result<T, E>` that contains the provided error, representing the `Err` case.

## Example

```ts
const badResult = Err<number, Error>(new Error('Something went wrong'));
if (badResult.isErr()) {
  console.error(badResult.unwrapErr()); // Outputs: Error: Something went wrong
}
```

## Defined in

[prelude.ts:413](https://github.com/JiangJie/happy-rusty/blob/568a73f526d9ce3608e5c5e0ed80e93107bc6adb/src/enum/prelude.ts#L413)
