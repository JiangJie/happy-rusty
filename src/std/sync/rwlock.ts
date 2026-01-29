/**
 * @module
 * Rust-inspired [RwLock](https://doc.rust-lang.org/std/sync/struct.RwLock.html) for async read-write locking.
 *
 * In JavaScript's single-threaded environment, `RwLock<T>` allows multiple
 * concurrent readers or a single exclusive writer. This is useful when
 * read operations are frequent and write operations are rare.
 *
 * **When to use RwLock vs Mutex:**
 * - Use `RwLock` when reads are frequent, writes are rare, and read operations
 *   contain `await` statements that could benefit from concurrent access.
 * - Use `Mutex` for simpler cases or when read/write frequency is balanced.
 *
 * **Important:** In JS, the benefit of RwLock is limited because:
 * - JS is single-threaded, so "parallel reads" don't truly execute simultaneously
 * - If read operations don't contain `await`, there's no opportunity for concurrency
 * - RwLock adds complexity over Mutex with marginal performance benefit
 */

import { None, Some, type Option } from '../../core/mod.ts';

/**
 * A guard that provides shared read access to the RwLock-protected value.
 *
 * Multiple read guards can exist simultaneously, but no write guards
 * can be acquired while any read guard is held.
 *
 * @typeParam T - The type of the protected value.
 */
export interface RwLockReadGuard<T> {
    /**
     * The well-known symbol `Symbol.toStringTag` used by `Object.prototype.toString()`.
     */
    readonly [Symbol.toStringTag]: 'RwLockReadGuard';

    /**
     * The protected value (read-only access).
     *
     * @example
     * ```ts
     * const guard = await rwlock.read();
     * console.log(guard.value); // Read the value
     * guard.unlock();
     * ```
     */
    readonly value: T;

    /**
     * Custom `toString` implementation.
     *
     * @returns A string representation of the guard.
     * @example
     * ```ts
     * const guard = await rwlock.read();
     * console.log(guard.toString()); // 'RwLockReadGuard(42)'
     * ```
     */
    toString(): string;

    /**
     * Releases the read lock.
     *
     * After calling `unlock()`, the guard should not be used.
     *
     * @example
     * ```ts
     * const guard = await rwlock.read();
     * try {
     *     console.log(guard.value);
     * } finally {
     *     guard.unlock();
     * }
     * ```
     */
    unlock(): void;
}

/**
 * A guard that provides exclusive write access to the RwLock-protected value.
 *
 * Only one write guard can exist at a time, and no read guards can be
 * acquired while a write guard is held.
 *
 * @typeParam T - The type of the protected value.
 */
export interface RwLockWriteGuard<T> {
    /**
     * The well-known symbol `Symbol.toStringTag` used by `Object.prototype.toString()`.
     */
    readonly [Symbol.toStringTag]: 'RwLockWriteGuard';

    /**
     * The protected value (read-write access).
     *
     * @example
     * ```ts
     * const guard = await rwlock.write();
     * console.log(guard.value); // Read the value
     * guard.value = newValue;   // Modify the value
     * guard.unlock();
     * ```
     */
    value: T;

    /**
     * Custom `toString` implementation.
     *
     * @returns A string representation of the guard.
     * @example
     * ```ts
     * const guard = await rwlock.write();
     * console.log(guard.toString()); // 'RwLockWriteGuard(42)'
     * ```
     */
    toString(): string;

    /**
     * Releases the write lock.
     *
     * After calling `unlock()`, the guard should not be used.
     *
     * @example
     * ```ts
     * const guard = await rwlock.write();
     * try {
     *     guard.value = newValue;
     * } finally {
     *     guard.unlock();
     * }
     * ```
     */
    unlock(): void;
}

/**
 * An async read-write lock for protecting shared data.
 *
 * This lock allows multiple concurrent readers or a single exclusive writer.
 * Writers are given priority to prevent writer starvation.
 *
 * @typeParam T - The type of the protected value.
 * @since 1.8.0
 * @see https://doc.rust-lang.org/std/sync/struct.RwLock.html
 * @example
 * ```ts
 * const config = RwLock({ apiUrl: 'https://api.example.com', timeout: 5000 });
 *
 * // Multiple readers can access simultaneously
 * async function getConfig() {
 *     const guard = await config.read();
 *     try {
 *         return { ...guard.value };
 *     } finally {
 *         guard.unlock();
 *     }
 * }
 *
 * // Writers get exclusive access
 * async function updateConfig(newConfig: Partial<Config>) {
 *     const guard = await config.write();
 *     try {
 *         Object.assign(guard.value, newConfig);
 *     } finally {
 *         guard.unlock();
 *     }
 * }
 * ```
 */
export interface RwLock<T> {
    /**
     * The well-known symbol `Symbol.toStringTag` used by `Object.prototype.toString()`.
     */
    readonly [Symbol.toStringTag]: 'RwLock';

    /**
     * Custom `toString` implementation.
     *
     * @example
     * ```ts
     * const rwlock = RwLock(42);
     * console.log(rwlock.toString()); // 'RwLock(<unlocked>)'
     * ```
     */
    toString(): string;

    /**
     * Acquires a read lock and executes the callback with the protected value.
     *
     * Multiple read operations can execute concurrently.
     *
     * @typeParam U - The return type of the callback.
     * @param fn - The callback that receives the protected value (read-only).
     * @returns A promise that resolves to the callback's return value.
     * @example
     * ```ts
     * const data = await rwlock.withRead(async (value) => {
     *     return value.items.filter(item => item.active);
     * });
     * ```
     */
    withRead<U>(fn: (value: T) => PromiseLike<U> | U): Promise<Awaited<U>>;

    /**
     * Acquires a write lock and executes the callback with the protected value.
     *
     * Write operations are exclusive - no other reads or writes can proceed.
     *
     * @typeParam U - The return type of the callback.
     * @param fn - The callback that receives the protected value (read-write).
     * @returns A promise that resolves to the callback's return value.
     * @example
     * ```ts
     * await rwlock.withWrite(async (value) => {
     *     value.items.push(await fetchNewItem());
     * });
     * ```
     */
    withWrite<U>(fn: (value: T) => PromiseLike<U> | U): Promise<Awaited<U>>;

    /**
     * Acquires a read lock and returns a guard for manual control.
     *
     * @returns A promise that resolves to a read guard.
     * @example
     * ```ts
     * const guard = await rwlock.read();
     * try {
     *     console.log(guard.value);
     * } finally {
     *     guard.unlock();
     * }
     * ```
     */
    read(): Promise<RwLockReadGuard<T>>;

    /**
     * Acquires a write lock and returns a guard for manual control.
     *
     * @returns A promise that resolves to a write guard.
     * @example
     * ```ts
     * const guard = await rwlock.write();
     * try {
     *     guard.value = newValue;
     * } finally {
     *     guard.unlock();
     * }
     * ```
     */
    write(): Promise<RwLockWriteGuard<T>>;

    /**
     * Attempts to acquire a read lock without waiting.
     *
     * Returns `None` if a write lock is currently held.
     *
     * @returns `Some(guard)` if acquired, `None` if a writer holds the lock.
     * @example
     * ```ts
     * const maybeGuard = rwlock.tryRead();
     * if (maybeGuard.isSome()) {
     *     const guard = maybeGuard.unwrap();
     *     try {
     *         console.log(guard.value);
     *     } finally {
     *         guard.unlock();
     *     }
     * }
     * ```
     */
    tryRead(): Option<RwLockReadGuard<T>>;

    /**
     * Attempts to acquire a write lock without waiting.
     *
     * Returns `None` if any read or write lock is currently held.
     *
     * @returns `Some(guard)` if acquired, `None` if any lock is held.
     * @example
     * ```ts
     * const maybeGuard = rwlock.tryWrite();
     * if (maybeGuard.isSome()) {
     *     const guard = maybeGuard.unwrap();
     *     try {
     *         guard.value = newValue;
     *     } finally {
     *         guard.unlock();
     *     }
     * }
     * ```
     */
    tryWrite(): Option<RwLockWriteGuard<T>>;

    /**
     * Returns the number of active readers.
     *
     * @example
     * ```ts
     * console.log(rwlock.readerCount()); // 0
     * const guard = await rwlock.read();
     * console.log(rwlock.readerCount()); // 1
     * ```
     */
    readerCount(): number;

    /**
     * Returns `true` if a writer currently holds the lock.
     *
     * @example
     * ```ts
     * console.log(rwlock.isWriteLocked()); // false
     * const guard = await rwlock.write();
     * console.log(rwlock.isWriteLocked()); // true
     * ```
     */
    isWriteLocked(): boolean;

    /**
     * Acquires a read lock and returns a copy of the protected value.
     *
     * @returns A promise that resolves to a copy of the value.
     * @example
     * ```ts
     * const value = await rwlock.get();
     * ```
     */
    get(): Promise<Awaited<T>>;

    /**
     * Acquires a write lock and sets a new value.
     *
     * @param value - The new value to set.
     * @returns A promise that resolves when the value has been set.
     * @example
     * ```ts
     * await rwlock.set(newValue);
     * ```
     */
    set(value: T): Promise<void>;

    /**
     * Acquires a write lock, sets a new value, and returns the old value.
     *
     * @param value - The new value to set.
     * @returns A promise that resolves to the old value.
     * @example
     * ```ts
     * const rwlock = RwLock(42);
     * const old = await rwlock.replace(100);
     * console.log(old); // 42
     * console.log(await rwlock.get()); // 100
     * ```
     */
    replace(value: T): Promise<Awaited<T>>;
}

/**
 * Creates a new `RwLock<T>` protecting the given value.
 *
 * @typeParam T - The type of the protected value.
 * @param value - The initial value to protect.
 * @returns A new `RwLock<T>` instance.
 * @example
 * ```ts
 * // Basic usage
 * const counter = RwLock(0);
 *
 * // Read (multiple can proceed)
 * const value = await counter.withRead(v => v);
 *
 * // Write (exclusive)
 * await counter.withWrite(v => v + 1);
 * ```
 *
 * @example
 * ```ts
 * // Cache with read-heavy workload
 * const cache = RwLock(new Map<string, Data>());
 *
 * // Many concurrent reads
 * async function get(key: string): Promise<Data | undefined> {
 *     return cache.withRead(map => map.get(key));
 * }
 *
 * // Occasional writes
 * async function set(key: string, value: Data): Promise<void> {
 *     await cache.withWrite(map => { map.set(key, value); });
 * }
 * ```
 *
 * @example
 * ```ts
 * // Configuration that's read frequently, updated rarely
 * interface AppConfig {
 *     apiUrl: string;
 *     timeout: number;
 *     features: string[];
 * }
 *
 * const config = RwLock<AppConfig>({
 *     apiUrl: 'https://api.example.com',
 *     timeout: 5000,
 *     features: ['feature-a', 'feature-b'],
 * });
 *
 * // Read config (concurrent)
 * async function isFeatureEnabled(feature: string): Promise<boolean> {
 *     return config.withRead(cfg => cfg.features.includes(feature));
 * }
 *
 * // Update config (exclusive)
 * async function enableFeature(feature: string): Promise<void> {
 *     await config.withWrite(cfg => {
 *         if (!cfg.features.includes(feature)) {
 *             cfg.features.push(feature);
 *         }
 *     });
 * }
 * ```
 */
export function RwLock<T>(value: T): RwLock<T> {
    let currentValue = value;
    let readers = 0;
    let writer = false;
    let pendingWriters = 0;

    const readWaitQueue: (() => void)[] = [];
    const writeWaitQueue: (() => void)[] = [];

    function tryAcquireRead(): boolean {
        // Can read if no writer and no pending writers (writer priority)
        if (!writer && pendingWriters === 0) {
            readers++;
            return true;
        }
        return false;
    }

    function tryAcquireWrite(): boolean {
        // Can write if no readers and no writer
        if (readers === 0 && !writer) {
            writer = true;
            return true;
        }
        return false;
    }

    function releaseRead(): void {
        readers--;

        // If no more readers, try to wake a writer
        if (readers === 0 && writeWaitQueue.length > 0) {
            const next = writeWaitQueue.shift() as () => void;
            writer = true;
            pendingWriters--;
            next();
        }
    }

    function releaseWrite(): void {
        writer = false;

        // Writers have priority, but if no writers waiting, wake all readers
        if (writeWaitQueue.length > 0) {
            const next = writeWaitQueue.shift() as () => void;
            writer = true;
            pendingWriters--;
            next();
        } else {
            // Wake all pending readers
            while (readWaitQueue.length > 0) {
                readers++;
                const next = readWaitQueue.shift() as () => void;
                next();
            }
        }
    }

    function createReadGuard(): RwLockReadGuard<T> {
        let released = false;

        return Object.freeze<RwLockReadGuard<T>>({
            [Symbol.toStringTag]: 'RwLockReadGuard',

            toString(): string {
                if (released) {
                    return 'RwLockReadGuard(<released>)';
                }
                return `RwLockReadGuard(${currentValue})`;
            },

            get value(): T {
                if (released) {
                    throw new Error('RwLockReadGuard has been released');
                }
                return currentValue;
            },

            unlock(): void {
                if (released) {
                    return;
                }
                released = true;
                releaseRead();
            },
        });
    }

    function createWriteGuard(): RwLockWriteGuard<T> {
        let released = false;

        return Object.freeze<RwLockWriteGuard<T>>({
            [Symbol.toStringTag]: 'RwLockWriteGuard',

            toString(): string {
                if (released) {
                    return 'RwLockWriteGuard(<released>)';
                }
                return `RwLockWriteGuard(${currentValue})`;
            },

            get value(): T {
                if (released) {
                    throw new Error('RwLockWriteGuard has been released');
                }
                return currentValue;
            },

            set value(newValue: T) {
                if (released) {
                    throw new Error('RwLockWriteGuard has been released');
                }
                currentValue = newValue;
            },

            unlock(): void {
                if (released) {
                    return;
                }
                released = true;
                releaseWrite();
            },
        } as const);
    }

    function read(): Promise<RwLockReadGuard<T>> {
        if (tryAcquireRead()) {
            return Promise.resolve(createReadGuard());
        }

        return new Promise<RwLockReadGuard<T>>((resolve) => {
            readWaitQueue.push(() => {
                resolve(createReadGuard());
            });
        });
    }

    function write(): Promise<RwLockWriteGuard<T>> {
        if (tryAcquireWrite()) {
            return Promise.resolve(createWriteGuard());
        }

        pendingWriters++;
        return new Promise<RwLockWriteGuard<T>>((resolve) => {
            writeWaitQueue.push(() => {
                resolve(createWriteGuard());
            });
        });
    }

    return Object.freeze<RwLock<T>>({
        [Symbol.toStringTag]: 'RwLock',

        toString(): string {
            if (writer) {
                return 'RwLock(<write-locked>)';
            }
            if (readers > 0) {
                return `RwLock(<read-locked:${readers}>)`;
            }
            return 'RwLock(<unlocked>)';
        },

        async withRead<U>(fn: (value: T) => PromiseLike<U> | U): Promise<Awaited<U>> {
            const guard = await read();
            try {
                return await fn(guard.value);
            } finally {
                guard.unlock();
            }
        },

        async withWrite<U>(fn: (value: T) => PromiseLike<U> | U): Promise<Awaited<U>> {
            const guard = await write();
            try {
                return await fn(guard.value);
            } finally {
                guard.unlock();
            }
        },

        read,

        write,

        tryRead(): Option<RwLockReadGuard<T>> {
            if (tryAcquireRead()) {
                return Some(createReadGuard());
            }
            return None;
        },

        tryWrite(): Option<RwLockWriteGuard<T>> {
            if (tryAcquireWrite()) {
                return Some(createWriteGuard());
            }
            return None;
        },

        readerCount(): number {
            return readers;
        },

        isWriteLocked(): boolean {
            return writer;
        },

        async get(): Promise<Awaited<T>> {
            const guard = await read();
            try {
                return guard.value as Awaited<T>;
            } finally {
                guard.unlock();
            }
        },

        async set(value: T): Promise<void> {
            const guard = await write();
            try {
                guard.value = value;
            } finally {
                guard.unlock();
            }
        },

        async replace(value: T): Promise<Awaited<T>> {
            const guard = await write();
            try {
                const old = guard.value;
                guard.value = value;
                return old as Awaited<T>;
            } finally {
                guard.unlock();
            }
        },
    } as const);
}
