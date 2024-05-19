import type { Option } from './enum/option.ts';
import type { Result } from './enum/result.ts';

export { None, Some, promiseToOption, type Option } from './enum/option.ts';
export { Err, Ok, promiseToResult, type Result } from './enum/result.ts';

// export some commonly used types

/**
 * The shorthand of Promise<Option<T>>.
 */
export type AsyncOption<T> = Promise<Option<T>>;

/**
 * The shorthand of Promise<Result<T, E>>.
 */
export type AsyncResult<T, E> = Promise<Result<T, E>>;

/**
 * The shorthand of Result<T, Error>.
 */
export type IOResult<T> = Result<T, Error>;

/**
 * The shorthand of Promise<Result<T, Error>>.
 */
export type AsyncIOResult<T> = Promise<IOResult<T>>;
