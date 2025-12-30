/**
 * @module
 * Extension functions for bridging standard JavaScript patterns with Option types.
 *
 * This module provides utilities for:
 * - Converting try-catch patterns to Option-based handling
 * - Integrating async/await patterns with Option types
 */
import { None, Some } from '../prelude.ts';
import type { AsyncOption, Option } from './option.ts';

/**
 * Executes a function and returns `Some` with the result if successful, or `None` if it throws.
 *
 * This converts try-catch patterns to Option-based handling, where you only care
 * about success/failure, not the error details.
 *
 * Similar to `Promise.try`, this function accepts optional arguments that are passed to the function.
 *
 * @typeParam T - The type of the value returned by the function.
 * @typeParam Args - The types of the arguments to pass to the function.
 * @param fn - A function that may throw an exception.
 * @param args - Arguments to pass to the function.
 * @returns `Some<T>` if the function succeeds, or `None` if it throws.
 *
 * @example
 * ```ts
 * // Parse JSON, ignore error details
 * const data = tryOption(JSON.parse, jsonString);
 * console.log(data.unwrapOr(defaultData));
 * ```
 *
 * @example
 * ```ts
 * // Validate URL - using closure form
 * const url = tryOption(() => new URL(input));
 * url.inspect(u => console.log('Valid URL:', u.href));
 * ```
 *
 * @example
 * ```ts
 * // Decode URI component with arguments
 * const decoded = tryOption(decodeURIComponent, str);
 * ```
 */
export function tryOption<T, Args extends unknown[]>(fn: (...args: Args) => T, ...args: Args): Option<T> {
    try {
        return Some(fn(...args));
    } catch {
        return None;
    }
}

/**
 * Executes an async operation and returns `Some` with the resolved value if successful, or `None` if it rejects.
 *
 * This overload accepts a Promise or PromiseLike object directly.
 * Use this when you already have a Promise and only care about success/failure, not the error details.
 *
 * @typeParam T - The type of the value that the promise resolves to.
 * @param task - A promise or promise-like object to await.
 * @returns A promise that resolves to `Some<T>` if successful, or `None` if rejected.
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
 * // With existing promise
 * const fileContent = await tryAsyncOption(fs.promises.readFile('config.json', 'utf-8'));
 * ```
 */
export function tryAsyncOption<T>(task: PromiseLike<T>): AsyncOption<Awaited<T>>;
/**
 * Executes a function and returns `Some` with the result if successful, or `None` if it throws or rejects.
 *
 * This overload accepts a function that may return a sync value or a Promise.
 * It captures both synchronous exceptions (thrown before the Promise is created) and asynchronous rejections.
 *
 * Similar to `Promise.try`, you can pass arguments to the function.
 *
 * @typeParam T - The type of the value returned or resolved by the function.
 * @typeParam Args - The types of the arguments to pass to the function.
 * @param task - A function that returns a value or promise-like object.
 * @param args - Arguments to pass to the function.
 * @returns A promise that resolves to `Some<T>` if successful, or `None` if thrown or rejected.
 *
 * @example
 * ```ts
 * // Function with arguments
 * const result = await tryAsyncOption(fetch, '/api/data');
 * ```
 *
 * @example
 * ```ts
 * // Function can return sync or async value (like Promise.try)
 * const result = await tryAsyncOption((id) => {
 *     if (cache.has(id)) return cache.get(id);  // sync return
 *     return fetchFromServer(id);                // async return
 * }, 'user-123');
 * ```
 *
 * @example
 * ```ts
 * // Inline async function
 * const data = await tryAsyncOption(async () => {
 *     const response = await fetch('/api');
 *     return response.json();
 * });
 * ```
 */
export function tryAsyncOption<T, Args extends unknown[]>(task: (...args: Args) => PromiseLike<T> | T, ...args: Args): AsyncOption<Awaited<T>>;
export async function tryAsyncOption<T, Args extends unknown[]>(task: PromiseLike<T> | ((...args: Args) => PromiseLike<T> | T), ...args: Args): AsyncOption<Awaited<T>> {
    try {
        const result = typeof task === 'function' ? task(...args) : task;
        return Some(await result);
    } catch {
        return None;
    }
}
