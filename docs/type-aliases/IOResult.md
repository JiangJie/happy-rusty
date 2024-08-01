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

[defines.ts:30](https://github.com/JiangJie/happy-rusty/blob/ba112bb228eba4376da813b0604a1f67c4b2f569/src/enum/defines.ts#L30)
