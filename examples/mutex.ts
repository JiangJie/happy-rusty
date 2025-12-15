/**
 * Mutex example: Async mutual exclusion for serializing operations
 *
 * Demonstrates using Mutex to prevent race conditions in async code,
 * protecting shared resources from concurrent access.
 */
import { Mutex } from '../src/mod.ts';

// ============================================================================
// Example 1: Basic counter protection
// ============================================================================
console.log('=== Example 1: Basic counter protection ===\n');

const counter = Mutex({ count: 0 });

// Without mutex, this would cause race conditions
async function incrementCounter() {
    await counter.withLock(async (state) => {
        const current = state.count;
        // Simulate some async work
        await new Promise(r => setTimeout(r, 10));
        state.count = current + 1;
    });
}

console.log('Starting 10 concurrent increments...');
await Promise.all(Array.from({ length: 10 }, incrementCounter));

await counter.withLock((state) => {
    console.log(`Final count: ${state.count} (expected: 10)`);
});

// ============================================================================
// Example 2: Token refresh pattern
// ============================================================================
console.log('\n=== Example 2: Token refresh pattern ===\n');

interface AuthState {
    token: string;
    expiresAt: number;
}

const authState = Mutex<AuthState>({
    token: '',
    expiresAt: 0,
});

let refreshCount = 0;

async function refreshToken(): Promise<{ token: string; expiresIn: number }> {
    refreshCount++;
    console.log(`  [Auth] Refreshing token (call #${refreshCount})...`);
    await new Promise(r => setTimeout(r, 50));
    return { token: `token-${Date.now()}`, expiresIn: 3600 };
}

async function getValidToken(): Promise<string> {
    return await authState.withLock(async (state) => {
        if (Date.now() >= state.expiresAt) {
            const { token, expiresIn } = await refreshToken();
            state.token = token;
            state.expiresAt = Date.now() + expiresIn * 1000;
        }
        return state.token;
    });
}

console.log('Making 5 concurrent API calls (all need token)...');
const tokens = await Promise.all([
    getValidToken(),
    getValidToken(),
    getValidToken(),
    getValidToken(),
    getValidToken(),
]);

console.log(`Tokens received: ${tokens.length}`);
console.log(`All tokens identical: ${tokens.every(t => t === tokens[0])}`);
console.log(`Refresh was called: ${refreshCount} time(s)\n`);

// ============================================================================
// Example 3: Database transaction simulation
// ============================================================================
console.log('=== Example 3: Database transaction simulation ===\n');

interface Account {
    id: string;
    balance: number;
}

interface Database {
    accounts: Map<string, Account>;
}

const db = Mutex<Database>({
    accounts: new Map([
        ['alice', { id: 'alice', balance: 1000 }],
        ['bob', { id: 'bob', balance: 500 }],
    ]),
});

async function transfer(from: string, to: string, amount: number): Promise<boolean> {
    return await db.withLock(async (database) => {
        const fromAccount = database.accounts.get(from);
        const toAccount = database.accounts.get(to);

        if (!fromAccount || !toAccount) {
            console.log(`  Transfer failed: Account not found`);
            return false;
        }

        if (fromAccount.balance < amount) {
            console.log(`  Transfer failed: Insufficient funds`);
            return false;
        }

        // Simulate some processing time
        await new Promise(r => setTimeout(r, 20));

        fromAccount.balance -= amount;
        toAccount.balance += amount;
        console.log(`  Transferred $${amount} from ${from} to ${to}`);
        return true;
    });
}

console.log('Initial balances:');
await db.withLock((database) => {
    for (const [id, account] of database.accounts) {
        console.log(`  ${id}: $${account.balance}`);
    }
});

console.log('\nExecuting concurrent transfers...');
await Promise.all([
    transfer('alice', 'bob', 200),
    transfer('alice', 'bob', 300),
    transfer('bob', 'alice', 100),
]);

console.log('\nFinal balances:');
await db.withLock((database) => {
    for (const [id, account] of database.accounts) {
        console.log(`  ${id}: $${account.balance}`);
    }
});

// ============================================================================
// Example 4: Manual guard control
// ============================================================================
console.log('\n=== Example 4: Manual guard control ===\n');

const resource = Mutex({ data: 'initial' });

console.log('Acquiring lock manually...');
const guard = await resource.lock();
console.log(`Current value: ${guard.value.data}`);

console.log('Modifying value...');
guard.value = { data: 'modified' };

console.log('Releasing lock...');
guard.unlock();

await resource.withLock((value) => {
    console.log(`After release: ${value.data}`);
});

// ============================================================================
// Example 5: tryLock for non-blocking check
// ============================================================================
console.log('\n=== Example 5: tryLock for non-blocking check ===\n');

const busyResource = Mutex({ status: 'idle' });

// Hold the lock
const holder = await busyResource.lock();
holder.value.status = 'busy';

// Try to lock without blocking
const tryResult = busyResource.tryLock();
if (tryResult.isSome()) {
    console.log('Acquired lock successfully');
    tryResult.unwrap().unlock();
} else {
    console.log('Resource is busy, doing something else...');
}

console.log(`isLocked: ${busyResource.isLocked()}`);
holder.unlock();
console.log(`After unlock, isLocked: ${busyResource.isLocked()}`);

// Now tryLock should succeed
const retryResult = busyResource.tryLock();
if (retryResult.isSome()) {
    console.log('Retry: Acquired lock successfully');
    retryResult.unwrap().unlock();
}

// ============================================================================
// Example 6: File write simulation
// ============================================================================
console.log('\n=== Example 6: File write simulation ===\n');

interface FileContent {
    lines: string[];
}

const fileContent = Mutex<FileContent>({ lines: [] });

async function appendLine(line: string) {
    await fileContent.withLock(async (file) => {
        console.log(`  Writing: "${line}"`);
        // Simulate disk I/O
        await new Promise(r => setTimeout(r, 20));
        file.lines.push(line);
    });
}

console.log('Writing lines concurrently...');
await Promise.all([
    appendLine('First line'),
    appendLine('Second line'),
    appendLine('Third line'),
]);

console.log('\nFile contents (in order):');
await fileContent.withLock((file) => {
    file.lines.forEach((line, i) => console.log(`  ${i + 1}. ${line}`));
});

// ============================================================================
// Example 7: Queue consumer
// ============================================================================
console.log('\n=== Example 7: Queue consumer ===\n');

interface MessageQueue {
    messages: string[];
    processed: string[];
}

const queue = Mutex<MessageQueue>({
    messages: ['msg1', 'msg2', 'msg3', 'msg4', 'msg5'],
    processed: [],
});

async function processNext(): Promise<boolean> {
    return await queue.withLock(async (q) => {
        const msg = q.messages.shift();
        if (!msg) {
            return false;
        }

        // Simulate processing
        await new Promise(r => setTimeout(r, 10));
        q.processed.push(`processed-${msg}`);
        console.log(`  Processed: ${msg}`);
        return true;
    });
}

console.log('Starting 3 concurrent consumers...');

async function consumer(id: string) {
    while (await processNext()) {
        // Continue processing
    }
    console.log(`  Consumer ${id} finished`);
}

await Promise.all([
    consumer('A'),
    consumer('B'),
    consumer('C'),
]);

await queue.withLock((q) => {
    console.log(`\nTotal processed: ${q.processed.length}`);
    console.log(`Remaining in queue: ${q.messages.length}`);
});
