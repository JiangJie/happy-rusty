[**happy-rusty**](../README.md)

***

[happy-rusty](../README.md) / VoidResult

# Type Alias: VoidResult\<E\>

```ts
type VoidResult<E> = Result<void, E>;
```

Defined in: [defines.ts:18](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/defines.ts#L18)

Similar to Rust's `Result<(), E>`.

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `E` | The type of the error that may be produced by a failed operation. |
