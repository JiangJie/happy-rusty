import { describe, expect, it } from 'vitest';
import { Err, isOption, isResult, None, Ok, Some } from '../../../src/mod.ts';

describe('isOption', () => {
    describe('returns true for valid Option values', () => {
        it('should return true for Some', () => {
            expect(isOption(Some(5))).toBe(true);
            expect(isOption(Some('hello'))).toBe(true);
            expect(isOption(Some(null))).toBe(true);
            expect(isOption(Some(undefined))).toBe(true);
            expect(isOption(Some({}))).toBe(true);
            expect(isOption(Some([]))).toBe(true);
        });

        it('should return true for None', () => {
            expect(isOption(None)).toBe(true);
        });

        it('should return true for nested Option', () => {
            expect(isOption(Some(Some(5)))).toBe(true);
            expect(isOption(Some(None))).toBe(true);
        });
    });

    describe('returns false for non-Option values', () => {
        it('should return false for null and undefined', () => {
            expect(isOption(null)).toBe(false);
            expect(isOption(undefined)).toBe(false);
        });

        it('should return false for primitives', () => {
            expect(isOption(5)).toBe(false);
            expect(isOption('hello')).toBe(false);
            expect(isOption(true)).toBe(false);
            expect(isOption(Symbol('test'))).toBe(false);
            expect(isOption(BigInt(123))).toBe(false);
        });

        it('should return false for plain objects and arrays', () => {
            expect(isOption({})).toBe(false);
            expect(isOption({ value: 5 })).toBe(false);
            expect(isOption([])).toBe(false);
            expect(isOption([1, 2, 3])).toBe(false);
        });

        it('should return false for functions', () => {
            expect(isOption(() => {})).toBe(false);
            expect(isOption(function() {})).toBe(false);
        });

        it('should return false for Result values', () => {
            expect(isOption(Ok(5))).toBe(false);
            expect(isOption(Err('error'))).toBe(false);
        });

        it('should return false for objects mimicking Option structure', () => {
            expect(isOption({ isSome: () => true, isNone: () => false })).toBe(false);
            expect(isOption({ [Symbol.toStringTag]: 'Option' })).toBe(false);
        });
    });
});

describe('isResult', () => {
    describe('returns true for valid Result values', () => {
        it('should return true for Ok', () => {
            expect(isResult(Ok(5))).toBe(true);
            expect(isResult(Ok('hello'))).toBe(true);
            expect(isResult(Ok(null))).toBe(true);
            expect(isResult(Ok(undefined))).toBe(true);
            expect(isResult(Ok({}))).toBe(true);
            expect(isResult(Ok([]))).toBe(true);
        });

        it('should return true for Ok with void', () => {
            expect(isResult(Ok())).toBe(true);
        });

        it('should return true for Err', () => {
            expect(isResult(Err('error'))).toBe(true);
            expect(isResult(Err(new Error('error')))).toBe(true);
            expect(isResult(Err(null))).toBe(true);
            expect(isResult(Err(123))).toBe(true);
        });

        it('should return true for nested Result', () => {
            expect(isResult(Ok(Ok(5)))).toBe(true);
            expect(isResult(Ok(Err('error')))).toBe(true);
            expect(isResult(Err(Ok(5)))).toBe(true);
        });
    });

    describe('returns false for non-Result values', () => {
        it('should return false for null and undefined', () => {
            expect(isResult(null)).toBe(false);
            expect(isResult(undefined)).toBe(false);
        });

        it('should return false for primitives', () => {
            expect(isResult(5)).toBe(false);
            expect(isResult('hello')).toBe(false);
            expect(isResult(true)).toBe(false);
            expect(isResult(Symbol('test'))).toBe(false);
            expect(isResult(BigInt(123))).toBe(false);
        });

        it('should return false for plain objects and arrays', () => {
            expect(isResult({})).toBe(false);
            expect(isResult({ value: 5 })).toBe(false);
            expect(isResult([])).toBe(false);
            expect(isResult([1, 2, 3])).toBe(false);
        });

        it('should return false for functions', () => {
            expect(isResult(() => {})).toBe(false);
            expect(isResult(function() {})).toBe(false);
        });

        it('should return false for Option values', () => {
            expect(isResult(Some(5))).toBe(false);
            expect(isResult(None)).toBe(false);
        });

        it('should return false for objects mimicking Result structure', () => {
            expect(isResult({ isOk: () => true, isErr: () => false })).toBe(false);
            expect(isResult({ [Symbol.toStringTag]: 'Result' })).toBe(false);
        });
    });
});
