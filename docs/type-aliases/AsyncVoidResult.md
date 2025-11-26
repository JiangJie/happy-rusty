[**happy-rusty**](../README.md)

***

[happy-rusty](../README.md) / AsyncVoidResult

# Type Alias: AsyncVoidResult\<E\>

```ts
type AsyncVoidResult<E> = Promise<VoidResult<E>>;
```

Defined in: [defines.ts:19](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/defines.ts#L19)

`VoidResult<E>` wrapped by `Promise`.

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `E` | The type of the error that may be produced by a failed operation. |
