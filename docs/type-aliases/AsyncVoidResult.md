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

[defines.ts:36](https://github.com/JiangJie/happy-rusty/blob/7d7f4ab2132e507f77594d030495f95b5688b84a/src/enum/defines.ts#L36)
