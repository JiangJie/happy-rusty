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
    });

    describe('getOrInitAsync', () => {
        it('should call async fn and return value', async () => {
            const once = Once<number>();
            const fn = vi.fn(async () => 42);

            const value = await once.getOrInitAsync(fn);

            expect(value).toBe(42);
            expect(fn).toHaveBeenCalledTimes(1);
            expect(once.isInitialized()).toBe(true);
        });

        it('should not call fn on subsequent calls', async () => {
            const once = Once<number>();
            const fn1 = vi.fn(async () => 42);
            const fn2 = vi.fn(async () => 100);

            await once.getOrInitAsync(fn1);
            const value = await once.getOrInitAsync(fn2);

            expect(value).toBe(42);
            expect(fn2).not.toHaveBeenCalled();
        });

        it('should handle concurrent calls correctly', async () => {
            const once = Once<number>();
            let callCount = 0;

            const results = await Promise.all([
                once.getOrInitAsync(async () => {
                    await new Promise(r => setTimeout(r, 20));
                    callCount++;
                    return 42;
                }),
                once.getOrInitAsync(async () => {
                    callCount++;
                    return 100;
                }),
                once.getOrInitAsync(async () => {
                    callCount++;
                    return 200;
                }),
            ]);

            expect(callCount).toBe(1);
            expect(results).toEqual([42, 42, 42]);
            expect(once.isInitialized()).toBe(true);
        });

        it('should return value when already initialized', async () => {
            const once = Once<number>();
            once.set(42);

            const fn = vi.fn(async () => 100);
            const value = await once.getOrInitAsync(fn);

            expect(value).toBe(42);
            expect(fn).not.toHaveBeenCalled();
        });

        it('should return same Promise instance after initialization', async () => {
            const once = Once<number>();
            await once.getOrInitAsync(async () => 42);

            // After initialization, multiple calls should return the same Promise
            const promise1 = once.getOrInitAsync(async () => 100);
            const promise2 = once.getOrInitAsync(async () => 200);
            const promise3 = once.getOrInitAsync(async () => 300);

            expect(promise1).toBe(promise2);
            expect(promise2).toBe(promise3);
        });

        it('should throw sync errors directly, not as rejected Promise', () => {
            const once = Once<number>();
            // Sync error should be thrown directly, not wrapped in rejected Promise
            expect(() => once.getOrInitAsync(() => {
                throw new Error('sync error');
            })).toThrow('sync error');
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
    });

    describe('getOrTryInitAsync', () => {
        it('should initialize on Ok result', async () => {
            const once = Once<number>();

            const result = await once.getOrTryInitAsync(async () => Ok(42));

            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe(42);
            expect(once.isInitialized()).toBe(true);
        });

        it('should not initialize on Err result', async () => {
            const once = Once<number>();

            const result = await once.getOrTryInitAsync(async () => Err<number, string>('failed'));

            expect(result.isErr()).toBe(true);
            expect(once.isInitialized()).toBe(false);
        });

        it('should return existing value without calling fn', async () => {
            const once = Once<number>();
            once.set(42);

            const fn = vi.fn(async () => Ok(100));
            const result = await once.getOrTryInitAsync(fn);

            expect(result.unwrap()).toBe(42);
            expect(fn).not.toHaveBeenCalled();
        });

        it('should allow retry after failed init', async () => {
            const once = Once<number>();

            // First attempt fails
            await once.getOrTryInitAsync(async () => Err<number, string>('error'));
            expect(once.isInitialized()).toBe(false);

            // Second attempt succeeds
            const result = await once.getOrTryInitAsync(async () => Ok(42));
            expect(result.unwrap()).toBe(42);
            expect(once.isInitialized()).toBe(true);
        });

        it('should handle concurrent getOrTryInitAsync calls', async () => {
            const once = Once<number>();
            let callCount = 0;

            const results = await Promise.all([
                once.getOrTryInitAsync(async () => {
                    await new Promise(r => setTimeout(r, 20));
                    callCount++;
                    return Ok(42);
                }),
                once.getOrTryInitAsync(async () => {
                    callCount++;
                    return Ok(100);
                }),
            ]);

            // First call succeeds, second waits and gets the same value
            // Only one initialization function should be called
            expect(callCount).toBe(1);
            expect(results[0].unwrap()).toBe(42);
            expect(results[1].unwrap()).toBe(42);
            expect(once.get().unwrap()).toBe(42);
        });

        it('should handle concurrent getOrTryInitAsync when first call succeeds', async () => {
            const once = Once<number>();
            const callOrder: string[] = [];

            // First call - slow but succeeds
            const p1 = once.getOrTryInitAsync(async () => {
                callOrder.push('fn1-start');
                await new Promise(r => setTimeout(r, 30));
                callOrder.push('fn1-end');
                return Ok(42);
            });

            // Give time for p1 to start and set pendingPromise
            await new Promise(r => setTimeout(r, 5));

            // Second call - should wait for first
            const p2 = once.getOrTryInitAsync(async () => {
                callOrder.push('fn2-called');
                return Ok(100);
            });

            const [r1, r2] = await Promise.all([p1, p2]);

            // Second function should never be called
            expect(callOrder).toEqual(['fn1-start', 'fn1-end']);
            expect(r1.unwrap()).toBe(42);
            expect(r2.unwrap()).toBe(42);
            expect(once.isInitialized()).toBe(true);
        });

        it('should allow second caller to retry when first call fails', async () => {
            const once = Once<number>();
            const callOrder: string[] = [];

            // First call - fails with Err
            const p1 = once.getOrTryInitAsync(async () => {
                callOrder.push('fn1-start');
                await new Promise(r => setTimeout(r, 30));
                callOrder.push('fn1-fail');
                return Err<number, string>('first failed');
            });

            // Give time for p1 to start and set pendingPromise
            await new Promise(r => setTimeout(r, 5));

            // Second call - should wait for first, then retry
            const p2 = once.getOrTryInitAsync(async () => {
                callOrder.push('fn2-called');
                return Ok(42);
            });

            const [r1, r2] = await Promise.all([p1, p2]);

            // First fails, second retries and succeeds
            expect(callOrder).toEqual(['fn1-start', 'fn1-fail', 'fn2-called']);
            expect(r1.isErr()).toBe(true);
            expect(r1.unwrapErr()).toBe('first failed');
            expect(r2.isOk()).toBe(true);
            expect(r2.unwrap()).toBe(42);
            expect(once.isInitialized()).toBe(true);
        });

        it('should throw sync errors directly, not as rejected Promise', () => {
            const once = Once<number>();

            // Sync error should be thrown directly, not wrapped in rejected Promise
            expect(() => once.getOrTryInitAsync(() => {
                throw new Error('sync error');
            })).toThrow('sync error');
        });

        it('should return same Promise instance after initialization', async () => {
            const once = Once<number>();
            await once.getOrTryInitAsync(async () => Ok(42));

            // After initialization, multiple calls should return the same Promise
            const promise1 = once.getOrTryInitAsync(async () => Ok(100));
            const promise2 = once.getOrTryInitAsync(async () => Ok(200));
            const promise3 = once.getOrTryInitAsync(async () => Ok(300));

            expect(promise1).toBe(promise2);
            expect(promise2).toBe(promise3);

            // And the value should be the original one
            const result = await promise1;
            expect(result.unwrap()).toBe(42);
        });

        it('should work correctly when destructured (no this binding issue)', async () => {
            const once = Once<number>();
            const { getOrTryInitAsync } = once;

            // First call with destructured method
            const result1 = await getOrTryInitAsync(async () => Ok(42));
            expect(result1.isOk()).toBe(true);
            expect(result1.unwrap()).toBe(42);

            // Second call should return cached value
            const result2 = await getOrTryInitAsync(async () => Ok(100));
            expect(result2.isOk()).toBe(true);
            expect(result2.unwrap()).toBe(42);
        });

        it('should retry correctly when destructured and first call fails', async () => {
            const once = Once<number>();
            const { getOrTryInitAsync } = once;
            let callCount = 0;

            // Simulate concurrent calls where first fails
            const p1 = getOrTryInitAsync(async () => {
                callCount++;
                await new Promise(resolve => setTimeout(resolve, 10));
                return Err<number, string>('first fails');
            });

            // Second call starts while first is pending
            const p2 = getOrTryInitAsync(async () => {
                callCount++;
                return Ok(42);
            });

            const [r1, r2] = await Promise.all([p1, p2]);

            expect(r1.isErr()).toBe(true);
            expect(r2.isOk()).toBe(true);
            expect(r2.unwrap()).toBe(42);
            expect(callCount).toBe(2); // First fails, second retries and succeeds
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

        it('should clear cached Promise after take', async () => {
            const once = Once<number>();
            once.set(42);

            // Get cached Promise
            const promise1 = once.getOrInitAsync(async () => 999);

            // Take the value
            once.take();

            // Reinitialize with new value
            once.set(100);

            // Should get a new Promise with new value
            const promise2 = once.getOrInitAsync(async () => 999);

            expect(promise1).not.toBe(promise2);
            expect(await promise1).toBe(42);
            expect(await promise2).toBe(100);
        });

        it('should clear cached Result Promise after take', async () => {
            const once = Once<number>();
            once.set(42);

            // Get cached Result Promise
            const promise1 = once.getOrTryInitAsync(async () => Ok(999));

            // Take the value
            once.take();

            // Reinitialize with new value
            once.set(100);

            // Should get a new Promise with new value
            const promise2 = once.getOrTryInitAsync(async () => Ok(999));

            expect(promise1).not.toBe(promise2);
            expect((await promise1).unwrap()).toBe(42);
            expect((await promise2).unwrap()).toBe(100);
        });
    });

    describe('mixed sync/async usage', () => {
        it('should work with sync getOrInit after async initialization', async () => {
            const once = Once<number>();

            // Initialize with async
            await once.getOrInitAsync(async () => 42);

            // Subsequent sync call returns same value
            const value = once.getOrInit(() => 100);
            expect(value).toBe(42);
        });

        it('should work with async getOrInitAsync after sync initialization', async () => {
            const once = Once<number>();

            // Initialize with sync
            once.getOrInit(() => 42);

            // Subsequent async call returns same value (as Promise)
            const promise = once.getOrInitAsync(async () => 100);
            expect(promise).toBeInstanceOf(Promise);
            const value = await promise;
            expect(value).toBe(42);
        });
    });

    describe('waitAsync', () => {
        it('should return immediately when already initialized', async () => {
            const once = Once<number>();
            once.set(42);

            const value = await once.waitAsync();
            expect(value).toBe(42);
        });

        it('should return same Promise instance after initialization', async () => {
            const once = Once<number>();
            once.set(42);

            // After initialization, multiple calls should return the same Promise
            const promise1 = once.waitAsync();
            const promise2 = once.waitAsync();
            const promise3 = once.waitAsync();

            expect(promise1).toBe(promise2);
            expect(promise2).toBe(promise3);
        });

        it('should wait for set() to be called', async () => {
            const once = Once<number>();

            // Start waiting
            const waitPromise = once.waitAsync();

            // Set value after a delay
            setTimeout(() => once.set(42), 10);

            const value = await waitPromise;
            expect(value).toBe(42);
        });

        it('should wait for getOrInit() to be called', async () => {
            const once = Once<number>();

            const waitPromise = once.waitAsync();

            setTimeout(() => once.getOrInit(() => 100), 10);

            const value = await waitPromise;
            expect(value).toBe(100);
        });

        it('should wait for getOrInitAsync() to complete', async () => {
            const once = Once<number>();

            const waitPromise = once.waitAsync();

            setTimeout(async () => {
                await once.getOrInitAsync(async () => {
                    await new Promise(r => setTimeout(r, 10));
                    return 200;
                });
            }, 5);

            const value = await waitPromise;
            expect(value).toBe(200);
        });

        it('should return pending promise if initialization is in progress', async () => {
            const once = Once<number>();

            // Start async initialization
            const initPromise = once.getOrInitAsync(async () => {
                await new Promise(r => setTimeout(r, 30));
                return 42;
            });

            // waitAsync should wait for the pending initialization
            const waitPromise = once.waitAsync();

            const [initValue, waitValue] = await Promise.all([initPromise, waitPromise]);

            expect(initValue).toBe(42);
            expect(waitValue).toBe(42);
        });

        it('should support multiple waiters', async () => {
            const once = Once<number>();

            // Multiple waiters
            const wait1 = once.waitAsync();
            const wait2 = once.waitAsync();
            const wait3 = once.waitAsync();

            // Set value after a delay
            setTimeout(() => once.set(42), 10);

            const [v1, v2, v3] = await Promise.all([wait1, wait2, wait3]);

            expect(v1).toBe(42);
            expect(v2).toBe(42);
            expect(v3).toBe(42);
        });

        it('should work with getOrTryInit() when successful', async () => {
            const once = Once<number>();

            const waitPromise = once.waitAsync();

            setTimeout(() => once.getOrTryInit(() => Ok(42)), 10);

            const value = await waitPromise;
            expect(value).toBe(42);
        });

        it('should not resolve when getOrTryInit() fails', async () => {
            const once = Once<number>();

            let resolved = false;
            const waitPromise = once.waitAsync().then(v => {
                resolved = true;
                return v;
            });

            // This fails, so waiter should not be notified
            once.getOrTryInit(() => Err<number, string>('error'));

            // Give some time
            await new Promise(r => setTimeout(r, 20));
            expect(resolved).toBe(false);

            // Now succeed
            once.getOrTryInit(() => Ok(42));

            const value = await waitPromise;
            expect(value).toBe(42);
            expect(resolved).toBe(true);
        });

        it('should work with getOrTryInitAsync() when successful', async () => {
            const once = Once<number>();

            const waitPromise = once.waitAsync();

            setTimeout(async () => {
                await once.getOrTryInitAsync(async () => Ok(42));
            }, 10);

            const value = await waitPromise;
            expect(value).toBe(42);
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
