/**
 * @fileoverview
 * Extension functions for bridging standard JavaScript patterns with Option/Result types.
 *
 * This module provides utilities for:
 * - Converting try-catch patterns to Option-based handling
 * - Converting try-catch patterns to Result-based error handling
 * - Integrating async/await patterns with Option/Result types
 */
import type { AsyncOption, AsyncResult, Option, Result } from './core.ts';
import { Err, None, Ok, Some } from './prelude.ts';

/**
 * Executes a function and returns `Some` with the result if successful, or `None` if it throws.
 *
 * This converts try-catch patterns to Option-based handling, where you only care
 * about success/failure, not the error details.
 *
 * @typeParam T - The type of the value returned by the function.
 * @param fn - A function that may throw an exception.
 * @returns `Some<T>` if the function succeeds, or `None` if it throws.
 *
 * @example
 * ```ts
 * // Parse JSON, ignore error details
 * const data = tryOption(() => JSON.parse(jsonString));
 * console.log(data.unwrapOr(defaultData));
 * ```
 *
 * @example
 * ```ts
 * // Validate URL
 * const url = tryOption(() => new URL(input));
 * url.inspect(u => console.log('Valid URL:', u.href));
 * ```
 *
 * @example
 * ```ts
 * // Decode URI component
 * const decoded = tryOption(() => decodeURIComponent(str));
 * ```
 */
export function tryOption<T>(fn: () => T): Option<T> {
    try {
        return Some(fn());
    } catch {
        return None;
    }
}

/**
 * Executes an async function and returns `Some` with the resolved value if successful, or `None` if it rejects.
 *
 * This is the async version of `tryOption`. It captures both synchronous exceptions
 * (thrown before the Promise is created) and asynchronous rejections.
 *
 * Use this when you only care about success/failure, not the error details.
 *
 * @typeParam T - The type of the value that the promise resolves to.
 * @param task - A promise, promise-like object, or a function that returns a promise-like object.
 * @returns A promise that resolves to `Some<T>` if successful, or `None` if rejected or thrown.
 *
 * @example
 * ```ts
 * // Fetch data, ignore error details
 * const data = await tryAsyncOption(fetch('/api/data').then(r => r.json()));
 * console.log(data.unwrapOr(defaultData));
 * ```
 *
 * @example
 * ```ts
 * // Function form - captures sync exceptions
 * const result = await tryAsyncOption(() => {
 *     const id = JSON.parse(jsonString);  // May throw synchronously
 *     return fetch(`/api/${id}`);
 * });
 * ```
 *
 * @example
 * ```ts
 * // Database query that may fail
 * const record = await tryAsyncOption(() => db.findOne({ id }));
 * console.log(record.unwrapOr(defaultRecord));
 * ```
 */
export async function tryAsyncOption<T>(task: PromiseLike<T> | (() => PromiseLike<T>)): AsyncOption<T> {
    try {
        const promise = typeof task === 'function' ? task() : task;
        return Some(await promise);
    } catch {
        return None;
    }
}

/**
 * Executes a function and captures any thrown exception as an `Err`.
 * If the function executes successfully, returns `Ok` with the result.
 *
 * Use this to convert traditional try-catch error handling to Result-based handling.
 *
 * @typeParam T - The type of the value returned by the function.
 * @typeParam E - The type of the error that may be thrown, defaults to `Error`.
 * @param fn - A function that may throw an exception.
 * @returns `Ok<T>` if the function succeeds, or `Err<E>` if it throws.
 *
 * @example
 * ```ts
 * // Parse JSON safely
 * const result = tryResult(() => JSON.parse(jsonString));
 * result.inspect(data => console.log('Parsed:', data))
 *       .inspectErr(err => console.error('Invalid JSON:', err));
 * ```
 *
 * @example
 * ```ts
 * // Validate URL
 * const result = tryResult(() => new URL(input));
 * if (result.isOk()) {
 *     console.log('Valid URL:', result.unwrap().href);
 * }
 * ```
 *
 * @example
 * ```ts
 * // With custom error type
 * const result = tryResult<Config, ConfigError>(() => parseConfig(raw));
 * ```
 */
export function tryResult<T, E = Error>(fn: () => T): Result<T, E> {
    try {
        return Ok(fn());
    } catch (err) {
        return Err(err as E);
    }
}

/**
 * Executes an async function and captures any rejection as an `Err`.
 * If the function executes successfully, returns `Ok` with the resolved value.
 *
 * This is the async version of `tryResult`. It captures both synchronous exceptions
 * (thrown before the Promise is created) and asynchronous rejections.
 *
 * @typeParam T - The type of the value that the promise resolves to.
 * @typeParam E - The type of the error that may be thrown or rejected, defaults to `Error`.
 * @param task - A promise, promise-like object, or a function that returns a promise-like object.
 * @returns A promise that resolves to `Ok<T>` if successful, or `Err<E>` if rejected or thrown.
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
 * // Function form - captures sync exceptions
 * const result = await tryAsyncResult(() => {
 *     const id = JSON.parse(jsonString);  // May throw synchronously
 *     return fetch(`/api/${id}`);
 * });
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
 */
export async function tryAsyncResult<T, E = Error>(task: PromiseLike<T> | (() => PromiseLike<T>)): AsyncResult<T, E> {
    try {
        const promise = typeof task === 'function' ? task() : task;
        return Ok(await promise);
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
export function promiseToAsyncResult<T, E = Error>(task: PromiseLike<T> | (() => PromiseLike<T>)): AsyncResult<T, E> {
    return tryAsyncResult(task);
}
