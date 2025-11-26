[**happy-rusty**](../README.md)

***

[happy-rusty](../README.md) / AsyncIOResult

# Type Alias: AsyncIOResult\<T\>

```ts
type AsyncIOResult<T> = AsyncResult<T, Error>;
```

Defined in: [defines.ts:35](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/defines.ts#L35)

Represents an asynchronous I/O operation that yields a `Result<T, Error>`.
This is a promise that resolves to `Ok(T)` if the I/O operation was successful, or `Err(Error)` if there was an error.

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | The type of the value that is produced by a successful I/O operation. |
