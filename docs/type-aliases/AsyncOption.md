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

[core.ts:626](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/core.ts#L626)
