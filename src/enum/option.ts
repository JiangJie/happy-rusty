/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @fileoverview A Rust-inspired [Option](https://doc.rust-lang.org/core/option/index.html) enum, used as an alternative to the use of null and undefined.
 *
 * Type `Option` represents an optional value: every `Option` is either `Some` and contains a value, or `None`, and does not.
 */

import { Err, Ok, assertResult, type Result } from './result.ts';

/**
 * Symbol for Option kind: `Some` or `None`.
 */
const optionKindSymbol = Symbol('Option kind');

/**
 * Check the input is an Option.
 *
 * @param o The input to check.
 */
export function assertOption<T>(o: Option<T>): void {
    // `Some` and `None` must be an object.
    if (o == null || typeof o !== 'object' || !(optionKindSymbol in o)) {
        throw new TypeError(`This(${ o }) is not an Option`);
    }
}

/**
 * option::Option type
 *
```rust
pub enum Option<T> {
    None,
    Some(T),
}
```
 */
export interface Option<T> {
    // #region Internal properties

    /**
     * Identify `Some` or `None`.
     */
    readonly [optionKindSymbol]: 'Some' | 'None';

    // #endregion

    // #region Querying the variant

    /**
     * The `isSome` and `isNone` methods return `true` if the `Option` is `Some` or `None`, respectively.
     */

    /**
     * Returns `true` if the option is a `Some` value.
     */
    readonly isSome: () => boolean;

    /**
     * Returns `true` if the option is a `None` value.
     */
    readonly isNone: () => boolean;

    /**
     * Returns `true` if the option is a `Some` and the value inside of it matches a predicate.
     */
    readonly isSomeAnd: (predicate: (value: T) => boolean) => boolean;

    // #endregion

    // #region Extracting the contained value

    /**
     * These methods extract the contained value in an `Option<T>` when it is the `Some` variant:
     */

    /**
     * Returns the contained `Some` value.
     *
     * **Throw**
     *
     * Throws if the option is a `None` with a custom exception message provided by `msg`.
     */
    readonly expect: (msg: string) => T;

    /**
     * Returns the contained `Some` value.
     *
     * **Throw**
     *
     * Throws if the option equals `None`.
     */
    readonly unwrap: () => T;

    /**
     * Returns the contained `Some` value or a provided default.
     */
    readonly unwrapOr: (defaultValue: T) => T;

    /**
     * Returns the contained `Some` value or computes it from a function.
     */
    readonly unwrapOrElse: (fn: () => T) => T;

    // #endregion

    // #region Transforming contained values

    /**
     * These methods transform `Option` to `Result`:
     */

    /**
     * Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and `None` to `Err(err)`.
     */
    readonly okOr: <E>(error: E) => Result<T, E>;

    /**
     * Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and `None` to `Err(err())`.
     */
    readonly okOrElse: <E>(err: () => E) => Result<T, E>;

    /**
     * Transposes an `Option` of a `Result` into a `Result` of an `Option`.
     *
     * `None` will be mapped to `Ok(None)`.
     * `Some(Ok(_))` and `Some(Err(_))` will be mapped to `Ok(Some(_))` and `Err(_)`.
     */
    readonly transpose: <T, E>(this: Option<Result<T, E>>) => Result<Option<T>, E>;

    /**
     * These methods transform the `Some` variant:
     */

    /**
     * Returns `None` if the option is `None`, otherwise calls `predicate` with the wrapped value and returns:
     *
     * - `Some(t)` if predicate returns `true` (where `t` is the wrapped value), and
     * - `None` if `predicate` returns `false`.
     */
    readonly filter: (predicate: (value: T) => boolean) => this;

    /**
     * Converts from `Option<Option<U>>` to `Option<U>`.
     */
    readonly flatten: <T>(this: Option<Option<T>>) => Option<T>;

    /**
     * Maps an `Option<T>` to `Option<U>` by applying a function to a contained value (if Some) or returns None (if None).
     */
    readonly map: <U>(fn: (value: T) => U) => Option<U>;

    /**
     * These methods transform `Option<T>` to a value of a possibly different type U:
     */

    /**
     * Returns the provided default result (if none), or applies a function to the contained value (if any).
     */
    readonly mapOr: <U>(defaultValue: U, fn: (value: T) => U) => U;

    /**
     * Computes a default function result (if none), or applies a different function to the contained value (if any).
     */
    readonly mapOrElse: <U>(defaultFn: () => U, fn: (value: T) => U) => U;

    /**
     * These methods combine the `Some` variants of two `Option` values:
     */

    /**
     * Zips `this` with another `Option`.
     *
     * If `this` is `Some(s)` and `other` is `Some(o)`, this method returns `Some((s, o))`.
     * Otherwise, `None` is returned.
     */
    readonly zip: <U>(other: Option<U>) => Option<[T, U]>;

    /**
     * Zips `this` and another `Option` with function `fn`.
     *
     * If `this` is `Some(s)` and `other` is `Some(o)`, this method returns `Some(fn(s, o))`.
     * Otherwise, `None` is returned.
     */
    readonly zipWith: <U, R>(other: Option<U>, fn: (value: T, otherValue: U) => R) => Option<R>;

    /**
     * Unzips an option containing a tuple of two options.
     *
     * If `this` is `Some((a, b))` this method returns `[Some(a), Some(b)]`.
     * Otherwise, `[None, None]` is returned.
     */
    readonly unzip: <T, U>(this: Option<[T, U]>) => [Option<T>, Option<U>];

    // #endregion

    // #region Boolean operators

    /**
     * These methods treat the `Option` as a boolean value, where `Some` acts like `true` and `None` acts like `false`.
     */

    /**
     * Returns `None` if the option is `None`, otherwise returns `other`.
     */
    readonly and: <U>(other: Option<U>) => Option<U>;

    /**
     * Returns `None` if the option is `None`, otherwise calls `fn` with the wrapped value and returns the result.
     */
    readonly andThen: <U>(fn: (value: T) => Option<U>) => Option<U>;

    /**
     * Returns the option if it contains a value, otherwise returns `other`.
     */
    readonly or: (other: Option<T>) => Option<T>;

    /**
     * Returns the option if it contains a value, otherwise calls `fn` and returns the result.
     */
    readonly orElse: (fn: () => Option<T>) => Option<T>;

    /**
     * Returns `Some` if exactly one of `this`, `other` is Some, otherwise returns `None`.
     */
    readonly xor: (other: Option<T>) => Option<T>;

    // #endregion

    /**
     * Calls a function with a reference to the contained value if `Some`.
     */
    readonly inspect: (fn: (value: T) => void) => this;

    // #region Equals comparison

    /**
     * Returns `true` if this and input option have same `Some` value or both are `None`.
     */
    readonly eq: (other: Option<T>) => boolean;

    // #endregion
}

type None = Option<any>;

/**
 * Create a `Some` object.
 *
 * # Examples
 *
 * ```
 * const v = Some(10);
 * console.assert(v.unwrap() === 10);
 * ```
 *
 * @param value The contained value which can not be null or undefined.
 * @returns {Option<T>}
 */
export function Some<T>(value: T): Option<T> {
    const some: Option<T> = {
        [optionKindSymbol]: 'Some',

        isSome: (): boolean => true,
        isNone: (): boolean => false,
        isSomeAnd: (predicate: (value: T) => boolean): boolean => predicate(value),

        expect: (_msg: string): T => value,
        unwrap: (): T => value,
        unwrapOr: (_defaultValue: T): T => value,
        unwrapOrElse: (_fn: () => T): T => value,

        okOr: <E>(_error: E): Result<T, E> => Ok(value),
        okOrElse: <E>(_err: () => E): Result<T, E> => Ok(value),
        transpose: <T, E>(): Result<Option<T>, E> => {
            const r = value as unknown as Result<T, E>;
            assertResult(r);
            return r.isOk() ? Ok(Some(r.unwrap())) : Err(r.unwrapErr());
        },

        filter: (predicate: (value: T) => boolean): Option<T> => predicate(value) ? some : None,
        flatten: <T>(): Option<T> => {
            const o = value as unknown as Option<T>;
            assertOption(o);
            return o;
        },
        map: <U>(fn: (value: T) => U): Option<U> => Some(fn(value)),

        mapOr: <U>(_defaultValue: U, fn: (value: T) => U): U => fn(value),
        mapOrElse: <U>(_defaultFn: () => U, fn: (value: T) => U): U => fn(value),

        zip: <U>(other: Option<U>): Option<[T, U]> => {
            assertOption(other);
            return other.isSome() ? Some([value, other.unwrap()]) : None;
        },
        zipWith: <U, R>(other: Option<U>, fn: (value: T, otherValue: U) => R): Option<R> => {
            assertOption(other);
            return other.isSome() ? Some(fn(value, other.unwrap())) : None;
        },
        unzip: <T, U>(): [Option<T>, Option<U>] => {
            const tuple = value as unknown as [T, U];

            if (!Array.isArray(tuple) || tuple.length !== 2) {
                throw new TypeError('Unzip format is incorrect.');
            }

            const [a, b] = tuple;
            return [Some(a), Some(b)];
        },

        and: <U>(other: Option<U>): Option<U> => {
            assertOption(other);
            return other;
        },
        andThen: <U>(fn: (value: T) => Option<U>): Option<U> => fn(value),
        or: (_other: Option<T>): Option<T> => some,
        orElse: (_fn: () => Option<T>): Option<T> => some,
        xor: (other: Option<T>): Option<T> => {
            assertOption(other);
            return other.isSome() ? None : some;
        },

        inspect: (fn: (value: T) => void): Option<T> => {
            fn(value);
            return some;
        },

        eq: (other: Option<T>): boolean => {
            assertOption(other);
            return other.isSome() && other.unwrap() === value;
        },
    } as const;

    return some;
}

/**
 * `None` value is freeze.
 *
 * @constant {None}
 */
export const None = Object.freeze<None>({
    [optionKindSymbol]: 'None',

    isSome: (): boolean => false,
    isNone: (): boolean => true,
    isSomeAnd: (_predicate: (value: never) => boolean): boolean => false,

    expect: (msg: string): never => {
        throw new TypeError(msg);
    },
    unwrap: (): never => {
        throw new TypeError('Called `Option::unwrap()` on a `None` value');
    },
    unwrapOr: <T>(defaultValue: T): T => defaultValue,
    unwrapOrElse: <T>(fn: () => T): T => fn(),

    okOr: <E, T>(error: E): Result<T, E> => Err(error),
    okOrElse: <E, T>(err: () => E): Result<T, E> => Err(err()),
    transpose: <E, T>(): Result<Option<T>, E> => Ok(None),

    filter: (_predicate: (value: never) => boolean): None => None,
    flatten: (): None => None,
    map: <U>(_fn: (value: never) => U): None => None,

    mapOr: <U>(defaultValue: U, _fn: (value: never) => U): U => defaultValue,
    mapOrElse: <U>(defaultFn: () => U, _fn: (value: never) => U): U => defaultFn(),

    zip: <U>(_other: Option<U>): None => None,
    zipWith: <U, R>(_other: Option<U>, _fn: (value: never, otherValue: U) => R): None => None,
    unzip: <T, U>(): [Option<T>, Option<U>] => [None, None],

    and: <U>(_other: Option<U>): Option<U> => None,
    andThen: <U>(_fn: (value: never) => Option<U>): Option<U> => None,
    or: <T>(other: Option<T>): Option<T> => {
        assertOption(other);
        return other;
    },
    orElse: <T>(fn: () => Option<T>): Option<T> => fn(),
    xor: <T>(other: Option<T>): Option<T> => {
        assertOption(other);
        return other.isSome() ? other : None;
    },

    inspect: (_fn: (value: never) => void): None => None,

    eq: <T>(other: Option<T>): boolean => {
        assertOption(other);
        return other === None;
    },
}) as None;