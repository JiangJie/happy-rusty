import { describe, expect, it, vi } from 'vitest';
import { Lazy, LazyAsync } from '../../src/mod.ts';

describe('Lazy', () => {
    describe('initial state', () => {
        it('should not be initialized initially', () => {
            const lazy = Lazy(() => 42);
            expect(lazy.isInitialized()).toBe(false);
        });

        it('should return None from get() initially', () => {
            const lazy = Lazy(() => 42);
            expect(lazy.get().isNone()).toBe(true);
        });

        it('should not call fn on creation', () => {
            const fn = vi.fn(() => 42);
            Lazy(fn);
            expect(fn).not.toHaveBeenCalled();
        });

        it('should have correct Symbol.toStringTag', () => {
            const lazy = Lazy(() => 42);
            expect(Object.prototype.toString.call(lazy)).toBe('[object Lazy]');
        });

        it('toString() should show uninitialized state', () => {
            const lazy = Lazy(() => 42);
            expect(lazy.toString()).toBe('Lazy(<uninitialized>)');
        });

        it('toString() should show value after initialization', () => {
            const lazy = Lazy(() => 42);
            lazy.force();
            expect(lazy.toString()).toBe('Lazy(42)');
        });
    });

    describe('force', () => {
        it('should call fn and return value on first call', () => {
            const fn = vi.fn(() => 42);
            const lazy = Lazy(fn);

            const value = lazy.force();

            expect(value).toBe(42);
            expect(fn).toHaveBeenCalledTimes(1);
            expect(lazy.isInitialized()).toBe(true);
        });

        it('should not call fn on subsequent calls', () => {
            const fn = vi.fn(() => 42);
            const lazy = Lazy(fn);

            lazy.force();
            const value = lazy.force();

            expect(value).toBe(42);
            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('should work with complex types', () => {
            const lazy = Lazy(() => ({ name: 'Alice', age: 30 }));

            const value = lazy.force();

            expect(value).toEqual({ name: 'Alice', age: 30 });
        });

        it('should return same object reference', () => {
            const lazy = Lazy(() => ({ name: 'Alice' }));

            const value1 = lazy.force();
            const value2 = lazy.force();

            expect(value1).toBe(value2);
        });
    });

    describe('get', () => {
        it('should return None when not initialized', () => {
            const lazy = Lazy(() => 42);
            expect(lazy.get().isNone()).toBe(true);
        });

        it('should return Some after force()', () => {
            const lazy = Lazy(() => 42);
            lazy.force();

            const result = lazy.get();
            expect(result.isSome()).toBe(true);
            expect(result.unwrap()).toBe(42);
        });

        it('should not trigger initialization', () => {
            const fn = vi.fn(() => 42);
            const lazy = Lazy(fn);

            lazy.get();
            lazy.get();

            expect(fn).not.toHaveBeenCalled();
            expect(lazy.isInitialized()).toBe(false);
        });
    });

    describe('isInitialized', () => {
        it('should return false before force()', () => {
            const lazy = Lazy(() => 42);
            expect(lazy.isInitialized()).toBe(false);
        });

        it('should return true after force()', () => {
            const lazy = Lazy(() => 42);
            lazy.force();
            expect(lazy.isInitialized()).toBe(true);
        });
    });

    describe('edge cases', () => {
        it('should handle null values', () => {
            const lazy = Lazy(() => null);

            const value = lazy.force();

            expect(value).toBe(null);
            expect(lazy.isInitialized()).toBe(true);
        });

        it('should handle undefined values', () => {
            const lazy = Lazy(() => undefined);

            const value = lazy.force();

            expect(value).toBe(undefined);
            expect(lazy.isInitialized()).toBe(true);
        });

        it('should propagate errors from fn', () => {
            const lazy = Lazy(() => {
                throw new Error('init failed');
            });

            expect(() => lazy.force()).toThrow('init failed');
            // Note: after throwing, the lazy is NOT initialized
            expect(lazy.isInitialized()).toBe(false);
        });
    });
});

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
        it('Lazy should be frozen', () => {
            const lazy = Lazy(() => 42);
            expect(Object.isFrozen(lazy)).toBe(true);
        });

        it('LazyAsync should be frozen', () => {
            const lazy = LazyAsync(async () => 42);
            expect(Object.isFrozen(lazy)).toBe(true);
        });

        it('Lazy should prevent property modification', () => {
            const lazy = Lazy(() => 42);
            expect(() => {
                (lazy as unknown as Record<string, unknown>)['force'] = () => 0;
            }).toThrow(TypeError);
        });

        it('LazyAsync should prevent property modification', () => {
            const lazy = LazyAsync(async () => 42);
            expect(() => {
                (lazy as unknown as Record<string, unknown>)['force'] = async () => 0;
            }).toThrow(TypeError);
        });

        it('Lazy should prevent adding new properties', () => {
            const lazy = Lazy(() => 42);
            expect(() => {
                (lazy as unknown as Record<string, unknown>)['newProp'] = 'test';
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
