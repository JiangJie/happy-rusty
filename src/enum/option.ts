/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @fileoverview A Rust-inspired [Option](https://doc.rust-lang.org/core/option/index.html) enum, used as an alternative to the use of null and undefined.
 */

/**
 * option::Some type
 */
interface Some<T> {
    // #region Internal properties
    readonly kind: 'Some';
    // #endregion

    // #region Querying the variant
    readonly isSome: (this: Option<T>) => this is Some<T>;
    readonly isNone: (this: Option<T>) => this is None;
    // #endregion

    // #region Equals comparison
    readonly equals: (o: Option<any>) => boolean;
    // #endregion

    // #region Extracting the contained value
    readonly expect: (msg: string) => T;
    readonly unwrap: () => T;
    readonly unwrapOr: (defaultValue: T) => T;
    readonly unwrapOrElse: (f: () => T) => T;
    // #endregion

    // #region Transforming contained values
    readonly map: <U>(f: (value: T) => NonNullable<U>) => Option<U>;
    readonly mapOr: <U>(defaultValue: NonNullable<U>, f: (value: T) => NonNullable<U>) => Option<U>;
    readonly mapOrElse: <U>(defaultF: () => NonNullable<U>, f: (value: T) => NonNullable<U>) => Option<U>;
    // #endregion
}

/**
 * option::None type
 */
interface None {
    // #region Internal properties
    readonly kind: 'None';
    // #endregion

    // #region Querying the variant
    readonly isSome: <T>(this: Option<T>) => this is Some<T>;
    readonly isNone: <T>(this: Option<T>) => this is None;
    // #endregion

    // #region Equals comparison
    readonly equals: (o: Option<any>) => boolean;
    // #endregion

    // #region Extracting the contained value
    readonly expect: (msg: string) => never;
    readonly unwrap: () => never;
    readonly unwrapOr: <T>(defaultValue: T) => T;
    readonly unwrapOrElse: <T>(f: () => T) => T;
    // #endregion

    // #region Transforming contained values
    readonly map: <U, T>(f: (value: T) => NonNullable<U>) => Option<U>;
    readonly mapOr: <U, T>(defaultValue: NonNullable<U>, f: (value: T) => NonNullable<U>) => Option<U>;
    readonly mapOrElse: <U, T>(defaultF: () => NonNullable<U>, f: (value: T) => NonNullable<U>) => Option<U>;
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
 * @returns {Some}
 */
export function Some<T>(value: NonNullable<T>): Option<T> {
    if (value == null) {
        throw new TypeError('Some value can not be null or undefined');
    }

    return {
        kind: 'Some',

        isSome: () => true,
        isNone: () => false,

        equals: (o: Option<any>) => o.isSome() && o.unwrap() === value,

        expect: (_msg: string) => value,
        unwrap: () => value,
        unwrapOr: (_defaultValue: T) => value,
        unwrapOrElse: (_f: () => T) => value,

        map: <U>(f: (value: T) => NonNullable<U>) => Some(f(value)),
        mapOr: <U>(_defaultValue: NonNullable<U>, f: (value: T) => NonNullable<U>) => Some(f(value)),
        mapOrElse: <U>(_defaultF: () => NonNullable<U>, f: (value: T) => NonNullable<U>) => Some(f(value)),
    } as const;
}

/**
 * `None` value is freeze.
 *
 * @constant {None}
 */
export const None: None = {
    kind: 'None',

    isSome: () => false,
    isNone: () => true,

    equals: (o: Option<any>) => o === None,

    expect: (msg: string) => {
        throw new TypeError(msg);
    },
    unwrap: () => {
        throw new TypeError('None can not unwrap');
    },
    unwrapOr: <T>(defaultValue: T) => defaultValue,
    unwrapOrElse: <T>(f: () => T) => f(),

    map: <U, T>(_f: (value: T) => NonNullable<U>) => None,
    mapOr: <U, T>(_defaultValue: NonNullable<U>, _f: (value: T) => NonNullable<U>) => Some(_defaultValue),
    mapOrElse: <U, T>(defaultF: () => NonNullable<U>, _f: (value: T) => NonNullable<U>) => Some(defaultF()),
} as const;

/**
 * Convert a `Promise` to an `Option`.
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