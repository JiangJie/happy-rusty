[**happy-rusty**](../index.md) • **Docs**

***

[happy-rusty](../index.md) / AsyncResult

# Type alias: AsyncResult\<T, E\>

```ts
type AsyncResult<T, E>: Promise<Result<T, E>>;
```

Represents an asynchronous operation that yields a `Result<T, E>`.
This is a promise that resolves to `Ok(T)` if the operation was successful, or `Err(E)` if there was an error.

## Type parameters

| Type parameter | Description |
| :------ | :------ |
| `T` | The type of the value that is produced by a successful operation. |
| `E` | The type of the error that may be produced by a failed operation. |

## Source

[enum/prelude.ts:593](https://github.com/JiangJie/happy-rusty/blob/15ed105e08c6cc3943e22243c9386336a521d83e/src/enum/prelude.ts#L593)
