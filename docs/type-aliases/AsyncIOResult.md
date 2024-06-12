[**happy-rusty**](../README.md) • **Docs**

***

[happy-rusty](../README.md) / AsyncIOResult

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

[enum/prelude.ts:609](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L609)
