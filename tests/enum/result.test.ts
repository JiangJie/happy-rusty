import { describe, expect, it, vi } from 'vitest';
import {
    Err,
    None,
    Ok,
    Some,
    promiseToAsyncResult,
    type Option,
    type Result,
} from '../../src/mod.ts';

describe('Result', () => {
    describe('Ok variant', () => {
        const ok: Result<number, Error> = Ok(1);

        describe('toString and type tag', () => {
            it('should have [object Result] as toStringTag', () => {
                expect(Object.prototype.toString.call(ok)).toBe('[object Result]');
            });

            it('should stringify as Ok(value)', () => {
                expect(ok.toString()).toBe('Ok(1)');
                expect(`${ ok }`).toBe('Ok(1)');
            });

            it('should stringify Ok() as Ok(undefined)', () => {
                expect(`${ Ok() }`).toBe('Ok(undefined)');
            });
        });

        describe('variant checking', () => {
            it('isOk() should return true', () => {
                expect(ok.isOk()).toBe(true);
            });

            it('isErr() should return false', () => {
                expect(ok.isErr()).toBe(false);
            });

            it('isOkAnd() should return true when predicate matches', () => {
                expect(ok.isOkAnd(x => x === 1)).toBe(true);
                expect(ok.isOkAnd(x => x === 2)).toBe(false);
            });

            it('isOkAndAsync() should work with async predicates', async () => {
                const result = await ok.isOkAndAsync(async x => {
                    return x === await Promise.resolve(1);
                });
                expect(result).toBe(true);
            });

            it('isErrAnd() should return false without calling predicate', () => {
                const fn = vi.fn(() => true);
                expect(ok.isErrAnd(fn)).toBe(false);
                expect(fn).not.toHaveBeenCalled();
            });

            it('isErrAndAsync() should return false', async () => {
                const result = await ok.isErrAndAsync(async err => {
                    return err.message === await Promise.resolve('lose');
                });
                expect(result).toBe(false);
            });
        });

        describe('extracting contained value', () => {
            it('expect() should return the value', () => {
                expect(ok.expect('should have value')).toBe(1);
            });

            it('expectErr() should throw with provided message', () => {
                expect(() => ok.expectErr('should have error')).toThrow('should have error');
            });

            it('unwrap() should return the value', () => {
                expect(ok.unwrap()).toBe(1);
            });

            it('unwrapErr() should throw TypeError', () => {
                expect(() => ok.unwrapErr()).toThrow(TypeError);
            });

            it('unwrapOr() should return the value, ignoring default', () => {
                expect(ok.unwrapOr(0)).toBe(1);
            });

            it('unwrapOrElse() should return the value, not calling fn', () => {
                const fn = vi.fn(() => 0);
                expect(ok.unwrapOrElse(fn)).toBe(1);
                expect(fn).not.toHaveBeenCalled();
            });

            it('unwrapOrElseAsync() should return the value', async () => {
                const result = await ok.unwrapOrElseAsync(async err => {
                    return err.message === await Promise.resolve('lose') ? 0 : -1;
                });
                expect(result).toBe(1);
            });
        });

        describe('transforming to Option', () => {
            it('ok() should return Some with the value', () => {
                expect(ok.ok().eq(Some(1))).toBe(true);
            });

            it('err() should return None', () => {
                expect(ok.err().eq(None)).toBe(true);
            });
        });

        describe('transpose', () => {
            it('should transpose Ok(Some(v)) to Some(Ok(v))', () => {
                const result = Ok(Some(1)).transpose();
                expect(result.isSome()).toBe(true);
                expect(result.unwrap().unwrap()).toBe(1);
            });

            it('should transpose Ok(None) to None', () => {
                expect(Ok(None).transpose().eq(None)).toBe(true);
            });
        });

        describe('mapping', () => {
            it('map() should transform the contained value', () => {
                expect(ok.map(v => v * 2).eq(Ok(2))).toBe(true);
            });

            it('mapErr() should return Ok without calling fn', () => {
                const fn = vi.fn((e: Error) => e.message);
                const result = ok.mapErr(fn);
                expect(result.unwrap()).toBe(1);
                expect(fn).not.toHaveBeenCalled();
            });

            it('mapOr() should apply fn to the value', () => {
                expect(ok.mapOr(0, v => v * 2)).toBe(2);
            });

            it('mapOrElse() should apply fn to the value', () => {
                expect(ok.mapOrElse(_err => 0, v => v * 2)).toBe(2);
            });

            it('flatten() should unwrap nested Result', () => {
                const nested = Ok<Result<number, Error>, Error>(ok);
                expect(nested.flatten()).toBe(ok);
            });
        });

        describe('boolean operators', () => {
            const other: Result<number, Error> = Ok(2);
            const otherErr: Result<number, Error> = Err(new Error());

            it('and() should return other', () => {
                expect(ok.and(other)).toBe(other);
                expect(ok.and(otherErr)).toBe(otherErr);
            });

            it('or() should return self', () => {
                expect(ok.or(other)).toBe(ok);
                expect(ok.or(otherErr)).toBe(ok);
            });

            it('andThen() should call fn and return its result', () => {
                expect(ok.andThen(x => Ok(x + 10)).eq(Ok(11))).toBe(true);
            });

            it('andThenAsync() should work with async fn', async () => {
                const result = await ok.andThenAsync(async x => {
                    return Ok(String(x + await Promise.resolve(10)));
                });
                expect(result.eq(Ok('11'))).toBe(true);
            });

            it('orElse() should return self, not calling fn', () => {
                const fn = vi.fn(() => other);
                expect(ok.orElse(fn)).toBe(ok);
                expect(fn).not.toHaveBeenCalled();
            });

            it('orElseAsync() should return self', async () => {
                const result = await ok.orElseAsync(async x => {
                    return Err(x.message + await Promise.resolve(10));
                });
                expect(result).toBe(ok.asOk());
            });
        });

        describe('inspect', () => {
            it('inspect() should call fn with the contained value', () => {
                const fn = vi.fn((value: number) => {
                    console.log(`value is ${ value }`);
                });
                ok.inspect(fn);
                expect(fn).toHaveBeenCalledTimes(1);
                expect(fn).toHaveBeenCalledWith(1);
            });

            it('inspectErr() should not call fn', () => {
                const fn = vi.fn((error: Error) => {
                    console.log(`error is ${ error.message }`);
                });
                ok.inspectErr(fn);
                expect(fn).not.toHaveBeenCalled();
            });

            it('should return self for chaining', () => {
                expect(ok.inspect(() => {})).toBe(ok);
                expect(ok.inspectErr(() => {})).toBe(ok);
            });
        });

        describe('equality', () => {
            it('should equal another Ok with same value', () => {
                expect(ok.eq(Ok(1))).toBe(true);
            });

            it('should not equal Ok with different value', () => {
                expect(ok.eq(Ok(2))).toBe(false);
            });

            it('should not equal Err', () => {
                expect(ok.eq(Err(new Error()))).toBe(false);
            });

            it('should throw TypeError for invalid Result', () => {
                expect(() => ok.eq(null as unknown as Result<number, Error>)).toThrow(TypeError);
                expect(() => ok.eq({} as unknown as Result<number, Error>)).toThrow(TypeError);
            });
        });

        describe('type casting', () => {
            it('asOk() should return self', () => {
                expect(ok.asOk()).toBe(ok);
            });

            it('asErr() should throw TypeError', () => {
                expect(() => ok.asErr()).toThrow(TypeError);
            });
        });
    });

    describe('Err variant', () => {
        const err: Result<number, Error> = Err(new Error('lose'));

        describe('toString and type tag', () => {
            it('should have [object Result] as toStringTag', () => {
                expect(Object.prototype.toString.call(err)).toBe('[object Result]');
            });

            it('should stringify as Err(error)', () => {
                expect(err.toString()).toBe('Err(Error: lose)');
                expect(`${ err }`).toBe('Err(Error: lose)');
            });
        });

        describe('variant checking', () => {
            it('isOk() should return false', () => {
                expect(err.isOk()).toBe(false);
            });

            it('isErr() should return true', () => {
                expect(err.isErr()).toBe(true);
            });

            it('isOkAnd() should return false without calling predicate', () => {
                const fn = vi.fn(() => true);
                expect(err.isOkAnd(fn)).toBe(false);
                expect(fn).not.toHaveBeenCalled();
            });

            it('isOkAndAsync() should return false', async () => {
                const result = await err.isOkAndAsync(async x => {
                    return x === await Promise.resolve(1);
                });
                expect(result).toBe(false);
            });

            it('isErrAnd() should return true when predicate matches', () => {
                expect(err.isErrAnd(e => e.message === 'lose')).toBe(true);
            });

            it('isErrAndAsync() should work with async predicates', async () => {
                const result = await err.isErrAndAsync(async e => {
                    return e.message === await Promise.resolve('lose');
                });
                expect(result).toBe(true);
            });
        });

        describe('extracting contained value', () => {
            it('expect() should throw with provided message', () => {
                expect(() => err.expect('should have value')).toThrow('should have value');
            });

            it('expectErr() should return the error', () => {
                expect(err.expectErr('error').message).toBe('lose');
            });

            it('unwrap() should throw Error', () => {
                expect(() => err.unwrap()).toThrow(Error);
            });

            it('unwrapErr() should return the error', () => {
                expect(err.unwrapErr().message).toBe('lose');
            });

            it('unwrapOr() should return the default value', () => {
                expect(err.unwrapOr(0)).toBe(0);
            });

            it('unwrapOrElse() should call fn with error and return result', () => {
                expect(err.unwrapOrElse(e => e.message.length)).toBe(4);
            });

            it('unwrapOrElseAsync() should return async fn result', async () => {
                const result = await err.unwrapOrElseAsync(async e => {
                    return e.message === await Promise.resolve('lose') ? 0 : -1;
                });
                expect(result).toBe(0);
            });
        });

        describe('transforming to Option', () => {
            it('ok() should return None', () => {
                expect(err.ok().eq(None)).toBe(true);
            });

            it('err() should return Some with the error', () => {
                expect(err.err().unwrap().message).toBe('lose');
            });
        });

        describe('transpose', () => {
            it('should transpose Err to Some(Err)', () => {
                const result = Err<Option<number>, Error>(err.unwrapErr()).transpose();
                expect(result.isSome()).toBe(true);
                expect(result.unwrap().unwrapErr()).toBe(err.unwrapErr());
            });
        });

        describe('mapping', () => {
            it('map() should return Err without calling fn', () => {
                const fn = vi.fn((v: number) => v * 2);
                expect(err.map(fn).eq(Err(err.unwrapErr()))).toBe(true);
                expect(fn).not.toHaveBeenCalled();
            });

            it('mapErr() should transform the contained error', () => {
                expect(err.mapErr(e => e.message).unwrapErr()).toBe('lose');
            });

            it('mapOr() should return default value', () => {
                expect(err.mapOr(0, v => v * 2)).toBe(0);
            });

            it('mapOrElse() should call defaultFn with error', () => {
                expect(err.mapOrElse(e => e.message.length, v => v * 2)).toBe(4);
            });

            it('flatten() should return self', () => {
                const nested = Err<Result<number, Error>, Error>(err.unwrapErr());
                expect(nested.flatten().eq(err)).toBe(true);
            });
        });

        describe('boolean operators', () => {
            const other: Result<number, Error> = Ok(2);
            const otherErr: Result<number, Error> = Err(new Error());

            it('and() should return self', () => {
                expect(err.and(other)).toBe(err);
                expect(err.and(otherErr)).toBe(err);
            });

            it('or() should return other', () => {
                expect(err.or(other)).toBe(other);
                expect(err.or(otherErr)).toBe(otherErr);
            });

            it('andThen() should return self, not calling fn', () => {
                const fn = vi.fn((x: number): Result<number, Error> => Ok(x + 10));
                expect(err.andThen(fn)).toBe(err);
                expect(fn).not.toHaveBeenCalled();
            });

            it('andThenAsync() should return self', async () => {
                const result = await err.andThenAsync(async x => {
                    return Ok(x + await Promise.resolve(10));
                });
                expect(result).toBe(err);
            });

            it('orElse() should call fn and return its result', () => {
                expect(err.orElse(_e => other)).toBe(other);
            });

            it('orElseAsync() should return async fn result', async () => {
                const result = await err.orElseAsync(async e => {
                    return Err(e.message + await Promise.resolve(10));
                });
                expect(result.eq(Err('lose10'))).toBe(true);
            });
        });

        describe('inspect', () => {
            it('inspect() should not call fn', () => {
                const fn = vi.fn((value: number) => {
                    console.log(`value is ${ value }`);
                });
                err.inspect(fn);
                expect(fn).not.toHaveBeenCalled();
            });

            it('inspectErr() should call fn with the contained error', () => {
                const fn = vi.fn((error: Error) => {
                    console.log(`error is ${ error.message }`);
                });
                err.inspectErr(fn);
                expect(fn).toHaveBeenCalledTimes(1);
                expect(fn).toHaveBeenCalledWith(err.unwrapErr());
            });

            it('should return self for chaining', () => {
                expect(err.inspect(() => {})).toBe(err);
                expect(err.inspectErr(() => {})).toBe(err);
            });
        });

        describe('equality', () => {
            it('should equal another Err with same error reference', () => {
                expect(err.eq(Err(err.unwrapErr()))).toBe(true);
            });

            it('should not equal Err with different error', () => {
                expect(err.eq(Err(new Error('other')))).toBe(false);
            });

            it('should not equal Ok', () => {
                expect(err.eq(Ok(1))).toBe(false);
            });
        });

        describe('type casting', () => {
            it('asOk() should throw TypeError', () => {
                expect(() => err.asOk()).toThrow(TypeError);
            });

            it('asErr() should return self', () => {
                expect(err.asErr()).toBe(err);
            });
        });
    });
});

describe('promiseToAsyncResult', () => {
    describe('converting resolved Promise', () => {
        it('should convert to Ok with the resolved value', async () => {
            const promise = Promise.resolve(42);
            const result = await promiseToAsyncResult(promise);
            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe(42);
        });

        it('should handle resolved Promise with complex value', async () => {
            const value = { name: 'test', count: 5 };
            const promise = Promise.resolve(value);
            const result = await promiseToAsyncResult(promise);
            expect(result.unwrap()).toBe(value);
        });

        it('should handle PromiseLike (thenable) objects', async () => {
            const thenable: PromiseLike<number> = {
                then<TResult1 = number>(
                    onfulfilled?: ((value: number) => TResult1 | PromiseLike<TResult1>) | null,
                ): PromiseLike<TResult1> {
                    if (onfulfilled) {
                        onfulfilled(100);
                    }
                    return this as PromiseLike<TResult1>;
                },
            };
            const result = await promiseToAsyncResult(thenable);
            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe(100);
        });
    });

    describe('converting rejected Promise', () => {
        it('should convert Error rejection to Err', async () => {
            const error = new Error('lose');
            const promise = Promise.reject(error);
            const result = await promiseToAsyncResult(promise);
            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr().message).toBe('lose');
        });

        it('should preserve non-Error rejection value as-is', async () => {
            const promise = Promise.reject('string error');
            const result = await promiseToAsyncResult<number, string>(promise);
            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toBe('string error');
        });

        it('should handle rejection with custom error type', async () => {
            interface ApiError {
                code: number;
                message: string;
            }
            const apiError: ApiError = { code: 404, message: 'Not found' };
            const promise = Promise.reject(apiError);
            const result = await promiseToAsyncResult<number, ApiError>(promise);
            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr().code).toBe(404);
            expect(result.unwrapErr().message).toBe('Not found');
        });
    });

    describe('function parameter form', () => {
        it('should handle function returning resolved Promise', async () => {
            const result = await promiseToAsyncResult(() => Promise.resolve(42));
            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe(42);
        });

        it('should handle function returning rejected Promise', async () => {
            const error = new Error('async error');
            const result = await promiseToAsyncResult(() => Promise.reject(error));
            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toBe(error);
        });

        it('should capture synchronous exceptions thrown before Promise creation', async () => {
            const result = await promiseToAsyncResult<number, Error>(() => {
                throw new Error('sync error');
            });
            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr().message).toBe('sync error');
        });

        it('should capture synchronous exceptions in async function', async () => {
            const result = await promiseToAsyncResult<number, Error>(async () => {
                JSON.parse('invalid json');  // Throws synchronously
                return 42;
            });
            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toBeInstanceOf(SyntaxError);
        });
    });

    describe('Immutability', () => {
        it('Ok should be frozen', () => {
            const ok = Ok(42);
            expect(Object.isFrozen(ok)).toBe(true);
        });

        it('Err should be frozen', () => {
            const err = Err('error');
            expect(Object.isFrozen(err)).toBe(true);
        });

        it('Ok should prevent property modification', () => {
            const ok = Ok(42);
            expect(() => {
                (ok as unknown as Record<string, unknown>)['isOk'] = () => false;
            }).toThrow(TypeError);
        });

        it('Err should prevent property modification', () => {
            const err = Err('error');
            expect(() => {
                (err as unknown as Record<string, unknown>)['isErr'] = () => false;
            }).toThrow(TypeError);
        });

        it('Ok should prevent adding new properties', () => {
            const ok = Ok(42);
            expect(() => {
                (ok as unknown as Record<string, unknown>)['newProp'] = 'test';
            }).toThrow(TypeError);
        });

        it('Err should prevent adding new properties', () => {
            const err = Err('error');
            expect(() => {
                (err as unknown as Record<string, unknown>)['newProp'] = 'test';
            }).toThrow(TypeError);
        });
    });
});
