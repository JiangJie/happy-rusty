/**
 * @module
 * Rust-inspired [FnOnce](https://doc.rust-lang.org/std/ops/trait.FnOnce.html) for one-time callable functions.
 *
 * **When to use `FnOnce` vs `FnOnceAsync`:**
 * - Use `FnOnce` for sync functions
 * - Use `FnOnceAsync` for async functions
 */

import { None, Some, type Option } from '../../core/mod.ts';

/**
 * A function wrapper that can only be called once.
 *
 * After the first invocation, the function is consumed and cannot be called again.
 * This mirrors Rust's `FnOnce` trait, which represents closures that take ownership
 * of captured variables and can only be called once.
 *
 * **Use cases:**
 * - One-time callbacks (cleanup functions, event handlers)
 * - Ensuring certain operations execute exactly once
 * - Resource disposal patterns
 *
 * @typeParam A - Tuple type of the function arguments.
 * @typeParam R - Return type of the function.
 * @since 1.8.0
 * @see {@link FnOnceAsync} for async one-time callable functions
 * @see https://doc.rust-lang.org/std/ops/trait.FnOnce.html
 * @example
 * ```ts
 * // Basic usage
 * const greet = FnOnce((name: string) => `Hello, ${name}!`);
 * console.log(greet.call('World')); // 'Hello, World!'
 * // greet.call('Again'); // Throws Error: FnOnce has already been consumed
 *
 * // Safe call with tryCall
 * const cleanup = FnOnce(() => console.log('Cleaned up'));
 * cleanup.tryCall(); // Some(undefined), logs 'Cleaned up'
 * cleanup.tryCall(); // None, no effect
 * ```
 *
 * @example
 * ```ts
 * // One-time event handler
 * const onFirstClick = FnOnce((event: MouseEvent) => {
 *     console.log('First click at:', event.clientX, event.clientY);
 * });
 *
 * button.addEventListener('click', (e) => {
 *     onFirstClick.tryCall(e); // Only handles first click
 * });
 * ```
 *
 * @example
 * ```ts
 * // Resource cleanup pattern
 * function createConnection(): { close: FnOnce<[], void> } {
 *     const socket = new WebSocket('ws://example.com');
 *     return {
 *         close: FnOnce(() => {
 *             socket.close();
 *             console.log('Connection closed');
 *         })
 *     };
 * }
 *
 * const conn = createConnection();
 * conn.close.call();  // Closes connection
 * conn.close.call();  // Throws - already closed
 * ```
 */
export interface FnOnce<A extends unknown[], R> {
    /**
     * The well-known symbol `Symbol.toStringTag` used by `Object.prototype.toString()`.
     * Returns `'FnOnce'` so that `Object.prototype.toString.call(fn)` produces `'[object FnOnce]'`.
     *
     * @example
     * ```ts
     * const fn = FnOnce(() => 42);
     * console.log(Object.prototype.toString.call(fn)); // '[object FnOnce]'
     * ```
     */
    readonly [Symbol.toStringTag]: 'FnOnce';

    /**
     * Custom `toString` implementation.
     * @example
     * ```ts
     * const fn = FnOnce(() => 42);
     * console.log(fn.toString()); // 'FnOnce(pending)' or 'FnOnce(consumed)'
     * ```
     */
    toString(): string;

    /**
     * Calls the function with the provided arguments, consuming it.
     *
     * @param args - The arguments to pass to the function.
     * @returns The return value of the function.
     * @throws {Error} If the function has already been called.
     * @example
     * ```ts
     * const add = FnOnce((a: number, b: number) => a + b);
     * console.log(add.call(2, 3)); // 5
     * // add.call(1, 1); // Throws Error
     * ```
     */
    call(...args: A): R;

    /**
     * Attempts to call the function, returning `Some(result)` if successful
     * or `None` if the function has already been consumed.
     *
     * This is the safe alternative to `call()` that never throws.
     *
     * @param args - The arguments to pass to the function.
     * @returns `Some(result)` if the function was called, `None` if already consumed.
     * @example
     * ```ts
     * const greet = FnOnce((name: string) => `Hi, ${name}`);
     * console.log(greet.tryCall('Alice')); // Some('Hi, Alice')
     * console.log(greet.tryCall('Bob'));   // None
     * ```
     */
    tryCall(...args: A): Option<R>;

    /**
     * Returns `true` if the function has been consumed (called).
     *
     * @example
     * ```ts
     * const fn = FnOnce(() => 'done');
     * console.log(fn.isConsumed()); // false
     * fn.call();
     * console.log(fn.isConsumed()); // true
     * ```
     */
    isConsumed(): boolean;
}

/**
 * Creates a `FnOnce` wrapper around a function, making it callable only once.
 *
 * @typeParam A - Tuple type of the function arguments.
 * @typeParam R - Return type of the function.
 * @param fn - The function to wrap.
 * @returns A `FnOnce` instance that wraps the function.
 * @example
 * ```ts
 * const initialize = FnOnce(() => {
 *     console.log('Initializing...');
 *     return { ready: true };
 * });
 *
 * const result = initialize.call(); // Logs 'Initializing...', returns { ready: true }
 * // initialize.call(); // Throws Error: FnOnce has already been consumed
 * ```
 */
export function FnOnce<A extends unknown[], R>(fn: (...args: A) => R): FnOnce<A, R> {
    let consumed = false;

    return Object.freeze<FnOnce<A, R>>({
        [Symbol.toStringTag]: 'FnOnce',

        toString(): string {
            return `FnOnce(${consumed ? 'consumed' : 'pending'})`;
        },

        call(...args: A): R {
            if (consumed) {
                throw new Error('FnOnce has already been consumed');
            }
            consumed = true;
            return fn(...args);
        },

        tryCall(...args: A): Option<R> {
            if (consumed) {
                return None;
            }
            consumed = true;
            return Some(fn(...args));
        },

        isConsumed(): boolean {
            return consumed;
        },
    } as const);
}
