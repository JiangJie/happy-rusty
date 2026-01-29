import { describe, expect, it, vi } from 'vitest';
import { FnOnceAsync } from '../../../src/mod.ts';

describe('FnOnceAsync', () => {
    describe('creation', () => {
        it('should have correct Symbol.toStringTag', () => {
            const fn = FnOnceAsync(async () => 42);
            expect(Object.prototype.toString.call(fn)).toBe('[object FnOnceAsync]');
        });

        it('toString() should return FnOnceAsync(pending) before call', () => {
            const fn = FnOnceAsync(async () => 42);
            expect(fn.toString()).toBe('FnOnceAsync(pending)');
        });

        it('toString() should return FnOnceAsync(consumed) after call', async () => {
            const fn = FnOnceAsync(async () => 42);
            await fn.call();
            expect(fn.toString()).toBe('FnOnceAsync(consumed)');
        });
    });

    describe('call', () => {
        it('should call the async function and return its result', async () => {
            const fn = FnOnceAsync(async () => 42);
            expect(await fn.call()).toBe(42);
        });

        it('should flatten nested Promise (Awaited<T>)', async () => {
            // fn returns Promise<Promise<number>>, but Promise.resolve flattens it
            const fn = FnOnceAsync(() => Promise.resolve(Promise.resolve(42)));
            const result = await fn.call();
            // Runtime: result is 42 (number), not Promise<42>
            expect(result).toBe(42);
        });

        it('should work with sync return value', async () => {
            const fn = FnOnceAsync(() => 42);
            const result = await fn.call();
            expect(result).toBe(42);
        });

        it('should pass arguments to the async function', async () => {
            const fn = FnOnceAsync(async (a: number, b: number) => a + b);
            expect(await fn.call(2, 3)).toBe(5);
        });

        it('should throw on second call', async () => {
            const fn = FnOnceAsync(async () => 'hello');
            await fn.call();
            expect(() => fn.call()).toThrow('FnOnceAsync has already been consumed');
        });

        it('should actually execute the function only once', async () => {
            const mockFn = vi.fn(async () => 'result');
            const fn = FnOnceAsync(mockFn);

            await fn.call();
            expect(mockFn).toHaveBeenCalledTimes(1);

            expect(() => fn.call()).toThrow();
            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        it('should work with void async functions', async () => {
            let called = false;
            const fn = FnOnceAsync(async () => {
                called = true;
            });

            await fn.call();
            expect(called).toBe(true);
        });

        it('should work with delayed async functions', async () => {
            const fn = FnOnceAsync(async (x: number) => {
                await new Promise(resolve => setTimeout(resolve, 10));
                return x * 2;
            });
            const result = await fn.call(21);
            expect(result).toBe(42);
        });

        it('should propagate async errors as rejected Promise', async () => {
            const fn = FnOnceAsync(async () => {
                throw new Error('async error');
            });
            await expect(fn.call()).rejects.toThrow('async error');
        });

        it('should throw sync errors directly, not as rejected Promise', () => {
            const fn = FnOnceAsync(() => {
                throw new Error('sync error');
            });
            // Sync error should be thrown directly, not wrapped in rejected Promise
            expect(() => fn.call()).toThrow('sync error');
        });
    });

    describe('tryCall', () => {
        it('should return Some with result on first call', async () => {
            const fn = FnOnceAsync(async () => 42);
            const result = await fn.tryCall();
            expect(result.isSome()).toBe(true);
            expect(result.unwrap()).toBe(42);
        });

        it('should return None on subsequent calls', async () => {
            const fn = FnOnceAsync(async () => 42);
            await fn.tryCall();
            const result = await fn.tryCall();
            expect(result.isNone()).toBe(true);
        });

        it('should pass arguments to the async function', async () => {
            const fn = FnOnceAsync(async (name: string) => `Hello, ${name}!`);
            const result = await fn.tryCall('World');
            expect(result.unwrap()).toBe('Hello, World!');
        });

        it('should not throw on subsequent calls', async () => {
            const fn = FnOnceAsync(async () => 'test');
            await fn.tryCall();
            await expect(fn.tryCall()).resolves.toBeDefined();
        });

        it('should actually execute the function only once', async () => {
            const mockFn = vi.fn(async () => 'result');
            const fn = FnOnceAsync(mockFn);

            await fn.tryCall();
            await fn.tryCall();
            await fn.tryCall();

            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        it('should return rejected Promise for async errors', async () => {
            const fn = FnOnceAsync(async () => {
                throw new Error('async error');
            });
            await expect(fn.tryCall()).rejects.toThrow('async error');
        });

        it('should throw sync errors directly, not as rejected Promise', () => {
            const fn = FnOnceAsync(() => {
                throw new Error('sync error');
            });
            // Sync error should be thrown directly, not wrapped in rejected Promise
            expect(() => fn.tryCall()).toThrow('sync error');
        });

        it('should allow easier unwrapOr usage', async () => {
            const asyncFn = FnOnceAsync(async (x: number) => x * 2);

            const result1 = (await asyncFn.tryCall(21)).unwrapOr(0);
            expect(result1).toBe(42);

            // Second call returns None, so unwrapOr gives default
            const result2 = (await asyncFn.tryCall(21)).unwrapOr(0);
            expect(result2).toBe(0);
        });
    });

    describe('isConsumed', () => {
        it('should return false before call', () => {
            const fn = FnOnceAsync(async () => { });
            expect(fn.isConsumed()).toBe(false);
        });

        it('should return true after call()', async () => {
            const fn = FnOnceAsync(async () => { });
            await fn.call();
            expect(fn.isConsumed()).toBe(true);
        });

        it('should return true after tryCall()', async () => {
            const fn = FnOnceAsync(async () => { });
            await fn.tryCall();
            expect(fn.isConsumed()).toBe(true);
        });
    });

    describe('PromiseLike compatibility', () => {
        it('should accept functions returning PromiseLike', async () => {
            // Create a custom thenable (PromiseLike)
            const customThenable = {
                then<TResult1, TResult2>(
                    onfulfilled?: ((value: number) => TResult1 | PromiseLike<TResult1>) | null,
                    _onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
                ): PromiseLike<TResult1 | TResult2> {
                    return Promise.resolve(onfulfilled ? onfulfilled(42) : 42 as unknown as TResult1);
                },
            };

            const fn = FnOnceAsync(() => customThenable);
            const result = await fn.call();
            expect(result).toBe(42);
        });

        it('should work with native Promise', async () => {
            const fn = FnOnceAsync(() => Promise.resolve(42));
            const result = await fn.call();
            expect(result).toBe(42);
        });
    });

    describe('use cases', () => {
        it('should work as one-time async cleanup function', async () => {
            let cleanupCount = 0;
            const cleanup = FnOnceAsync(async () => {
                await new Promise(resolve => setTimeout(resolve, 1));
                cleanupCount++;
            });

            await cleanup.tryCall();
            await cleanup.tryCall();
            await cleanup.tryCall();

            expect(cleanupCount).toBe(1);
        });

        it('should work with async resource disposal pattern', async () => {
            const events: string[] = [];

            function createAsyncResource() {
                events.push('created');
                return {
                    dispose: FnOnceAsync(async () => {
                        await new Promise(resolve => setTimeout(resolve, 1));
                        events.push('disposed');
                    }),
                };
            }

            const resource = createAsyncResource();
            await resource.dispose.call();

            expect(() => resource.dispose.call()).toThrow();
            expect(events).toEqual(['created', 'disposed']);
        });

        it('should work as one-time async initializer', async () => {
            const initConfig = FnOnceAsync(async () => {
                await new Promise(resolve => setTimeout(resolve, 1));
                return {
                    timeout: 3000,
                    retries: 3,
                };
            });

            const config1 = await initConfig.tryCall();
            const config2 = await initConfig.tryCall();

            expect(config1.isSome()).toBe(true);
            expect(config1.unwrap()).toEqual({ timeout: 3000, retries: 3 });
            expect(config2.isNone()).toBe(true);
        });

        it('should work for one-time data fetching', async () => {
            const fetchUser = FnOnceAsync(async (id: number) => {
                // Simulate async fetch
                await new Promise(resolve => setTimeout(resolve, 1));
                return { id, name: `User${id}` };
            });

            const user = await fetchUser.call(1);
            expect(user).toEqual({ id: 1, name: 'User1' });

            // Second call throws
            expect(() => fetchUser.call(2)).toThrow('FnOnceAsync has already been consumed');
        });
    });
});
