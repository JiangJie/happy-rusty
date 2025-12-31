/**
 * @module
 * Rust-inspired MPMC (multi-producer multi-consumer) channel for async message passing.
 *
 * Provides a type-safe channel with optional bounded capacity and backpressure support.
 * Supports rendezvous (capacity=0) for synchronous handoff between sender and receiver.
 *
 * @see https://doc.rust-lang.org/std/sync/mpmc/fn.channel.html
 */

import { ASYNC_NONE, None, Some, type AsyncOption, type Option } from '../../core/mod.ts';

// Internal cached Promise constants for runtime optimization
const ASYNC_TRUE = Promise.resolve(true);
const ASYNC_FALSE = Promise.resolve(false);

/**
 * A sender view of a channel that can only send values.
 *
 * Created by calling `channel.sender()`. Shares state with the parent channel.
 *
 * @typeParam T - The type of values that can be sent.
 *
 * @see https://doc.rust-lang.org/std/sync/mpmc/struct.Sender.html
 */
export interface Sender<T> {
    /**
     * The well-known symbol `Symbol.toStringTag` used by `Object.prototype.toString()`.
     * Returns `'Sender'` so that `Object.prototype.toString.call(sender)` produces `'[object Sender]'`.
     */
    readonly [Symbol.toStringTag]: 'Sender';

    /**
     * Custom `toString` implementation.
     * @example
     * ```ts
     * const sender = Channel<number>(10).sender;
     * console.log(sender.toString()); // 'Sender(0/10)'
     * ```
     */
    toString(): string;

    /**
     * The maximum number of values that can be buffered.
     * `0` for rendezvous channels, `Infinity` for unbounded channels.
     */
    readonly capacity: number;

    /**
     * The current number of values in the buffer.
     */
    readonly length: number;

    /**
     * Returns `true` if the channel has been closed.
     */
    readonly isClosed: boolean;

    /**
     * Returns `true` if the channel buffer is empty.
     * Note: A rendezvous channel (capacity=0) is always empty.
     */
    readonly isEmpty: boolean;

    /**
     * Returns `true` if the channel buffer is full.
     * Note: A rendezvous channel (capacity=0) is always full.
     */
    readonly isFull: boolean;

    /**
     * Sends a value into the channel, waiting if necessary.
     *
     * - If there are waiting receivers, delivers directly to one of them.
     * - If the buffer has space, adds to the buffer and returns immediately.
     * - If the buffer is full (or capacity is 0), waits until space is available.
     * - If the channel is closed, returns `false` immediately.
     *
     * @param value - The value to send.
     * @returns A promise that resolves to `true` if sent successfully, `false` if the channel is closed.
     *
     * @example
     * ```ts
     * const success = await sender.send(42);
     * if (!success) {
     *     console.log('Channel was closed');
     * }
     * ```
     */
    send(value: T): Promise<boolean>;

    /**
     * Attempts to send a value without waiting.
     *
     * - If there are waiting receivers, delivers directly and returns `true`.
     * - If the buffer has space, adds to the buffer and returns `true`.
     * - If the buffer is full or the channel is closed, returns `false`.
     *
     * @param value - The value to send.
     * @returns `true` if sent successfully, `false` if full or closed.
     *
     * @example
     * ```ts
     * if (!sender.trySend(42)) {
     *     console.log('Channel is full or closed');
     * }
     * ```
     */
    trySend(value: T): boolean;

    /**
     * Sends a value into the channel with a timeout.
     *
     * Like `send()`, but returns `false` if the operation cannot complete
     * within the specified timeout.
     *
     * @param value - The value to send.
     * @param ms - Timeout in milliseconds.
     * @returns A promise that resolves to `true` if sent successfully,
     *          `false` if timed out, channel is full, or closed.
     *
     * @example
     * ```ts
     * const success = await sender.sendTimeout(42, 1000);
     * if (!success) {
     *     console.log('Send timed out or channel closed');
     * }
     * ```
     */
    sendTimeout(value: T, ms: number): Promise<boolean>;
}

/**
 * A receiver view of a channel that can only receive values.
 *
 * Created by calling `channel.receiver()`. Shares state with the parent channel.
 * Implements `AsyncIterable` for use with `for await...of`.
 *
 * @typeParam T - The type of values that can be received.
 *
 * @see https://doc.rust-lang.org/std/sync/mpmc/struct.Receiver.html
 */
export interface Receiver<T> {
    /**
     * The well-known symbol `Symbol.toStringTag` used by `Object.prototype.toString()`.
     * Returns `'Receiver'` so that `Object.prototype.toString.call(receiver)` produces `'[object Receiver]'`.
     */
    readonly [Symbol.toStringTag]: 'Receiver';

    /**
     * Returns an async iterator that yields values until the channel is closed.
     *
     * @example
     * ```ts
     * for await (const msg of receiver) {
     *     console.log('Message:', msg);
     * }
     * console.log('Channel closed');
     * ```
     */
    [Symbol.asyncIterator](): AsyncIterator<T>;

    /**
     * Custom `toString` implementation.
     * @example
     * ```ts
     * const receiver = Channel<number>(10).receiver;
     * console.log(receiver.toString()); // 'Receiver(0/10)'
     * ```
     */
    toString(): string;

    /**
     * The maximum number of values that can be buffered.
     * `0` for rendezvous channels, `Infinity` for unbounded channels.
     */
    readonly capacity: number;

    /**
     * The current number of values in the buffer.
     */
    readonly length: number;

    /**
     * Returns `true` if the channel has been closed.
     */
    readonly isClosed: boolean;

    /**
     * Returns `true` if the channel buffer is empty.
     * Note: A rendezvous channel (capacity=0) is always empty.
     */
    readonly isEmpty: boolean;

    /**
     * Returns `true` if the channel buffer is full.
     * Note: A rendezvous channel (capacity=0) is always full.
     */
    readonly isFull: boolean;

    /**
     * Receives a value from the channel, waiting if necessary.
     *
     * - If the buffer has values, returns `Some(value)` immediately.
     * - If senders are waiting (rendezvous), receives directly from one.
     * - If the buffer is empty and not closed, waits for a value.
     * - If the channel is closed and empty, returns `None`.
     *
     * @returns A promise that resolves to `Some(value)` or `None` if closed and empty.
     *
     * @example
     * ```ts
     * const result = await receiver.receive();
     * if (result.isSome()) {
     *     console.log('Received:', result.unwrap());
     * } else {
     *     console.log('Channel closed');
     * }
     * ```
     */
    receive(): AsyncOption<T>;

    /**
     * Attempts to receive a value without waiting.
     *
     * - If the buffer has values, returns `Some(value)`.
     * - If senders are waiting (rendezvous), receives directly from one.
     * - Otherwise returns `None`.
     *
     * @returns `Some(value)` if available, `None` if empty.
     *
     * @example
     * ```ts
     * const result = receiver.tryReceive();
     * result.inspect((v) => console.log('Got:', v));
     * ```
     */
    tryReceive(): Option<T>;

    /**
     * Receives a value from the channel with a timeout.
     *
     * Like `receive()`, but returns `None` if the operation cannot complete
     * within the specified timeout.
     *
     * @param ms - Timeout in milliseconds.
     * @returns A promise that resolves to `Some(value)` or `None` if timed out,
     *          empty, or closed.
     *
     * @example
     * ```ts
     * const result = await receiver.receiveTimeout(1000);
     * if (result.isNone()) {
     *     console.log('Receive timed out or channel closed');
     * }
     * ```
     */
    receiveTimeout(ms: number): AsyncOption<T>;
}

/**
 * An MPMC (multi-producer multi-consumer) channel for async message passing.
 *
 * Channels allow multiple async tasks to communicate by sending and receiving
 * typed values. Values are delivered in FIFO order.
 *
 * @typeParam T - The type of values that can be sent through the channel.
 *
 * @example
 * ```ts
 * // Create a bounded channel with capacity 10
 * const channel = Channel<string>(10);
 *
 * // Producer
 * await channel.send('hello');
 * await channel.send('world');
 * channel.close();
 *
 * // Consumer
 * for await (const msg of channel) {
 *     console.log(msg);
 * }
 * ```
 *
 * @example
 * ```ts
 * // Rendezvous channel (direct handoff)
 * const channel = Channel<number>(0);
 *
 * // This will block until someone receives
 * const sendPromise = channel.send(42);
 *
 * // This unblocks the sender
 * const value = await channel.receive(); // Some(42)
 * await sendPromise; // Now completes
 * ```
 */
export interface Channel<T> {
    /**
     * The well-known symbol `Symbol.toStringTag` used by `Object.prototype.toString()`.
     * Returns `'Channel'` so that `Object.prototype.toString.call(channel)` produces `'[object Channel]'`.
     */
    readonly [Symbol.toStringTag]: 'Channel';

    /**
     * Returns an async iterator that yields values until the channel is closed.
     *
     * @example
     * ```ts
     * for await (const msg of channel) {
     *     console.log('Message:', msg);
     * }
     * ```
     */
    [Symbol.asyncIterator](): AsyncIterator<T>;

    /**
     * Custom `toString` implementation.
     * @example
     * ```ts
     * const ch = Channel<number>(10);
     * console.log(ch.toString()); // 'Channel(0/10)'
     *
     * ch.send(1);
     * console.log(ch.toString()); // 'Channel(1/10)'
     *
     * ch.close();
     * console.log(ch.toString()); // 'Channel(<closed>)'
     * ```
     */
    toString(): string;

    /**
     * The maximum number of values that can be buffered.
     * `0` for rendezvous channels, `Infinity` for unbounded channels.
     */
    readonly capacity: number;

    /**
     * The current number of values in the buffer.
     */
    readonly length: number;

    /**
     * Returns `true` if the channel has been closed.
     */
    readonly isClosed: boolean;

    /**
     * Returns `true` if the channel buffer is empty.
     * Note: A rendezvous channel (capacity=0) is always empty.
     */
    readonly isEmpty: boolean;

    /**
     * Returns `true` if the channel buffer is full.
     * Note: A rendezvous channel (capacity=0) is always full.
     */
    readonly isFull: boolean;

    /**
     * A sender-only view of this channel.
     *
     * The `Sender` shares state with this channel but only exposes
     * send-related methods. Useful for type-safe producer/consumer separation.
     *
     * @example
     * ```ts
     * const ch = Channel<number>(10);
     * const sender = ch.sender;
     *
     * // Pass to producer - they can only send
     * await sender.send(42);
     * // sender.receive() // Type error!
     * ```
     */
    readonly sender: Sender<T>;

    /**
     * A receiver-only view of this channel.
     *
     * The `Receiver` shares state with this channel but only exposes
     * receive-related methods. Useful for type-safe producer/consumer separation.
     *
     * @example
     * ```ts
     * const ch = Channel<number>(10);
     * const receiver = ch.receiver;
     *
     * // Pass to consumer - they can only receive
     * for await (const msg of receiver) {
     *     console.log(msg);
     * }
     * // receiver.send(1) // Type error!
     * ```
     */
    readonly receiver: Receiver<T>;

    /**
     * Sends a value into the channel, waiting if necessary.
     *
     * - If there are waiting receivers, delivers directly to one of them.
     * - If the buffer has space, adds to the buffer and returns immediately.
     * - If the buffer is full (or capacity is 0), waits until space is available.
     * - If the channel is closed, returns `false` immediately.
     *
     * @param value - The value to send.
     * @returns A promise that resolves to `true` if sent successfully, `false` if the channel is closed.
     */
    send(value: T): Promise<boolean>;

    /**
     * Attempts to send a value without waiting.
     *
     * - If there are waiting receivers, delivers directly and returns `true`.
     * - If the buffer has space, adds to the buffer and returns `true`.
     * - If the buffer is full or the channel is closed, returns `false`.
     *
     * @param value - The value to send.
     * @returns `true` if sent successfully, `false` if full or closed.
     */
    trySend(value: T): boolean;

    /**
     * Sends a value into the channel with a timeout.
     *
     * Like `send()`, but returns `false` if the operation cannot complete
     * within the specified timeout.
     *
     * @param value - The value to send.
     * @param ms - Timeout in milliseconds.
     * @returns A promise that resolves to `true` if sent successfully,
     *          `false` if timed out, channel is full, or closed.
     */
    sendTimeout(value: T, ms: number): Promise<boolean>;

    /**
     * Receives a value from the channel, waiting if necessary.
     *
     * - If the buffer has values, returns `Some(value)` immediately.
     * - If senders are waiting (rendezvous), receives directly from one.
     * - If the buffer is empty and not closed, waits for a value.
     * - If the channel is closed and empty, returns `None`.
     *
     * @returns A promise that resolves to `Some(value)` or `None` if closed and empty.
     */
    receive(): AsyncOption<T>;

    /**
     * Attempts to receive a value without waiting.
     *
     * - If the buffer has values, returns `Some(value)`.
     * - If senders are waiting (rendezvous), receives directly from one.
     * - Otherwise returns `None`.
     *
     * @returns `Some(value)` if available, `None` if empty.
     */
    tryReceive(): Option<T>;

    /**
     * Receives a value from the channel with a timeout.
     *
     * Like `receive()`, but returns `None` if the operation cannot complete
     * within the specified timeout.
     *
     * @param ms - Timeout in milliseconds.
     * @returns A promise that resolves to `Some(value)` or `None` if timed out,
     *          empty, or closed.
     */
    receiveTimeout(ms: number): AsyncOption<T>;

    /**
     * Closes the channel.
     *
     * After closing:
     * - `send()` and `trySend()` will return `false`.
     * - Pending senders will receive `false`.
     * - `receive()` will drain remaining buffered values, then return `None`.
     * - Pending receivers will receive `None` after the buffer is drained.
     *
     * Closing is idempotent - calling `close()` multiple times has no effect.
     *
     * @example
     * ```ts
     * const ch = Channel<number>(10);
     * ch.send(1);
     * ch.send(2);
     * ch.close();
     *
     * // Can still receive buffered values
     * await ch.receive(); // Some(1)
     * await ch.receive(); // Some(2)
     * await ch.receive(); // None
     * ```
     */
    close(): void;
}

/**
 * Creates a new MPMC channel with the specified capacity.
 *
 * @typeParam T - The type of values that can be sent through the channel.
 * @param capacity - Maximum buffer size. Defaults to `Infinity` (unbounded).
 *                   Use `0` for a rendezvous channel (direct handoff).
 * @returns A new `Channel<T>` instance.
 *
 * @example
 * ```ts
 * // Unbounded channel (default)
 * const unbounded = Channel<string>();
 *
 * // Bounded channel with backpressure
 * const bounded = Channel<string>(100);
 *
 * // Rendezvous channel (synchronous handoff)
 * const rendezvous = Channel<string>(0);
 * ```
 *
 * @example
 * ```ts
 * // Task queue with backpressure
 * const taskQueue = Channel<() => Promise<void>>(10);
 *
 * // Worker
 * (async () => {
 *     for await (const task of taskQueue) {
 *         await task();
 *     }
 * })();
 *
 * // Producer - will wait if queue is full
 * await taskQueue.send(async () => {
 *     console.log('Processing...');
 * });
 * ```
 *
 * @example
 * ```ts
 * // Log aggregation with multiple producers
 * const logs = Channel<string>(1000);
 *
 * // Multiple producers
 * async function logFromService(name: string) {
 *     const sender = logs.sender();
 *     await sender.send(`[${ name }] Started`);
 *     // ... do work ...
 *     await sender.send(`[${ name }] Finished`);
 * }
 *
 * // Single consumer writing to file
 * async function writeLogsToFile() {
 *     const receiver = logs.receiver();
 *     for await (const log of receiver) {
 *         await fs.appendFile('app.log', log + '\n');
 *     }
 * }
 * ```
 */
export function Channel<T>(capacity = Infinity): Channel<T> {
    interface SendWaiter { value: T; resolve: (success: boolean) => void; }
    type ReceiveWaiter = (value: Option<T>) => void;

    if (capacity < 0 || !Number.isInteger(capacity) && capacity !== Infinity) {
        throw new RangeError('Channel capacity must be a non-negative integer or Infinity');
    }

    const buffer: T[] = [];
    let closed = false;

    // Senders waiting for space (or for a receiver in rendezvous mode)
    const sendWaitQueue: SendWaiter[] = [];

    // Receivers waiting for values
    const receiveWaitQueue: ReceiveWaiter[] = [];

    // Cache for sender/receiver views
    let cachedSender: Sender<T> | undefined;
    let cachedReceiver: Receiver<T> | undefined;

    function send(value: T): Promise<boolean> {
        if (closed) {
            return ASYNC_FALSE;
        }

        // If there are waiting receivers, deliver directly (rendezvous or empty buffer)
        if (receiveWaitQueue.length > 0) {
            const receiver = receiveWaitQueue.shift() as ReceiveWaiter;
            receiver(Some(value));
            return ASYNC_TRUE;
        }

        // If buffer has space, add to buffer
        if (buffer.length < capacity) {
            buffer.push(value);
            return ASYNC_TRUE;
        }

        // Buffer is full (or capacity is 0), wait for space
        return new Promise<boolean>((resolve) => {
            sendWaitQueue.push({ value, resolve });
        });
    }

    function trySend(value: T): boolean {
        if (closed) {
            return false;
        }

        // If there are waiting receivers, deliver directly
        if (receiveWaitQueue.length > 0) {
            const receiver = receiveWaitQueue.shift() as ReceiveWaiter;
            receiver(Some(value));
            return true;
        }

        // If buffer has space, add to buffer
        if (buffer.length < capacity) {
            buffer.push(value);
            return true;
        }

        return false;
    }

    function receive(): AsyncOption<T> {
        // If buffer has items, return one
        if (buffer.length > 0) {
            const value = buffer.shift() as T;

            // Wake up a waiting sender if any (move their value to buffer)
            if (sendWaitQueue.length > 0) {
                const sender = sendWaitQueue.shift() as SendWaiter;
                buffer.push(sender.value);
                sender.resolve(true);
            }

            return Promise.resolve(Some(value));
        }

        // Buffer is empty, check for waiting senders (rendezvous)
        if (sendWaitQueue.length > 0) {
            const sender = sendWaitQueue.shift() as SendWaiter;
            sender.resolve(true);
            return Promise.resolve(Some(sender.value));
        }

        // Channel is closed and empty
        if (closed) {
            return ASYNC_NONE;
        }

        // Wait for a value
        return new Promise<Option<T>>((resolve) => {
            receiveWaitQueue.push(resolve);
        });
    }

    function tryReceive(): Option<T> {
        // If buffer has items, return one
        if (buffer.length > 0) {
            const value = buffer.shift() as T;

            // Wake up a waiting sender if any
            if (sendWaitQueue.length > 0) {
                const sender = sendWaitQueue.shift() as SendWaiter;
                buffer.push(sender.value);
                sender.resolve(true);
            }

            return Some(value);
        }

        // Buffer is empty, check for waiting senders (rendezvous)
        if (sendWaitQueue.length > 0) {
            const sender = sendWaitQueue.shift() as SendWaiter;
            sender.resolve(true);
            return Some(sender.value);
        }

        return None;
    }

    function close(): void {
        if (closed) {
            return;
        }
        closed = true;

        // Wake all waiting senders with false
        while (sendWaitQueue.length > 0) {
            const sender = sendWaitQueue.shift() as SendWaiter;
            sender.resolve(false);
        }

        // Wake all waiting receivers with None
        while (receiveWaitQueue.length > 0) {
            const receiver = receiveWaitQueue.shift() as ReceiveWaiter;
            receiver(None);
        }
    }

    function sendTimeout(value: T, ms: number): Promise<boolean> {
        if (closed) {
            return ASYNC_FALSE;
        }

        // If there are waiting receivers, deliver directly
        if (receiveWaitQueue.length > 0) {
            const receiver = receiveWaitQueue.shift() as ReceiveWaiter;
            receiver(Some(value));
            return ASYNC_TRUE;
        }

        // If buffer has space, add to buffer
        if (buffer.length < capacity) {
            buffer.push(value);
            return ASYNC_TRUE;
        }

        // Buffer is full, wait with timeout
        return new Promise<boolean>((resolve) => {
            const waiter: SendWaiter = { value, resolve };
            sendWaitQueue.push(waiter);

            const timeoutId = setTimeout(() => {
                const index = sendWaitQueue.indexOf(waiter);
                sendWaitQueue.splice(index, 1);
                resolve(false);
            }, ms);

            // Wrap the original resolve to clear the timeout
            const originalResolve = waiter.resolve;
            waiter.resolve = (success: boolean) => {
                clearTimeout(timeoutId);
                originalResolve(success);
            };
        });
    }

    function receiveTimeout(ms: number): AsyncOption<T> {
        // If buffer has items, return one
        if (buffer.length > 0) {
            const value = buffer.shift() as T;

            // Wake up a waiting sender if any
            if (sendWaitQueue.length > 0) {
                const sender = sendWaitQueue.shift() as SendWaiter;
                buffer.push(sender.value);
                sender.resolve(true);
            }

            return Promise.resolve(Some(value));
        }

        // Buffer is empty, check for waiting senders (rendezvous)
        if (sendWaitQueue.length > 0) {
            const sender = sendWaitQueue.shift() as SendWaiter;
            sender.resolve(true);
            return Promise.resolve(Some(sender.value));
        }

        // Channel is closed and empty
        if (closed) {
            return ASYNC_NONE;
        }

        // Wait with timeout
        return new Promise<Option<T>>((resolve) => {
            const wrappedWaiter: ReceiveWaiter = (value) => {
                clearTimeout(timeoutId);
                resolve(value);
            };

            receiveWaitQueue.push(wrappedWaiter);

            const timeoutId = setTimeout(() => {
                const index = receiveWaitQueue.indexOf(wrappedWaiter);
                receiveWaitQueue.splice(index, 1);
                resolve(None);
            }, ms);
        });
    }

    function asyncIterator(): AsyncIterator<T> {
        return {
            async next(): Promise<IteratorResult<T>> {
                const result = await receive();
                if (result.isNone()) {
                    return { done: true, value: undefined };
                }
                return { done: false, value: result.unwrap() };
            },
        };
    }

    function createSender(): Sender<T> {
        return Object.freeze<Sender<T>>({
            [Symbol.toStringTag]: 'Sender',

            toString(): string {
                if (closed) {
                    return 'Sender(<closed>)';
                }
                if (capacity === Infinity) {
                    return `Sender(${ buffer.length }/∞)`;
                }
                return `Sender(${ buffer.length }/${ capacity })`;
            },

            get capacity(): number {
                return capacity;
            },

            get length(): number {
                return buffer.length;
            },

            get isClosed(): boolean {
                return closed;
            },

            get isEmpty(): boolean {
                return buffer.length === 0;
            },

            get isFull(): boolean {
                return buffer.length >= capacity;
            },

            send,
            trySend,
            sendTimeout,
        });
    }

    function createReceiver(): Receiver<T> {
        return Object.freeze<Receiver<T>>({
            [Symbol.toStringTag]: 'Receiver',
            [Symbol.asyncIterator]: asyncIterator,

            toString(): string {
                if (closed) {
                    return 'Receiver(<closed>)';
                }
                if (capacity === Infinity) {
                    return `Receiver(${ buffer.length }/∞)`;
                }
                return `Receiver(${ buffer.length }/${ capacity })`;
            },

            get capacity(): number {
                return capacity;
            },

            get length(): number {
                return buffer.length;
            },

            get isClosed(): boolean {
                return closed;
            },

            get isEmpty(): boolean {
                return buffer.length === 0;
            },

            get isFull(): boolean {
                return buffer.length >= capacity;
            },

            receive,
            tryReceive,
            receiveTimeout,
        });
    }

    return Object.freeze<Channel<T>>({
        [Symbol.toStringTag]: 'Channel',
        [Symbol.asyncIterator]: asyncIterator,

        toString(): string {
            if (closed) {
                return 'Channel(<closed>)';
            }
            if (capacity === Infinity) {
                return `Channel(${ buffer.length }/∞)`;
            }
            return `Channel(${ buffer.length }/${ capacity })`;
        },

        get capacity(): number {
            return capacity;
        },

        get length(): number {
            return buffer.length;
        },

        get isClosed(): boolean {
            return closed;
        },

        get isEmpty(): boolean {
            return buffer.length === 0;
        },

        get isFull(): boolean {
            return buffer.length >= capacity;
        },

        get sender(): Sender<T> {
            return cachedSender ??= createSender();
        },

        get receiver(): Receiver<T> {
            return cachedReceiver ??= createReceiver();
        },

        send,
        trySend,
        sendTimeout,
        receive,
        tryReceive,
        receiveTimeout,
        close,
    } as const);
}
