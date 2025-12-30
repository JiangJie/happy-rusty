import { describe, expect, it, vi } from 'vitest';
import { Err, Ok, OnceAsync } from '../../../src/mod.ts';

describe('OnceAsync', () => {
    describe('initial state', () => {
        it('should not be initialized initially', () => {
            const once = OnceAsync<number>();
            expect(once.isInitialized()).toBe(false);
        });

        it('should return None from get() initially', () => {
            const once = OnceAsync<number>();
            expect(once.get().isNone()).toBe(true);
        });

        it('should have correct Symbol.toStringTag', () => {
            const once = OnceAsync<number>();
            expect(Object.prototype.toString.call(once)).toBe('[object OnceAsync]');
        });

        it('toString() should show uninitialized state', () => {
            const once = OnceAsync<number>();
            expect(once.toString()).toBe('OnceAsync(<uninitialized>)');
        });

        it('toString() should show value after initialization', async () => {
            const once = OnceAsync<number>();
            await once.getOrInit(async () => 42);
            expect(once.toString()).toBe('OnceAsync(42)');
        });
    });

    describe('set', () => {
        it('should set value and return Ok on first call', () => {
            const once = OnceAsync<number>();

            const result = once.set(42);
            expect(result.isOk()).toBe(true);
            expect(once.get().unwrap()).toBe(42);
            expect(once.isInitialized()).toBe(true);
        });

        it('should return Err with value on second call', () => {
            const once = OnceAsync<number>();

            once.set(42);
            const result = once.set(100);

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toBe(100);
            expect(once.get().unwrap()).toBe(42);
        });
    });

    describe('tryInsert', () => {
        it('should set value and return Ok with value on first call', () => {
            const once = OnceAsync<number>();

            const result = once.tryInsert(42);
            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe(42);
        });

        it('should return Err with [current, passed] on second call', () => {
            const once = OnceAsync<number>();

            once.tryInsert(42);
            const result = once.tryInsert(100);

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toEqual([42, 100]);
        });
    });

    describe('get', () => {
        it('should return None when not initialized', () => {
            const once = OnceAsync<number>();
            expect(once.get().isNone()).toBe(true);
        });

        it('should return Some with value when initialized', async () => {
            const once = OnceAsync<number>();
            await once.getOrInit(async () => 42);

            const result = once.get();
            expect(result.isSome()).toBe(true);
            expect(result.unwrap()).toBe(42);
        });
    });

    describe('getOrInit', () => {
        it('should call async fn and return value', async () => {
            const once = OnceAsync<number>();
            const fn = vi.fn(async () => 42);

            const value = await once.getOrInit(fn);

            expect(fn).toHaveBeenCalledTimes(1);
            expect(value).toBe(42);
            expect(once.get().unwrap()).toBe(42);
        });

        it('should not call fn on subsequent calls', async () => {
            const once = OnceAsync<number>();
            const fn = vi.fn(async () => 42);

            await once.getOrInit(fn);
            const value = await once.getOrInit(fn);

            expect(fn).toHaveBeenCalledTimes(1);
            expect(value).toBe(42);
        });

        it('should handle concurrent calls correctly', async () => {
            const once = OnceAsync<number>();
            let callCount = 0;
            const fn = async () => {
                callCount++;
                await new Promise(r => setTimeout(r, 20));
                return 42;
            };

            const [v1, v2, v3] = await Promise.all([
                once.getOrInit(fn),
                once.getOrInit(fn),
                once.getOrInit(fn),
            ]);

            expect(callCount).toBe(1);
            expect(v1).toBe(42);
            expect(v2).toBe(42);
            expect(v3).toBe(42);
        });

        it('should return value when already initialized', async () => {
            const once = OnceAsync<number>();
            once.set(42);

            const value = await once.getOrInit(async () => 100);
            expect(value).toBe(42);
        });

        it('should return same Promise instance after initialization', async () => {
            const once = OnceAsync<number>();
            once.set(42);

            const promise1 = once.getOrInit(async () => 100);
            const promise2 = once.getOrInit(async () => 100);
            const promise3 = once.getOrInit(async () => 100);

            expect(promise1).toBe(promise2);
            expect(promise2).toBe(promise3);
        });

        it('should throw sync errors directly, not as rejected Promise', () => {
            const once = OnceAsync<number>();

            expect(() => {
                once.getOrInit(() => {
                    throw new Error('sync error');
                });
            }).toThrow('sync error');
        });

        it('should work with sync return value', async () => {
            const once = OnceAsync<number>();
            const value = await once.getOrInit(() => 42);

            expect(value).toBe(42);
            expect(once.get().unwrap()).toBe(42);
        });

        it('should store awaited value (Awaited<T> behavior)', async () => {
            // OnceAsync<Promise<number>> behaves same as OnceAsync<number>
            // because stored value is always Awaited<T>
            const once = OnceAsync<Promise<number>>();
            const result = await once.getOrInit(() => Promise.resolve(Promise.resolve(42)));

            // The returned value is 42 (fully awaited)
            expect(result).toBe(42);

            // The stored value is also 42 (fully awaited), not Promise<42>
            const option = once.get();
            expect(option.isSome()).toBe(true);
            expect(option.unwrap()).toBe(42);
        });
    });

    describe('getOrTryInit', () => {
        it('should initialize on Ok result', async () => {
            const once = OnceAsync<number>();

            const result = await once.getOrTryInit(async () => Ok(42));

            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe(42);
            expect(once.isInitialized()).toBe(true);
        });

        it('should not initialize on Err result', async () => {
            const once = OnceAsync<number>();

            const result = await once.getOrTryInit(async () => Err<number, string>('error'));

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toBe('error');
            expect(once.isInitialized()).toBe(false);
        });

        it('should return existing value without calling fn', async () => {
            const once = OnceAsync<number>();
            once.set(42);

            const fn = vi.fn(async () => Ok(100));
            const result = await once.getOrTryInit(fn);

            expect(fn).not.toHaveBeenCalled();
            expect(result.unwrap()).toBe(42);
        });

        it('should allow retry after failed init', async () => {
            const once = OnceAsync<number>();

            const result1 = await once.getOrTryInit(async () => Err<number, string>('error'));
            expect(result1.isErr()).toBe(true);
            expect(once.isInitialized()).toBe(false);

            const result2 = await once.getOrTryInit(async () => Ok(42));
            expect(result2.isOk()).toBe(true);
            expect(result2.unwrap()).toBe(42);
            expect(once.isInitialized()).toBe(true);
        });

        it('should handle concurrent calls correctly', async () => {
            const once = OnceAsync<number>();
            let callCount = 0;

            const fn = async () => {
                callCount++;
                await new Promise(r => setTimeout(r, 20));
                return Ok(42);
            };

            const [r1, r2, r3] = await Promise.all([
                once.getOrTryInit(fn),
                once.getOrTryInit(fn),
                once.getOrTryInit(fn),
            ]);

            expect(callCount).toBe(1);
            expect(r1.unwrap()).toBe(42);
            expect(r2.unwrap()).toBe(42);
            expect(r3.unwrap()).toBe(42);
        });

        it('should allow second caller to retry when first call fails', async () => {
            const once = OnceAsync<number>();
            const callOrder: string[] = [];

            // First call - will fail
            const p1 = once.getOrTryInit(async () => {
                callOrder.push('first-start');
                await new Promise(r => setTimeout(r, 10));
                callOrder.push('first-end');
                return Err<number, string>('first-error');
            });

            // Wait a bit to ensure first call starts
            await new Promise(r => setTimeout(r, 5));

            // Second call - should wait then retry and succeed
            const p2 = once.getOrTryInit(async () => {
                callOrder.push('second-start');
                await new Promise(r => setTimeout(r, 10));
                callOrder.push('second-end');
                return Ok(42);
            });

            const [r1, r2] = await Promise.all([p1, p2]);

            expect(r1.isErr()).toBe(true);
            expect(r2.isOk()).toBe(true);
            expect(r2.unwrap()).toBe(42);
            expect(callOrder).toEqual(['first-start', 'first-end', 'second-start', 'second-end']);
        });

        it('should throw sync errors directly, not as rejected Promise', () => {
            const once = OnceAsync<number>();

            expect(() => {
                once.getOrTryInit(() => {
                    throw new Error('sync error');
                });
            }).toThrow('sync error');
        });

        it('should store Awaited<T> value via getOrTryInit', async () => {
            // OnceAsync<Promise<number>> stores number (Awaited<Promise<number>>)
            // getOrTryInit expects Result<Awaited<T>, E> = Result<number, E>
            const once = OnceAsync<Promise<number>>();
            const result = await once.getOrTryInit(() => Ok(42)); // Ok(Awaited<Promise<number>>)

            // The Result contains 42 (already awaited)
            expect(result.unwrap()).toBe(42);

            // The stored value is also 42
            const option = once.get();
            expect(option.isSome()).toBe(true);
            expect(option.unwrap()).toBe(42);
        });
    });

    describe('take', () => {
        it('should return None when not initialized', () => {
            const once = OnceAsync<number>();
            expect(once.take().isNone()).toBe(true);
        });

        it('should return Some and reset', async () => {
            const once = OnceAsync<number>();
            await once.getOrInit(async () => 42);

            const taken = once.take();
            expect(taken.isSome()).toBe(true);
            expect(taken.unwrap()).toBe(42);
            expect(once.isInitialized()).toBe(false);
            expect(once.get().isNone()).toBe(true);
        });

        it('should allow reinitializing after take', async () => {
            const once = OnceAsync<number>();
            await once.getOrInit(async () => 42);

            once.take();
            const value = await once.getOrInit(async () => 100);

            expect(value).toBe(100);
            expect(once.get().unwrap()).toBe(100);
        });

        it('should clear cached Promise after take', async () => {
            const once = OnceAsync<number>();
            once.set(42);

            const promise1 = once.getOrInit(async () => 100);
            once.take();
            once.set(200);
            const promise2 = once.getOrInit(async () => 300);

            // promise1 and promise2 should be different instances
            expect(promise1).not.toBe(promise2);
            expect(await promise1).toBe(42);  // Original value
            expect(await promise2).toBe(200); // New value after take
        });
    });

    describe('wait', () => {
        it('should return immediately when already initialized', async () => {
            const once = OnceAsync<number>();
            once.set(42);

            const value = await once.wait();
            expect(value).toBe(42);
        });

        it('should return same Promise instance after initialization', async () => {
            const once = OnceAsync<number>();
            once.set(42);

            const promise1 = once.wait();
            const promise2 = once.wait();
            const promise3 = once.wait();

            expect(promise1).toBe(promise2);
            expect(promise2).toBe(promise3);
        });

        it('should wait for set() to be called', async () => {
            const once = OnceAsync<number>();

            const waitPromise = once.wait();
            setTimeout(() => once.set(42), 10);

            const value = await waitPromise;
            expect(value).toBe(42);
        });

        it('should wait for getOrInit() to complete', async () => {
            const once = OnceAsync<number>();

            const waitPromise = once.wait();
            setTimeout(async () => {
                await once.getOrInit(async () => 42);
            }, 10);

            const value = await waitPromise;
            expect(value).toBe(42);
        });

        it('should return pending promise if initialization is in progress', async () => {
            const once = OnceAsync<number>();

            // Start slow initialization
            const initPromise = once.getOrInit(async () => {
                await new Promise(r => setTimeout(r, 30));
                return 42;
            });

            // wait() should return the pending promise
            const waitPromise = once.wait();

            const [initValue, waitValue] = await Promise.all([initPromise, waitPromise]);
            expect(initValue).toBe(42);
            expect(waitValue).toBe(42);
        });

        it('should support multiple waiters', async () => {
            const once = OnceAsync<number>();

            const wait1 = once.wait();
            const wait2 = once.wait();
            const wait3 = once.wait();

            setTimeout(() => once.set(42), 10);

            const [v1, v2, v3] = await Promise.all([wait1, wait2, wait3]);

            expect(v1).toBe(42);
            expect(v2).toBe(42);
            expect(v3).toBe(42);
        });
    });

    describe('cross-method interactions', () => {
        it('getOrTryInit should wait for pending getOrInit', async () => {
            const once = OnceAsync<number>();
            const callOrder: string[] = [];

            // Start getOrInit - slow operation
            const p1 = once.getOrInit(async () => {
                callOrder.push('init-start');
                await new Promise(r => setTimeout(r, 30));
                callOrder.push('init-end');
                return 42;
            });

            // Give time for p1 to start
            await new Promise(r => setTimeout(r, 5));

            // Start getOrTryInit - should wait for getOrInit
            const p2 = once.getOrTryInit(async () => {
                callOrder.push('try-called');
                return Ok(100);
            });

            const [r1, r2] = await Promise.all([p1, p2]);

            // getOrTryInit should NOT call its fn, just wait for getOrInit
            expect(callOrder).toEqual(['init-start', 'init-end']);
            expect(r1).toBe(42);
            expect(r2.unwrap()).toBe(42);
        });
    });

    describe('mixed sync/async usage', () => {
        it('should work with set after async initialization', async () => {
            const once = OnceAsync<number>();

            await once.getOrInit(async () => 42);

            // set should fail because already initialized
            const result = once.set(100);
            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toBe(100);
            expect(once.get().unwrap()).toBe(42);
        });

        it('should work with async getOrInit after sync set', async () => {
            const once = OnceAsync<number>();

            once.set(42);

            // Async call should return existing value
            const value = await once.getOrInit(async () => 100);
            expect(value).toBe(42);
        });
    });

    describe('Immutability', () => {
        it('OnceAsync should be frozen', () => {
            const once = OnceAsync<number>();
            expect(Object.isFrozen(once)).toBe(true);
        });

        it('OnceAsync should prevent property modification', () => {
            const once = OnceAsync<number>();
            expect(() => {
                (once as unknown as Record<string, unknown>)['get'] = () => null;
            }).toThrow(TypeError);
        });

        it('OnceAsync should prevent adding new properties', () => {
            const once = OnceAsync<number>();
            expect(() => {
                (once as unknown as Record<string, unknown>)['newProp'] = 'test';
            }).toThrow(TypeError);
        });

        it('OnceAsync<number> basic operations', async () => {
            const once = OnceAsync<number>();
            once.set(1);

            const getResult = once.get();
            expect(getResult.unwrap()).toBe(1);

            const initResult = once.getOrInit(() => 2);
            expect(initResult).toBeInstanceOf(Promise);
            expect(await initResult).toBe(1); // Returns existing value

            const tryInitResult = await once.getOrTryInit(() => Promise.resolve(Ok(2)));
            expect(tryInitResult.isOk()).toBe(true);
            expect(tryInitResult.unwrap()).toBe(1); // Returns existing value
        });

        it('OnceAsync<Promise<number>> stores Awaited<T> (number)', async () => {
            // When T = Promise<number>, stored type is Awaited<T> = number
            const once = OnceAsync<Promise<number>>();

            // set() expects Awaited<T> = number
            once.set(1);

            // get() returns Option<Awaited<T>> = Option<number>
            const getResult = once.get();
            expect(getResult.unwrap()).toBe(1);

            // getOrInit returns Promise<Awaited<T>> = Promise<number>
            const initResult = once.getOrInit(() => Promise.resolve(2));
            expect(initResult).toBeInstanceOf(Promise);
            expect(await initResult).toBe(1); // Returns existing value

            // getOrTryInit expects fn returning Result<Awaited<T>, E> = Result<number, E>
            const tryInitResult = await once.getOrTryInit(() => Promise.resolve(Ok(2)));
            expect(tryInitResult.isOk()).toBe(true);
            expect(tryInitResult.unwrap()).toBe(1); // Returns existing value
        });
    });
});
