import { describe, expect, it } from 'vitest';
import { Semaphore } from '../../../src/mod.ts';

describe('Semaphore', () => {
    describe('initial state', () => {
        it('should report capacity from construction', () => {
            const sem = Semaphore(5);
            expect(sem.capacity).toBe(5);
        });

        it('should have all permits available initially', () => {
            const sem = Semaphore(3);
            expect(sem.availablePermits()).toBe(3);
        });

        it('should have correct Symbol.toStringTag', () => {
            const sem = Semaphore(1);
            expect(Object.prototype.toString.call(sem)).toBe('[object Semaphore]');
        });

        it('toString() should show available/capacity', () => {
            const sem = Semaphore(3);
            expect(sem.toString()).toBe('Semaphore(3/3)');
        });

        it('toString() should reflect acquired permits', async () => {
            const sem = Semaphore(3);
            await sem.acquire();
            expect(sem.toString()).toBe('Semaphore(2/3)');
        });
    });

    describe('constructor validation', () => {
        it('should throw RangeError for negative capacity', () => {
            expect(() => Semaphore(-1)).toThrow(RangeError);
        });

        it('should throw RangeError for non-integer capacity', () => {
            expect(() => Semaphore(2.5)).toThrow(RangeError);
        });

        it('should accept zero capacity', () => {
            const sem = Semaphore(0);
            expect(sem.capacity).toBe(0);
            expect(sem.availablePermits()).toBe(0);
        });
    });

    describe('acquire', () => {
        it('should consume a permit on acquire', async () => {
            const sem = Semaphore(2);
            const permit = await sem.acquire();
            expect(sem.availablePermits()).toBe(1);
            permit.release();
            expect(sem.availablePermits()).toBe(2);
        });

        it('should return a permit with correct toStringTag', async () => {
            const sem = Semaphore(1);
            const permit = await sem.acquire();
            expect(Object.prototype.toString.call(permit)).toBe('[object SemaphorePermit]');
            permit.release();
        });

        it('should show held state in toString before release', async () => {
            const sem = Semaphore(1);
            const permit = await sem.acquire();
            expect(permit.toString()).toBe('SemaphorePermit');
            permit.release();
        });

        it('should show released state in toString after release', async () => {
            const sem = Semaphore(1);
            const permit = await sem.acquire();
            permit.release();
            expect(permit.toString()).toBe('SemaphorePermit(<released>)');
        });

        it('should be idempotent on multiple release calls', async () => {
            const sem = Semaphore(1);
            const permit = await sem.acquire();
            permit.release();
            permit.release();
            permit.release();
            // Only one permit returned
            expect(sem.availablePermits()).toBe(1);
        });
    });

    describe('tryAcquire', () => {
        it('should return Some(permit) when available', () => {
            const sem = Semaphore(2);
            const result = sem.tryAcquire();
            expect(result.isSome()).toBe(true);
            expect(sem.availablePermits()).toBe(1);
            result.unwrap().release();
        });

        it('should return None when at capacity', async () => {
            const sem = Semaphore(1);
            const permit = await sem.acquire();
            expect(sem.tryAcquire().isNone()).toBe(true);
            permit.release();
            expect(sem.tryAcquire().isSome()).toBe(true);
        });

        it('should return None for zero-capacity semaphore', () => {
            const sem = Semaphore(0);
            expect(sem.tryAcquire().isNone()).toBe(true);
        });
    });

    describe('withPermit', () => {
        it('should auto-release permit after callback resolves', async () => {
            const sem = Semaphore(1);
            const result = await sem.withPermit(() => 42);
            expect(result).toBe(42);
            expect(sem.availablePermits()).toBe(1);
        });

        it('should auto-release permit after callback rejects', async () => {
            const sem = Semaphore(1);
            await expect(sem.withPermit(async () => {
                throw new Error('boom');
            })).rejects.toThrow('boom');
            expect(sem.availablePermits()).toBe(1);
        });

        it('should flatten nested Promise (Awaited<U>)', async () => {
            const sem = Semaphore(1);
            const { promise, resolve } = Promise.withResolvers<number>();
            resolve(42);
            const result = await sem.withPermit(() => promise);
            expect(result).toBe(42);
        });

        it('should work with sync return value', async () => {
            const sem = Semaphore(1);
            const result = await sem.withPermit(() => 'sync');
            expect(result).toBe('sync');
        });

        it('should limit concurrency to capacity', async () => {
            const sem = Semaphore(2);
            let active = 0;
            let maxActive = 0;

            const tasks = Array.from({ length: 10 }, () =>
                sem.withPermit(async () => {
                    active++;
                    maxActive = Math.max(maxActive, active);
                    await new Promise(r => setTimeout(r, 10));
                    active--;
                }),
            );

            await Promise.all(tasks);
            expect(maxActive).toBe(2);
        });
    });

    describe('concurrency limit', () => {
        it('should make acquire wait when at capacity', async () => {
            const sem = Semaphore(1);
            const permit = await sem.acquire();

            let secondAcquired = false;
            const second = sem.acquire().then((p) => {
                secondAcquired = true;
                return p;
            });

            await new Promise(r => setTimeout(r, 10));
            expect(secondAcquired).toBe(false);

            permit.release();
            const secondPermit = await second;
            expect(secondAcquired).toBe(true);
            secondPermit.release();
        });

        it('should transfer permit directly from releaser to waiter', async () => {
            const sem = Semaphore(1);
            const first = await sem.acquire();

            // available is 0, one waiter queued
            const second = sem.acquire();
            await new Promise(r => setTimeout(r, 10));
            expect(sem.availablePermits()).toBe(0);

            // release transfers permit to the waiter without changing available
            first.release();
            const secondPermit = await second;
            expect(sem.availablePermits()).toBe(0); // still 0, permit transferred
            secondPermit.release();
            expect(sem.availablePermits()).toBe(1);
        });
    });

    describe('FIFO fairness', () => {
        it('should wake waiters in FIFO order', async () => {
            const sem = Semaphore(1);
            const order: string[] = [];

            const first = await sem.acquire();
            order.push('first-acquired');

            const waiters = ['A', 'B', 'C'].map((name) =>
                sem.acquire().then((p) => {
                    order.push(`${name}-acquired`);
                    return p;
                }),
            );

            await new Promise(r => setTimeout(r, 10));
            // Release in order; each release should wake the next FIFO waiter
            first.release();
            await new Promise(r => setTimeout(r, 10));
            (await waiters[0]).release();
            await new Promise(r => setTimeout(r, 10));
            (await waiters[1]).release();
            await new Promise(r => setTimeout(r, 10));
            (await waiters[2]).release();

            expect(order).toEqual([
                'first-acquired',
                'A-acquired',
                'B-acquired',
                'C-acquired',
            ]);
        });
    });

    describe('immutability', () => {
        it('Semaphore should be frozen', () => {
            const sem = Semaphore(1);
            expect(Object.isFrozen(sem)).toBe(true);
        });

        it('SemaphorePermit should be frozen', async () => {
            const sem = Semaphore(1);
            const permit = await sem.acquire();
            expect(Object.isFrozen(permit)).toBe(true);
            permit.release();
        });

        it('should prevent property modification on Semaphore', () => {
            const sem = Semaphore(1);
            expect(() => {
                (sem as unknown as Record<string, unknown>)['acquire'] = () => {};
            }).toThrow(TypeError);
        });

        it('should prevent property modification on Permit', async () => {
            const sem = Semaphore(1);
            const permit = await sem.acquire();
            expect(() => {
                (permit as unknown as Record<string, unknown>)['release'] = () => {};
            }).toThrow(TypeError);
            permit.release();
        });
    });

    describe('real-world patterns', () => {
        it('should limit concurrent fetch-like operations', async () => {
            const sem = Semaphore(3);
            let active = 0;
            let maxActive = 0;

            async function fakeFetch(url: string): Promise<string> {
                return sem.withPermit(async () => {
                    active++;
                    maxActive = Math.max(maxActive, active);
                    await new Promise(r => setTimeout(r, 5));
                    active--;
                    return `response-${url}`;
                });
            }

            const urls = Array.from({ length: 10 }, (_, i) => `url-${i}`);
            const responses = await Promise.all(urls.map(fakeFetch));

            expect(maxActive).toBe(3);
            expect(responses).toEqual(urls.map((u) => `response-${u}`));
        });

        it('should support task queue with backpressure', async () => {
            const sem = Semaphore(2);
            const completed: number[] = [];

            async function processJob(id: number): Promise<void> {
                return sem.withPermit(async () => {
                    await new Promise(r => setTimeout(r, 10));
                    completed.push(id);
                });
            }

            await Promise.all([0, 1, 2, 3, 4].map(processJob));

            expect(completed).toHaveLength(5);
            // First two jobs complete before others start
            expect(completed.slice(0, 2)).toEqual(expect.arrayContaining([0, 1]));
        });
    });
});
