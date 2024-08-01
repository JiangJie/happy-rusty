import type { Option, Result } from './core.ts';
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