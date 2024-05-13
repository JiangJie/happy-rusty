import { describe, expect, test } from '@jest/globals';
import { None, Some } from '../../src/mod.ts';

describe('Option', () => {
    test('unwrap Some', () => {
        const v = Some(10);

        expect(v.isSome()).toBe(true);
        expect(v.isNone()).toBe(false);
        expect(v.unwrap()).toBe(10);
    });

    test('handle None', () => {
        const n = Math.random();
        const v = n > 1 ? Some(n) : None;

        expect(v.isSome()).toBe(false);
        expect(v.isNone()).toBe(true);
        expect(v.unwrap).toThrowError(TypeError);
    });
});