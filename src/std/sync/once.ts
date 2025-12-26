/**
 * @fileoverview
 * Rust-inspired [OnceLock](https://doc.rust-lang.org/std/sync/struct.OnceLock.html) for one-time initialization.
 *
 * `Once<T>` is a container which can be written to only once. It provides safe access
 * to lazily initialized data, supporting both sync and async initialization.
 */

import { Err, None, Ok, Some, type AsyncResult, type Option, type Result } from '../../core/mod.ts';

/**
 * A container which can be written to only once.
 *
 * This is useful for lazy initialization of global data or expensive computations
 * that should only happen once. Supports both synchronous and asynchronous
 * initialization functions via separate methods.
 *
 * @typeParam T - The type of the value stored.
 *
 * @example
 * ```ts
 * const once = Once<number>();
 *
 * // Set value (only works once)
 * once.set(42); // Ok(undefined)
 * once.set(100); // Err(100) - already set
 *
 * // Get value
 * console.log(once.get()); // Some(42)
 * ```
 *
 * @example
 * ```ts
 * // Sync lazy initialization
 * const config = Once<Config>();
 * const cfg = config.getOrInit(() => loadConfigFromFile());
 * ```
 *
 * @example
 * ```ts
 * // Async lazy initialization
 * const db = Once<Database>();
 * const conn = await db.getOrInitAsync(async () => Database.connect(url));
 * ```
 */
export interface Once<T> {
    /**
     * The well-known symbol `Symbol.toStringTag` used by `Object.prototype.toString()`.
     * Returns `'Once'` so that `Object.prototype.toString.call(once)` produces `'[object Once]'`.
     */
    readonly [Symbol.toStringTag]: 'Once';

    /**
     * Custom `toString` implementation.
     * @example
     * ```ts
     * const once = Once<number>();
     * console.log(once.toString()); // 'Once(<uninitialized>)'
     *
     * once.set(42);
     * console.log(once.toString()); // 'Once(42)'
     * ```
     */
    toString(): string;

    /**
     * Gets the reference to the underlying value.
     *
     * @returns `Some(value)` if initialized, `None` otherwise.
     *
     * @example
     * ```ts
     * const once = Once<number>();
     * console.log(once.get()); // None
     *
     * once.set(42);
     * console.log(once.get()); // Some(42)
     * ```
     */
    get(): Option<T>;

    /**
     * Sets the contents to `value`.
     *
     * @param value - The value to store.
     * @returns `Ok(undefined)` if empty, `Err(value)` if already initialized.
     *
     * @example
     * ```ts
     * const once = Once<number>();
     *
     * console.log(once.set(42)); // Ok(undefined)
     * console.log(once.set(100)); // Err(100) - value returned back
     * console.log(once.get()); // Some(42)
     * ```
     */
    set(value: T): Result<void, T>;

    /**
     * Gets the contents, initializing it with `fn` if empty.
     *
     * @param fn - The synchronous initialization function, called only if empty.
     * @returns The stored value.
     *
     * @example
     * ```ts
     * const once = Once<number>();
     *
     * const value = once.getOrInit(() => {
     *     console.log('Initializing...');
     *     return 42;
     * });
     * console.log(value); // 42
     *
     * // Second call - fn is not called
     * const value2 = once.getOrInit(() => 100);
     * console.log(value2); // 42
     * ```
     */
    getOrInit(fn: () => T): T;

    /**
     * Gets the contents, initializing it with async `fn` if empty.
     *
     * If multiple calls occur concurrently, only the first one will run the
     * initialization function. Other calls will wait for it to complete.
     *
     * @param fn - The async initialization function.
     * @returns A promise that resolves to the stored value.
     *
     * @example
     * ```ts
     * const db = Once<Database>();
     *
     * // Multiple concurrent calls - only one connection happens
     * const [db1, db2, db3] = await Promise.all([
     *     db.getOrInitAsync(() => Database.connect(url)),
     *     db.getOrInitAsync(() => Database.connect(url)),
     *     db.getOrInitAsync(() => Database.connect(url)),
     * ]);
     * // db1 === db2 === db3
     * ```
     */
    getOrInitAsync(fn: () => Promise<T>): Promise<T>;

    /**
     * Gets the contents, initializing it with `fn` if empty.
     * If `fn` returns `Err`, remains uninitialized.
     *
     * @typeParam E - The error type.
     * @param fn - The initialization function that may fail.
     * @returns `Ok(value)` if initialized, `Err(error)` if initialization failed.
     *
     * @example
     * ```ts
     * const once = Once<Config>();
     *
     * const result = once.getOrTryInit(() => {
     *     const config = parseConfig(rawData);
     *     return config ? Ok(config) : Err(new Error('Invalid config'));
     * });
     *
     * if (result.isOk()) {
     *     console.log('Config loaded:', result.unwrap());
     * }
     * ```
     */
    getOrTryInit<E>(fn: () => Result<T, E>): Result<T, E>;

    /**
     * Gets the contents, initializing it with async `fn` if empty.
     * If `fn` returns `Err`, remains uninitialized.
     *
     * If multiple calls occur concurrently, only the first one will run the
     * initialization function. Other calls will wait for it to complete.
     *
     * @typeParam E - The error type.
     * @param fn - The async initialization function that may fail.
     * @returns A promise that resolves to `Ok(value)` or `Err(error)`.
     *
     * @example
     * ```ts
     * const config = Once<Config>();
     *
     * const result = await config.getOrTryInitAsync(async () => {
     *     try {
     *         const response = await fetch('/api/config');
     *         return Ok(await response.json());
     *     } catch (e) {
     *         return Err(e as Error);
     *     }
     * });
     * ```
     */
    getOrTryInitAsync<E>(fn: () => AsyncResult<T, E>): AsyncResult<T, E>;

    /**
     * Takes the value out, leaving it uninitialized.
     *
     * @returns `Some(value)` if initialized, `None` otherwise.
     *
     * @example
     * ```ts
     * const once = Once<number>();
     * once.set(42);
     *
     * console.log(once.take()); // Some(42)
     * console.log(once.get()); // None - now empty
     * console.log(once.take()); // None
     * ```
     */
    take(): Option<T>;

    /**
     * Returns `true` if initialized.
     *
     * @example
     * ```ts
     * const once = Once<number>();
     * console.log(once.isInitialized()); // false
     *
     * once.set(42);
     * console.log(once.isInitialized()); // true
     * ```
     */
    isInitialized(): boolean;
}

/**
 * Creates a new empty `Once<T>`.
 *
 * @typeParam T - The type of value to store.
 * @returns A new uninitialized `Once`.
 *
 * @example
 * ```ts
 * // Basic usage
 * const once = Once<string>();
 * once.set('hello');
 * console.log(once.get().unwrap()); // 'hello'
 * ```
 *
 * @example
 * ```ts
 * // Sync lazy singleton pattern
 * const logger = Once<Logger>();
 *
 * function getLogger(): Logger {
 *     return logger.getOrInit(() => new Logger('app'));
 * }
 * ```
 *
 * @example
 * ```ts
 * // Async lazy initialization
 * const db = Once<Database>();
 *
 * async function getDb(): Promise<Database> {
 *     return await db.getOrInitAsync(async () => {
 *         console.log('Connecting to database...');
 *         return await Database.connect(connectionString);
 *     });
 * }
 *
 * // Multiple calls - connection happens only once
 * const [db1, db2] = await Promise.all([getDb(), getDb()]);
 * console.log(db1 === db2); // true
 * ```
 *
 * @example
 * ```ts
 * // Fallible async initialization
 * const config = Once<Config>();
 *
 * async function loadConfig(): Promise<Result<Config, Error>> {
 *     return await config.getOrTryInitAsync(async () => {
 *         try {
 *             const response = await fetch('/api/config');
 *             if (!response.ok) {
 *                 return Err(new Error(`HTTP ${response.status}`));
 *             }
 *             return Ok(await response.json());
 *         } catch (e) {
 *             return Err(e as Error);
 *         }
 *     });
 * }
 * ```
 */
export function Once<T>(): Once<T> {
    let value: T | undefined;
    let initialized = false;
    let pendingPromise: Promise<T> | undefined;

    return Object.freeze<Once<T>>({
        [Symbol.toStringTag]: 'Once',

        toString(): string {
            return initialized ? `Once(${ value })` : 'Once(<uninitialized>)';
        },

        get(): Option<T> {
            return initialized ? Some(value as T) : None;
        },

        set(newValue: T): Result<void, T> {
            if (initialized) {
                return Err(newValue);
            }
            value = newValue;
            initialized = true;
            return Ok(undefined);
        },

        getOrInit(fn: () => T): T {
            if (!initialized) {
                value = fn();
                initialized = true;
            }
            return value as T;
        },

        async getOrInitAsync(fn: () => Promise<T>): Promise<T> {
            if (initialized) {
                return value as T;
            }

            // If already initializing, wait for the pending promise
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

        getOrTryInit<E>(fn: () => Result<T, E>): Result<T, E> {
            if (initialized) {
                return Ok(value as T);
            }

            const result = fn();
            if (result.isOk()) {
                value = result.unwrap();
                initialized = true;
            }
            return result;
        },

        async getOrTryInitAsync<E>(fn: () => AsyncResult<T, E>): AsyncResult<T, E> {
            if (initialized) {
                return Ok(value as T);
            }

            // If already initializing, wait for it
            if (pendingPromise) {
                try {
                    await pendingPromise;
                    // pendingPromise only resolves on success, so initialized must be true
                    return Ok(value as T);
                } catch {
                    // Previous initialization failed via Err result, let this call try again
                }
            }

            // Create a new pending promise for this initialization attempt
            pendingPromise = (async () => {
                const result = await fn();
                if (result.isOk()) {
                    value = result.unwrap();
                    initialized = true;
                    return value;
                }
                // If Err, throw to signal failure (we'll catch and return the result)
                throw result;
            })();

            try {
                const resultValue = await pendingPromise;
                return Ok(resultValue as T);
            } catch (errResult) {
                return errResult as Result<T, E>;
            } finally {
                pendingPromise = undefined;
            }
        },

        take(): Option<T> {
            if (!initialized) {
                return None;
            }
            const taken = value as T;
            value = undefined;
            initialized = false;
            return Some(taken);
        },

        isInitialized(): boolean {
            return initialized;
        },
    } as const);
}
