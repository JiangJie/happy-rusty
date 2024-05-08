import type { Option } from './enum/option.ts';
import type { Result } from './enum/result.ts';

export { None, Some, type Option } from './enum/option.ts';
export { Err, Ok, type Result } from './enum/result.ts';

// export some commonly used types
export type AsyncOption<T> = Promise<Option<T>>;
export type AsyncResult<T, E> = Promise<Result<T, E>>;
export type IOResult<T> = Result<T, Error>;
export type AsyncIOResult<T> = Promise<IOResult<T>>;
