/**
 * @fileoverview
 * Extension functions for bridging Promise-based APIs with the Result type.
 *
 * This module provides utilities for integrating async/await patterns with Result-based error handling.
 */
import type { AsyncResult } from './core.ts';
import { Err, Ok } from './prelude.ts';

/**
 * Converts a Promise or a function returning a Promise to a Result type,
 * capturing the resolved value in an `Ok`, or the error in an `Err`.
 *
 * **Promise form**: Captures async rejections.
 *
 * **Function form**: Captures both sync exceptions and async rejections.
 * Use this when the Promise-returning function may throw synchronously before creating the Promise.
 * Similar to the `Promise.try()`.
 *
 * Note: JavaScript promises can reject with any value, not just `Error` objects.
 * The error is cast to type `E`, so ensure your error handling accounts for this.
 *
 * @typeParam T - The type of the value that the promise resolves to.
 * @typeParam E - The type of the error that the promise may reject with, defaults to `Error`.
 * @param task - A promise, promise-like object, or a function that returns a promise-like object.
 * @returns A promise that resolves to `Ok<T>` if successful, or `Err<E>` if the promise rejects or the function throws.
 *
 * @example
 * ```ts
 * // Promise form
 * const result = await promiseToAsyncResult(fetchData());
 * result.inspect(x => console.log('Data:', x))
 *       .inspectErr(err => console.error('Error:', err));
 * ```
 *
 * @example
 * ```ts
 * // Function form - captures sync exceptions
 * function riskyOperation(): Promise<Data> {
 *     const id = JSON.parse(invalidJson);  // May throw synchronously
 *     return fetch(`/api/${id}`);
 * }
 * const result = await promiseToAsyncResult(() => riskyOperation());
 * ```
 *
 * @example
 * ```ts
 * // Inline async function
 * const result = await promiseToAsyncResult(async () => {
 *     const response = await fetch('/api');
 *     return response.json();
 * });
 * ```
 */
export async function promiseToAsyncResult<T, E = Error>(task: PromiseLike<T> | (() => PromiseLike<T>)): AsyncResult<T, E> {
    try {
        const promise = typeof task === 'function' ? task() : task;
        return Ok(await promise);
    } catch (err) {
        return Err(err as E);
    }
}