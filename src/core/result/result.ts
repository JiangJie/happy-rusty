/**
 * @module
 * A Rust-inspired [Result](https://doc.rust-lang.org/core/result/index.html) enum type, used for better error handling.
 */

import type { Option } from '../option/option.ts';
import type { ResultKindSymbol } from './symbols.ts';

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
     * The well-known symbol `Symbol.toStringTag` used by `Object.prototype.toString()`.
     * Returns `'Result'` so that `Object.prototype.toString.call(result)` produces `'[object Result]'`.
     *
     * This enables reliable type identification even across different execution contexts (e.g., iframes, different module instances).
     *
     * @example
     * ```ts
     * const x = Ok(5);
     * console.log(Object.prototype.toString.call(x)); // '[object Result]'
     * ```
     */
    readonly [Symbol.toStringTag]: 'Result';

    /**
     * A unique symbol property used to identify the variant of this `Result`.
     * Returns `'Ok'` if the Result represents success, or `'Err'` if it represents failure.
     *
     * This is used internally by the `isResult` utility function to verify that an object is a valid `Result` instance,
     * and to distinguish between `Ok` and `Err` variants without calling methods.
     *
     * Note: The symbol itself is not exported as part of the public API.
     * Use the `isResult` utility function or the `isOk()`/`isErr()` methods for type checking.
     */
    readonly [ResultKindSymbol]: 'Ok' | 'Err';

    // #endregion

    // #region JavaScript protocols

    /**
     * Implements the Iterator protocol, allowing `Result` to be used with `for...of` loops and spread syntax.
     * - For `Ok(value)`, yields the contained value once.
     * - For `Err(error)`, yields nothing (empty iterator).
     *
     * This is similar to Rust's `Result::iter()` method.
     *
     * @returns An iterator that yields zero or one value.
     * @example
     * ```ts
     * // Using with for...of
     * for (const value of Ok(5)) {
     *     console.log(value); // 5
     * }
     *
     * for (const value of Err('error')) {
     *     console.log(value); // never executed
     * }
     *
     * // Using with spread operator
     * const arr1 = [...Ok(5)];        // [5]
     * const arr2 = [...Err('error')]; // []
     *
     * // Using with Array.from
     * Array.from(Ok('hello'));   // ['hello']
     * Array.from(Err('error'));  // []
     * ```
     */
    [Symbol.iterator](): Iterator<T>;

    /**
     * Custom `toString` implementation that uses the `Result`'s contained value.
     * @example
     * ```ts
     * console.log(Ok(5).toString()); // 'Ok(5)'
     * console.log(Err('error').toString()); // 'Err(error)'
     * ```
     */
    toString(): string;

    // #endregion

    // #region Querying the variant

    /**
     * The `isOk` and `isErr` methods return `true` if the `Result` is `Ok` or `Err`, respectively.
     */

    /**
     * Returns `true` if the result is `Ok`.
     * @example
     * ```ts
     * const x = Ok(5);
     * console.log(x.isOk()); // true
     *
     * const y = Err('error');
     * console.log(y.isOk()); // false
     * ```
     */
    isOk(): boolean;

    /**
     * Returns `true` if the result is `Err`.
     * @example
     * ```ts
     * const x = Ok(5);
     * console.log(x.isErr()); // false
     *
     * const y = Err('error');
     * console.log(y.isErr()); // true
     * ```
     */
    isErr(): boolean;

    /**
     * Returns `true` if the result is `Ok` and the provided predicate returns `true` for the contained value.
     * @param predicate - A function that takes the `Ok` value and returns a boolean.
     * @see isErrAnd
     * @example
     * ```ts
     * const x = Ok(2);
     * console.log(x.isOkAnd(v => v > 1)); // true
     * console.log(x.isOkAnd(v => v > 5)); // false
     * ```
     */
    isOkAnd(predicate: (value: T) => boolean): boolean;

    /**
     * Asynchronous version of `isOkAnd`.
     * @param predicate - An async function that takes the `Ok` value and returns a `Promise<boolean>`.
     * @returns A promise that resolves to `true` if the Result is `Ok` and the predicate resolves to `true`.
     * @see isOkAnd
     * @see isErrAndAsync
     * @example
     * ```ts
     * const x = Ok(2);
     * await x.isOkAndAsync(async v => v > 1); // true
     * ```
     */
    isOkAndAsync(predicate: (value: T) => Promise<boolean>): Promise<boolean>;

    /**
     * Returns `true` if the result is `Err` and the provided predicate returns `true` for the contained error.
     * @param predicate - A function that takes the `Err` value and returns a boolean.
     * @see isOkAnd
     * @example
     * ```ts
     * const x = Err('error');
     * console.log(x.isErrAnd(e => e === 'error')); // true
     * ```
     */
    isErrAnd(predicate: (error: E) => boolean): boolean;

    /**
     * Asynchronous version of `isErrAnd`.
     * @param predicate - An async function that takes the `Err` value and returns a `Promise<boolean>`.
     * @returns A promise that resolves to `true` if the Result is `Err` and the predicate resolves to `true`.
     * @see isErrAnd
     * @see isOkAndAsync
     * @example
     * ```ts
     * const x = Err('error');
     * await x.isErrAndAsync(async e => e.length > 0); // true
     * ```
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
     * @see unwrap
     * @see expectErr
     * @example
     * ```ts
     * const x = Ok(5);
     * console.log(x.expect('should have value')); // 5
     *
     * const y = Err('error');
     * y.expect('should have value'); // throws TypeError: should have value: error
     * ```
     */
    expect(msg: string): T;

    /**
     * Returns the contained `Ok` value.
     * @throws {TypeError} Throws an error if the result is an `Err`.
     * @see expect
     * @see unwrapOr
     * @see unwrapErr
     * @example
     * ```ts
     * const x = Ok(5);
     * console.log(x.unwrap()); // 5
     *
     * const y = Err('error');
     * y.unwrap(); // throws TypeError
     * ```
     */
    unwrap(): T;

    /**
     * Returns the contained `Ok` value or a provided default.
     * @param defaultValue - The value to return if the result is an `Err`.
     * @see unwrapOrElse
     * @example
     * ```ts
     * const x = Ok(5);
     * console.log(x.unwrapOr(10)); // 5
     *
     * const y = Err('error');
     * console.log(y.unwrapOr(10)); // 10
     * ```
     */
    unwrapOr(defaultValue: T): T;

    /**
     * Returns the contained `Ok` value or computes it from a closure if the result is `Err`.
     * @param fn - A function that takes the `Err` value and returns an `Ok` value.
     * @see unwrapOr
     * @example
     * ```ts
     * const x = Err('error');
     * console.log(x.unwrapOrElse(e => e.length)); // 5
     * ```
     */
    unwrapOrElse(fn: (error: E) => T): T;

    /**
     * Asynchronous version of `unwrapOrElse`.
     * @param fn - An async function that takes the `Err` value and returns a `Promise<T>`.
     * @returns A promise that resolves to the contained `Ok` value or the result of the async function.
     * @see unwrapOrElse
     * @example
     * ```ts
     * const x = Err('error');
     * await x.unwrapOrElseAsync(async e => e.length); // 5
     * ```
     */
    unwrapOrElseAsync(fn: (error: E) => Promise<T>): Promise<T>;

    /**
     * These methods extract the contained value in a `Result<T, E>` when it is the `Err` variant.
     */

    /**
     * Returns the contained `Err` value, with a provided error message if the result is `Ok`.
     * @param msg - The error message to provide if the result is an `Ok`.
     * @throws {TypeError} Throws an error with the provided message if the result is an `Ok`.
     * @see unwrapErr
     * @see expect
     * @example
     * ```ts
     * const x = Err('error');
     * console.log(x.expectErr('should have error')); // 'error'
     *
     * const y = Ok(5);
     * y.expectErr('should have error'); // throws TypeError: should have error: 5
     * ```
     */
    expectErr(msg: string): E;

    /**
     * Returns the contained `Err` value.
     * @throws {TypeError} Throws an error if the result is an `Ok`.
     * @see expectErr
     * @see unwrap
     * @example
     * ```ts
     * const x = Err('error');
     * console.log(x.unwrapErr()); // 'error'
     *
     * const y = Ok(5);
     * y.unwrapErr(); // throws TypeError
     * ```
     */
    unwrapErr(): E;

    /**
     * Returns the contained `Ok` value.
     *
     * Unlike `unwrap`, this method is known to never throw because
     * the error type is `never`, meaning the `Err` variant can never occur.
     *
     * This provides a **compile-time guarantee** that the extraction is safe.
     * If someone later changes the error type to one that can occur,
     * the code will fail to compile rather than potentially throwing at runtime.
     *
     * @returns The contained `Ok` value.
     * @example
     * ```ts
     * function alwaysSucceeds(): Result<string, never> {
     *     return Ok('success');
     * }
     *
     * // Safe extraction - compiler knows this can never be Err
     * const value: string = alwaysSucceeds().intoOk();
     * ```
     */
    intoOk(this: Result<T, never>): T;

    /**
     * Returns the contained `Err` value.
     *
     * Unlike `unwrapErr`, this method is known to never throw because
     * the success type is `never`, meaning the `Ok` variant can never occur.
     *
     * This provides a **compile-time guarantee** that the extraction is safe.
     * If someone later changes the ok type to one that can occur,
     * the code will fail to compile rather than potentially throwing at runtime.
     *
     * @returns The contained `Err` value.
     * @example
     * ```ts
     * function alwaysFails(): Result<never, string> {
     *     return Err('error');
     * }
     *
     * // Safe extraction - compiler knows this can never be Ok
     * const error: string = alwaysFails().intoErr();
     * ```
     */
    intoErr(this: Result<never, E>): E;

    // #endregion

    // #region Transforming contained values

    /**
     * These methods transform `Result` to `Option`:
     */

    /**
     * Converts from `Result<T, E>` to `Option<T>`.
     * If the result is `Ok`, returns `Some(T)`.
     * If the result is `Err`, returns `None`.
     * @see err
     * @example
     * ```ts
     * const x = Ok(5);
     * console.log(x.ok().unwrap()); // 5
     *
     * const y = Err('error');
     * console.log(y.ok().isNone()); // true
     * ```
     */
    ok(): Option<T>;

    /**
     * Converts from `Result<T, E>` to `Option<E>`.
     * If the result is `Err`, returns `Some(E)`.
     * If the result is `Ok`, returns `None`.
     * @see ok
     * @example
     * ```ts
     * const x = Err('error');
     * console.log(x.err().unwrap()); // 'error'
     *
     * const y = Ok(5);
     * console.log(y.err().isNone()); // true
     * ```
     */
    err(): Option<E>;

    /**
     * Transposes a `Result` of an `Option` into an `Option` of a `Result`.
     * @typeParam U - The type of the success value in the `Ok` variant of the `Option`.
     * @returns `Some` containing `Ok` if the result is `Ok` containing `Some`,
     *          `Some` containing `Err` if the result is `Err`,
     *          `None` if the result is `Ok` containing `None`.
     * @example
     * ```ts
     * const x = Ok(Some(5));
     * console.log(x.transpose().unwrap().unwrap()); // 5
     *
     * const y: Result<Option<number>, string> = Err('error');
     * console.log(y.transpose().unwrap().unwrapErr()); // 'error'
     *
     * const z = Ok(None);
     * console.log(z.transpose().isNone()); // true
     * ```
     */
    transpose<U>(this: Result<Option<U>, E>): Option<Result<U, E>>;

    /**
     * This method transforms the contained value of the `Ok` variant:
     */

    /**
     * Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `Ok` value,
     * leaving an `Err` value untouched.
     * @typeParam U - The type of the value returned by the map function.
     * @param fn - A function that takes the `Ok` value and returns a new value.
     * @see mapErr
     * @see andThen
     * @example
     * ```ts
     * const x = Ok(5);
     * console.log(x.map(v => v * 2).unwrap()); // 10
     *
     * const y = Err('error');
     * console.log(y.map(v => v * 2).unwrapErr()); // 'error'
     * ```
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
     * @see map
     * @example
     * ```ts
     * const x = Err('error');
     * console.log(x.mapErr(e => e.toUpperCase()).unwrapErr()); // 'ERROR'
     * ```
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
     * @see mapOrElse
     * @example
     * ```ts
     * const x = Ok(5);
     * console.log(x.mapOr(0, v => v * 2)); // 10
     *
     * const y = Err('error');
     * console.log(y.mapOr(0, v => v * 2)); // 0
     * ```
     */
    mapOr<U>(defaultValue: U, fn: (value: T) => U): U;

    /**
     * Maps a `Result<T, E>` to `U` by applying a function to the contained `Ok` value (if `Ok`), or computes a default (if `Err`).
     * @typeParam U - The type of the value returned by the map function or the default function.
     * @param defaultFn - A function that returns the default value.
     * @param fn - A function that takes the `Ok` value and returns a new value.
     * @see mapOr
     * @example
     * ```ts
     * const x = Ok(5);
     * console.log(x.mapOrElse(e => 0, v => v * 2)); // 10
     *
     * const y = Err('error');
     * console.log(y.mapOrElse(e => e.length, v => v * 2)); // 5
     * ```
     */
    mapOrElse<U>(defaultFn: (error: E) => U, fn: (value: T) => U): U;

    /**
     * Converts from `Result<Result<U, E>, E>` to `Result<U, E>`.
     * If the result is `Ok(Ok(U))`, returns `Ok(U)`.
     * If the result is `Ok(Err(E))` or `Err(E)`, returns `Err(E)`.
     * @typeParam U - The type of the success value in the inner `Result`.
     * @example
     * ```ts
     * const x = Ok(Ok(5));
     * console.log(x.flatten().unwrap()); // 5
     *
     * const y = Ok(Err('error'));
     * console.log(y.flatten().unwrapErr()); // 'error'
     * ```
     */
    flatten<U>(this: Result<Result<U, E>, E>): Result<U, E>;

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
     * @see or
     * @example
     * ```ts
     * const x = Ok(2);
     * const y = Err('late error');
     * console.log(x.and(y).unwrapErr()); // 'late error'
     *
     * const a = Err('early error');
     * const b = Ok(5);
     * console.log(a.and(b).unwrapErr()); // 'early error'
     * ```
     */
    and<U>(other: Result<U, E>): Result<U, E>;

    /**
     * Returns `this` if it is `Ok`, otherwise returns the passed `Result`.
     * @typeParam F - The type of the error in the other `Result`.
     * @param other - The `Result` to return if `this` is `Err`.
     * @returns `this` if it is `Ok`, otherwise returns `other`.
     * @see and
     * @example
     * ```ts
     * const x = Err('error');
     * const y = Ok(5);
     * console.log(x.or(y).unwrap()); // 5
     *
     * const a = Ok(2);
     * const b = Ok(100);
     * console.log(a.or(b).unwrap()); // 2
     * ```
     */
    or<F>(other: Result<T, F>): Result<T, F>;

    /**
     * Calls the provided function with the contained value if `this` is `Ok`, otherwise returns `this` as `Err`.
     * @typeParam U - The type of the value returned by the function.
     * @param fn - A function that takes the `Ok` value and returns a `Result`.
     * @returns The result of `fn` if `this` is `Ok`, otherwise `this` as `Err`.
     * @see map
     * @see orElse
     * @example
     * ```ts
     * const x = Ok(2);
     * const result = x.andThen(v => v > 0 ? Ok(v * 2) : Err('negative'));
     * console.log(result.unwrap()); // 4
     *
     * const y = Err('error');
     * console.log(y.andThen(v => Ok(v * 2)).unwrapErr()); // 'error'
     * ```
     */
    andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E>;

    /**
     * Asynchronous version of `andThen`.
     * @typeParam U - The type of the value returned by the async function.
     * @param fn - An async function that takes the `Ok` value and returns a `Promise<Result<U, E>>`.
     * @returns A promise that resolves to `this` as `Err` if `this` is `Err`, otherwise the result of `fn`.
     * @see andThen
     * @see orElseAsync
     * @example
     * ```ts
     * const x = Ok(2);
     * const result = await x.andThenAsync(async v => Ok(v * 2));
     * console.log(result.unwrap()); // 4
     * ```
     */
    andThenAsync<U>(fn: (value: T) => AsyncResult<U, E>): AsyncResult<U, E>;

    /**
     * Calls the provided function with the contained error if `this` is `Err`, otherwise returns `this` as `Ok`.
     * @typeParam F - The type of the error returned by the function.
     * @param fn - A function that takes the `Err` value and returns a `Result`.
     * @returns The result of `fn` if `this` is `Err`, otherwise `this` as `Ok`.
     * @see andThen
     * @example
     * ```ts
     * const x = Err('error');
     * const result = x.orElse(e => Ok(e.length));
     * console.log(result.unwrap()); // 5
     *
     * const y = Ok(2);
     * console.log(y.orElse(e => Ok(0)).unwrap()); // 2
     * ```
     */
    orElse<F>(fn: (error: E) => Result<T, F>): Result<T, F>;

    /**
     * Asynchronous version of `orElse`.
     * @typeParam F - The type of the error returned by the async function.
     * @param fn - An async function that takes the `Err` value and returns a `Promise<Result<T, F>>`.
     * @returns A promise that resolves to `this` as `Ok` if `this` is `Ok`, otherwise the result of `fn`.
     * @see orElse
     * @see andThenAsync
     * @example
     * ```ts
     * const x = Err('error');
     * const result = await x.orElseAsync(async e => Ok(e.length));
     * console.log(result.unwrap()); // 5
     * ```
     */
    orElseAsync<F>(fn: (error: E) => AsyncResult<T, F>): AsyncResult<T, F>;

    // #endregion

    /**
     * Calls the provided function with the contained value if `this` is `Ok`, for side effects only.
     * Does not modify the `Result`.
     * @param fn - A function to call with the `Ok` value.
     * @returns `this`, unmodified.
     * @see inspectErr
     * @example
     * ```ts
     * const x = Ok(5);
     * x.inspect(v => console.log(v)); // prints 5
     * ```
     */
    inspect(fn: (value: T) => void): this;

    /**
     * Calls the provided function with the contained error if `this` is `Err`, for side effects only.
     * Does not modify the `Result`.
     * @param fn - A function to call with the `Err` value.
     * @returns `this`, unmodified.
     * @see inspect
     * @example
     * ```ts
     * const x = Err('error');
     * x.inspectErr(e => console.log(e)); // prints 'error'
     * ```
     */
    inspectErr(fn: (error: E) => void): this;

    // #region Equals comparison

    /**
     * Tests whether `this` and `other` are both `Ok` containing equal values, or both are `Err` containing equal errors.
     * @param other - The other `Result` to compare with.
     * @returns `true` if `this` and `other` are both `Ok` with equal values, or both are `Err` with equal errors, otherwise `false`.
     * @example
     * ```ts
     * const a = Ok(5);
     * const b = Ok(5);
     * const c = Ok(10);
     * console.log(a.eq(b)); // true
     * console.log(a.eq(c)); // false
     *
     * const d = Err('error');
     * const e = Err('error');
     * console.log(d.eq(e)); // true
     * console.log(a.eq(d)); // false
     * ```
     */
    eq(other: Result<T, E>): boolean;

    // #endregion

    // #region Type casting

    /**
     * Transforms the current Result into a new Result where the type of the error is replaced with a new type `F`.
     * The type of the success value remains unchanged.
     * This is a type-level only operation, equivalent to `result as unknown as Result<T, F>`.
     *
     * @typeParam F - The new type for the error.
     * @returns `this` with the error type cast to `F`.
     * @see asErr
     * @example
     * ```ts
     * const x: Result<number, string> = Ok(5);
     * const y: Result<number, Error> = x.asOk<Error>();
     * console.log(y.unwrap()); // 5
     * ```
     */
    asOk<F>(): Result<T, F>;

    /**
     * Transforms the current Result into a new Result where the type of the success value is replaced with a new type `U`.
     * The type of the error remains unchanged.
     * This is a type-level only operation, equivalent to `result as unknown as Result<U, E>`.
     * Useful when you need to propagate an error to a different success type context.
     *
     * @typeParam U - The new type for the success value.
     * @returns `this` with the success type cast to `U`.
     * @see asOk
     * @example
     * ```ts
     * const x: Result<number, string> = Err('error');
     * const y: Result<string, string> = x.asErr<string>();
     * console.log(y.unwrapErr()); // 'error'
     * ```
     */
    asErr<U>(): Result<U, E>;

    // #endregion
}

/**
 * Represents an asynchronous operation that yields a `Result<T, E>`.
 * This is a promise that resolves to `Ok(T)` if the operation was successful, or `Err(E)` if there was an error.
 *
 * @typeParam T - The type of the value that is produced by a successful operation.
 * @typeParam E - The type of the error that may be produced by a failed operation.
 * @example
 * ```ts
 * async function fetchUser(id: number): AsyncResult<User, Error> {
 *     try {
 *         const response = await fetch(`/users/${id}`);
 *         if (response.ok) {
 *             return Ok(await response.json());
 *         }
 *         return Err(new Error('User not found'));
 *     } catch (e) {
 *         return Err(e as Error);
 *     }
 * }
 * ```
 */
export type AsyncResult<T, E> = Promise<Result<T, E>>;
