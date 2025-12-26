/**
 * @module
 * Extension functions for bridging standard JavaScript patterns with Result types.
 *
 * This module provides utilities for:
 * - Converting try-catch patterns to Result-based error handling
 * - Integrating async/await patterns with Result types
 */
import { Err, Ok } from '../prelude.ts';
import type { AsyncResult, Result } from './result.ts';

/**
 * Executes a function and captures any thrown exception as an `Err`.
 * If the function executes successfully, returns `Ok` with the result.
 *
 * Use this to convert traditional try-catch error handling to Result-based handling.
 *
 * Similar to `Promise.try`, this function accepts optional arguments that are passed to the function.
 *
 * @typeParam T - The type of the value returned by the function.
 * @typeParam E - The type of the error that may be thrown, defaults to `Error`.
 * @typeParam Args - The types of the arguments to pass to the function.
 * @param fn - A function that may throw an exception.
 * @param args - Arguments to pass to the function.
 * @returns `Ok<T>` if the function succeeds, or `Err<E>` if it throws.
 *
 * @example
 * ```ts
 * // Parse JSON safely with arguments
 * const result = tryResult(JSON.parse, jsonString);
 * result.inspect(data => console.log('Parsed:', data))
 *       .inspectErr(err => console.error('Invalid JSON:', err));
 * ```
 *
 * @example
 * ```ts
 * // Validate URL - using closure form
 * const result = tryResult(() => new URL(input));
 * if (result.isOk()) {
 *     console.log('Valid URL:', result.unwrap().href);
 * }
 * ```
 *
 * @example
 * ```ts
 * // With custom error type
 * const result = tryResult<Config, ConfigError, [string]>(parseConfig, raw);
 * ```
 */
export function tryResult<T, E = Error, Args extends unknown[] = []>(fn: (...args: Args) => T, ...args: Args): Result<T, E> {
    try {
        return Ok(fn(...args));
    } catch (err) {
        return Err(err as E);
    }
}

/**
 * Executes an async operation and captures any rejection as an `Err`.
 * If the operation succeeds, returns `Ok` with the resolved value.
 *
 * This overload accepts a Promise or PromiseLike object directly.
 * Use this to convert Promise-based error handling to Result-based handling.
 *
 * @typeParam T - The type of the value that the promise resolves to.
 * @typeParam E - The type of the error that may be rejected, defaults to `Error`.
 * @param task - A promise or promise-like object to await.
 * @returns A promise that resolves to `Ok<T>` if successful, or `Err<E>` if rejected.
 *
 * @example
 * ```ts
 * // Fetch data safely
 * const result = await tryAsyncResult(fetch('/api/data'));
 * result.inspect(response => console.log('Status:', response.status))
 *       .inspectErr(err => console.error('Fetch failed:', err));
 * ```
 *
 * @example
 * ```ts
 * // With typed error
 * const result = await tryAsyncResult<User, ApiError>(api.getUser(id));
 * ```
 */
export async function tryAsyncResult<T, E = Error>(task: PromiseLike<T>): AsyncResult<T, E>;
/**
 * Executes a function and captures any thrown exception or rejection as an `Err`.
 * If the function succeeds, returns `Ok` with the result.
 *
 * This overload accepts a function that may return a sync value or a Promise.
 * It captures both synchronous exceptions (thrown before the Promise is created) and asynchronous rejections.
 *
 * Similar to `Promise.try`, you can pass arguments to the function.
 *
 * @typeParam T - The type of the value returned or resolved by the function.
 * @typeParam E - The type of the error that may be thrown or rejected, defaults to `Error`.
 * @typeParam Args - The types of the arguments to pass to the function.
 * @param task - A function that returns a value or promise-like object.
 * @param args - Arguments to pass to the function.
 * @returns A promise that resolves to `Ok<T>` if successful, or `Err<E>` if thrown or rejected.
 *
 * @example
 * ```ts
 * // Function with arguments
 * const result = await tryAsyncResult(fetch, '/api/data');
 * ```
 *
 * @example
 * ```ts
 * // Function can return sync or async value (like Promise.try)
 * const result = await tryAsyncResult((id) => {
 *     if (cache.has(id)) return cache.get(id);  // sync return
 *     return fetchFromServer(id);                // async return
 * }, 'user-123');
 * ```
 *
 * @example
 * ```ts
 * // Inline async function
 * const result = await tryAsyncResult(async () => {
 *     const response = await fetch('/api');
 *     return response.json();
 * });
 * ```
 *
 * @example
 * ```ts
 * // With custom error type
 * const result = await tryAsyncResult<Config, ConfigError, [string]>(loadConfig, 'app.json');
 * ```
 */
export async function tryAsyncResult<T, E = Error, Args extends unknown[] = []>(task: (...args: Args) => T | PromiseLike<T>, ...args: Args): AsyncResult<T, E>;
export async function tryAsyncResult<T, E = Error, Args extends unknown[] = []>(task: PromiseLike<T> | ((...args: Args) => T | PromiseLike<T>), ...args: Args): AsyncResult<T, E> {
    try {
        const result = typeof task === 'function' ? task(...args) : task;
        return Ok(await result);
    } catch (err) {
        return Err(err as E);
    }
}

/**
 * Converts a Promise or a function returning a Promise to a Result type,
 * capturing the resolved value in an `Ok`, or the error in an `Err`.
 *
 * @deprecated Use {@link tryAsyncResult} instead. This function will be removed in the next major version.
 *
 * @typeParam T - The type of the value that the promise resolves to.
 * @typeParam E - The type of the error that the promise may reject with, defaults to `Error`.
 * @param task - A promise, promise-like object, or a function that returns a promise-like object.
 * @returns A promise that resolves to `Ok<T>` if successful, or `Err<E>` if the promise rejects or the function throws.
 */
export async function promiseToAsyncResult<T, E = Error>(task: PromiseLike<T> | (() => PromiseLike<T>)): AsyncResult<T, E> {
    return tryAsyncResult(task as Parameters<typeof tryAsyncResult<T, E>>[0]);
}
