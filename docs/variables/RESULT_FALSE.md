[**happy-rusty**](../README.md)

***

[happy-rusty](../README.md) / RESULT\_FALSE

# Variable: RESULT\_FALSE

```ts
const RESULT_FALSE: Result<boolean, any>;
```

Defined in: [constants.ts:34](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/constants.ts#L34)

Result constant for `false`.
Can be used anywhere due to immutability.

## Example

```ts
function validate(): Result<boolean, Error> {
    return RESULT_FALSE;
}
```
