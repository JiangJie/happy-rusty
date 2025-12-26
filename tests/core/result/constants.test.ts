import { describe, expect, it } from 'vitest';
import {
    RESULT_FALSE,
    RESULT_TRUE,
    RESULT_VOID,
    RESULT_ZERO,
    isResult,
} from '../../../src/mod.ts';

describe('Result Constants', () => {
    describe('RESULT_TRUE', () => {
        it('should be a valid Result', () => {
            expect(isResult(RESULT_TRUE)).toBe(true);
        });

        it('should be Ok variant', () => {
            expect(RESULT_TRUE.isOk()).toBe(true);
            expect(RESULT_TRUE.isErr()).toBe(false);
        });

        it('should contain true', () => {
            expect(RESULT_TRUE.unwrap()).toBe(true);
        });

        it('should be immutable (same reference on multiple access)', () => {
            const ref1 = RESULT_TRUE;
            const ref2 = RESULT_TRUE;
            expect(ref1).toBe(ref2);
        });
    });

    describe('RESULT_FALSE', () => {
        it('should be a valid Result', () => {
            expect(isResult(RESULT_FALSE)).toBe(true);
        });

        it('should be Ok variant', () => {
            expect(RESULT_FALSE.isOk()).toBe(true);
            expect(RESULT_FALSE.isErr()).toBe(false);
        });

        it('should contain false', () => {
            expect(RESULT_FALSE.unwrap()).toBe(false);
        });

        it('should be immutable (same reference on multiple access)', () => {
            const ref1 = RESULT_FALSE;
            const ref2 = RESULT_FALSE;
            expect(ref1).toBe(ref2);
        });
    });

    describe('RESULT_ZERO', () => {
        it('should be a valid Result', () => {
            expect(isResult(RESULT_ZERO)).toBe(true);
        });

        it('should be Ok variant', () => {
            expect(RESULT_ZERO.isOk()).toBe(true);
            expect(RESULT_ZERO.isErr()).toBe(false);
        });

        it('should contain 0', () => {
            expect(RESULT_ZERO.unwrap()).toBe(0);
        });

        it('should be immutable (same reference on multiple access)', () => {
            const ref1 = RESULT_ZERO;
            const ref2 = RESULT_ZERO;
            expect(ref1).toBe(ref2);
        });
    });

    describe('RESULT_VOID', () => {
        it('should be a valid Result', () => {
            expect(isResult(RESULT_VOID)).toBe(true);
        });

        it('should be Ok variant', () => {
            expect(RESULT_VOID.isOk()).toBe(true);
            expect(RESULT_VOID.isErr()).toBe(false);
        });

        it('should contain undefined (void)', () => {
            expect(RESULT_VOID.unwrap()).toBeUndefined();
        });

        it('should be immutable (same reference on multiple access)', () => {
            const ref1 = RESULT_VOID;
            const ref2 = RESULT_VOID;
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
