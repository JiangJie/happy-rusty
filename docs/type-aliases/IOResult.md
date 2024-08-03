[**happy-rusty**](../README.md) • **Docs**

***

[happy-rusty](../README.md) / IOResult

# Type Alias: IOResult\<T\>

```ts
type IOResult<T>: Result<T, Error>;
```

Represents a synchronous operation that yields a `Result<T, Error>`.
This is a result that is either `Ok(T)` if the operation was successful, or `Err(Error)` if there was an error.

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | The type of the value that is produced by a successful operation. |

## Defined in

[defines.ts:30](https://github.com/JiangJie/happy-rusty/blob/568a73f526d9ce3608e5c5e0ed80e93107bc6adb/src/enum/defines.ts#L30)
