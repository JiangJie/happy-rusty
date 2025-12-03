/**
 * @fileoverview
 * Internal symbols used to identify `Option` and `Result` type variants.
 *
 * These symbols are used as property keys to distinguish between `Some`/`None` and `Ok`/`Err` variants.
 */

/**
 * Symbol for Option kind: `Some` or `None`.
 */
export const OptionKindSymbol = Symbol('Option kind');

/**
 * Symbol for Result kind: `Ok` or `Err`.
 */
export const ResultKindSymbol = Symbol('Result kind');