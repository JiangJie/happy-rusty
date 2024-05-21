/* eslint-disable @typescript-eslint/no-unused-vars */
import { assert, assertThrows } from "@std/assert";
import { Err, Ok, promiseToResult, type AsyncIOResult } from '../../src/mod.ts';

function judge(n: number): AsyncIOResult<number> {
    return new Promise(resolve => {
        const r = Math.random();
        resolve(r > n ? Ok(r) : Err(new Error('lose')));
    });
}

Deno.test('Result:Ok', async (t) => {
    const r = await judge(0);

    await t.step('Querying the variant', () => {
        assert(r.isOk());
        assert(!r.isErr());
    });

    await t.step('Equals comparison', () => {
        assert(r.eq(Ok(r.unwrap())));
    });

    await t.step('Extracting the contained value', () => {
        assert(r.expect('value should greater than 0') > 0);

        assert(r.unwrap() > 0);
        assertThrows(r.unwrapErr, TypeError);
        assert(r.unwrapOr(0) > 0);
        assert(r.unwrapOrElse((_err) => 0) > 0);
    });

    await t.step('Transforming contained values', () => {
        assert(r.map(_v => 1).eq(Ok(1)));
        assert(r.mapErr(_err => 0).unwrap() > 0);
        assert(r.mapOr(0, _v => 1).eq(Ok(1)));
        assert(r.mapOrElse(_err => 0, _v => 1).eq(Ok(1)));
    });
});

Deno.test('Result:Err', async (t) => {
    const r = await judge(1);

    await t.step('Querying the variant', () => {
        assert(!r.isOk());
        assert(r.isErr());
    });

    await t.step('Equals comparison', () => {
        assert(r.eq(Err(r.unwrapErr())));
    });

    await t.step('Extracting the contained value', () => {
        assertThrows(() => r.expect('value should less than 1'), TypeError, 'value should less than 1');

        assertThrows(r.unwrap, Error);
        assert(r.unwrapErr().message === 'lose');
        assert(r.unwrapOr(0) === 0);
        assert(r.unwrapOrElse((err) => err.message.length) === 4);
    });

    await t.step('Transforming contained values', () => {
        assert(r.map(_v => 1).eq(Err(r.unwrapErr())));
        assert(r.mapErr(_err => 0).unwrapErr() === 0);
        assert(r.mapOr(0, _v => 1).eq(Ok(0)));
        assert(r.mapOrElse(_err => 0, _v => 1).eq(Ok(0)));
    });
});

Deno.test('Convert from Promise to Result', async (t) => {
    await t.step('Resolve will convert to Ok', async () => {
        const pOk = Promise.resolve(0);
        assert((await promiseToResult(pOk)).unwrap() === 0);
    });

    await t.step('Reject will convert to Err', async () => {
        const pErr = Promise.reject(-1);
        assert((await promiseToResult(pErr)).unwrapErr() === -1);
    });
});