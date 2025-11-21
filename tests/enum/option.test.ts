import { assert, assertThrows } from '@std/assert';
import { assertSpyCalls, spy } from '@std/testing/mock';
import { Err, None, Ok, Some, type Option } from 'happy-rusty';

Deno.test('Option:Some', async (t) => {
    const o = Some(10);

    await t.step('Stringify', () => {
        assert(Object.prototype.toString.call(o) === '[object Option]');
        assert(o.toString() === 'Some(10)');
        assert(`${ o }` === 'Some(10)');
    });

    await t.step('Querying the variant', async () => {
        assert(o.isSome());
        assert(!o.isNone());
        assert(o.isSomeAnd(v => v === 10));
        assert(!o.isSomeAnd(v => v === 20));

        assert(await o.isSomeAndAsync(async v => {
            return v === await Promise.resolve(10);
        }));
    });

    await t.step('Extracting the contained value', async () => {
        assert(o.expect('value is number 10') === 10);

        assert(o.unwrap() === 10);
        assert(o.unwrapOr(0) === 10);
        assert(o.unwrapOrElse(() => 0) === 10);

        assert(await o.unwrapOrElseAsync(async () => {
            return await Promise.resolve(0);
        }) === 10);
    });

    await t.step('Transforming contained values', () => {
        assert(o.okOr(new Error('value is number')).isOk());
        assert(o.okOrElse(() => new Error('value is number')).isOk());

        assert(Some(Ok(10)).transpose().isOk());
        assert(Some(Err(new Error())).transpose().isErr());

        assert(o.map((v) => v + 1).eq(Some(11)));
        assert(o.mapOr(0, (v) => v + 1) === 11);
        assert(o.mapOrElse(() => 0, (v) => v + 1) === 11);

        assert(o.filter((v) => v % 2 == 0).eq(Some(10)));
        assert(o.filter((v) => v % 2 == 1).eq(None));

        assert(Some(o).flatten().eq(o));

        const [a, b] = o.zip(Some('foo')).unzip();
        assert(a.eq(Some(10)));
        assert(b.eq(Some('foo')));
        assert(o.zip(None).eq(None));

        assertThrows(() => o.zip(null as unknown as Option<string>), TypeError);
        assertThrows(() => o.zip('foo' as unknown as Option<string>), TypeError);
        assertThrows(() => o.zip({} as unknown as Option<string>), TypeError);

        assertThrows((o as unknown as Option<[number, number]>).unzip, TypeError);

        const x = o.zipWith(Some(20), (value, otherValue) => value + otherValue);
        const y = o.zipWith(None as Option<number>, (value, otherValue) => value + otherValue);
        assert(x.eq(Some(30)));
        assert(y.eq(None));
    });

    await t.step('Boolean operators', async () => {
        assert(o.and(Some(20)).eq(Some(20)));
        assert(o.and(None).eq(None));
        assert(o.andThen(() => Some(20)).eq(Some(20)));

        assert(o.or(Some(20)).eq(Some(10)));
        assert(o.or(None).eq(Some(10)));
        assert(o.orElse(() => Some(20)).eq(Some(10)));

        assert(o.xor(Some(20)).eq(None));
        assert(o.xor(None).eq(Some(10)));

        assert((await (await o.andThenAsync(async () => {
            return Some(await Promise.resolve('0'));
        })).orElseAsync(async () => {
            return Some(await Promise.resolve('1'));
        })).eq(Some('0')));
    });

    await t.step('Inspect will be called', () => {
        const print = (value: number) => {
            console.log(`value is ${ value }`);
        };
        const printSpy = spy(print);

        o.inspect(printSpy);
        assertSpyCalls(printSpy, 1);
    });

    await t.step('Equals comparison', () => {
        assert(o.eq(Some(10)));
        assert(!o.eq(None));
    });
});

Deno.test('Option:None', async (t) => {
    // const o: Option<number> = None;
    const o = None;

    await t.step('Stringify', () => {
        assert(Object.prototype.toString.call(o) === '[object Option]');
        assert(o.toString() === 'None');
        assert(`${ o }` === 'None');
    });

    await t.step('Querying the variant', async () => {
        assert(!o.isSome());
        assert(o.isNone());
        assert(!o.isSomeAnd(v => v === 10));

        assert(!(await o.isSomeAndAsync(async v => {
            return v === await Promise.resolve(10);
        })));
    });

    await t.step('Extracting the contained value', async () => {
        assertThrows(() => o.expect('None has no value'), TypeError, 'None has no value');

        assertThrows(o.unwrap, TypeError);
        assert(o.unwrapOr(0) === 0);
        assert(o.unwrapOrElse(() => 0) === 0);

        assert(await o.unwrapOrElseAsync(async () => {
            return await Promise.resolve(0);
        }) === 0);
    });

    await t.step('Transforming contained values', () => {
        assert(o.okOr(new Error('None has no value')).unwrapErr().message === 'None has no value');
        assert(o.okOrElse(() => new Error('None has no value')).unwrapErr().message === 'None has no value');

        assert(None.transpose().eq(Ok(None)));

        assert(o.map((v) => v + 1).eq(None));
        assert(o.mapOr(0, (v) => v + 1) === 0);
        assert(o.mapOrElse(() => 0, (v) => v + 1) === 0);

        assert(o.filter((v) => v > 0).eq(None));

        assert(None.flatten().eq(None));

        const x = o.zip(Some('foo'));
        assert(x.eq(None));

        const [a, b] = x.unzip();
        assert(a.eq(None));
        assert(b.eq(None));

        const y = o.zipWith(Some(20), (value, otherValue) => value + otherValue);
        assert(y.eq(None));
    });

    await t.step('Boolean operators', async () => {
        assert(o.and(Some(20)).eq(None));
        assert(o.and(None).eq(None));
        assert(o.andThen(() => Some(20)).eq(None));

        assert(o.or(Some(20)).eq(Some(20)));
        assert(o.or(None).eq(None));
        assert(o.orElse(() => Some(20)).eq(Some(20)));

        assert(o.xor(Some(20)).eq(Some(20)));
        assert(o.xor(None).eq(None));

        assert((await (await o.andThenAsync(async () => {
            return Some(await Promise.resolve('0'));
        })).orElseAsync(async () => {
            return Some(await Promise.resolve('1'));
        })).eq(Some('1')));
    });

    await t.step('Inspect will not be called', () => {
        const print = (value: number) => {
            console.log(`value is ${ value }`);
        };
        const printSpy = spy(print);

        o.inspect(printSpy);
        assertSpyCalls(printSpy, 0);
    });

    await t.step('Equals comparison', () => {
        assert(!o.eq(Some(10)));
        assert(o.eq(None));
    });
});