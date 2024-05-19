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
    assert(res.unwrap() > 0);
    assert(res.expect('value should greater than 0') > 0);
    assertThrows(res.err, TypeError);
});

Deno.test('Result:Err', async () => {
    const res = await judge(1);

    assert(!res.isOk());
    assert(res.isErr());
    assertThrows(res.unwrap, Error);
    assert(res.err().message === 'lose');
    assertThrows(() => res.expect('value should less than 1'), TypeError, 'value should less than 1');
});

Deno.test('Convert Promise to Result', async () => {
    const pSome = Promise.resolve(0);
    assert((await promiseToResult(pSome)).unwrap() === 0);

    const pNone = Promise.reject(-1);
    assert((await promiseToResult(pNone)).err() === -1);
});