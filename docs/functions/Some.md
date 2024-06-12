[**happy-rusty**](../README.md) • **Docs**

***

[happy-rusty](../README.md) / Some

# Function: Some()

```ts
function Some<T>(value): Option<T>
```

Creates an `Option<T>` representing the presence of a value.
This function is typically used to construct an `Option` that contains a value, indicating that the operation yielding the value was successful.

## Type parameters

| Type parameter | Description |
| :------ | :------ |
| `T` | The type of the value to be wrapped in a `Some`. |

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `value` | `T` | The value to wrap as a `Some` option. |

## Returns

[`Option`](../interfaces/Option.md)\<`T`\>

An `Option<T>` that contains the provided value, representing the `Some` case.

## Example

```ts
const maybeValue = Some(1); // Option<number> with a value
if (maybeValue.isSome()) {
    console.log(maybeValue.unwrap()); // Outputs: 1
}
```

## Source

[enum/prelude.ts:627](https://github.com/JiangJie/happy-rusty/blob/d102b1cddf6a12ecdb610e0f92d003cc7e0015ee/src/enum/prelude.ts#L627)
