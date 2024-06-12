[**happy-rusty**](../README.md) • **Docs**

***

[happy-rusty](../README.md) / IOResult

# Type alias: IOResult\<T\>

```ts
type IOResult<T>: Result<T, Error>;
```

Represents a synchronous operation that yields a `Result<T, Error>`.
This is a result that is either `Ok(T)` if the operation was successful, or `Err(Error)` if there was an error.

## Type parameters

| Type parameter | Description |
| :------ | :------ |
| `T` | The type of the value that is produced by a successful operation. |

## Source

[enum/prelude.ts:601](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L601)
