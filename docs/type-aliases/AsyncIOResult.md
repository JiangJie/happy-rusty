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

[defines.ts:38](https://github.com/JiangJie/happy-rusty/blob/568a73f526d9ce3608e5c5e0ed80e93107bc6adb/src/enum/defines.ts#L38)
