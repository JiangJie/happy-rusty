/**
 * @fileoverview A Rust-inspired [Result](https://doc.rust-lang.org/core/result/index.html) enum, used for better error handling.
 */

/**
 * result::Ok type
 */
interface Ok<T, E> {
    readonly kind: 'Ok';
    readonly isOk: (this: Result<T, E>) => this is Ok<T, E>;
    readonly isErr: (this: Result<T, E>) => this is Err<T, E>;
    readonly unwrap: () => T;
    readonly err: () => never;
}

/**
 * result::Err type
 */
interface Err<T, E> {
    readonly kind: 'Err';
    readonly isOk: (this: Result<T, E>) => this is Ok<T, E>;
    readonly isErr: (this: Result<T, E>) => this is Err<T, E>;
    readonly unwrap: () => never;
    readonly err: () => E;
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
        console.assert(result.err().message === 'lose');
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
        unwrap: () => value,
        err: () => {
            throw new TypeError('Ok is not Err');
        },
    } as const;
}

/**
 * Create an `Err` object.
 *
 * # Examples
 *
 * ```
 * const e = Err(new Error('unknown error'));
 * console.assert(e.err().message === 'unknown error');
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
        unwrap: () => {
            throw error;
        },
        err: () => error,
    } as const;
}