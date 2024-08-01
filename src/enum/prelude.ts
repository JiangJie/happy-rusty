/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @fileoverview
 * A Rust-inspired [Option](https://doc.rust-lang.org/core/option/index.html) enum type, used as an alternative to the use of null and undefined.
 *
 * And [Result](https://doc.rust-lang.org/core/result/index.html) enum type, used for better error handling.
 *
 */

/**
 * Symbol for Option kind: `Some` or `None`.
 */
const optionKindSymbol = Symbol('Option kind');

/**
 * Symbol for Result kind: `Ok` or `Err`.
 */
const resultKindSymbol = Symbol('Result kind');

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
     */
    [Symbol.toStringTag]: 'Option',

    /**
     * Identify `Some` or `None`.
     *
     * @private
     */
    readonly [optionKindSymbol]: 'Some' | 'None';

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
 * Represents the absence of a value, as a specialized `Option` type.
 * The type parameter is set to `never` because `None` does not hold a value.
 */
export interface None extends Option<never> {
    /**
     * When using `None` alone, the following overrides can make type inference more accurate.
     */

    readonly [optionKindSymbol]: 'None';

    unwrapOr<T>(defaultValue: T): T;
    unwrapOrElse<T>(fn: () => T): T;

    transpose(): Result<None, never>;

    filter(predicate: (value: never) => boolean): None;
    flatten(): None;
    map<U>(fn: (value: never) => U): None;

    zip<U>(other: Option<U>): None;
    zipWith<U, R>(other: Option<U>, fn: (value: never, otherValue: U) => R): None;
    unzip(): [None, None];

    and<U>(other: Option<U>): None;
    andThen<U>(fn: (value: never) => Option<U>): None;
    or<T>(other: Option<T>): Option<T>;
    orElse<T>(fn: () => Option<T>): Option<T>;
    xor<T>(other: Option<T>): Option<T>;

    eq<T>(other: Option<T>): boolean;
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
     */
    [Symbol.toStringTag]: 'Result',

    /**
     * Identify `Ok` or `Err`.
     *
     * @private
     */
    readonly [resultKindSymbol]: 'Ok' | 'Err';

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
     * Returns `true` if the result is `Err` and the provided predicate returns `true` for the contained error.
     * @param predicate - A function that takes the `Err` value and returns a boolean.
     */
    isErrAnd(predicate: (error: E) => boolean): boolean;

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
     * Calls the provided function with the contained error if `this` is `Err`, otherwise returns `this` as `Ok`.
     * @typeParam F - The type of the error returned by the function.
     * @param fn - A function that takes the `Err` value and returns a `Result`.
     * @returns The result of `fn` if `this` is `Err`, otherwise `this` as `Ok`.
     */
    orElse<F>(fn: (error: E) => Result<T, F>): Result<T, F>;

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
 * Export some commonly used types.
 */

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

/**
 * Represents a synchronous operation that yields a `Result<T, Error>`.
 * This is a result that is either `Ok(T)` if the operation was successful, or `Err(Error)` if there was an error.
 *
 * @typeParam T - The type of the value that is produced by a successful operation.
 */
export type IOResult<T> = Result<T, Error>;

/**
 * Represents an asynchronous I/O operation that yields a `Result<T, Error>`.
 * This is a promise that resolves to `Ok(T)` if the I/O operation was successful, or `Err(Error)` if there was an error.
 *
 * @typeParam T - The type of the value that is produced by a successful I/O operation.
 */
export type AsyncIOResult<T> = Promise<IOResult<T>>;

/**
 * Creates an `Option<T>` representing the presence of a value.
 * This function is typically used to construct an `Option` that contains a value, indicating that the operation yielding the value was successful.
 *
 * @typeParam T - The type of the value to be wrapped in a `Some`.
 * @param value - The value to wrap as a `Some` option.
 * @returns An `Option<T>` that contains the provided value, representing the `Some` case.
 *
 * @example
 * ```ts
 * const maybeValue = Some(1); // Option<number> with a value
 * if (maybeValue.isSome()) {
 *     console.log(maybeValue.unwrap()); // Outputs: 1
 * }
 * ```
 */
export function Some<T>(value: T): Option<T> {
    const some: Option<T> = {
        [Symbol.toStringTag]: 'Option',
        [optionKindSymbol]: 'Some',

        isSome(): true {
            return true;
        },
        isNone(): false {
            return false;
        },
        isSomeAnd(predicate: (value: T) => boolean): boolean {
            return predicate(value);
        },

        expect(_msg: string): T {
            return value;
        },
        unwrap(): T {
            return value;
        },
        unwrapOr(_defaultValue: T): T {
            return value;
        },
        unwrapOrElse(_fn: () => T): T {
            return value;
        },

        okOr<E>(_error: E): Result<T, E> {
            return Ok(value);
        },
        okOrElse<E>(_err: () => E): Result<T, E> {
            return Ok(value);
        },
        transpose<T, E>(): Result<Option<T>, E> {
            const r = value as unknown as Result<T, E>;
            assertResult(r);
            return r.isOk() ? Ok(Some(r.unwrap())) : Err(r.unwrapErr());
        },

        filter(predicate: (value: T) => boolean): Option<T> {
            return predicate(value) ? some : None;
        },
        flatten<T>(): Option<T> {
            const o = value as unknown as Option<T>;
            assertOption(o);
            return o;
        },
        map<U>(fn: (value: T) => U): Option<U> {
            return Some(fn(value));
        },

        mapOr<U>(_defaultValue: U, fn: (value: T) => U): U {
            return fn(value);
        },
        mapOrElse<U>(_defaultFn: () => U, fn: (value: T) => U): U {
            return fn(value);
        },

        zip<U>(other: Option<U>): Option<[T, U]> {
            assertOption(other);
            return other.isSome() ? Some([value, other.unwrap()]) : None;
        },
        zipWith<U, R>(other: Option<U>, fn: (value: T, otherValue: U) => R): Option<R> {
            assertOption(other);
            return other.isSome() ? Some(fn(value, other.unwrap())) : None;
        },
        unzip<T, U>(): [Option<T>, Option<U>] {
            const tuple = value as unknown as [T, U];

            if (!Array.isArray(tuple) || tuple.length !== 2) {
                throw new TypeError('Unzip format is incorrect.');
            }

            const [a, b] = tuple;
            return [Some(a), Some(b)];
        },

        and<U>(other: Option<U>): Option<U> {
            assertOption(other);
            return other;
        },
        andThen<U>(fn: (value: T) => Option<U>): Option<U> {
            return fn(value);
        },
        or(_other: Option<T>): Option<T> {
            return some;
        },
        orElse(_fn: () => Option<T>): Option<T> {
            return some;
        },
        xor(other: Option<T>): Option<T> {
            assertOption(other);
            return other.isSome() ? None : some;
        },

        inspect(fn: (value: T) => void): Option<T> {
            fn(value);
            return some;
        },

        eq(other: Option<T>): boolean {
            assertOption(other);
            return other.isSome() && other.unwrap() === value;
        },

        toString(): string {
            return `Some(${ value })`;
        },
    } as const;

    return some;
}

/**
 * A constant representing the `None` case of an `Option`, indicating the absence of a value.
 * This constant is frozen to ensure it is immutable and cannot be altered, preserving the integrity of `None` throughout the application.
 */
export const None = Object.freeze<None>({
    [Symbol.toStringTag]: 'Option',
    [optionKindSymbol]: 'None',

    isSome(): false {
        return false;
    },
    isNone(): true {
        return true;
    },
    isSomeAnd(_predicate: (value: never) => boolean): false {
        return false;
    },

    expect(msg: string): never {
        throw new TypeError(msg);
    },
    unwrap(): never {
        throw new TypeError('Called `Option::unwrap()` on a `None` value');
    },
    unwrapOr<T>(defaultValue: T): T {
        return defaultValue;
    },
    unwrapOrElse<T>(fn: () => T): T {
        return fn();
    },

    okOr<E>(error: E): Result<never, E> {
        return Err(error);
    },
    okOrElse<E>(err: () => E): Result<never, E> {
        return Err(err());
    },
    transpose(): Result<None, never> {
        return Ok(None);
    },

    filter(_predicate: (value: never) => boolean): None {
        return None;
    },
    flatten(): None {
        return None;
    },
    map<U>(_fn: (value: never) => U): None {
        return None;
    },

    mapOr<U>(defaultValue: U, _fn: (value: never) => U): U {
        return defaultValue;
    },
    mapOrElse<U>(defaultFn: () => U, _fn: (value: never) => U): U {
        return defaultFn();
    },

    zip<U>(_other: Option<U>): None {
        return None;
    },
    zipWith<U, R>(_other: Option<U>, _fn: (value: never, otherValue: U) => R): None {
        return None;
    },
    unzip(): [None, None] {
        return [None, None];
    },

    and<U>(_other: Option<U>): None {
        return None;
    },
    andThen<U>(_fn: (value: never) => Option<U>): None {
        return None;
    },
    or<T>(other: Option<T>): Option<T> {
        assertOption(other);
        return other;
    },
    orElse<T>(fn: () => Option<T>): Option<T> {
        return fn();
    },
    xor<T>(other: Option<T>): Option<T> {
        assertOption(other);
        return other.isSome() ? other : None;
    },

    inspect(_fn: (value: never) => void): None {
        return None;
    },

    eq<T>(other: Option<T>): boolean {
        assertOption(other);
        return other === None;
    },

    toString(): string {
        return 'None';
    },
}) as None;

/**
 * Creates a `Result<T, E>` representing a successful outcome containing a value.
 * This function is used to construct a `Result` that signifies the operation was successful by containing the value `T`.
 *
 * @typeParam T - The type of the value to be contained in the `Ok` result.
 * @typeParam E - The type of the error that the result could potentially contain (not used in this case).
 * @param value - The value to wrap as an `Ok` result.
 * @returns A `Result<T, E>` that contains the provided value, representing the `Ok` case.
 *
 * @example
 * ```ts
 * const goodResult = Ok<number, Error>(1); // Result<number, Error> with a value
 * if (goodResult.isOk()) {
 *   console.log(goodResult.unwrap()); // Outputs: 1
 * }
 * ```
 */
export function Ok<T, E>(value: T): Result<T, E> {
    const ok: Result<T, E> = {
        [Symbol.toStringTag]: 'Result',
        [resultKindSymbol]: 'Ok',

        isOk(): true {
            return true;
        },
        isErr(): false {
            return false;
        },
        isOkAnd(predicate: (value: T) => boolean): boolean {
            return predicate(value);
        },
        isErrAnd(_predicate: (error: E) => boolean): false {
            return false;
        },

        expect(_msg: string): T {
            return value;
        },
        unwrap(): T {
            return value;
        },
        unwrapOr(_defaultValue: T): T {
            return value;
        },
        unwrapOrElse(_fn: (error: E) => T): T {
            return value;
        },

        expectErr(msg: string): E {
            throw new TypeError(`${ msg }: ${ value }`);
        },
        unwrapErr(): E {
            throw new TypeError('Called `Result::unwrapErr()` on an `Ok` value');
        },

        ok(): Option<T> {
            return Some(value);
        },
        err(): None {
            return None;
        },
        transpose<T>(): Option<Result<T, E>> {
            const o = value as Option<T>;
            assertOption(o);
            return o.isSome() ? Some(Ok(o.unwrap())) : None;
        },

        map<U>(fn: (value: T) => U): Result<U, E> {
            return Ok(fn(value));
        },
        mapErr<F>(_fn: (error: E) => F): Result<T, F> {
            return Ok(value);
        },
        mapOr<U>(_defaultValue: U, fn: (value: T) => U): U {
            return fn(value);
        },
        mapOrElse<U>(_defaultFn: (error: E) => U, fn: (value: T) => U): U {
            return fn(value);
        },
        flatten<T>(): Result<T, E> {
            const r = value as Result<T, E>;
            assertResult(r);
            return r;
        },

        and<U>(other: Result<U, E>): Result<U, E> {
            assertResult(other);
            return other;
        },
        or<F>(_other: Result<T, F>): Result<T, F> {
            return ok as unknown as Result<T, F>;
        },
        andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
            return fn(value);
        },
        orElse<F>(_fn: (error: E) => Result<T, F>): Result<T, F> {
            return ok as unknown as Result<T, F>;
        },

        inspect(fn: (value: T) => void): Result<T, E> {
            fn(value);
            return ok;
        },
        inspectErr(_fn: (error: E) => void): Result<T, E> {
            return ok;
        },

        eq(other: Result<T, E>): boolean {
            assertResult(other);
            return other.isOk() && other.unwrap() === value;
        },

        asOk<F>(): Result<T, F> {
            return ok as unknown as Result<T, F>;
        },
        asErr(): never {
            throw new TypeError('Called `Result::asErr()` on an `Ok` value');
        },

        toString(): string {
            return `Ok(${ value })`;
        },
    } as const;

    return ok;
}

/**
 * Creates a `Result<T, E>` representing a failed outcome containing an error.
 * This function is used to construct a `Result` that signifies the operation failed by containing the error `E`.
 *
 * @typeParam T - The type of the value that the result could potentially contain (not used in this case).
 * @typeParam E - The type of the error to be wrapped in the `Err` result.
 * @param error - The error to wrap as an `Err` result.
 * @returns A `Result<T, E>` that contains the provided error, representing the `Err` case.
 *
 * @example
 * ```ts
 * const badResult = Err<number, Error>(new Error('Something went wrong'));
 * if (badResult.isErr()) {
 *   console.error(badResult.unwrapErr()); // Outputs: Error: Something went wrong
 * }
 * ```
 */
export function Err<T, E>(error: E): Result<T, E> {
    const err: Result<T, E> = {
        [Symbol.toStringTag]: 'Result',
        [resultKindSymbol]: 'Err',

        isOk(): false {
            return false;
        },
        isErr(): true {
            return true;
        },
        isOkAnd(_predicate: (value: T) => boolean): false {
            return false;
        },
        isErrAnd(predicate: (error: E) => boolean): boolean {
            return predicate(error);
        },

        expect(msg: string): T {
            throw new TypeError(`${ msg }: ${ error }`);
        },
        unwrap(): T {
            throw new TypeError('Called `Result::unwrap()` on an `Err` value');
        },
        unwrapOr(defaultValue: T): T {
            return defaultValue;
        },
        unwrapOrElse(fn: (error: E) => T): T {
            return fn(error);
        },

        expectErr(_msg: string): E {
            return error;
        },
        unwrapErr(): E {
            return error;
        },

        ok(): None {
            return None;
        },
        err(): Option<E> {
            return Some(error);
        },
        transpose<T>(): Option<Result<T, E>> {
            return Some(err as unknown as Result<T, E>);
        },

        map<U>(_fn: (value: T) => U): Result<U, E> {
            return err as unknown as Result<U, E>;
        },
        mapErr<F>(fn: (error: E) => F): Result<T, F> {
            return Err(fn(error));
        },
        mapOr<U>(defaultValue: U, _fn: (value: T) => U): U {
            return defaultValue;
        },
        mapOrElse<U>(defaultFn: (error: E) => U, _fn: (value: T) => U): U {
            return defaultFn(error);
        },
        flatten<T>(): Result<T, E> {
            return err as unknown as Result<T, E>;
        },

        and<U>(_other: Result<U, E>): Result<U, E> {
            return err as unknown as Result<U, E>;
        },
        or<F>(other: Result<T, F>): Result<T, F> {
            assertResult(other);
            return other;
        },
        andThen<U>(_fn: (value: T) => Result<U, E>): Result<U, E> {
            return err as unknown as Result<U, E>;
        },
        orElse<F>(fn: (error: E) => Result<T, F>): Result<T, F> {
            return fn(error);
        },

        inspect(_fn: (value: T) => void): Result<T, E> {
            return err;
        },
        inspectErr(fn: (error: E) => void): Result<T, E> {
            fn(error);
            return err;
        },

        eq(other: Result<T, E>): boolean {
            assertResult(other);
            return other.isErr() && other.unwrapErr() === error;
        },

        asOk(): never {
            throw new TypeError('Called `Result::asOk()` on an `Err` value');
        },
        asErr<U>(): Result<U, E> {
            return err as unknown as Result<U, E>;
        },

        toString(): string {
            return `Err(${ error })`;
        },
    } as const;

    return err;
}

/**
 * Asserts that a given value is an `Option`.
 *
 * @typeParam T - The expected type of the value contained within the `Option`.
 * @param o - The value to be checked as an `Option`.
 * @throws {TypeError} If the value is not an `Option`.
 */
function assertOption<T>(o: Option<T>): void {
    // `Some` and `None` must be an object.
    if (o == null || typeof o !== 'object' || !(optionKindSymbol in o)) {
        throw new TypeError(`This(${ o }) is not an Option`);
    }
}

/**
 * Asserts that a given value is a `Result`.
 *
 * @typeParam T - The expected type of the success value contained within the `Result`.
 * @typeParam E - The expected type of the error value contained within the `Result`.
 * @param r - The value to be checked as a `Result`.
 * @throws {TypeError} If the value is not a `Result`.
 */
function assertResult<T, E>(r: Result<T, E>): void {
    // `Ok` and `Err` must be an object.
    if (r == null || typeof r !== 'object' || !(resultKindSymbol in r)) {
        throw new TypeError(`This(${ r }) is not a Result`);
    }
}

/**
 * Converts a Promise to a Result type, capturing the resolved value in an `Ok`, or the error in an `Err`.
 * This allows for promise-based asynchronous operations to be handled in a way that is more in line with the Result pattern.
 *
 * @typeParam T - The type of the value that the promise resolves to.
 * @typeParam E - The type of the error that the promise may reject with, defaults to `Error`.
 * @param p - The promise to convert into a `Result` type.
 * @returns A promise that resolves to a `Result<T, E>`. If the input promise `p` resolves, the resulting promise will resolve with `Ok<T>`. If the input promise `p` rejects, the resulting promise will resolve with `Err<E>`.
 *
 * @example
 * ```ts
 * async function example() {
 *   const result = await promiseToResult(fetchData());
 *   if (result.isOk()) {
 *     console.log('Data:', result.unwrap());
 *   } else {
 *     console.error('Error:', result.unwrapErr());
 *   }
 * }
 * ```
 */
export function promiseToResult<T, E = Error>(p: Promise<T>): Promise<Result<T, E>> {
    return p.then((x): Result<T, E> => {
        return Ok(x);
    }).catch((err: E): Result<T, E> => {
        return Err(err);
    });
}