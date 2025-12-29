/**
 * FnOnceAsync Examples
 *
 * Demonstrates how to use FnOnceAsync for one-time callable async functions.
 * FnOnceAsync is the async counterpart to FnOnce, useful for ensuring
 * async operations execute exactly once, such as async initialization,
 * one-time data fetching, or async resource cleanup.
 */

import { FnOnce, FnOnceAsync } from '../../../src/mod.ts';

// ============================================================================
// Example 1: Basic FnOnceAsync Usage
// ============================================================================

console.log('=== Example 1: Basic FnOnceAsync Usage ===\n');

const fetchGreeting = FnOnceAsync(async (name: string) => {
    console.log('Fetching greeting...');
    await new Promise(r => setTimeout(r, 50));
    return `Hello, ${name}!`;
});

console.log(`Before call: ${fetchGreeting.toString()}`);
console.log(`isConsumed: ${fetchGreeting.isConsumed()}`);

const message = await fetchGreeting.call('World');
console.log(`Result: ${message}`);

console.log(`After call: ${fetchGreeting.toString()}`);
console.log(`isConsumed: ${fetchGreeting.isConsumed()}`);

// Second call would throw:
// await fetchGreeting.call('Again'); // Error: FnOnceAsync has already been consumed

// ============================================================================
// Example 2: Safe Call with tryCall
// ============================================================================

console.log('\n=== Example 2: Safe Call with tryCall ===\n');

const fetchData = FnOnceAsync(async (id: number) => {
    console.log(`Fetching data for id ${id}...`);
    await new Promise(r => setTimeout(r, 30));
    return { id, data: `Data for ${id}` };
});

const result1 = await fetchData.tryCall(42);
console.log(`First tryCall: ${result1.isSome() ? JSON.stringify(result1.unwrap()) : 'None'}`);

const result2 = await fetchData.tryCall(99);
console.log(`Second tryCall: ${result2.isSome() ? JSON.stringify(result2.unwrap()) : 'None'}`);

// Using mapOr pattern
const fetchRandom = FnOnceAsync(async () => {
    await new Promise(r => setTimeout(r, 10));
    return Math.random();
});

const value = (await fetchRandom.tryCall()).mapOr(
    'Already consumed',
    v => `Got value: ${v.toFixed(4)}`,
);
console.log(value);

// ============================================================================
// Example 3: One-Time Async Initialization
// ============================================================================

console.log('\n=== Example 3: One-Time Async Initialization ===\n');

interface Config {
    apiUrl: string;
    timeout: number;
}

const loadConfig = FnOnceAsync(async (): Promise<Config> => {
    console.log('Loading configuration from remote server...');
    await new Promise(r => setTimeout(r, 100));
    return {
        apiUrl: 'https://api.example.com',
        timeout: 5000,
    };
});

// Multiple components trying to load config
async function getApiUrl(): Promise<string> {
    const config = await loadConfig.tryCall();
    return config.mapOr('https://fallback.api.com', c => c.apiUrl);
}

// First call loads the config
console.log(`API URL 1: ${await getApiUrl()}`);

// Subsequent calls return fallback (config already loaded)
console.log(`API URL 2: ${await getApiUrl()}`);

// ============================================================================
// Example 4: Async Resource Cleanup
// ============================================================================

console.log('\n=== Example 4: Async Resource Cleanup ===\n');

interface AsyncConnection {
    id: string;
    query(sql: string): Promise<unknown[]>;
    close: ReturnType<typeof FnOnceAsync<[], void>>;
}

function createAsyncConnection(id: string): AsyncConnection {
    console.log(`[${id}] Connection opened`);
    let closed = false;

    return {
        id,
        async query(sql: string) {
            if (closed) throw new Error('Connection closed');
            console.log(`[${id}] Executing: ${sql}`);
            await new Promise(r => setTimeout(r, 10));
            return [{ result: 'data' }];
        },
        close: FnOnceAsync(async () => {
            console.log(`[${id}] Closing connection...`);
            await new Promise(r => setTimeout(r, 50));
            closed = true;
            console.log(`[${id}] Connection closed`);
        }),
    };
}

const conn = createAsyncConnection('db-1');
await conn.query('SELECT * FROM users');

// Multiple close attempts - only first executes
await conn.close.tryCall();
await conn.close.tryCall();
console.log('Connection closed safely');

// ============================================================================
// Example 5: One-Time Data Fetching
// ============================================================================

console.log('\n=== Example 5: One-Time Data Fetching ===\n');

interface User {
    id: number;
    name: string;
    email: string;
}

// Simulated API fetch
const fetchUser = FnOnceAsync(async (id: number): Promise<User> => {
    console.log(`Fetching user ${id} from API...`);
    await new Promise(r => setTimeout(r, 50));
    return {
        id,
        name: `User ${id}`,
        email: `user${id}@example.com`,
    };
});

// First fetch succeeds
const userResult = await fetchUser.tryCall(1);
if (userResult.isSome()) {
    const user = userResult.unwrap();
    console.log(`Fetched: ${user.name} (${user.email})`);
}

// Second fetch returns None - no network request made
const secondFetch = await fetchUser.tryCall(2);
if (secondFetch.isNone()) {
    console.log('User already fetched, use cached data instead');
}

// ============================================================================
// Example 6: Async Initialization Guard
// ============================================================================

console.log('\n=== Example 6: Async Initialization Guard ===\n');

class AsyncApplication {
    private _initialize: ReturnType<typeof FnOnceAsync<[], { ready: boolean; }>>;

    constructor() {
        this._initialize = FnOnceAsync(async () => {
            console.log('Initializing application...');

            console.log('  - Loading config...');
            await new Promise(r => setTimeout(r, 30));

            console.log('  - Connecting to database...');
            await new Promise(r => setTimeout(r, 30));

            console.log('  - Starting services...');
            await new Promise(r => setTimeout(r, 30));

            return { ready: true };
        });
    }

    async start() {
        const result = await this._initialize.tryCall();
        if (result.isSome()) {
            console.log('Application started successfully');
            return result.unwrap();
        } else {
            console.log('Application already running');
            return { ready: true };
        }
    }

    get isInitialized(): boolean {
        return this._initialize.isConsumed();
    }
}

const app = new AsyncApplication();
console.log(`Is initialized: ${app.isInitialized}`);

await app.start();
console.log(`Is initialized: ${app.isInitialized}`);

await app.start(); // No-op, already initialized

// ============================================================================
// Example 7: Async Callback Factory Pattern
// ============================================================================

console.log('\n=== Example 7: Async Callback Factory Pattern ===\n');

type AsyncUnsubscribeFn = ReturnType<typeof FnOnceAsync<[], void>>;

function subscribeAsync(topic: string, _callback: (msg: string) => void): AsyncUnsubscribeFn {
    console.log(`Subscribed to: ${topic}`);
    const subscriptionId = Math.random().toString(36).slice(2, 8);

    return FnOnceAsync(async () => {
        console.log(`Unsubscribing from: ${topic}...`);
        await new Promise(r => setTimeout(r, 30));
        console.log(`Unsubscribed from: ${topic} (id: ${subscriptionId})`);
    });
}

const unsub1 = subscribeAsync('news', msg => console.log(`News: ${msg}`));
const unsub2 = subscribeAsync('weather', msg => console.log(`Weather: ${msg}`));

// Clean up subscriptions
await unsub1.call();
await unsub2.call();

// Safe to call again
await unsub1.tryCall(); // No-op

// ============================================================================
// Example 8: PromiseLike Compatibility
// ============================================================================

console.log('\n=== Example 8: PromiseLike Compatibility ===\n');

// FnOnceAsync accepts any PromiseLike, not just native Promise
// This means you can use custom Promise implementations or thenables

// Example: Using a function that returns a native Promise
const withNativePromise = FnOnceAsync(() => Promise.resolve(42));
console.log(`Native Promise result: ${await withNativePromise.call()}`);

// Example: Third-party Promise libraries (like Bluebird) would also work
// since they implement the PromiseLike interface
const delayedValue = FnOnceAsync(async () => {
    await new Promise(r => setTimeout(r, 10));
    return 'delayed result';
});
console.log(`Delayed result: ${await delayedValue.call()}`);

// Example: Configure-then-execute pattern using PromiseLike
// This pattern allows building up configuration before execution
interface QueryBuilder<T> extends PromiseLike<T> {
    select(fields: string[]): QueryBuilder<T>;
    where(condition: string): QueryBuilder<T>;
    limit(n: number): QueryBuilder<T>;
}

function createQueryBuilder<T>(table: string): QueryBuilder<T> {
    let fields = ['*'];
    const conditions: string[] = [];
    let limitValue: number | undefined;

    const builder: QueryBuilder<T> = {
        select(f: string[]) {
            fields = f;
            return builder;
        },
        where(condition: string) {
            conditions.push(condition);
            return builder;
        },
        limit(n: number) {
            limitValue = n;
            return builder;
        },
        then(resolve, reject) {
            // Build and execute the query when awaited
            const sql = `SELECT ${ fields.join(', ') } FROM ${ table }${ conditions.length ? ` WHERE ${ conditions.join(' AND ') }` : ''
                }${ limitValue ? ` LIMIT ${ limitValue }` : '' }`;

            console.log(`Executing: ${ sql }`);

            // Simulate async query execution
            return new Promise<T>((res) => {
                setTimeout(() => {
                    res({ rows: [], sql } as T);
                }, 10);
            }).then(resolve, reject);
        },
    };

    return builder;
}

// FnOnceAsync can wrap the query builder directly
const fetchUsers = FnOnceAsync(() =>
    createQueryBuilder<{ rows: unknown[]; sql: string; }>('users')
        .select(['id', 'name', 'email'])
        .where('active = true')
        .limit(10),
);

// Query is built and executed only once when called
const queryResult = await fetchUsers.call();
console.log(`Query result: ${ JSON.stringify(queryResult) }`);

// Second call fails - ensures query runs exactly once
const secondQuery = await fetchUsers.tryCall();
console.log(`Second query attempt: ${ secondQuery.isNone() ? 'blocked (already executed)' : 'executed' }`);

// ============================================================================
// Example 9: Error Handling
// ============================================================================

console.log('\n=== Example 9: Error Handling ===\n');

const riskyFetch = FnOnceAsync(async () => {
    console.log('Attempting risky operation...');
    await new Promise(r => setTimeout(r, 20));
    throw new Error('Network error');
});

try {
    await riskyFetch.call();
} catch (error) {
    console.log(`Caught error: ${(error as Error).message}`);
    console.log(`isConsumed after error: ${riskyFetch.isConsumed()}`);
}

// Note: Function is consumed even if it threw
console.log('Cannot retry after consumption (by design)');

// ============================================================================
// Example 10: Comparison with FnOnce
// ============================================================================

console.log('\n=== Example 10: Comparison with FnOnce ===\n');

// FnOnce for sync functions
const syncCleanup = FnOnce(() => {
    console.log('Sync cleanup executed');
    return 'sync result';
});

// FnOnceAsync for async functions
const asyncCleanup = FnOnceAsync(async () => {
    await new Promise(r => setTimeout(r, 10));
    console.log('Async cleanup executed');
    return 'async result';
});

console.log('Using FnOnce (sync):');
const syncResult = syncCleanup.call();
console.log(`  Result: ${syncResult}`);

console.log('\nUsing FnOnceAsync (async):');
const asyncResult = await asyncCleanup.call();
console.log(`  Result: ${asyncResult}`);

console.log('\nKey differences:');
console.log('  - FnOnce.call() returns R directly');
console.log('  - FnOnceAsync.call() returns Promise<R>');
console.log('  - FnOnce.tryCall() returns Option<R>');
console.log('  - FnOnceAsync.tryCall() returns Promise<Option<R>>');
console.log('  - FnOnceAsync accepts PromiseLike, not just Promise');

console.log('\n=== FnOnceAsync Examples Complete ===');
