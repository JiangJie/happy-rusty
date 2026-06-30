/**
 * @module
 * Counting semaphore for limiting async concurrency.
 *
 * Inspired by [tokio's `Semaphore`](https://docs.rs/tokio/latest/tokio/sync/struct.Semaphore.html)
 * (Rust std does not include one). Unlike `Mutex<T>` which binds to a value,
 * `Semaphore` is a pure concurrency counter: it limits how many async
 * operations can run concurrently without protecting any data.
 *
 * **When to use `Semaphore` vs `Mutex<T>`:**
 * - Use `Mutex<T>` for exclusive access to a value (n=1, with data)
 * - Use `Semaphore` to limit concurrency to N (e.g. fetch rate limiting,
 *   connection pools, task queues)
 *
 * `Semaphore(1)` behaves like a `Mutex` without a value (a binary semaphore),
 * but `Mutex<T>` is preferred when you need to protect a value since the
 * guard provides typed access via `value`.
 */

import { None, Some, type Option } from '../../core/mod.ts';

/**
 * A permit acquired from a {@link Semaphore}.
 *
 * The permit must be released after use by calling `release()`. Failure to
 * release reduces available concurrency until the permit is garbage collected
 * (JavaScript has no RAII like Rust's `Drop`).
 *
 * Prefer {@link Semaphore.withPermit} for automatic acquire/release with
 * `try/finally` semantics. Manual `acquire()`/`release()` requires a
 * `try/finally` block to avoid leaking permits on exceptions.
 *
 * @since unreleased
 * @see {@link Semaphore}
 * @example
 * ```ts
 * const sem = Semaphore(2);
 * const permit = await sem.acquire();
 * try {
 *     await doWork();
 * } finally {
 *     permit.release();
 * }
 * ```
 */
export interface SemaphorePermit {
    /**
     * The well-known symbol `Symbol.toStringTag` used by `Object.prototype.toString()`.
     * Returns `'SemaphorePermit'` so that `Object.prototype.toString.call(permit)`
     * produces `'[object SemaphorePermit]'`.
     */
    readonly [Symbol.toStringTag]: 'SemaphorePermit';

    /**
     * Custom `toString` implementation.
     *
     * @example
     * ```ts
     * const sem = Semaphore(2);
     * const permit = await sem.acquire();
     * console.log(permit.toString()); // 'SemaphorePermit'
     * permit.release();
     * console.log(permit.toString()); // 'SemaphorePermit(<released>)'
     * ```
     */
    toString(): string;

    /**
     * Releases the permit back to the semaphore, allowing another waiting
     * operation to proceed (or incrementing the available count).
     *
     * Calling `release()` more than once is a no-op (idempotent), matching
     * the behavior of `MutexGuard.unlock()`.
     *
     * @example
     * ```ts
     * const sem = Semaphore(1);
     * const permit = await sem.acquire();
     * permit.release();
     * permit.release(); // no-op, safe to call again
     * ```
     */
    release(): void;
}

/**
 * A counting semaphore for limiting async concurrency.
 *
 * Allows up to `capacity` concurrent operations. Each `acquire()` consumes
 * one permit; each `release()` returns one. When the limit is reached,
 * `acquire()` waits for a permit to be released. Waiters are served in
 * FIFO order.
 *
 * Unlike `Mutex<T>`, `Semaphore` does not protect a value — it is a pure
 * concurrency counter. For exclusive access to a value, use `Mutex<T>`.
 *
 * @since unreleased
 * @see https://docs.rs/tokio/latest/tokio/sync/struct.Semaphore.html
 * @example
 * ```ts
 * // Limit concurrent fetch to 10
 * const sem = Semaphore(10);
 *
 * async function niceFetch(url: string): Promise<Response> {
 *     return sem.withPermit(() => fetch(url));
 * }
 *
 * await Promise.all(urls.map(niceFetch));
 * ```
 *
 * @example
 * ```ts
 * // Database connection pool with 5 connections
 * const pool = Semaphore(5);
 *
 * async function query(sql: string): Promise<Row[]> {
 *     return pool.withPermit(async () => {
 *         const conn = await getConnection();
 *         try {
 *             return await conn.query(sql);
 *         } finally {
 *             releaseConnection(conn);
 *         }
 *     });
 * }
 * ```
 */
export interface Semaphore {
    /**
     * The well-known symbol `Symbol.toStringTag` used by `Object.prototype.toString()`.
     * Returns `'Semaphore'` so that `Object.prototype.toString.call(sem)`
     * produces `'[object Semaphore]'`.
     */
    readonly [Symbol.toStringTag]: 'Semaphore';

    /**
     * Custom `toString` implementation showing available/capacity.
     *
     * @example
     * ```ts
     * const sem = Semaphore(3);
     * console.log(sem.toString()); // 'Semaphore(3/3)'
     * const permit = await sem.acquire();
     * console.log(sem.toString()); // 'Semaphore(2/3)'
     * permit.release();
     * console.log(sem.toString()); // 'Semaphore(3/3)'
     * ```
     */
    toString(): string;

    /**
     * The maximum number of permits (concurrency limit), set at construction.
     *
     * @example
     * ```ts
     * const sem = Semaphore(5);
     * console.log(sem.capacity); // 5
     * ```
     */
    readonly capacity: number;

    /**
     * Acquires a permit, executing the callback with at most `capacity`
     * concurrent callers. The permit is automatically released when the
     * callback settles (success or rejection).
     *
     * This is the recommended way to use the semaphore as it avoids leaking
     * permits on exceptions.
     *
     * @typeParam U - The return type of the callback.
     * @param fn - The callback to execute while holding a permit.
     * @returns A promise that resolves to the callback's return value.
     * @example
     * ```ts
     * const sem = Semaphore(3);
     * const result = await sem.withPermit(async () => {
     *     return await fetch('/api/data');
     * });
     * ```
     */
    withPermit<U>(fn: () => PromiseLike<U> | U): Promise<Awaited<U>>;

    /**
     * Acquires a permit, waiting if necessary until one is available.
     *
     * **Important:** Always release the permit in a `finally` block to avoid
     * leaking permits on exceptions. Prefer {@link withPermit} for automatic
     * release.
     *
     * @returns A promise that resolves to a {@link SemaphorePermit}.
     * @example
     * ```ts
     * const sem = Semaphore(2);
     * const permit = await sem.acquire();
     * try {
     *     await doWork();
     * } finally {
     *     permit.release();
     * }
     * ```
     */
    acquire(): Promise<SemaphorePermit>;

    /**
     * Attempts to acquire a permit without waiting.
     *
     * @returns `Some(permit)` if a permit was available, `None` if the limit
     *          has been reached.
     * @example
     * ```ts
     * const sem = Semaphore(1);
     * const maybePermit = sem.tryAcquire();
     * if (maybePermit.isSome()) {
     *     const permit = maybePermit.unwrap();
     *     try {
     *         await doWork();
     *     } finally {
     *         permit.release();
     *     }
     * } else {
     *     console.log('At capacity, skipping');
     * }
     * ```
     */
    tryAcquire(): Option<SemaphorePermit>;

    /**
     * Returns the number of permits currently available (not acquired).
     *
     * Note: this is a snapshot and may change immediately after the call as
     * other async operations acquire/release permits.
     *
     * @example
     * ```ts
     * const sem = Semaphore(3);
     * console.log(sem.availablePermits()); // 3
     * const permit = await sem.acquire();
     * console.log(sem.availablePermits()); // 2
     * permit.release();
     * console.log(sem.availablePermits()); // 3
     * ```
     */
    availablePermits(): number;
}

/**
 * Creates a new `Semaphore` with the given capacity.
 *
 * @param permits - The maximum number of concurrent operations allowed.
 *                  Must be a non-negative integer. Use `0` to disallow any
 *                  concurrent acquire (acquire will wait forever).
 * @returns A new `Semaphore` instance.
 * @throws {RangeError} If `permits` is negative or not an integer.
 * @example
 * ```ts
 * // Limit to 5 concurrent operations
 * const sem = Semaphore(5);
 *
 * // Binary semaphore (equivalent to a value-less Mutex)
 * const binary = Semaphore(1);
 * ```
 *
 * @example
 * ```ts
 * // Task queue: process 2 jobs at a time
 * const sem = Semaphore(2);
 *
 * async function processJob(job: Job) {
 *     return sem.withPermit(async () => {
 *         return await runJob(job);
 *     });
 * }
 *
 * await Promise.all(jobs.map(processJob));
 * ```
 */
export function Semaphore(permits: number): Semaphore {
    if (!Number.isInteger(permits) || permits < 0) {
        throw new RangeError(`Semaphore capacity must be a non-negative integer, got ${permits}`);
    }

    const capacity = permits;
    let available = permits;
    const waitQueue: (() => void)[] = [];

    function releasePermit(): void {
        // If there are waiters, transfer the permit directly (FIFO).
        // available stays unchanged — the permit moves from releaser to waiter.
        if (waitQueue.length > 0) {
            const next = waitQueue.shift() as () => void;
            next();
        } else {
            available++;
        }
    }

    function createPermit(): SemaphorePermit {
        let released = false;

        return Object.freeze<SemaphorePermit>({
            [Symbol.toStringTag]: 'SemaphorePermit',

            toString(): string {
                return released ? 'SemaphorePermit(<released>)' : 'SemaphorePermit';
            },

            release(): void {
                if (released) {
                    return; // Already released, ignore (idempotent)
                }
                released = true;
                releasePermit();
            },
        } as const);
    }

    function acquire(): Promise<SemaphorePermit> {
        if (available > 0) {
            available--;
            return Promise.resolve(createPermit());
        }

        return new Promise<SemaphorePermit>((resolve) => {
            waitQueue.push(() => {
                resolve(createPermit());
            });
        });
    }

    function tryAcquire(): Option<SemaphorePermit> {
        if (available > 0) {
            available--;
            return Some(createPermit());
        }
        return None;
    }

    return Object.freeze<Semaphore>({
        [Symbol.toStringTag]: 'Semaphore',

        toString(): string {
            return `Semaphore(${available}/${capacity})`;
        },

        capacity,

        async withPermit<U>(fn: () => PromiseLike<U> | U): Promise<Awaited<U>> {
            const permit = await acquire();
            try {
                return await fn();
            } finally {
                permit.release();
            }
        },

        acquire,

        tryAcquire,

        availablePermits(): number {
            return available;
        },
    } as const);
}
