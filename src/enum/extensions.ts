import type { Result } from './core.ts';
import { Err, Ok } from './prelude.ts';

/**
 * Converts a Promise to a Result type, capturing the resolved value in an `Ok`, or the error in an `Err`.
 * This allows for promise-based asynchronous operations to be handled in a way that is more in line with the Result pattern.
 *
 * @typeParam T - The type of the value that the promise resolves to.
 * @typeParam E - The type of the error that the promise may reject with, defaults to `Error`.
 * @param p - The promise to convert into a `Result` type.
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
 */
export function promiseToAsyncResult<T, E = Error>(p: Promise<T>): Promise<Result<T, E>> {
    return p.then((x): Result<T, E> => {
        return Ok(x);
    }).catch((err: E): Result<T, E> => {
        return Err(err);
    });
}