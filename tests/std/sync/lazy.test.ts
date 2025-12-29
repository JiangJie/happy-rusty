import { describe, expect, it, vi } from 'vitest';
import { Lazy } from '../../../src/mod.ts';

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

    describe('Immutability', () => {
        it('Lazy should be frozen', () => {
            const lazy = Lazy(() => 42);
            expect(Object.isFrozen(lazy)).toBe(true);
        });

        it('Lazy should prevent property modification', () => {
            const lazy = Lazy(() => 42);
            expect(() => {
                (lazy as unknown as Record<string, unknown>)['force'] = () => 0;
            }).toThrow(TypeError);
        });

        it('Lazy should prevent adding new properties', () => {
            const lazy = Lazy(() => 42);
            expect(() => {
                (lazy as unknown as Record<string, unknown>)['newProp'] = 'test';
            }).toThrow(TypeError);
        });
    });
});
