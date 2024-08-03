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

[helpers.ts:11](https://github.com/JiangJie/happy-rusty/blob/568a73f526d9ce3608e5c5e0ed80e93107bc6adb/src/enum/helpers.ts#L11)
