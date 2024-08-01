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

[defines.ts:13](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/defines.ts#L13)
