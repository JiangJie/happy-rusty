/**
 * @fileoverview
 * Constructors and factory functions for creating `Option` and `Result` types.
 *
 * This module exports:
 * - `Some<T>(value)` - Creates an Option containing a value
 * - `None` - Constant representing absence of value
 * - `Ok<T, E>(value)` - Creates a successful Result
 * - `Err<T, E>(error)` - Creates a failed Result
 * - `None` interface - Type overrides for better type inference
 */
import type { AsyncOption, AsyncResult, Option, Result } from './core.ts';
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

    isSome(): false;
    isNone(): true;
    isSomeAnd(predicate: (value: never) => boolean): false;
    isSomeAndAsync(predicate: (value: never) => Promise<boolean>): Promise<false>;

    expect(msg: string): never;
    unwrap(): never;
    unwrapOr<T>(defaultValue: T): T;
    unwrapOrElse<T>(fn: () => T): T;
    unwrapOrElseAsync<T>(fn: () => Promise<T>): Promise<T>;

    okOr<E>(error: E): Result<never, E>;
    okOrElse<E>(err: () => E): Result<never, E>;
    transpose(): Result<None, never>;

    filter(predicate: (value: never) => boolean): None;
    flatten(): None;
    map<U>(fn: (value: never) => U): None;
    mapOr<U>(defaultValue: U, fn: (value: never) => U): U;
    mapOrElse<U>(defaultFn: () => U, fn: (value: never) => U): U;

    zip<U>(other: Option<U>): None;
    zipWith<U, R>(other: Option<U>, fn: (value: never, otherValue: U) => R): None;
    unzip(): [None, None];

    and<U>(other: Option<U>): None;
    andThen<U>(fn: (value: never) => Option<U>): None;
    andThenAsync<U>(fn: (value: never) => AsyncOption<U>): Promise<None>;
    or<T>(other: Option<T>): Option<T>;
    orElse<T>(fn: () => Option<T>): Option<T>;
    orElseAsync<T>(fn: () => AsyncOption<T>): AsyncOption<T>;
    xor<T>(other: Option<T>): Option<T>;

    inspect(fn: (value: never) => void): this;

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
        isSomeAndAsync(predicate: (value: T) => Promise<boolean>): Promise<boolean> {
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
        unwrapOrElseAsync(_fn: () => Promise<T>): Promise<T> {
            return Promise.resolve(value);
        },

        okOr<E>(_error: E): Result<T, E> {
            return Ok(value);
        },
        okOrElse<E>(_err: () => E): Result<T, E> {
            return Ok(value);
        },
        transpose<T, E>(): Result<Option<T>, E> {
            assertResult<T, E>(value);
            return value.isOk() ? Ok(Some(value.unwrap())) : Err(value.unwrapErr());
        },

        filter(predicate: (value: T) => boolean): Option<T> {
            return predicate(value) ? some : None;
        },
        flatten<T>(): Option<T> {
            assertOption<T>(value);
            return value;
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
            assertOption<U>(other);
            return other.isSome() ? Some([value, other.unwrap()]) : None;
        },
        zipWith<U, R>(other: Option<U>, fn: (value: T, otherValue: U) => R): Option<R> {
            assertOption<U>(other);
            return other.isSome() ? Some(fn(value, other.unwrap())) : None;
        },
        unzip<T, U>(): [Option<T>, Option<U>] {
            const tuple = value as unknown as [T, U];

            if (!Array.isArray(tuple) || tuple.length !== 2) {
                throw new TypeError(`Option::unzip() requires a 2-element tuple, received ${ Array.isArray(tuple) ? `array with ${ tuple.length } elements` : typeof tuple }.`);
            }

            const [a, b] = tuple;
            return [Some(a), Some(b)];
        },

        and<U>(other: Option<U>): Option<U> {
            assertOption<U>(other);
            return other;
        },
        andThen<U>(fn: (value: T) => Option<U>): Option<U> {
            return fn(value);
        },
        andThenAsync<U>(fn: (value: T) => AsyncOption<U>): AsyncOption<U> {
            return fn(value);
        },
        or(_other: Option<T>): Option<T> {
            return some;
        },
        orElse(_fn: () => Option<T>): Option<T> {
            return some;
        },
        orElseAsync(_fn: () => AsyncOption<T>): AsyncOption<T> {
            return Promise.resolve(some);
        },
        xor(other: Option<T>): Option<T> {
            assertOption<T>(other);
            return other.isSome() ? None : some;
        },

        inspect(fn: (value: T) => void): Option<T> {
            fn(value);
            return some;
        },

        eq(other: Option<T>): boolean {
            assertOption<T>(other);
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
 *
 * @example
 * ```ts
 * // Use None to represent absence of a value
 * function findUser(id: number): Option<User> {
 *     const user = users.find(u => u.id === id);
 *     return user ? Some(user) : None;
 * }
 *
 * // None is a singleton, so you can compare by reference
 * const result = findUser(999);
 * if (result === None) {
 *     console.log('User not found');
 * }
 *
 * // Use with Option methods
 * const name = None.unwrapOr('Anonymous'); // 'Anonymous'
 * ```
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
    isSomeAndAsync(_predicate: (value: never) => Promise<boolean>): Promise<false> {
        return Promise.resolve(false);
    },

    expect(msg: string): never {
        throw new TypeError(msg);
    },
    unwrap(): never {
        throw new TypeError('Option::unwrap() called on a `None` value.');
    },
    unwrapOr<T>(defaultValue: T): T {
        return defaultValue;
    },
    unwrapOrElse<T>(fn: () => T): T {
        return fn();
    },
    unwrapOrElseAsync<T>(fn: () => Promise<T>): Promise<T> {
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
    andThenAsync<U>(_fn: (value: never) => AsyncOption<U>): Promise<None> {
        return Promise.resolve(None);
    },
    or<T>(other: Option<T>): Option<T> {
        assertOption<T>(other);
        return other;
    },
    orElse<T>(fn: () => Option<T>): Option<T> {
        return fn();
    },
    orElseAsync<T>(fn: () => AsyncOption<T>): AsyncOption<T> {
        return fn();
    },
    xor<T>(other: Option<T>): Option<T> {
        assertOption<T>(other);
        return other.isSome() ? other : None;
    },

    inspect(_fn: (value: never) => void): None {
        return None;
    },

    eq<T>(other: Option<T>): boolean {
        assertOption<T>(other);
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
 * Creates a `Result<void, E>` representing a successful outcome with no value.
 * This overload is used when the operation succeeds but doesn't produce a meaningful value.
 *
 * In Rust, this would be `Ok(())` using the unit type `()`.
 * Since JavaScript doesn't have a unit type, we use `void` instead.
 *
 * @typeParam E - The type of the error that the result could potentially contain.
 * @returns A `Result<void, E>` representing a successful operation with no value.
 *
 * @example
 * ```ts
 * function saveToFile(path: string): Result<void, Error> {
 *     try {
 *         fs.writeFileSync(path, data);
 *         return Ok(); // Success with no return value
 *     } catch (e) {
 *         return Err(e as Error);
 *     }
 * }
 *
 * const result = saveToFile('/tmp/data.txt');
 * if (result.isOk()) {
 *     console.log('File saved successfully');
 * }
 * ```
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
        isOkAndAsync(predicate: (value: T) => Promise<boolean>): Promise<boolean> {
            return predicate(value as T);
        },
        isErrAnd(_predicate: (error: E) => boolean): false {
            return false;
        },
        isErrAndAsync(_predicate: (error: E) => Promise<boolean>): Promise<false> {
            return Promise.resolve(false);
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
        unwrapOrElseAsync(_fn: (error: E) => Promise<T>): Promise<T> {
            return Promise.resolve(value as T);
        },

        expectErr(msg: string): E {
            throw new TypeError(`${ msg }: ${ value }`);
        },
        unwrapErr(): E {
            throw new TypeError('Result::unwrapErr() called on an `Ok` value.');
        },

        ok(): Option<T> {
            return Some(value as T);
        },
        err(): None {
            return None;
        },
        transpose<T>(): Option<Result<T, E>> {
            assertOption<T>(value);
            return value.isSome() ? Some(Ok(value.unwrap())) : None;
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
            assertResult<T, E>(value);
            return value;
        },

        and<U>(other: Result<U, E>): Result<U, E> {
            assertResult<T, E>(other);
            return other;
        },
        or<F>(_other: Result<T, F>): Result<T, F> {
            return ok as unknown as Result<T, F>;
        },
        andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
            return fn(value as T);
        },
        andThenAsync<U>(fn: (value: T) => AsyncResult<U, E>): AsyncResult<U, E> {
            return fn(value as T);
        },
        orElse<F>(_fn: (error: E) => Result<T, F>): Result<T, F> {
            return ok as unknown as Result<T, F>;
        },
        orElseAsync<F>(_fn: (error: E) => AsyncResult<T, F>): AsyncResult<T, F> {
            return Promise.resolve(ok as unknown as Result<T, F>);
        },

        inspect(fn: (value: T) => void): Result<T, E> {
            fn(value as T);
            return ok;
        },
        inspectErr(_fn: (error: E) => void): Result<T, E> {
            return ok;
        },

        eq(other: Result<T, E>): boolean {
            assertResult<T, E>(other);
            return other.isOk() && other.unwrap() === value;
        },

        asOk<F>(): Result<T, F> {
            return ok as unknown as Result<T, F>;
        },
        asErr(): never {
            throw new TypeError('Result::asErr() called on an `Ok` value.');
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
        isOkAndAsync(_predicate: (value: T) => Promise<boolean>): Promise<boolean> {
            return Promise.resolve(false);
        },
        isErrAnd(predicate: (error: E) => boolean): boolean {
            return predicate(error);
        },
        isErrAndAsync(predicate: (error: E) => Promise<boolean>): Promise<boolean> {
            return predicate(error);
        },

        expect(msg: string): T {
            throw new TypeError(`${ msg }: ${ error }`);
        },
        unwrap(): T {
            throw new TypeError('Result::unwrap() called on an `Err` value.');
        },
        unwrapOr(defaultValue: T): T {
            return defaultValue;
        },
        unwrapOrElse(fn: (error: E) => T): T {
            return fn(error);
        },
        unwrapOrElseAsync(fn: (error: E) => Promise<T>): Promise<T> {
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
            assertResult<T, E>(other);
            return other;
        },
        andThen<U>(_fn: (value: T) => Result<U, E>): Result<U, E> {
            return err as unknown as Result<U, E>;
        },
        andThenAsync<U>(_fn: (value: T) => AsyncResult<U, E>): AsyncResult<U, E> {
            return Promise.resolve(err as unknown as Result<U, E>);
        },
        orElse<F>(fn: (error: E) => Result<T, F>): Result<T, F> {
            return fn(error);
        },
        orElseAsync<F>(fn: (error: E) => AsyncResult<T, F>): AsyncResult<T, F> {
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
            assertResult<T, E>(other);
            return other.isErr() && other.unwrapErr() === error;
        },

        asOk(): never {
            throw new TypeError('Result::asOk() called on an `Err` value.');
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
 * Safely converts a value to a string representation for error messages.
 * Handles cases where `toString()` might throw or values are null/undefined.
 *
 * @param value - The value to stringify.
 * @returns A safe string representation of the value.
 */
function safeStringify(value: unknown): string {
    try {
        if (value === null) {
            return 'null';
        }
        if (value === undefined) {
            return 'undefined';
        }
        if (typeof value === 'object') {
            return Object.prototype.toString.call(value);
        }
        return String(value);
    } catch {
        return '[unable to stringify]';
    }
}

/**
 * Asserts that a given value is an `Option`.
 *
 * @typeParam T - The expected type of the value contained within the `Option`.
 * @param o - The value to be checked as an `Option`.
 * @throws {TypeError} If the value is not an `Option`.
 * @see isOption
 */
function assertOption<T>(o: unknown): asserts o is Option<T> {
    if (!isOption(o)) {
        throw new TypeError(`Expected an Option, but received: ${ safeStringify(o) }.`);
    }
}

/**
 * Asserts that a given value is a `Result`.
 *
 * @typeParam T - The expected type of the success value contained within the `Result`.
 * @typeParam E - The expected type of the error value contained within the `Result`.
 * @param r - The value to be checked as a `Result`.
 * @throws {TypeError} If the value is not a `Result`.
 * @see isResult
 */
function assertResult<T, E>(r: unknown): asserts r is Result<T, E> {
    if (!isResult(r)) {
        throw new TypeError(`Expected a Result, but received: ${ safeStringify(r) }.`);
    }
}