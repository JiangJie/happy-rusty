/**
 * @module
 * Internal symbols used to identify `ControlFlow` type variants.
 *
 * These symbols are used as property keys to distinguish between `Break` and `Continue` variants.
 * They provide a reliable way to identify the variant of a `ControlFlow` instance without
 * relying on method calls or duck typing.
 *
 * Note: These symbols are internal implementation details and are not exported as part of the public API.
 * Use the `isControlFlow` utility function for type checking instead.
 */

/**
 * A unique symbol used as a property key to identify the variant of a `ControlFlow` instance.
 *
 * When accessed on a `ControlFlow`, returns `'Break'` if the ControlFlow signals early exit,
 * or `'Continue'` if it signals to proceed as normal.
 *
 * This symbol is used internally by the `isControlFlow` utility function to verify
 * that an object is a valid `ControlFlow` instance.
 *
 * @internal
 */
export const ControlFlowKindSymbol = Symbol('ControlFlow kind');
