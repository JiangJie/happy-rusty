/**
 * @fileoverview
 * Pre-defined Result constants for common return values.
 *
 * These immutable constants can be reused throughout the application to avoid
 * creating new Result instances for common values like `true`, `false`, `0`, and `void`.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Result } from './core.ts';
import { Ok } from './prelude.ts';

/**
 * Result constant for `true`.
 * Can be used anywhere due to immutability.
 * @example
 * ```ts
 * function validate(): Result<boolean, Error> {
 *     return RESULT_TRUE;
 * }
 * ```
 */
export const RESULT_TRUE: Result<boolean, any> = Ok(true);

/**
 * Result constant for `false`.
 * Can be used anywhere due to immutability.
 * @example
 * ```ts
 * function validate(): Result<boolean, Error> {
 *     return RESULT_FALSE;
 * }
 * ```
 */
export const RESULT_FALSE: Result<boolean, any> = Ok(false);

/**
 * Result constant for `0`.
 * Can be used anywhere due to immutability.
 * @example
 * ```ts
 * function count(): Result<number, Error> {
 *     return RESULT_ZERO;
 * }
 * ```
 */
export const RESULT_ZERO: Result<number, any> = Ok(0);

/**
 * Result constant for `void` or `()`.
 * Can be used anywhere due to immutability.
 * @example
 * ```ts
 * function doSomething(): Result<void, Error> {
 *     return RESULT_VOID;
 * }
 * ```
 */
export const RESULT_VOID: Result<void, any> = Ok();