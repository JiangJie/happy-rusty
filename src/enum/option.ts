/**
 * @fileoverview 仿rust的[Option](https://doc.rust-lang.org/core/option/index.html)枚举，
 * 用于替代null和undefined的使用。
 */

/**
 * option::Some type
 */
interface Some<T> {
    readonly kind: 'Some';
    readonly isSome: (this: Option<T>) => this is Some<T>;
    readonly isNone: (this: Option<T>) => this is None;
    readonly unwrap: () => T;
}

/**
 * option::None type
 */
interface None {
    readonly kind: 'None';
    readonly isSome: <T>(this: Option<T>) => this is Some<T>;
    readonly isNone: <T>(this: Option<T>) => this is None;
    readonly unwrap: () => never;
}

/**
 * option::Option type
 */
export type Option<T> = Some<T> | None;

/**
 * 创建一个`Some`对象
 *
 * # Examples
 *
 * ```
 * const v = Some(10);
 * console.assert(v.unwrap() === 10);
 * ```
 *
 * @param value 被包裹的值，不能为null和undefined
 * @returns {Some}
 */
export function Some<T>(value: T): Option<T> {
    if (value == null) {
        throw new Error('Some value can not be null or undefined');
    }

    return {
        kind: 'Some',
        isSome: () => true,
        isNone: () => false,
        unwrap: () => value,
    } as const;
}

/**
 * `None`值是固定的
 * @constant {None}
 */
export const None: None = {
    kind: 'None',
    isSome: () => false,
    isNone: () => true,
    unwrap: () => {
        throw new Error('None can not unwrap');
    },
} as const;