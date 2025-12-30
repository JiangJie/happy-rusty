import { describe, expect, it, vi } from 'vitest';
import { Err, Ok, Once } from '../../../src/mod.ts';

describe('Once', () => {
    describe('initial state', () => {
        it('should not be initialized initially', () => {
            const once = Once<number>();
            expect(once.isInitialized()).toBe(false);
        });

        it('should return None from get() initially', () => {
            const once = Once<number>();
            expect(once.get().isNone()).toBe(true);
        });

        it('should have correct Symbol.toStringTag', () => {
            const once = Once<number>();
            expect(Object.prototype.toString.call(once)).toBe('[object Once]');
        });

        it('toString() should show uninitialized state', () => {
            const once = Once<number>();
            expect(once.toString()).toBe('Once(<uninitialized>)');
        });

        it('toString() should show value after initialization', () => {
            const once = Once<number>();
            once.set(42);
            expect(once.toString()).toBe('Once(42)');
        });
    });

    describe('set', () => {
        it('should set value and return Ok on first call', () => {
            const once = Once<number>();
            const result = once.set(42);

            expect(result.isOk()).toBe(true);
            expect(once.isInitialized()).toBe(true);
            expect(once.get().unwrap()).toBe(42);
        });

        it('should return Err with value on second call', () => {
            const once = Once<number>();
            once.set(42);

            const result = once.set(100);

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toBe(100);
            expect(once.get().unwrap()).toBe(42); // Original value unchanged
        });
    });

    describe('tryInsert', () => {
        it('should set value and return Ok with value on first call', () => {
            const once = Once<number>();
            const result = once.tryInsert(42);

            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe(42);
            expect(once.isInitialized()).toBe(true);
            expect(once.get().unwrap()).toBe(42);
        });

        it('should return Err with [current, passed] on second call', () => {
            const once = Once<number>();
            once.tryInsert(42);

            const result = once.tryInsert(100);

            expect(result.isErr()).toBe(true);
            const [current, passed] = result.unwrapErr();
            expect(current).toBe(42);
            expect(passed).toBe(100);
            expect(once.get().unwrap()).toBe(42); // Original value unchanged
        });

        it('should work with complex types', () => {
            const once = Once<{ id: number; }>();

            const result = once.tryInsert({ id: 1 });

            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toEqual({ id: 1 });
        });

        it('should return current value in error tuple', () => {
            const once = Once<string>();
            once.set('first');

            const result = once.tryInsert('second');

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toEqual(['first', 'second']);
        });
    });

    describe('get', () => {
        it('should return None when not initialized', () => {
            const once = Once<string>();
            expect(once.get().isNone()).toBe(true);
        });

        it('should return Some with value when initialized', () => {
            const once = Once<string>();
            once.set('hello');

            const result = once.get();
            expect(result.isSome()).toBe(true);
            expect(result.unwrap()).toBe('hello');
        });
    });

    describe('getOrInit', () => {
        it('should call fn and return value on first call', () => {
            const once = Once<number>();
            const fn = vi.fn(() => 42);

            const value = once.getOrInit(fn);

            expect(value).toBe(42);
            expect(fn).toHaveBeenCalledTimes(1);
            expect(once.isInitialized()).toBe(true);
        });

        it('should not call fn on subsequent calls', () => {
            const once = Once<number>();
            const fn1 = vi.fn(() => 42);
            const fn2 = vi.fn(() => 100);

            once.getOrInit(fn1);
            const value = once.getOrInit(fn2);

            expect(value).toBe(42);
            expect(fn1).toHaveBeenCalledTimes(1);
            expect(fn2).not.toHaveBeenCalled();
        });

        it('should work with complex types', () => {
            const once = Once<{ name: string; }>();

            const value = once.getOrInit(() => ({ name: 'Alice' }));

            expect(value).toEqual({ name: 'Alice' });
        });

        it('should store Promise as-is (not awaited)', () => {
            // When using sync getOrInit with a Promise value,
            // the Promise itself is stored, not its resolved value.
            const once = Once<Promise<number>>();

            const promise = Promise.resolve(42);
            const value = once.getOrInit(() => promise);

            expect(value).toBe(promise);
            expect(value).toBeInstanceOf(Promise);
        });
    });

    describe('getOrTryInit', () => {
        it('should initialize on Ok result', () => {
            const once = Once<number>();

            const result = once.getOrTryInit(() => Ok(42));

            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe(42);
            expect(once.isInitialized()).toBe(true);
        });

        it('should not initialize on Err result', () => {
            const once = Once<number>();

            const result = once.getOrTryInit(() => Err('failed'));

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toBe('failed');
            expect(once.isInitialized()).toBe(false);
        });

        it('should return existing value without calling fn', () => {
            const once = Once<number>();
            once.set(42);

            const fn = vi.fn(() => Ok(100));
            const result = once.getOrTryInit(fn);

            expect(result.unwrap()).toBe(42);
            expect(fn).not.toHaveBeenCalled();
        });

        it('should allow retry after failed init', () => {
            const once = Once<number>();

            // First attempt fails
            const result1 = once.getOrTryInit(() => Err('error'));
            expect(result1.isErr()).toBe(true);
            expect(once.isInitialized()).toBe(false);

            // Second attempt succeeds
            const result2 = once.getOrTryInit(() => Ok(42));
            expect(result2.isOk()).toBe(true);
            expect(result2.unwrap()).toBe(42);
            expect(once.isInitialized()).toBe(true);
        });

        it('should store Promise wrapped in Ok (not awaited)', () => {
            // When using getOrTryInit with Result<Promise<T>, E>,
            // the inner Promise is stored as-is, not awaited.
            const once = Once<Promise<number>>();

            const promise = Promise.resolve(42);
            const result = once.getOrTryInit(() => Ok(promise));

            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe(promise);
            expect(result.unwrap()).toBeInstanceOf(Promise);
            expect(once.get().unwrap()).toBe(promise);
        });
    });

    describe('take', () => {
        it('should return None when not initialized', () => {
            const once = Once<number>();
            expect(once.take().isNone()).toBe(true);
        });

        it('should return Some and reset', () => {
            const once = Once<number>();
            once.set(42);

            const taken = once.take();

            expect(taken.isSome()).toBe(true);
            expect(taken.unwrap()).toBe(42);
            expect(once.isInitialized()).toBe(false);
            expect(once.get().isNone()).toBe(true);
        });

        it('should allow reinitializing after take', () => {
            const once = Once<number>();
            once.set(42);
            once.take();

            const result = once.set(100);

            expect(result.isOk()).toBe(true);
            expect(once.get().unwrap()).toBe(100);
        });
    });

    describe('Immutability', () => {
        it('Once should be frozen', () => {
            const once = Once<number>();
            expect(Object.isFrozen(once)).toBe(true);
        });

        it('Once should prevent property modification', () => {
            const once = Once<number>();
            expect(() => {
                (once as unknown as Record<string, unknown>)['get'] = () => null;
            }).toThrow(TypeError);
        });

        it('Once should prevent adding new properties', () => {
            const once = Once<number>();
            expect(() => {
                (once as unknown as Record<string, unknown>)['newProp'] = 'test';
            }).toThrow(TypeError);
        });
    });
});
