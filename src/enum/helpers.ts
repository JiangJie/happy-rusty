import type { Option, Result } from './core.ts';
import { Err, Ok } from './prelude.ts';
import { OptionKindSymbol, ResultKindSymbol } from './symbols.ts';

/**
 * Checks if a value is an `Option`.
 *
 * @typeParam T - The expected type of the value contained within the `Option`.
 * @param o - The value to be checked as an `Option`.
 * @returns `true` if the value is an `Option`, otherwise `false`.
 */
export function isOption<T>(o: unknown): o is Option<T> {
    // `Some` and `None` must be an object.
    return o != null && typeof o === 'object' && OptionKindSymbol in o;
}

/**
 * Checks if a value is a `Result`.
 *
 * @typeParam T - The expected type of the success value contained within the `Result`.
 * @typeParam E - The expected type of the error value contained within the `Result`.
 * @param r - The value to be checked as a `Result`.
 * @returns `true` if the value is a `Result`, otherwise `false`.
 */
export function isResult<T, E>(r: unknown): r is Result<T, E> {
    // `Ok` and `Err` must be an object.
    return r != null && typeof r === 'object' && ResultKindSymbol in r;
}

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
 *   const result = await promiseToResult(fetchData());
 *   if (result.isOk()) {
 *     console.log('Data:', result.unwrap());
 *   } else {
 *     console.error('Error:', result.unwrapErr());
 *   }
 * }
 * ```
 */
export function promiseToResult<T, E = Error>(p: Promise<T>): Promise<Result<T, E>> {
    return p.then((x): Result<T, E> => {
        return Ok(x);
    }).catch((err: E): Result<T, E> => {
        return Err(err);
    });
}