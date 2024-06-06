/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @fileoverview A Rust-inspired [Result](https://doc.rust-lang.org/core/result/index.html) enum, used for better error handling.
 *
 * `Result` is a type that represents either success (`Ok`) or failure (`Err`).
 */

import { None, Some, assertOption, type Option } from './option.ts';

/**
 * Symbol for Result kind: `Ok` or `Err`.
 */
const resultKindSymbol = Symbol('Result kind');

/**
 * Check the input is a Result.
 *
 * @param r The input to check.
 */
export function assertResult<T, E>(r: Result<T, E>): void {
    // `Ok` and `Err` must be an object.
    if (r == null || typeof r !== 'object' || !(resultKindSymbol in r)) {
        throw new TypeError(`This(${ r }) is not a Result`);
    }
}

/**
 * result::Result type
 *
```rust
pub enum Result<T, E> {
    Ok(T),
    Err(E),
}
```
 */
export interface Result<T, E> {
    // #region Internal properties

    /**
     * Identify `Ok` or `Err`.
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
    readonly isOk: () => boolean;

    /**
     * Returns `true` if the result is `Err`.
     */
    readonly isErr: () => boolean;

    /**
     * Returns `true` if the result is `Ok` and the value inside of it matches a predicate.
     */
    readonly isOkAnd: (predicate: (value: T) => boolean) => boolean;

    /**
     * Returns `true` if the result is `Err` and the value inside of it matches a predicate.
     */
    readonly isErrAnd: (predicate: (error: E) => boolean) => boolean;

    // #endregion

    // #region Extracting the contained value

    /**
     * These methods extract the contained value in a `Result<T, E>` when it is the `Ok` variant.
     */

    /**
     * Returns the contained `Ok` value.
     *
     * **Throw**
     *
     * Throws if the value is an `Err`, with an exception message including the passed message, and the content of the `Err`.
     */
    readonly expect: (msg: string) => T;

    /**
     * Returns the contained `Ok` value.
     *
     * **Throw**
     *
     * Throws if the value is an `Err`, with an exception message provided by the `Err`’s value.
     */
    readonly unwrap: () => T;

    /**
     * Returns the contained `Ok` value or a provided default.
     */
    readonly unwrapOr: (defaultValue: T) => T;

    /**
     * Returns the contained `Ok` value or computes it from a function.
     */
    readonly unwrapOrElse: (fn: (error: E) => T) => T;

    /**
     * These methods extract the contained value in a `Result<T, E>` when it is the `Err` variant.
     */

    /**
     * Returns the contained `Err` value.
     *
     * **Throw**
     *
     * Throws if the value is an `Ok`, with an exception message including the passed message, and the content of the `Ok`.
     */
    readonly expectErr: (msg: string) => E;

    /**
     * Returns the contained `Err` value.
     *
     * **Throw**
     *
     * Throws if the value is an `Ok`, with an exception panic message provided by the `Ok`’s value.
     */
    readonly unwrapErr: () => E;

    // #endregion

    // #region Transforming contained values

    /**
     * These methods transform `Result` to `Option`:
     */

    /**
     * Converts from `Result<T, E>` to `Option<T>`, and discarding the error, if any.
     */
    readonly ok: () => Option<T>;

    /**
     * Converts from `Result<T, E>` to `Option<E>`, and discarding the success value, if any.
     */
    readonly err: () => Option<E>;

    /**
     * Transposes a `Result` of an `Option` into an `Option` of a `Result`.
     *
     * `Ok(None)` will be mapped to `None`.
     *
     * `Ok(Some(_))` and `Err(_)` will be mapped to `Some(Ok(_))` and `Some(Err(_))`.
     */
    readonly transpose: <T>(this: Result<Option<T>, E>) => Option<Result<T, E>>;

    /**
     * This method transforms the contained value of the `Ok` variant:
     */

    /**
     * Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `Ok` value, leaving an `Err` value untouched.
     */
    readonly map: <U>(fn: (value: T) => U) => Result<U, E>;

    /**
     * This method transforms the contained value of the `Err` variant:
     */

    /**
     * Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained `Err` value, leaving an `Ok` value untouched.
     */
    readonly mapErr: <F>(fn: (error: E) => F) => Result<T, F>;

    /**
     * These methods transform a `Result<T, E>` into a value of a possibly different type `U`:
     */

    /**
     * Returns the provided default (if `Err`), or applies a function to the contained value (if `Ok`).
     */
    readonly mapOr: <U>(defaultValue: U, fn: (value: T) => U) => U;

    /**
     * Maps a `Result<T, E>` to `U` by applying fallback function `default` to a contained `Err` value, or function `fn` to a contained `Ok` value.
     */
    readonly mapOrElse: <U>(defaultFn: (error: E) => U, fn: (value: T) => U) => U;

    /**
     * Converts from `Result<Result<T, E>, E>` to `Result<T, E>`.
     */
    readonly flatten: <T>(this: Result<Result<T, E>, E>) => Result<T, E>;

    // #endregion

    // #region Boolean operators

    /**
     * These methods treat the `Result` as a boolean value, where `Ok` acts like `true` and `Err` acts like `false`.
     */

    /**
     * Returns `other` if the result is `Ok`, otherwise returns the `Err` value of `this`.
     */
    readonly and: <U>(other: Result<U, E>) => Result<U, E>;

    /**
     * Returns `other` if the result is `Err`, otherwise returns the `Ok` value of this.
     */
    readonly or: <F>(other: Result<T, F>) => Result<T, F>;

    /**
     * Calls `fn` if the result is `Ok`, otherwise returns the `Err` value of `this`.
     */
    readonly andThen: <U>(fn: (value: T) => Result<U, E>) => Result<U, E>;

    /**
     * Calls `fn` if the result is `Err`, otherwise returns the `Ok` value of `this`.
     */
    readonly orElse: <F>(fn: (error: E) => Result<T, F>) => Result<T, F>;

    // #endregion

    /**
     * Calls a function with a reference to the contained value if `Ok`.
     *
     * Returns the original result.
     */
    readonly inspect: (fn: (value: T) => void) => this;

    /**
     * Calls a function with a reference to the contained value if `Err`.
     *
     * Returns the original result.
     */
    readonly inspectErr: (fn: (error: E) => void) => this;

    // #region Equals comparison

    readonly eq: (other: Result<T, E>) => boolean;

    // #endregion
}

/**
 * Create an `Ok` object.
 *
 * # Examples
 *
 * ```
 * const v = Ok(10);
 * console.assert(v.unwrap() === 10);
 * ```
 *
 * @param value The contained value.
 * @returns {Result<T, E>}
 */
export function Ok<T, E>(value: T): Result<T, E> {
    const ok: Result<T, E> = {
        [resultKindSymbol]: 'Ok',

        isOk: (): boolean => true,
        isErr: (): boolean => false,
        isOkAnd: (predicate: (value: T) => boolean): boolean => predicate(value),
        isErrAnd: (_predicate: (error: E) => boolean): boolean => false,

        expect: (_msg: string): T => value,
        unwrap: (): T => value,
        unwrapOr: (_defaultValue: T): T => value,
        unwrapOrElse: (_fn: (error: E) => T): T => value,

        expectErr: (msg: string): E => {
            throw new TypeError(`${ msg }: ${ value }`);
        },
        unwrapErr: (): E => {
            throw new TypeError('Called `Result::unwrapErr()` on an `Ok` value');
        },

        ok: (): Option<T> => Some(value),
        err: (): Option<E> => None,
        transpose: <T>(): Option<Result<T, E>> => {
            const o = value as Option<T>;
            assertOption(o);
            return o.isSome() ? Some(Ok(o.unwrap())) : None;
        },

        map: <U>(fn: (value: T) => U): Result<U, E> => Ok(fn(value)),
        mapErr: <F>(_fn: (error: E) => F): Result<T, F> => Ok(value),
        mapOr: <U>(_defaultValue: U, fn: (value: T) => U): U => fn(value),
        mapOrElse: <U>(_defaultFn: (error: E) => U, fn: (value: T) => U): U => fn(value),
        flatten: <T>(): Result<T, E> => {
            const r = value as Result<T, E>;
            assertResult(r);
            return r;
        },

        and: <U>(other: Result<U, E>): Result<U, E> => {
            assertResult(other);
            return other;
        },
        or: <F>(_other: Result<T, F>): Result<T, F> => ok as unknown as Result<T, F>,
        andThen: <U>(fn: (value: T) => Result<U, E>): Result<U, E> => fn(value),
        orElse: <F>(_fn: (error: E) => Result<T, F>): Result<T, F> => ok as unknown as Result<T, F>,

        inspect: (fn: (value: T) => void): Result<T, E> => {
            fn(value);
            return ok;
        },
        inspectErr: (_fn: (error: E) => void): Result<T, E> => ok,

        eq: (other: Result<T, E>): boolean => {
            assertResult(other);
            return other.isOk() && other.unwrap() === value;
        },
    } as const;

    return ok;
}

/**
 * Create an `Err` object.
 *
 * # Examples
 *
 * ```
 * const e = Err(new Error('unknown error'));
 * console.assert(e.unwrapErr().message === 'unknown error');
 * ```
 *
 * @param error The contained error.
 * @returns {Result<T, E>}
 */
export function Err<T, E>(error: E): Result<T, E> {
    const err: Result<T, E> = {
        [resultKindSymbol]: 'Err',

        isOk: (): boolean => false,
        isErr: (): boolean => true,
        isOkAnd: (_predicate: (value: T) => boolean): boolean => false,
        isErrAnd: (predicate: (error: E) => boolean): boolean => predicate(error),

        expect: (msg: string): T => {
            throw new TypeError(`${ msg }: ${ error }`);
        },
        unwrap: (): T => {
            throw new TypeError('Called `Result::unwrap()` on an `Err` value');
        },
        unwrapOr: (defaultValue: T): T => defaultValue,
        unwrapOrElse: (fn: (error: E) => T): T => fn(error),

        expectErr: (_msg: string): E => error,
        unwrapErr: (): E => error,

        ok: (): Option<T> => None,
        err: (): Option<E> => Some(error),
        transpose: <T>(): Option<Result<T, E>> => Some(err as unknown as Result<T, E>),

        map: <U>(_fn: (value: T) => U): Result<U, E> => err as unknown as Result<U, E>,
        mapErr: <F>(fn: (error: E) => F): Result<T, F> => Err(fn(error)),
        mapOr: <U>(defaultValue: U, _fn: (value: T) => U): U => defaultValue,
        mapOrElse: <U>(defaultFn: (error: E) => U, _fn: (value: T) => U): U => defaultFn(error),
        flatten: <T>(): Result<T, E> => err as unknown as Result<T, E>,

        and: <U>(_other: Result<U, E>): Result<U, E> => err as unknown as Result<U, E>,
        or: <F>(other: Result<T, F>): Result<T, F> => {
            assertResult(other);
            return other;
        },
        andThen: <U>(_fn: (value: T) => Result<U, E>): Result<U, E> => err as unknown as Result<U, E>,
        orElse: <F>(fn: (error: E) => Result<T, F>): Result<T, F> => fn(error),

        inspect: (_fn: (value: T) => void): Result<T, E> => err,
        inspectErr: (fn: (error: E) => void): Result<T, E> => {
            fn(error);
            return err;
        },

        eq: (other: Result<T, E>): boolean => {
            assertResult(other);
            return other.isErr() && other.unwrapErr() === error;
        },
    } as const;

    return err;
}

/**
 * Convert from `Promise<T>` to `Promise<Result<T, E>>`.
 *
 * Default type for error is `Error`.
 *
 * @param p Promise<T>
 * @returns {Promise<Result<T, E>>}
 */
export function promiseToResult<T, E = Error>(p: Promise<T>): Promise<Result<T, E>> {
    return p.then((x): Result<T, E> => {
        return Ok(x);
    }).catch((err: E): Result<T, E> => {
        return Err(err);
    });
}