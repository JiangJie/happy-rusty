/**
 * @module
 * A Rust-inspired [Option](https://doc.rust-lang.org/core/option/index.html) enum type, used as an alternative to the use of null and undefined.
 */

import type { Result } from '../result/result.ts';
import type { OptionKindSymbol } from './symbols.ts';

/**
 * Type `Option` represents an optional value: every `Option` is either `Some` and contains a value, or `None`, and does not.
 * This interface includes methods that act on the `Option` type, similar to Rust's `Option` enum.
 *
 * As Rust Code:
```rust
pub enum Option<T> {
    None,
    Some(T),
}
```
 * @typeParam T - The type of the value contained in the `Some` variant.
 */
export interface Option<T> {
    // #region Internal properties

    /**
     * The well-known symbol `Symbol.toStringTag` used by `Object.prototype.toString()`.
     * Returns `'Option'` so that `Object.prototype.toString.call(option)` produces `'[object Option]'`.
     *
     * This enables reliable type identification even across different execution contexts (e.g., iframes, different module instances).
     *
     * @example
     * ```ts
     * const x = Some(5);
     * console.log(Object.prototype.toString.call(x)); // '[object Option]'
     * ```
     */
    readonly [Symbol.toStringTag]: 'Option';

    /**
     * A unique symbol property used to identify the variant of this `Option`.
     * Returns `'Some'` if the Option contains a value, or `'None'` if it represents absence.
     *
     * This is used internally by the `isOption` utility function to verify that an object is a valid `Option` instance,
     * and to distinguish between `Some` and `None` variants without calling methods.
     *
     * Note: The symbol itself is not exported as part of the public API.
     * Use the `isOption` utility function or the `isSome()`/`isNone()` methods for type checking.
     */
    readonly [OptionKindSymbol]: 'Some' | 'None';

    // #endregion

    // #region JavaScript protocols

    /**
     * Implements the Iterator protocol, allowing `Option` to be used with `for...of` loops and spread syntax.
     * - For `Some(value)`, yields the contained value once.
     * - For `None`, yields nothing (empty iterator).
     *
     * This is similar to Rust's `Option::iter()` method.
     *
     * @returns An iterator that yields zero or one value.
     * @example
     * ```ts
     * // Using with for...of
     * for (const value of Some(5)) {
     *     console.log(value); // 5
     * }
     *
     * for (const value of None) {
     *     console.log(value); // never executed
     * }
     *
     * // Using with spread operator
     * const arr1 = [...Some(5)]; // [5]
     * const arr2 = [...None];    // []
     *
     * // Using with Array.from
     * Array.from(Some('hello')); // ['hello']
     * Array.from(None);          // []
     * ```
     */
    [Symbol.iterator](): Iterator<T>;

    /**
     * Custom `toString` implementation that uses the `Option`'s contained value.
     * @example
     * ```ts
     * console.log(Some(5).toString()); // 'Some(5)'
     * console.log(None.toString()); // 'None'
     * ```
     */
    toString(): string;

    // #endregion

    // #region Querying the variant

    /**
     * The `isSome` and `isNone` methods return `true` if the `Option` is `Some` or `None`, respectively.
     */

    /**
     * Returns `true` if the Option is a `Some` value.
     * @example
     * ```ts
     * const x = Some(2);
     * console.log(x.isSome()); // true
     *
     * const y = None;
     * console.log(y.isSome()); // false
     * ```
     */
    isSome(): boolean;

    /**
     * Returns `true` if the Option is a `None` value.
     * @example
     * ```ts
     * const x = Some(2);
     * console.log(x.isNone()); // false
     *
     * const y = None;
     * console.log(y.isNone()); // true
     * ```
     */
    isNone(): boolean;

    /**
     * Returns `true` if the Option is a `Some` value and the predicate returns `true` for the contained value.
     * @param predicate - A function that takes the contained value and returns a boolean.
     * @example
     * ```ts
     * const x = Some(2);
     * console.log(x.isSomeAnd(v => v > 1)); // true
     * console.log(x.isSomeAnd(v => v > 5)); // false
     * ```
     */
    isSomeAnd(predicate: (value: T) => boolean): boolean;

    /**
     * Asynchronous version of `isSomeAnd`.
     * @param predicate - A function that takes the contained value and returns a `PromiseLike<boolean>` or `boolean`.
     * @returns A promise that resolves to `true` if the Option is `Some` and the predicate resolves to `true`.
     * @see isSomeAnd
     * @example
     * ```ts
     * const x = Some(2);
     * await x.isSomeAndAsync(async v => v > 1); // true
     * ```
     */
    isSomeAndAsync(predicate: (value: T) => PromiseLike<boolean> | boolean): Promise<boolean>;

    /**
     * Returns `true` if the Option is `None`, or the predicate returns `true` for the contained value.
     * @param predicate - A function that takes the contained value and returns a boolean.
     * @see isSomeAnd
     * @example
     * ```ts
     * const x = Some(2);
     * console.log(x.isNoneOr(v => v > 1)); // true
     * console.log(x.isNoneOr(v => v > 5)); // false
     *
     * const y = None;
     * console.log(y.isNoneOr(v => v > 5)); // true (always true for None)
     * ```
     */
    isNoneOr(predicate: (value: T) => boolean): boolean;

    /**
     * Asynchronous version of `isNoneOr`.
     * @param predicate - A function that takes the contained value and returns a `PromiseLike<boolean>` or `boolean`.
     * @returns A promise that resolves to `true` if the Option is `None` or the predicate resolves to `true`.
     * @see isNoneOr
     * @example
     * ```ts
     * const x = Some(2);
     * await x.isNoneOrAsync(async v => v > 1); // true
     *
     * const y = None;
     * await y.isNoneOrAsync(async v => v > 5); // true
     * ```
     */
    isNoneOrAsync(predicate: (value: T) => PromiseLike<boolean> | boolean): Promise<boolean>;

    // #endregion

    // #region Extracting the contained value

    /**
     * These methods extract the contained value in an `Option<T>` when it is the `Some` variant:
     */

    /**
     * Returns the contained `Some` value, with a provided error message if the value is a `None`.
     * @param msg - The error message to provide if the value is a `None`.
     * @throws {TypeError} Throws an error with the provided message if the Option is a `None`.
     * @see unwrap
     * @example
     * ```ts
     * const x = Some(5);
     * console.log(x.expect('value should exist')); // 5
     *
     * const y = None;
     * y.expect('value should exist'); // throws TypeError: value should exist
     * ```
     */
    expect(msg: string): T;

    /**
     * Returns the contained `Some` value.
     * @throws {TypeError} Throws an error if the value is a `None`.
     * @see expect
     * @see unwrapOr
     * @example
     * ```ts
     * const x = Some(5);
     * console.log(x.unwrap()); // 5
     *
     * const y = None;
     * y.unwrap(); // throws TypeError
     * ```
     */
    unwrap(): T;

    /**
     * Returns the contained `Some` value or a provided default.
     * @param defaultValue - The value to return if the Option is a `None`.
     * @see unwrapOrElse
     * @example
     * ```ts
     * const x = Some(5);
     * console.log(x.unwrapOr(10)); // 5
     *
     * const y = None;
     * console.log(y.unwrapOr(10)); // 10
     * ```
     */
    unwrapOr(defaultValue: T): T;

    /**
     * Returns the contained `Some` value or computes it from a closure.
     * @param fn - A function that returns the default value.
     * @see unwrapOr
     * @example
     * ```ts
     * const x = None;
     * console.log(x.unwrapOrElse(() => 10)); // 10
     * ```
     */
    unwrapOrElse(fn: () => T): T;

    /**
     * Asynchronous version of `unwrapOrElse`.
     * @param fn - A function that returns `PromiseLike<T>` or `T` as the default value.
     * @returns A promise that resolves to the contained value or the result of the function.
     * @see unwrapOrElse
     * @example
     * ```ts
     * const x = None;
     * await x.unwrapOrElseAsync(async () => 10); // 10
     * ```
     */
    unwrapOrElseAsync(fn: () => PromiseLike<T> | T): Promise<Awaited<T>>;

    // #endregion

    // #region Transforming contained values

    /**
     * These methods transform `Option` to `Result`:
     */

    /**
     * Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and `None` to `Err(err)`.
     * @typeParam E - The type of the error value in the `Err` variant of the resulting `Result`.
     * @param error - The error value to use if the Option is a `None`.
     * @see okOrElse
     * @example
     * ```ts
     * const x = Some(5);
     * console.log(x.okOr('error').isOk()); // true
     *
     * const y = None;
     * console.log(y.okOr('error').unwrapErr()); // 'error'
     * ```
     */
    okOr<E>(error: E): Result<T, E>;

    /**
     * Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and `None` to `Err(err())`.
     * @typeParam E - The type of the error value in the `Err` variant of the resulting `Result`.
     * @param err - A function that returns the error value.
     * @see okOr
     * @example
     * ```ts
     * const x = None;
     * console.log(x.okOrElse(() => 'error').unwrapErr()); // 'error'
     * ```
     */
    okOrElse<E>(err: () => E): Result<T, E>;

    /**
     * Transposes an `Option` of a `Result` into a `Result` of an `Option`.
     * @typeParam U - The type of the success value in the `Ok` variant of the `Result`.
     * @typeParam E - The type of the error value in the `Err` variant of the `Result`.
     * @returns `Ok` containing `Some` if the Option is a `Some` containing `Ok`,
     *          `Err` containing the error if the Option is a `Some` containing `Err`,
     *          `Ok` containing `None` if the Option is `None`.
     * @example
     * ```ts
     * const x = Some(Ok(5));
     * console.log(x.transpose().unwrap().unwrap()); // 5
     *
     * const y = Some(Err('error'));
     * console.log(y.transpose().unwrapErr()); // 'error'
     *
     * const z: Option<Result<number, string>> = None;
     * console.log(z.transpose().unwrap().isNone()); // true
     * ```
     */
    transpose<U, E>(this: Option<Result<U, E>>): Result<Option<U>, E>;

    /**
     * These methods transform the `Some` variant:
     */

    /**
     * Returns `None` if the Option is `None`, otherwise calls predicate with the wrapped value and returns:
     * - `Some(t)` if predicate returns `true` (where `t` is the wrapped value), and
     * - `None` if predicate returns `false`.
     * @param predicate - A function that takes the contained value and returns a boolean.
     * @example
     * ```ts
     * const x = Some(4);
     * console.log(x.filter(v => v > 2).isSome()); // true
     * console.log(x.filter(v => v > 5).isNone()); // true
     * ```
     */
    filter(predicate: (value: T) => boolean): Option<T>;

    /**
     * Converts from `Option<Option<U>>` to `Option<U>`.
     * @typeParam U - The type of the value contained in the inner `Option`.
     * @returns `None` if the Option is `None`, otherwise returns the contained `Option`.
     * @example
     * ```ts
     * const x = Some(Some(5));
     * console.log(x.flatten().unwrap()); // 5
     *
     * const y = Some(None);
     * console.log(y.flatten().isNone()); // true
     * ```
     */
    flatten<U>(this: Option<Option<U>>): Option<U>;

    /**
     * Maps an `Option<T>` to `Option<U>` by applying a function to a contained value.
     * @typeParam U - The type of the value returned by the map function.
     * @param fn - A function that takes the contained value and returns a new value.
     * @see andThen
     * @example
     * ```ts
     * const x = Some(5);
     * console.log(x.map(v => v * 2).unwrap()); // 10
     *
     * const y = None;
     * console.log(y.map(v => v * 2).isNone()); // true
     * ```
     */
    map<U>(fn: (value: T) => U): Option<U>;

    /**
     * Maps an `Option<T>` to `U` by applying a function to the contained value (if any), or returns the provided default (if not).
     * @typeParam U - The type of the value returned by the map function or the default value.
     * @param defaultValue - The value to return if the Option is `None`.
     * @param fn - A function that takes the contained value and returns a new value.
     * @see mapOrElse
     * @example
     * ```ts
     * const x = Some(5);
     * console.log(x.mapOr(0, v => v * 2)); // 10
     *
     * const y = None;
     * console.log(y.mapOr(0, v => v * 2)); // 0
     * ```
     */
    mapOr<U>(defaultValue: U, fn: (value: T) => U): U;

    /**
     * Maps an `Option<T>` to `U` by applying a function to a contained value (if any), or computes a default (if not).
     * @typeParam U - The type of the value returned by the map function or the default function.
     * @param defaultFn - A function that returns the default value.
     * @param fn - A function that takes the contained value and returns a new value.
     * @see mapOr
     * @example
     * ```ts
     * const x = Some(5);
     * console.log(x.mapOrElse(() => 0, v => v * 2)); // 10
     *
     * const y = None;
     * console.log(y.mapOrElse(() => 0, v => v * 2)); // 0
     * ```
     */
    mapOrElse<U>(defaultFn: () => U, fn: (value: T) => U): U;

    /**
     * These methods combine the `Some` variants of two `Option` values:
     */

    /**
     * Combines `this` with another `Option` by zipping their contained values.
     * If `this` is `Some(s)` and `other` is `Some(o)`, returns `Some([s, o])`.
     * If either `this` or `other` is `None`, returns `None`.
     * @typeParam U - The type of the value in the other `Option`.
     * @param other - The other `Option` to zip with.
     * @returns An `Option` containing a tuple of the values if both are `Some`, otherwise `None`.
     * @see zipWith
     * @see unzip
     * @see reduce
     * @example
     * ```ts
     * const x = Some(1);
     * const y = Some('hello');
     * console.log(x.zip(y).unwrap()); // [1, 'hello']
     *
     * const z = None;
     * console.log(x.zip(z).isNone()); // true
     * ```
     */
    zip<U>(other: Option<U>): Option<[T, U]>;

    /**
     * Zips `this` with another `Option` using a provided function to combine their contained values.
     * If `this` is `Some(s)` and `other` is `Some(o)`, returns `Some(fn(s, o))`.
     * If either `this` or `other` is `None`, returns `None`.
     * @typeParam U - The type of the value in the other `Option`.
     * @typeParam R - The return type of the combining function.
     * @param other - The other `Option` to zip with.
     * @param fn - The function to combine the values from both `Options`.
     * @returns An `Option` containing the result of `fn` if both `Options` are `Some`, otherwise `None`.
     * @see zip
     * @see reduce
     * @example
     * ```ts
     * const x = Some(2);
     * const y = Some(3);
     * console.log(x.zipWith(y, (a, b) => a * b).unwrap()); // 6
     * ```
     */
    zipWith<U, R>(other: Option<U>, fn: (value: T, otherValue: U) => R): Option<R>;

    /**
     * Converts from `Option<[U, R]>` to `[Option<U>, Option<R>]`.
     * If `this` is `Some([a, b])`, returns `[Some(a), Some(b)]`.
     * If `this` is `None`, returns `[None, None]`.
     * @typeParam U - The type of the first value in the tuple.
     * @typeParam R - The type of the second value in the tuple.
     * @returns A tuple of `Options`, one for each element in the original `Option` of a tuple.
     * @see zip
     * @example
     * ```ts
     * const x = Some([1, 'hello'] as [number, string]);
     * const [a, b] = x.unzip();
     * console.log(a.unwrap()); // 1
     * console.log(b.unwrap()); // 'hello'
     * ```
     */
    unzip<U, R>(this: Option<[U, R]>): [Option<U>, Option<R>];

    /**
     * Reduces two `Option` values into one using the provided function.
     *
     * - If both `this` and `other` are `Some`, applies `fn` to both values and returns `Some(result)`.
     * - If only `this` is `Some`, returns `Some(this_value)`.
     * - If only `other` is `Some`, returns `Some(other_value)`.
     * - If both are `None`, returns `None`.
     *
     * This is similar to Rust's `Option::reduce` with `Into<R>` constraints.
     * In TypeScript, when only one Option is Some, that value is returned as-is
     * (relying on TypeScript's structural typing for compatibility with R).
     *
     * @typeParam U - The type of the value in the other `Option`.
     * @typeParam R - The result type (defaults to `T | U`).
     * @param other - The other `Option` to reduce with.
     * @param fn - A function that combines both values when both are `Some`.
     * @returns The reduced `Option`.
     * @see zip
     * @see zipWith
     * @see or
     * @example
     * ```ts
     * const a = Some(10);
     * const b = Some(20);
     * console.log(a.reduce(b, (x, y) => x + y).unwrap()); // 30
     *
     * const c = None as Option<number>;
     * console.log(a.reduce(c, (x, y) => x + y).unwrap()); // 10
     * console.log(c.reduce(b, (x, y) => x + y).unwrap()); // 20
     * console.log(c.reduce(c, (x, y) => x + y).isNone()); // true
     *
     * // With different types that share a common supertype
     * const str = Some('hello');
     * const num = Some(42);
     * const result: Option<string> = str.reduce(num, (s, n) => `${s}-${n}`);
     * ```
     */
    reduce<U, R = T | U>(other: Option<U>, fn: (value: T, otherValue: U) => R): Option<T | U | R>;

    // #endregion

    // #region Boolean operators

    /**
     * These methods treat the `Option` as a boolean value, where `Some` acts like `true` and `None` acts like `false`.
     */

    /**
     * Returns `None` if the Option is `None`, otherwise returns `other`.
     * This is sometimes called "and then" because it is similar to a logical AND operation.
     * @typeParam U - The type of the value in the other `Option`.
     * @param other - The `Option` to return if `this` is `Some`.
     * @returns `None` if `this` is `None`, otherwise returns `other`.
     * @see or
     * @see xor
     * @example
     * ```ts
     * const x = Some(2);
     * const y = Some('hello');
     * console.log(x.and(y).unwrap()); // 'hello'
     *
     * const z = None;
     * console.log(z.and(y).isNone()); // true
     * ```
     */
    and<U>(other: Option<U>): Option<U>;

    /**
     * Returns `None` if the Option is `None`, otherwise calls `fn` with the wrapped value and returns the result.
     * This function can be used for control flow based on `Option` values.
     * @typeParam U - The type of the value returned by the function.
     * @param fn - A function that takes the contained value and returns an `Option`.
     * @returns The result of `fn` if `this` is `Some`, otherwise `None`.
     * @see map
     * @see orElse
     * @example
     * ```ts
     * const x = Some(2);
     * const result = x.andThen(v => v > 0 ? Some(v * 2) : None);
     * console.log(result.unwrap()); // 4
     *
     * const y = None;
     * console.log(y.andThen(v => Some(v * 2)).isNone()); // true
     * ```
     */
    andThen<U>(fn: (value: T) => Option<U>): Option<U>;

    /**
     * Asynchronous version of `andThen`.
     * @typeParam U - The type of the value returned by the function.
     * @param fn - A function that takes the contained value and returns `PromiseLike<Option<U>>` or `Option<U>`.
     * @returns A promise that resolves to `None` if `this` is `None`, otherwise the result of `fn`.
     * @see andThen
     * @see orElseAsync
     * @example
     * ```ts
     * const x = Some(2);
     * const result = await x.andThenAsync(async v => Some(v * 2));
     * console.log(result.unwrap()); // 4
     * ```
     */
    andThenAsync<U>(fn: (value: T) => AsyncLikeOption<U> | Option<U>): AsyncOption<U>;

    /**
     * Returns the Option if it contains a value, otherwise returns `other`.
     * This can be used for providing a fallback `Option`.
     * @param other - The fallback `Option` to use if `this` is `None`.
     * @returns `this` if it is `Some`, otherwise `other`.
     * @see and
     * @see xor
     * @see reduce
     * @example
     * ```ts
     * const x = None;
     * const y = Some(5);
     * console.log(x.or(y).unwrap()); // 5
     *
     * const z = Some(2);
     * console.log(z.or(y).unwrap()); // 2
     * ```
     */
    or(other: Option<T>): Option<T>;

    /**
     * Returns the Option if it contains a value, otherwise calls `fn` and returns the result.
     * This method can be used for lazy fallbacks, as `fn` is only evaluated if `this` is `None`.
     * @param fn - A function that produces an `Option`.
     * @returns `this` if it is `Some`, otherwise the result of `fn`.
     * @see andThen
     * @example
     * ```ts
     * const x = None;
     * const result = x.orElse(() => Some(10));
     * console.log(result.unwrap()); // 10
     *
     * const y = Some(5);
     * console.log(y.orElse(() => Some(10)).unwrap()); // 5
     * ```
     */
    orElse(fn: () => Option<T>): Option<T>;

    /**
     * Asynchronous version of `orElse`.
     * @param fn - A function that produces `PromiseLike<Option<T>>` or `Option<T>`.
     * @returns A promise that resolves to `this` if it is `Some`, otherwise the result of `fn`.
     * @see orElse
     * @see andThenAsync
     * @example
     * ```ts
     * const x = None;
     * const result = await x.orElseAsync(async () => Some(10));
     * console.log(result.unwrap()); // 10
     * ```
     */
    orElseAsync(fn: () => AsyncLikeOption<T> | Option<T>): AsyncOption<T>;

    /**
     * Returns `Some` if exactly one of `this`, `other` is `Some`, otherwise returns `None`.
     * This can be thought of as an exclusive or operation on `Option` values.
     * @param other - The other `Option` to compare with.
     * @returns `Some` if exactly one of `this` and `other` is `Some`, otherwise `None`.
     * @see and
     * @see or
     * @example
     * ```ts
     * const x = Some(2);
     * const y = None;
     * console.log(x.xor(y).unwrap()); // 2
     *
     * const a = Some(2);
     * const b = Some(3);
     * console.log(a.xor(b).isNone()); // true
     * ```
     */
    xor(other: Option<T>): Option<T>;

    // #endregion

    /**
     * Calls the provided function with the contained value if `this` is `Some`.
     * This is primarily for side effects and does not transform the `Option`.
     * @param fn - A function to call with the contained value.
     * @returns `this`, unmodified, for chaining additional methods.
     * @example
     * ```ts
     * const x = Some(5);
     * // Prints "value: 5" and returns Some(10)
     * const doubled = x.inspect(v => console.log('value:', v)).map(v => v * 2);
     *
     * const y = None;
     * // Does nothing and returns None
     * y.inspect(v => console.log('value:', v));
     * ```
     */
    inspect(fn: (value: T) => void): this;

    // #region Equals comparison

    /**
     * Tests whether `this` and `other` are both `Some` containing equal values, or both are `None`.
     * This method can be used for comparing `Option` instances in a value-sensitive manner.
     * @param other - The other `Option` to compare with.
     * @returns `true` if `this` and `other` are both `Some` with equal values, or both are `None`, otherwise `false`.
     * @example
     * ```ts
     * const a = Some(5);
     * const b = Some(5);
     * const c = Some(10);
     * console.log(a.eq(b)); // true
     * console.log(a.eq(c)); // false
     * console.log(None.eq(None)); // true
     * console.log(a.eq(None)); // false
     * ```
     */
    eq(other: Option<T>): boolean;

    // #endregion
}

/**
 * Represents an asynchronous `Option` that is wrapped in a `Promise`.
 * This type alias is used for functions that perform asynchronous operations
 * and return an `Option` as the result.
 *
 * @typeParam T - The type of the value that may be contained in the `Some` variant.
 * @example
 * ```ts
 * async function fetchUser(id: number): AsyncOption<User> {
 *     const response = await fetch(`/users/${id}`);
 *     if (response.ok) {
 *         return Some(await response.json());
 *     }
 *     return None;
 * }
 * ```
 */
export type AsyncOption<T> = Promise<Option<T>>;

/**
 * Represents an asynchronous `Option` that is wrapped in a `PromiseLike`.
 * This is similar to `AsyncOption<T>` but uses `PromiseLike` instead of `Promise`,
 * allowing compatibility with any thenable object.
 *
 * @typeParam T - The type of the value that may be contained in the `Some` variant.
 * @example
 * ```ts
 * // Works with any PromiseLike, not just Promise
 * const thenable: AsyncLikeOption<number> = {
 *     then(resolve) { resolve(Some(42)); }
 * };
 * ```
 */
export type AsyncLikeOption<T> = PromiseLike<Option<T>>;
