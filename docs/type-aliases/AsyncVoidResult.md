[**happy-rusty**](../README.md)

***

[happy-rusty](../README.md) / AsyncVoidResult

# Type Alias: AsyncVoidResult\<E\>

```ts
type AsyncVoidResult<E> = Promise<VoidResult<E>>;
```

Defined in: [defines.ts:25](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/defines.ts#L25)

`VoidResult<E>` wrapped by `Promise`.

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `E` | The type of the error that may be produced by a failed operation. |
