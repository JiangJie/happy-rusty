/**
 * OnceAsync example: Async-first one-time initialization
 *
 * Demonstrates using OnceAsync for async lazy initialization, concurrent
 * initialization handling, and producer-consumer patterns.
 *
 * Key difference from Once:
 * - OnceAsync<T> stores Awaited<T>, matching JavaScript's Promise flattening
 * - OnceAsync is designed for async initialization workflows
 * - Supports wait() for producer-consumer patterns
 */
import { Err, Ok, OnceAsync } from '../../../src/mod.ts';

// ============================================================================
// Example 1: Basic async lazy initialization
// ============================================================================
console.log('=== Example 1: Basic async lazy initialization ===\n');

interface User {
    id: number;
    name: string;
}

const userCacheOnce = OnceAsync<Map<number, User>>();

async function getUserCache(): Promise<Map<number, User>> {
    return await userCacheOnce.getOrInit(async () => {
        console.log('Fetching users from API...');
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));

        const cache = new Map<number, User>([
            [1, { id: 1, name: 'Alice' }],
            [2, { id: 2, name: 'Bob' }],
            [3, { id: 3, name: 'Charlie' }],
        ]);
        console.log(`Loaded ${cache.size} users into cache`);
        return cache;
    });
}

async function getUser(id: number): Promise<User | undefined> {
    const cache = await getUserCache();
    return cache.get(id);
}

// Multiple concurrent calls - only one initialization
console.log('Making concurrent getUser() calls:');
const [user1, user2, user3] = await Promise.all([
    getUser(1),
    getUser(2),
    getUser(3),
]);

console.log(`User 1: ${user1?.name}`);
console.log(`User 2: ${user2?.name}`);
console.log(`User 3: ${user3?.name}`);

// ============================================================================
// Example 2: Fallible async initialization with getOrTryInit
// ============================================================================
console.log('\n=== Example 2: Fallible async initialization ===\n');

interface Config {
    apiUrl: string;
    timeout: number;
}

const configOnce = OnceAsync<Config>();

async function loadConfig(url: string, shouldFail: boolean) {
    console.log(`Loading config from ${url}...`);

    return await configOnce.getOrTryInit(async () => {
        // Simulate network request
        await new Promise(r => setTimeout(r, 50));

        if (shouldFail) {
            return Err(new Error('Network error'));
        }

        return Ok({
            apiUrl: url,
            timeout: 5000,
        });
    });
}

// First attempt fails
const configResult1 = await loadConfig('https://primary.config.api', true);
console.log(`Result: ${configResult1.isOk() ? 'Loaded' : `Failed: ${(configResult1.unwrapErr() as Error).message}`}`);
console.log(`Initialized: ${configOnce.isInitialized()}`);

// Second attempt succeeds (can retry because first failed)
console.log('');
const configResult2 = await loadConfig('https://backup.config.api', false);
console.log(`Result: ${configResult2.isOk() ? 'Loaded' : 'Failed'}`);
console.log(`Initialized: ${configOnce.isInitialized()}`);
console.log(`Config: ${JSON.stringify(configOnce.get().unwrap())}`);

// ============================================================================
// Example 3: Concurrent initialization handling
// ============================================================================
console.log('\n=== Example 3: Concurrent initialization ===\n');

const dbOnce = OnceAsync<{ id: string; connected: boolean; }>();

let connectionAttempts = 0;

async function connectToDb(): Promise<{ id: string; connected: boolean; }> {
    return await dbOnce.getOrInit(async () => {
        connectionAttempts++;
        console.log(`Connection attempt #${connectionAttempts} starting...`);

        // Simulate slow connection
        await new Promise(r => setTimeout(r, 100));

        console.log(`Connection attempt #${connectionAttempts} completed`);
        return { id: `db-${Date.now()}`, connected: true };
    });
}

// Launch multiple concurrent connections
console.log('Launching 5 concurrent connection attempts...');
const connections = await Promise.all([
    connectToDb(),
    connectToDb(),
    connectToDb(),
    connectToDb(),
    connectToDb(),
]);

console.log(`\nTotal connection attempts: ${connectionAttempts}`);
console.log(`All same connection: ${connections.every(c => c.id === connections[0].id)}`);
console.log(`Connection ID: ${connections[0].id}`);

// ============================================================================
// Example 4: Mixed sync/async usage
// ============================================================================
console.log('\n=== Example 4: Mixed sync/async usage ===\n');

const mixedOnce = OnceAsync<string>();

// First call with async
const asyncValue = await mixedOnce.getOrInit(async () => {
    console.log('Async initialization...');
    await new Promise(r => setTimeout(r, 50));
    return 'initialized-async';
});
console.log(`Async result: ${asyncValue}`);

// Subsequent call with sync fn - returns same value without calling fn
const syncValue = await mixedOnce.getOrInit(() => {
    console.log('This should not print');
    return 'initialized-sync';
});
console.log(`Sync result: ${syncValue}`);
console.log(`Same value: ${asyncValue === syncValue}`);

// ============================================================================
// Example 5: wait() - Producer-Consumer pattern
// ============================================================================
console.log('\n=== Example 5: wait() - Producer-Consumer pattern ===\n');

// Scenario: Multiple consumers wait for a configuration to be loaded by a producer

const appConfig = OnceAsync<{ port: number; host: string; }>();

// Consumer function - waits for config to be available
async function startServer(name: string): Promise<void> {
    console.log(`[${name}] Waiting for config...`);
    const config = await appConfig.wait();
    console.log(`[${name}] Started on ${config.host}:${config.port}`);
}

// Producer function - loads config after some delay
async function produceConfig(): Promise<void> {
    console.log('[Producer] Loading config...');
    await new Promise(r => setTimeout(r, 100));
    appConfig.set({ port: 8080, host: 'localhost' });
    console.log('[Producer] Config loaded');
}

// Start consumers first (they will wait)
const server1 = startServer('Server1');
const server2 = startServer('Server2');
const server3 = startServer('Server3');

// Start producer after a small delay
await new Promise(r => setTimeout(r, 50));
await produceConfig();

// Wait for all servers to start
await Promise.all([server1, server2, server3]);

// ============================================================================
// Example 6: wait() - Service dependency
// ============================================================================
console.log('\n=== Example 6: wait() - Service dependency ===\n');

// Scenario: Services depend on a database connection being established

const dbConnection = OnceAsync<{ query: (sql: string) => string; }>();

class UserService {
    async getUsers(): Promise<string> {
        const db = await dbConnection.wait();
        return db.query('SELECT * FROM users');
    }
}

class OrderService {
    async getOrders(): Promise<string> {
        const db = await dbConnection.wait();
        return db.query('SELECT * FROM orders');
    }
}

const userService = new UserService();
const orderService = new OrderService();

// Services start querying before DB is ready
const usersPromise = userService.getUsers();
const ordersPromise = orderService.getOrders();

// Database connects after services start
await new Promise(r => setTimeout(r, 50));
console.log('Establishing database connection...');
dbConnection.set({
    query: (sql: string) => `Result of: ${sql}`,
});
console.log('Database connected');

// Now the queries complete
console.log(await usersPromise);
console.log(await ordersPromise);

// ============================================================================
// Example 7: Async singleton pattern
// ============================================================================
console.log('\n=== Example 7: Async singleton pattern ===\n');

class AsyncDatabase {
    private static instance = OnceAsync<AsyncDatabase>();

    private constructor(public readonly connectionId: string) {
        console.log(`Database connection ${connectionId} established`);
    }

    static async getInstance(): Promise<AsyncDatabase> {
        return await AsyncDatabase.instance.getOrInit(async () => {
            console.log('Connecting to database...');
            await new Promise(r => setTimeout(r, 100));
            return new AsyncDatabase(`conn-${Date.now()}`);
        });
    }

    query(sql: string): string {
        return `[${this.connectionId}] Executing: ${sql}`;
    }
}

// Multiple concurrent getInstance() calls - only one connection
const [db1, db2, db3] = await Promise.all([
    AsyncDatabase.getInstance(),
    AsyncDatabase.getInstance(),
    AsyncDatabase.getInstance(),
]);

console.log(`Same instance: ${db1 === db2 && db2 === db3}`);
console.log(db1.query('SELECT * FROM users'));

// ============================================================================
// Example 8: take() and reinitialize
// ============================================================================
console.log('\n=== Example 8: take() and reinitialize ===\n');

const sessionOnce = OnceAsync<{ token: string; expiresAt: number; }>();

// Initialize session
await sessionOnce.getOrInit(async () => {
    console.log('Creating new session...');
    await new Promise(r => setTimeout(r, 50));
    return {
        token: 'session-abc-123',
        expiresAt: Date.now() + 3600000,
    };
});

console.log(`Session: ${JSON.stringify(sessionOnce.get().unwrap())}`);

// Take (logout) and reinitialize
const oldSession = sessionOnce.take();
console.log(`Logged out: ${oldSession.unwrap().token}`);
console.log(`After logout: ${sessionOnce.get().isNone() ? 'No session' : 'Has session'}`);

// Create new session
await sessionOnce.getOrInit(async () => {
    console.log('Creating new session after logout...');
    await new Promise(r => setTimeout(r, 50));
    return {
        token: 'session-xyz-789',
        expiresAt: Date.now() + 3600000,
    };
});

console.log(`New session: ${JSON.stringify(sessionOnce.get().unwrap())}`);
