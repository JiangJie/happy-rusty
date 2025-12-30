/**
 * Channel example: MPMC async message passing
 *
 * Demonstrates using Channel for producer-consumer patterns,
 * backpressure control, and rendezvous synchronization.
 */
import { Channel, type Receiver, type Sender } from '../../../src/mod.ts';

// ============================================================================
// Example 1: Basic send and receive
// ============================================================================
console.log('=== Example 1: Basic send and receive ===\n');

const basicChannel = Channel<string>(10);

await basicChannel.send('hello');
await basicChannel.send('world');

console.log(`Buffer length: ${basicChannel.length}`);

const msg1 = await basicChannel.receive();
const msg2 = await basicChannel.receive();

console.log(`Received: ${msg1.unwrap()}, ${msg2.unwrap()}`);

basicChannel.close();

// ============================================================================
// Example 2: Producer-Consumer pattern with async iterator
// ============================================================================
console.log('\n=== Example 2: Producer-Consumer with async iterator ===\n');

const taskChannel = Channel<number>(5);

// Producer
const producer = (async () => {
    for (let i = 1; i <= 10; i++) {
        console.log(`  Producing: ${i}`);
        await taskChannel.send(i);
    }
    taskChannel.close();
    console.log('  Producer finished');
})();

// Consumer using async iterator
const consumer = (async () => {
    let sum = 0;
    for await (const num of taskChannel) {
        console.log(`  Consuming: ${num}`);
        sum += num;
        // Simulate processing time
        await new Promise(r => setTimeout(r, 10));
    }
    console.log(`  Consumer finished, sum = ${sum}`);
})();

await Promise.all([producer, consumer]);

// ============================================================================
// Example 3: Bounded channel with backpressure
// ============================================================================
console.log('\n=== Example 3: Bounded channel with backpressure ===\n');

const boundedChannel = Channel<string>(2);

console.log('Buffer capacity: 2');
console.log('Sending 3 messages (third will block until receive)...\n');

// Start sends
const send1 = boundedChannel.send('A').then(() => console.log('  Sent: A'));
const send2 = boundedChannel.send('B').then(() => console.log('  Sent: B'));
const send3 = boundedChannel.send('C').then(() => console.log('  Sent: C (was blocked)'));

// Wait a bit, then start receiving
await new Promise(r => setTimeout(r, 50));
console.log(`\n  Buffer length before receive: ${boundedChannel.length}`);

await boundedChannel.receive();
console.log('  Received one message');

await Promise.all([send1, send2, send3]);
console.log(`\n  Buffer length after all sends: ${boundedChannel.length}`);

// Drain remaining
while (boundedChannel.length > 0) {
    await boundedChannel.receive();
}
boundedChannel.close();

// ============================================================================
// Example 4: Rendezvous channel (direct handoff)
// ============================================================================
console.log('\n=== Example 4: Rendezvous channel (capacity=0) ===\n');

const rendezvous = Channel<string>(0);

console.log('Rendezvous: sender blocks until receiver is ready\n');

// Sender (will block)
const senderDone = rendezvous.send('handoff').then(() => {
    console.log('  Sender: handoff complete!');
});

console.log('  Sender started (blocking)...');
await new Promise(r => setTimeout(r, 50));

console.log('  Receiver starting...');
const value = await rendezvous.receive();
console.log(`  Receiver got: ${value.unwrap()}`);

await senderDone;
rendezvous.close();

// ============================================================================
// Example 5: Multiple producers, single consumer (MPSC pattern)
// ============================================================================
console.log('\n=== Example 5: Multiple producers (MPSC) ===\n');

interface LogMessage {
    source: string;
    message: string;
}

const logChannel = Channel<LogMessage>(100);

// Multiple producers (services)
async function serviceLogger(name: string, count: number) {
    const sender = logChannel.sender;
    for (let i = 1; i <= count; i++) {
        await sender.send({ source: name, message: `Log entry ${i}` });
        await new Promise(r => setTimeout(r, 5));
    }
}

// Single consumer (log writer)
const logs: string[] = [];
const logWriter = (async () => {
    const receiver = logChannel.receiver;
    for await (const log of receiver) {
        logs.push(`[${log.source}] ${log.message}`);
    }
})();

// Start multiple producers
await Promise.all([
    serviceLogger('auth', 3),
    serviceLogger('api', 3),
    serviceLogger('db', 3),
]);

logChannel.close();
await logWriter;

console.log('Collected logs:');
logs.forEach(log => console.log(`  ${log}`));

// ============================================================================
// Example 6: Multiple consumers (work stealing)
// ============================================================================
console.log('\n=== Example 6: Multiple consumers (work stealing) ===\n');

const workQueue = Channel<{ id: number; data: string; }>(10);

// Fill work queue
for (let i = 1; i <= 6; i++) {
    workQueue.trySend({ id: i, data: `task-${i}` });
}
workQueue.close();

console.log('Starting 3 workers to process 6 tasks...\n');

const results: string[] = [];

async function worker(name: string) {
    const receiver = workQueue.receiver;
    for await (const task of receiver) {
        console.log(`  ${name} processing task ${task.id}`);
        await new Promise(r => setTimeout(r, 20));
        results.push(`${name}:${task.id}`);
    }
    console.log(`  ${name} finished`);
}

await Promise.all([
    worker('Worker-A'),
    worker('Worker-B'),
    worker('Worker-C'),
]);

console.log(`\nResults: ${results.join(', ')}`);

// ============================================================================
// Example 7: Non-blocking operations
// ============================================================================
console.log('\n=== Example 7: Non-blocking operations ===\n');

const fastChannel = Channel<number>(2);

// trySend - non-blocking send
console.log('trySend to empty channel:');
console.log(`  trySend(1): ${fastChannel.trySend(1)}`);
console.log(`  trySend(2): ${fastChannel.trySend(2)}`);
console.log(`  trySend(3): ${fastChannel.trySend(3)} (buffer full)`);

// tryReceive - non-blocking receive
console.log('\ntryReceive from channel:');
console.log(`  tryReceive(): ${fastChannel.tryReceive().unwrap()}`);
console.log(`  tryReceive(): ${fastChannel.tryReceive().unwrap()}`);
console.log(`  tryReceive(): ${fastChannel.tryReceive().isNone() ? 'None (empty)' : 'Some'}`);

fastChannel.close();

// ============================================================================
// Example 8: Graceful shutdown
// ============================================================================
console.log('\n=== Example 8: Graceful shutdown ===\n');

const shutdownChannel = Channel<string>(10);

// Long-running consumer
const longConsumer = (async () => {
    console.log('  Consumer started');
    for await (const msg of shutdownChannel) {
        console.log(`  Processing: ${msg}`);
        await new Promise(r => setTimeout(r, 30));
    }
    console.log('  Consumer: channel closed, shutting down gracefully');
})();

// Producer sends some messages then closes
await shutdownChannel.send('task-1');
await shutdownChannel.send('task-2');
await shutdownChannel.send('task-3');

console.log('  Closing channel...');
shutdownChannel.close();

// Verify pending sends fail after close
const sendAfterClose = await shutdownChannel.send('task-4');
console.log(`  Send after close: ${sendAfterClose ? 'success' : 'failed (expected)'}`);

await longConsumer;

// ============================================================================
// Example 9: Sender/Receiver separation for type safety
// ============================================================================
console.log('\n=== Example 9: Sender/Receiver type separation ===\n');

interface Log {
    type: string;
    payload: unknown;
};

const typedChannel = Channel<Log>(10);

// Producer only sees Sender interface
async function producerOnly(sender: Sender<Log>) {
    await sender.send({ type: 'event', payload: { userId: 123 } });
    await sender.send({ type: 'log', payload: 'Hello' });
    console.log('  Producer sent 2 messages');
    // sender.receive() would be a TypeScript error!
}

// Consumer only sees Receiver interface
async function consumerOnly(receiver: Receiver<Log>) {
    let count = 0;
    for await (const msg of receiver) {
        console.log(`  Consumer got: ${msg.type}`);
        count++;
    }
    console.log(`  Consumer processed ${count} messages`);
    // receiver.send() would be a TypeScript error!
}

const producerTask = producerOnly(typedChannel.sender);
await producerTask;
typedChannel.close();
await consumerOnly(typedChannel.receiver);

console.log('\n=== All examples complete ===\n');
