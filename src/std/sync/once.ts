/**
 * @module
 * Rust-inspired [OnceLock](https://doc.rust-lang.org/std/sync/struct.OnceLock.html) for one-time initialization.
 *
 * `Once<T>` is a container which can be written to only once. It provides safe access
 * to lazily initialized data with synchronous initialization.
 *
 * **When to use `Once<T>` vs `OnceAsync<T>`:**
 * - Use `Once<T>` for sync-only initialization
 * - Use `OnceAsync<T>` for async initialization with concurrent call handling
 */

import { Err, None, Ok, RESULT_VOID, Some, type Option, type Result, type VoidResult } from '../../core/mod.ts';

/**
 * A container which can be written to only once.
 *
 * Useful for lazy initialization of global data or expensive computations
 * that should only happen once.
 *
 * @typeParam T - The type of the value stored.
 * @since 1.6.0
 * @see {@link OnceAsync} for async one-time initialization
 * @see https://doc.rust-lang.org/std/sync/struct.OnceLock.html
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
     * @example
     * ```ts
     * const once = Once<number>();
     *
     * console.log(once.set(42)); // Ok(undefined)
     * console.log(once.set(100)); // Err(100) - value returned back
     * console.log(once.get()); // Some(42)
     * ```
     */
    set(value: T): VoidResult<T>;

    /**
     * Sets the contents to `value` if empty, returning a reference to the value.
     *
     * Unlike `set()`, this method returns the stored value on success,
     * and returns both the current and passed values on failure.
     *
     * @param value - The value to store.
     * @returns `Ok(value)` if empty, `Err([currentValue, passedValue])` if already initialized.
     * @example
     * ```ts
     * const once = Once<number>();
     *
     * // First insert succeeds, returns the stored value
     * const result1 = once.tryInsert(42);
     * console.log(result1.unwrap()); // 42
     *
     * // Second insert fails, returns [current, passed]
     * const result2 = once.tryInsert(100);
     * console.log(result2.unwrapErr()); // [42, 100]
     * ```
     */
    tryInsert(value: T): Result<T, [T, T]>;

    /**
     * Gets the contents, initializing it with `fn` if empty.
     *
     * @param fn - The synchronous initialization function, called only if empty.
     * @returns The stored value.
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
     * Gets the contents, initializing it with `fn` if empty.
     * If `fn` returns `Err`, remains uninitialized.
     *
     * @typeParam E - The error type.
     * @param fn - The initialization function that may fail.
     * @returns `Ok(value)` if initialized, `Err(error)` if initialization failed.
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
     * Takes the value out, leaving it uninitialized.
     *
     * @returns `Some(value)` if initialized, `None` otherwise.
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
 * // Fallible sync initialization
 * const config = Once<Config>();
 *
 * function loadConfig(): Result<Config, Error> {
 *     return config.getOrTryInit(() => {
 *         const data = readFileSync('config.json');
 *         return data ? Ok(JSON.parse(data)) : Err(new Error('Config not found'));
 *     });
 * }
 * ```
 */
export function Once<T>(): Once<T> {
    let value: T | undefined;
    let initialized = false;

    /**
     * Sets the value and marks as initialized.
     */
    function setValue(val: T): void {
        value = val;
        initialized = true;
    }

    return Object.freeze<Once<T>>({
        [Symbol.toStringTag]: 'Once',

        toString(): string {
            return initialized ? `Once(${value})` : 'Once(<uninitialized>)';
        },

        get(): Option<T> {
            return initialized ? Some(value as T) : None;
        },

        set(newValue: T): VoidResult<T> {
            if (initialized) {
                return Err(newValue);
            }
            setValue(newValue);
            return RESULT_VOID;
        },

        tryInsert(newValue: T): Result<T, [T, T]> {
            if (initialized) {
                return Err([value as T, newValue]);
            }
            setValue(newValue);
            return Ok(newValue);
        },

        getOrInit(fn: () => T): T {
            if (!initialized) {
                setValue(fn());
            }
            return value as T;
        },

        getOrTryInit<E>(fn: () => Result<T, E>): Result<T, E> {
            if (initialized) {
                return Ok(value as T);
            }

            const result = fn();
            if (result.isOk()) {
                setValue(result.unwrap());
            }
            return result;
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
