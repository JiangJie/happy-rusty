import { describe, expect, test } from '@jest/globals';
import { Err, Ok, promiseToResult, type AsyncIOResult } from '../../src/mod.ts';

function judge(n: number): AsyncIOResult<number> {
    return new Promise(resolve => {
        const r = Math.random();
        resolve(r > n ? Ok(r) : Err(new Error('lose')));
    });
}

describe('Result', () => {
    test('unwrap Ok', async () => {
        const res = await judge(0);

        expect(res.isOk()).toBe(true);
        expect(res.isErr()).toBe(false);
        expect(res.unwrap()).toBeGreaterThan(0);
        expect(res.err).toThrowError(TypeError);
    });

    test('handle Err', async () => {
        const res = await judge(1);

        expect(res.isOk()).toBe(false);
        expect(res.isErr()).toBe(true);
        expect(res.unwrap).toThrowError(Error);
        expect(res.err().message).toBe('lose');
    });

    test('convert from Promise', async () => {
        const pSome = Promise.resolve(0);
        expect((await promiseToResult(pSome)).unwrap()).toBe(0);

        const pNone = Promise.reject(-1);
        expect((await promiseToResult(pNone)).err()).toBe(-1);
    });
});