import { describe, expect, it, vi } from 'vitest';
import { Mutex } from '../../src/mod.ts';

describe('Mutex', () => {
    describe('initial state', () => {
        it('should not be locked initially', () => {
            const mutex = Mutex(42);
            expect(mutex.isLocked()).toBe(false);
        });

        it('should have correct Symbol.toStringTag', () => {
            const mutex = Mutex(42);
            expect(Object.prototype.toString.call(mutex)).toBe('[object Mutex]');
        });

        it('toString() should show unlocked state initially', () => {
            const mutex = Mutex(42);
            expect(mutex.toString()).toBe('Mutex(<unlocked>)');
        });

        it('toString() should show locked state when locked', async () => {
            const mutex = Mutex(42);
            const guard = await mutex.lock();
            try {
                expect(mutex.toString()).toBe('Mutex(<locked>)');
            } finally {
                guard.unlock();
            }
            expect(mutex.toString()).toBe('Mutex(<unlocked>)');
        });
    });

    describe('MutexGuard', () => {
        it('should have correct Symbol.toStringTag', async () => {
            const mutex = Mutex(42);
            const guard = await mutex.lock();
            try {
                expect(Object.prototype.toString.call(guard)).toBe('[object MutexGuard]');
            } finally {
                guard.unlock();
            }
        });

        it('toString() should show value while held', async () => {
            const mutex = Mutex(42);
            const guard = await mutex.lock();
            try {
                expect(guard.toString()).toBe('MutexGuard(42)');
            } finally {
                guard.unlock();
            }
        });

        it('toString() should show released state after unlock', async () => {
            const mutex = Mutex(42);
            const guard = await mutex.lock();
            guard.unlock();
            expect(guard.toString()).toBe('MutexGuard(<released>)');
        });
    });

    describe('withLock', () => {
        it('should execute callback with the protected value', async () => {
            const mutex = Mutex({ count: 0 });

            await mutex.withLock((value) => {
                value.count = 42;
            });

            await mutex.withLock((value) => {
                expect(value.count).toBe(42);
            });
        });

        it('should return the callback result', async () => {
            const mutex = Mutex(10);

            const result = await mutex.withLock((value) => {
                return value * 2;
            });

            expect(result).toBe(20);
        });

        it('should work with async callbacks', async () => {
            const mutex = Mutex<string[]>([]);

            await mutex.withLock(async (arr) => {
                await new Promise(r => setTimeout(r, 10));
                arr.push('first');
            });

            await mutex.withLock((arr) => {
                expect(arr).toEqual(['first']);
            });
        });

        it('should release lock on callback error', async () => {
            const mutex = Mutex(42);

            await expect(mutex.withLock(() => {
                throw new Error('test error');
            })).rejects.toThrow('test error');

            // Lock should be released, allowing another acquire
            expect(mutex.isLocked()).toBe(false);
            await mutex.withLock((value) => {
                expect(value).toBe(42);
            });
        });

        it('should release lock on async callback error', async () => {
            const mutex = Mutex(42);

            await expect(mutex.withLock(async () => {
                await new Promise(r => setTimeout(r, 10));
                throw new Error('async error');
            })).rejects.toThrow('async error');

            expect(mutex.isLocked()).toBe(false);
        });

        it('should serialize concurrent operations', async () => {
            const mutex = Mutex<number[]>([]);
            const order: string[] = [];

            await Promise.all([
                mutex.withLock(async (arr) => {
                    order.push('a-start');
                    await new Promise(r => setTimeout(r, 30));
                    arr.push(1);
                    order.push('a-end');
                }),
                mutex.withLock(async (arr) => {
                    order.push('b-start');
                    await new Promise(r => setTimeout(r, 10));
                    arr.push(2);
                    order.push('b-end');
                }),
                mutex.withLock(async (arr) => {
                    order.push('c-start');
                    arr.push(3);
                    order.push('c-end');
                }),
            ]);

            // Operations should be serialized
            expect(order).toEqual([
                'a-start', 'a-end',
                'b-start', 'b-end',
                'c-start', 'c-end',
            ]);

            await mutex.withLock((arr) => {
                expect(arr).toEqual([1, 2, 3]);
            });
        });
    });

    describe('lock', () => {
        it('should return a guard with the value', async () => {
            const mutex = Mutex({ name: 'test' });

            const guard = await mutex.lock();
            expect(guard.value).toEqual({ name: 'test' });
            guard.unlock();
        });

        it('should allow modifying the value through guard', async () => {
            const mutex = Mutex({ count: 0 });

            const guard = await mutex.lock();
            guard.value.count = 100;
            guard.unlock();

            await mutex.withLock((value) => {
                expect(value.count).toBe(100);
            });
        });

        it('should allow replacing the value through guard', async () => {
            const mutex = Mutex(42);

            const guard = await mutex.lock();
            guard.value = 100;
            guard.unlock();

            await mutex.withLock((value) => {
                expect(value).toBe(100);
            });
        });

        it('should mark mutex as locked after lock', async () => {
            const mutex = Mutex(42);

            const guard = await mutex.lock();
            expect(mutex.isLocked()).toBe(true);

            guard.unlock();
            expect(mutex.isLocked()).toBe(false);
        });

        it('should wait for previous lock to be released', async () => {
            const mutex = Mutex(42);
            const events: string[] = [];

            const guard1 = await mutex.lock();
            events.push('first-locked');

            const promise2 = mutex.lock().then((g) => {
                events.push('second-locked');
                return g;
            });

            // Give time for second lock to queue
            await new Promise(r => setTimeout(r, 10));
            expect(events).toEqual(['first-locked']);

            guard1.unlock();
            events.push('first-unlocked');

            const guard2 = await promise2;
            expect(events).toEqual(['first-locked', 'first-unlocked', 'second-locked']);

            guard2.unlock();
        });

        it('should throw when accessing released guard', async () => {
            const mutex = Mutex(42);

            const guard = await mutex.lock();
            guard.unlock();

            expect(() => guard.value).toThrow('MutexGuard has been released');
            expect(() => { guard.value = 100; }).toThrow('MutexGuard has been released');
        });

        it('should ignore multiple unlock calls', async () => {
            const mutex = Mutex(42);

            const guard = await mutex.lock();
            guard.unlock();
            guard.unlock(); // Should not throw
            guard.unlock(); // Should not throw

            expect(mutex.isLocked()).toBe(false);
        });
    });

    describe('tryLock', () => {
        it('should return Some(guard) when not locked', () => {
            const mutex = Mutex(42);

            const result = mutex.tryLock();

            expect(result.isSome()).toBe(true);
            const guard = result.unwrap();
            expect(guard.value).toBe(42);
            guard.unlock();
        });

        it('should return None when locked', async () => {
            const mutex = Mutex(42);

            const guard = await mutex.lock();
            const result = mutex.tryLock();

            expect(result.isNone()).toBe(true);

            guard.unlock();
        });

        it('should allow lock after tryLock unlock', async () => {
            const mutex = Mutex(42);

            const result = mutex.tryLock();
            expect(result.isSome()).toBe(true);

            const guard = result.unwrap();
            guard.unlock();

            // Should be able to lock again
            const guard2 = await mutex.lock();
            expect(guard2.value).toBe(42);
            guard2.unlock();
        });
    });

    describe('isLocked', () => {
        it('should return false when not locked', () => {
            const mutex = Mutex(42);
            expect(mutex.isLocked()).toBe(false);
        });

        it('should return true when locked via lock', async () => {
            const mutex = Mutex(42);

            const guard = await mutex.lock();
            expect(mutex.isLocked()).toBe(true);

            guard.unlock();
            expect(mutex.isLocked()).toBe(false);
        });

        it('should return true when locked via tryLock', () => {
            const mutex = Mutex(42);

            const result = mutex.tryLock();
            expect(mutex.isLocked()).toBe(true);

            result.unwrap().unlock();
            expect(mutex.isLocked()).toBe(false);
        });

        it('should return true during withLock execution', async () => {
            const mutex = Mutex(42);
            let wasLocked = false;

            await mutex.withLock(() => {
                wasLocked = mutex.isLocked();
            });

            expect(wasLocked).toBe(true);
            expect(mutex.isLocked()).toBe(false);
        });
    });

    describe('fairness', () => {
        it('should process waiters in FIFO order', async () => {
            const mutex = Mutex<string[]>([]);
            const guard = await mutex.lock();

            // Queue up waiters
            const p1 = mutex.withLock((arr) => { arr.push('first'); });
            const p2 = mutex.withLock((arr) => { arr.push('second'); });
            const p3 = mutex.withLock((arr) => { arr.push('third'); });

            // Release initial lock
            guard.unlock();

            await Promise.all([p1, p2, p3]);

            await mutex.withLock((arr) => {
                expect(arr).toEqual(['first', 'second', 'third']);
            });
        });
    });

    describe('real-world scenarios', () => {
        it('should handle counter increment safely', async () => {
            const mutex = Mutex({ count: 0 });

            await Promise.all(
                Array.from({ length: 100 }, () =>
                    mutex.withLock(async (state) => {
                        const current = state.count;
                        await new Promise(r => setTimeout(r, 1));
                        state.count = current + 1;
                    }),
                ),
            );

            await mutex.withLock((state) => {
                expect(state.count).toBe(100);
            });
        });

        it('should handle token refresh pattern', async () => {
            const mutex = Mutex({ token: 'expired', refreshCount: 0 });
            const isExpired = (token: string) => token === 'expired';
            const refreshToken = vi.fn(async () => {
                await new Promise(r => setTimeout(r, 20));
                return 'valid-token';
            });

            async function getToken() {
                return await mutex.withLock(async (state) => {
                    if (isExpired(state.token)) {
                        state.token = await refreshToken();
                        state.refreshCount++;
                    }
                    return state.token;
                });
            }

            // Multiple concurrent token requests
            const tokens = await Promise.all([
                getToken(),
                getToken(),
                getToken(),
                getToken(),
                getToken(),
            ]);

            // All should get the same token
            expect(tokens.every(t => t === 'valid-token')).toBe(true);

            // Refresh should only be called once
            expect(refreshToken).toHaveBeenCalledTimes(1);

            await mutex.withLock((state) => {
                expect(state.refreshCount).toBe(1);
            });
        });
    });

    describe('Immutability', () => {
        it('Mutex should be frozen', () => {
            const mutex = Mutex(42);
            expect(Object.isFrozen(mutex)).toBe(true);
        });

        it('Mutex should prevent property modification', () => {
            const mutex = Mutex(42);
            expect(() => {
                (mutex as Record<string, unknown>).lock = () => Promise.resolve(null);
            }).toThrow(TypeError);
        });

        it('Mutex should prevent adding new properties', () => {
            const mutex = Mutex(42);
            expect(() => {
                (mutex as Record<string, unknown>).newProp = 'test';
            }).toThrow(TypeError);
        });

        it('MutexGuard should be frozen', async () => {
            const mutex = Mutex(42);
            const guard = await mutex.lock();
            try {
                expect(Object.isFrozen(guard)).toBe(true);
            } finally {
                guard.unlock();
            }
        });

        it('MutexGuard should prevent adding new properties', async () => {
            const mutex = Mutex(42);
            const guard = await mutex.lock();
            try {
                expect(() => {
                    (guard as Record<string, unknown>).newProp = 'test';
                }).toThrow(TypeError);
            } finally {
                guard.unlock();
            }
        });
    });
});
