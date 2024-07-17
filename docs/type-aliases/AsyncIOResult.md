[**happy-rusty**](../README.md) • **Docs**

***

[happy-rusty](../README.md) / AsyncIOResult

# Type Alias: AsyncIOResult\<T\>

```ts
type AsyncIOResult<T>: Promise<IOResult<T>>;
```

Represents an asynchronous I/O operation that yields a `Result<T, Error>`.
This is a promise that resolves to `Ok(T)` if the I/O operation was successful, or `Err(Error)` if there was an error.

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | The type of the value that is produced by a successful I/O operation. |

## Defined in

[prelude.ts:628](https://github.com/JiangJie/happy-rusty/blob/7218a182717eb5dbba4bfaf783977bc5e378815a/src/enum/prelude.ts#L628)
