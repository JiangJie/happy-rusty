import type { Option, Result } from './enum/prelude.ts';

export { Err, None, Ok, promiseToResult, Some, type Option, type Result } from './enum/prelude.ts';

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
