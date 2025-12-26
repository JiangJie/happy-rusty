/**
 * @module
 * Type guard utility for checking if a value is an `Option` type.
 *
 * This function provides runtime type checking capability for the Option type.
 */
import type { Option } from './option.ts';
import { OptionKindSymbol } from './symbols.ts';

/**
 * Checks if a value is an `Option`.
 *
 * @typeParam T - The expected type of the value contained within the `Option`.
 * @param o - The value to be checked as an `Option`.
 * @returns `true` if the value is an `Option`, otherwise `false`.
 * @example
 * ```ts
 * const x = Some(5);
 * console.log(isOption(x)); // true
 * console.log(isOption(null)); // false
 * console.log(isOption({ value: 5 })); // false
 * ```
 */
export function isOption<T>(o: unknown): o is Option<T> {
    // `Some` and `None` must be an object.
    return o != null && typeof o === 'object' && OptionKindSymbol in o;
}
