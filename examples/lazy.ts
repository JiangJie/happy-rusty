/**
 * Lazy example: Lazy initialization on first access
 *
 * Demonstrates using Lazy and LazyAsync for deferred initialization.
 * Unlike Once, the initialization function is bound at creation time.
 */
import { Lazy, LazyAsync } from '../src/mod.ts';

// ============================================================================
// Example 1: Basic Lazy usage
// ============================================================================
console.log('=== Example 1: Basic Lazy usage ===\n');

const expensiveValue = Lazy(() => {
    console.log('Computing expensive value...');
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
        sum += i;
    }
    return sum;
});

console.log(`Before force: isInitialized = ${expensiveValue.isInitialized()}`);
console.log(`get() = ${expensiveValue.get().isNone() ? 'None' : expensiveValue.get().unwrap()}`);

console.log('\nFirst access via force():');
const result = expensiveValue.force();
console.log(`Result: ${result}`);

console.log('\nSecond access (cached):');
const cached = expensiveValue.force();
console.log(`Result: ${cached} (no computing log)`);
console.log(`isInitialized = ${expensiveValue.isInitialized()}`);

// ============================================================================
// Example 2: Lazy configuration object
// ============================================================================
console.log('\n=== Example 2: Lazy configuration ===\n');

interface AppConfig {
    apiUrl: string;
    timeout: number;
    retries: number;
    debug: boolean;
}

const config = Lazy<AppConfig>(() => {
    console.log('Loading configuration from file...');
    // Simulated config loading
    return {
        apiUrl: 'https://api.example.com',
        timeout: 5000,
        retries: 3,
        debug: true,
    };
});

function getApiUrl(): string {
    return config.force().apiUrl;
}

function getTimeout(): number {
    return config.force().timeout;
}

// Configuration is loaded on first access
console.log('Calling getApiUrl():');
console.log(`API URL: ${getApiUrl()}`);

console.log('\nCalling getTimeout():');
console.log(`Timeout: ${getTimeout()} (config already loaded, no log)`);

// ============================================================================
// Example 3: LazyAsync for async resources
// ============================================================================
console.log('\n=== Example 3: LazyAsync for async resources ===\n');

interface Database {
    query(sql: string): Promise<unknown[]>;
    close(): void;
}

// Simulated database connection
const createDatabase = async (connectionString: string): Promise<Database> => {
    console.log(`Connecting to database: ${connectionString}...`);
    await new Promise(r => setTimeout(r, 100));
    console.log('Connected!');

    return {
        async query(sql: string) {
            console.log(`Executing: ${sql}`);
            return [{ id: 1, name: 'Example' }];
        },
        close() {
            console.log('Database connection closed');
        },
    };
};

const db = LazyAsync(() => createDatabase('postgres://localhost/myapp'));

async function getUserById(id: number) {
    const database = await db.force();
    return database.query(`SELECT * FROM users WHERE id = ${id}`);
}

// Multiple concurrent calls - only one connection
console.log('Making concurrent database calls:');
const [users1, users2, users3] = await Promise.all([
    getUserById(1),
    getUserById(2),
    getUserById(3),
]);

console.log(`Query 1 result: ${JSON.stringify(users1)}`);
console.log(`Query 2 result: ${JSON.stringify(users2)}`);
console.log(`Query 3 result: ${JSON.stringify(users3)}`);

// ============================================================================
// Example 4: Lazy singleton pattern
// ============================================================================
console.log('\n=== Example 4: Lazy singleton pattern ===\n');

class Logger {
    private static _instance = Lazy(() => {
        console.log('Creating Logger instance...');
        return new Logger();
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}

    static get instance(): Logger {
        return Logger._instance.force();
    }

    info(message: string): void {
        console.log(`[INFO] ${message}`);
    }

    error(message: string): void {
        console.log(`[ERROR] ${message}`);
    }
}

// Logger is created on first access
Logger.instance.info('Application started');
Logger.instance.error('Something went wrong');
Logger.instance.info('But we recovered!');

// ============================================================================
// Example 5: Lazy with expensive computation
// ============================================================================
console.log('\n=== Example 5: Lazy expensive computation ===\n');

// Compute first N prime numbers
const primes = Lazy(() => {
    console.log('Computing first 100 prime numbers...');
    const result: number[] = [];
    let num = 2;

    while (result.length < 100) {
        let isPrime = true;
        for (let i = 2; i <= Math.sqrt(num); i++) {
            if (num % i === 0) {
                isPrime = false;
                break;
            }
        }
        if (isPrime) {
            result.push(num);
        }
        num++;
    }

    console.log('Done computing primes');
    return result;
});

function isPrime(n: number): boolean {
    const primeList = primes.force();
    if (n <= primeList[primeList.length - 1]) {
        return primeList.includes(n);
    }
    // For larger numbers, do direct check
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
    }
    return true;
}

console.log('Checking if 97 is prime:');
console.log(`97 is prime: ${isPrime(97)}`);

console.log('\nChecking if 100 is prime (uses cached primes):');
console.log(`100 is prime: ${isPrime(100)}`);

// ============================================================================
// Example 6: LazyAsync with retry on failure
// ============================================================================
console.log('\n=== Example 6: LazyAsync with failure handling ===\n');

let attemptCount = 0;

const unreliableResource = LazyAsync(async () => {
    attemptCount++;
    console.log(`Attempt ${attemptCount} to load resource...`);

    if (attemptCount < 3) {
        throw new Error(`Failed on attempt ${attemptCount}`);
    }

    return { data: 'Resource loaded successfully' };
});

// Retry loop
async function loadWithRetry(maxRetries: number) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await unreliableResource.force();
        } catch (error) {
            console.log(`Error: ${(error as Error).message}`);
            if (i === maxRetries - 1) {
                throw error;
            }
            console.log('Retrying...');
        }
    }
}

try {
    const resource = await loadWithRetry(5);
    console.log(`Success: ${JSON.stringify(resource)}`);
} catch (error) {
    console.log(`Failed after all retries: ${(error as Error).message}`);
}

// ============================================================================
// Example 7: Comparison between Lazy and Once
// ============================================================================
console.log('\n=== Example 7: Lazy vs Once ===\n');

import { Once } from '../src/mod.ts';

// Lazy: initialization function bound at creation
const lazyValue = Lazy(() => {
    console.log('Lazy: Computing value');
    return 42;
});

// Once: initialization function provided at access time
const onceValue = Once<number>();

console.log('With Lazy:');
console.log(`  First access: ${lazyValue.force()}`);
console.log(`  Second access: ${lazyValue.force()} (cached)`);

console.log('\nWith Once:');
// Can use different functions - only first one runs
const v1 = onceValue.getOrInit(() => {
    console.log('Once: Computing first value');
    return 100;
});
const v2 = onceValue.getOrInit(() => {
    console.log('Once: Computing second value (never called)');
    return 200;
});
console.log(`  First getOrInit: ${v1}`);
console.log(`  Second getOrInit: ${v2} (returns cached value)`);

console.log('\nKey differences:');
console.log('  - Lazy: Function bound at creation, simpler API (just force())');
console.log('  - Once: Function provided at access, more flexible (getOrInit, set, take)');
