[**happy-rusty**](../README.md)

***

[happy-rusty](../README.md) / isResult

# Function: isResult()

```ts
function isResult<T, E>(r): r is Result<T, E>;
```

Defined in: [utils.ts:44](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/utils.ts#L44)

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

## Example

```ts
const x = Ok(5);
console.log(isResult(x)); // true
console.log(isResult(null)); // false
console.log(isResult({ value: 5 })); // false
```
