import { describe, expect, it } from 'vitest';
import { Break, Continue, isControlFlow } from '../../src/mod.ts';

describe('ControlFlow', () => {
    describe('Break', () => {
        it('should have correct Symbol.toStringTag', () => {
            const flow = Break(42);
            expect(Object.prototype.toString.call(flow)).toBe('[object ControlFlow]');
        });

        it('toString() should return Break(value)', () => {
            expect(Break(42).toString()).toBe('Break(42)');
            expect(Break('error').toString()).toBe('Break(error)');
            expect(`${ Break('test') }`).toBe('Break(test)');
        });

        it('should support void Break()', () => {
            const flow = Break();
            expect(flow.isBreak()).toBe(true);
            expect(flow.breakValue().unwrap()).toBe(undefined);
        });

        it('isBreak() should return true', () => {
            const flow = Break(42);
            expect(flow.isBreak()).toBe(true);
        });

        it('isContinue() should return false', () => {
            const flow = Break(42);
            expect(flow.isContinue()).toBe(false);
        });

        it('breakValue() should return Some with the value', () => {
            const flow = Break('error');
            expect(flow.breakValue().isSome()).toBe(true);
            expect(flow.breakValue().unwrap()).toBe('error');
        });

        it('continueValue() should return None', () => {
            const flow = Break(42);
            expect(flow.continueValue().isNone()).toBe(true);
        });

        it('mapBreak() should transform the break value', () => {
            const flow = Break(5);
            const mapped = flow.mapBreak(v => v * 2);

            expect(mapped.isBreak()).toBe(true);
            expect(mapped.breakValue().unwrap()).toBe(10);
        });

        it('mapContinue() should not affect Break', () => {
            const flow = Break(5);
            const mapped = flow.mapContinue(v => String(v));

            expect(mapped.isBreak()).toBe(true);
            expect(mapped.breakValue().unwrap()).toBe(5);
        });

        it('breakOk() should return Ok with the break value', () => {
            const flow = Break('stopped');
            const result = flow.breakOk();

            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe('stopped');
        });

        it('continueOk() should return Err with the break value', () => {
            const flow = Break('stopped');
            const result = flow.continueOk();

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toBe('stopped');
        });

        it('should work with complex types', () => {
            const flow = Break({ code: 404, message: 'Not Found' });
            expect(flow.breakValue().unwrap()).toEqual({ code: 404, message: 'Not Found' });
        });
    });

    describe('Continue', () => {
        it('should have correct Symbol.toStringTag', () => {
            const flow = Continue(42);
            expect(Object.prototype.toString.call(flow)).toBe('[object ControlFlow]');
        });

        it('toString() should return Continue(value)', () => {
            expect(Continue(42).toString()).toBe('Continue(42)');
            expect(Continue('ok').toString()).toBe('Continue(ok)');
            expect(`${ Continue('test') }`).toBe('Continue(test)');
        });

        it('isContinue() should return true', () => {
            const flow = Continue();
            expect(flow.isContinue()).toBe(true);
        });

        it('isBreak() should return false', () => {
            const flow = Continue();
            expect(flow.isBreak()).toBe(false);
        });

        it('continueValue() should return Some(undefined) for void Continue', () => {
            const flow = Continue();
            expect(flow.continueValue().isSome()).toBe(true);
            expect(flow.continueValue().unwrap()).toBe(undefined);
        });

        it('continueValue() should return Some with value when provided', () => {
            const flow = Continue(42);
            expect(flow.continueValue().unwrap()).toBe(42);
        });

        it('breakValue() should return None', () => {
            const flow = Continue(42);
            expect(flow.breakValue().isNone()).toBe(true);
        });

        it('mapContinue() should transform the continue value', () => {
            const flow = Continue(5);
            const mapped = flow.mapContinue(v => v * 2);

            expect(mapped.isContinue()).toBe(true);
            expect(mapped.continueValue().unwrap()).toBe(10);
        });

        it('mapBreak() should not affect Continue', () => {
            const flow = Continue(5);
            const mapped = flow.mapBreak(v => String(v));

            expect(mapped.isContinue()).toBe(true);
            expect(mapped.continueValue().unwrap()).toBe(5);
        });

        it('continueOk() should return Ok with the continue value', () => {
            const flow = Continue('still going');
            const result = flow.continueOk();

            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe('still going');
        });

        it('breakOk() should return Err with the continue value', () => {
            const flow = Continue('still going');
            const result = flow.breakOk();

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toBe('still going');
        });
    });

    describe('isControlFlow', () => {
        it('should return true for Break', () => {
            expect(isControlFlow(Break(42))).toBe(true);
        });

        it('should return true for Continue', () => {
            expect(isControlFlow(Continue())).toBe(true);
            expect(isControlFlow(Continue(42))).toBe(true);
        });

        it('should return false for non-ControlFlow values', () => {
            expect(isControlFlow(null)).toBe(false);
            expect(isControlFlow(undefined)).toBe(false);
            expect(isControlFlow(42)).toBe(false);
            expect(isControlFlow('string')).toBe(false);
            expect(isControlFlow({ isBreak: () => true })).toBe(false);
            expect(isControlFlow([])).toBe(false);
        });
    });

    describe('practical usage', () => {
        it('should work for short-circuiting search', () => {
            function findFirst<T>(arr: T[], pred: (v: T) => boolean) {
                for (const item of arr) {
                    if (pred(item)) {
                        return Break(item);
                    }
                }
                return Continue();
            }

            const result = findFirst([1, 2, 3, 4, 5], v => v > 3);
            expect(result.isBreak()).toBe(true);
            expect(result.breakValue().unwrap()).toBe(4);

            const noResult = findFirst([1, 2, 3], v => v > 10);
            expect(noResult.isContinue()).toBe(true);
        });

        it('should work for tryFold pattern', () => {
            function trySum(numbers: number[], limit: number) {
                let acc = 0;
                for (const n of numbers) {
                    acc += n;
                    if (acc > limit) {
                        return Break(acc);
                    }
                }
                return Continue(acc);
            }

            const exceeded = trySum([1, 2, 3, 100, 5], 50);
            expect(exceeded.isBreak()).toBe(true);
            expect(exceeded.breakValue().unwrap()).toBe(106);

            const completed = trySum([1, 2, 3, 4, 5], 100);
            expect(completed.isContinue()).toBe(true);
            expect(completed.continueValue().unwrap()).toBe(15);
        });

        it('should work with async patterns', async () => {
            async function processUntilError(items: string[]) {
                for (const item of items) {
                    if (item === 'error') {
                        return Break(new Error(`Failed at: ${item}`));
                    }
                    await Promise.resolve(); // Simulate async work
                }
                return Continue('all done');
            }

            const withError = await processUntilError(['a', 'b', 'error', 'c']);
            expect(withError.isBreak()).toBe(true);
            expect(withError.breakValue().unwrap()).toBeInstanceOf(Error);

            const success = await processUntilError(['a', 'b', 'c']);
            expect(success.isContinue()).toBe(true);
            expect(success.continueValue().unwrap()).toBe('all done');
        });
    });

    describe('Immutability', () => {
        it('Break should be frozen', () => {
            const brk = Break('stopped');
            expect(Object.isFrozen(brk)).toBe(true);
        });

        it('Continue should be frozen', () => {
            const cont = Continue('value');
            expect(Object.isFrozen(cont)).toBe(true);
        });

        it('Break should prevent property modification', () => {
            const brk = Break('stopped');
            expect(() => {
                (brk as unknown as Record<string, unknown>)['isBreak'] = () => false;
            }).toThrow(TypeError);
        });

        it('Continue should prevent property modification', () => {
            const cont = Continue('value');
            expect(() => {
                (cont as unknown as Record<string, unknown>)['isContinue'] = () => false;
            }).toThrow(TypeError);
        });

        it('Break should prevent adding new properties', () => {
            const brk = Break('stopped');
            expect(() => {
                (brk as unknown as Record<string, unknown>)['newProp'] = 'test';
            }).toThrow(TypeError);
        });

        it('Continue should prevent adding new properties', () => {
            const cont = Continue('value');
            expect(() => {
                (cont as unknown as Record<string, unknown>)['newProp'] = 'test';
            }).toThrow(TypeError);
        });
    });
});
