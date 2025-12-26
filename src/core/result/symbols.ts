/**
 * @fileoverview
 * Internal symbol used to identify `Result` type variants.
 *
 * This symbol is used as a property key to distinguish between `Ok` and `Err` variants.
 * It provides a reliable way to identify the variant of a `Result` instance without
 * relying on method calls or duck typing.
 *
 * Note: This symbol is an internal implementation detail and is not exported as part of the public API.
 * Use the `isResult` utility function for type checking instead.
 */

/**
 * A unique symbol used as a property key to identify the variant of a `Result` instance.
 *
 * When accessed on a `Result`, returns `'Ok'` if the Result represents success,
 * or `'Err'` if it represents failure.
 *
 * This symbol is used internally by the `isResult` utility function to verify
 * that an object is a valid `Result` instance.
 *
 * @internal
 */
export const ResultKindSymbol = Symbol('Result kind');
