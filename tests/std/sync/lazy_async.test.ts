import { describe, expect, it, vi } from 'vitest';
import { LazyAsync } from '../../../src/mod.ts';

describe('LazyAsync', () => {
    describe('initial state', () => {
        it('should not be initialized initially', () => {
            const lazy = LazyAsync(async () => 42);
            expect(lazy.isInitialized()).toBe(false);
        });

        it('should return None from get() initially', () => {
            const lazy = LazyAsync(async () => 42);
            expect(lazy.get().isNone()).toBe(true);
        });

        it('should not call fn on creation', () => {
            const fn = vi.fn(async () => 42);
            LazyAsync(fn);
            expect(fn).not.toHaveBeenCalled();
        });

        it('should have correct Symbol.toStringTag', () => {
            const lazy = LazyAsync(async () => 42);
            expect(Object.prototype.toString.call(lazy)).toBe('[object LazyAsync]');
        });

        it('toString() should show uninitialized state', () => {
            const lazy = LazyAsync(async () => 42);
            expect(lazy.toString()).toBe('LazyAsync(<uninitialized>)');
        });

        it('toString() should show value after initialization', async () => {
            const lazy = LazyAsync(async () => 42);
            await lazy.force();
            expect(lazy.toString()).toBe('LazyAsync(42)');
        });
    });

    describe('force', () => {
        it('should call fn and return value', async () => {
            const fn = vi.fn(async () => 42);
            const lazy = LazyAsync(fn);

            const value = await lazy.force();

            expect(value).toBe(42);
            expect(fn).toHaveBeenCalledTimes(1);
            expect(lazy.isInitialized()).toBe(true);
        });

        it('should not call fn on subsequent calls', async () => {
            const fn = vi.fn(async () => 42);
            const lazy = LazyAsync(fn);

            await lazy.force();
            const value = await lazy.force();

            expect(value).toBe(42);
            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('should handle concurrent calls correctly', async () => {
            let callCount = 0;
            const lazy = LazyAsync(async () => {
                await new Promise(r => setTimeout(r, 20));
                callCount++;
                return 42;
            });

            const results = await Promise.all([
                lazy.force(),
                lazy.force(),
                lazy.force(),
            ]);

            expect(callCount).toBe(1);
            expect(results).toEqual([42, 42, 42]);
            expect(lazy.isInitialized()).toBe(true);
        });

        it('should return same object reference', async () => {
            const lazy = LazyAsync(async () => ({ name: 'Alice' }));

            const value1 = await lazy.force();
            const value2 = await lazy.force();

            expect(value1).toBe(value2);
        });

        it('should return same Promise instance after initialization', async () => {
            const lazy = LazyAsync(async () => 42);

            await lazy.force();

            // After initialization, multiple force() calls should return the same Promise
            const promise1 = lazy.force();
            const promise2 = lazy.force();
            const promise3 = lazy.force();

            expect(promise1).toBe(promise2);
            expect(promise2).toBe(promise3);
        });
    });

    describe('get', () => {
        it('should return None when not initialized', () => {
            const lazy = LazyAsync(async () => 42);
            expect(lazy.get().isNone()).toBe(true);
        });

        it('should return None while initialization is in progress', async () => {
            const lazy = LazyAsync(async () => {
                await new Promise(r => setTimeout(r, 50));
                return 42;
            });

            const forcePromise = lazy.force();
            expect(lazy.get().isNone()).toBe(true);

            await forcePromise;
            expect(lazy.get().isSome()).toBe(true);
        });

        it('should return Some after force() completes', async () => {
            const lazy = LazyAsync(async () => 42);
            await lazy.force();

            const result = lazy.get();
            expect(result.isSome()).toBe(true);
            expect(result.unwrap()).toBe(42);
        });

        it('should not trigger initialization', () => {
            const fn = vi.fn(async () => 42);
            const lazy = LazyAsync(fn);

            lazy.get();
            lazy.get();

            expect(fn).not.toHaveBeenCalled();
        });
    });

    describe('isInitialized', () => {
        it('should return false before force()', () => {
            const lazy = LazyAsync(async () => 42);
            expect(lazy.isInitialized()).toBe(false);
        });

        it('should return false while initialization is in progress', async () => {
            const lazy = LazyAsync(async () => {
                await new Promise(r => setTimeout(r, 50));
                return 42;
            });

            const forcePromise = lazy.force();
            expect(lazy.isInitialized()).toBe(false);

            await forcePromise;
            expect(lazy.isInitialized()).toBe(true);
        });

        it('should return true after force() completes', async () => {
            const lazy = LazyAsync(async () => 42);
            await lazy.force();
            expect(lazy.isInitialized()).toBe(true);
        });
    });

    describe('edge cases', () => {
        it('should handle null values', async () => {
            const lazy = LazyAsync(async () => null);

            const value = await lazy.force();

            expect(value).toBe(null);
            expect(lazy.isInitialized()).toBe(true);
        });

        it('should handle undefined values', async () => {
            const lazy = LazyAsync(async () => undefined);

            const value = await lazy.force();

            expect(value).toBe(undefined);
            expect(lazy.isInitialized()).toBe(true);
        });

        it('should propagate errors from fn', async () => {
            const lazy = LazyAsync(async () => {
                throw new Error('init failed');
            });

            await expect(lazy.force()).rejects.toThrow('init failed');
            // Note: after throwing, the lazy is NOT initialized
            expect(lazy.isInitialized()).toBe(false);
        });

        it('should throw sync errors directly, not as rejected Promise', () => {
            const lazy = LazyAsync(() => {
                throw new Error('sync error');
            });
            // Sync error should be thrown directly, not wrapped in rejected Promise
            expect(() => lazy.force()).toThrow('sync error');
        });

        it('should allow retry after failed initialization', async () => {
            let shouldFail = true;
            const lazy = LazyAsync(async () => {
                if (shouldFail) {
                    throw new Error('init failed');
                }
                return 42;
            });

            // First attempt fails
            await expect(lazy.force()).rejects.toThrow('init failed');
            expect(lazy.isInitialized()).toBe(false);

            // Second attempt succeeds
            shouldFail = false;
            const value = await lazy.force();
            expect(value).toBe(42);
            expect(lazy.isInitialized()).toBe(true);
        });
    });

    describe('Immutability', () => {
        it('LazyAsync should be frozen', () => {
            const lazy = LazyAsync(async () => 42);
            expect(Object.isFrozen(lazy)).toBe(true);
        });

        it('LazyAsync should prevent property modification', () => {
            const lazy = LazyAsync(async () => 42);
            expect(() => {
                (lazy as unknown as Record<string, unknown>)['force'] = async () => 0;
            }).toThrow(TypeError);
        });

        it('LazyAsync should prevent adding new properties', () => {
            const lazy = LazyAsync(async () => 42);
            expect(() => {
                (lazy as unknown as Record<string, unknown>)['newProp'] = 'test';
            }).toThrow(TypeError);
        });
    });
});
