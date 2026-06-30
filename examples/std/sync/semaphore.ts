/**
 * Semaphore Examples
 *
 * Demonstrates how to use Semaphore to limit async concurrency.
 *
 * Unlike Mutex<T> (which protects a value), Semaphore is a pure concurrency
 * counter: it limits how many async operations can run at the same time.
 *
 * Common use cases:
 * 1. Limiting concurrent fetch/HTTP requests (avoid rate limits)
 * 2. Database connection pools
 * 3. Task queue with backpressure
 */

import { Semaphore } from '../../../src/mod.ts';

// ============================================================================
// Example 1: Basic Acquire/Release
// ============================================================================

console.log('=== Example 1: Basic Acquire/Release ===\n');

const sem1 = Semaphore(3);

console.log(`Initial: ${sem1.toString()}`);

const permit = await sem1.acquire();
console.log(`After acquire: ${sem1.toString()}`);

permit.release();
console.log(`After release: ${sem1.toString()}`);

// ============================================================================
// Example 2: withPermit (Recommended)
// ============================================================================

console.log('\n=== Example 2: withPermit (Recommended) ===\n');

const sem2 = Semaphore(2);

// withPermit automatically acquires and releases, even on exceptions
const result = await sem2.withPermit(async () => {
    console.log(`Inside withPermit: ${sem2.toString()}`);
    return 42;
});

console.log(`Result: ${result}, after: ${sem2.toString()}`);

// ============================================================================
// Example 3: Limiting Concurrent Operations
// ============================================================================

console.log('\n=== Example 3: Limiting Concurrent Operations ===\n');

const fetchSem = Semaphore(3); // Allow max 3 concurrent
let activeFetches = 0;
let maxConcurrent = 0;

async function fakeFetch(url: string): Promise<string> {
    return fetchSem.withPermit(async () => {
        activeFetches++;
        maxConcurrent = Math.max(maxConcurrent, activeFetches);
        console.log(`  Fetching ${url} (active: ${activeFetches})`);

        // Simulate network delay
        await new Promise(r => setTimeout(r, 50));

        activeFetches--;
        return `response-${url}`;
    });
}

const urls = ['api/users', 'api/posts', 'api/comments', 'api/likes', 'api/shares'];
console.log(`Fetching ${urls.length} URLs with concurrency limit 3...`);

const responses = await Promise.all(urls.map(fakeFetch));

console.log(`\nMax concurrent fetches: ${maxConcurrent} (expected: 3)`);
console.log(`Responses: [${responses.join(', ')}]`);

// ============================================================================
// Example 4: tryAcquire (Non-blocking)
// ============================================================================

console.log('\n=== Example 4: tryAcquire (Non-blocking) ===\n');

const sem4 = Semaphore(1);
const heldPermit = await sem4.acquire();

// Try to acquire while at capacity
const maybePermit = sem4.tryAcquire();
if (maybePermit.isNone()) {
    console.log('At capacity, cannot acquire without waiting');
}

heldPermit.release();

// Now try again
const maybePermit2 = sem4.tryAcquire();
if (maybePermit2.isSome()) {
    console.log('Acquired after release');
    maybePermit2.unwrap().release();
}

// ============================================================================
// Example 5: Task Queue with Backpressure
// ============================================================================

console.log('\n=== Example 5: Task Queue with Backpressure ===\n');

const queueSem = Semaphore(2); // Process 2 jobs at a time
const jobLog: string[] = [];

async function processJob(id: number): Promise<void> {
    return queueSem.withPermit(async () => {
        console.log(`  Job ${id}: started`);
        await new Promise(r => setTimeout(r, 30));
        console.log(`  Job ${id}: done`);
        jobLog.push(`job-${id}`);
    });
}

console.log('Processing 5 jobs, 2 at a time...');
await Promise.all([0, 1, 2, 3, 4].map(processJob));

console.log(`Completed order: [${jobLog.join(', ')}]`);

// ============================================================================
// Example 6: Manual Acquire/Release (with try/finally)
// ============================================================================

console.log('\n=== Example 6: Manual Acquire/Release (with try/finally) ===\n');

const sem6 = Semaphore(2);

async function manualWork(id: number): Promise<void> {
    // Manual mode requires try/finally to avoid leaking permits on errors
    const permit = await sem6.acquire();
    try {
        console.log(`  Worker ${id}: acquired (available: ${sem6.availablePermits()})`);
        await new Promise(r => setTimeout(r, 10));
    } finally {
        permit.release();
    }
}

await Promise.all([1, 2, 3].map(manualWork));
console.log(`All workers done, available: ${sem6.availablePermits()}/${sem6.capacity}`);

// ============================================================================
// Example 7: Semaphore vs Mutex
// ============================================================================

console.log('\n=== Example 7: Semaphore vs Mutex ===\n');

console.log('Use Semaphore when:');
console.log('  - You need to limit concurrency to N > 1');
console.log('  - You do NOT need to protect a value');
console.log('  - Examples: fetch rate limiting, connection pools, task queues');
console.log('');
console.log('Use Mutex<T> when:');
console.log('  - You need exclusive access to a value (N = 1)');
console.log('  - The guard provides typed access via `.value`');
console.log('  - Examples: protecting shared state, serializing writes');
console.log('');
console.log('Semaphore(1) behaves like a value-less Mutex, but Mutex<T> is');
console.log('preferred when you need to protect data since the guard exposes `value`.');

console.log('\n=== Semaphore Examples Complete ===');
