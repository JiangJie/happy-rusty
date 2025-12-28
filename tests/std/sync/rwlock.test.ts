import { describe, expect, it } from 'vitest';
import { RwLock } from '../../../src/mod.ts';

describe('RwLock', () => {
    describe('initial state', () => {
        it('should not be locked initially', () => {
            const rwlock = RwLock(42);
            expect(rwlock.readerCount()).toBe(0);
            expect(rwlock.isWriteLocked()).toBe(false);
        });

        it('should have correct Symbol.toStringTag', () => {
            const rwlock = RwLock(42);
            expect(Object.prototype.toString.call(rwlock)).toBe('[object RwLock]');
        });

        it('toString() should show unlocked state initially', () => {
            const rwlock = RwLock(42);
            expect(rwlock.toString()).toBe('RwLock(<unlocked>)');
        });
    });

    describe('RwLockReadGuard', () => {
        it('should have correct Symbol.toStringTag', async () => {
            const rwlock = RwLock(42);
            const guard = await rwlock.read();
            try {
                expect(Object.prototype.toString.call(guard)).toBe('[object RwLockReadGuard]');
            } finally {
                guard.unlock();
            }
        });

        it('toString() should show value while held', async () => {
            const rwlock = RwLock(42);
            const guard = await rwlock.read();
            try {
                expect(guard.toString()).toBe('RwLockReadGuard(42)');
            } finally {
                guard.unlock();
            }
        });

        it('toString() should show released state after unlock', async () => {
            const rwlock = RwLock(42);
            const guard = await rwlock.read();
            guard.unlock();
            expect(guard.toString()).toBe('RwLockReadGuard(<released>)');
        });

        it('should throw when accessing released guard', async () => {
            const rwlock = RwLock(42);
            const guard = await rwlock.read();
            guard.unlock();
            expect(() => guard.value).toThrow('RwLockReadGuard has been released');
        });

        it('should be frozen', async () => {
            const rwlock = RwLock(42);
            const guard = await rwlock.read();
            try {
                expect(Object.isFrozen(guard)).toBe(true);
            } finally {
                guard.unlock();
            }
        });
    });

    describe('RwLockWriteGuard', () => {
        it('should have correct Symbol.toStringTag', async () => {
            const rwlock = RwLock(42);
            const guard = await rwlock.write();
            try {
                expect(Object.prototype.toString.call(guard)).toBe('[object RwLockWriteGuard]');
            } finally {
                guard.unlock();
            }
        });

        it('toString() should show value while held', async () => {
            const rwlock = RwLock(42);
            const guard = await rwlock.write();
            try {
                expect(guard.toString()).toBe('RwLockWriteGuard(42)');
            } finally {
                guard.unlock();
            }
        });

        it('toString() should show released state after unlock', async () => {
            const rwlock = RwLock(42);
            const guard = await rwlock.write();
            guard.unlock();
            expect(guard.toString()).toBe('RwLockWriteGuard(<released>)');
        });

        it('should throw when accessing released guard', async () => {
            const rwlock = RwLock(42);
            const guard = await rwlock.write();
            guard.unlock();
            expect(() => guard.value).toThrow('RwLockWriteGuard has been released');
            expect(() => { guard.value = 100; }).toThrow('RwLockWriteGuard has been released');
        });

        it('should be frozen', async () => {
            const rwlock = RwLock(42);
            const guard = await rwlock.write();
            try {
                expect(Object.isFrozen(guard)).toBe(true);
            } finally {
                guard.unlock();
            }
        });
    });

    describe('read', () => {
        it('should allow reading the value', async () => {
            const rwlock = RwLock({ name: 'test' });
            const guard = await rwlock.read();
            try {
                expect(guard.value).toEqual({ name: 'test' });
            } finally {
                guard.unlock();
            }
        });

        it('should allow multiple concurrent readers', async () => {
            const rwlock = RwLock(42);

            const guard1 = await rwlock.read();
            const guard2 = await rwlock.read();
            const guard3 = await rwlock.read();

            expect(rwlock.readerCount()).toBe(3);
            expect(guard1.value).toBe(42);
            expect(guard2.value).toBe(42);
            expect(guard3.value).toBe(42);

            guard1.unlock();
            expect(rwlock.readerCount()).toBe(2);

            guard2.unlock();
            expect(rwlock.readerCount()).toBe(1);

            guard3.unlock();
            expect(rwlock.readerCount()).toBe(0);
        });

        it('should update readerCount correctly', async () => {
            const rwlock = RwLock(42);

            expect(rwlock.readerCount()).toBe(0);

            const guard = await rwlock.read();
            expect(rwlock.readerCount()).toBe(1);

            guard.unlock();
            expect(rwlock.readerCount()).toBe(0);
        });

        it('toString() should show read-locked state', async () => {
            const rwlock = RwLock(42);

            const guard1 = await rwlock.read();
            expect(rwlock.toString()).toBe('RwLock(<read-locked:1>)');

            const guard2 = await rwlock.read();
            expect(rwlock.toString()).toBe('RwLock(<read-locked:2>)');

            guard1.unlock();
            guard2.unlock();
            expect(rwlock.toString()).toBe('RwLock(<unlocked>)');
        });

        it('should ignore multiple unlock calls', async () => {
            const rwlock = RwLock(42);
            const guard = await rwlock.read();

            guard.unlock();
            guard.unlock();
            guard.unlock();

            expect(rwlock.readerCount()).toBe(0);
        });
    });

    describe('write', () => {
        it('should allow modifying the value', async () => {
            const rwlock = RwLock({ count: 0 });

            const guard = await rwlock.write();
            guard.value.count = 100;
            guard.unlock();

            expect(await rwlock.get()).toEqual({ count: 100 });
        });

        it('should allow replacing the value', async () => {
            const rwlock = RwLock(42);

            const guard = await rwlock.write();
            guard.value = 100;
            guard.unlock();

            expect(await rwlock.get()).toBe(100);
        });

        it('should mark as write-locked', async () => {
            const rwlock = RwLock(42);

            const guard = await rwlock.write();
            expect(rwlock.isWriteLocked()).toBe(true);
            expect(rwlock.toString()).toBe('RwLock(<write-locked>)');

            guard.unlock();
            expect(rwlock.isWriteLocked()).toBe(false);
        });

        it('should block readers while write-locked', async () => {
            const rwlock = RwLock(42);
            const events: string[] = [];

            const writeGuard = await rwlock.write();
            events.push('write-acquired');

            const readPromise = rwlock.read().then((g) => {
                events.push('read-acquired');
                return g;
            });

            await new Promise(r => setTimeout(r, 10));
            expect(events).toEqual(['write-acquired']);

            writeGuard.unlock();
            events.push('write-released');

            const readGuard = await readPromise;
            readGuard.unlock();

            expect(events).toEqual(['write-acquired', 'write-released', 'read-acquired']);
        });

        it('should block other writers while write-locked', async () => {
            const rwlock = RwLock(42);
            const events: string[] = [];

            const guard1 = await rwlock.write();
            events.push('write1-acquired');

            const writePromise = rwlock.write().then((g) => {
                events.push('write2-acquired');
                return g;
            });

            await new Promise(r => setTimeout(r, 10));
            expect(events).toEqual(['write1-acquired']);

            guard1.unlock();
            events.push('write1-released');

            const guard2 = await writePromise;
            guard2.unlock();

            expect(events).toEqual(['write1-acquired', 'write1-released', 'write2-acquired']);
        });

        it('should ignore multiple unlock calls', async () => {
            const rwlock = RwLock(42);
            const guard = await rwlock.write();

            guard.unlock();
            guard.unlock();
            guard.unlock();

            expect(rwlock.isWriteLocked()).toBe(false);
        });
    });

    describe('writer priority', () => {
        it('should give writers priority over readers', async () => {
            const rwlock = RwLock(42);
            const events: string[] = [];

            // Acquire read lock first
            const readGuard = await rwlock.read();
            events.push('read1-acquired');

            // Queue a write (should wait)
            const writePromise = rwlock.write().then((g) => {
                events.push('write-acquired');
                return g;
            });

            await new Promise(r => setTimeout(r, 10));

            // Queue another read (should wait because writer is pending)
            const read2Promise = rwlock.read().then((g) => {
                events.push('read2-acquired');
                return g;
            });

            await new Promise(r => setTimeout(r, 10));
            expect(events).toEqual(['read1-acquired']);

            // Release first read
            readGuard.unlock();
            events.push('read1-released');

            // Writer should go before second read
            const writeGuard = await writePromise;
            writeGuard.unlock();
            events.push('write-released');

            const read2Guard = await read2Promise;
            read2Guard.unlock();

            expect(events).toEqual([
                'read1-acquired',
                'read1-released',
                'write-acquired',
                'write-released',
                'read2-acquired',
            ]);
        });
    });

    describe('withRead', () => {
        it('should execute callback with the value', async () => {
            const rwlock = RwLock({ items: [1, 2, 3] });

            const sum = await rwlock.withRead((value) => {
                return value.items.reduce((a, b) => a + b, 0);
            });

            expect(sum).toBe(6);
        });

        it('should release lock on error', async () => {
            const rwlock = RwLock(42);

            await expect(rwlock.withRead(() => {
                throw new Error('test error');
            })).rejects.toThrow('test error');

            expect(rwlock.readerCount()).toBe(0);
        });

        it('should allow concurrent reads', async () => {
            const rwlock = RwLock(42);
            const events: string[] = [];

            await Promise.all([
                rwlock.withRead(async () => {
                    events.push('a-start');
                    await new Promise(r => setTimeout(r, 30));
                    events.push('a-end');
                }),
                rwlock.withRead(async () => {
                    events.push('b-start');
                    await new Promise(r => setTimeout(r, 10));
                    events.push('b-end');
                }),
            ]);

            // Both should start immediately (concurrent)
            expect(events[0]).toBe('a-start');
            expect(events[1]).toBe('b-start');
            // b ends first because it has shorter delay
            expect(events[2]).toBe('b-end');
            expect(events[3]).toBe('a-end');
        });
    });

    describe('withWrite', () => {
        it('should execute callback and allow modification', async () => {
            const rwlock = RwLock({ count: 0 });

            await rwlock.withWrite((value) => {
                value.count = 100;
            });

            expect(await rwlock.get()).toEqual({ count: 100 });
        });

        it('should release lock on error', async () => {
            const rwlock = RwLock(42);

            await expect(rwlock.withWrite(() => {
                throw new Error('test error');
            })).rejects.toThrow('test error');

            expect(rwlock.isWriteLocked()).toBe(false);
        });

        it('should serialize write operations', async () => {
            const rwlock = RwLock<number[]>([]);
            const order: string[] = [];

            await Promise.all([
                rwlock.withWrite(async (arr) => {
                    order.push('a-start');
                    await new Promise(r => setTimeout(r, 30));
                    arr.push(1);
                    order.push('a-end');
                }),
                rwlock.withWrite(async (arr) => {
                    order.push('b-start');
                    await new Promise(r => setTimeout(r, 10));
                    arr.push(2);
                    order.push('b-end');
                }),
            ]);

            // Writes should be serialized
            expect(order).toEqual(['a-start', 'a-end', 'b-start', 'b-end']);
            expect(await rwlock.get()).toEqual([1, 2]);
        });
    });

    describe('tryRead', () => {
        it('should return Some(guard) when not locked', () => {
            const rwlock = RwLock(42);

            const result = rwlock.tryRead();

            expect(result.isSome()).toBe(true);
            const guard = result.unwrap();
            expect(guard.value).toBe(42);
            guard.unlock();
        });

        it('should return Some(guard) when read-locked', async () => {
            const rwlock = RwLock(42);

            const guard1 = await rwlock.read();
            const result = rwlock.tryRead();

            expect(result.isSome()).toBe(true);
            expect(rwlock.readerCount()).toBe(2);

            result.unwrap().unlock();
            guard1.unlock();
        });

        it('should return None when write-locked', async () => {
            const rwlock = RwLock(42);

            const guard = await rwlock.write();
            const result = rwlock.tryRead();

            expect(result.isNone()).toBe(true);

            guard.unlock();
        });

        it('should return None when writer is pending', async () => {
            const rwlock = RwLock(42);

            const readGuard = await rwlock.read();

            // Queue a writer
            const writePromise = rwlock.write();

            await new Promise(r => setTimeout(r, 10));

            // tryRead should fail because writer is pending
            const result = rwlock.tryRead();
            expect(result.isNone()).toBe(true);

            readGuard.unlock();
            const writeGuard = await writePromise;
            writeGuard.unlock();
        });
    });

    describe('tryWrite', () => {
        it('should return Some(guard) when not locked', () => {
            const rwlock = RwLock(42);

            const result = rwlock.tryWrite();

            expect(result.isSome()).toBe(true);
            const guard = result.unwrap();
            expect(guard.value).toBe(42);
            guard.unlock();
        });

        it('should return None when read-locked', async () => {
            const rwlock = RwLock(42);

            const guard = await rwlock.read();
            const result = rwlock.tryWrite();

            expect(result.isNone()).toBe(true);

            guard.unlock();
        });

        it('should return None when write-locked', async () => {
            const rwlock = RwLock(42);

            const guard = await rwlock.write();
            const result = rwlock.tryWrite();

            expect(result.isNone()).toBe(true);

            guard.unlock();
        });
    });

    describe('get', () => {
        it('should return the current value', async () => {
            const rwlock = RwLock(42);
            expect(await rwlock.get()).toBe(42);
        });

        it('should return updated value after modification', async () => {
            const rwlock = RwLock({ count: 0 });

            await rwlock.withWrite((v) => { v.count = 100; });

            expect((await rwlock.get()).count).toBe(100);
        });
    });

    describe('set', () => {
        it('should set a new value', async () => {
            const rwlock = RwLock(42);

            await rwlock.set(100);

            expect(await rwlock.get()).toBe(100);
        });

        it('should replace object value', async () => {
            const rwlock = RwLock({ name: 'old' });

            await rwlock.set({ name: 'new' });

            expect(await rwlock.get()).toEqual({ name: 'new' });
        });
    });

    describe('replace', () => {
        it('should return old value and set new value', async () => {
            const rwlock = RwLock(42);

            const old = await rwlock.replace(100);

            expect(old).toBe(42);
            expect(await rwlock.get()).toBe(100);
        });

        it('should work with objects', async () => {
            const rwlock = RwLock({ name: 'old' });

            const old = await rwlock.replace({ name: 'new' });

            expect(old).toEqual({ name: 'old' });
            expect(await rwlock.get()).toEqual({ name: 'new' });
        });

        it('should wait for lock when rwlock is locked', async () => {
            const rwlock = RwLock(42);
            const events: string[] = [];

            const guard = await rwlock.write();
            events.push('locked');

            const replacePromise = rwlock.replace(100).then((old) => {
                events.push('replaced');
                return old;
            });

            await new Promise(r => setTimeout(r, 10));
            expect(events).toEqual(['locked']);

            guard.unlock();
            events.push('unlocked');

            const old = await replacePromise;
            expect(events).toEqual(['locked', 'unlocked', 'replaced']);
            expect(old).toBe(42);
            expect(await rwlock.get()).toBe(100);
        });

        it('should work in sequence', async () => {
            const rwlock = RwLock(1);

            const old1 = await rwlock.replace(2);
            const old2 = await rwlock.replace(3);
            const old3 = await rwlock.replace(4);

            expect(old1).toBe(1);
            expect(old2).toBe(2);
            expect(old3).toBe(3);
            expect(await rwlock.get()).toBe(4);
        });
    });

    describe('Immutability', () => {
        it('RwLock should be frozen', () => {
            const rwlock = RwLock(42);
            expect(Object.isFrozen(rwlock)).toBe(true);
        });

        it('RwLock should prevent property modification', () => {
            const rwlock = RwLock(42);
            expect(() => {
                (rwlock as unknown as Record<string, unknown>)['read'] = () => Promise.resolve(null);
            }).toThrow(TypeError);
        });

        it('RwLock should prevent adding new properties', () => {
            const rwlock = RwLock(42);
            expect(() => {
                (rwlock as unknown as Record<string, unknown>)['newProp'] = 'test';
            }).toThrow(TypeError);
        });
    });

    describe('real-world scenarios', () => {
        it('should handle cache read-heavy workload', async () => {
            const cache = RwLock(new Map<string, number>());

            // Write some initial data
            await cache.withWrite((map) => {
                map.set('a', 1);
                map.set('b', 2);
                map.set('c', 3);
            });

            // Many concurrent reads
            const results = await Promise.all([
                cache.withRead((map) => map.get('a')),
                cache.withRead((map) => map.get('b')),
                cache.withRead((map) => map.get('c')),
                cache.withRead((map) => map.get('a')),
                cache.withRead((map) => map.get('b')),
            ]);

            expect(results).toEqual([1, 2, 3, 1, 2]);
        });

        it('should handle config updates safely', async () => {
            interface Config {
                apiUrl: string;
                timeout: number;
                features: string[];
            }

            const config = RwLock<Config>({
                apiUrl: 'https://api.example.com',
                timeout: 5000,
                features: ['feature-a'],
            });

            // Concurrent reads during write
            const readPromises = Promise.all([
                config.withRead((cfg) => cfg.features.includes('feature-a')),
                config.withRead((cfg) => cfg.timeout),
            ]);

            // Write update
            await config.withWrite((cfg) => {
                cfg.features.push('feature-b');
                cfg.timeout = 10000;
            });

            await readPromises;

            // Verify final state
            const finalConfig = await config.get();
            expect(finalConfig.features).toContain('feature-b');
            expect(finalConfig.timeout).toBe(10000);
        });
    });
});
