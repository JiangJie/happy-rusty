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

[prelude.ts:648](https://github.com/JiangJie/happy-rusty/blob/28ebaeb1ee8fded97e00cb58a36e776fbc44e585/src/enum/prelude.ts#L648)
