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

import {
    Err,
    None,
    Ok,
    RESULT_VOID,
    Some,
    type AsyncLikeResult,
    type AsyncResult,
    type Option,
    type Result,
    type VoidResult,
} from '../../core/mod.ts';

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
     * If an initialization attempt (`getOrInit`/`getOrTryInit`) is currently
     * in progress, the attempt wins: `set()` returns `Err(value)` without
     * writing, matching Rust's `OnceLock::set` racing an in-flight
     * `get_or_init`.
     *
     * @param value - The value to store.
     * @returns `Ok(undefined)` if empty, `Err(value)` if already initialized or being initialized.
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
     * If an initialization attempt (`getOrInit`/`getOrTryInit`) is currently
     * in progress, the attempt wins and `Err` is returned; because the current
     * value has not been committed yet, it is reported as `undefined`.
     *
     * @param value - The value to store.
     * @returns `Ok(value)` if empty, `Err([currentValue, passedValue])` if already initialized or being initialized.
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
     * If that in-flight attempt fails (e.g. a `getOrTryInit` returning
     * `Err`), a waiting `getOrInit` caller whose own fn has not run yet
     * retries with its own `fn` — matching Rust's `get_or_try_init`.
     *
     * **Not reentrant:** `fn` must not call `getOrInit`/`getOrTryInit` on this
     * same `OnceAsync` and `await` the result — the outer initializer waits on
     * the inner, which in turn waits on the outer, so neither promise ever
     * settles (a circular wait). This mirrors Rust, where a `OnceLock`
     * initializer is likewise not reentrant. A re-entrant call that does *not*
     * `await` the result instead joins the in-flight attempt and resolves with
     * its value.
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
     * initialization function. Other calls will wait for it to complete;
     * if that attempt fails, a waiting caller whose own fn has not run yet
     * retries with its own `fn`.
     *
     * **Not reentrant:** as with `getOrInit`, `fn` must not call
     * `getOrInit`/`getOrTryInit` on this same `OnceAsync` and `await` the
     * result, which would wait on itself and never settle.
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
    getOrTryInit<E>(
        fn: () => AsyncLikeResult<Awaited<T>, E> | Result<Awaited<T>, E>,
    ): AsyncResult<Awaited<T>, E>;

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
     * Unlike an in-flight init attempt, `wait()` never rejects: a failed
     * `getOrTryInit` leaves the cell empty and the waiter keeps waiting until
     * a later `set()`/init attempt succeeds. This matches Rust's
     * `OnceLock::wait`, which only returns once the cell is initialized.
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

    /**
     * Claims the in-flight slot for a fresh initialization attempt.
     *
     * The joinable `pendingPromise` is created *before* the caller invokes its
     * initializer, so a synchronously-executing initializer that re-enters
     * through `getOrInit`/`getOrTryInit` (or calls `set`/`tryInsert`) sees the
     * slot as taken and joins/waits instead of starting a second attempt.
     *
     * The marker is cleared as soon as the attempt settles, and this handler is
     * registered first so it runs before any waiter's retry handler — a retry
     * must observe the cell as free to start a fresh attempt.
     */
    function claimAttempt(): {
        attempt: Promise<Value>;
        commit: (val: Value) => void;
        fail: (reason: unknown) => void;
        clear: () => void;
    } {
        let commit!: (val: Value) => void;
        let fail!: (reason: unknown) => void;
        const attempt = new Promise<Value>((resolve, reject) => {
            commit = (val: Value) => resolve(val);
            fail = (reason: unknown) => reject(reason);
        });
        pendingPromise = attempt;
        const clear = (): void => {
            // A stale attempt must not clear a newer attempt that claimed the
            // slot after this one failed synchronously.
            if (pendingPromise === attempt) {
                pendingPromise = undefined;
            }
        };
        void attempt.then(clear, clear);
        return { attempt, commit, fail, clear };
    }

    // Use `Promise.resolve(fn())` instead of `async` to preserve sync error behavior:
    // sync throws propagate directly, async errors become rejected Promises.
    function getOrTryInit<E>(
        fn: () => AsyncLikeResult<Value, E> | Result<Value, E>,
    ): AsyncResult<Value, E> {
        if (initialized) {
            // Reuse cached promise to avoid creating new Promise on each call
            return (resolvedResultPromise ??= Promise.resolve(Ok(value as Value))) as AsyncResult<
                Value,
                E
            >;
        }

        // If already initializing, wait for it. If that attempt fails, this
        // caller's own fn has not run yet, so retry with it — matching Rust's
        // `get_or_try_init`, where waiters get their chance only after the
        // current attempt has failed.
        if (pendingPromise) {
            return pendingPromise.then(
                () => Ok(value as Value),
                () => getOrTryInit(fn),
            );
        }

        const { attempt, commit, fail, clear } = claimAttempt();
        let resultPromise: Promise<Result<Value, E>>;
        try {
            resultPromise = Promise.resolve(fn());
            void resultPromise
                .then(result => {
                    if (result.isOk()) {
                        const val = result.unwrap();
                        setValue(val);
                        commit(val);
                    } else {
                        // Err: the attempt fails so any joiners retry, but this
                        // initiating caller still receives the original Err below.
                        fail(result);
                    }
                }, fail)
                .catch(fail);
        } catch (error) {
            // fn threw synchronously: mark the attempt failed (joiners retry)
            // and release the slot, while the initiating caller still sees the
            // sync error directly.
            fail(error);
            clear();
            throw error;
        }

        // Resolve to the original Result whether the attempt succeeded or not.
        return attempt.then(
            () => resultPromise,
            () => resultPromise,
        );
    }

    // Use `Promise.resolve(fn())` instead of `async` to preserve sync error behavior:
    // sync throws propagate directly, async errors become rejected Promises.
    function getOrInit(fn: () => PromiseLike<Value> | Value): Promise<Value> {
        if (initialized) {
            // Reuse cached promise to avoid creating new Promise on each call
            return (resolvedPromise ??= Promise.resolve(value as Value));
        }

        // If already initializing, wait for it. If that attempt fails, this
        // caller's own fn has not run yet, so retry with it — matching Rust's
        // `get_or_try_init`, where waiters get their chance only after the
        // current attempt has failed.
        if (pendingPromise) {
            return pendingPromise.then(
                () => (resolvedPromise ??= Promise.resolve(value as Value)),
                () => getOrInit(fn),
            );
        }

        const { attempt, commit, fail, clear } = claimAttempt();
        try {
            void Promise.resolve(fn())
                .then(result => {
                    setValue(result);
                    commit(result);
                }, fail)
                .catch(fail);
        } catch (error) {
            fail(error);
            clear();
            throw error;
        }

        return attempt;
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
            if (initialized || pendingPromise !== undefined) {
                return Err(newValue);
            }
            setValue(newValue);
            return RESULT_VOID;
        },

        tryInsert(newValue: Value): Result<Value, [Value, Value]> {
            if (initialized || pendingPromise !== undefined) {
                const currentValue = initialized
                    ? (value as Value)
                    : (undefined as unknown as Value);
                return Err([currentValue, newValue]);
            }
            setValue(newValue);
            return Ok(newValue);
        },

        getOrInit,

        getOrTryInit,

        take(): Option<Value> {
            if (!initialized) {
                return None;
            }
            const taken = value as Value;
            value = undefined;
            initialized = false;
            resolvedPromise = undefined; // Clear cached promise
            resolvedResultPromise = undefined; // Clear cached result promise
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

            // Register a waiter that resolves as soon as the cell becomes
            // initialized. Unlike reusing the in-flight `pendingPromise`,
            // this never rejects: a failed init attempt leaves the cell empty,
            // and a later successful `set()`/init attempt still wakes the waiter.
            return new Promise<Value>(resolve => {
                waiters.push(resolve);
            });
        },
    } as const);
}
