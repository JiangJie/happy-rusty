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

[prelude.ts:1206](https://github.com/JiangJie/happy-rusty/blob/28ebaeb1ee8fded97e00cb58a36e776fbc44e585/src/enum/prelude.ts#L1206)
