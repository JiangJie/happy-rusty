import { assert, assertThrows } from '@std/assert';
import { None, Some, promiseToOption } from '../../src/mod.ts';

Deno.test('Option:Some', async (t) => {
    const o = Some<number>(10);

    await t.step('Some value can not be nullable', () => {
        assertThrows(() => Some(null as unknown as number), TypeError);
    });

    await t.step('Querying the variant', () => {
        assert(o.isSome());
        assert(!o.isNone());
    });

    await t.step('Equals comparison', () => {
        assert(o.eq(Some(10)));
        assert(!o.eq(None));
    });

    await t.step('Extracting the contained value', () => {
        assert(o.expect('value is number 10') === 10);

        assert(o.unwrap() === 10);
        assert(o.unwrapOr(0) === 10);
        assert(o.unwrapOrElse(() => 0) === 10);
    });

    await t.step('Transforming contained values', () => {
        assert(o.map((v) => v + 1).eq(Some(11)));
        assert(o.mapOr(0, (v) => v + 1).eq(Some(11)));
        assert(o.mapOrElse(() => 0, (v) => v + 1).eq(Some(11)));

        assert(o.filter((v) => v % 2 == 0).eq(Some(10)));
        assert(o.filter((v) => v % 2 == 1).eq(None));
    });
});

Deno.test('Option:None', async (t) => {
    await t.step('Querying the variant', () => {
        assert(!None.isSome());
        assert(None.isNone());
    });

    await t.step('Equals comparison', () => {
        assert(!None.eq(Some(10)));
        assert(None.eq(None));
    });

    await t.step('Extracting the contained value', () => {
        assertThrows(() => None.expect('value should greater than 1'), TypeError, 'value should greater than 1');

        assertThrows(None.unwrap, TypeError);
        assert(None.unwrapOr(0) === 0);
        assert(None.unwrapOrElse(() => 0) === 0);
    });

    await t.step('Transforming contained values', () => {
        assert(None.map((v) => v + 1).eq(None));
        assert(None.mapOr(0, (v) => v + 1).eq(Some(0)));
        assert(None.mapOrElse(() => 0, (v) => v + 1).eq(Some(0)));

        assert(None.filter((v: number) => v > 0).eq(None));
    });
});

Deno.test('Convert from Promise to Option', async (t) => {
    await t.step('Resolve will convert to Some', async () => {
        const pSome = Promise.resolve(0);
        assert((await promiseToOption(pSome)).unwrap() === 0);
    });

    await t.step('Reject will convert to None', async () => {
        const pNone = Promise.reject();
        assert((await promiseToOption(pNone)).isNone());
    });
});