/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @fileoverview A Rust-inspired [Result](https://doc.rust-lang.org/core/result/index.html) enum, used for better error handling.
 */

/**
 * result::Ok type
 */
interface Ok<T, E> {
    // #region Internal properties
    readonly kind: 'Ok';
    // #endregion

    // #region Querying the variant
    readonly isOk: (this: Result<T, E>) => this is Ok<T, E>;
    readonly isErr: (this: Result<T, E>) => this is Err<T, E>;
    // #endregion

    // #region Equals comparison
    readonly equals: (r: Result<any, any>) => boolean;
    // #endregion

    // #region Extracting the contained value
    readonly expect: (msg: string) => T;
    readonly unwrap: () => T;
    readonly unwrapErr: () => never;
    readonly unwrapOr: (defaultValue: T) => T;
    readonly unwrapOrElse: (f: (e: E) => T) => T;
    // #endregion

    // #region Transforming contained values
    readonly map: <U>(f: (value: T) => U) => Result<U, E>;
    readonly mapErr: <F>(f: (error: E) => F) => Result<T, F>;
    readonly mapOr: <U>(defaultValue: U, f: (value: T) => U) => Result<U, E>;
    readonly mapOrElse: <U>(defaultF: (error: E) => U, f: (value: T) => U) => Result<U, E>;
    // #endregion
}

/**
 * result::Err type
 */
interface Err<T, E> {
    // #region Internal properties
    readonly kind: 'Err';
    // #endregion

    // #region Querying the variant
    readonly isOk: (this: Result<T, E>) => this is Ok<T, E>;
    readonly isErr: (this: Result<T, E>) => this is Err<T, E>;
    // #endregion

    // #region Equals comparison
    readonly equals: (r: Result<any, any>) => boolean;
    // #endregion

    // #region Extracting the contained value
    readonly expect: (msg: string) => never;
    readonly unwrap: () => never;
    readonly unwrapErr: () => E;
    readonly unwrapOr: (defaultValue: T) => T;
    readonly unwrapOrElse: (f: (e: E) => T) => T;
    // #endregion

    // #region Transforming contained values
    readonly map: <U>(f: (value: T) => U) => Result<U, E>;
    readonly mapErr: <F>(f: (error: E) => F) => Result<T, F>;
    readonly mapOr: <U>(defaultValue: U, f: (value: T) => U) => Result<U, E>;
    readonly mapOrElse: <U>(defaultF: (error: E) => U, f: (value: T) => U) => Result<U, E>;
    // #endregion
}

/**
 * result::Result type
 */
export type Result<T, E> = Ok<T, E> | Err<T, E>;

/**
 * Create an `Ok` object.
 *
 * # Examples
 *
 * ```
 * const v = Ok(10);
 * console.assert(v.unwrap() === 10);
 *
function judge(n: number): Option<Promise<Result<number, Error>>> {
    if (n < 0 || n >= 1) {
        return None;
    }

    return Some(new Promise(resolve => {
        const r = Math.random();
        resolve(r > n ? Ok(r) : Err(new Error('lose')));
    }));
}

const res = judge(0.8);
if (res.isNone()) {
    console.error('invalid number');
} else {
    const result = await res.unwrap();
    if (result.isErr()) {
        console.assert(result.unwrapErr().message === 'lose');
    } else {
        console.log(result.unwrap()); // must greater than 0.8
    }
}
 *
 * ```
 *
 * @param value The wrapped value.
 * @returns {Ok}
 */
export function Ok<T, E>(value: T): Result<T, E> {
    return {
        kind: 'Ok',

        isOk: () => true,
        isErr: () => false,

        equals: (r: Result<any, any>) => r.isOk() && r.unwrap() === value,

        expect: (_msg: string) => value,
        unwrap: () => value,
        unwrapErr: () => {
            throw new TypeError('Ok is not Err');
        },
        unwrapOr: (_defaultValue: T) => value,
        unwrapOrElse: (_f: (e: E) => T) => value,

        map: <U>(f: (value: T) => U) => Ok(f(value)),
        mapErr: <F>(_f: (error: E) => F) => Ok<T, F>(value),
        mapOr: <U>(_defaultValue: U, f: (value: T) => U) => Ok(f(value)),
        mapOrElse: <U>(_defaultF: (error: E) => U, f: (value: T) => U) => Ok(f(value)),
    } as const;
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
 * @param error The wrapped error value.
 * @returns {Err}
 */
export function Err<T, E>(error: E): Result<T, E> {
    return {
        kind: 'Err',

        isOk: () => false,
        isErr: () => true,

        equals: (r: Result<any, any>) => r.isErr() && r.unwrapErr() === error,

        expect: (msg: string) => {
            throw new TypeError(`${ msg }: ${ error }`);
        },
        unwrap: () => {
            throw error;
        },
        unwrapErr: () => error,
        unwrapOr: (defaultValue: T) => defaultValue,
        unwrapOrElse: (f: (e: E) => T) => f(error),

        map: <U>(_f: (value: T) => U) => Err<U, E>(error),
        mapErr: <F>(f: (error: E) => F) => Err(f(error)),
        mapOr: <U>(defaultValue: U, _f: (value: T) => U) => Ok(defaultValue),
        mapOrElse: <U>(defaultF: (error: E) => U, _f: (value: T) => U) => Ok(defaultF(error)),
    } as const;
}

/**
 * Convert a `Promise` to a `Result`.
 *
 * @param p Promise<T>
 * @returns {Promise<Result<T, E>>}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function promiseToResult<T, E = any>(p: Promise<T>): Promise<Result<T, E>> {
    return p.then((x) => {
        return Ok<T, E>(x);
    }).catch((err: E) => {
        return Err(err);
    });
}