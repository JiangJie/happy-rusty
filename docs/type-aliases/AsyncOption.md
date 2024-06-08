[**happy-rusty**](../index.md) • **Docs**

***

[happy-rusty](../index.md) / AsyncOption

# Type alias: AsyncOption\<T\>

```ts
type AsyncOption<T>: Promise<Option<T>>;
```

Represents an asynchronous operation that yields an `Option<T>`.
This is a promise that resolves to either `Some(T)` if the value is present, or `None` if the value is absent.

## Type parameters

| Type parameter | Description |
| :------ | :------ |
| `T` | The type of the value that may be contained within the `Option`. |

## Source

[enum/prelude.ts:561](https://github.com/JiangJie/happy-rusty/blob/4e351bc0f871ad0e25514a05e881fc61245e329e/src/enum/prelude.ts#L561)
