import { describe, it, expect, vi } from 'vitest';
import { Err, None, Ok, Some, type Option } from '../../src/mod.ts';

describe('Option:Some', () => {
    const o = Some(10);

    it('Stringify', () => {
        expect(Object.prototype.toString.call(o)).toBe('[object Option]');
        expect(o.toString()).toBe('Some(10)');
        expect(`${ o }`).toBe('Some(10)');
    });

    it('Querying the variant', async () => {
        expect(o.isSome()).toBe(true);
        expect(o.isNone()).toBe(false);
        expect(o.isSomeAnd(v => v === 10)).toBe(true);
        expect(o.isSomeAnd(v => v === 20)).toBe(false);

        expect(await o.isSomeAndAsync(async v => {
            return v === await Promise.resolve(10);
        })).toBe(true);
    });

    it('Extracting the contained value', async () => {
        expect(o.expect('value is number 10')).toBe(10);

        expect(o.unwrap()).toBe(10);
        expect(o.unwrapOr(0)).toBe(10);
        expect(o.unwrapOrElse(() => 0)).toBe(10);

        expect(await o.unwrapOrElseAsync(async () => {
            return await Promise.resolve(0);
        })).toBe(10);
    });

    it('Transforming contained values', () => {
        expect(o.okOr(new Error('value is number')).isOk()).toBe(true);
        expect(o.okOrElse(() => new Error('value is number')).isOk()).toBe(true);

        expect(Some(Ok(10)).transpose().isOk()).toBe(true);
        expect(Some(Err(new Error())).transpose().isErr()).toBe(true);

        expect(o.map((v) => v + 1).eq(Some(11))).toBe(true);
        expect(o.mapOr(0, (v) => v + 1)).toBe(11);
        expect(o.mapOrElse(() => 0, (v) => v + 1)).toBe(11);

        expect(o.filter((v) => v % 2 == 0).eq(Some(10))).toBe(true);
        expect(o.filter((v) => v % 2 == 1).eq(None)).toBe(true);

        expect(Some(o).flatten().eq(o)).toBe(true);

        const [a, b] = o.zip(Some('foo')).unzip();
        expect(a.eq(Some(10))).toBe(true);
        expect(b.eq(Some('foo'))).toBe(true);
        expect(o.zip(None).eq(None)).toBe(true);

        expect(() => o.zip(null as unknown as Option<string>)).toThrow(TypeError);
        expect(() => o.zip('foo' as unknown as Option<string>)).toThrow(TypeError);
        expect(() => o.zip({} as unknown as Option<string>)).toThrow(TypeError);
        // Test assertOption with undefined (covers safeStringify undefined branch)
        expect(() => o.zip(undefined as unknown as Option<string>)).toThrow('Expected an Option, but received: undefined');
        // Test assertOption with proxy that throws on Symbol.toStringTag (covers safeStringify catch branch)
        const badProxy = new Proxy({}, {
            get(_target, prop) {
                if (prop === Symbol.toStringTag) {
                    throw new Error('Cannot get toStringTag');
                }
                return undefined;
            },
        });
        expect(() => o.zip(badProxy as unknown as Option<string>)).toThrow('Expected an Option, but received: [unable to stringify]');

        // Test unzip with non-tuple values
        expect(() => (o as unknown as Option<[number, number]>).unzip()).toThrow('Option::unzip() requires a 2-element tuple');
        expect(() => (Some([1]) as unknown as Option<[number, number]>).unzip()).toThrow('Option::unzip() requires a 2-element tuple');
        expect(() => (Some([1, 2, 3]) as unknown as Option<[number, number]>).unzip()).toThrow('Option::unzip() requires a 2-element tuple');

        const x = o.zipWith(Some(20), (value, otherValue) => value + otherValue);
        const y = o.zipWith(None as Option<number>, (value, otherValue) => value + otherValue);
        expect(x.eq(Some(30))).toBe(true);
        expect(y.eq(None)).toBe(true);
    });

    it('Boolean operators', async () => {
        expect(o.and(Some(20)).eq(Some(20))).toBe(true);
        expect(o.and(None).eq(None)).toBe(true);
        expect(o.andThen(() => Some(20)).eq(Some(20))).toBe(true);

        expect(o.or(Some(20)).eq(Some(10))).toBe(true);
        expect(o.or(None).eq(Some(10))).toBe(true);
        expect(o.orElse(() => Some(20)).eq(Some(10))).toBe(true);

        expect(o.xor(Some(20)).eq(None)).toBe(true);
        expect(o.xor(None).eq(Some(10))).toBe(true);

        expect((await (await o.andThenAsync(async () => {
            return Some(await Promise.resolve('0'));
        })).orElseAsync(async () => {
            return Some(await Promise.resolve('1'));
        })).eq(Some('0'))).toBe(true);
    });

    it('Inspect will be called', () => {
        const print = vi.fn((value: number) => {
            console.log(`value is ${ value }`);
        });

        o.inspect(print);
        expect(print).toHaveBeenCalledTimes(1);
    });

    it('Equals comparison', () => {
        expect(o.eq(Some(10))).toBe(true);
        expect(o.eq(None)).toBe(false);
    });
});

describe('Option:None', () => {
    const o = None;

    it('Stringify', () => {
        expect(Object.prototype.toString.call(o)).toBe('[object Option]');
        expect(o.toString()).toBe('None');
        expect(`${ o }`).toBe('None');
    });

    it('Querying the variant', async () => {
        expect(o.isSome()).toBe(false);
        expect(o.isNone()).toBe(true);
        expect(o.isSomeAnd(v => v === 10)).toBe(false);

        expect(await o.isSomeAndAsync(async v => {
            return v === await Promise.resolve(10);
        })).toBe(false);
    });

    it('Extracting the contained value', async () => {
        expect(() => o.expect('None has no value')).toThrow('None has no value');

        expect(() => o.unwrap()).toThrow(TypeError);
        expect(o.unwrapOr(0)).toBe(0);
        expect(o.unwrapOrElse(() => 0)).toBe(0);

        expect(await o.unwrapOrElseAsync(async () => {
            return await Promise.resolve(0);
        })).toBe(0);
    });

    it('Transforming contained values', () => {
        expect(o.okOr(new Error('None has no value')).unwrapErr().message).toBe('None has no value');
        expect(o.okOrElse(() => new Error('None has no value')).unwrapErr().message).toBe('None has no value');

        expect(None.transpose().eq(Ok(None))).toBe(true);

        expect(o.map((v) => v + 1).eq(None)).toBe(true);
        expect(o.mapOr(0, (v) => v + 1)).toBe(0);
        expect(o.mapOrElse(() => 0, (v) => v + 1)).toBe(0);

        expect(o.filter((v) => v > 0).eq(None)).toBe(true);

        expect(None.flatten().eq(None)).toBe(true);

        const x = o.zip(Some('foo'));
        expect(x.eq(None)).toBe(true);

        const [a, b] = x.unzip();
        expect(a.eq(None)).toBe(true);
        expect(b.eq(None)).toBe(true);

        const y = o.zipWith(Some(20), (value, otherValue) => value + otherValue);
        expect(y.eq(None)).toBe(true);
    });

    it('Boolean operators', async () => {
        expect(o.and(Some(20)).eq(None)).toBe(true);
        expect(o.and(None).eq(None)).toBe(true);
        expect(o.andThen(() => Some(20)).eq(None)).toBe(true);

        expect(o.or(Some(20)).eq(Some(20))).toBe(true);
        expect(o.or(None).eq(None)).toBe(true);
        expect(o.orElse(() => Some(20)).eq(Some(20))).toBe(true);

        expect(o.xor(Some(20)).eq(Some(20))).toBe(true);
        expect(o.xor(None).eq(None)).toBe(true);

        expect((await (await o.andThenAsync(async () => {
            return Some(await Promise.resolve('0'));
        })).orElseAsync(async () => {
            return Some(await Promise.resolve('1'));
        })).eq(Some('1'))).toBe(true);
    });

    it('Inspect will not be called', () => {
        const print = vi.fn((value: number) => {
            console.log(`value is ${ value }`);
        });

        o.inspect(print);
        expect(print).toHaveBeenCalledTimes(0);
    });

    it('Equals comparison', () => {
        expect(o.eq(Some(10))).toBe(false);
        expect(o.eq(None)).toBe(true);
    });
});
