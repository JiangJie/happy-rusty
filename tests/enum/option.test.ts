import { assert, assertThrows } from '@std/assert';
import { assertSpyCalls, spy } from '@std/testing/mock';
import { Err, None, Ok, Some, type Option } from '../../src/mod.ts';

Deno.test('Option:Some', async (t) => {
    const o = Some<number>(10);

    await t.step('Some value can not be nullable', () => {
        assertThrows(() => Some(null as unknown as number), TypeError);
    });

    await t.step('Querying the variant', () => {
        assert(o.isSome());
        assert(!o.isNone());
        assert(o.isSomeAnd(v => v === 10));
        assert(!o.isSomeAnd(v => v === 20));
    });

    await t.step('Equals comparison', () => {
        assert(o.eq(Some<number>(10)));
        assert(!o.eq(None));
    });

    await t.step('Extracting the contained value', () => {
        assert(o.expect('value is number 10') === 10);

        assert(o.unwrap() === 10);
        assert(o.unwrapOr(0) === 10);
        assert(o.unwrapOrElse(() => 0) === 10);
    });

    await t.step('Transforming contained values', () => {
        assert(o.okOr(new Error('value is number')).isOk());
        assert(o.okOrElse(() => new Error('value is number')).isOk());

        assert(Some(Ok(10)).transpose().isOk());
        assert(Some(Err(new Error())).transpose().isErr());

        assert(o.map((v) => v + 1).eq(Some<number>(11)));
        assert(o.mapOr(0, (v) => v + 1).eq(Some<number>(11)));
        assert(o.mapOrElse(() => 0, (v) => v + 1).eq(Some<number>(11)));

        assert(o.filter((v) => v % 2 == 0).eq(Some<number>(10)));
        assert(o.filter((v) => v % 2 == 1).eq(None));

        assert(Some(o).flatten().eq(o));

        const [a, b] = o.zip(Some('foo')).unzip();
        assert(a.eq(Some<number>(10)));
        assert(b.eq(Some('foo')));
        assert(o.zip(None).eq(None));

        assertThrows(() => o.zip(null as unknown as Option<string>), TypeError);
        assertThrows(() => o.zip('foo' as unknown as Option<string>), TypeError);
        assertThrows(() => o.zip({} as unknown as Option<string>), TypeError);

        const x = o.zipWith(Some(20), (value, otherValue) => value + otherValue);
        const y = o.zipWith(None, (value, otherValue) => value + otherValue);
        assert(x.eq(Some<number>(30)));
        assert(y.eq(None));
    });

    await t.step('Boolean operators', () => {
        assert(o.and(Some(20)).eq(Some(20)));
        assert(o.and(None).eq(None));
        assert(o.andThen(() => Some(20)).eq(Some(20)));

        assert(o.or(Some<number>(20)).eq(Some<number>(10)));
        assert(o.or(None).eq(Some<number>(10)));
        assert(o.orElse(() => Some<number>(20)).eq(Some<number>(10)));

        assert(o.xor(Some<number>(20)).eq(None));
        assert(o.xor(None).eq(Some<number>(10)));
    });

    await t.step('Modifying an Option in-place', () => {
        assert(o.insert(20).eq(Some<number>(20)));
        assert(o.getOrInsert(20).eq(Some<number>(10)));
        assert(o.getOrInsertWith(() => 20).eq(Some<number>(10)));
    });

    await t.step('Inspect will be called', () => {
        const print = (value: number) => {
            console.log(`value is ${ value }`);
        };
        const printSpy = spy(print);

        o.inspect(printSpy);
        assertSpyCalls(printSpy, 1);
    });
});

Deno.test('Option:None', async (t) => {
    const o: Option<number> = None;

    await t.step('Querying the variant', () => {
        assert(!o.isSome());
        assert(o.isNone());
        assert(!o.isSomeAnd(v => v === 10));
    });

    await t.step('Equals comparison', () => {
        assert(!o.eq(Some<number>(10)));
        assert(o.eq(None));
    });

    await t.step('Extracting the contained value', () => {
        assertThrows(() => o.expect('None has no value'), TypeError, 'None has no value');

        assertThrows(o.unwrap, TypeError);
        assert(o.unwrapOr(0) === 0);
        assert(o.unwrapOrElse(() => 0) === 0);
    });

    await t.step('Transforming contained values', () => {
        assert(o.okOr(new Error('None has no value')).unwrapErr().message === 'None has no value');
        assert(o.okOrElse(() => new Error('None has no value')).unwrapErr().message === 'None has no value');

        assert(None.transpose().isOk());
        assert(None.transpose().unwrap().eq(None));

        assert(o.map((v) => v + 1).eq(None));
        assert(o.mapOr(0, (v) => v + 1).eq(Some<number>(0)));
        assert(o.mapOrElse(() => 0, (v) => v + 1).eq(Some<number>(0)));

        assert(o.filter((v) => v > 0).eq(None));

        assert(Some(o).flatten().eq(o));
        assert(None.flatten().eq(None));

        const x = o.zip(Some('foo'));
        assert(x.eq(None));

        const [a, b] = x.unzip();
        assert(a.eq(None));
        assert(b.eq(None));

        const y = o.zipWith(Some(20), (value, otherValue) => value + otherValue);
        assert(y.eq(None));
    });

    await t.step('Boolean operators', () => {
        assert(o.and(Some(20)).eq(None));
        assert(o.and(None).eq(None));
        assert(o.andThen(() => Some(20)).eq(None));

        assert(o.or(Some<number>(20)).eq(Some<number>(20)));
        assert(o.or(None).eq(None));
        assert(o.orElse(() => Some<number>(20)).eq(Some<number>(20)));

        assert(o.xor(Some<number>(20)).eq(Some<number>(20)));
        assert(o.xor(None).eq(None));
    });

    await t.step('Modifying an Option in-place', () => {
        assert(o.insert(20).eq(Some<number>(20)));
        assert(o.getOrInsert(20).eq(Some<number>(20)));
        assert(o.getOrInsertWith(() => 20).eq(Some<number>(20)));
    });

    await t.step('Inspect will not be called', () => {
        const print = (value: number) => {
            console.log(`value is ${ value }`);
        };
        const printSpy = spy(print);

        o.inspect(printSpy);
        assertSpyCalls(printSpy, 0);
    });
});