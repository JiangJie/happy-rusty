import { describe, expect, it, vi } from 'vitest';
import { Err, None, Ok, Some, type Option } from '../../src/mod.ts';

describe('Option', () => {
    describe('Some variant', () => {
        const some = Some(10);

        describe('toString and type tag', () => {
            it('should have [object Option] as toStringTag', () => {
                expect(Object.prototype.toString.call(some)).toBe('[object Option]');
            });

            it('should stringify as Some(value)', () => {
                expect(some.toString()).toBe('Some(10)');
                expect(`${ some }`).toBe('Some(10)');
            });
        });

        describe('variant checking', () => {
            it('isSome() should return true', () => {
                expect(some.isSome()).toBe(true);
            });

            it('isNone() should return false', () => {
                expect(some.isNone()).toBe(false);
            });

            it('isSomeAnd() should return true when predicate matches', () => {
                expect(some.isSomeAnd(v => v === 10)).toBe(true);
                expect(some.isSomeAnd(v => v === 20)).toBe(false);
            });

            it('isSomeAndAsync() should work with async predicates', async () => {
                const result = await some.isSomeAndAsync(async v => {
                    return v === await Promise.resolve(10);
                });
                expect(result).toBe(true);
            });
        });

        describe('extracting contained value', () => {
            it('expect() should return the value', () => {
                expect(some.expect('value is number 10')).toBe(10);
            });

            it('unwrap() should return the value', () => {
                expect(some.unwrap()).toBe(10);
            });

            it('unwrapOr() should return the value, ignoring default', () => {
                expect(some.unwrapOr(0)).toBe(10);
            });

            it('unwrapOrElse() should return the value, not calling fn', () => {
                const fn = vi.fn(() => 0);
                expect(some.unwrapOrElse(fn)).toBe(10);
                expect(fn).not.toHaveBeenCalled();
            });

            it('unwrapOrElseAsync() should return the value', async () => {
                const result = await some.unwrapOrElseAsync(async () => {
                    return await Promise.resolve(0);
                });
                expect(result).toBe(10);
            });
        });

        describe('transforming to Result', () => {
            it('okOr() should return Ok with the value', () => {
                expect(some.okOr(new Error('error')).isOk()).toBe(true);
                expect(some.okOr(new Error('error')).unwrap()).toBe(10);
            });

            it('okOrElse() should return Ok with the value', () => {
                const fn = vi.fn(() => new Error('error'));
                expect(some.okOrElse(fn).isOk()).toBe(true);
                expect(fn).not.toHaveBeenCalled();
            });
        });

        describe('transpose', () => {
            it('should transpose Some(Ok(v)) to Ok(Some(v))', () => {
                const opt = Some(Ok(10));
                const result = opt.transpose();
                expect(result.isOk()).toBe(true);
                expect(result.unwrap().unwrap()).toBe(10);
            });

            it('should transpose Some(Err(e)) to Err(e)', () => {
                const opt = Some(Err(new Error('error')));
                const result = opt.transpose();
                expect(result.isErr()).toBe(true);
            });
        });

        describe('mapping and filtering', () => {
            it('map() should transform the contained value', () => {
                expect(some.map(v => v + 1).eq(Some(11))).toBe(true);
            });

            it('mapOr() should apply fn to the value', () => {
                expect(some.mapOr(0, v => v + 1)).toBe(11);
            });

            it('mapOrElse() should apply fn to the value', () => {
                expect(some.mapOrElse(() => 0, v => v + 1)).toBe(11);
            });

            it('filter() should return Some when predicate matches', () => {
                expect(some.filter(v => v % 2 === 0).eq(Some(10))).toBe(true);
            });

            it('filter() should return None when predicate fails', () => {
                expect(some.filter(v => v % 2 === 1).eq(None)).toBe(true);
            });

            it('flatten() should unwrap nested Option', () => {
                expect(Some(some).flatten().eq(some)).toBe(true);
            });
        });

        describe('zip operations', () => {
            it('zip() should combine two Some values into tuple', () => {
                const [a, b] = some.zip(Some('foo')).unzip();
                expect(a.eq(Some(10))).toBe(true);
                expect(b.eq(Some('foo'))).toBe(true);
            });

            it('zip() should return None if other is None', () => {
                expect(some.zip(None).eq(None)).toBe(true);
            });

            it('zipWith() should combine values using fn', () => {
                const result = some.zipWith(Some(20), (a, b) => a + b);
                expect(result.eq(Some(30))).toBe(true);
            });

            it('zipWith() should return None if other is None', () => {
                const result = some.zipWith(None as Option<number>, (a, b) => a + b);
                expect(result.eq(None)).toBe(true);
            });
        });

        describe('unzip validation', () => {
            it('should throw for non-tuple values', () => {
                expect(() => (some as unknown as Option<[number, number]>).unzip())
                    .toThrow('Option::unzip() requires a 2-element tuple');
            });

            it('should throw for array with wrong length', () => {
                expect(() => (Some([1]) as unknown as Option<[number, number]>).unzip())
                    .toThrow('Option::unzip() requires a 2-element tuple');
                expect(() => (Some([1, 2, 3]) as unknown as Option<[number, number]>).unzip())
                    .toThrow('Option::unzip() requires a 2-element tuple');
            });
        });

        describe('boolean operators', () => {
            it('and() should return other when self is Some', () => {
                expect(some.and(Some(20)).eq(Some(20))).toBe(true);
                expect(some.and(None).eq(None)).toBe(true);
            });

            it('andThen() should call fn and return its result', () => {
                expect(some.andThen(() => Some(20)).eq(Some(20))).toBe(true);
            });

            it('andThenAsync() should work with async fn', async () => {
                const result = await some.andThenAsync(async () => {
                    return Some(await Promise.resolve('0'));
                });
                expect(result.eq(Some('0'))).toBe(true);
            });

            it('or() should return self when self is Some', () => {
                expect(some.or(Some(20)).eq(Some(10))).toBe(true);
                expect(some.or(None).eq(Some(10))).toBe(true);
            });

            it('orElse() should return self, not calling fn', () => {
                const fn = vi.fn(() => Some(20));
                expect(some.orElse(fn).eq(Some(10))).toBe(true);
                expect(fn).not.toHaveBeenCalled();
            });

            it('orElseAsync() should return self', async () => {
                const result = await some.orElseAsync(async () => Some(20));
                expect(result.eq(Some(10))).toBe(true);
            });

            it('xor() should return None when both are Some', () => {
                expect(some.xor(Some(20)).eq(None)).toBe(true);
            });

            it('xor() should return Some when other is None', () => {
                expect(some.xor(None).eq(Some(10))).toBe(true);
            });
        });

        describe('inspect', () => {
            it('should call fn with the contained value', () => {
                const fn = vi.fn((value: number) => {
                    console.log(`value is ${ value }`);
                });
                some.inspect(fn);
                expect(fn).toHaveBeenCalledTimes(1);
                expect(fn).toHaveBeenCalledWith(10);
            });

            it('should return self for chaining', () => {
                expect(some.inspect(() => {}).eq(some)).toBe(true);
            });
        });

        describe('equality', () => {
            it('should equal another Some with same value', () => {
                expect(some.eq(Some(10))).toBe(true);
            });

            it('should not equal Some with different value', () => {
                expect(some.eq(Some(20))).toBe(false);
            });

            it('should not equal None', () => {
                expect(some.eq(None)).toBe(false);
            });
        });

        describe('type assertions', () => {
            it('should throw TypeError for invalid Option in zip', () => {
                expect(() => some.zip(null as unknown as Option<string>)).toThrow(TypeError);
                expect(() => some.zip('foo' as unknown as Option<string>)).toThrow(TypeError);
                expect(() => some.zip({} as unknown as Option<string>)).toThrow(TypeError);
            });

            it('should include value in error message for undefined', () => {
                expect(() => some.zip(undefined as unknown as Option<string>))
                    .toThrow('Expected an Option, but received: undefined');
            });

            it('should handle objects that throw on stringify', () => {
                const badProxy = new Proxy({}, {
                    get(_target, prop) {
                        if (prop === Symbol.toStringTag) {
                            throw new Error('Cannot get toStringTag');
                        }
                        return undefined;
                    },
                });
                expect(() => some.zip(badProxy as unknown as Option<string>))
                    .toThrow('Expected an Option, but received: [unable to stringify]');
            });
        });
    });

    describe('None variant', () => {
        const none = None;

        describe('toString and type tag', () => {
            it('should have [object Option] as toStringTag', () => {
                expect(Object.prototype.toString.call(none)).toBe('[object Option]');
            });

            it('should stringify as None', () => {
                expect(none.toString()).toBe('None');
                expect(`${ none }`).toBe('None');
            });
        });

        describe('variant checking', () => {
            it('isSome() should return false', () => {
                expect(none.isSome()).toBe(false);
            });

            it('isNone() should return true', () => {
                expect(none.isNone()).toBe(true);
            });

            it('isSomeAnd() should return false without calling predicate', () => {
                const fn = vi.fn(() => true);
                expect(none.isSomeAnd(fn)).toBe(false);
                expect(fn).not.toHaveBeenCalled();
            });

            it('isSomeAndAsync() should return false', async () => {
                const result = await none.isSomeAndAsync(async v => {
                    return v === await Promise.resolve(10);
                });
                expect(result).toBe(false);
            });
        });

        describe('extracting contained value', () => {
            it('expect() should throw with provided message', () => {
                expect(() => none.expect('None has no value')).toThrow('None has no value');
            });

            it('unwrap() should throw TypeError', () => {
                expect(() => none.unwrap()).toThrow(TypeError);
            });

            it('unwrapOr() should return the default value', () => {
                expect(none.unwrapOr(0)).toBe(0);
            });

            it('unwrapOrElse() should call and return fn result', () => {
                const fn = vi.fn(() => 42);
                expect(none.unwrapOrElse(fn)).toBe(42);
                expect(fn).toHaveBeenCalledTimes(1);
            });

            it('unwrapOrElseAsync() should return async fn result', async () => {
                const result = await none.unwrapOrElseAsync(async () => {
                    return await Promise.resolve(0);
                });
                expect(result).toBe(0);
            });
        });

        describe('transforming to Result', () => {
            it('okOr() should return Err with provided error', () => {
                const result = none.okOr(new Error('None has no value'));
                expect(result.isErr()).toBe(true);
                expect(result.unwrapErr().message).toBe('None has no value');
            });

            it('okOrElse() should call fn and return Err', () => {
                const fn = vi.fn(() => new Error('None has no value'));
                const result = none.okOrElse(fn);
                expect(result.isErr()).toBe(true);
                expect(fn).toHaveBeenCalledTimes(1);
            });
        });

        describe('transpose', () => {
            it('should transpose None to Ok(None)', () => {
                expect(None.transpose().eq(Ok(None))).toBe(true);
            });
        });

        describe('mapping and filtering', () => {
            it('map() should return None', () => {
                expect(none.map(v => v + 1).eq(None)).toBe(true);
            });

            it('mapOr() should return default value', () => {
                expect(none.mapOr(0, v => v + 1)).toBe(0);
            });

            it('mapOrElse() should call defaultFn', () => {
                const defaultFn = vi.fn(() => 0);
                expect(none.mapOrElse(defaultFn, v => v + 1)).toBe(0);
                expect(defaultFn).toHaveBeenCalledTimes(1);
            });

            it('filter() should return None', () => {
                expect(none.filter(v => v > 0).eq(None)).toBe(true);
            });

            it('flatten() should return None', () => {
                expect(None.flatten().eq(None)).toBe(true);
            });
        });

        describe('zip operations', () => {
            it('zip() should return None', () => {
                expect(none.zip(Some('foo')).eq(None)).toBe(true);
            });

            it('unzip() should return [None, None]', () => {
                const [a, b] = none.zip(Some('foo')).unzip();
                expect(a.eq(None)).toBe(true);
                expect(b.eq(None)).toBe(true);
            });

            it('zipWith() should return None', () => {
                const result = none.zipWith(Some(20), (a, b) => a + b);
                expect(result.eq(None)).toBe(true);
            });
        });

        describe('boolean operators', () => {
            it('and() should return None', () => {
                expect(none.and(Some(20)).eq(None)).toBe(true);
                expect(none.and(None).eq(None)).toBe(true);
            });

            it('andThen() should return None without calling fn', () => {
                const fn = vi.fn(() => Some(20));
                expect(none.andThen(fn).eq(None)).toBe(true);
                expect(fn).not.toHaveBeenCalled();
            });

            it('andThenAsync() should return None', async () => {
                const result = await none.andThenAsync(async () => Some('0'));
                expect(result.eq(None)).toBe(true);
            });

            it('or() should return other', () => {
                expect(none.or(Some(20)).eq(Some(20))).toBe(true);
                expect(none.or(None).eq(None)).toBe(true);
            });

            it('orElse() should call fn and return its result', () => {
                const fn = vi.fn(() => Some(20));
                expect(none.orElse(fn).eq(Some(20))).toBe(true);
                expect(fn).toHaveBeenCalledTimes(1);
            });

            it('orElseAsync() should return async fn result', async () => {
                const result = await none.orElseAsync(async () => Some('1'));
                expect(result.eq(Some('1'))).toBe(true);
            });

            it('xor() should return other when other is Some', () => {
                expect(none.xor(Some(20)).eq(Some(20))).toBe(true);
            });

            it('xor() should return None when both are None', () => {
                expect(none.xor(None).eq(None)).toBe(true);
            });
        });

        describe('inspect', () => {
            it('should not call fn', () => {
                const fn = vi.fn((value: number) => {
                    console.log(`value is ${ value }`);
                });
                none.inspect(fn);
                expect(fn).not.toHaveBeenCalled();
            });

            it('should return self for chaining', () => {
                expect(none.inspect(() => {})).toBe(None);
            });
        });

        describe('equality', () => {
            it('should equal None', () => {
                expect(none.eq(None)).toBe(true);
            });

            it('should not equal Some', () => {
                expect(none.eq(Some(10))).toBe(false);
            });
        });
    });
});
