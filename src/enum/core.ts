/**
 * @fileoverview
 * A Rust-inspired [Option](https://doc.rust-lang.org/core/option/index.html) enum type, used as an alternative to the use of null and undefined.
 *
 * And [Result](https://doc.rust-lang.org/core/result/index.html) enum type, used for better error handling.
 *
 */

import type { OptionKindSymbol, ResultKindSymbol } from './symbols.ts';

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
     * [object Option].
     *
     * @private
     */
    readonly [Symbol.toStringTag]: 'Option',

    /**
     * Identify `Some` or `None`.
     *
     * @private
     */
    readonly [OptionKindSymbol]: 'Some' | 'None';

    // #endregion

    // #region Querying the variant

    /**
     * The `isSome` and `isNone` methods return `true` if the `Option` is `Some` or `None`, respectively.
     */

    /**
     * Returns `true` if the Option is a `Some` value.
     */
    isSome(): boolean;

    /**
     * Returns `true` if the Option is a `None` value.
     */
    isNone(): boolean;

    /**
     * Returns `true` if the Option is a `Some` value and the predicate returns `true` for the contained value.
     * @param predicate - A function that takes the contained value and returns a boolean.
     */
    isSomeAnd(predicate: (value: T) => boolean): boolean;

    /**
     * Asynchronous version of `isSomeAnd`.
     */
    isSomeAndAsync(predicate: (value: T) => Promise<boolean>): Promise<boolean>;

    // #endregion

    // #region Extracting the contained value

    /**
     * These methods extract the contained value in an `Option<T>` when it is the `Some` variant:
     */

    /**
     * Returns the contained `Some` value, with a provided error message if the value is a `None`.
     * @param msg - The error message to provide if the value is a `None`.
     * @throws {TypeError} Throws an error with the provided message if the Option is a `None`.
     */
    expect(msg: string): T;

    /**
     * Returns the contained `Some` value.
     * @throws {TypeError} Throws an error if the value is a `None`.
     */
    unwrap(): T;

    /**
     * Returns the contained `Some` value or a provided default.
     * @param defaultValue - The value to return if the Option is a `None`.
     */
    unwrapOr(defaultValue: T): T;

    /**
     * Returns the contained `Some` value or computes it from a closure.
     * @param fn - A function that returns the default value.
     */
    unwrapOrElse(fn: () => T): T;

    /**
     * Asynchronous version of `unwrapOrElse`.
     */
    unwrapOrElseAsync(fn: () => Promise<T>): Promise<T>;

    // #endregion

    // #region Transforming contained values

    /**
     * These methods transform `Option` to `Result`:
     */

    /**
     * Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and `None` to `Err(err)`.
     * @typeParam E - The type of the error value in the `Err` variant of the resulting `Result`.
     * @param error - The error value to use if the Option is a `None`.
     */
    okOr<E>(error: E): Result<T, E>;

    /**
     * Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and `None` to `Err(err())`.
     * @typeParam E - The type of the error value in the `Err` variant of the resulting `Result`.
     * @param err - A function that returns the error value.
     */
    okOrElse<E>(err: () => E): Result<T, E>;

    /**
     * Transposes an `Option` of a `Result` into a `Result` of an `Option`.
     * @typeParam T - The type of the success value in the `Ok` variant of the `Result`.
     * @typeParam E - The type of the error value in the `Err` variant of the `Result`.
     * @returns `Ok` containing `Some` if the Option is a `Some` containing `Ok`,
     *          `Err` containing the error if the Option is a `Some` containing `Err`,
     *          `Ok` containing `None` if the Option is `None`.
     */
    transpose<T, E>(this: Option<Result<T, E>>): Result<Option<T>, E>;

    /**
     * These methods transform the `Some` variant:
     */

    /**
     * Returns `None` if the Option is `None`, otherwise calls predicate with the wrapped value and returns:
     * - `Some(t)` if predicate returns `true` (where `t` is the wrapped value), and
     * - `None` if predicate returns `false`.
     * @param predicate - A function that takes the contained value and returns a boolean.
     */
    filter(predicate: (value: T) => boolean): Option<T>;

    /**
     * Converts from `Option<Option<T>>` to `Option<T>`.
     * @returns `None` if the Option is `None`, otherwise returns the contained `Option`.
     */
    flatten<T>(this: Option<Option<T>>): Option<T>;

    /**
     * Maps an `Option<T>` to `Option<U>` by applying a function to a contained value.
     * @typeParam U - The type of the value returned by the map function.
     * @param fn - A function that takes the contained value and returns a new value.
     */
    map<U>(fn: (value: T) => U): Option<U>;

    /**
     * Maps an `Option<T>` to `U` by applying a function to the contained value (if any), or returns the provided default (if not).
     * @typeParam U - The type of the value returned by the map function or the default value.
     * @param defaultValue - The value to return if the Option is `None`.
     * @param fn - A function that takes the contained value and returns a new value.
     */
    mapOr<U>(defaultValue: U, fn: (value: T) => U): U;

    /**
     * Maps an `Option<T>` to `U` by applying a function to a contained value (if any), or computes a default (if not).
     * @typeParam U - The type of the value returned by the map function or the default function.
     * @param defaultFn - A function that returns the default value.
     * @param fn - A function that takes the contained value and returns a new value.
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
     */
    zipWith<U, R>(other: Option<U>, fn: (value: T, otherValue: U) => R): Option<R>;

    /**
     * Converts from `Option<[T, U]>` to `[Option<T>, Option<U>]`.
     * If `this` is `Some([a, b])`, returns `[Some(a), Some(b)]`.
     * If `this` is `None`, returns `[None, None]`.
     * @typeParam T - The type of the first value in the tuple.
     * @typeParam U - The type of the second value in the tuple.
     * @returns A tuple of `Options`, one for each element in the original `Option` of a tuple.
     */
    unzip<T, U>(this: Option<[T, U]>): [Option<T>, Option<U>];

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
     */
    and<U>(other: Option<U>): Option<U>;

    /**
     * Returns `None` if the Option is `None`, otherwise calls `fn` with the wrapped value and returns the result.
     * This function can be used for control flow based on `Option` values.
     * @typeParam U - The type of the value returned by the function.
     * @param fn - A function that takes the contained value and returns an `Option`.
     * @returns The result of `fn` if `this` is `Some`, otherwise `None`.
     */
    andThen<U>(fn: (value: T) => Option<U>): Option<U>;

    /**
     * Asynchronous version of `andThen`.
     */
    andThenAsync<U>(fn: (value: T) => AsyncOption<U>): AsyncOption<U>;

    /**
     * Returns the Option if it contains a value, otherwise returns `other`.
     * This can be used for providing a fallback `Option`.
     * @param other - The fallback `Option` to use if `this` is `None`.
     * @returns `this` if it is `Some`, otherwise `other`.
     */
    or(other: Option<T>): Option<T>;

    /**
     * Returns the Option if it contains a value, otherwise calls `fn` and returns the result.
     * This method can be used for lazy fallbacks, as `fn` is only evaluated if `this` is `None`.
     * @param fn - A function that produces an `Option`.
     * @returns `this` if it is `Some`, otherwise the result of `fn`.
     */
    orElse(fn: () => Option<T>): Option<T>;

    /**
     * Asynchronous version of `orElse`.
     */
    orElseAsync(fn: () => AsyncOption<T>): AsyncOption<T>;

    /**
     * Returns `Some` if exactly one of `this`, `other` is `Some`, otherwise returns `None`.
     * This can be thought of as an exclusive or operation on `Option` values.
     * @param other - The other `Option` to compare with.
     * @returns `Some` if exactly one of `this` and `other` is `Some`, otherwise `None`.
     */
    xor(other: Option<T>): Option<T>;

    // #endregion

    /**
     * Calls the provided function with the contained value if `this` is `Some`.
     * This is primarily for side effects and does not transform the `Option`.
     * @param fn - A function to call with the contained value.
     * @returns `this`, unmodified, for chaining additional methods.
     */
    inspect(fn: (value: T) => void): this;

    // #region Equals comparison

    /**
     * Tests whether `this` and `other` are both `Some` containing equal values, or both are `None`.
     * This method can be used for comparing `Option` instances in a value-sensitive manner.
     * @param other - The other `Option` to compare with.
     * @returns `true` if `this` and `other` are both `Some` with equal values, or both are `None`, otherwise `false`.
     */
    eq(other: Option<T>): boolean;

    // #endregion

    /**
     * Custom `toString` implementation that uses the `Option`'s contained value.
     */
    toString(): string;
}

/**
 * The `Result` type is used for returning and propagating errors.
 * It is an enum with the variants, `Ok(T)`, representing success and containing a value, and `Err(E)`, representing error and containing an error value.
 * This interface includes methods that act on the `Result` type, similar to Rust's `Result` enum.
 *
 * As Rust Code:
```rust
pub enum Result<T, E> {
    Ok(T),
    Err(E),
}
```
 * @typeParam T - The type of the value contained in a successful `Result`.
 * @typeParam E - The type of the error contained in an unsuccessful `Result`.
 */
export interface Result<T, E> {
    // #region Internal properties

    /**
     * [object Result].
     *
     * @private
     */
    readonly [Symbol.toStringTag]: 'Result',

    /**
     * Identify `Ok` or `Err`.
     *
     * @private
     */
    readonly [ResultKindSymbol]: 'Ok' | 'Err';

    // #endregion

    // #region Querying the variant

    /**
     * The `isOk` and `isErr` methods return `true` if the `Result` is `Ok` or `Err`, respectively.
     */

    /**
     * Returns `true` if the result is `Ok`.
     */
    isOk(): boolean;

    /**
     * Returns `true` if the result is `Err`.
     */
    isErr(): boolean;

    /**
     * Returns `true` if the result is `Ok` and the provided predicate returns `true` for the contained value.
     * @param predicate - A function that takes the `Ok` value and returns a boolean.
     */
    isOkAnd(predicate: (value: T) => boolean): boolean;

    /**
     * Asynchronous version of `isOkAnd`.
     */
    isOkAndAsync(predicate: (value: T) => Promise<boolean>): Promise<boolean>;

    /**
     * Returns `true` if the result is `Err` and the provided predicate returns `true` for the contained error.
     * @param predicate - A function that takes the `Err` value and returns a boolean.
     */
    isErrAnd(predicate: (error: E) => boolean): boolean;

    /**
     * Asynchronous version of `isErrAnd`.
     */
    isErrAndAsync(predicate: (error: E) => Promise<boolean>): Promise<boolean>;

    // #endregion

    // #region Extracting the contained value

    /**
     * These methods extract the contained value in a `Result<T, E>` when it is the `Ok` variant.
     */

    /**
     * Returns the contained `Ok` value, with a provided error message if the result is `Err`.
     * @param msg - The error message to provide if the result is an `Err`.
     * @throws {TypeError} Throws an error with the provided message if the result is an `Err`.
     */
    expect(msg: string): T;

    /**
     * Returns the contained `Ok` value.
     * @throws {TypeError} Throws an error if the result is an `Err`.
     */
    unwrap(): T;

    /**
     * Returns the contained `Ok` value or a provided default.
     * @param defaultValue - The value to return if the result is an `Err`.
     */
    unwrapOr(defaultValue: T): T;

    /**
     * Returns the contained `Ok` value or computes it from a closure if the result is `Err`.
     * @param fn - A function that takes the `Err` value and returns an `Ok` value.
     */
    unwrapOrElse(fn: (error: E) => T): T;

    /**
     * Asynchronous version of `unwrapOrElse`.
     */
    unwrapOrElseAsync(fn: (error: E) => Promise<T>): Promise<T>;

    /**
     * These methods extract the contained value in a `Result<T, E>` when it is the `Err` variant.
     */

    /**
     * Returns the contained `Err` value, with a provided error message if the result is `Ok`.
     * @param msg - The error message to provide if the result is an `Ok`.
     * @throws {TypeError} Throws an error with the provided message if the result is an `Ok`.
     */
    expectErr(msg: string): E;

    /**
     * Returns the contained `Err` value.
     * @throws {TypeError} Throws an error if the result is an `Ok`.
     */
    unwrapErr(): E;

    // #endregion

    // #region Transforming contained values

    /**
     * These methods transform `Result` to `Option`:
     */

    /**
     * Converts from `Result<T, E>` to `Option<T>`.
     * If the result is `Ok`, returns `Some(T)`.
     * If the result is `Err`, returns `None`.
     */
    ok(): Option<T>;

    /**
     * Converts from `Result<T, E>` to `Option<E>`.
     * If the result is `Err`, returns `Some(E)`.
     * If the result is `Ok`, returns `None`.
     */
    err(): Option<E>;

    /**
     * Transposes a `Result` of an `Option` into an `Option` of a `Result`.
     * @typeParam T - The type of the success value in the `Ok` variant of the `Option`.
     * @returns `Some` containing `Ok` if the result is `Ok` containing `Some`,
     *          `Some` containing `Err` if the result is `Err`,
     *          `None` if the result is `Ok` containing `None`.
     */
    transpose<T>(this: Result<Option<T>, E>): Option<Result<T, E>>;

    /**
     * This method transforms the contained value of the `Ok` variant:
     */

    /**
     * Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `Ok` value,
     * leaving an `Err` value untouched.
     * @typeParam U - The type of the value returned by the map function.
     * @param fn - A function that takes the `Ok` value and returns a new value.
     */
    map<U>(fn: (value: T) => U): Result<U, E>;

    /**
     * This method transforms the contained value of the `Err` variant:
     */

    /**
     * Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained `Err` value,
     * leaving an `Ok` value untouched.
     * @typeParam F - The type of the error returned by the map function.
     * @param fn - A function that takes the `Err` value and returns a new error value.
     */
    mapErr<F>(fn: (error: E) => F): Result<T, F>;

    /**
     * These methods transform a `Result<T, E>` into a value of a possibly different type `U`:
     */

    /**
     * Maps a `Result<T, E>` to `U` by applying a function to the contained `Ok` value (if `Ok`), or returns the provided default (if `Err`).
     * @typeParam U - The type of the value returned by the map function or the default value.
     * @param defaultValue - The value to return if the result is `Err`.
     * @param fn - A function that takes the `Ok` value and returns a new value.
     */
    mapOr<U>(defaultValue: U, fn: (value: T) => U): U;

    /**
     * Maps a `Result<T, E>` to `U` by applying a function to the contained `Ok` value (if `Ok`), or computes a default (if `Err`).
     * @typeParam U - The type of the value returned by the map function or the default function.
     * @param defaultFn - A function that returns the default value.
     * @param fn - A function that takes the `Ok` value and returns a new value.
     */
    mapOrElse<U>(defaultFn: (error: E) => U, fn: (value: T) => U): U;

    /**
     * Converts from `Result<Result<T, E>, E>` to `Result<T, E>`.
     * If the result is `Ok(Ok(T))`, returns `Ok(T)`.
     * If the result is `Ok(Err(E))` or `Err(E)`, returns `Err(E)`.
     */
    flatten<T>(this: Result<Result<T, E>, E>): Result<T, E>;

    // #endregion

    // #region Boolean operators

    /**
     * These methods treat the `Result` as a boolean value, where `Ok` acts like `true` and `Err` acts like `false`.
     */

    /**
     * Returns `this` if the result is `Err`, otherwise returns the passed `Result`.
     * @typeParam U - The type of the value in the other `Result`.
     * @param other - The `Result` to return if `this` is `Ok`.
     * @returns The passed `Result` if `this` is `Ok`, otherwise returns `this` (which is `Err`).
     */
    and<U>(other: Result<U, E>): Result<U, E>;

    /**
     * Returns `this` if it is `Ok`, otherwise returns the passed `Result`.
     * @typeParam F - The type of the error in the other `Result`.
     * @param other - The `Result` to return if `this` is `Err`.
     * @returns `this` if it is `Ok`, otherwise returns `other`.
     */
    or<F>(other: Result<T, F>): Result<T, F>;

    /**
     * Calls the provided function with the contained value if `this` is `Ok`, otherwise returns `this` as `Err`.
     * @typeParam U - The type of the value returned by the function.
     * @param fn - A function that takes the `Ok` value and returns a `Result`.
     * @returns The result of `fn` if `this` is `Ok`, otherwise `this` as `Err`.
     */
    andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E>;

    /**
     * Asynchronous version of `andThen`.
     */
    andThenAsync<U>(fn: (value: T) => AsyncResult<U, E>): AsyncResult<U, E>;

    /**
     * Calls the provided function with the contained error if `this` is `Err`, otherwise returns `this` as `Ok`.
     * @typeParam F - The type of the error returned by the function.
     * @param fn - A function that takes the `Err` value and returns a `Result`.
     * @returns The result of `fn` if `this` is `Err`, otherwise `this` as `Ok`.
     */
    orElse<F>(fn: (error: E) => Result<T, F>): Result<T, F>;

    /**
     * Asynchronous version of `orElse`.
     */
    orElseAsync<F>(fn: (error: E) => AsyncResult<T, F>): AsyncResult<T, F>;

    // #endregion

    /**
     * Calls the provided function with the contained value if `this` is `Ok`, for side effects only.
     * Does not modify the `Result`.
     * @param fn - A function to call with the `Ok` value.
     * @returns `this`, unmodified.
     */
    inspect(fn: (value: T) => void): this;

    /**
     * Calls the provided function with the contained error if `this` is `Err`, for side effects only.
     * Does not modify the `Result`.
     * @param fn - A function to call with the `Err` value.
     * @returns `this`, unmodified.
     */
    inspectErr(fn: (error: E) => void): this;

    // #region Equals comparison

    /**
     * Tests whether `this` and `other` are both `Ok` containing equal values, or both are `Err` containing equal errors.
     * @param other - The other `Result` to compare with.
     * @returns `true` if `this` and `other` are both `Ok` with equal values, or both are `Err` with equal errors, otherwise `false`.
     */
    eq(other: Result<T, E>): boolean;

    // #endregion

    /**
     * Transforms the current Result into a new Result where the type of the error result is replaced with a new type `F`.
     * The type of the success result remains unchanged.
     * Just same as `result as unknown as Result<T, F>`.
     *
     * @typeParam F - The new type for the error result.
     * @returns `this` but the error result type is `F`.
     */
    asOk<F>(): Result<T, F>;

    /**
     * Transforms the current Result into a new Result where the type of the success result is replaced with a new type `U`.
     * The type of the error result remains unchanged.
     * Useful where you need to return an Error chained to another type.
     * Just same as `result as unknown as Result<U, E>`.
     *
     * @typeParam U - The new type for the success result.
     * @returns `this` but the success result type is `U`.
     */
    asErr<U>(): Result<U, E>;

    /**
     * Custom `toString` implementation that uses the `Result`'s contained value.
     */
    toString(): string;
}

/**
 * Represents an asynchronous operation that yields an `Option<T>`.
 * This is a promise that resolves to either `Some(T)` if the value is present, or `None` if the value is absent.
 *
 * @typeParam T - The type of the value that may be contained within the `Option`.
 */
export type AsyncOption<T> = Promise<Option<T>>;

/**
 * Represents an asynchronous operation that yields a `Result<T, E>`.
 * This is a promise that resolves to `Ok(T)` if the operation was successful, or `Err(E)` if there was an error.
 *
 * @typeParam T - The type of the value that is produced by a successful operation.
 * @typeParam E - The type of the error that may be produced by a failed operation.
 */
export type AsyncResult<T, E> = Promise<Result<T, E>>;