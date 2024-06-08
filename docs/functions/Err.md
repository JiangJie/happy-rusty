[**happy-rusty**](../index.md) • **Docs**

***

[happy-rusty](../index.md) / Err

# Function: Err()

```ts
function Err<T, E>(error): Result<T, E>
```

Creates a `Result<T, E>` representing a failed outcome containing an error.
This function is used to construct a `Result` that signifies the operation failed by containing the error `E`.

## Type parameters

| Type parameter | Description |
| :------ | :------ |
| `T` | The type of the value that the result could potentially contain (not used in this case). |
| `E` | The type of the error to be wrapped in the `Err` result. |

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
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

## Source

[enum/prelude.ts:832](https://github.com/JiangJie/happy-rusty/blob/8459b5173b9411e6dd5b07bfe7a82558c0bac060/src/enum/prelude.ts#L832)
