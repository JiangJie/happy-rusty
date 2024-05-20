import { assert, assertThrows } from "@std/assert";
import { Err, Ok, promiseToResult, type AsyncIOResult } from '../../src/mod.ts';

function judge(n: number): AsyncIOResult<number> {
    return new Promise(resolve => {
        const r = Math.random();
        resolve(r > n ? Ok(r) : Err(new Error('lose')));
    });
}

Deno.test('Result:Ok', async () => {
    const res = await judge(0);

    assert(res.isOk());
    assert(!res.isErr());

    assert(res.equals(Ok(res.unwrap())));

    assert(res.expect('value should greater than 0') > 0);

    assert(res.unwrap() > 0);
    assertThrows(res.unwrapErr, TypeError);
    assert(res.unwrapOr(0) > 0);
    assert(res.unwrapOrElse((_e) => 0) > 0);

    assert(res.map(_v => 1).equals(Ok(1)));
    assert(res.mapErr(_error => 0).unwrap() > 0);
    assert(res.mapOr(0, _v => 1).equals(Ok(1)));
    assert(res.mapOrElse(_error => 0, _v => 1).equals(Ok(1)));
});

Deno.test('Result:Err', async () => {
    const res = await judge(1);

    assert(!res.isOk());
    assert(res.isErr());

    assert(res.equals(Err(res.unwrapErr())));

    assertThrows(() => res.expect('value should less than 1'), TypeError, 'value should less than 1');

    assertThrows(res.unwrap, Error);
    assert(res.unwrapErr().message === 'lose');
    assert(res.unwrapOr(0) === 0);
    assert(res.unwrapOrElse((e) => e.message.length) === 4);

    assert(res.map(_v => 1).equals(Err(res.unwrapErr())));
    assert(res.mapErr(_error => 0).unwrapErr() === 0);
    assert(res.mapOr(0, _v => 1).equals(Ok(0)));
    assert(res.mapOrElse(_error => 0, _v => 1).equals(Ok(0)));
});

Deno.test('Convert Promise to Result', async () => {
    const pSome = Promise.resolve(0);
    assert((await promiseToResult(pSome)).unwrap() === 0);

    const pNone = Promise.reject(-1);
    assert((await promiseToResult(pNone)).unwrapErr() === -1);
});