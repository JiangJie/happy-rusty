/**
 * @fileoverview
 * Extension functions for bridging Promise-based APIs with the Result type.
 *
 * This module provides utilities for integrating async/await patterns with Result-based error handling.
 */
import type { AsyncResult } from './core.ts';
import { Err, Ok } from './prelude.ts';

/**
 * Converts a Promise to a Result type, capturing the resolved value in an `Ok`, or the error in an `Err`.
 * This allows for promise-based asynchronous operations to be handled in a way that is more in line with the Result pattern.
 *
 * Note: JavaScript promises can reject with any value, not just `Error` objects.
 * The error is cast to type `E`, so ensure your error handling accounts for this.
 *
 * @typeParam T - The type of the value that the promise resolves to.
 * @typeParam E - The type of the error that the promise may reject with, defaults to `Error`.
 * @param p - The promise or promise-like object to convert into a `Result` type.
 * @returns A promise that resolves to a `Result<T, E>`. If the input promise `p` resolves, the resulting promise will resolve with `Ok<T>`. If the input promise `p` rejects, the resulting promise will resolve with `Err<E>`.
 *
 * @example
 * ```ts
 * async function example() {
 *     const result = await promiseToAsyncResult(fetchData());
 *     result.inspect(x => {
 *         console.log('Data:', x);
 *     }).inspectErr(err => {
 *         console.error('Error:', err);
 *     });
 * }
 * ```
 *
 * @example
 * ```ts
 * // With custom error type
 * const result = await promiseToAsyncResult<User, ApiError>(fetchUser(id));
 * ```
 */
export async function promiseToAsyncResult<T, E = Error>(p: PromiseLike<T>): AsyncResult<T, E> {
    try {
        return Ok(await p);
    } catch (err) {
        return Err(err as E);
    }
}