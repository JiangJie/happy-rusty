/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Result } from './core.ts';
import { Ok } from './prelude.ts';

/**
 * Exports some Result constants.
 */

/**
 * Result constant for `true`.
 * Can be used anywhere due to immutability.
 */
export const RESULT_TRUE: Result<boolean, any> = Ok(true);

/**
 * Result constant for `false`.
 * Can be used anywhere due to immutability.
 */
export const RESULT_FALSE: Result<boolean, any> = Ok(false);

/**
 * Result constant for `0`.
 * Can be used anywhere due to immutability.
 */
export const RESULT_ZERO: Result<number, any> = Ok(0);

/**
 * Result constant for `void` or `()`.
 */
export const RESULT_VOID: Result<void, any> = Ok();