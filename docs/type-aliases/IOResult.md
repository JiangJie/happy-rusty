[**happy-rusty**](../index.md) • **Docs**

***

[happy-rusty](../index.md) / IOResult

# Type alias: IOResult\<T\>

```ts
type IOResult<T>: Result<T, Error>;
```

Represents a synchronous operation that yields a `Result<T, Error>`.
This is a result that is either `Ok(T)` if the operation was successful, or `Err(Error)` if there was an error.

## Type parameters

| Type parameter | Description |
| :------ | :------ |
| `T` | The type of the value that is produced by a successful operation. |

## Source

[enum/prelude.ts:578](https://github.com/JiangJie/happy-rusty/blob/8459b5173b9411e6dd5b07bfe7a82558c0bac060/src/enum/prelude.ts#L578)
