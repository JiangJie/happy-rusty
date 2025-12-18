/**
 * @fileoverview
 * Rust-inspired [Mutex](https://doc.rust-lang.org/std/sync/struct.Mutex.html) for async mutual exclusion.
 *
 * In JavaScript's single-threaded environment, `Mutex<T>` is used to serialize
 * async operations, ensuring only one async task accesses the protected resource at a time.
 */

import { None, Some, type Option } from '../enum/mod.ts';

/**
 * A guard that provides access to the mutex-protected value.
 *
 * The guard must be released after use by calling `unlock()`.
 * Failure to unlock will cause deadlock for subsequent lock attempts.
 *
 * @typeParam T - The type of the protected value.
 */
export interface MutexGuard<T> {
    /**
     * The well-known symbol `Symbol.toStringTag` used by `Object.prototype.toString()`.
     * Returns `'MutexGuard'` so that `Object.prototype.toString.call(guard)` produces `'[object MutexGuard]'`.
     *
     * @internal
     */
    readonly [Symbol.toStringTag]: 'MutexGuard';

    /**
     * The protected value. Can be read or modified while the guard is held.
     */
    value: T;

    /**
     * Releases the lock, allowing other waiters to acquire it.
     *
     * Must be called when done with the protected value.
     * After calling `unlock()`, the guard should not be used.
     *
     * @example
     * ```ts
     * const guard = await mutex.lock();
     * try {
     *     guard.value.push('item');
     * } finally {
     *     guard.unlock();
     * }
     * ```
     */
    unlock(): void;
}

/**
 * An async mutual exclusion primitive for protecting shared data.
 *
 * This mutex provides exclusive access to the contained value, ensuring
 * that only one async operation can access it at a time. This is useful
 * for preventing race conditions in async code.
 *
 * Unlike Rust's Mutex which is for multi-threading, this JavaScript version
 * serializes async operations in the single-threaded event loop.
 *
 * @typeParam T - The type of the protected value.
 *
 * @example
 * ```ts
 * const mutex = Mutex({ balance: 100 });
 *
 * // Safe concurrent updates
 * await Promise.all([
 *     mutex.withLock(async (account) => {
 *         account.balance -= 50;
 *     }),
 *     mutex.withLock(async (account) => {
 *         account.balance += 30;
 *     }),
 * ]);
 * ```
 */
export interface Mutex<T> {
    /**
     * The well-known symbol `Symbol.toStringTag` used by `Object.prototype.toString()`.
     * Returns `'Mutex'` so that `Object.prototype.toString.call(mutex)` produces `'[object Mutex]'`.
     *
     * @internal
     */
    readonly [Symbol.toStringTag]: 'Mutex';

    /**
     * Acquires the lock and executes the callback with the protected value.
     *
     * This is the recommended way to use the mutex as it automatically
     * releases the lock when the callback completes (or throws).
     *
     * @typeParam U - The return type of the callback.
     * @param fn - The callback that receives the protected value.
     * @returns A promise that resolves to the callback's return value.
     *
     * @example
     * ```ts
     * const mutex = Mutex<number[]>([]);
     *
     * await mutex.withLock(async (arr) => {
     *     arr.push(await fetchItem());
     * });
     * ```
     */
    withLock<U>(fn: (value: T) => Promise<U> | U): Promise<U>;

    /**
     * Acquires the lock and returns a guard for manual control.
     *
     * Use this when you need more control over when to release the lock.
     * **Important:** Always release the lock in a `finally` block to prevent deadlocks.
     *
     * @returns A promise that resolves to a guard providing access to the value.
     *
     * @example
     * ```ts
     * const guard = await mutex.lock();
     * try {
     *     // Long-running operation with the protected value
     *     await processData(guard.value);
     *     guard.value = transformedData;
     * } finally {
     *     guard.unlock();
     * }
     * ```
     */
    lock(): Promise<MutexGuard<T>>;

    /**
     * Attempts to acquire the lock without waiting.
     *
     * Returns immediately with `Some(guard)` if the lock is available,
     * or `None` if it's currently held by another operation.
     *
     * @returns `Some(guard)` if acquired, `None` if locked.
     *
     * @example
     * ```ts
     * const maybeGuard = mutex.tryLock();
     * if (maybeGuard.isSome()) {
     *     const guard = maybeGuard.unwrap();
     *     try {
     *         // Use the value
     *     } finally {
     *         guard.unlock();
     *     }
     * } else {
     *     console.log('Mutex is busy');
     * }
     * ```
     */
    tryLock(): Option<MutexGuard<T>>;

    /**
     * Returns `true` if the mutex is currently locked.
     *
     * Note: This is a snapshot and may change immediately after the call.
     *
     * @example
     * ```ts
     * console.log(mutex.isLocked()); // false
     * const guard = await mutex.lock();
     * console.log(mutex.isLocked()); // true
     * guard.unlock();
     * console.log(mutex.isLocked()); // false
     * ```
     */
    isLocked(): boolean;
}

/**
 * Creates a new `Mutex<T>` protecting the given value.
 *
 * @typeParam T - The type of the protected value.
 * @param value - The initial value to protect.
 * @returns A new `Mutex<T>` instance.
 *
 * @example
 * ```ts
 * // Protect a simple value
 * const counter = Mutex(0);
 *
 * // Protect an object
 * const state = Mutex({ users: [], lastUpdate: Date.now() });
 *
 * // Protect a resource
 * const db = Mutex(await createConnection());
 * ```
 *
 * @example
 * ```ts
 * // Database transaction safety
 * const connection = Mutex(db);
 *
 * async function transfer(from: string, to: string, amount: number) {
 *     await connection.withLock(async (conn) => {
 *         await conn.beginTransaction();
 *         try {
 *             const balance = await conn.query('SELECT balance FROM accounts WHERE id = ?', [from]);
 *             if (balance < amount) {
 *                 throw new Error('Insufficient funds');
 *             }
 *             await conn.query('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, from]);
 *             await conn.query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amount, to]);
 *             await conn.commit();
 *         } catch (e) {
 *             await conn.rollback();
 *             throw e;
 *         }
 *     });
 * }
 * ```
 *
 * @example
 * ```ts
 * // Token refresh with mutex
 * const authState = Mutex({ token: '', expiresAt: 0 });
 *
 * async function getToken(): Promise<string> {
 *     return await authState.withLock(async (state) => {
 *         if (Date.now() > state.expiresAt) {
 *             const response = await fetch('/api/refresh');
 *             const data = await response.json();
 *             state.token = data.token;
 *             state.expiresAt = Date.now() + data.expiresIn * 1000;
 *         }
 *         return state.token;
 *     });
 * }
 * ```
 *
 * @example
 * ```ts
 * // File write serialization
 * const fileLock = Mutex('/path/to/file.json');
 *
 * async function appendToFile(data: string) {
 *     await fileLock.withLock(async (path) => {
 *         const content = await fs.readFile(path, 'utf-8');
 *         const json = JSON.parse(content);
 *         json.entries.push(data);
 *         await fs.writeFile(path, JSON.stringify(json, null, 2));
 *     });
 * }
 * ```
 */
export function Mutex<T>(value: T): Mutex<T> {
    let currentValue = value;
    let locked = false;
    const waitQueue: (() => void)[] = [];

    function unlock(): void {
        if (waitQueue.length > 0) {
            // Wake up the next waiter
            const next = waitQueue.shift() as () => void;
            next();
        } else {
            locked = false;
        }
    }

    function createGuard(): MutexGuard<T> {
        let released = false;

        return Object.freeze<MutexGuard<T>>({
            [Symbol.toStringTag]: 'MutexGuard',

            get value(): T {
                if (released) {
                    throw new Error('MutexGuard has been released.');
                }
                return currentValue;
            },
            set value(newValue: T) {
                if (released) {
                    throw new Error('MutexGuard has been released.');
                }
                currentValue = newValue;
            },
            unlock(): void {
                if (released) {
                    return; // Already released, ignore
                }
                released = true;
                unlock();
            },
        } as const);
    }

    function lock(): Promise<MutexGuard<T>> {
        if (!locked) {
            locked = true;
            return Promise.resolve(createGuard());
        }

        return new Promise<MutexGuard<T>>((resolve) => {
            waitQueue.push(() => {
                resolve(createGuard());
            });
        });
    }

    return Object.freeze<Mutex<T>>({
        [Symbol.toStringTag]: 'Mutex',

        async withLock<U>(fn: (value: T) => Promise<U> | U): Promise<U> {
            const guard = await lock();
            try {
                return await fn(guard.value);
            } finally {
                guard.unlock();
            }
        },

        lock,

        tryLock(): Option<MutexGuard<T>> {
            if (locked) {
                return None;
            }
            locked = true;
            return Some(createGuard());
        },

        isLocked(): boolean {
            return locked;
        },
    } as const);
}
