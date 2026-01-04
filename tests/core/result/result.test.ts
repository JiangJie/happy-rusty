import { describe, expect, it, vi } from 'vitest';
import {
    Err,
    None,
    Ok,
    Some,
    tryAsyncOption,
    tryAsyncResult,
    tryOption,
    tryResult,
    type Option,
    type Result,
} from '../../../src/mod.ts';

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

            it('unwrapOrElseAsync() should work with sync return value', async () => {
                const result = await ok.unwrapOrElseAsync(() => 100);
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

            it('andTryAsync() should convert resolved value to Ok', async () => {
                const result = await ok.andTryAsync(async x => {
                    return x + await Promise.resolve(10);
                });
                expect(result.isOk()).toBe(true);
                expect(result.unwrap()).toBe(11);
            });

            it('andTryAsync() should convert rejection to Err', async () => {
                const result = await ok.andTryAsync(async () => {
                    throw new Error('async error');
                });
                expect(result.isErr()).toBe(true);
                expect(result.unwrapErr()).toBeInstanceOf(Error);
                expect((result.unwrapErr() as Error).message).toBe('async error');
            });

            it('andTryAsync() should convert sync throw to Err', async () => {
                const result = await ok.andTryAsync(() => {
                    throw new Error('sync error');
                });
                expect(result.isErr()).toBe(true);
                expect((result.unwrapErr() as Error).message).toBe('sync error');
            });

            it('andTryAsync() should work with sync return value', async () => {
                const result = await ok.andTryAsync(x => x * 2);
                expect(result.isOk()).toBe(true);
                expect(result.unwrap()).toBe(2);
            });

            it('andTryAsync() should flatten nested Promise (Awaited<U>)', async () => {
                // When fn returns Promise<Promise<number>>, Promise.resolve() flattens it
                // So result is Ok<number>, not Ok<Promise<number>>
                const { promise, resolve } = Promise.withResolvers<Promise<number>>();
                resolve(Promise.resolve(42));
                const result = await ok.andTryAsync(() => promise);

                expect(result.isOk()).toBe(true);
                // Runtime: Promise.resolve(Promise.resolve(42)) flattens to 42
                expect(result.unwrap()).toBe(42);
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

            it('orTryAsync() should return self without calling fn', async () => {
                const fn = vi.fn(async (e: Error) => e.message.length);
                const result = await ok.orTryAsync(fn);
                expect(result.unwrap()).toBe(1);
                expect(fn).not.toHaveBeenCalled();
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

        describe('infallible extraction', () => {
            it('intoOk() should return the contained value for Result<T, never>', () => {
                const infallible = Ok('success');
                const value = infallible.intoOk();
                expect(value).toBe('success');
            });

            it('intoErr() should throw TypeError on Ok', () => {
                expect(() => (ok as unknown as Result<never, string>).intoErr()).toThrow(TypeError);
            });
        });

        describe('iterator', () => {
            it('should yield the contained value once', () => {
                const values: number[] = [];
                for (const v of ok) {
                    values.push(v);
                }
                expect(values).toEqual([1]);
            });

            it('should work with spread operator', () => {
                expect([...ok]).toEqual([1]);
                expect([...Ok('hello')]).toEqual(['hello']);
            });

            it('should work with Array.from', () => {
                expect(Array.from(ok)).toEqual([1]);
            });

            it('should be usable with destructuring', () => {
                const [first] = ok;
                expect(first).toBe(1);
            });

            it('should work with Ok()', () => {
                expect([...Ok()]).toEqual([undefined]);
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

            it('unwrapOrElseAsync() should flatten nested Promise (Awaited<T>)', async () => {
                // When T is Promise<number>, the callback returns Promise<Promise<number>>
                // But Promise.resolve() flattens it to Promise<number>, so we only need one await
                const errPromise: Result<Promise<number>, Error> = Err(new Error('test'));
                const result = await errPromise.unwrapOrElseAsync(() => Promise.resolve(Promise.resolve(42)));
                // Runtime: Promise.resolve(Promise.resolve(42)) flattens to Promise<42>
                // So result is 42, not Promise<42>
                expect(result).toBe(42);
            });

            it('unwrapOrElseAsync() should work with sync return value', async () => {
                const result = await err.unwrapOrElseAsync(() => 100);
                expect(result).toBe(100);
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

            it('andTryAsync() should return self without calling fn', async () => {
                const fn = vi.fn(async (x: number) => x * 2);
                const result = await err.andTryAsync(fn);
                expect(result).toBe(err);
                expect(fn).not.toHaveBeenCalled();
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

            it('orTryAsync() should convert resolved value to Ok', async () => {
                const result = await err.orTryAsync(async e => {
                    return e.message.length + await Promise.resolve(10);
                });
                expect(result.isOk()).toBe(true);
                expect(result.unwrap()).toBe(14); // 'lose'.length + 10
            });

            it('orTryAsync() should convert rejection to Err', async () => {
                const result = await err.orTryAsync(async () => {
                    throw new Error('recovery failed');
                });
                expect(result.isErr()).toBe(true);
                expect((result.unwrapErr() as Error).message).toBe('recovery failed');
            });

            it('orTryAsync() should convert sync throw to Err', async () => {
                const result = await err.orTryAsync(() => {
                    throw new Error('sync recovery error');
                });
                expect(result.isErr()).toBe(true);
                expect((result.unwrapErr() as Error).message).toBe('sync recovery error');
            });

            it('orTryAsync() should work with sync return value', async () => {
                const result = await err.orTryAsync(e => e.message.length);
                expect(result.isOk()).toBe(true);
                expect(result.unwrap()).toBe(4); // 'lose'.length
            });

            it('orTryAsync() should work with async fn', async () => {
                const result = await err.orTryAsync(async () => 42);
                expect(result.isOk()).toBe(true);
                expect(result.unwrap()).toBe(42);
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

        describe('infallible extraction', () => {
            it('intoErr() should return the contained error for Result<never, E>', () => {
                const infallible = Err('error');
                const error = infallible.intoErr();
                expect(error).toBe('error');
            });

            it('intoOk() should throw TypeError on Err', () => {
                expect(() => (err as unknown as Result<number, never>).intoOk()).toThrow(TypeError);
            });
        });

        describe('iterator', () => {
            it('should yield nothing', () => {
                const values: number[] = [];
                for (const v of err) {
                    values.push(v);
                }
                expect(values).toEqual([]);
            });

            it('should work with spread operator', () => {
                expect([...err]).toEqual([]);
            });

            it('should work with Array.from', () => {
                expect(Array.from(err)).toEqual([]);
            });
        });
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

describe('tryResult', () => {
    it('should return Ok when function succeeds', () => {
        const result = tryResult(() => 42);
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toBe(42);
    });

    it('should return Err when function throws', () => {
        const result = tryResult(() => {
            throw new Error('test error');
        });
        expect(result.isErr()).toBe(true);
        expect(result.unwrapErr()).toBeInstanceOf(Error);
        expect((result.unwrapErr() as Error).message).toBe('test error');
    });

    it('should capture JSON.parse errors', () => {
        const result = tryResult(() => JSON.parse('invalid json'));
        expect(result.isErr()).toBe(true);
        expect(result.unwrapErr()).toBeInstanceOf(SyntaxError);
    });

    it('should capture URL constructor errors', () => {
        const result = tryResult(() => new URL('not a valid url'));
        expect(result.isErr()).toBe(true);
        expect(result.unwrapErr()).toBeInstanceOf(TypeError);
    });

    it('should work with custom error type', () => {
        interface CustomError {
            code: number;
            message: string;
        }
        const result = tryResult<number, CustomError>(() => {
            throw { code: 500, message: 'Internal error' };
        });
        expect(result.isErr()).toBe(true);
        expect(result.unwrapErr().code).toBe(500);
    });

    it('should return Ok with complex objects', () => {
        const result = tryResult(() => ({ name: 'test', value: 123 }));
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toEqual({ name: 'test', value: 123 });
    });

    // Tests for argument passing (like Promise.try)
    it('should pass arguments to the function', () => {
        const result = tryResult(JSON.parse, '{"a":1}');
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toEqual({ a: 1 });
    });

    it('should pass multiple arguments to the function', () => {
        const add = (a: number, b: number, c: number) => a + b + c;
        const result = tryResult(add, 1, 2, 3);
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toBe(6);
    });

    it('should capture errors when passing arguments', () => {
        const result = tryResult(JSON.parse, 'invalid json');
        expect(result.isErr()).toBe(true);
        expect(result.unwrapErr()).toBeInstanceOf(SyntaxError);
    });

    it('should work with decodeURIComponent and arguments', () => {
        const result = tryResult(decodeURIComponent, '%E4%B8%AD%E6%96%87');
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toBe('中文');
    });

    it('should capture decodeURIComponent errors with arguments', () => {
        const result: Result<string, URIError> = tryResult(decodeURIComponent, '%');
        expect(result.isErr()).toBe(true);
        expect(result.unwrapErr()).toBeInstanceOf(URIError);
    });
});

describe('tryOption', () => {
    it('should return Some when function succeeds', () => {
        const option = tryOption(() => 42);
        expect(option.isSome()).toBe(true);
        expect(option.unwrap()).toBe(42);
    });

    it('should return None when function throws', () => {
        const option = tryOption(() => {
            throw new Error('test error');
        });
        expect(option.isNone()).toBe(true);
    });

    it('should capture JSON.parse errors', () => {
        const option = tryOption(() => JSON.parse('invalid json'));
        expect(option.isNone()).toBe(true);
    });

    it('should capture URL constructor errors', () => {
        const option = tryOption(() => new URL('not a valid url'));
        expect(option.isNone()).toBe(true);
    });

    it('should return Some with null value (not treat as failure)', () => {
        const option = tryOption(() => null);
        expect(option.isSome()).toBe(true);
        expect(option.unwrap()).toBe(null);
    });

    it('should return Some with undefined value (not treat as failure)', () => {
        const option = tryOption(() => undefined);
        expect(option.isSome()).toBe(true);
        expect(option.unwrap()).toBe(undefined);
    });

    it('should return Some for falsy values', () => {
        expect(tryOption(() => 0).unwrap()).toBe(0);
        expect(tryOption(() => '').unwrap()).toBe('');
        expect(tryOption(() => false).unwrap()).toBe(false);
    });

    it('should return Some with complex objects', () => {
        const option = tryOption(() => ({ name: 'test', value: 123 }));
        expect(option.isSome()).toBe(true);
        expect(option.unwrap()).toEqual({ name: 'test', value: 123 });
    });

    // Tests for argument passing (like Promise.try)
    it('should pass arguments to the function', () => {
        const option = tryOption(JSON.parse, '{"a":1}');
        expect(option.isSome()).toBe(true);
        expect(option.unwrap()).toEqual({ a: 1 });
    });

    it('should pass multiple arguments to the function', () => {
        const add = (a: number, b: number) => a + b;
        const option = tryOption(add, 10, 20);
        expect(option.isSome()).toBe(true);
        expect(option.unwrap()).toBe(30);
    });

    it('should return None when function with arguments throws', () => {
        const option = tryOption(JSON.parse, 'invalid');
        expect(option.isNone()).toBe(true);
    });

    it('should work with decodeURIComponent and arguments', () => {
        const option = tryOption(decodeURIComponent, '%E4%B8%AD%E6%96%87');
        expect(option.isSome()).toBe(true);
        expect(option.unwrap()).toBe('中文');
    });

    it('should return None for decodeURIComponent errors with arguments', () => {
        const option = tryOption(decodeURIComponent, '%');
        expect(option.isNone()).toBe(true);
    });
});

describe('tryAsyncResult', () => {
    it('should return Ok when promise resolves', async () => {
        const result = await tryAsyncResult(Promise.resolve(42));
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toBe(42);
    });

    it('should return Err when promise rejects', async () => {
        const error = new Error('async error');
        const result = await tryAsyncResult(Promise.reject(error));
        expect(result.isErr()).toBe(true);
        expect(result.unwrapErr()).toBe(error);
    });

    it('should handle function returning resolved Promise', async () => {
        const result = await tryAsyncResult(() => Promise.resolve('success'));
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toBe('success');
    });

    it('should handle function returning rejected Promise', async () => {
        const result = await tryAsyncResult(() => Promise.reject(new Error('rejected')));
        expect(result.isErr()).toBe(true);
        expect((result.unwrapErr() as Error).message).toBe('rejected');
    });

    it('should capture synchronous exceptions in function', async () => {
        const result = await tryAsyncResult<number, Error>(() => {
            throw new Error('sync throw');
        });
        expect(result.isErr()).toBe(true);
        expect(result.unwrapErr().message).toBe('sync throw');
    });

    it('should capture sync exceptions before promise creation', async () => {
        const result = await tryAsyncResult<number, Error>(() => {
            JSON.parse('invalid');  // Throws before returning promise
            return Promise.resolve(42);
        });
        expect(result.isErr()).toBe(true);
        expect(result.unwrapErr()).toBeInstanceOf(SyntaxError);
    });

    it('should work with async functions', async () => {
        const result = await tryAsyncResult(async () => {
            return 'async result';
        });
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toBe('async result');
    });

    it('should capture errors in async functions', async () => {
        const result = await tryAsyncResult<number, Error>(async () => {
            throw new Error('async throw');
        });
        expect(result.isErr()).toBe(true);
        expect(result.unwrapErr().message).toBe('async throw');
    });

    it('should work with PromiseLike objects', async () => {
        const thenable: PromiseLike<number> = {
            then<TResult1 = number, TResult2 = never>(
                onfulfilled?: ((value: number) => TResult1 | PromiseLike<TResult1>) | null,
            ): PromiseLike<TResult1 | TResult2> {
                return Promise.resolve(onfulfilled?.(42) as TResult1);
            },
        };
        const result = await tryAsyncResult(thenable);
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toBe(42);
    });

    // Tests for argument passing (like Promise.try)
    it('should pass arguments to the function', async () => {
        const asyncAdd = async (a: number, b: number) => a + b;
        const result = await tryAsyncResult(asyncAdd, 10, 20);
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toBe(30);
    });

    it('should capture errors when passing arguments', async () => {
        const asyncFail = async (msg: string) => {
            throw new Error(msg);
        };
        const result = await tryAsyncResult(asyncFail, 'test error');
        expect(result.isErr()).toBe(true);
        expect((result.unwrapErr() as Error).message).toBe('test error');
    });

    it('should work with fetch-like function and arguments', async () => {
        const mockFetch = async (url: string, options: { method: string; }) => {
            return { url, method: options.method };
        };
        const result = await tryAsyncResult(mockFetch, '/api/data', { method: 'POST' });
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toEqual({ url: '/api/data', method: 'POST' });
    });

    // Tests for sync return value support (like Promise.try)
    it('should handle function returning sync value', async () => {
        const syncFn = (x: number) => x * 2;
        const result = await tryAsyncResult(syncFn, 21);
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toBe(42);
    });

    it('should handle function that conditionally returns sync or async', async () => {
        const cache = new Map<string, number>([['cached', 100]]);
        const getData = (key: string): number | Promise<number> => {
            const cached = cache.get(key);
            if (cached !== undefined) return cached;  // sync
            return Promise.resolve(200);              // async
        };

        const cachedResult = await tryAsyncResult(getData, 'cached');
        expect(cachedResult.unwrap()).toBe(100);

        const asyncResult = await tryAsyncResult(getData, 'not-cached');
        expect(asyncResult.unwrap()).toBe(200);
    });

    it('should flatten nested Promises (Awaited<T> behavior)', async () => {
        // When T is Promise<number>, the result should be Result<number, E>, not Result<Promise<number>, E>
        const nestedPromise = Promise.resolve(Promise.resolve(42));
        const result = await tryAsyncResult(nestedPromise);
        expect(result.isOk()).toBe(true);
        // Runtime: Promise.resolve() flattens nested Promises
        expect(result.unwrap()).toBe(42);
    });

    it('should flatten nested Promises from function return', async () => {
        const fn = async () => Promise.resolve(99);
        const result = await tryAsyncResult(fn);
        expect(result.unwrap()).toBe(99);
    });

    it('should flatten nested Promises using Promise.withResolvers', async () => {
        const { promise, resolve } = Promise.withResolvers<Promise<number>>();
        resolve(Promise.resolve(88));
        // tryAsyncResult should flatten: Promise<Promise<number>> -> Result<number, E>
        const result = await tryAsyncResult(promise);
        expect(result.unwrap()).toBe(88);
    });
});

describe('tryAsyncOption', () => {
    it('should return Some when promise resolves', async () => {
        const option = await tryAsyncOption(Promise.resolve(42));
        expect(option.isSome()).toBe(true);
        expect(option.unwrap()).toBe(42);
    });

    it('should return None when promise rejects', async () => {
        const option = await tryAsyncOption(Promise.reject(new Error('rejected')));
        expect(option.isNone()).toBe(true);
    });

    it('should return Some with null value (not treat as failure)', async () => {
        const option = await tryAsyncOption(Promise.resolve(null));
        expect(option.isSome()).toBe(true);
        expect(option.unwrap()).toBe(null);
    });

    it('should return Some with undefined value (not treat as failure)', async () => {
        const option = await tryAsyncOption(Promise.resolve(undefined));
        expect(option.isSome()).toBe(true);
        expect(option.unwrap()).toBe(undefined);
    });

    it('should return Some for falsy values', async () => {
        expect((await tryAsyncOption(Promise.resolve(0))).unwrap()).toBe(0);
        expect((await tryAsyncOption(Promise.resolve(''))).unwrap()).toBe('');
        expect((await tryAsyncOption(Promise.resolve(false))).unwrap()).toBe(false);
    });

    it('should handle function returning resolved promise', async () => {
        const option = await tryAsyncOption(() => Promise.resolve('result'));
        expect(option.isSome()).toBe(true);
        expect(option.unwrap()).toBe('result');
    });

    it('should handle function returning rejected promise', async () => {
        const option = await tryAsyncOption(() => Promise.reject(new Error('rejected')));
        expect(option.isNone()).toBe(true);
    });

    it('should capture synchronous exceptions in function', async () => {
        const option = await tryAsyncOption(() => {
            throw new Error('sync error');
        });
        expect(option.isNone()).toBe(true);
    });

    it('should capture sync exceptions before promise creation', async () => {
        const option = await tryAsyncOption(() => {
            JSON.parse('invalid');  // Throws before returning promise
            return Promise.resolve(42);
        });
        expect(option.isNone()).toBe(true);
    });

    it('should work with async functions', async () => {
        const option = await tryAsyncOption(async () => {
            return { id: 1, name: 'test' };
        });
        expect(option.isSome()).toBe(true);
        expect(option.unwrap()).toEqual({ id: 1, name: 'test' });
    });

    it('should return None when async function throws', async () => {
        const option = await tryAsyncOption(async () => {
            throw new Error('async error');
        });
        expect(option.isNone()).toBe(true);
    });

    it('should work with PromiseLike objects', async () => {
        const thenable: PromiseLike<string> = {
            then<TResult1 = string, TResult2 = never>(
                onfulfilled?: ((value: string) => TResult1 | PromiseLike<TResult1>) | null,
            ): PromiseLike<TResult1 | TResult2> {
                return Promise.resolve(onfulfilled?.('thenable result') as TResult1);
            },
        };
        const option = await tryAsyncOption(thenable);
        expect(option.isSome()).toBe(true);
        expect(option.unwrap()).toBe('thenable result');
    });

    // Tests for argument passing (like Promise.try)
    it('should pass arguments to the function', async () => {
        const asyncConcat = async (a: string, b: string) => a + b;
        const option = await tryAsyncOption(asyncConcat, 'hello', 'world');
        expect(option.isSome()).toBe(true);
        expect(option.unwrap()).toBe('helloworld');
    });

    it('should return None when function with arguments throws', async () => {
        const asyncFail = async (msg: string) => {
            throw new Error(msg);
        };
        const option = await tryAsyncOption(asyncFail, 'test error');
        expect(option.isNone()).toBe(true);
    });

    it('should work with fetch-like function and arguments', async () => {
        const mockFetch = async (url: string) => {
            return { url, status: 200 };
        };
        const option = await tryAsyncOption(mockFetch, '/api/data');
        expect(option.isSome()).toBe(true);
        expect(option.unwrap()).toEqual({ url: '/api/data', status: 200 });
    });

    // Tests for sync return value support (like Promise.try)
    it('should handle function returning sync value', async () => {
        const syncFn = (x: number) => x * 2;
        const option = await tryAsyncOption(syncFn, 21);
        expect(option.isSome()).toBe(true);
        expect(option.unwrap()).toBe(42);
    });

    it('should handle function that conditionally returns sync or async', async () => {
        const cache = new Map<string, string>([['cached', 'hit']]);
        const getData = (key: string): string | Promise<string> => {
            const cached = cache.get(key);
            if (cached !== undefined) return cached;  // sync
            return Promise.resolve('miss');           // async
        };

        const cachedOption = await tryAsyncOption(getData, 'cached');
        expect(cachedOption.unwrap()).toBe('hit');

        const asyncOption = await tryAsyncOption(getData, 'not-cached');
        expect(asyncOption.unwrap()).toBe('miss');
    });

    it('should flatten nested Promises (Awaited<T> behavior)', async () => {
        // When T is Promise<number>, the result should be Option<number>, not Option<Promise<number>>
        const nestedPromise = Promise.resolve(Promise.resolve(42));
        const option = await tryAsyncOption(nestedPromise);
        expect(option.isSome()).toBe(true);
        // Runtime: Promise.resolve() flattens nested Promises
        expect(option.unwrap()).toBe(42);
    });

    it('should flatten nested Promises from function return', async () => {
        const fn = async () => Promise.resolve(99);
        const option = await tryAsyncOption(fn);
        expect(option.unwrap()).toBe(99);
    });

    it('should flatten nested Promises using Promise.withResolvers', async () => {
        const { promise, resolve } = Promise.withResolvers<Promise<number>>();
        resolve(Promise.resolve(77));
        // tryAsyncOption should flatten: Promise<Promise<number>> -> Option<number>
        const option = await tryAsyncOption(promise);
        expect(option.unwrap()).toBe(77);
    });
});

describe('Awaited<T> type behavior', () => {
    describe('andThenAsync works with async functions', () => {
        it('Ok.andThenAsync should work with async fn returning Result', async () => {
            const ok: Result<number, string> = Ok(10);
            // fn returns Promise<Result<number, string>>, result should be Result<number, string>
            const result = await ok.andThenAsync(async (v) => Ok<number, string>(v * 2));
            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe(20);
        });

        it('Ok.andThenAsync should handle sync Result return', async () => {
            const ok = Ok(10);
            const result = await ok.andThenAsync((v) => Ok(v * 2));
            expect(result.unwrap()).toBe(20);
        });

        it('Err.andThenAsync should return Err without calling fn', async () => {
            const err = Err<number, string>('error');
            const fn = vi.fn(async () => Ok<number, string>(20));
            const result = await err.andThenAsync(fn);
            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toBe('error');
            expect(fn).not.toHaveBeenCalled();
        });
    });

    describe('orElseAsync works with async functions', () => {
        it('Err.orElseAsync should work with async fn returning Result', async () => {
            const err = Err<number, string>('error');
            // fn returns Promise<Result<number, number>>, result should be Result<number, number>
            const result = await err.orElseAsync(async (e) => Ok<number, number>(e.length));
            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe(5); // 'error'.length
        });

        it('Err.orElseAsync should handle sync Result return', async () => {
            const err = Err<number, string>('error');
            const result = await err.orElseAsync((e) => Ok<number, number>(e.length));
            expect(result.unwrap()).toBe(5);
        });

        it('Ok.orElseAsync should return self without calling fn', async () => {
            const ok = Ok<number, string>(10);
            const fn = vi.fn(async () => Ok<number, number>(20));
            const result = await ok.orElseAsync(fn);
            expect(result.unwrap()).toBe(10);
            expect(fn).not.toHaveBeenCalled();
        });
    });

    describe('unwrapOrElseAsync flattens nested Promises', () => {
        it('Err.unwrapOrElseAsync should flatten when fn returns Promise<T>', async () => {
            const err = Err<number, string>('error');
            const result = await err.unwrapOrElseAsync(async () => 42);
            expect(result).toBe(42);
        });

        it('Ok.unwrapOrElseAsync should return value without calling fn', async () => {
            const ok = Ok(10);
            const fn = vi.fn(async () => 20);
            const result = await ok.unwrapOrElseAsync(fn);
            expect(result).toBe(10);
            expect(fn).not.toHaveBeenCalled();
        });

        it('should correctly type Awaited<T> when T is Promise', async () => {
            // When Result contains Promise<number>, unwrapOrElseAsync returns number, not Promise<number>
            const okPromise: Result<Promise<number>, string> = Ok(Promise.resolve(99));
            const result = await okPromise.unwrapOrElseAsync(() => Promise.resolve(0));
            // Promise.resolve(Promise.resolve(99)) flattens to 99
            expect(result).toBe(99);
        });

        it('should flatten nested Promise using Promise.withResolvers', async () => {
            // Use Promise.withResolvers to create a Promise that resolves to another Promise
            const { promise, resolve } = Promise.withResolvers<Promise<number>>();
            resolve(Promise.resolve(42));

            // T is Promise<number>, so unwrapOrElseAsync expects (error: E) => PromiseLike<Promise<number>> | Promise<number>
            // and returns Promise<Awaited<Promise<number>>> = Promise<number>
            const err: Result<Promise<number>, string> = Err('error');
            // unwrapOrElseAsync should flatten: Promise<Promise<number>> -> number
            const result = await err.unwrapOrElseAsync(() => promise);
            expect(result).toBe(42);
        });
    });

    describe('andThenAsync does NOT flatten inner Result values', () => {
        it('andThenAsync should NOT flatten Promise inside Result', async () => {
            // T is Promise<number>, so andThenAsync can return Result<Promise<number>, string>
            const ok: Result<number, string> = Ok(10);
            // fn returns Ok(Promise<number>), the inner Promise is NOT awaited
            const { promise, resolve } = Promise.withResolvers<number>();
            resolve(20);

            const result = await ok.andThenAsync(async () => Ok(promise));
            // result is Result<Promise<number>, string>, NOT Result<number, string>
            // unwrap() returns Promise<number>, not 20
            const inner = result.unwrap();
            expect(inner).toBeInstanceOf(Promise);
            expect(await inner).toBe(20);
        });
    });

    describe('orElseAsync does NOT flatten inner Result values', () => {
        it('orElseAsync should NOT flatten Promise inside Result', async () => {
            // T is Promise<number>, so orElseAsync can return Result<Promise<number>, F>
            const err: Result<Promise<number>, string> = Err('error');
            // fn returns Ok(Promise<number>), the inner Promise is NOT awaited
            const { promise, resolve } = Promise.withResolvers<number>();
            resolve(42);

            const result = await err.orElseAsync(async () => Ok(promise));
            // result is Result<Promise<number>, number>, NOT Result<number, number>
            const inner = result.unwrap();
            expect(inner).toBeInstanceOf(Promise);
            expect(await inner).toBe(42);
        });
    });
});
