[**happy-rusty**](../README.md)

***

[happy-rusty](../README.md) / IOResult

# Type Alias: IOResult\<T\>

```ts
type IOResult<T> = Result<T, Error>;
```

Defined in: [defines.ts:33](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/defines.ts#L33)

Represents a synchronous operation that yields a `Result<T, Error>`.
This is a result that is either `Ok(T)` if the operation was successful, or `Err(Error)` if there was an error.

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | The type of the value that is produced by a successful operation. |
