[**happy-rusty**](../README.md) • **Docs**

***

[happy-rusty](../README.md) / AsyncVoidResult

# Type Alias: AsyncVoidResult\<E\>

```ts
type AsyncVoidResult<E>: Promise<VoidResult<E>>;
```

`VoidResult<E>` wrapped by `Promise`.

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `E` | The type of the error that may be produced by a failed operation. |

## Defined in

[defines.ts:19](https://github.com/JiangJie/happy-rusty/blob/6efe20969984552f52d79aee092bb6925a077fe7/src/enum/defines.ts#L19)
