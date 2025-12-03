[**happy-rusty**](../README.md)

***

[happy-rusty](../README.md) / RESULT\_TRUE

# Variable: RESULT\_TRUE

```ts
const RESULT_TRUE: Result<boolean, any>;
```

Defined in: [constants.ts:22](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/constants.ts#L22)

Result constant for `true`.
Can be used anywhere due to immutability.

## Example

```ts
function validate(): Result<boolean, Error> {
    return RESULT_TRUE;
}
```
