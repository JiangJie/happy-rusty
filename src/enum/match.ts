import type { Option, Result } from './core.ts';
import { OptionKindSymbol, ResultKindSymbol } from './symbols.ts';

/**
 * Pattern match for Option and Result types.
 * @param o - The option or result to match.
 * @param executor - The executor to execute.
 *
 * @example
 * ```ts
 * const r: Result<number, Error> = Ok(1);
 * match(r, {
 *     Ok: (v) => console.log(v),
 *     Err: (e) => console.error(e),
 *     _: () => console.error(1),
 * });
 * ```
 */
export function match<T>(o: Option<T>, executor: {
    Some: (v: T) => void;
    None: () => void;
} | {
    Some: (v: T) => void;
    _: () => void;
} | {
    None: () => void;
    _: () => void;
}): void;
export function match<T, E>(r: Result<T, E>, executor: {
    Ok: (v: T) => void;
    Err: (e: E) => void;
} | {
    Ok: (v: T) => void;
    _: () => void;
} | {
    Err: (e: E) => void;
    _: () => void;
}): void;
export function match<T, E>(input: Option<T> | Result<T, E>, executor: {
    Some?: (v: T) => void;
    None?: () => void;
    Ok?: (v: T) => void;
    Err?: (e: E) => void;
    _?: () => void;
}): void {
    if (OptionKindSymbol in input && input.isSome()) {
        executor.Some?.(input.unwrap());
    } else if (OptionKindSymbol in input && input.isNone()) {
        executor.None?.();
    } else if (ResultKindSymbol in input && input.isOk()) {
        executor.Ok?.(input.unwrap());
    } else if (ResultKindSymbol in input && input.isErr()) {
        executor.Err?.(input.unwrapErr());
    } else {
        executor._?.();
    }
}