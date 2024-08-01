[**happy-rusty**](../README.md) • **Docs**

***

[happy-rusty](../README.md) / AsyncIOResult

# Type Alias: AsyncIOResult\<T\>

```ts
type AsyncIOResult<T>: AsyncResult<T, Error>;
```

Represents an asynchronous I/O operation that yields a `Result<T, Error>`.
This is a promise that resolves to `Ok(T)` if the I/O operation was successful, or `Err(Error)` if there was an error.

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | The type of the value that is produced by a successful I/O operation. |

## Defined in

[defines.ts:38](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/defines.ts#L38)
