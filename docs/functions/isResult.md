[**happy-rusty**](../README.md) • **Docs**

***

[happy-rusty](../README.md) / isResult

# Function: isResult()

```ts
function isResult<T, E>(r): r is Result<T, E>
```

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

## Defined in

[utils.ts:24](https://github.com/JiangJie/happy-rusty/blob/7d7f4ab2132e507f77594d030495f95b5688b84a/src/enum/utils.ts#L24)
