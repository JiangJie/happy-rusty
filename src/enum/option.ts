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
     * The `isSome` and `isNone` methods return `true` if the `Option` is `Some` or `None`, respectively.
     */

    /**
     * Returns `true` if the option is a `Some` value.
     */
    readonly isSome: (this: Option<T>) => this is Some<T>;

    /**
     * Returns `true` if the option is a `None` value.
     */
    readonly isNone: (this: Option<T>) => this is None;

    /**
     * Returns `true` if the option is a `Some` and the value inside of it matches a predicate.
     */
    readonly isSomeAnd: (predicate: (value: T) => boolean) => boolean;

    // #endregion

    // #region Equals comparison

    /**
     * Returns `true` if this and input option have same `Some` value or both are `None`.
     */
    readonly eq: <U>(o: Option<U>) => boolean;

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
    readonly okOr: <E>(err: E) => Result<T, E>;

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
    readonly transpose: <U, E>(this: Option<Result<U, E>>) => Result<Option<U>, E>;

    /**
     * These methods transform the `Some` variant:
     */

    /**
     * Returns `None` if the option is `None`, otherwise calls `predicate` with the wrapped value and returns:
     *
     * - `Some(t)` if predicate returns `true` (where `t` is the wrapped value), and
     * - `None` if `predicate` returns `false`.
     */
    readonly filter: (predicate: (value: T) => boolean) => Option<T>;

    /**
     * Converts from `Option<Option<U>>` to `Option<U>`.
     */
    readonly flatten: <U>(this: Option<Option<U>>) => Option<U>;

    /**
     * Maps an `Option<T>` to `Option<U>` by applying a function to a contained value (if Some) or returns None (if None).
     */
    readonly map: <U>(fn: (value: T) => NonNullable<U>) => Option<U>;

    /**
     * These methods transform `Option<T>` to a value of a possibly different type U:
     */

    /**
     * Returns the provided default result (if none), or applies a function to the contained value (if any).
     */
    readonly mapOr: <U>(defaultValue: NonNullable<U>, fn: (value: T) => NonNullable<U>) => Option<U>;

    /**
     * Computes a default function result (if none), or applies a different function to the contained value (if any).
     */
    readonly mapOrElse: <U>(defaultFn: () => NonNullable<U>, fn: (value: T) => NonNullable<U>) => Option<U>;

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
    readonly zipWith: <U, R>(other: Option<U>, fn: (value: T, otherValue: U) => NonNullable<R>) => Option<R>;

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

    // #region Modifying an `Option` in-place

    /**
     * These methods return a mutable reference to the contained value of an `Option<T>`:
     */

    /**
     * Inserts `value` into the option.
     *
     * If the option already contains a value, the old value is dropped.
     */
    readonly insert: (value: NonNullable<T>) => Option<T>;

    /**
     * Inserts `value` into the option if it is `None`.
     */
    readonly getOrInsert: (value: NonNullable<T>) => Option<T>;

    /**
     * Inserts a value computed from `fn` into the option if it is `None`.
     */
    readonly getOrInsertWith: (fn: () => NonNullable<T>) => Option<T>;

    // #endregion

    /**
     * Calls a function with a reference to the contained value if `Some`.
     */
    readonly inspect: (fn: (value: T) => void) => Option<T>;
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
    readonly isSomeAnd: (_predicate: (value: never) => boolean) => boolean;

    readonly expect: (msg: string) => never;
    readonly unwrap: () => never;

    readonly transpose: <U, E>(this: Option<Result<U, E>>) => Result<Option<U>, E>;

    readonly filter: (predicate: (value: never) => boolean) => None;
    readonly flatten: <U>(this: Option<Option<U>>) => None;
    readonly map: <U>(fn: (value: never) => NonNullable<U>) => None;

    readonly mapOr: <U>(defaultValue: NonNullable<U>, fn: (value: never) => NonNullable<U>) => Option<U>;
    readonly mapOrElse: <U>(defaultFn: () => NonNullable<U>, fn: (value: never) => NonNullable<U>) => Option<U>;

    readonly zip: <U>(other: Option<U>) => None;
    readonly zipWith: <U, R>(other: Option<U>, fn: (value: never, otherValue: U) => NonNullable<R>) => None;
    readonly unzip: <T, U>(this: Option<[T, U]>) => [None, None];

    readonly and: <U>(other: Option<U>) => None;
    readonly andThen: <U>(fn: (value: never) => Option<U>) => None;
    readonly orElse: <T>(fn: () => Option<T>) => Option<T>;

    readonly inspect: (fn: (value: never) => void) => None;

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
        isSomeAnd: (predicate: (value: T) => boolean) => predicate(value),

        eq: <U>(o: Option<U>) => o.isSome() && o.unwrap() === value,

        expect: (_msg: string) => value,
        unwrap: () => value,
        unwrapOr: (_defaultValue: T) => value,
        unwrapOrElse: (_fn: () => T) => value,

        okOr: <E>(_err: E) => Ok<T, E>(value),
        okOrElse: <E>(_err: () => E) => Ok<T, E>(value),
        transpose: <U, E>(): Result<Option<U>, E> => {
            const r = value as unknown as Result<U, E>;
            return r.isOk() ? Ok(Some(r.unwrap() as NonNullable<U>)) : Err(r.unwrapErr());
        },

        filter: (predicate: (value: T) => boolean) => predicate(value) ? Some(value) : None,
        flatten: <U>(): Option<U> => {
            const o = value as unknown as Option<U>;
            return o.isSome() ? o : None;
        },
        map: <U>(fn: (value: T) => NonNullable<U>) => Some(fn(value)),

        mapOr: <U>(_defaultValue: NonNullable<U>, fn: (value: T) => NonNullable<U>) => Some(fn(value)),
        mapOrElse: <U>(_defaultF: () => NonNullable<U>, fn: (value: T) => NonNullable<U>) => Some(fn(value)),

        zip: <U>(other: Option<U>) => other === None ? None : Some([value as T, other.unwrap()]),
        zipWith: <U, R>(other: Option<U>, fn: (value: T, otherValue: U) => NonNullable<R>) => other === None ? None : Some(fn(value, other.unwrap())),
        unzip: <T, U>() => {
            const [a, b] = value as unknown as [NonNullable<T>, NonNullable<U>];
            return [Some(a), Some(b)];
        },

        and: <U>(other: Option<U>) => other,
        andThen: <U>(fn: (value: T) => Option<U>) => fn(value),
        or: (_other: Option<T>) => Some(value),
        orElse: (_fn: () => Option<T>) => Some(value),
        xor: (other: Option<T>): Option<T> => other.isSome() ? None : Some(value),

        insert: (newValue: NonNullable<T>) => Some(newValue),
        getOrInsert: (_newValue: NonNullable<T>) => Some(value),
        getOrInsertWith: (_fn: () => NonNullable<T>) => Some(value),

        inspect: (fn: (value: T) => void) => {
            fn(value);
            return Some(value);
        },
    } as const;
}

/**
 * `None` value is freeze.
 *
 * @constant {None}
 */
export const None = Object.freeze<None>({
    [optionKindSymbol]: 'None',

    isSome: () => false,
    isNone: () => true,
    isSomeAnd: (_predicate: (value: never) => boolean) => false,

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
    transpose: <E, T>(): Result<Option<T>, E> => Ok(None as Option<T>),

    filter: (_predicate: (value: never) => boolean) => None,
    flatten: () => None,
    map: <U>(_fn: (value: never) => NonNullable<U>) => None,

    mapOr: <U>(defaultValue: NonNullable<U>, _fn: (value: never) => NonNullable<U>) => Some(defaultValue),
    mapOrElse: <U>(defaultFn: () => NonNullable<U>, _fn: (value: never) => NonNullable<U>) => Some(defaultFn()),

    zip: <U>(_other: Option<U>) => None,
    zipWith: <U, R>(_other: Option<U>, _fn: (value: never, otherValue: U) => NonNullable<R>) => None,
    unzip: () => [None, None],

    and: <U>(_other: Option<U>) => None,
    andThen: <U>(_fn: (value: never) => Option<U>) => None,
    or: <U>(other: Option<U>) => other,
    orElse: <U>(fn: () => Option<U>) => fn(),
    xor: <U>(other: Option<U>): Option<U> => other.isSome() ? other : None,

    insert: <T>(newValue: NonNullable<T>) => Some(newValue),
    getOrInsert: <T>(newValue: NonNullable<T>) => Some(newValue),
    getOrInsertWith: <T>(fn: () => NonNullable<T>) => Some(fn()),

    inspect: (_fn: (value: never) => void) => None,
}) as None;