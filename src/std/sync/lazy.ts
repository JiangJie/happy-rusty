/**
 * @module
 * Rust-inspired [LazyLock](https://doc.rust-lang.org/std/sync/struct.LazyLock.html) for lazy initialization.
 *
 * Unlike `Once<T>`, which allows setting values manually or with different
 * initializers, `Lazy<T>` binds the initializer at creation time.
 *
 * **When to use `Lazy<T>` vs `LazyAsync<T>`:**
 * - Use `Lazy<T>` for sync-only initialization
 * - Use `LazyAsync<T>` for async initialization with concurrent call handling
 */

import { None, Some, type Option } from '../../core/mod.ts';

/**
 * A value which is initialized on the first access.
 *
 * The initialization function is provided at construction time and executed
 * on first access. Subsequent accesses return the cached value.
 *
 * @typeParam T - The type of the value stored.
 *
 * @see {@link LazyAsync} for async lazy initialization
 * @see https://doc.rust-lang.org/std/sync/struct.LazyLock.html
 *
 * @example
 * ```ts
 * const expensive = Lazy(() => {
 *     console.log('Computing...');
 *     return heavyComputation();
 * });
 *
 * // Nothing computed yet
 * console.log(expensive.isInitialized()); // false
 *
 * // First access triggers computation
 * const value = expensive.force(); // logs "Computing..."
 *
 * // Subsequent access returns cached value
 * const same = expensive.force(); // no log, returns cached value
 * ```
 */
export interface Lazy<T> {
    /**
     * The well-known symbol `Symbol.toStringTag` used by `Object.prototype.toString()`.
     * Returns `'Lazy'` so that `Object.prototype.toString.call(lazy)` produces `'[object Lazy]'`.
     */
    readonly [Symbol.toStringTag]: 'Lazy';

    /**
     * Custom `toString` implementation.
     * @example
     * ```ts
     * const lazy = Lazy(() => 42);
     * console.log(lazy.toString()); // 'Lazy(<uninitialized>)'
     *
     * lazy.force();
     * console.log(lazy.toString()); // 'Lazy(42)'
     * ```
     */
    toString(): string;

    /**
     * Forces the evaluation of this lazy value and returns the result.
     *
     * If the value has already been initialized, returns the cached value.
     * Otherwise, executes the initialization function, caches the result,
     * and returns it.
     *
     * @returns The initialized value.
     *
     * @example
     * ```ts
     * const lazy = Lazy(() => 42);
     * console.log(lazy.force()); // 42
     * console.log(lazy.force()); // 42 (cached)
     * ```
     */
    force(): T;

    /**
     * Gets the value if it has been initialized.
     *
     * Unlike `force()`, this does not trigger initialization.
     *
     * @returns `Some(value)` if initialized, `None` otherwise.
     *
     * @example
     * ```ts
     * const lazy = Lazy(() => 42);
     * console.log(lazy.get()); // None
     *
     * lazy.force();
     * console.log(lazy.get()); // Some(42)
     * ```
     */
    get(): Option<T>;

    /**
     * Returns `true` if the value has been initialized.
     *
     * @example
     * ```ts
     * const lazy = Lazy(() => 42);
     * console.log(lazy.isInitialized()); // false
     *
     * lazy.force();
     * console.log(lazy.isInitialized()); // true
     * ```
     */
    isInitialized(): boolean;
}

/**
 * Creates a new `Lazy<T>` with the given synchronous initialization function.
 *
 * The function is called at most once, on first access via `force()`.
 *
 * @typeParam T - The type of value to store.
 * @param fn - The initialization function that produces the value.
 * @returns A new `Lazy<T>` instance.
 *
 * @example
 * ```ts
 * // Basic usage
 * const lazy = Lazy(() => {
 *     console.log('Initializing');
 *     return 42;
 * });
 *
 * console.log(lazy.isInitialized()); // false
 * console.log(lazy.force()); // logs "Initializing", returns 42
 * console.log(lazy.isInitialized()); // true
 * console.log(lazy.force()); // returns 42 (no log)
 * ```
 *
 * @example
 * ```ts
 * // Lazy singleton pattern
 * const logger = Lazy(() => new Logger('app'));
 *
 * function getLogger(): Logger {
 *     return logger.force();
 * }
 * ```
 *
 * @example
 * ```ts
 * // Expensive computation
 * const fibonacci = Lazy(() => {
 *     function fib(n: number): number {
 *         if (n <= 1) return n;
 *         return fib(n - 1) + fib(n - 2);
 *     }
 *     return fib(40); // Only computed once
 * });
 * ```
 */
export function Lazy<T>(fn: () => T): Lazy<T> {
    let value: T | undefined;
    let initialized = false;

    return Object.freeze<Lazy<T>>({
        [Symbol.toStringTag]: 'Lazy',

        toString(): string {
            return initialized ? `Lazy(${ value })` : 'Lazy(<uninitialized>)';
        },

        force(): T {
            if (!initialized) {
                value = fn();
                initialized = true;
            }
            return value as T;
        },

        get(): Option<T> {
            return initialized ? Some(value as T) : None;
        },

        isInitialized(): boolean {
            return initialized;
        },
    } as const);
}
