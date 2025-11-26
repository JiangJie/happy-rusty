[**happy-rusty**](../README.md)

***

[happy-rusty](../README.md) / AsyncOption

# Type Alias: AsyncOption\<T\>

```ts
type AsyncOption<T> = Promise<Option<T>>;
```

Defined in: [core.ts:626](https://github.com/JiangJie/happy-rusty/blob/8ea803ae7583fa93c071f42c7f7dce6fad15eccc/src/enum/core.ts#L626)

Represents an asynchronous operation that yields an `Option<T>`.
This is a promise that resolves to either `Some(T)` if the value is present, or `None` if the value is absent.

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | The type of the value that may be contained within the `Option`. |
