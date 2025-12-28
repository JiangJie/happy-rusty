/**
 * RwLock Examples
 *
 * Demonstrates how to use RwLock for read-write locking in async scenarios.
 *
 * RwLock allows multiple concurrent readers OR a single exclusive writer.
 * This is useful when reads are frequent and writes are rare.
 *
 * **Important Note for JavaScript developers:**
 * JavaScript is single-threaded, so RwLock's benefits are limited compared
 * to multi-threaded languages like Rust. However, in async scenarios where
 * read operations contain `await`, RwLock can still provide:
 * 1. Clearer semantics (explicit read vs write intent)
 * 2. Multiple async reads proceeding without blocking each other
 * 3. Writer priority to prevent starvation
 */

import { RwLock } from '../../../src/mod.ts';

// ============================================================================
// Example 1: Basic Read/Write Operations
// ============================================================================

console.log('=== Example 1: Basic Read/Write Operations ===\n');

const counter = RwLock(0);

// Read the value
const value = await counter.withRead((v) => {
    console.log(`Current value: ${v}`);
    return v;
});

// Write a new value (need to use set() or modify through guard)
await counter.set(value + 1);
console.log(`After increment: ${await counter.get()}`);

// Or use withWrite with a mutable object
const mutableCounter = RwLock({ value: 0 });
await mutableCounter.withWrite((obj) => {
    console.log(`Incrementing from ${obj.value} to ${obj.value + 1}`);
    obj.value++;
});

console.log(`Final value: ${(await mutableCounter.get()).value}`);

// ============================================================================
// Example 2: Multiple Concurrent Readers
// ============================================================================

console.log('\n=== Example 2: Multiple Concurrent Readers ===\n');

const data = RwLock({ items: [1, 2, 3, 4, 5] });

console.log('Starting 3 concurrent read operations...');

// These reads can proceed concurrently
const results = await Promise.all([
    data.withRead(async (d) => {
        console.log('Reader A: starting');
        await new Promise(r => setTimeout(r, 50));
        const sum = d.items.reduce((a, b) => a + b, 0);
        console.log(`Reader A: sum = ${sum}`);
        return sum;
    }),
    data.withRead(async (d) => {
        console.log('Reader B: starting');
        await new Promise(r => setTimeout(r, 30));
        const max = Math.max(...d.items);
        console.log(`Reader B: max = ${max}`);
        return max;
    }),
    data.withRead(async (d) => {
        console.log('Reader C: starting');
        await new Promise(r => setTimeout(r, 10));
        const count = d.items.length;
        console.log(`Reader C: count = ${count}`);
        return count;
    }),
]);

console.log(`All readers completed: [${results.join(', ')}]`);

// ============================================================================
// Example 3: Writer Blocks Readers
// ============================================================================

console.log('\n=== Example 3: Writer Blocks Readers ===\n');

const state = RwLock({ version: 1, data: 'initial' });

console.log('Writer acquires lock first...');

// Start a write operation
const writePromise = state.withWrite(async (s) => {
    console.log('Writer: starting update');
    await new Promise(r => setTimeout(r, 100));
    s.version++;
    s.data = 'updated';
    console.log('Writer: update complete');
});

// These reads will wait for the writer to finish
const readPromises = Promise.all([
    state.withRead((s) => {
        console.log(`Reader 1: version=${s.version}, data="${s.data}"`);
    }),
    state.withRead((s) => {
        console.log(`Reader 2: version=${s.version}, data="${s.data}"`);
    }),
]);

await writePromise;
await readPromises;

console.log('All operations completed - readers saw updated data');

// ============================================================================
// Example 4: Configuration Store Pattern
// ============================================================================

console.log('\n=== Example 4: Configuration Store Pattern ===\n');

interface AppConfig {
    apiUrl: string;
    timeout: number;
    features: Set<string>;
    lastUpdated: Date;
}

const config = RwLock<AppConfig>({
    apiUrl: 'https://api.example.com',
    timeout: 5000,
    features: new Set(['feature-a', 'feature-b']),
    lastUpdated: new Date(),
});

// Read-only access to check feature flags (frequent operation)
async function isFeatureEnabled(feature: string): Promise<boolean> {
    return config.withRead((cfg) => cfg.features.has(feature));
}

// Read-only access to get API URL (frequent operation)
async function getApiUrl(): Promise<string> {
    return config.withRead((cfg) => cfg.apiUrl);
}

// Write access to enable a feature (rare operation)
async function enableFeature(feature: string): Promise<void> {
    await config.withWrite((cfg) => {
        cfg.features.add(feature);
        cfg.lastUpdated = new Date();
        console.log(`Enabled feature: ${feature}`);
    });
}

// Write access to update timeout (rare operation)
async function updateTimeout(timeout: number): Promise<void> {
    await config.withWrite((cfg) => {
        cfg.timeout = timeout;
        cfg.lastUpdated = new Date();
        console.log(`Updated timeout to: ${timeout}ms`);
    });
}

// Usage
console.log(`Feature A enabled: ${await isFeatureEnabled('feature-a')}`);
console.log(`Feature C enabled: ${await isFeatureEnabled('feature-c')}`);

await enableFeature('feature-c');
console.log(`Feature C enabled: ${await isFeatureEnabled('feature-c')}`);

await updateTimeout(10000);
console.log(`API URL: ${await getApiUrl()}`);

// ============================================================================
// Example 5: Cache with Read-Heavy Workload
// ============================================================================

console.log('\n=== Example 5: Cache with Read-Heavy Workload ===\n');

interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

const cache = RwLock(new Map<string, CacheEntry<string>>());

async function cacheGet(key: string): Promise<string | undefined> {
    return cache.withRead((map) => {
        const entry = map.get(key);
        if (!entry) return undefined;
        if (Date.now() > entry.expiresAt) return undefined;
        return entry.value;
    });
}

async function cacheSet(key: string, value: string, ttlMs: number): Promise<void> {
    await cache.withWrite((map) => {
        map.set(key, {
            value,
            expiresAt: Date.now() + ttlMs,
        });
    });
}

async function cacheDelete(key: string): Promise<boolean> {
    return cache.withWrite((map) => map.delete(key));
}

// Set some values
await cacheSet('user:1', 'Alice', 60000);
await cacheSet('user:2', 'Bob', 60000);
await cacheSet('user:3', 'Charlie', 60000);

// Many concurrent reads (common pattern)
const users = await Promise.all([
    cacheGet('user:1'),
    cacheGet('user:2'),
    cacheGet('user:3'),
    cacheGet('user:1'), // duplicate read
    cacheGet('user:2'), // duplicate read
]);

console.log(`Cached users: [${users.join(', ')}]`);

// Occasional write
await cacheDelete('user:2');
console.log(`After delete - user:2 = ${await cacheGet('user:2')}`);

// ============================================================================
// Example 6: Session Store with tryRead/tryWrite
// ============================================================================

console.log('\n=== Example 6: Session Store with tryRead/tryWrite ===\n');

interface Session {
    userId: string;
    createdAt: Date;
    data: Record<string, unknown>;
}

const sessions = RwLock(new Map<string, Session>());

// Non-blocking read - useful when you want to avoid waiting
function tryGetSession(token: string): Session | undefined {
    const guard = sessions.tryRead();
    if (guard.isNone()) {
        console.log('Sessions locked for writing, cannot read now');
        return undefined;
    }

    try {
        return guard.unwrap().value.get(token);
    } finally {
        guard.unwrap().unlock();
    }
}

// Non-blocking write - useful for background tasks
function tryCreateSession(token: string, userId: string): boolean {
    const guard = sessions.tryWrite();
    if (guard.isNone()) {
        console.log('Sessions locked, cannot create now');
        return false;
    }

    try {
        guard.unwrap().value.set(token, {
            userId,
            createdAt: new Date(),
            data: {},
        });
        console.log(`Created session for user: ${userId}`);
        return true;
    } finally {
        guard.unwrap().unlock();
    }
}

// Create some sessions
tryCreateSession('token-abc', 'user-1');
tryCreateSession('token-xyz', 'user-2');

// Read sessions
const session1 = tryGetSession('token-abc');
console.log(`Session 1: userId=${session1?.userId}`);

const session2 = tryGetSession('token-xyz');
console.log(`Session 2: userId=${session2?.userId}`);

// ============================================================================
// Example 7: Manual Guard Control
// ============================================================================

console.log('\n=== Example 7: Manual Guard Control ===\n');

const resource = RwLock({ count: 0, log: [] as string[] });

// Using manual read guard
async function loggedRead(): Promise<number> {
    const guard = await resource.read();
    try {
        const value = guard.value.count;
        console.log(`Read count: ${value}`);
        return value;
    } finally {
        guard.unlock();
    }
}

// Using manual write guard
async function loggedIncrement(): Promise<void> {
    const guard = await resource.write();
    try {
        guard.value.count++;
        guard.value.log.push(`Incremented at ${new Date().toISOString()}`);
        console.log(`Incremented to: ${guard.value.count}`);
    } finally {
        guard.unlock();
    }
}

await loggedRead();
await loggedIncrement();
await loggedIncrement();
await loggedRead();

// ============================================================================
// Example 8: When to Use RwLock vs Mutex
// ============================================================================

console.log('\n=== Example 8: When to Use RwLock vs Mutex ===\n');

console.log('Use RwLock when:');
console.log('  - Reads are MUCH more frequent than writes');
console.log('  - Read operations contain await (async reads)');
console.log('  - You want to express read/write intent explicitly');
console.log('');
console.log('Use Mutex when:');
console.log('  - Read/write frequency is balanced');
console.log('  - Operations are quick (no await inside)');
console.log('  - You want simpler API');
console.log('');
console.log('In JavaScript, the performance difference is minimal');
console.log('because JS is single-threaded. Choose based on:');
console.log('  1. Semantic clarity (read vs write intent)');
console.log('  2. API design (RwLock has separate read/write methods)');

// ============================================================================
// Example 9: Status Methods
// ============================================================================

console.log('\n=== Example 9: Status Methods ===\n');

const status = RwLock('data');

console.log(`Initial state: ${status.toString()}`);
console.log(`Reader count: ${status.readerCount()}`);
console.log(`Write locked: ${status.isWriteLocked()}`);

const readGuard = await status.read();
console.log(`\nAfter acquiring read lock:`);
console.log(`  ${status.toString()}`);
console.log(`  Reader count: ${status.readerCount()}`);

const readGuard2 = await status.read();
console.log(`\nAfter acquiring second read lock:`);
console.log(`  ${status.toString()}`);
console.log(`  Reader count: ${status.readerCount()}`);

readGuard.unlock();
readGuard2.unlock();

const writeGuard = await status.write();
console.log(`\nAfter acquiring write lock:`);
console.log(`  ${status.toString()}`);
console.log(`  Write locked: ${status.isWriteLocked()}`);

writeGuard.unlock();
console.log(`\nAfter releasing write lock:`);
console.log(`  ${status.toString()}`);

console.log('\n=== RwLock Examples Complete ===');
