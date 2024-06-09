[**happy-rusty**](../index.md) • **Docs**

***

[happy-rusty](../index.md) / IOResult

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

[enum/prelude.ts:601](https://github.com/JiangJie/happy-rusty/blob/15ed105e08c6cc3943e22243c9386336a521d83e/src/enum/prelude.ts#L601)
