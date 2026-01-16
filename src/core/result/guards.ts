/**
 * @module
 * Type guard utility for checking if a value is a `Result` type.
 *
 * This function provides runtime type checking capability for the Result type.
 */
import type { Result } from './result.ts';
import { ResultKindSymbol } from './symbols.ts';

/**
 * Checks if a value is a `Result`.
 *
 * @typeParam T - The expected type of the success value contained within the `Result`.
 * @typeParam E - The expected type of the error value contained within the `Result`.
 * @param r - The value to be checked as a `Result`.
 * @returns `true` if the value is a `Result`, otherwise `false`.
 * @since 1.2.0
 * @example
 * ```ts
 * const x = Ok(5);
 * console.log(isResult(x)); // true
 * console.log(isResult(null)); // false
 * console.log(isResult({ value: 5 })); // false
 * ```
 */
export function isResult<T, E>(r: unknown): r is Result<T, E> {
    // `Ok` and `Err` must be an object.
    return r != null && typeof r === 'object' && ResultKindSymbol in r;
}
