/**
 * @fileoverview A Rust-inspired [Option](https://doc.rust-lang.org/core/option/index.html) enum, used as an alternative to the use of null and undefined.
 */

/**
 * option::Some type
 */
interface Some<T> {
    readonly kind: 'Some';
    readonly isSome: (this: Option<T>) => this is Some<T>;
    readonly isNone: (this: Option<T>) => this is None;
    readonly unwrap: () => T;
    readonly expect: (msg: string) => T;
}

/**
 * option::None type
 */
interface None {
    readonly kind: 'None';
    readonly isSome: <T>(this: Option<T>) => this is Some<T>;
    readonly isNone: <T>(this: Option<T>) => this is None;
    readonly unwrap: () => never;
    readonly expect: (msg: string) => never;
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
        unwrap: () => value,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expect: (_msg: string) => value,
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
    unwrap: () => {
        throw new TypeError('None can not unwrap');
    },
    expect: (msg: string) => {
        throw new TypeError(msg);
    },
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