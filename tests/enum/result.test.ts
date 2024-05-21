/* eslint-disable @typescript-eslint/no-unused-vars */
import { assert, assertThrows } from "@std/assert";
import { Err, Ok, promiseToResult, type AsyncIOResult } from '../../src/mod.ts';

function judge(n: number): AsyncIOResult<number> {
    return new Promise(resolve => {
        const r = Math.random();
        resolve(r > n ? Ok(r) : Err(new Error('lose')));
    });
}

Deno.test('Result:Ok', async () => {
    const r = await judge(0);

    assert(r.isOk());
    assert(!r.isErr());

    assert(r.equals(Ok(r.unwrap())));

    assert(r.expect('value should greater than 0') > 0);

    assert(r.unwrap() > 0);
    assertThrows(r.unwrapErr, TypeError);
    assert(r.unwrapOr(0) > 0);
    assert(r.unwrapOrElse((_err) => 0) > 0);

    assert(r.map(_v => 1).equals(Ok(1)));
    assert(r.mapErr(_err => 0).unwrap() > 0);
    assert(r.mapOr(0, _v => 1).equals(Ok(1)));
    assert(r.mapOrElse(_err => 0, _v => 1).equals(Ok(1)));
});

Deno.test('Result:Err', async () => {
    const r = await judge(1);

    assert(!r.isOk());
    assert(r.isErr());

    assert(r.equals(Err(r.unwrapErr())));

    assertThrows(() => r.expect('value should less than 1'), TypeError, 'value should less than 1');

    assertThrows(r.unwrap, Error);
    assert(r.unwrapErr().message === 'lose');
    assert(r.unwrapOr(0) === 0);
    assert(r.unwrapOrElse((err) => err.message.length) === 4);

    assert(r.map(_v => 1).equals(Err(r.unwrapErr())));
    assert(r.mapErr(_err => 0).unwrapErr() === 0);
    assert(r.mapOr(0, _v => 1).equals(Ok(0)));
    assert(r.mapOrElse(_err => 0, _v => 1).equals(Ok(0)));
});

Deno.test('Convert from Promise to Result', async () => {
    const pOk = Promise.resolve(0);
    assert((await promiseToResult(pOk)).unwrap() === 0);

    const pErr = Promise.reject(-1);
    assert((await promiseToResult(pErr)).unwrapErr() === -1);
});