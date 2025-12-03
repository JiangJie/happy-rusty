[**happy-rusty**](../README.md)

***

[happy-rusty](../README.md) / RESULT\_ZERO

# Variable: RESULT\_ZERO

```ts
const RESULT_ZERO: Result<number, any>;
```

Defined in: [constants.ts:46](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/constants.ts#L46)

Result constant for `0`.
Can be used anywhere due to immutability.

## Example

```ts
function count(): Result<number, Error> {
    return RESULT_ZERO;
}
```
