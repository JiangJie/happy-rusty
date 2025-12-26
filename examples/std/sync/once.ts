/**
 * Once example: One-time initialization with value storage
 *
 * Demonstrates using Once for lazy initialization of expensive resources,
 * configuration loading, and singleton patterns. Supports both sync and async.
 */
import { Err, Ok, Once } from '../../../src/mod.ts';

// ============================================================================
// Example 1: Basic sync lazy initialization
// ============================================================================
console.log('=== Example 1: Basic sync lazy initialization ===\n');

interface Config {
    apiUrl: string;
    timeout: number;
    debug: boolean;
}

const configOnce = Once<Config>();

function getConfig(): Config {
    return configOnce.getOrInit(() => {
        console.log('Loading configuration...');
        return {
            apiUrl: 'https://api.example.com',
            timeout: 5000,
            debug: true,
        };
    });
}

// Multiple calls - only first loads
console.log('First getConfig() call:');
console.log(getConfig());

console.log('\nSecond getConfig() call (no loading):');
console.log(getConfig());

console.log('\nThird getConfig() call (no loading):');
console.log(getConfig());

// ============================================================================
// Example 2: Fallible initialization with getOrTryInit
// ============================================================================
console.log('\n=== Example 2: Fallible initialization ===\n');

const dbOnce = Once<{ connected: boolean; host: string; }>();

function connectToDatabase(host: string, shouldFail: boolean) {
    console.log(`Attempting to connect to ${host}...`);

    return dbOnce.getOrTryInit(() => {
        if (shouldFail) {
            return Err(new Error('Connection timeout'));
        }
        return Ok({ connected: true, host });
    });
}

// First attempt fails
const result1 = connectToDatabase('primary.db.local', true);
console.log(`Result: ${result1.isOk() ? 'Connected' : `Failed: ${(result1.unwrapErr() as Error).message}`}`);
console.log(`Initialized: ${dbOnce.isInitialized()}`);

// Second attempt succeeds (still empty, so we can retry)
console.log('');
const result2 = connectToDatabase('backup.db.local', false);
console.log(`Result: ${result2.isOk() ? 'Connected' : 'Failed'}`);
console.log(`Initialized: ${dbOnce.isInitialized()}`);
console.log(`Database: ${JSON.stringify(dbOnce.get().unwrap())}`);

// ============================================================================
// Example 3: set() and take() operations
// ============================================================================
console.log('\n=== Example 3: set() and take() ===\n');

const tokenOnce = Once<string>();

// Set value
const setResult1 = tokenOnce.set('token-abc-123');
console.log(`First set: ${setResult1.isOk() ? 'Success' : 'Already set'}`);

// Try to set again
const setResult2 = tokenOnce.set('token-xyz-789');
console.log(`Second set: ${setResult2.isOk() ? 'Success' : `Already set, returned: ${setResult2.unwrapErr()}`}`);

// Take the value
const taken = tokenOnce.take();
console.log(`Taken value: ${taken.unwrap()}`);
console.log(`After take: ${tokenOnce.get().isNone() ? 'Empty' : 'Has value'}`);

// Now we can set again
tokenOnce.set('new-token');
console.log(`After re-set: ${tokenOnce.get().unwrap()}`);

// ============================================================================
// Example 4: Async initialization with getOrInitAsync
// ============================================================================
console.log('\n=== Example 4: Async initialization ===\n');

interface User {
    id: number;
    name: string;
}

const userCacheOnce = Once<Map<number, User>>();

async function getUserCache(): Promise<Map<number, User>> {
    return await userCacheOnce.getOrInitAsync(async () => {
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
// Example 5: Singleton pattern
// ============================================================================
console.log('\n=== Example 5: Singleton pattern ===\n');

class Logger {
    private static instance = Once<Logger>();

    private constructor(public readonly name: string) {
        console.log(`Logger "${name}" created`);
    }

    static getInstance(): Logger {
        return Logger.instance.getOrInit(() => new Logger('AppLogger'));
    }

    log(message: string): void {
        console.log(`[${this.name}] ${message}`);
    }
}

// Multiple getInstance() calls return the same instance
const logger1 = Logger.getInstance();
const logger2 = Logger.getInstance();
const logger3 = Logger.getInstance();

console.log(`Same instance: ${logger1 === logger2 && logger2 === logger3}`);

logger1.log('Hello from logger!');

// ============================================================================
// Example 6: Mixed sync/async usage
// ============================================================================
console.log('\n=== Example 6: Mixed sync/async usage ===\n');

const mixedOnce = Once<string>();

// First call with async
const asyncValue = await mixedOnce.getOrInitAsync(async () => {
    console.log('Async initialization...');
    await new Promise(r => setTimeout(r, 50));
    return 'initialized-async';
});
console.log(`Async result: ${asyncValue}`);

// Subsequent call with sync - returns same value without calling fn
const syncValue = mixedOnce.getOrInit(() => {
    console.log('This should not print');
    return 'initialized-sync';
});
console.log(`Sync result: ${syncValue}`);
console.log(`Same value: ${asyncValue === syncValue}`);

// Async after sync also works
const asyncAgain = await mixedOnce.getOrInitAsync(async () => {
    console.log('This should not print either');
    return 'initialized-async-again';
});
console.log(`Async again result: ${asyncAgain}`);
console.log(`Still same value: ${asyncValue === asyncAgain}`);

// ============================================================================
// Example 7: waitAsync - Producer-Consumer pattern
// ============================================================================
console.log('\n=== Example 7: waitAsync - Producer-Consumer pattern ===\n');

// Scenario: Multiple consumers wait for a configuration to be loaded by a producer

const appConfig = Once<{ port: number; host: string; }>();

// Consumer function - waits for config to be available
async function startServer(name: string): Promise<void> {
    console.log(`[${name}] Waiting for config...`);
    const config = await appConfig.waitAsync();
    console.log(`[${name}] Started on ${config.host}:${config.port}`);
}

// Producer function - loads config after some delay
async function loadConfig(): Promise<void> {
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
await loadConfig();

// Wait for all servers to start
await Promise.all([server1, server2, server3]);

// ============================================================================
// Example 8: waitAsync - Service dependency
// ============================================================================
console.log('\n=== Example 8: waitAsync - Service dependency ===\n');

// Scenario: Services depend on a database connection being established

const dbConnection = Once<{ query: (sql: string) => string; }>();

class UserService {
    async getUsers(): Promise<string> {
        const db = await dbConnection.waitAsync();
        return db.query('SELECT * FROM users');
    }
}

class OrderService {
    async getOrders(): Promise<string> {
        const db = await dbConnection.waitAsync();
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
