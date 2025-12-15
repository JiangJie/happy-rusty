/**
 * @fileoverview
 * Rust-inspired [ControlFlow](https://doc.rust-lang.org/std/ops/enum.ControlFlow.html) for control flow handling.
 *
 * `ControlFlow` is used to tell an operation whether it should exit early or go on as usual.
 * This is useful for:
 * - Short-circuiting iterators
 * - Signaling early termination in fold-like operations
 * - Implementing custom control flow patterns
 */

import { Err, None, Ok, Some, type Option, type Result } from '../enum/mod.ts';

/**
 * Used to tell an operation whether it should exit early or go on as usual.
 *
 * This is the return type of `try_fold` and similar iterator methods that support
 * short-circuiting. It can also be used in custom control flow scenarios.
 *
 * @typeParam B - The type of the value returned on `Break` (early exit).
 * @typeParam C - The type of the value returned on `Continue` (default: `void`).
 *
 * @example
 * ```ts
 * // Using ControlFlow to short-circuit a search
 * function findFirstNegative(numbers: number[]): Option<number> {
 *     let result: Option<number> = None;
 *
 *     for (const n of numbers) {
 *         const flow = n < 0 ? Break(n) : Continue();
 *         if (flow.isBreak()) {
 *             result = Some(flow.breakValue().unwrap());
 *             break;
 *         }
 *     }
 *
 *     return result;
 * }
 * ```
 *
 * @example
 * ```ts
 * // Using ControlFlow in a custom fold operation
 * function tryFold<T, Acc>(
 *     arr: T[],
 *     init: Acc,
 *     f: (acc: Acc, item: T) => ControlFlow<Acc, Acc>
 * ): ControlFlow<Acc, Acc> {
 *     let acc = init;
 *     for (const item of arr) {
 *         const flow = f(acc, item);
 *         if (flow.isBreak()) {
 *             return flow;
 *         }
 *         acc = flow.continueValue().unwrap();
 *     }
 *     return Continue(acc);
 * }
 * ```
 */
export interface ControlFlow<B, C = void> {
    /**
     * Returns `true` if this is a `Break` variant.
     *
     * @example
     * ```ts
     * console.log(Break(3).isBreak()); // true
     * console.log(Continue().isBreak()); // false
     * ```
     */
    isBreak(): boolean;

    /**
     * Returns `true` if this is a `Continue` variant.
     *
     * @example
     * ```ts
     * console.log(Continue().isContinue()); // true
     * console.log(Break(3).isContinue()); // false
     * ```
     */
    isContinue(): boolean;

    /**
     * Converts the `ControlFlow` into an `Option` which is `Some` if the
     * `ControlFlow` was `Break` and `None` otherwise.
     *
     * @returns `Some(value)` if `Break`, `None` if `Continue`.
     *
     * @example
     * ```ts
     * console.log(Break(3).breakValue()); // Some(3)
     * console.log(Continue().breakValue()); // None
     * ```
     */
    breakValue(): Option<B>;

    /**
     * Converts the `ControlFlow` into an `Option` which is `Some` if the
     * `ControlFlow` was `Continue` and `None` otherwise.
     *
     * @returns `Some(value)` if `Continue`, `None` if `Break`.
     *
     * @example
     * ```ts
     * console.log(Continue(5).continueValue()); // Some(5)
     * console.log(Break(3).continueValue()); // None
     * ```
     */
    continueValue(): Option<C>;

    /**
     * Maps `ControlFlow<B, C>` to `ControlFlow<T, C>` by applying a function
     * to the break value in case it exists.
     *
     * @typeParam T - The type of the new break value.
     * @param fn - A function to apply to the break value.
     * @returns A new `ControlFlow` with the mapped break value.
     *
     * @example
     * ```ts
     * const flow = Break(3);
     * console.log(flow.mapBreak(v => v * 2).breakValue()); // Some(6)
     * ```
     */
    mapBreak<T>(fn: (value: B) => T): ControlFlow<T, C>;

    /**
     * Maps `ControlFlow<B, C>` to `ControlFlow<B, T>` by applying a function
     * to the continue value in case it exists.
     *
     * @typeParam T - The type of the new continue value.
     * @param fn - A function to apply to the continue value.
     * @returns A new `ControlFlow` with the mapped continue value.
     *
     * @example
     * ```ts
     * const flow = Continue(5);
     * console.log(flow.mapContinue(v => v * 2).continueValue()); // Some(10)
     * ```
     */
    mapContinue<T>(fn: (value: C) => T): ControlFlow<B, T>;

    /**
     * Converts the `ControlFlow` into a `Result` which is `Ok` if the
     * `ControlFlow` was `Break` and `Err` otherwise.
     *
     * @returns `Ok(breakValue)` if `Break`, `Err(continueValue)` if `Continue`.
     *
     * @example
     * ```ts
     * console.log(Break(3).breakOk()); // Ok(3)
     * console.log(Continue('still going').breakOk()); // Err('still going')
     * ```
     */
    breakOk(): Result<B, C>;

    /**
     * Converts the `ControlFlow` into a `Result` which is `Ok` if the
     * `ControlFlow` was `Continue` and `Err` otherwise.
     *
     * @returns `Ok(continueValue)` if `Continue`, `Err(breakValue)` if `Break`.
     *
     * @example
     * ```ts
     * console.log(Continue(5).continueOk()); // Ok(5)
     * console.log(Break('stopped').continueOk()); // Err('stopped')
     * ```
     */
    continueOk(): Result<C, B>;
}

/**
 * Creates a `Break` variant of `ControlFlow`.
 *
 * Use this to signal that an operation should exit early with the given value.
 *
 * @typeParam B - The type of the break value.
 * @param value - The value to return on break.
 * @returns A `ControlFlow` in the `Break` state.
 *
 * @example
 * ```ts
 * const flow = Break('found it');
 * console.log(flow.isBreak()); // true
 * console.log(flow.breakValue().unwrap()); // 'found it'
 * ```
 */
export function Break<B>(value: B): ControlFlow<B, never> {
    return Object.freeze({
        isBreak(): true {
            return true;
        },
        isContinue(): false {
            return false;
        },
        breakValue(): Option<B> {
            return Some(value);
        },
        continueValue(): Option<never> {
            return None;
        },
        mapBreak<T>(fn: (v: B) => T): ControlFlow<T, never> {
            return Break(fn(value));
        },
        mapContinue<T>(_fn: (v: never) => T): ControlFlow<B, T> {
            return this as unknown as ControlFlow<B, T>;
        },
        breakOk(): Result<B, never> {
            return Ok(value);
        },
        continueOk(): Result<never, B> {
            return Err(value);
        },
    });
}

/**
 * Creates a `Continue` variant of `ControlFlow`.
 *
 * Use this to signal that an operation should continue as normal.
 *
 * @typeParam C - The type of the continue value.
 * @param value - The value to carry forward (optional, defaults to `undefined`).
 * @returns A `ControlFlow` in the `Continue` state.
 *
 * @example
 * ```ts
 * const flow = Continue();
 * console.log(flow.isContinue()); // true
 *
 * const flowWithValue = Continue(42);
 * console.log(flowWithValue.continueValue().unwrap()); // 42
 * ```
 */
export function Continue(): ControlFlow<never, void>;
export function Continue<C>(value: C): ControlFlow<never, C>;
export function Continue<C>(...args: [] | [C]): ControlFlow<never, C> {
    const value = (args.length > 0 ? args[0] : undefined) as C;

    return Object.freeze({
        isBreak(): false {
            return false;
        },
        isContinue(): true {
            return true;
        },
        breakValue(): Option<never> {
            return None;
        },
        continueValue(): Option<C> {
            return Some(value);
        },
        mapBreak<T>(_fn: (v: never) => T): ControlFlow<T, C> {
            return this as unknown as ControlFlow<T, C>;
        },
        mapContinue<T>(fn: (v: C) => T): ControlFlow<never, T> {
            return Continue(fn(value));
        },
        breakOk(): Result<never, C> {
            return Err(value);
        },
        continueOk(): Result<C, never> {
            return Ok(value);
        },
    });
}
