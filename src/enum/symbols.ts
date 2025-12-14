/**
 * @fileoverview
 * Internal symbols used to identify `Option` and `Result` type variants.
 *
 * These symbols are used as property keys to distinguish between `Some`/`None` and `Ok`/`Err` variants.
 * They provide a reliable way to identify the variant of an `Option` or `Result` instance without
 * relying on method calls or duck typing.
 *
 * Note: These symbols are internal implementation details and are not exported as part of the public API.
 * Use the `isOption` and `isResult` utility functions for type checking instead.
 */

/**
 * A unique symbol used as a property key to identify the variant of an `Option` instance.
 *
 * When accessed on an `Option`, returns `'Some'` if the Option contains a value,
 * or `'None'` if it represents the absence of a value.
 *
 * This symbol is used internally by the `isOption` utility function to verify
 * that an object is a valid `Option` instance.
 *
 * @internal
 */
export const OptionKindSymbol = Symbol('Option kind');

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
