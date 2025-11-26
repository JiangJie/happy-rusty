[**happy-rusty**](../README.md)

***

[happy-rusty](../README.md) / VoidResult

# Type Alias: VoidResult\<E\>

```ts
type VoidResult<E> = Result<void, E>;
```

Defined in: [defines.ts:12](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/defines.ts#L12)

Similar to Rust's `Result<(), E>`.

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `E` | The type of the error that may be produced by a failed operation. |
