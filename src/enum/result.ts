/**
 * @fileoverview 仿rust的[Result](https://doc.rust-lang.org/core/result/index.html)枚举，
 * 用于错误处理。
 */

interface Ok<T, E> {
    readonly kind: 'Ok';
    readonly isOk: (this: Result<T, E>) => this is Ok<T, E>;
    readonly isErr: (this: Result<T, E>) => this is Err<T, E>;
    readonly unwrap: () => T;
}

interface Err<T, E> {
    readonly kind: 'Err';
    readonly isOk: (this: Result<T, E>) => this is Ok<T, E>;
    readonly isErr: (this: Result<T, E>) => this is Err<T, E>;
    readonly unwrap: () => never;
    readonly err: () => E;
}

export type Result<T, E> = Ok<T, E> | Err<T, E>;

/**
 * 创建一个`Ok`对象
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
if (res.isSome()) {
    const result = await res.unwrap();
    if (result.isErr()) {
        console.assert(result.err().message === 'lose');
    } else {
        console.log(result.unwrap());
    }
}
 *
 * ```
 *
 * @param value 被包裹的值
 * @returns Ok
 */
export function Ok<T, E>(value: T): Result<T, E> {
    return {
        kind: 'Ok',
        isOk: () => true,
        isErr: () => false,
        unwrap: () => value,
    };
}

/**
 * 创建一个`Err`对象
 *
 * # Examples
 *
 * ```
 * const e = Err(new Error('unknown error'));
 * console.assert(e.err().message === 'unknown error');
 * ```
 *
 * @param error 被包裹的错误
 * @returns Err
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
    };
}