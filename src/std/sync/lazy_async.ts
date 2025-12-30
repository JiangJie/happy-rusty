/**
 * @module
 * Rust-inspired [LazyLock](https://doc.rust-lang.org/std/sync/struct.LazyLock.html) for async lazy initialization.
 *
 * **When to use `Lazy<T>` vs `LazyAsync<T>`:**
 * - Use `Lazy<T>` for sync-only initialization
 * - Use `LazyAsync<T>` for async initialization with concurrent call handling
 */

import { None, Some, type Option } from '../../core/mod.ts';

/**
 * A value which is initialized asynchronously on the first access.
 *
 * The initialization function can return `PromiseLike<T>` or `T`.
 * If multiple calls to `force()` occur concurrently before initialization
 * completes, only one initialization will run.
 *
 * @typeParam T - The type of the value stored.
 *
 * @see {@link Lazy} for sync-only lazy initialization
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
     */
    readonly [Symbol.toStringTag]: 'LazyAsync';

    /**
     * Custom `toString` implementation.
     * @example
     * ```ts
     * const lazy = LazyAsync(async () => 42);
     * console.log(lazy.toString()); // 'LazyAsync(<uninitialized>)'
     *
     * await lazy.force();
     * console.log(lazy.toString()); // 'LazyAsync(42)'
     * ```
     */
    toString(): string;

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
    force(): Promise<Awaited<T>>;

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
    get(): Option<Awaited<T>>;

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
 * Creates a new `LazyAsync<T>` with the given async initialization function.
 *
 * The function is called at most once, on first access via `force()`.
 * Concurrent calls to `force()` before initialization completes will
 * wait for the single initialization to finish.
 *
 * @typeParam T - The type of value to store.
 * @param fn - A function that returns `PromiseLike<T>` or `T` to initialize.
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
export function LazyAsync<T>(fn: () => PromiseLike<T> | T): LazyAsync<T> {
    let value: Awaited<T> | undefined;
    let initialized = false;
    let pendingPromise: Promise<Awaited<T>> | undefined;

    return Object.freeze<LazyAsync<T>>({
        [Symbol.toStringTag]: 'LazyAsync',

        toString(): string {
            return initialized ? `LazyAsync(${ value })` : 'LazyAsync(<uninitialized>)';
        },

        // Use `Promise.resolve(fn())` instead of `async` to preserve sync error behavior:
        // sync throws propagate directly, async errors become rejected Promises.
        force(): Promise<Awaited<T>> {
            if (initialized) {
                // Reuse cached promise to avoid creating new Promise on each call
                return pendingPromise ??= Promise.resolve(value as Awaited<T>);
            }

            if (pendingPromise) {
                return pendingPromise;
            }

            pendingPromise = Promise.resolve(fn()).then(
                (result) => {
                    value = result;
                    initialized = true;
                    return result;
                },
            ).catch((err) => {
                // Only clear on failure to allow retry
                pendingPromise = undefined;
                throw err;
            });

            return pendingPromise;
        },

        get(): Option<Awaited<T>> {
            return initialized ? Some(value as Awaited<T>) : None;
        },

        isInitialized(): boolean {
            return initialized;
        },
    } as const);
}
