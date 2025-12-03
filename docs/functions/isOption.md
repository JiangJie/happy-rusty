[**happy-rusty**](../README.md)

***

[happy-rusty](../README.md) / isOption

# Function: isOption()

```ts
function isOption<T>(o): o is Option<T>;
```

Defined in: [utils.ts:24](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/utils.ts#L24)

Checks if a value is an `Option`.

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | The expected type of the value contained within the `Option`. |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `o` | `unknown` | The value to be checked as an `Option`. |

## Returns

`o is Option<T>`

`true` if the value is an `Option`, otherwise `false`.

## Example

```ts
const x = Some(5);
console.log(isOption(x)); // true
console.log(isOption(null)); // false
console.log(isOption({ value: 5 })); // false
```
