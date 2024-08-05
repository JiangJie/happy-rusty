/* eslint-disable @typescript-eslint/no-unused-vars */
import { assert, assertThrows } from "@std/assert";
import { assertSpyCalls, spy } from '@std/testing/mock';
import { Err, None, Ok, Some, promiseToAsyncResult, type Option, type Result } from '../../src/mod.ts';

Deno.test('Result:Ok', async (t) => {
    const r: Result<number, Error> = Ok(1);

    await t.step('Stringify', () => {
        assert(Object.prototype.toString.call(r) === '[object Result]');
        assert(r.toString() === 'Ok(1)');
        assert(`${ r }` === 'Ok(1)');
        assert(`${ Ok() }` === 'Ok(undefined)');
    });

    await t.step('Querying the variant', () => {
        assert(r.isOk());
        assert(!r.isErr());
        assert(r.isOkAnd(x => x === 1));
        assert(!r.isErrAnd(_x => true));
    });

    await t.step('Equals comparison', () => {
        assert(r.eq(Ok(r.unwrap())));
        assertThrows(() => r.eq(null as unknown as Result<number, Error>), TypeError);
        assertThrows(() => r.eq({} as unknown as Result<number, Error>), TypeError);
    });

    await t.step('Extracting the contained value', () => {
        assert(r.expect('value should greater than 0') === 1);
        assertThrows(() => r.expectErr('value should greater than 0'), TypeError, 'value should greater than 0');

        assert(r.unwrap() > 0);
        assertThrows(r.unwrapErr, TypeError);
        assert(r.unwrapOr(0) > 0);
        assert(r.unwrapOrElse((_err) => 0) > 0);
    });

    await t.step('Transforming contained values', () => {
        assert(r.ok().eq(Some(1)));
        assert(r.err().eq(None));

        assert(Ok(Some(1)).transpose().unwrap().unwrap() === 1);
        assert(Ok(None).transpose().eq(None));

        assert(r.map(_v => 1).eq(Ok(1)));
        assert(r.mapErr(_err => 0).unwrap() === 1);
        assert(r.mapOr(0, _v => 2) === 2);
        assert(r.mapOrElse(_err => 0, _v => 2) === 2);

        assert(Ok<Result<number, Error>, Error>(r).flatten() === r);
    });

    await t.step('Boolean operators', () => {
        const other: Result<number, Error> = Ok(2);
        const otherErr: Result<number, Error> = Err(new Error());

        assert(r.and(other) === other);
        assert(r.and(otherErr) === otherErr);

        assert(r.or(other) === r);
        assert(r.or(otherErr) === r);

        assert(r.andThen(x => Ok(x + 10)).eq(Ok(11)));
        assert(r.orElse(_x => other) === r);
    });

    await t.step('Inspect will be called', () => {
        const print = (value: number) => {
            console.log(`value is ${ value }`);
        };
        const printSpy = spy(print);

        r.inspect(printSpy);
        assertSpyCalls(printSpy, 1);

        const printErr = (error: Error) => {
            console.log(`error is ${ error.message }`);
        };
        const printErrSpy = spy(printErr);

        r.inspectErr(printErrSpy);
        assertSpyCalls(printErrSpy, 0);
    });

    await t.step('Convert type', () => {
        assert(r.asOk() === r);
        assertThrows(() => r.asErr(), TypeError);
    });
});

Deno.test('Result:Err', async (t) => {
    const r: Result<number, Error> = Err(new Error('lose'));

    await t.step('Stringify', () => {
        assert(Object.prototype.toString.call(r) === '[object Result]');
        console.log(r.toString());
        assert(r.toString() === 'Err(Error: lose)');
        assert(`${ r }` === 'Err(Error: lose)');
    });

    await t.step('Querying the variant', () => {
        assert(!r.isOk());
        assert(r.isErr());
        assert(!r.isOkAnd(_x => true));
        assert(r.isErrAnd(x => x.message == 'lose'));
    });

    await t.step('Equals comparison', () => {
        assert(r.eq(Err(r.unwrapErr())));
    });

    await t.step('Extracting the contained value', () => {
        assertThrows(() => r.expect('value should less than 1'), TypeError, 'value should less than 1');
        assert(r.expectErr('error').message === 'lose');

        assertThrows(r.unwrap, Error);
        assert(r.unwrapErr().message === 'lose');
        assert(r.unwrapOr(0) === 0);
        assert(r.unwrapOrElse((err) => err.message.length) === 4);

        assert(Err<Result<number, Error>, Error>(r.unwrapErr()).flatten().eq(r));
    });

    await t.step('Transforming contained values', () => {
        assert(r.ok().eq(None));
        assert(r.err().unwrap().message === 'lose');

        assert(Err<Option<number>, Error>(r.unwrapErr()).transpose().unwrap().unwrapErr() === r.unwrapErr());

        assert(r.map(_v => 1).eq(Err(r.unwrapErr())));
        assert(r.mapErr(_err => 0).unwrapErr() === 0);
        assert(r.mapOr(0, _v => 1) === 0);
        assert(r.mapOrElse(_err => 0, _v => 1) === 0);
    });

    await t.step('Boolean operators', () => {
        const other: Result<number, Error> = Ok(2);
        const otherErr: Result<number, Error> = Err(new Error());

        assert(r.and(other) === r);
        assert(r.and(otherErr) === r);

        assert(r.or(other) === other);
        assert(r.or(otherErr) === otherErr);

        assert(r.andThen(x => Ok(x + 10)) === r);
        assert(r.orElse(_x => other) === other);
    });

    await t.step('InspectErr will be called', () => {
        const print = (value: number) => {
            console.log(`value is ${ value }`);
        };
        const printSpy = spy(print);

        r.inspect(printSpy);
        assertSpyCalls(printSpy, 0);

        const printErr = (error: Error) => {
            console.log(`error is ${ error.message }`);
        };
        const printErrSpy = spy(printErr);

        r.inspectErr(printErrSpy);
        assertSpyCalls(printErrSpy, 1);
    });

    await t.step('Convert type', () => {
        assertThrows(() => r.asOk(), TypeError);
        assert(r.asErr() === r);
    });
});

Deno.test('Convert from Promise to Result', async (t) => {
    await t.step('Resolve will convert to Ok', async () => {
        const pOk = Promise.resolve(0);
        assert((await promiseToAsyncResult(pOk)).unwrap() === 0);
    });

    await t.step('Reject will convert to Err', async () => {
        const pErr = Promise.reject(new Error('lose'));
        assert((await promiseToAsyncResult(pErr)).unwrapErr().message === 'lose');
    });
});