[**happy-rusty**](../README.md) • **Docs**

***

[happy-rusty](../README.md) / AsyncResult

# Type Alias: AsyncResult\<T, E\>

```ts
type AsyncResult<T, E>: Promise<Result<T, E>>;
```

Represents an asynchronous operation that yields a `Result<T, E>`.
This is a promise that resolves to `Ok(T)` if the operation was successful, or `Err(E)` if there was an error.

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | The type of the value that is produced by a successful operation. |
| `E` | The type of the error that may be produced by a failed operation. |

## Defined in

[core.ts:635](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/core.ts#L635)
