/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Option, Result } from './core.ts';
import { OptionKindSymbol, ResultKindSymbol } from './symbols.ts';
import { isOption, isResult } from './utils.ts';

/**
 * Represents the absence of a value, as a specialized `Option` type.
 * The type parameter is set to `never` because `None` does not hold a value.
 */
export interface None extends Option<never> {
    /**
     * When using `None` alone, the following overrides can make type inference more accurate.
     */

    readonly [OptionKindSymbol]: 'None';

    unwrapOr<T>(defaultValue: T): T;
    unwrapOrElse<T>(fn: () => T): T;

    transpose(): Result<None, never>;

    filter(predicate: (value: never) => boolean): None;
    flatten(): None;
    map<U>(fn: (value: never) => U): None;

    zip<U>(other: Option<U>): None;
    zipWith<U, R>(other: Option<U>, fn: (value: never, otherValue: U) => R): None;
    unzip(): [None, None];

    and<U>(other: Option<U>): None;
    andThen<U>(fn: (value: never) => Option<U>): None;
    or<T>(other: Option<T>): Option<T>;
    orElse<T>(fn: () => Option<T>): Option<T>;
    xor<T>(other: Option<T>): Option<T>;

    eq<T>(other: Option<T>): boolean;
}

/**
 * Creates an `Option<T>` representing the presence of a value.
 * This function is typically used to construct an `Option` that contains a value, indicating that the operation yielding the value was successful.
 *
 * @typeParam T - The type of the value to be wrapped in a `Some`.
 * @param value - The value to wrap as a `Some` option.
 * @returns An `Option<T>` that contains the provided value, representing the `Some` case.
 *
 * @example
 * ```ts
 * const maybeValue = Some(1); // Option<number> with a value
 * if (maybeValue.isSome()) {
 *     console.log(maybeValue.unwrap()); // Outputs: 1
 * }
 * ```
 */
export function Some<T>(value: T): Option<T> {
    const some: Option<T> = {
        [Symbol.toStringTag]: 'Option',
        [OptionKindSymbol]: 'Some',

        isSome(): true {
            return true;
        },
        isNone(): false {
            return false;
        },
        isSomeAnd(predicate: (value: T) => boolean): boolean {
            return predicate(value);
        },

        expect(_msg: string): T {
            return value;
        },
        unwrap(): T {
            return value;
        },
        unwrapOr(_defaultValue: T): T {
            return value;
        },
        unwrapOrElse(_fn: () => T): T {
            return value;
        },

        okOr<E>(_error: E): Result<T, E> {
            return Ok(value);
        },
        okOrElse<E>(_err: () => E): Result<T, E> {
            return Ok(value);
        },
        transpose<T, E>(): Result<Option<T>, E> {
            const r = value as unknown as Result<T, E>;
            assertResult(r);
            return r.isOk() ? Ok(Some(r.unwrap())) : Err(r.unwrapErr());
        },

        filter(predicate: (value: T) => boolean): Option<T> {
            return predicate(value) ? some : None;
        },
        flatten<T>(): Option<T> {
            const o = value as unknown as Option<T>;
            assertOption(o);
            return o;
        },
        map<U>(fn: (value: T) => U): Option<U> {
            return Some(fn(value));
        },

        mapOr<U>(_defaultValue: U, fn: (value: T) => U): U {
            return fn(value);
        },
        mapOrElse<U>(_defaultFn: () => U, fn: (value: T) => U): U {
            return fn(value);
        },

        zip<U>(other: Option<U>): Option<[T, U]> {
            assertOption(other);
            return other.isSome() ? Some([value, other.unwrap()]) : None;
        },
        zipWith<U, R>(other: Option<U>, fn: (value: T, otherValue: U) => R): Option<R> {
            assertOption(other);
            return other.isSome() ? Some(fn(value, other.unwrap())) : None;
        },
        unzip<T, U>(): [Option<T>, Option<U>] {
            const tuple = value as unknown as [T, U];

            if (!Array.isArray(tuple) || tuple.length !== 2) {
                throw new TypeError('Unzip format is incorrect.');
            }

            const [a, b] = tuple;
            return [Some(a), Some(b)];
        },

        and<U>(other: Option<U>): Option<U> {
            assertOption(other);
            return other;
        },
        andThen<U>(fn: (value: T) => Option<U>): Option<U> {
            return fn(value);
        },
        or(_other: Option<T>): Option<T> {
            return some;
        },
        orElse(_fn: () => Option<T>): Option<T> {
            return some;
        },
        xor(other: Option<T>): Option<T> {
            assertOption(other);
            return other.isSome() ? None : some;
        },

        inspect(fn: (value: T) => void): Option<T> {
            fn(value);
            return some;
        },

        eq(other: Option<T>): boolean {
            assertOption(other);
            return other.isSome() && other.unwrap() === value;
        },

        toString(): string {
            return `Some(${ value })`;
        },
    } as const;

    return some;
}

/**
 * A constant representing the `None` case of an `Option`, indicating the absence of a value.
 * This constant is frozen to ensure it is immutable and cannot be altered, preserving the integrity of `None` throughout the application.
 */
export const None = Object.freeze<None>({
    [Symbol.toStringTag]: 'Option',
    [OptionKindSymbol]: 'None',

    isSome(): false {
        return false;
    },
    isNone(): true {
        return true;
    },
    isSomeAnd(_predicate: (value: never) => boolean): false {
        return false;
    },

    expect(msg: string): never {
        throw new TypeError(msg);
    },
    unwrap(): never {
        throw new TypeError('Called `Option::unwrap()` on a `None` value');
    },
    unwrapOr<T>(defaultValue: T): T {
        return defaultValue;
    },
    unwrapOrElse<T>(fn: () => T): T {
        return fn();
    },

    okOr<E>(error: E): Result<never, E> {
        return Err(error);
    },
    okOrElse<E>(err: () => E): Result<never, E> {
        return Err(err());
    },
    transpose(): Result<None, never> {
        return Ok(None);
    },

    filter(_predicate: (value: never) => boolean): None {
        return None;
    },
    flatten(): None {
        return None;
    },
    map<U>(_fn: (value: never) => U): None {
        return None;
    },

    mapOr<U>(defaultValue: U, _fn: (value: never) => U): U {
        return defaultValue;
    },
    mapOrElse<U>(defaultFn: () => U, _fn: (value: never) => U): U {
        return defaultFn();
    },

    zip<U>(_other: Option<U>): None {
        return None;
    },
    zipWith<U, R>(_other: Option<U>, _fn: (value: never, otherValue: U) => R): None {
        return None;
    },
    unzip(): [None, None] {
        return [None, None];
    },

    and<U>(_other: Option<U>): None {
        return None;
    },
    andThen<U>(_fn: (value: never) => Option<U>): None {
        return None;
    },
    or<T>(other: Option<T>): Option<T> {
        assertOption(other);
        return other;
    },
    orElse<T>(fn: () => Option<T>): Option<T> {
        return fn();
    },
    xor<T>(other: Option<T>): Option<T> {
        assertOption(other);
        return other.isSome() ? other : None;
    },

    inspect(_fn: (value: never) => void): None {
        return None;
    },

    eq<T>(other: Option<T>): boolean {
        assertOption(other);
        return other === None;
    },

    toString(): string {
        return 'None';
    },
}) as None;

/**
 * Creates a `Result<T, E>` representing a successful outcome containing a value.
 * This function is used to construct a `Result` that signifies the operation was successful by containing the value `T`.
 *
 * @typeParam T - The type of the value to be contained in the `Ok` result.
 * @typeParam E - The type of the error that the result could potentially contain (not used in this case).
 * @param value - The value to wrap as an `Ok` result.
 * @returns A `Result<T, E>` that contains the provided value, representing the `Ok` case.
 *
 * @example
 * ```ts
 * const goodResult = Ok<number, Error>(1); // Result<number, Error> with a value
 * if (goodResult.isOk()) {
 *   console.log(goodResult.unwrap()); // Outputs: 1
 * }
 * ```
 */
export function Ok<T, E>(value: T): Result<T, E>;
/**
 * Because javascript does not have a `()` type, use `void` instead.
 */
export function Ok<E>(): Result<void, E>;
export function Ok<T, E>(value?: T): Result<T, E> {
    const ok: Result<T, E> = {
        [Symbol.toStringTag]: 'Result',
        [ResultKindSymbol]: 'Ok',

        isOk(): true {
            return true;
        },
        isErr(): false {
            return false;
        },
        isOkAnd(predicate: (value: T) => boolean): boolean {
            return predicate(value as T);
        },
        isErrAnd(_predicate: (error: E) => boolean): false {
            return false;
        },

        expect(_msg: string): T {
            return value as T;
        },
        unwrap(): T {
            return value as T;
        },
        unwrapOr(_defaultValue: T): T {
            return value as T;
        },
        unwrapOrElse(_fn: (error: E) => T): T {
            return value as T;
        },

        expectErr(msg: string): E {
            throw new TypeError(`${ msg }: ${ value }`);
        },
        unwrapErr(): E {
            throw new TypeError('Called `Result::unwrapErr()` on an `Ok` value');
        },

        ok(): Option<T> {
            return Some(value as T);
        },
        err(): None {
            return None;
        },
        transpose<T>(): Option<Result<T, E>> {
            const o = value as Option<T>;
            assertOption(o);
            return o.isSome() ? Some(Ok(o.unwrap())) : None;
        },

        map<U>(fn: (value: T) => U): Result<U, E> {
            return Ok(fn(value as T));
        },
        mapErr<F>(_fn: (error: E) => F): Result<T, F> {
            return Ok(value as T);
        },
        mapOr<U>(_defaultValue: U, fn: (value: T) => U): U {
            return fn(value as T);
        },
        mapOrElse<U>(_defaultFn: (error: E) => U, fn: (value: T) => U): U {
            return fn(value as T);
        },
        flatten<T>(): Result<T, E> {
            const r = value as Result<T, E>;
            assertResult(r);
            return r;
        },

        and<U>(other: Result<U, E>): Result<U, E> {
            assertResult(other);
            return other;
        },
        or<F>(_other: Result<T, F>): Result<T, F> {
            return ok as unknown as Result<T, F>;
        },
        andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
            return fn(value as T);
        },
        orElse<F>(_fn: (error: E) => Result<T, F>): Result<T, F> {
            return ok as unknown as Result<T, F>;
        },

        inspect(fn: (value: T) => void): Result<T, E> {
            fn(value as T);
            return ok;
        },
        inspectErr(_fn: (error: E) => void): Result<T, E> {
            return ok;
        },

        eq(other: Result<T, E>): boolean {
            assertResult(other);
            return other.isOk() && other.unwrap() === value;
        },

        asOk<F>(): Result<T, F> {
            return ok as unknown as Result<T, F>;
        },
        asErr(): never {
            throw new TypeError('Called `Result::asErr()` on an `Ok` value');
        },

        toString(): string {
            return `Ok(${ value })`;
        },
    } as const;

    return ok;
}

/**
 * Creates a `Result<T, E>` representing a failed outcome containing an error.
 * This function is used to construct a `Result` that signifies the operation failed by containing the error `E`.
 *
 * @typeParam T - The type of the value that the result could potentially contain (not used in this case).
 * @typeParam E - The type of the error to be wrapped in the `Err` result.
 * @param error - The error to wrap as an `Err` result.
 * @returns A `Result<T, E>` that contains the provided error, representing the `Err` case.
 *
 * @example
 * ```ts
 * const badResult = Err<number, Error>(new Error('Something went wrong'));
 * if (badResult.isErr()) {
 *   console.error(badResult.unwrapErr()); // Outputs: Error: Something went wrong
 * }
 * ```
 */
export function Err<T, E>(error: E): Result<T, E> {
    const err: Result<T, E> = {
        [Symbol.toStringTag]: 'Result',
        [ResultKindSymbol]: 'Err',

        isOk(): false {
            return false;
        },
        isErr(): true {
            return true;
        },
        isOkAnd(_predicate: (value: T) => boolean): false {
            return false;
        },
        isErrAnd(predicate: (error: E) => boolean): boolean {
            return predicate(error);
        },

        expect(msg: string): T {
            throw new TypeError(`${ msg }: ${ error }`);
        },
        unwrap(): T {
            throw new TypeError('Called `Result::unwrap()` on an `Err` value');
        },
        unwrapOr(defaultValue: T): T {
            return defaultValue;
        },
        unwrapOrElse(fn: (error: E) => T): T {
            return fn(error);
        },

        expectErr(_msg: string): E {
            return error;
        },
        unwrapErr(): E {
            return error;
        },

        ok(): None {
            return None;
        },
        err(): Option<E> {
            return Some(error);
        },
        transpose<T>(): Option<Result<T, E>> {
            return Some(err as unknown as Result<T, E>);
        },

        map<U>(_fn: (value: T) => U): Result<U, E> {
            return Err(error);
        },
        mapErr<F>(fn: (error: E) => F): Result<T, F> {
            return Err(fn(error));
        },
        mapOr<U>(defaultValue: U, _fn: (value: T) => U): U {
            return defaultValue;
        },
        mapOrElse<U>(defaultFn: (error: E) => U, _fn: (value: T) => U): U {
            return defaultFn(error);
        },
        flatten<T>(): Result<T, E> {
            return err as unknown as Result<T, E>;
        },

        and<U>(_other: Result<U, E>): Result<U, E> {
            return err as unknown as Result<U, E>;
        },
        or<F>(other: Result<T, F>): Result<T, F> {
            assertResult(other);
            return other;
        },
        andThen<U>(_fn: (value: T) => Result<U, E>): Result<U, E> {
            return err as unknown as Result<U, E>;
        },
        orElse<F>(fn: (error: E) => Result<T, F>): Result<T, F> {
            return fn(error);
        },

        inspect(_fn: (value: T) => void): Result<T, E> {
            return err;
        },
        inspectErr(fn: (error: E) => void): Result<T, E> {
            fn(error);
            return err;
        },

        eq(other: Result<T, E>): boolean {
            assertResult(other);
            return other.isErr() && other.unwrapErr() === error;
        },

        asOk(): never {
            throw new TypeError('Called `Result::asOk()` on an `Err` value');
        },
        asErr<U>(): Result<U, E> {
            return err as unknown as Result<U, E>;
        },

        toString(): string {
            return `Err(${ error })`;
        },
    } as const;

    return err;
}

/**
 * Asserts that a given value is an `Option`.
 *
 * @typeParam T - The expected type of the value contained within the `Option`.
 * @param o - The value to be checked as an `Option`.
 * @throws {TypeError} If the value is not an `Option`.
 */
function assertOption<T>(o: Option<T>): void {
    if (!isOption(o)) {
        throw new TypeError(`This(${ o }) is not an Option`);
    }
}

/**
 * Asserts that a given value is a `Result`.
 *
 * @typeParam T - The expected type of the success value contained within the `Result`.
 * @typeParam E - The expected type of the error value contained within the `Result`.
 * @param r - The value to be checked as a `Result`.
 * @throws {TypeError} If the value is not a `Result`.
 */
function assertResult<T, E>(r: Result<T, E>): void {
    if (!isResult(r)) {
        throw new TypeError(`This(${ r }) is not a Result`);
    }
}