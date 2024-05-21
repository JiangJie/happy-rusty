// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @fileoverview A Rust-inspired [Result](https://doc.rust-lang.org/core/result/index.html) enum, used for better error handling.
 */

/**
 * Symbol for debug
 */
const resultKindSymbol = Symbol('Result kind');

/**
 * result::Ok type
 */
interface Ok<T, E> {
    // #region Internal properties
    /**
     * for debug
     */
    readonly [resultKindSymbol]: 'Ok';
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
    readonly unwrapOrElse: (fn: (err: E) => T) => T;
    // #endregion

    // #region Transforming contained values
    readonly map: <U>(fn: (value: T) => U) => Result<U, E>;
    readonly mapErr: <F>(fn: (err: E) => F) => Result<T, F>;
    readonly mapOr: <U>(defaultValue: U, fn: (value: T) => U) => Result<U, E>;
    readonly mapOrElse: <U>(defaultFn: (err: E) => U, fn: (value: T) => U) => Result<U, E>;
    // #endregion
}

/**
 * result::Err type
 */
interface Err<T, E> {
    // #region Internal properties
    /**
     * for debug
     */
    readonly [resultKindSymbol]: 'Err';
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
    readonly unwrapOrElse: (fn: (err: E) => T) => T;
    // #endregion

    // #region Transforming contained values
    readonly map: <U>(fn: (value: T) => U) => Result<U, E>;
    readonly mapErr: <F>(fn: (err: E) => F) => Result<T, F>;
    readonly mapOr: <U>(defaultValue: U, fn: (value: T) => U) => Result<U, E>;
    readonly mapOrElse: <U>(defaultFn: (err: E) => U, fn: (value: T) => U) => Result<U, E>;
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
 * @returns {Result<T, E>}
 */
export function Ok<T, E>(value: T): Result<T, E> {
    return {
        [resultKindSymbol]: 'Ok',

        isOk: () => true,
        isErr: () => false,

        equals: (r: Result<any, any>) => r.isOk() && r.unwrap() === value,

        expect: (_msg: string) => value,

        unwrap: () => value,
        unwrapErr: () => {
            throw new TypeError('called `Result::unwrap_err()` on an `Ok` value');
        },
        unwrapOr: (_defaultValue: T) => value,
        unwrapOrElse: (_fn: (err: E) => T) => value,

        map: <U>(fn: (value: T) => U) => Ok(fn(value)),
        mapErr: <F>(_fn: (err: E) => F) => Ok<T, F>(value),
        mapOr: <U>(_defaultValue: U, fn: (value: T) => U) => Ok(fn(value)),
        mapOrElse: <U>(_defaultFn: (err: E) => U, fn: (value: T) => U) => Ok(fn(value)),
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
 * @param err The wrapped error value.
 * @returns {Result<T, E>}
 */
export function Err<T, E>(err: E): Result<T, E> {
    return {
        [resultKindSymbol]: 'Err',

        isOk: () => false,
        isErr: () => true,

        equals: (r: Result<any, any>) => r.isErr() && r.unwrapErr() === err,

        expect: (msg: string) => {
            throw new TypeError(`${ msg }: ${ err }`);
        },
        unwrap: () => {
            throw new TypeError('called `Result::unwrap()` on an `Err` value');
        },
        unwrapErr: () => err,
        unwrapOr: (defaultValue: T) => defaultValue,
        unwrapOrElse: (fn: (e: E) => T) => fn(err),

        map: <U>(_fn: (value: T) => U) => Err<U, E>(err),
        mapErr: <F>(fn: (err: E) => F) => Err(fn(err)),
        mapOr: <U>(defaultValue: U, _fn: (value: T) => U) => Ok(defaultValue),
        mapOrElse: <U>(defaultFn: (err: E) => U, _fn: (value: T) => U) => Ok(defaultFn(err)),
    } as const;
}

/**
 * Convert from `Promise` to `Promise<Result>`.
 *
 * @param p Promise<T>
 * @returns {Promise<Result<T, E>>}
 */
export function promiseToResult<T, E = any>(p: Promise<T>): Promise<Result<T, E>> {
    return p.then((x) => {
        return Ok<T, E>(x);
    }).catch((err: E) => {
        return Err(err);
    });
}