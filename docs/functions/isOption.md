[**happy-rusty**](../README.md) • **Docs**

***

[happy-rusty](../README.md) / isOption

# Function: isOption()

```ts
function isOption<T>(o): o is Option<T>
```

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

## Defined in

[helpers.ts:11](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/helpers.ts#L11)
