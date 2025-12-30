/**
 * @module
 * Rust-inspired [AsyncFnOnce](https://doc.rust-lang.org/std/ops/trait.AsyncFnOnce.html) for one-time callable async functions.
 *
 * **When to use `FnOnce` vs `FnOnceAsync`:**
 * - Use `FnOnce` for sync functions
 * - Use `FnOnceAsync` for async functions
 */

import { ASYNC_NONE, Some, type AsyncOption } from '../../core/mod.ts';

/**
 * An async function wrapper that can only be called once.
 *
 * After the first invocation, the function is consumed and cannot be called again.
 * This mirrors Rust's `AsyncFnOnce` trait (stabilized in Rust 1.85), which represents
 * async closures that take ownership of captured variables and can only be called once.
 *
 * **Use cases:**
 * - One-time async callbacks (cleanup functions, initialization)
 * - Ensuring certain async operations execute exactly once
 * - Async resource disposal patterns
 *
 * @typeParam A - Tuple type of the function arguments.
 * @typeParam R - The resolved type of the Promise returned by the async function.
 *
 * @see {@link FnOnce} for sync one-time callable functions
 *
 * @example
 * ```ts
 * // Basic usage
 * const fetchData = FnOnceAsync(async (id: number) => {
 *     const response = await fetch(`/api/data/${id}`);
 *     return response.json();
 * });
 *
 * const data = await fetchData.call(1);
 * // fetchData.call(2); // Throws Error: FnOnceAsync has already been consumed
 * ```
 *
 * @example
 * ```ts
 * // Safe call with tryCall
 * const initOnce = FnOnceAsync(async () => {
 *     await someAsyncSetup();
 *     return { initialized: true };
 * });
 *
 * const result1 = await initOnce.tryCall(); // Some({ initialized: true })
 * const result2 = await initOnce.tryCall(); // None
 * ```
 *
 * @example
 * ```ts
 * // One-time async resource cleanup
 * const cleanup = FnOnceAsync(async () => {
 *     await closeConnections();
 *     await flushLogs();
 * });
 *
 * await cleanup.tryCall(); // Performs cleanup
 * await cleanup.tryCall(); // Returns None, no effect
 * ```
 */
export interface FnOnceAsync<A extends unknown[], R> {
    /**
     * The well-known symbol `Symbol.toStringTag` used by `Object.prototype.toString()`.
     * Returns `'FnOnceAsync'` so that `Object.prototype.toString.call(fn)` produces `'[object FnOnceAsync]'`.
     *
     * @example
     * ```ts
     * const fn = FnOnceAsync(async () => 42);
     * console.log(Object.prototype.toString.call(fn)); // '[object FnOnceAsync]'
     * ```
     */
    readonly [Symbol.toStringTag]: 'FnOnceAsync';

    /**
     * Custom `toString` implementation.
     * @example
     * ```ts
     * const fn = FnOnceAsync(async () => 42);
     * console.log(fn.toString()); // 'FnOnceAsync(pending)' or 'FnOnceAsync(consumed)'
     * ```
     */
    toString(): string;

    /**
     * Calls the async function with the provided arguments, consuming it.
     *
     * @param args - The arguments to pass to the function.
     * @returns A Promise that resolves to the return value of the function.
     * @throws {Error} If the function has already been called.
     *
     * @example
     * ```ts
     * const fetchUser = FnOnceAsync(async (id: number) => {
     *     const response = await fetch(`/api/users/${id}`);
     *     return response.json();
     * });
     *
     * const user = await fetchUser.call(1);
     * // await fetchUser.call(2); // Throws Error
     * ```
     */
    call(...args: A): Promise<Awaited<R>>;

    /**
     * Attempts to call the async function, returning `Some(result)` if successful
     * or `None` if the function has already been consumed.
     *
     * This is the safe alternative to `call()` that never throws due to consumption.
     * The returned Promise may still reject if the underlying async function throws.
     *
     * @param args - The arguments to pass to the function.
     * @returns A Promise that resolves to `Some(result)` if the function was called, `None` if already consumed.
     *
     * @example
     * ```ts
     * const fetchData = FnOnceAsync(async (id: number) => {
     *     const response = await fetch(`/api/data/${id}`);
     *     return response.json();
     * });
     *
     * const result1 = await fetchData.tryCall(1); // Some(data)
     * const result2 = await fetchData.tryCall(2); // None
     * ```
     */
    tryCall(...args: A): AsyncOption<Awaited<R>>;

    /**
     * Returns `true` if the function has been consumed (called).
     *
     * @example
     * ```ts
     * const fn = FnOnceAsync(async () => 'done');
     * console.log(fn.isConsumed()); // false
     * await fn.call();
     * console.log(fn.isConsumed()); // true
     * ```
     */
    isConsumed(): boolean;
}

/**
 * Creates a `FnOnceAsync` wrapper around an async function, making it callable only once.
 *
 * @typeParam A - Tuple type of the function arguments.
 * @typeParam R - The resolved type of the Promise returned by the async function.
 * @param fn - A function that returns `PromiseLike<R>` or `R`.
 * @returns A `FnOnceAsync` instance that wraps the function.
 *
 * @example
 * ```ts
 * const initialize = FnOnceAsync(async () => {
 *     console.log('Initializing...');
 *     await loadResources();
 *     return { ready: true };
 * });
 *
 * const result = await initialize.call(); // Logs 'Initializing...', returns { ready: true }
 * // await initialize.call(); // Throws Error: FnOnceAsync has already been consumed
 * ```
 */
export function FnOnceAsync<A extends unknown[], R>(fn: (...args: A) => PromiseLike<R> | R): FnOnceAsync<A, R> {
    let consumed = false;

    return Object.freeze<FnOnceAsync<A, R>>({
        [Symbol.toStringTag]: 'FnOnceAsync',

        toString(): string {
            return `FnOnceAsync(${ consumed ? 'consumed' : 'pending' })`;
        },

        call(...args: A): Promise<Awaited<R>> {
            if (consumed) {
                throw new Error('FnOnceAsync has already been consumed');
            }
            consumed = true;
            return Promise.resolve(fn(...args));
        },

        // Use `Promise.resolve(fn())` instead of `async` to preserve sync error behavior:
        // sync throws propagate directly, async errors become rejected Promises.
        tryCall(...args: A): AsyncOption<Awaited<R>> {
            if (consumed) {
                return ASYNC_NONE;
            }
            consumed = true;
            return Promise.resolve(fn(...args)).then(Some);
        },

        isConsumed(): boolean {
            return consumed;
        },
    } as const);
}
