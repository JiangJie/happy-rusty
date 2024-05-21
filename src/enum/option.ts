// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @fileoverview A Rust-inspired [Option](https://doc.rust-lang.org/core/option/index.html) enum, used as an alternative to the use of null and undefined.
 */

/**
 * Symbol for debug
 */
const optionKindSymbol = Symbol('Option kind');

/**
 * option::Some type
 */
interface Some<T> {
    // #region Internal properties
    /**
     * for debug
     */
    readonly [optionKindSymbol]: 'Some';
    // #endregion

    // #region Querying the variant
    readonly isSome: (this: Option<T>) => this is Some<T>;
    readonly isNone: (this: Option<T>) => this is None;
    // #endregion

    // #region Equals comparison
    readonly eq: (o: Option<any>) => boolean;
    // #endregion

    // #region Extracting the contained value
    readonly expect: (msg: string) => T;

    readonly unwrap: () => T;
    readonly unwrapOr: (defaultValue: T) => T;
    readonly unwrapOrElse: (fn: () => T) => T;
    // #endregion

    // #region Transforming contained values
    readonly map: <U>(fn: (value: T) => NonNullable<U>) => Option<U>;
    readonly mapOr: <U>(defaultValue: NonNullable<U>, fn: (value: T) => NonNullable<U>) => Option<U>;
    readonly mapOrElse: <U>(defaultFn: () => NonNullable<U>, fn: (value: T) => NonNullable<U>) => Option<U>;

    readonly filter: (predicate: (value: T) => boolean) => Option<T>;
    // #endregion
}

/**
 * option::None type
 */
interface None {
    // #region Internal properties
    /**
     * for debug
     */
    readonly [optionKindSymbol]: 'None';
    // #endregion

    // #region Querying the variant
    readonly isSome: <T>(this: Option<T>) => this is Some<T>;
    readonly isNone: <T>(this: Option<T>) => this is None;
    // #endregion

    // #region Equals comparison
    readonly eq: (o: Option<any>) => boolean;
    // #endregion

    // #region Extracting the contained value
    readonly expect: (msg: string) => never;

    readonly unwrap: () => never;
    readonly unwrapOr: <T>(defaultValue: T) => T;
    readonly unwrapOrElse: <T>(fn: () => T) => T;
    // #endregion

    // #region Transforming contained values
    readonly map: <U>(fn: (value: never) => NonNullable<U>) => None;
    readonly mapOr: <U>(defaultValue: NonNullable<U>, fn: (value: never) => NonNullable<U>) => Option<U>;
    readonly mapOrElse: <U>(defaultFn: () => NonNullable<U>, fn: (value: never) => NonNullable<U>) => Option<U>;

    readonly filter: (predicate: (value: never) => boolean) => None;
    // #endregion
}

/**
 * option::Option type
 */
export type Option<T> = Some<T> | None;

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
 * @param value The wrapped value which can not be null or undefined.
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

        eq: (o: Option<any>) => o.isSome() && o.unwrap() === value,

        expect: (_msg: string) => value,

        unwrap: () => value,
        unwrapOr: (_defaultValue: T) => value,
        unwrapOrElse: (_fn: () => T) => value,

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

    eq: (o: Option<any>) => o === None,

    expect: (msg: string) => {
        throw new TypeError(msg);
    },

    unwrap: () => {
        throw new TypeError('called `Option::unwrap()` on a `None` value');
    },
    unwrapOr: <T>(defaultValue: T) => defaultValue,
    unwrapOrElse: <T>(fn: () => T) => fn(),

    map: <U, T = never>(_fn: (value: T) => NonNullable<U>) => None,
    mapOr: <U, T = never>(defaultValue: NonNullable<U>, _fn: (value: T) => NonNullable<U>) => Some(defaultValue),
    mapOrElse: <U, T = never>(defaultFn: () => NonNullable<U>, _fn: (value: T) => NonNullable<U>) => Some(defaultFn()),

    filter: <T = never>(_predicate: (value: T) => boolean) => None,
}) as None;

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