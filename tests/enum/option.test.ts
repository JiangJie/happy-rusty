import { assert, assertThrows } from '@std/assert';
import { None, Some, promiseToOption } from '../../src/mod.ts';

Deno.test('Option:Some', () => {
    assertThrows(() => Some(null as unknown as number), TypeError);

    const v = Some<number>(10);

    assert(v.isSome());
    assert(!v.isNone());

    assert(v.equals(Some(10)));

    assert(v.expect('value is number 10') === 10);

    assert(v.unwrap() === 10);
    assert(v.unwrapOr(0) === 10);
    assert(v.unwrapOrElse(() => 0) === 10);

    assert(v.map((v) => v + 1).equals(Some(11)));
    assert(v.mapOr(0, (v) => v + 1).equals(Some(11)));
    assert(v.mapOrElse(() => 0, (v) => v + 1).equals(Some(11)));
});

Deno.test('Option:None', () => {
    const n = Math.random();
    const v = n > 1 ? Some(n) : None;

    assert(!v.isSome());
    assert(v.isNone());

    assert(v.equals(None));

    assertThrows(() => v.expect('value should greater than 1'), TypeError, 'value should greater than 1');

    assertThrows(v.unwrap, TypeError);
    assert(v.unwrapOr(0) === 0);
    assert(v.unwrapOrElse(() => 0) === 0);

    assert(v.map<number, number>((v) => v + 1).equals(None));
    assert(v.mapOr<number, number>(0, (v) => v + 1).equals(Some(0)));
    assert(v.mapOrElse<number, number>(() => 0, (v) => v + 1).equals(Some(0)));
});

Deno.test('Convert Promise to Option', async () => {
    const pSome = Promise.resolve(0);
    assert((await promiseToOption(pSome)).unwrap() === 0);

    const pNone = Promise.reject();
    assert((await promiseToOption(pNone)).isNone());
});