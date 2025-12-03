[**happy-rusty**](../README.md)

***

[happy-rusty](../README.md) / RESULT\_VOID

# Variable: RESULT\_VOID

```ts
const RESULT_VOID: Result<void, any>;
```

Defined in: [constants.ts:58](https://github.com/JiangJie/happy-rusty/blob/515388c18573244f703829df2cc835aa1c8022b5/src/enum/constants.ts#L58)

Result constant for `void` or `()`.
Can be used anywhere due to immutability.

## Example

```ts
function doSomething(): Result<void, Error> {
    return RESULT_VOID;
}
```
