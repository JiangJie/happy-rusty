[**happy-rusty**](../README.md)

***

[happy-rusty](../README.md) / AsyncResult

# Type Alias: AsyncResult\<T, E\>

```ts
type AsyncResult<T, E> = Promise<Result<T, E>>;
```

Defined in: [core.ts:1021](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L1021)

Represents an asynchronous operation that yields a `Result<T, E>`.
This is a promise that resolves to `Ok(T)` if the operation was successful, or `Err(E)` if there was an error.

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | The type of the value that is produced by a successful operation. |
| `E` | The type of the error that may be produced by a failed operation. |
