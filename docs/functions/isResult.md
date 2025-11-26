[**happy-rusty**](../README.md)

***

[happy-rusty](../README.md) / isResult

# Function: isResult()

```ts
function isResult<T, E>(r): r is Result<T, E>;
```

Defined in: [utils.ts:24](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/utils.ts#L24)

Checks if a value is a `Result`.

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | The expected type of the success value contained within the `Result`. |
| `E` | The expected type of the error value contained within the `Result`. |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `r` | `unknown` | The value to be checked as a `Result`. |

## Returns

`r is Result<T, E>`

`true` if the value is a `Result`, otherwise `false`.
