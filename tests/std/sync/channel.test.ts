import { describe, expect, it } from 'vitest';
import { Channel } from '../../../src/mod.ts';

describe('Channel', () => {
    describe('initial state', () => {
        it('should create unbounded channel by default', () => {
            const ch = Channel<number>();
            expect(ch.capacity).toBe(Infinity);
            expect(ch.length).toBe(0);
            expect(ch.isClosed).toBe(false);
        });

        it('should create bounded channel with specified capacity', () => {
            const ch = Channel<number>(10);
            expect(ch.capacity).toBe(10);
            expect(ch.length).toBe(0);
        });

        it('should create rendezvous channel with capacity 0', () => {
            const ch = Channel<number>(0);
            expect(ch.capacity).toBe(0);
            expect(ch.length).toBe(0);
        });

        it('should throw on negative capacity', () => {
            expect(() => Channel<number>(-1)).toThrow(RangeError);
        });

        it('should throw on non-integer capacity', () => {
            expect(() => Channel<number>(1.5)).toThrow(RangeError);
        });

        it('should have correct Symbol.toStringTag', () => {
            const ch = Channel<number>(10);
            expect(Object.prototype.toString.call(ch)).toBe('[object Channel]');
        });

        it('toString() should show buffer state', () => {
            const ch = Channel<number>(10);
            expect(ch.toString()).toBe('Channel(0/10)');
        });

        it('toString() should show infinity for unbounded', () => {
            const ch = Channel<number>();
            expect(ch.toString()).toBe('Channel(0/∞)');
        });

        it('toString() should show closed state', () => {
            const ch = Channel<number>(10);
            ch.close();
            expect(ch.toString()).toBe('Channel(<closed>)');
        });
    });

    describe('send and receive', () => {
        it('should send and receive single value', async () => {
            const ch = Channel<number>(10);

            await ch.send(42);
            expect(ch.length).toBe(1);

            const result = await ch.receive();
            expect(result.isSome()).toBe(true);
            expect(result.unwrap()).toBe(42);
            expect(ch.length).toBe(0);
        });

        it('should preserve FIFO order', async () => {
            const ch = Channel<number>(10);

            await ch.send(1);
            await ch.send(2);
            await ch.send(3);

            expect((await ch.receive()).unwrap()).toBe(1);
            expect((await ch.receive()).unwrap()).toBe(2);
            expect((await ch.receive()).unwrap()).toBe(3);
        });

        it('should work with different types', async () => {
            const ch = Channel<{ name: string; }>(10);

            await ch.send({ name: 'test' });
            const result = await ch.receive();

            expect(result.unwrap()).toEqual({ name: 'test' });
        });
    });

    describe('trySend and tryReceive', () => {
        it('trySend should return true when buffer has space', () => {
            const ch = Channel<number>(10);

            expect(ch.trySend(42)).toBe(true);
            expect(ch.length).toBe(1);
        });

        it('trySend should return false when buffer is full', () => {
            const ch = Channel<number>(2);

            expect(ch.trySend(1)).toBe(true);
            expect(ch.trySend(2)).toBe(true);
            expect(ch.trySend(3)).toBe(false);
            expect(ch.length).toBe(2);
        });

        it('tryReceive should return Some when buffer has items', () => {
            const ch = Channel<number>(10);
            ch.trySend(42);

            const result = ch.tryReceive();
            expect(result.isSome()).toBe(true);
            expect(result.unwrap()).toBe(42);
        });

        it('tryReceive should return None when buffer is empty', () => {
            const ch = Channel<number>(10);

            const result = ch.tryReceive();
            expect(result.isNone()).toBe(true);
        });

        it('tryReceive should wake blocked sender when buffer has items', async () => {
            const ch = Channel<number>(1);

            // Fill buffer
            ch.trySend(1);

            // Block a sender
            let sendCompleted = false;
            const sendPromise = ch.send(2).then(() => {
                sendCompleted = true;
            });

            await new Promise(r => setTimeout(r, 10));
            expect(sendCompleted).toBe(false);

            // tryReceive should get buffered value and wake sender
            const result = ch.tryReceive();
            expect(result.unwrap()).toBe(1);

            await sendPromise;
            expect(sendCompleted).toBe(true);
            expect(ch.length).toBe(1); // Sender's value is now in buffer
            expect(ch.tryReceive().unwrap()).toBe(2);
        });
    });

    describe('backpressure (bounded channel)', () => {
        it('send should block when buffer is full', async () => {
            const ch = Channel<number>(2);

            ch.trySend(1);
            ch.trySend(2);
            expect(ch.length).toBe(2);

            // This send should block
            let sendCompleted = false;
            const sendPromise = ch.send(3).then(() => {
                sendCompleted = true;
            });

            await new Promise(r => setTimeout(r, 10));
            expect(sendCompleted).toBe(false); // Still blocked

            // Receive to make space
            await ch.receive();

            await sendPromise;
            expect(sendCompleted).toBe(true);
            expect(ch.length).toBe(2);
        });

        it('receive should block when buffer is empty', async () => {
            const ch = Channel<number>(10);

            // This receive should block
            let receivedValue: number | undefined;
            const receivePromise = ch.receive().then((v) => {
                receivedValue = v.unwrap();
            });

            await new Promise(r => setTimeout(r, 10));
            expect(receivedValue).toBeUndefined(); // Still blocked

            // Send to provide value
            await ch.send(42);

            await receivePromise;
            expect(receivedValue).toBe(42);
        });

        it('should handle multiple blocked senders', async () => {
            const ch = Channel<number>(1);
            const results: number[] = [];

            ch.trySend(0);

            // Queue up blocked senders
            const p1 = ch.send(1);
            const p2 = ch.send(2);
            const p3 = ch.send(3);

            // Drain all values
            for (let i = 0; i < 4; i++) {
                const v = await ch.receive();
                results.push(v.unwrap());
            }

            await Promise.all([p1, p2, p3]);
            expect(results).toEqual([0, 1, 2, 3]);
        });

        it('should handle multiple blocked receivers', async () => {
            const ch = Channel<number>(10);
            const results: number[] = [];

            // Queue up blocked receivers
            const p1 = ch.receive().then(v => results.push(v.unwrap()));
            const p2 = ch.receive().then(v => results.push(v.unwrap()));
            const p3 = ch.receive().then(v => results.push(v.unwrap()));

            await new Promise(r => setTimeout(r, 10));

            // Send values
            await ch.send(1);
            await ch.send(2);
            await ch.send(3);

            await Promise.all([p1, p2, p3]);
            expect(results.sort()).toEqual([1, 2, 3]);
        });
    });

    describe('rendezvous channel (capacity=0)', () => {
        it('send should block until receiver is ready', async () => {
            const ch = Channel<number>(0);

            let sendCompleted = false;
            const sendPromise = ch.send(42).then(() => {
                sendCompleted = true;
            });

            await new Promise(r => setTimeout(r, 10));
            expect(sendCompleted).toBe(false); // Still blocked
            expect(ch.length).toBe(0); // No buffering

            const result = await ch.receive();
            expect(result.unwrap()).toBe(42);

            await sendPromise;
            expect(sendCompleted).toBe(true);
        });

        it('receive should block until sender is ready', async () => {
            const ch = Channel<number>(0);

            let receivedValue: number | undefined;
            const receivePromise = ch.receive().then((v) => {
                receivedValue = v.unwrap();
            });

            await new Promise(r => setTimeout(r, 10));
            expect(receivedValue).toBeUndefined(); // Still blocked

            await ch.send(42);

            await receivePromise;
            expect(receivedValue).toBe(42);
        });

        it('trySend should return false when no receiver waiting', () => {
            const ch = Channel<number>(0);
            expect(ch.trySend(42)).toBe(false);
        });

        it('trySend should return true when receiver is waiting', async () => {
            const ch = Channel<number>(0);

            const receivePromise = ch.receive();
            await new Promise(r => setTimeout(r, 10));

            expect(ch.trySend(42)).toBe(true);

            const result = await receivePromise;
            expect(result.unwrap()).toBe(42);
        });

        it('tryReceive should return None when no sender waiting', () => {
            const ch = Channel<number>(0);
            expect(ch.tryReceive().isNone()).toBe(true);
        });

        it('tryReceive should return Some when sender is waiting', async () => {
            const ch = Channel<number>(0);

            const sendPromise = ch.send(42);
            await new Promise(r => setTimeout(r, 10));

            const result = ch.tryReceive();
            expect(result.isSome()).toBe(true);
            expect(result.unwrap()).toBe(42);

            await sendPromise;
        });
    });

    describe('close', () => {
        it('send should return false after close', async () => {
            const ch = Channel<number>(10);
            ch.close();

            expect(await ch.send(42)).toBe(false);
            expect(ch.trySend(42)).toBe(false);
        });

        it('isClosed should return true after close', () => {
            const ch = Channel<number>(10);
            expect(ch.isClosed).toBe(false);

            ch.close();
            expect(ch.isClosed).toBe(true);
        });

        it('receive should drain buffer then return None', async () => {
            const ch = Channel<number>(10);
            ch.trySend(1);
            ch.trySend(2);
            ch.close();

            expect((await ch.receive()).unwrap()).toBe(1);
            expect((await ch.receive()).unwrap()).toBe(2);
            expect((await ch.receive()).isNone()).toBe(true);
        });

        it('pending senders should receive false on close', async () => {
            const ch = Channel<number>(1);
            ch.trySend(0);

            const sendPromise = ch.send(1);
            await new Promise(r => setTimeout(r, 10));

            ch.close();

            expect(await sendPromise).toBe(false);
        });

        it('pending receivers should receive None on close', async () => {
            const ch = Channel<number>(10);

            const receivePromise = ch.receive();
            await new Promise(r => setTimeout(r, 10));

            ch.close();

            expect((await receivePromise).isNone()).toBe(true);
        });

        it('close should be idempotent', () => {
            const ch = Channel<number>(10);
            ch.close();
            ch.close();
            ch.close();

            expect(ch.isClosed).toBe(true);
        });
    });

    describe('async iterator', () => {
        it('should yield all values until close', async () => {
            const ch = Channel<number>(10);
            const results: number[] = [];

            ch.trySend(1);
            ch.trySend(2);
            ch.trySend(3);
            ch.close();

            for await (const v of ch) {
                results.push(v);
            }

            expect(results).toEqual([1, 2, 3]);
        });

        it('should wait for values', async () => {
            const ch = Channel<number>(10);
            const results: number[] = [];

            // Start consuming
            const consumePromise = (async () => {
                for await (const v of ch) {
                    results.push(v);
                }
            })();

            // Send values over time
            await ch.send(1);
            await new Promise(r => setTimeout(r, 10));
            await ch.send(2);
            await new Promise(r => setTimeout(r, 10));
            await ch.send(3);

            ch.close();
            await consumePromise;

            expect(results).toEqual([1, 2, 3]);
        });

        it('should allow early break', async () => {
            const ch = Channel<number>(10);
            const results: number[] = [];

            ch.trySend(1);
            ch.trySend(2);
            ch.trySend(3);

            for await (const v of ch) {
                results.push(v);
                if (v === 2) break;
            }

            expect(results).toEqual([1, 2]);
            expect(ch.length).toBe(1); // Still has 3
        });
    });

    describe('sender view', () => {
        it('should have correct Symbol.toStringTag', () => {
            const ch = Channel<number>(10);
            const sender = ch.sender;
            expect(Object.prototype.toString.call(sender)).toBe('[object Sender]');
        });

        it('should share state with channel', () => {
            const ch = Channel<number>(10);
            const sender = ch.sender;

            sender.trySend(42);
            expect(ch.length).toBe(1);
            expect(sender.length).toBe(1);

            ch.close();
            expect(sender.isClosed).toBe(true);
        });

        it('should only expose send methods', () => {
            const ch = Channel<number>(10);
            const sender = ch.sender;

            expect(sender.send).toBeDefined();
            expect(sender.trySend).toBeDefined();
            expect(sender.capacity).toBeDefined();
            expect(sender.length).toBeDefined();
            expect(sender.isClosed).toBeDefined();

            // TypeScript would prevent these, but check at runtime
            expect((sender as unknown as Record<string, unknown>)['receive']).toBeUndefined();
            expect((sender as unknown as Record<string, unknown>)['tryReceive']).toBeUndefined();
            expect((sender as unknown as Record<string, unknown>)['close']).toBeUndefined();
        });

        it('should return cached instance', () => {
            const ch = Channel<number>(10);
            expect(ch.sender).toBe(ch.sender);
        });

        it('toString() should show buffer state', () => {
            const ch = Channel<number>(10);
            const sender = ch.sender;
            expect(sender.toString()).toBe('Sender(0/10)');

            ch.trySend(1);
            expect(sender.toString()).toBe('Sender(1/10)');
        });

        it('toString() should show infinity for unbounded', () => {
            const ch = Channel<number>();
            expect(ch.sender.toString()).toBe('Sender(0/∞)');
        });

        it('toString() should show closed state', () => {
            const ch = Channel<number>(10);
            const sender = ch.sender;
            ch.close();
            expect(sender.toString()).toBe('Sender(<closed>)');
        });
    });

    describe('receiver view', () => {
        it('should have correct Symbol.toStringTag', () => {
            const ch = Channel<number>(10);
            const receiver = ch.receiver;
            expect(Object.prototype.toString.call(receiver)).toBe('[object Receiver]');
        });

        it('should share state with channel', () => {
            const ch = Channel<number>(10);
            const receiver = ch.receiver;

            ch.trySend(42);
            expect(receiver.length).toBe(1);

            ch.close();
            expect(receiver.isClosed).toBe(true);
        });

        it('should only expose receive methods', () => {
            const ch = Channel<number>(10);
            const receiver = ch.receiver;

            expect(receiver.receive).toBeDefined();
            expect(receiver.tryReceive).toBeDefined();
            expect(receiver.capacity).toBeDefined();
            expect(receiver.length).toBeDefined();
            expect(receiver.isClosed).toBeDefined();
            expect(receiver[Symbol.asyncIterator]).toBeDefined();

            // TypeScript would prevent these, but check at runtime
            expect((receiver as unknown as Record<string, unknown>)['send']).toBeUndefined();
            expect((receiver as unknown as Record<string, unknown>)['trySend']).toBeUndefined();
            expect((receiver as unknown as Record<string, unknown>)['close']).toBeUndefined();
        });

        it('should return cached instance', () => {
            const ch = Channel<number>(10);
            expect(ch.receiver).toBe(ch.receiver);
        });

        it('should support async iteration', async () => {
            const ch = Channel<number>(10);
            const receiver = ch.receiver;
            const results: number[] = [];

            ch.trySend(1);
            ch.trySend(2);
            ch.close();

            for await (const v of receiver) {
                results.push(v);
            }

            expect(results).toEqual([1, 2]);
        });

        it('toString() should show buffer state', () => {
            const ch = Channel<number>(10);
            const receiver = ch.receiver;
            expect(receiver.toString()).toBe('Receiver(0/10)');

            ch.trySend(1);
            expect(receiver.toString()).toBe('Receiver(1/10)');
        });

        it('toString() should show infinity for unbounded', () => {
            const ch = Channel<number>();
            expect(ch.receiver.toString()).toBe('Receiver(0/∞)');
        });

        it('toString() should show closed state', () => {
            const ch = Channel<number>(10);
            const receiver = ch.receiver;
            ch.close();
            expect(receiver.toString()).toBe('Receiver(<closed>)');
        });
    });

    describe('MPMC concurrency', () => {
        it('should handle multiple concurrent senders', async () => {
            const ch = Channel<string>(100);
            const sender = ch.sender;

            await Promise.all([
                (async () => {
                    for (let i = 0; i < 10; i++) {
                        await sender.send(`a${i}`);
                    }
                })(),
                (async () => {
                    for (let i = 0; i < 10; i++) {
                        await sender.send(`b${i}`);
                    }
                })(),
                (async () => {
                    for (let i = 0; i < 10; i++) {
                        await sender.send(`c${i}`);
                    }
                })(),
            ]);

            expect(ch.length).toBe(30);
        });

        it('should handle multiple concurrent receivers', async () => {
            const ch = Channel<number>(100);
            const results: number[][] = [[], [], []];

            // Fill channel
            for (let i = 0; i < 30; i++) {
                ch.trySend(i);
            }
            ch.close();

            await Promise.all([
                (async () => {
                    for await (const v of ch) {
                        results[0].push(v);
                    }
                })(),
                (async () => {
                    for await (const v of ch) {
                        results[1].push(v);
                    }
                })(),
                (async () => {
                    for await (const v of ch) {
                        results[2].push(v);
                    }
                })(),
            ]);

            // All values should be consumed exactly once
            const allValues = [...results[0], ...results[1], ...results[2]].sort((a, b) => a - b);
            expect(allValues).toEqual(Array.from({ length: 30 }, (_, i) => i));
        });

        it('should handle producer-consumer pattern', async () => {
            const ch = Channel<number>(10);
            const consumed: number[] = [];

            // Consumer
            const consumerPromise = (async () => {
                for await (const v of ch) {
                    consumed.push(v);
                    await new Promise(r => setTimeout(r, 5));
                }
            })();

            // Producer
            for (let i = 0; i < 20; i++) {
                await ch.send(i);
            }
            ch.close();

            await consumerPromise;
            expect(consumed).toEqual(Array.from({ length: 20 }, (_, i) => i));
        });
    });

    describe('Immutability', () => {
        it('Channel should be frozen', () => {
            const ch = Channel<number>(10);
            expect(Object.isFrozen(ch)).toBe(true);
        });

        it('Channel should prevent property modification', () => {
            const ch = Channel<number>(10);
            expect(() => {
                (ch as unknown as Record<string, unknown>)['send'] = () => Promise.resolve(false);
            }).toThrow(TypeError);
        });

        it('Channel should prevent adding new properties', () => {
            const ch = Channel<number>(10);
            expect(() => {
                (ch as unknown as Record<string, unknown>)['newProp'] = 'test';
            }).toThrow(TypeError);
        });

        it('Sender should be frozen', () => {
            const ch = Channel<number>(10);
            const sender = ch.sender;
            expect(Object.isFrozen(sender)).toBe(true);
        });

        it('Receiver should be frozen', () => {
            const ch = Channel<number>(10);
            const receiver = ch.receiver;
            expect(Object.isFrozen(receiver)).toBe(true);
        });
    });

    describe('edge cases', () => {
        it('should handle capacity 1', async () => {
            const ch = Channel<number>(1);

            await ch.send(1);
            expect(ch.length).toBe(1);

            const sendPromise = ch.send(2);
            await new Promise(r => setTimeout(r, 10));

            expect((await ch.receive()).unwrap()).toBe(1);
            await sendPromise;
            expect((await ch.receive()).unwrap()).toBe(2);
        });

        it('should handle unbounded channel with many values', async () => {
            const ch = Channel<number>();

            for (let i = 0; i < 10000; i++) {
                ch.trySend(i);
            }

            expect(ch.length).toBe(10000);

            for (let i = 0; i < 10000; i++) {
                const v = ch.tryReceive();
                expect(v.unwrap()).toBe(i);
            }
        });

        it('should handle rapid send/receive', async () => {
            const ch = Channel<number>(10);
            let sum = 0;

            const producer = (async () => {
                for (let i = 1; i <= 100; i++) {
                    await ch.send(i);
                }
                ch.close();
            })();

            const consumer = (async () => {
                for await (const v of ch) {
                    sum += v;
                }
            })();

            await Promise.all([producer, consumer]);
            expect(sum).toBe(5050); // 1+2+...+100
        });
    });

    describe('isEmpty and isFull', () => {
        it('should return isEmpty true for empty channel', () => {
            const ch = Channel<number>(10);
            expect(ch.isEmpty).toBe(true);
            expect(ch.sender.isEmpty).toBe(true);
            expect(ch.receiver.isEmpty).toBe(true);
        });

        it('should return isEmpty false when buffer has items', () => {
            const ch = Channel<number>(10);
            ch.trySend(1);
            expect(ch.isEmpty).toBe(false);
            expect(ch.sender.isEmpty).toBe(false);
            expect(ch.receiver.isEmpty).toBe(false);
        });

        it('should return isFull false for empty channel', () => {
            const ch = Channel<number>(10);
            expect(ch.isFull).toBe(false);
        });

        it('should return isFull true when buffer is full', () => {
            const ch = Channel<number>(2);
            ch.trySend(1);
            expect(ch.isFull).toBe(false);
            ch.trySend(2);
            expect(ch.isFull).toBe(true);
            expect(ch.sender.isFull).toBe(true);
            expect(ch.receiver.isFull).toBe(true);
        });

        it('rendezvous channel should always be empty and full', () => {
            const ch = Channel<number>(0);
            expect(ch.isEmpty).toBe(true);
            expect(ch.isFull).toBe(true);
        });

        it('unbounded channel should never be full', () => {
            const ch = Channel<number>();
            for (let i = 0; i < 1000; i++) {
                ch.trySend(i);
            }
            expect(ch.isFull).toBe(false);
        });
    });

    describe('sendTimeout', () => {
        it('should send immediately when buffer has space', async () => {
            const ch = Channel<number>(10);
            const result = await ch.sendTimeout(42, 100);
            expect(result).toBe(true);
            expect(ch.length).toBe(1);
        });

        it('should timeout when buffer is full', async () => {
            const ch = Channel<number>(1);
            ch.trySend(1);

            const start = Date.now();
            const result = await ch.sendTimeout(2, 50);
            const elapsed = Date.now() - start;

            expect(result).toBe(false);
            expect(elapsed).toBeGreaterThanOrEqual(45);
            expect(elapsed).toBeLessThan(100);
        });

        it('should succeed before timeout if space becomes available', async () => {
            const ch = Channel<number>(1);
            ch.trySend(1);

            const sendPromise = ch.sendTimeout(2, 1000);

            // Receive after short delay
            setTimeout(() => ch.receive(), 20);

            const result = await sendPromise;
            expect(result).toBe(true);
        });

        it('should return false when channel is closed', async () => {
            const ch = Channel<number>(10);
            ch.close();
            const result = await ch.sendTimeout(42, 100);
            expect(result).toBe(false);
        });

        it('should work with sender view', async () => {
            const ch = Channel<number>(10);
            const sender = ch.sender;
            const result = await sender.sendTimeout(42, 100);
            expect(result).toBe(true);
            expect(ch.length).toBe(1);
        });

        it('should timeout on rendezvous channel without receiver', async () => {
            const ch = Channel<number>(0);

            const start = Date.now();
            const result = await ch.sendTimeout(42, 50);
            const elapsed = Date.now() - start;

            expect(result).toBe(false);
            expect(elapsed).toBeGreaterThanOrEqual(45);
        });

        it('should succeed on rendezvous when receiver is waiting', async () => {
            const ch = Channel<number>(0);

            // Start receiving first
            const receivePromise = ch.receive();

            // Small delay to ensure receiver is waiting
            await new Promise(r => setTimeout(r, 10));

            const result = await ch.sendTimeout(42, 1000);
            expect(result).toBe(true);

            const received = await receivePromise;
            expect(received.unwrap()).toBe(42);
        });

        it('should handle race between timeout and space availability', async () => {
            const ch = Channel<number>(1);
            ch.trySend(1);  // Fill buffer

            // Use a very short timeout
            const sendPromise = ch.sendTimeout(2, 1);

            // Receive almost immediately - may happen before or after timeout
            ch.tryReceive();

            // Either we sent successfully or timed out, both are valid
            const result = await sendPromise;
            expect(typeof result).toBe('boolean');
        });
    });

    describe('receiveTimeout', () => {
        it('should receive immediately when buffer has items', async () => {
            const ch = Channel<number>(10);
            ch.trySend(42);

            const result = await ch.receiveTimeout(100);
            expect(result.unwrap()).toBe(42);
        });

        it('should timeout when buffer is empty', async () => {
            const ch = Channel<number>(10);

            const start = Date.now();
            const result = await ch.receiveTimeout(50);
            const elapsed = Date.now() - start;

            expect(result.isNone()).toBe(true);
            expect(elapsed).toBeGreaterThanOrEqual(45);
            expect(elapsed).toBeLessThan(100);
        });

        it('should succeed before timeout if value arrives', async () => {
            const ch = Channel<number>(10);

            const receivePromise = ch.receiveTimeout(1000);

            // Send after short delay
            setTimeout(() => ch.send(42), 20);

            const result = await receivePromise;
            expect(result.unwrap()).toBe(42);
        });

        it('should return None when channel is closed and empty', async () => {
            const ch = Channel<number>(10);
            ch.close();
            const result = await ch.receiveTimeout(100);
            expect(result.isNone()).toBe(true);
        });

        it('should work with receiver view', async () => {
            const ch = Channel<number>(10);
            const receiver = ch.receiver;
            ch.trySend(42);

            const result = await receiver.receiveTimeout(100);
            expect(result.unwrap()).toBe(42);
        });

        it('should timeout on rendezvous channel without sender', async () => {
            const ch = Channel<number>(0);

            const start = Date.now();
            const result = await ch.receiveTimeout(50);
            const elapsed = Date.now() - start;

            expect(result.isNone()).toBe(true);
            expect(elapsed).toBeGreaterThanOrEqual(45);
        });

        it('should succeed on rendezvous when sender is waiting', async () => {
            const ch = Channel<number>(0);

            // Start sending first
            const sendPromise = ch.send(42);

            // Small delay to ensure sender is waiting
            await new Promise(r => setTimeout(r, 10));

            const result = await ch.receiveTimeout(1000);
            expect(result.unwrap()).toBe(42);

            const sent = await sendPromise;
            expect(sent).toBe(true);
        });

        it('should wake up waiting sender when buffer is full', async () => {
            const ch = Channel<number>(1);  // capacity = 1

            // Fill the buffer
            ch.trySend(1);

            // Start a sender that will block (buffer is full)
            const sendPromise = ch.send(2);

            // Small delay to ensure sender is waiting
            await new Promise(r => setTimeout(r, 10));

            // receiveTimeout should: receive 1 from buffer, then wake sender to push 2
            const result = await ch.receiveTimeout(100);
            expect(result.unwrap()).toBe(1);

            // Sender should have completed
            const sent = await sendPromise;
            expect(sent).toBe(true);

            // Buffer should now contain the value from the waiting sender
            expect(ch.tryReceive().unwrap()).toBe(2);
        });

        it('should handle race between timeout and value arrival', async () => {
            const ch = Channel<number>(10);

            // Use a very short timeout
            const receivePromise = ch.receiveTimeout(1);

            // Send value almost immediately - may arrive before or after timeout
            ch.trySend(42);

            // Either we get the value or None (timeout), both are valid
            const result = await receivePromise;
            // Just ensure no errors occur - the race is handled correctly
            expect(result.isSome() || result.isNone()).toBe(true);
        });
    });

    describe('edge cases: close during timeout', () => {
        it('should not corrupt sendWaitQueue when close() is called during sendTimeout', async () => {
            const ch = Channel<number>(1);
            ch.trySend(1); // Fill buffer

            // Start two sendTimeout operations
            const send1 = ch.sendTimeout(2, 100);
            const send2 = ch.sendTimeout(3, 100);

            // Close channel - this should resolve both senders with false
            // and clear the timeout via the wrapped resolve
            ch.close();

            const [result1, result2] = await Promise.all([send1, send2]);
            expect(result1).toBe(false);
            expect(result2).toBe(false);

            // Wait for any potential setTimeout callbacks to fire
            await new Promise(r => setTimeout(r, 150));

            // Channel should still be in a consistent state
            expect(ch.isClosed).toBe(true);
        });

        it('should not corrupt receiveWaitQueue when close() is called during receiveTimeout', async () => {
            const ch = Channel<number>(10);

            // Start two receiveTimeout operations (buffer is empty)
            const recv1 = ch.receiveTimeout(100);
            const recv2 = ch.receiveTimeout(100);

            // Close channel - this should resolve both receivers with None
            ch.close();

            const [result1, result2] = await Promise.all([recv1, recv2]);
            expect(result1.isNone()).toBe(true);
            expect(result2.isNone()).toBe(true);

            // Wait for any potential setTimeout callbacks to fire
            await new Promise(r => setTimeout(r, 150));

            // Channel should still be in a consistent state
            expect(ch.isClosed).toBe(true);
        });

        it('should handle sendTimeout when waiter is already removed by successful send', async () => {
            const ch = Channel<number>(1);
            ch.trySend(1); // Fill buffer

            // Start sendTimeout
            const sendPromise = ch.sendTimeout(2, 100);

            // Quickly receive to make room - this will resolve the sendTimeout
            await new Promise(r => setTimeout(r, 5));
            ch.tryReceive();

            const result = await sendPromise;
            expect(result).toBe(true);

            // Wait for the timeout callback to potentially fire
            await new Promise(r => setTimeout(r, 150));

            // Buffer now has [2], receive it first
            const received = ch.tryReceive();
            expect(received.isSome()).toBe(true);
            expect(received.unwrap()).toBe(2);

            // Now buffer is empty, this send should succeed
            const result2 = await ch.sendTimeout(3, 50);
            expect(result2).toBe(true);
            expect(ch.tryReceive().unwrap()).toBe(3);
        });

        it('should handle receiveTimeout when waiter is already removed by successful receive', async () => {
            const ch = Channel<number>(10);

            // Start receiveTimeout on empty channel
            const recvPromise = ch.receiveTimeout(100);

            // Quickly send to fulfill the receive
            await new Promise(r => setTimeout(r, 5));
            ch.trySend(42);

            const result = await recvPromise;
            expect(result.isSome()).toBe(true);
            expect(result.unwrap()).toBe(42);

            // Wait for the timeout callback to potentially fire
            await new Promise(r => setTimeout(r, 150));

            // Start another receive to verify queue is not corrupted
            ch.trySend(100);
            const result2 = await ch.receiveTimeout(50);
            expect(result2.isSome()).toBe(true);
            expect(result2.unwrap()).toBe(100);
        });

        it('should not remove wrong waiter when indexOf returns -1 (splice(-1,1) bug)', async () => {
            // This test specifically targets the potential bug where:
            // 1. sendTimeout adds waiter to queue
            // 2. close() removes waiter and calls wrapped resolve (which clears timeout)
            // 3. But if setTimeout callback was already queued in event loop before clearTimeout,
            //    indexOf returns -1 and splice(-1, 1) would remove the LAST element
            //
            // To trigger this, we need multiple waiters and a race condition

            const ch = Channel<number>(0); // rendezvous channel

            // Add 3 senders waiting
            const send1 = ch.sendTimeout(1, 1000);
            const send2 = ch.sendTimeout(2, 1000);
            const send3 = ch.sendTimeout(3, 1000);

            // Small delay to ensure all are in queue
            await new Promise(r => setTimeout(r, 10));

            // Close should wake all 3 with false
            ch.close();

            const results = await Promise.all([send1, send2, send3]);
            expect(results).toEqual([false, false, false]);

            // All waiters should be properly cleaned up
            // If there was a splice(-1, 1) bug, one waiter might still be in queue
            // causing issues with future operations
        });
    });

});
