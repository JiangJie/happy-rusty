[**happy-rusty**](../README.md)

***

[happy-rusty](../README.md) / AsyncOption

# Type Alias: AsyncOption\<T\>

```ts
type AsyncOption<T> = Promise<Option<T>>;
```

Defined in: [core.ts:1012](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/core.ts#L1012)

Represents an asynchronous operation that yields an `Option<T>`.
This is a promise that resolves to either `Some(T)` if the value is present, or `None` if the value is absent.

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | The type of the value that may be contained within the `Option`. |
