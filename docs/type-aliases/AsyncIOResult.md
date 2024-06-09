[**happy-rusty**](../index.md) • **Docs**

***

[happy-rusty](../index.md) / AsyncIOResult

# Type alias: AsyncIOResult\<T\>

```ts
type AsyncIOResult<T>: Promise<IOResult<T>>;
```

Represents an asynchronous I/O operation that yields a `Result<T, Error>`.
This is a promise that resolves to `Ok(T)` if the I/O operation was successful, or `Err(Error)` if there was an error.

## Type parameters

| Type parameter | Description |
| :------ | :------ |
| `T` | The type of the value that is produced by a successful I/O operation. |

## Source

[enum/prelude.ts:609](https://github.com/JiangJie/happy-rusty/blob/15ed105e08c6cc3943e22243c9386336a521d83e/src/enum/prelude.ts#L609)
