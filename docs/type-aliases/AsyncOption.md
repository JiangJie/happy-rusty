[**happy-rusty**](../README.md) • **Docs**

***

[happy-rusty](../README.md) / AsyncOption

# Type Alias: AsyncOption\<T\>

```ts
type AsyncOption<T>: Promise<Option<T>>;
```

Represents an asynchronous operation that yields an `Option<T>`.
This is a promise that resolves to either `Some(T)` if the value is present, or `None` if the value is absent.

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | The type of the value that may be contained within the `Option`. |

## Defined in

[defines.ts:13](https://github.com/JiangJie/happy-rusty/blob/7d7f4ab2132e507f77594d030495f95b5688b84a/src/enum/defines.ts#L13)
