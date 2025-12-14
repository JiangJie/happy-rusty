import { describe, it, expect, vi } from 'vitest';
import { type AsyncResult, Err, None, Ok, Some, promiseToAsyncResult, type Option, type Result } from '../../src/mod.ts';

describe('Result:Ok', () => {
    const r: Result<number, Error> = Ok(1);

    it('Stringify', () => {
        expect(Object.prototype.toString.call(r)).toBe('[object Result]');
        expect(r.toString()).toBe('Ok(1)');
        expect(`${ r }`).toBe('Ok(1)');
        expect(`${ Ok() }`).toBe('Ok(undefined)');
    });

    it('Querying the variant', async () => {
        expect(r.isOk()).toBe(true);
        expect(r.isErr()).toBe(false);
        expect(r.isOkAnd(x => x === 1)).toBe(true);
        expect(r.isErrAnd(_x => true)).toBe(false);

        expect(await r.isOkAndAsync(async x => {
            return x === await Promise.resolve(1);
        })).toBe(true);
        expect(await r.isErrAndAsync(async err => {
            return err.message === await Promise.resolve('lose');
        })).toBe(false);
    });

    it('Equals comparison', () => {
        expect(r.eq(Ok(r.unwrap()))).toBe(true);
        expect(() => r.eq(null as unknown as Result<number, Error>)).toThrow(TypeError);
        expect(() => r.eq({} as unknown as Result<number, Error>)).toThrow(TypeError);
    });

    it('Extracting the contained value', async () => {
        expect(r.expect('value should greater than 0')).toBe(1);
        expect(() => r.expectErr('value should greater than 0')).toThrow('value should greater than 0');

        expect(r.unwrap()).toBeGreaterThan(0);
        expect(() => r.unwrapErr()).toThrow(TypeError);
        expect(r.unwrapOr(0)).toBeGreaterThan(0);
        expect(r.unwrapOrElse((_err) => 0)).toBeGreaterThan(0);

        expect(await r.unwrapOrElseAsync(async err => {
            return err.message === await Promise.resolve('lose') ? 0 : -1;
        })).toBe(1);
    });

    it('Transforming contained values', () => {
        expect(r.ok().eq(Some(1))).toBe(true);
        expect(r.err().eq(None)).toBe(true);

        expect(Ok(Some(1)).transpose().unwrap().unwrap()).toBe(1);
        expect(Ok(None).transpose().eq(None)).toBe(true);

        expect(r.map(_v => 1).eq(Ok(1))).toBe(true);
        expect(r.mapErr(_err => 0).unwrap()).toBe(1);
        expect(r.mapOr(0, _v => 2)).toBe(2);
        expect(r.mapOrElse(_err => 0, _v => 2)).toBe(2);

        expect(Ok<Result<number, Error>, Error>(r).flatten()).toBe(r);
    });

    it('Boolean operators', async () => {
        const other: Result<number, Error> = Ok(2);
        const otherErr: Result<number, Error> = Err(new Error());

        expect(r.and(other)).toBe(other);
        expect(r.and(otherErr)).toBe(otherErr);

        expect(r.or(other)).toBe(r);
        expect(r.or(otherErr)).toBe(r);

        expect(r.andThen(x => Ok(x + 10)).eq(Ok(11))).toBe(true);
        expect(r.orElse(_x => other)).toBe(r);

        expect((await r.andThenAsync(async (x) => {
            return Ok(String(x + await Promise.resolve(10)));
        })).eq(Ok('11'))).toBe(true);

        expect(await r.orElseAsync(async (x): AsyncResult<number, string> => {
            return Err(x.message + await Promise.resolve(10));
        })).toBe(r.asOk());
    });

    it('Inspect will be called', () => {
        const print = vi.fn((value: number) => {
            console.log(`value is ${ value }`);
        });

        r.inspect(print);
        expect(print).toHaveBeenCalledTimes(1);

        const printErr = vi.fn((error: Error) => {
            console.log(`error is ${ error.message }`);
        });

        r.inspectErr(printErr);
        expect(printErr).toHaveBeenCalledTimes(0);
    });

    it('Convert type', () => {
        expect(r.asOk()).toBe(r);
        expect(() => r.asErr()).toThrow(TypeError);
    });
});

describe('Result:Err', () => {
    const r: Result<number, Error> = Err(new Error('lose'));

    it('Stringify', () => {
        expect(Object.prototype.toString.call(r)).toBe('[object Result]');
        expect(r.toString()).toBe('Err(Error: lose)');
        expect(`${ r }`).toBe('Err(Error: lose)');
    });

    it('Querying the variant', async () => {
        expect(r.isOk()).toBe(false);
        expect(r.isErr()).toBe(true);
        expect(r.isOkAnd(_x => true)).toBe(false);
        expect(r.isErrAnd(x => x.message == 'lose')).toBe(true);

        expect(await r.isOkAndAsync(async x => {
            return x === await Promise.resolve(1);
        })).toBe(false);
        expect(await r.isErrAndAsync(async err => {
            return err.message === await Promise.resolve('lose');
        })).toBe(true);
    });

    it('Equals comparison', () => {
        expect(r.eq(Err(r.unwrapErr()))).toBe(true);
    });

    it('Extracting the contained value', async () => {
        expect(() => r.expect('value should less than 1')).toThrow('value should less than 1');
        expect(r.expectErr('error').message).toBe('lose');

        expect(() => r.unwrap()).toThrow(Error);
        expect(r.unwrapErr().message).toBe('lose');
        expect(r.unwrapOr(0)).toBe(0);
        expect(r.unwrapOrElse((err) => err.message.length)).toBe(4);

        expect(Err<Result<number, Error>, Error>(r.unwrapErr()).flatten().eq(r)).toBe(true);

        expect(await r.unwrapOrElseAsync(async err => {
            return err.message === await Promise.resolve('lose') ? 0 : -1;
        })).toBe(0);
    });

    it('Transforming contained values', () => {
        expect(r.ok().eq(None)).toBe(true);
        expect(r.err().unwrap().message).toBe('lose');

        expect(Err<Option<number>, Error>(r.unwrapErr()).transpose().unwrap().unwrapErr()).toBe(r.unwrapErr());

        expect(r.map(_v => 1).eq(Err(r.unwrapErr()))).toBe(true);
        expect(r.mapErr(_err => 0).unwrapErr()).toBe(0);
        expect(r.mapOr(0, _v => 1)).toBe(0);
        expect(r.mapOrElse(_err => 0, _v => 1)).toBe(0);
    });

    it('Boolean operators', async () => {
        const other: Result<number, Error> = Ok(2);
        const otherErr: Result<number, Error> = Err(new Error());

        expect(r.and(other)).toBe(r);
        expect(r.and(otherErr)).toBe(r);

        expect(r.or(other)).toBe(other);
        expect(r.or(otherErr)).toBe(otherErr);

        expect(r.andThen(x => Ok(x + 10))).toBe(r);
        expect(r.orElse(_x => other)).toBe(other);

        expect(await r.andThenAsync(async (x): AsyncResult<number, Error> => {
            return Ok(x + await Promise.resolve(10));
        })).toBe(r);

        expect((await r.orElseAsync(async (x): AsyncResult<number, string> => {
            return Err(x.message + await Promise.resolve(10));
        })).eq(Err('lose10'))).toBe(true);
    });

    it('InspectErr will be called', () => {
        const print = vi.fn((value: number) => {
            console.log(`value is ${ value }`);
        });

        r.inspect(print);
        expect(print).toHaveBeenCalledTimes(0);

        const printErr = vi.fn((error: Error) => {
            console.log(`error is ${ error.message }`);
        });

        r.inspectErr(printErr);
        expect(printErr).toHaveBeenCalledTimes(1);
    });

    it('Convert type', () => {
        expect(() => r.asOk()).toThrow(TypeError);
        expect(r.asErr()).toBe(r);
    });
});

describe('Convert from Promise to Result', () => {
    it('Resolve will convert to Ok', async () => {
        const pOk = Promise.resolve(0);
        expect((await promiseToAsyncResult(pOk)).unwrap()).toBe(0);
    });

    it('Reject will convert to Err', async () => {
        const pErr = Promise.reject(new Error('lose'));
        expect((await promiseToAsyncResult(pErr)).unwrapErr().message).toBe('lose');
    });
});
