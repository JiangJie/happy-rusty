/**
 * Exports some commonly used types.
 */

import type { Option, Result } from './core.ts';

/**
 * Represents an asynchronous operation that yields an `Option<T>`.
 * This is a promise that resolves to either `Some(T)` if the value is present, or `None` if the value is absent.
 *
 * @typeParam T - The type of the value that may be contained within the `Option`.
 */
export type AsyncOption<T> = Promise<Option<T>>;

/**
 * Represents an asynchronous operation that yields a `Result<T, E>`.
 * This is a promise that resolves to `Ok(T)` if the operation was successful, or `Err(E)` if there was an error.
 *
 * @typeParam T - The type of the value that is produced by a successful operation.
 * @typeParam E - The type of the error that may be produced by a failed operation.
 */
export type AsyncResult<T, E> = Promise<Result<T, E>>;

/**
 * Represents a synchronous operation that yields a `Result<T, Error>`.
 * This is a result that is either `Ok(T)` if the operation was successful, or `Err(Error)` if there was an error.
 *
 * @typeParam T - The type of the value that is produced by a successful operation.
 */
export type IOResult<T> = Result<T, Error>;

/**
 * Represents an asynchronous I/O operation that yields a `Result<T, Error>`.
 * This is a promise that resolves to `Ok(T)` if the I/O operation was successful, or `Err(Error)` if there was an error.
 *
 * @typeParam T - The type of the value that is produced by a successful I/O operation.
 */
export type AsyncIOResult<T> = AsyncResult<T, Error>;