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

[enum/prelude.ts:561](https://github.com/JiangJie/happy-rusty/blob/8459b5173b9411e6dd5b07bfe7a82558c0bac060/src/enum/prelude.ts#L561)
