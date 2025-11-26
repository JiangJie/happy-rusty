[**happy-rusty**](../README.md)

***

[happy-rusty](../README.md) / isOption

# Function: isOption()

```ts
function isOption<T>(o): o is Option<T>;
```

Defined in: [utils.ts:11](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/utils.ts#L11)

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
