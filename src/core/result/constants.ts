/**
 * @module
 * Pre-defined Result constants for common return values.
 *
 * These immutable constants can be reused throughout the application to avoid
 * creating new Result instances for common values like `true`, `false`, `0`, and `void`.
 *
 * The error type is `never` because these are always `Ok` values that can never
 * contain an error. This allows them to be assigned to any `Result<T, E>` type.
 */
import { Ok } from '../prelude.ts';
import type { Result } from './result.ts';

/**
 * Result constant for `true`.
 * Can be used anywhere due to immutability.
 * @since 1.3.0
 * @example
 * ```ts
 * function validate(): Result<boolean, Error> {
 *     return RESULT_TRUE;
 * }
 *
 * const result: Result<boolean, string> = RESULT_TRUE;
 * const value: boolean = RESULT_TRUE.intoOk(); // Safe extraction
 * ```
 */
export const RESULT_TRUE: Result<boolean, never> = Ok(true);

/**
 * Result constant for `false`.
 * Can be used anywhere due to immutability.
 * @since 1.3.0
 * @example
 * ```ts
 * function validate(): Result<boolean, Error> {
 *     return RESULT_FALSE;
 * }
 *
 * const result: Result<boolean, string> = RESULT_FALSE;
 * const value: boolean = RESULT_FALSE.intoOk(); // Safe extraction
 * ```
 */
export const RESULT_FALSE: Result<boolean, never> = Ok(false);

/**
 * Result constant for `0`.
 * Can be used anywhere due to immutability.
 * @since 1.3.0
 * @example
 * ```ts
 * function count(): Result<number, Error> {
 *     return RESULT_ZERO;
 * }
 *
 * const result: Result<number, string> = RESULT_ZERO;
 * const value: number = RESULT_ZERO.intoOk(); // Safe extraction
 * ```
 */
export const RESULT_ZERO: Result<number, never> = Ok(0);

/**
 * Result constant for `void` or `()`.
 * Can be used anywhere due to immutability.
 * @since 1.4.0
 * @example
 * ```ts
 * function doSomething(): Result<void, Error> {
 *     return RESULT_VOID;
 * }
 *
 * const result: Result<void, string> = RESULT_VOID;
 * RESULT_VOID.intoOk(); // Safe extraction (returns undefined)
 * ```
 */
export const RESULT_VOID: Result<void, never> = Ok();
