/**
 * @module
 * Type aliases for commonly used `Result` type combinations.
 *
 * These types provide convenient shortcuts for common patterns like:
 * - Operations that return nothing on success (`VoidResult`)
 * - I/O operations that may fail with an Error (`IOResult`)
 * - Operations that can never fail (`SafeResult`)
 * - Async versions of the above
 */

import type { AsyncResult, Result } from './result.ts';

/**
 * Similar to Rust's `Result<(), E>`.
 *
 * @typeParam E - The type of the error that may be produced by a failed operation.
 * @example
 * ```ts
 * function saveData(data: string): VoidResult<Error> {
 *     if (!data) {
 *         return Err(new Error('Empty data'));
 *     }
 *     localStorage.setItem('data', data);
 *     return Ok();
 * }
 * ```
 */
export type VoidResult<E> = Result<void, E>;

/**
 * `VoidResult<E>` wrapped by `Promise`.
 *
 * @typeParam E - The type of the error that may be produced by a failed operation.
 * @example
 * ```ts
 * async function deleteFile(path: string): AsyncVoidResult<Error> {
 *     try {
 *         await fs.unlink(path);
 *         return Ok();
 *     } catch (e) {
 *         return Err(e as Error);
 *     }
 * }
 * ```
 */
export type AsyncVoidResult<E> = Promise<VoidResult<E>>;

/**
 * Represents a synchronous operation that yields a `Result<T, Error>`.
 * This is a result that is either `Ok(T)` if the operation was successful, or `Err(Error)` if there was an error.
 *
 * @typeParam T - The type of the value that is produced by a successful operation.
 * @example
 * ```ts
 * function parseJSON<T>(json: string): IOResult<T> {
 *     try {
 *         return Ok(JSON.parse(json));
 *     } catch (e) {
 *         return Err(e as Error);
 *     }
 * }
 * ```
 */
export type IOResult<T> = Result<T, Error>;

/**
 * Represents an asynchronous I/O operation that yields a `Result<T, Error>`.
 * This is a promise that resolves to `Ok(T)` if the I/O operation was successful, or `Err(Error)` if there was an error.
 *
 * @typeParam T - The type of the value that is produced by a successful I/O operation.
 * @example
 * ```ts
 * async function readFile(path: string): AsyncIOResult<string> {
 *     try {
 *         const content = await fs.readFile(path, 'utf-8');
 *         return Ok(content);
 *     } catch (e) {
 *         return Err(e as Error);
 *     }
 * }
 * ```
 */
export type AsyncIOResult<T> = AsyncResult<T, Error>;

/**
 * Similar to Rust's `Result<(), Error>`.
 * @example
 * ```ts
 * function logMessage(msg: string): VoidIOResult {
 *     try {
 *         console.log(msg);
 *         return Ok();
 *     } catch (e) {
 *         return Err(e as Error);
 *     }
 * }
 * ```
 */
export type VoidIOResult = IOResult<void>;

/**
 * `VoidIOResult` wrapped by `Promise`.
 * @example
 * ```ts
 * async function sendEmail(to: string, body: string): AsyncVoidIOResult {
 *     try {
 *         await mailer.send({ to, body });
 *         return Ok();
 *     } catch (e) {
 *         return Err(e as Error);
 *     }
 * }
 * ```
 */
export type AsyncVoidIOResult = AsyncIOResult<void>;

/**
 * Represents a `Result` that can never be an `Err`.
 * The error type is `never`, meaning the operation is infallible.
 *
 * This type is useful for:
 * - Functions that always succeed but return a `Result` for API consistency
 * - Safe extraction via `intoOk()` without runtime checks
 *
 * @typeParam T - The type of the value that is always produced.
 * @see {@link Result.intoOk}
 * @example
 * ```ts
 * function getDefaultConfig(): SafeResult<Config> {
 *     return Ok({ timeout: 3000, retries: 3 });
 * }
 *
 * const config = getDefaultConfig().intoOk(); // Safe, no unwrap needed
 * ```
 */
export type SafeResult<T> = Result<T, never>;

/**
 * `SafeResult<T>` wrapped by `Promise`.
 *
 * @typeParam T - The type of the value that is always produced.
 * @example
 * ```ts
 * async function loadCachedData(): AsyncSafeResult<Data> {
 *     const data = await cache.get('data');
 *     return Ok(data ?? defaultData);
 * }
 * ```
 */
export type AsyncSafeResult<T> = Promise<SafeResult<T>>;
