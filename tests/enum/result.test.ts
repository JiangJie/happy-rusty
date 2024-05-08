import { describe, expect, test } from '@jest/globals';
import { Err, None, Ok, Some, type AsyncIOResult, type Option } from '../../src/mod.ts';

function judge(n: number): Option<AsyncIOResult<number>> {
    if (n < 0 || n >= 1) {
        return None;
    }

    return Some(new Promise(resolve => {
        const r = Math.random();
        resolve(r > n ? Ok(r) : Err(new Error('lose')));
    }));
}

describe('Result', () => {
    test('unwrap Ok', () => {
        const v = Ok(10);
        expect(v.unwrap()).toBe(10);
    });

    test('handle Err', async () => {
        const res = judge(0.8);
        if (res.isSome()) {
            const result = await res.unwrap();
            if (result.isErr()) {
                expect(result.err().message).toBe('lose');
            } else {
                expect(result.unwrap()).toBeGreaterThan(0.8);
            }
        }
    })
});