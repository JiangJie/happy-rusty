/**
 * @module
 * Type guard utilities for checking if values are `ControlFlow` types.
 *
 * These functions provide runtime type checking capabilities for the ControlFlow type.
 */
import type { ControlFlow } from './control_flow.ts';
import { ControlFlowKindSymbol } from './symbols.ts';

/**
 * Checks if a value is a `ControlFlow`.
 *
 * @typeParam B - The expected type of the break value contained within the `ControlFlow`.
 * @typeParam C - The expected type of the continue value contained within the `ControlFlow`.
 * @param cf - The value to be checked as a `ControlFlow`.
 * @returns `true` if the value is a `ControlFlow`, otherwise `false`.
 * @example
 * ```ts
 * const x = Break(5);
 * console.log(isControlFlow(x)); // true
 * console.log(isControlFlow(null)); // false
 * console.log(isControlFlow({ isBreak: () => true })); // false
 * ```
 */
export function isControlFlow<B, C>(cf: unknown): cf is ControlFlow<B, C> {
    // `Break` and `Continue` must be an object.
    return cf != null && typeof cf === 'object' && ControlFlowKindSymbol in cf;
}
