import { assert, assertThrows } from '@std/assert';
import { None, Some, promiseToOption } from '../../src/mod.ts';

Deno.test('Option:Some', () => {
    const v = Some(10);

    assert(v.isSome());
    assert(!v.isNone());
    assert(v.unwrap() === 10);
    assert(v.expect('value is number 10') === 10);
    assertThrows(() => Some(null as unknown as number), TypeError);
});

Deno.test('Option:None', () => {
    const n = Math.random();
    const v = n > 1 ? Some(n) : None;

    assert(!v.isSome());
    assert(v.isNone());
    assertThrows(v.unwrap, TypeError);
    assertThrows(() => v.expect('value should greater than 1'), TypeError, 'value should greater than 1');
});

Deno.test('Convert Promise to Option', async () => {
    const pSome = Promise.resolve(0);
    assert((await promiseToOption(pSome)).unwrap() === 0);

    const pNone = Promise.reject();
    assert((await promiseToOption(pNone)).isNone());
});