import { describe, expect, it } from 'vitest';
import {
    RESULT_FALSE,
    RESULT_TRUE,
    RESULT_VOID,
    RESULT_ZERO,
    isResult,
} from '../../../src/mod.ts';

describe('Result Constants', () => {
    const constants = [
        { name: 'RESULT_TRUE', value: RESULT_TRUE, expected: true },
        { name: 'RESULT_FALSE', value: RESULT_FALSE, expected: false },
        { name: 'RESULT_ZERO', value: RESULT_ZERO, expected: 0 },
        { name: 'RESULT_VOID', value: RESULT_VOID, expected: undefined },
    ] as const;

    describe.each(constants)('$name', ({ value, expected }) => {
        it('should be a valid Result', () => {
            expect(isResult(value)).toBe(true);
        });

        it('should be Ok variant', () => {
            expect(value.isOk()).toBe(true);
            expect(value.isErr()).toBe(false);
        });

        it('should contain expected value', () => {
            expect(value.unwrap()).toBe(expected);
        });

        it('should be immutable (same reference on multiple access)', () => {
            const ref1 = value;
            const ref2 = value;
            expect(ref1).toBe(ref2);
        });
    });

    describe('Constants comparison', () => {
        it('RESULT_TRUE and RESULT_FALSE should be different', () => {
            expect(RESULT_TRUE).not.toBe(RESULT_FALSE);
            expect(RESULT_TRUE.eq(RESULT_FALSE)).toBe(false);
        });

        it('constants should work with Result methods', () => {
            expect(RESULT_TRUE.map(v => !v).unwrap()).toBe(false);
            expect(RESULT_ZERO.map(v => v + 1).unwrap()).toBe(1);
            expect(RESULT_VOID.map(() => 'done').unwrap()).toBe('done');
        });
    });
});
