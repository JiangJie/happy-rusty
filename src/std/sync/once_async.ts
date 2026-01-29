/**
 * @module
 * Async-first one-time initialization container.
 *
 * `OnceAsync<T>` is designed for async initialization where the stored value
 * is always `Awaited<T>`, matching JavaScript's Promise flattening behavior.
 *
 * **When to use `OnceAsync<T>` vs `Once<T>`:**
 * - Use `Once<T>` for sync-only initialization
 * - Use `OnceAsync<T>` for async initialization with concurrent call handling
 */

import { Err, None, Ok, RESULT_VOID, Some, type AsyncLikeResult, type AsyncResult, type Option, type Result, type VoidResult } from '../../core/mod.ts';

/**
 * An async-first container which can be written to only once.
 *
 * `OnceAsync<T>` stores `Awaited<T>`, matching JavaScript's Promise flattening behavior.
 * This means `OnceAsync<Promise<number>>` and `OnceAsync<number>` behave identically,
 * both storing `number`.
 *
 * **Key difference from `Once<T>`:**
 * - `Once<T>` with sync methods stores `T` as-is (including Promise values)
 * - `OnceAsync<T>` always stores `Awaited<T>` (flattened value)
 *
 * @typeParam T - The type parameter. The actual stored type is `Awaited<T>`.
 * @since 1.8.0
 * @see {@link Once} for sync-only one-time initialization
 * @example
 * ```ts
 * const db = OnceAsync<Database>();
 *
 * // Initialize with async function - stores the resolved Database
 * const conn = await db.getOrInit(async () => Database.connect(url));
 *
 * // Get the stored value
 * console.log(db.get()); // Some(Database)
 * ```
 *
 * @example
 * ```ts
 * // Fallible async initialization
 * const config = OnceAsync<Config>();
 *
 * const result = await config.getOrTryInit(async () => {
 *     try {
 *         const response = await fetch('/api/config');
 *         return Ok(await response.json());
 *     } catch (e) {
 *         return Err(e as Error);
 *     }
 * });
 * ```
 */
export interface OnceAsync<T> {
    /**
     * The well-known symbol `Symbol.toStringTag` used by `Object.prototype.toString()`.
     * Returns `'OnceAsync'` so that `Object.prototype.toString.call(once)` produces `'[object OnceAsync]'`.
     */
    readonly [Symbol.toStringTag]: 'OnceAsync';

    /**
     * Custom `toString` implementation.
     * @example
     * ```ts
     * const once = OnceAsync<number>();
     * console.log(once.toString()); // 'OnceAsync(<uninitialized>)'
     *
     * await once.getOrInit(async () => 42);
     * console.log(once.toString()); // 'OnceAsync(42)'
     * ```
     */
    toString(): string;

    /**
     * Gets the reference to the underlying value.
     *
     * @returns `Some(value)` if initialized, `None` otherwise.
     * @example
     * ```ts
     * const once = OnceAsync<number>();
     * console.log(once.get()); // None
     *
     * await once.getOrInit(async () => 42);
     * console.log(once.get()); // Some(42)
     * ```
     */
    get(): Option<Awaited<T>>;

    /**
     * Sets the contents to `value`.
     *
     * @param value - The value to store.
     * @returns `Ok(undefined)` if empty, `Err(value)` if already initialized.
     * @example
     * ```ts
     * const once = OnceAsync<number>();
     *
     * console.log(once.set(42)); // Ok(undefined)
     * console.log(once.set(100)); // Err(100) - value returned back
     * console.log(once.get()); // Some(42)
     * ```
     */
    set(value: Awaited<T>): VoidResult<Awaited<T>>;

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
     * const once = OnceAsync<number>();
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
    tryInsert(value: Awaited<T>): Result<Awaited<T>, [Awaited<T>, Awaited<T>]>;

    /**
     * Gets the contents, initializing it with async `fn` if empty.
     *
     * If multiple calls occur concurrently, only the first one will run the
     * initialization function. Other calls will wait for it to complete.
     *
     * @param fn - A function that returns `PromiseLike<Awaited<T>>` or `Awaited<T>` to initialize.
     * @returns A promise that resolves to the stored value (`Awaited<T>`).
     * @example
     * ```ts
     * const db = OnceAsync<Database>();
     *
     * // Multiple concurrent calls - only one connection happens
     * const [db1, db2, db3] = await Promise.all([
     *     db.getOrInit(() => Database.connect(url)),
     *     db.getOrInit(() => Database.connect(url)),
     *     db.getOrInit(() => Database.connect(url)),
     * ]);
     * // db1 === db2 === db3
     * ```
     */
    getOrInit(fn: () => PromiseLike<Awaited<T>> | Awaited<T>): Promise<Awaited<T>>;

    /**
     * Gets the contents, initializing it with async `fn` if empty.
     * If `fn` returns `Err`, remains uninitialized.
     *
     * If multiple calls occur concurrently, only the first one will run the
     * initialization function. Other calls will wait for it to complete.
     *
     * @typeParam E - The error type.
     * @param fn - A function that returns `PromiseLike<Result<Awaited<T>, E>>` or `Result<Awaited<T>, E>`.
     * @returns A promise that resolves to `Ok(value)` or `Err(error)`.
     * @example
     * ```ts
     * const config = OnceAsync<Config>();
     *
     * const result = await config.getOrTryInit(async () => {
     *     try {
     *         const response = await fetch('/api/config');
     *         return Ok(await response.json());
     *     } catch (e) {
     *         return Err(e as Error);
     *     }
     * });
     * ```
     */
    getOrTryInit<E>(fn: () => AsyncLikeResult<Awaited<T>, E> | Result<Awaited<T>, E>): AsyncResult<Awaited<T>, E>;

    /**
     * Takes the value out, leaving it uninitialized.
     *
     * @returns `Some(value)` if initialized, `None` otherwise.
     * @example
     * ```ts
     * const once = OnceAsync<number>();
     * await once.getOrInit(async () => 42);
     *
     * console.log(once.take()); // Some(42)
     * console.log(once.get()); // None - now empty
     * console.log(once.take()); // None
     * ```
     */
    take(): Option<Awaited<T>>;

    /**
     * Returns `true` if initialized.
     *
     * @example
     * ```ts
     * const once = OnceAsync<number>();
     * console.log(once.isInitialized()); // false
     *
     * await once.getOrInit(async () => 42);
     * console.log(once.isInitialized()); // true
     * ```
     */
    isInitialized(): boolean;

    /**
     * Waits for the cell to be initialized, then returns the value.
     *
     * If the cell is already initialized, returns immediately.
     * If initialization is in progress, waits for it to complete.
     * If the cell is uninitialized and no initialization is in progress,
     * the returned promise will resolve when another caller initializes the cell.
     *
     * @returns A promise that resolves to the stored value once initialized.
     * @example
     * ```ts
     * const once = OnceAsync<number>();
     *
     * // Start waiting in background
     * const waitPromise = once.wait();
     *
     * // Later, initialize the value
     * once.set(42);
     *
     * // waitPromise resolves with 42
     * console.log(await waitPromise); // 42
     * ```
     */
    wait(): Promise<Awaited<T>>;
}

/**
 * Creates a new empty `OnceAsync<T>`.
 *
 * `OnceAsync<T>` stores `Awaited<T>`, matching JavaScript's Promise flattening behavior.
 * This means `OnceAsync<Promise<number>>` and `OnceAsync<number>` behave identically.
 *
 * @typeParam T - The type parameter. The actual stored type is `Awaited<T>`.
 * @returns A new uninitialized `OnceAsync`.
 * @example
 * ```ts
 * // Basic usage
 * const once = OnceAsync<string>();
 * await once.getOrInit(async () => 'hello');
 * console.log(once.get().unwrap()); // 'hello'
 * ```
 *
 * @example
 * ```ts
 * // Async lazy singleton pattern
 * const db = OnceAsync<Database>();
 *
 * async function getDb(): Promise<Database> {
 *     return await db.getOrInit(async () => {
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
 * const config = OnceAsync<Config>();
 *
 * async function loadConfig(): Promise<Result<Config, Error>> {
 *     return await config.getOrTryInit(async () => {
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
export function OnceAsync<T>(): OnceAsync<T> {
    /** Internal alias to reduce repetition of `Awaited<T>` */
    type Value = Awaited<T>;
    /** Callback type for waiters waiting for initialization */
    type Waiter = (value: Value) => void;

    let value: Value | undefined;
    let initialized = false;
    let pendingPromise: Promise<Value> | undefined;
    let resolvedPromise: Promise<Value> | undefined;
    let resolvedResultPromise: AsyncResult<Value, unknown> | undefined;
    let waiters: Waiter[] = [];

    /**
     * Sets the value, marks as initialized, and notifies all waiters.
     */
    function setValue(val: Value): void {
        value = val;
        initialized = true;
        for (const waiter of waiters) {
            waiter(val);
        }
        waiters = [];
    }

    // Use `Promise.resolve(fn())` instead of `async` to preserve sync error behavior:
    // sync throws propagate directly, async errors become rejected Promises.
    function getOrTryInit<E>(fn: () => AsyncLikeResult<Value, E> | Result<Value, E>): AsyncResult<Value, E> {
        if (initialized) {
            // Reuse cached promise to avoid creating new Promise on each call
            return (resolvedResultPromise ??= Promise.resolve(Ok(value as Value))) as AsyncResult<Value, E>;
        }

        // If already initializing, wait for it
        if (pendingPromise) {
            return pendingPromise.then(
                () => Ok(value as Value),
                // Previous initialization failed via Err result, let this call try again.
                // Note: fn's sync errors won't throw here since we're inside a .then() callback,
                // they will be caught and converted to rejected Promise by Promise.resolve(fn()).
                () => getOrTryInit(fn),
            );
        }

        // Create a new pending promise for this initialization attempt
        // fn() is called synchronously here - sync throws propagate directly
        // Store the Result separately to preserve the original Result
        const resultPromise = Promise.resolve(fn());

        pendingPromise = resultPromise.then(
            (result) => {
                if (result.isOk()) {
                    const val = result.unwrap();
                    setValue(val);
                    return val;
                }
                // If Err, throw to signal failure (waiters will retry)
                throw result;
            },
        ).finally(() => {
            pendingPromise = undefined;
        });

        // Wait for pendingPromise to complete (success or failure), then return original Result
        return pendingPromise.then(
            () => resultPromise,
            () => resultPromise,
        );
    }

    return Object.freeze<OnceAsync<T>>({
        [Symbol.toStringTag]: 'OnceAsync',

        toString(): string {
            return initialized ? `OnceAsync(${value})` : 'OnceAsync(<uninitialized>)';
        },

        get(): Option<Value> {
            return initialized ? Some(value as Value) : None;
        },

        set(newValue: Value): VoidResult<Value> {
            if (initialized) {
                return Err(newValue);
            }
            setValue(newValue);
            return RESULT_VOID;
        },

        tryInsert(newValue: Value): Result<Value, [Value, Value]> {
            if (initialized) {
                return Err([value as Value, newValue]);
            }
            setValue(newValue);
            return Ok(newValue);
        },

        // Use `Promise.resolve(fn())` instead of `async` to preserve sync error behavior:
        // sync throws propagate directly, async errors become rejected Promises.
        getOrInit(fn: () => PromiseLike<Value> | Value): Promise<Value> {
            if (initialized) {
                // Reuse cached promise to avoid creating new Promise on each call
                return (resolvedPromise ??= Promise.resolve(value as Value));
            }

            // If already initializing, wait for the pending promise
            if (pendingPromise) {
                return pendingPromise;
            }

            pendingPromise = Promise.resolve(fn()).then(
                (result) => {
                    setValue(result);
                    return result;
                },
            ).finally(() => {
                pendingPromise = undefined;
            });

            return pendingPromise;
        },

        getOrTryInit,

        take(): Option<Value> {
            if (!initialized) {
                return None;
            }
            const taken = value as Value;
            value = undefined;
            initialized = false;
            resolvedPromise = undefined;  // Clear cached promise
            resolvedResultPromise = undefined;  // Clear cached result promise
            return Some(taken);
        },

        isInitialized(): boolean {
            return initialized;
        },

        wait(): Promise<Value> {
            // If already initialized, return immediately
            if (initialized) {
                // Reuse cached promise to avoid creating new Promise on each call
                return (resolvedPromise ??= Promise.resolve(value as Value));
            }

            // If initialization is in progress, wait for it
            if (pendingPromise) {
                return pendingPromise;
            }

            // Otherwise, add to waiters and wait for someone to initialize
            return new Promise<Value>((resolve) => {
                waiters.push(resolve);
            });
        },
    } as const);
}
