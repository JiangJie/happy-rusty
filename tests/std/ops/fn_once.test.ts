import { describe, expect, it, vi } from 'vitest';
import { FnOnce } from '../../../src/mod.ts';

describe('FnOnce', () => {
    describe('creation', () => {
        it('should have correct Symbol.toStringTag', () => {
            const fn = FnOnce(() => 42);
            expect(Object.prototype.toString.call(fn)).toBe('[object FnOnce]');
        });

        it('toString() should return FnOnce(pending) before call', () => {
            const fn = FnOnce(() => 42);
            expect(fn.toString()).toBe('FnOnce(pending)');
        });

        it('toString() should return FnOnce(consumed) after call', () => {
            const fn = FnOnce(() => 42);
            fn.call();
            expect(fn.toString()).toBe('FnOnce(consumed)');
        });
    });

    describe('call', () => {
        it('should call the function and return its result', () => {
            const fn = FnOnce(() => 42);
            expect(fn.call()).toBe(42);
        });

        it('should pass arguments to the function', () => {
            const fn = FnOnce((a: number, b: number) => a + b);
            expect(fn.call(2, 3)).toBe(5);
        });

        it('should throw on second call', () => {
            const fn = FnOnce(() => 'hello');
            fn.call();
            expect(() => fn.call()).toThrow('FnOnce has already been consumed');
        });

        it('should actually execute the function only once', () => {
            const mockFn = vi.fn(() => 'result');
            const fn = FnOnce(mockFn);

            fn.call();
            expect(mockFn).toHaveBeenCalledTimes(1);

            expect(() => fn.call()).toThrow();
            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        it('should work with void functions', () => {
            let called = false;
            const fn = FnOnce(() => {
                called = true;
            });

            fn.call();
            expect(called).toBe(true);
        });
    });

    describe('tryCall', () => {
        it('should return Some with result on first call', () => {
            const fn = FnOnce(() => 42);
            const result = fn.tryCall();
            expect(result.isSome()).toBe(true);
            expect(result.unwrap()).toBe(42);
        });

        it('should return None on subsequent calls', () => {
            const fn = FnOnce(() => 42);
            fn.tryCall();
            const result = fn.tryCall();
            expect(result.isNone()).toBe(true);
        });

        it('should pass arguments to the function', () => {
            const fn = FnOnce((name: string) => `Hello, ${name}!`);
            const result = fn.tryCall('World');
            expect(result.unwrap()).toBe('Hello, World!');
        });

        it('should not throw on subsequent calls', () => {
            const fn = FnOnce(() => 'test');
            fn.tryCall();
            expect(() => fn.tryCall()).not.toThrow();
        });

        it('should actually execute the function only once', () => {
            const mockFn = vi.fn(() => 'result');
            const fn = FnOnce(mockFn);

            fn.tryCall();
            fn.tryCall();
            fn.tryCall();

            expect(mockFn).toHaveBeenCalledTimes(1);
        });
    });

    describe('isConsumed', () => {
        it('should return false before call', () => {
            const fn = FnOnce(() => { });
            expect(fn.isConsumed()).toBe(false);
        });

        it('should return true after call()', () => {
            const fn = FnOnce(() => { });
            fn.call();
            expect(fn.isConsumed()).toBe(true);
        });

        it('should return true after tryCall()', () => {
            const fn = FnOnce(() => { });
            fn.tryCall();
            expect(fn.isConsumed()).toBe(true);
        });
    });

    describe('use cases', () => {
        it('should work as one-time cleanup function', () => {
            let cleanupCount = 0;
            const cleanup = FnOnce(() => {
                cleanupCount++;
            });

            cleanup.tryCall();
            cleanup.tryCall();
            cleanup.tryCall();

            expect(cleanupCount).toBe(1);
        });

        it('should work with resource disposal pattern', () => {
            const events: string[] = [];

            function createResource() {
                events.push('created');
                return {
                    dispose: FnOnce(() => {
                        events.push('disposed');
                    }),
                };
            }

            const resource = createResource();
            resource.dispose.call();

            expect(() => resource.dispose.call()).toThrow();
            expect(events).toEqual(['created', 'disposed']);
        });

        it('should work as one-time event handler', () => {
            const clicks: number[] = [];
            const onFirstClick = FnOnce((x: number) => {
                clicks.push(x);
            });

            // Simulate multiple clicks
            for (let i = 1; i <= 5; i++) {
                onFirstClick.tryCall(i);
            }

            expect(clicks).toEqual([1]); // Only first click recorded
        });

        it('should work with callbacks that return values', () => {
            const initConfig = FnOnce(() => ({
                timeout: 3000,
                retries: 3,
            }));

            const config1 = initConfig.tryCall();
            const config2 = initConfig.tryCall();

            expect(config1.isSome()).toBe(true);
            expect(config1.unwrap()).toEqual({ timeout: 3000, retries: 3 });
            expect(config2.isNone()).toBe(true);
        });
    });
});
