/**
 * @fileoverview
 * Rust-inspired [LazyLock](https://doc.rust-lang.org/std/sync/struct.LazyLock.html) for lazy initialization.
 *
 * `Lazy<T>` is a value which is initialized on the first access. Unlike `Once<T>`,
 * the initialization function is provided at construction time.
 */

import { None, Some, type Option } from '../enum/mod.ts';

/**
 * A value which is initialized on the first access.
 *
 * This is a lazily evaluated value. The initialization function is provided
 * at construction time and executed on first access. Subsequent accesses
 * return the cached value.
 *
 * Unlike `Once<T>`, which allows setting values manually or with different
 * initializers, `Lazy<T>` binds the initializer at creation time.
 *
 * @typeParam T - The type of the value stored.
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
     *
     * @internal
     */
    readonly [Symbol.toStringTag]: 'Lazy';

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
 * A value which is initialized asynchronously on the first access.
 *
 * Similar to `Lazy<T>`, but the initialization function is async.
 * If multiple calls to `force()` occur concurrently before initialization
 * completes, only one initialization will run.
 *
 * @typeParam T - The type of the value stored.
 *
 * @example
 * ```ts
 * const db = LazyAsync(async () => {
 *     console.log('Connecting...');
 *     return await Database.connect(url);
 * });
 *
 * // Multiple concurrent accesses - only one connection
 * const [db1, db2] = await Promise.all([
 *     db.force(),
 *     db.force(),
 * ]);
 * // db1 === db2
 * ```
 */
export interface LazyAsync<T> {
    /**
     * The well-known symbol `Symbol.toStringTag` used by `Object.prototype.toString()`.
     * Returns `'LazyAsync'` so that `Object.prototype.toString.call(lazy)` produces `'[object LazyAsync]'`.
     *
     * @internal
     */
    readonly [Symbol.toStringTag]: 'LazyAsync';

    /**
     * Forces the evaluation of this lazy value and returns a promise to the result.
     *
     * If the value has already been initialized, returns the cached value.
     * If initialization is in progress, waits for it to complete.
     * Otherwise, starts initialization.
     *
     * @returns A promise that resolves to the initialized value.
     *
     * @example
     * ```ts
     * const lazy = LazyAsync(async () => {
     *     await delay(100);
     *     return 42;
     * });
     * console.log(await lazy.force()); // 42
     * ```
     */
    force(): Promise<T>;

    /**
     * Gets the value if it has been initialized.
     *
     * Unlike `force()`, this does not trigger initialization.
     *
     * @returns `Some(value)` if initialized, `None` otherwise.
     *
     * @example
     * ```ts
     * const lazy = LazyAsync(async () => 42);
     * console.log(lazy.get()); // None
     *
     * await lazy.force();
     * console.log(lazy.get()); // Some(42)
     * ```
     */
    get(): Option<T>;

    /**
     * Returns `true` if the value has been initialized.
     *
     * Note: Returns `false` while initialization is in progress.
     *
     * @example
     * ```ts
     * const lazy = LazyAsync(async () => 42);
     * console.log(lazy.isInitialized()); // false
     *
     * await lazy.force();
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

/**
 * Creates a new `LazyAsync<T>` with the given async initialization function.
 *
 * The function is called at most once, on first access via `force()`.
 * Concurrent calls to `force()` before initialization completes will
 * wait for the single initialization to finish.
 *
 * @typeParam T - The type of value to store.
 * @param fn - The async initialization function that produces the value.
 * @returns A new `LazyAsync<T>` instance.
 *
 * @example
 * ```ts
 * // Basic usage
 * const lazy = LazyAsync(async () => {
 *     const response = await fetch('/api/data');
 *     return await response.json();
 * });
 *
 * const data = await lazy.force();
 * ```
 *
 * @example
 * ```ts
 * // Database connection singleton
 * const db = LazyAsync(async () => {
 *     console.log('Connecting to database...');
 *     return await Database.connect(connectionString);
 * });
 *
 * async function getDb(): Promise<Database> {
 *     return await db.force();
 * }
 *
 * // Multiple calls - connection happens only once
 * const [db1, db2] = await Promise.all([getDb(), getDb()]);
 * console.log(db1 === db2); // true
 * ```
 *
 * @example
 * ```ts
 * // Configuration loader
 * const config = LazyAsync(async () => {
 *     const response = await fetch('/api/config');
 *     if (!response.ok) {
 *         throw new Error(`Failed to load config: ${response.status}`);
 *     }
 *     return await response.json() as Config;
 * });
 *
 * // Used throughout the app
 * async function getApiEndpoint(): Promise<string> {
 *     const cfg = await config.force();
 *     return cfg.apiEndpoint;
 * }
 * ```
 */
export function LazyAsync<T>(fn: () => Promise<T>): LazyAsync<T> {
    let value: T | undefined;
    let initialized = false;
    let pendingPromise: Promise<T> | undefined;

    return Object.freeze<LazyAsync<T>>({
        [Symbol.toStringTag]: 'LazyAsync',

        async force(): Promise<T> {
            if (initialized) {
                return value as T;
            }

            if (pendingPromise) {
                return pendingPromise;
            }

            pendingPromise = (async () => {
                try {
                    const result = await fn();
                    value = result;
                    initialized = true;
                    return result;
                } finally {
                    pendingPromise = undefined;
                }
            })();

            return pendingPromise;
        },

        get(): Option<T> {
            return initialized ? Some(value as T) : None;
        },

        isInitialized(): boolean {
            return initialized;
        },
    } as const);
}
