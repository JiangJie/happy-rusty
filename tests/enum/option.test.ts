import { assert, assertThrows } from '@std/assert';
import { None, Some, promiseToOption, type Option } from '../../src/mod.ts';

Deno.test('Option:Some', () => {
    assertThrows(() => Some(null as unknown as number), TypeError);

    const o = Some<number>(10);

    assert(o.isSome());
    assert(!o.isNone());

    assert(o.eq(Some(10)));
    assert(!o.eq(None));

    assert(o.expect('value is number 10') === 10);

    assert(o.unwrap() === 10);
    assert(o.unwrapOr(0) === 10);
    assert(o.unwrapOrElse(() => 0) === 10);

    assert(o.map((v) => v + 1).eq(Some(11)));
    assert(o.mapOr(0, (v) => v + 1).eq(Some(11)));
    assert(o.mapOrElse(() => 0, (v) => v + 1).eq(Some(11)));

    assert(o.filter((v) => v % 2 == 0).eq(Some(10)));
    assert(o.filter((v) => v % 2 == 1).eq(None));
});

Deno.test('Option:None', () => {
    const o: Option<number> = None;

    assert(!o.isSome());
    assert(o.isNone());

    assert(o.eq(None));

    assertThrows(() => o.expect('value should greater than 1'), TypeError, 'value should greater than 1');

    assertThrows(o.unwrap, TypeError);
    assert(o.unwrapOr(0) === 0);
    assert(o.unwrapOrElse(() => 0) === 0);

    assert(o.map((v) => v + 1).eq(None));
    assert(o.mapOr(0, (v) => v + 1).eq(Some(0)));
    assert(o.mapOrElse(() => 0, (v) => v + 1).eq(Some(0)));

    assert(o.filter((v: number) => v > 0).eq(None));
});

Deno.test('Convert from Promise to Option', async () => {
    const pSome = Promise.resolve(0);
    assert((await promiseToOption(pSome)).unwrap() === 0);

    const pNone = Promise.reject();
    assert((await promiseToOption(pNone)).isNone());
});