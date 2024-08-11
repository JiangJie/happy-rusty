/**
 * Exports some commonly used types.
 */

import type { AsyncResult, Result } from './core.ts';

/**
 * Similar to Rust's `Result<(), E>`.
 *
 * @typeParam E - The type of the error that may be produced by a failed operation.
 */
export type VoidResult<E> = Result<void, E>;

/**
 * `VoidResult<E>` wrapped by `Promise`.
 *
 * @typeParam E - The type of the error that may be produced by a failed operation.
 */
export type AsyncVoidResult<E> = Promise<VoidResult<E>>;

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

/**
 * Similar to Rust's `Result<(), Error>`.
 */
export type VoidIOResult = IOResult<void>;

/**
 * `VoidIOResult` wrapped by `Promise`.
 */
export type AsyncVoidIOResult = AsyncIOResult<void>;