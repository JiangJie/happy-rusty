// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @fileoverview A Rust-inspired [Option](https://doc.rust-lang.org/core/option/index.html) enum, used as an alternative to the use of null and undefined.
 */

import { Err, Ok, type Result } from './result.ts';

/**
 * Symbol for debug
 */
const optionKindSymbol = Symbol('Option kind');

/**
 * option::Option type
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
     * Returns `true` if the option is a `Some` value.
     */
    readonly isSome: (this: Option<T>) => this is Some<T>;

    /**
     * Returns `true` if the option is a `None` value.
     */
    readonly isNone: (this: Option<T>) => this is None;

    // #endregion

    // #region Equals comparison

    /**
     * Returns `true` if this and input option have same `Some` value or both are `None`.
     */
    readonly eq: <U>(o: Option<U>) => boolean;

    // #endregion

    // #region Extracting the contained value

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
     * Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and `None` to `Err(err)`.
     */
    readonly okOr: <E>(err: E) => Result<T, E>;

    /**
     * Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and `None` to `Err(err())`.
     */
    readonly okOrElse: <E>(err: () => E) => Result<T, E>;

    /**
     * Maps an `Option<T>` to `Option<U>` by applying a function to a contained value (if Some) or returns None (if None).
     */
    readonly map: <U>(fn: (value: T) => NonNullable<U>) => Option<U>;

    /**
     * Returns the provided default result (if none), or applies a function to the contained value (if any).
     */
    readonly mapOr: <U>(defaultValue: NonNullable<U>, fn: (value: T) => NonNullable<U>) => Option<U>;

    /**
     * Computes a default function result (if none), or applies a different function to the contained value (if any).
     */
    readonly mapOrElse: <U>(defaultFn: () => NonNullable<U>, fn: (value: T) => NonNullable<U>) => Option<U>;

    /**
     * Returns `None` if the option is `None`, otherwise calls `predicate` with the wrapped value and returns:
     *
     * - `Some(t)` if predicate returns `true` (where `t` is the wrapped value), and
     * - `None` if `predicate` returns `false`.
     */
    readonly filter: (predicate: (value: T) => boolean) => Option<T>;

    // #endregion
}

/**
 * option::Some type
 */
interface Some<T> extends Option<T> {
    // #region Override

    readonly [optionKindSymbol]: 'Some';

    // #endregion
}

/**
 * option::None type
 */
interface None extends Option<any> {
    /**
     * Difference between `Option` while using `None` alone.
     * - T is unknown.
     * - value is never.
     */

    // #region Override

    readonly [optionKindSymbol]: 'None';

    readonly isSome: <T>(this: Option<T>) => this is Some<T>;
    readonly isNone: <T>(this: Option<T>) => this is None;

    readonly expect: (msg: string) => never;

    readonly unwrap: () => never;
    readonly unwrapOr: <T>(defaultValue: T) => T;
    readonly unwrapOrElse: <T>(fn: () => T) => T;

    readonly okOr: <E, T>(err: E) => Result<T, E>;
    readonly okOrElse: <E, T>(err: () => E) => Result<T, E>;

    readonly map: <U>(fn: (value: never) => NonNullable<U>) => None;
    readonly mapOr: <U>(defaultValue: NonNullable<U>, fn: (value: never) => NonNullable<U>) => Option<U>;
    readonly mapOrElse: <U>(defaultFn: () => NonNullable<U>, fn: (value: never) => NonNullable<U>) => Option<U>;

    readonly filter: (predicate: (value: never) => boolean) => None;

    // #endregion
}

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
export function Some<T>(value: NonNullable<T>): Option<T> {
    if (value == null) {
        throw new TypeError('Some value can not be null or undefined');
    }

    return {
        [optionKindSymbol]: 'Some',

        isSome: () => true,
        isNone: () => false,

        eq: <U>(o: Option<U>) => o.isSome() && o.unwrap() === value,

        expect: (_msg: string) => value,

        unwrap: () => value,
        unwrapOr: (_defaultValue: T) => value,
        unwrapOrElse: (_fn: () => T) => value,

        okOr: <E>(_err: E) => Ok<T, E>(value),
        okOrElse: <E>(_err: () => E) => Ok<T, E>(value),

        map: <U>(fn: (value: T) => NonNullable<U>) => Some(fn(value)),
        mapOr: <U>(_defaultValue: NonNullable<U>, fn: (value: T) => NonNullable<U>) => Some(fn(value)),
        mapOrElse: <U>(_defaultF: () => NonNullable<U>, fn: (value: T) => NonNullable<U>) => Some(fn(value)),

        filter: (predicate: (value: T) => boolean) => predicate(value) ? Some(value) : None,
    } as const;
}

/**
 * `None` value is freeze.
 *
 * @constant {None}
 */
export const None = Object.freeze({
    [optionKindSymbol]: 'None',

    isSome: () => false,
    isNone: () => true,

    eq: <U>(o: Option<U>) => o === None,

    expect: (msg: string) => {
        throw new TypeError(msg);
    },

    unwrap: () => {
        throw new TypeError('called `Option::unwrap()` on a `None` value');
    },
    unwrapOr: <T>(defaultValue: T) => defaultValue,
    unwrapOrElse: <T>(fn: () => T) => fn(),

    okOr: <E, T>(err: E) => Err<T, E>(err),
    okOrElse: <E, T>(err: () => E) => Err<T, E>(err()),

    map: <U>(_fn: (value: never) => NonNullable<U>) => None,
    mapOr: <U>(defaultValue: NonNullable<U>, _fn: (value: never) => NonNullable<U>) => Some(defaultValue),
    mapOrElse: <U>(defaultFn: () => NonNullable<U>, _fn: (value: never) => NonNullable<U>) => Some(defaultFn()),

    filter: (_predicate: (value: never) => boolean) => None,
} as None) as None;

/**
 * Convert from `Promise` to `Promise<Option>`.
 *
 * @param p Promise<T>
 * @returns {Promise<Option<T>>}
 */
export function promiseToOption<T>(p: Promise<NonNullable<T>>): Promise<Option<T>> {
    return p.then((x) => {
        return Some(x);
    }).catch(() => {
        return None;
    });
}