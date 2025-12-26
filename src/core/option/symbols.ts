/**
 * @fileoverview
 * Internal symbol used to identify `Option` type variants.
 *
 * This symbol is used as a property key to distinguish between `Some` and `None` variants.
 * It provides a reliable way to identify the variant of an `Option` instance without
 * relying on method calls or duck typing.
 *
 * Note: This symbol is an internal implementation detail and is not exported as part of the public API.
 * Use the `isOption` utility function for type checking instead.
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
