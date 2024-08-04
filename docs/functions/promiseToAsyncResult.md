[**happy-rusty**](../README.md) • **Docs**

***

[happy-rusty](../README.md) / promiseToAsyncResult

# Function: promiseToAsyncResult()

```ts
function promiseToAsyncResult<T, E>(p): Promise<Result<T, E>>
```

Converts a Promise to a Result type, capturing the resolved value in an `Ok`, or the error in an `Err`.
This allows for promise-based asynchronous operations to be handled in a way that is more in line with the Result pattern.

## Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `T` | - | The type of the value that the promise resolves to. |
| `E` | `Error` | The type of the error that the promise may reject with, defaults to `Error`. |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `p` | `Promise`\<`T`\> | The promise to convert into a `Result` type. |

## Returns

`Promise`\<[`Result`](../interfaces/Result.md)\<`T`, `E`\>\>

A promise that resolves to a `Result<T, E>`. If the input promise `p` resolves, the resulting promise will resolve with `Ok<T>`. If the input promise `p` rejects, the resulting promise will resolve with `Err<E>`.

## Example

```ts
async function example() {
    const result = await promiseToAsyncResult(fetchData());
    result.inspect(x => {
        console.log('Data:', x);
    }).inspectErr(err => {
        console.error('Error:', err);
    });
}
```

## Defined in

[extensions.ts:25](https://github.com/JiangJie/happy-rusty/blob/d91a6123f053d528d1e11023507d8f0c72720848/src/enum/extensions.ts#L25)
