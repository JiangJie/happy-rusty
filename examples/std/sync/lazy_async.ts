/**
 * LazyAsync example: Async lazy initialization on first access
 *
 * Demonstrates using LazyAsync for deferred async initialization.
 * If multiple calls to force() occur concurrently before initialization
 * completes, only one initialization will run.
 */
import { LazyAsync } from '../../../src/mod.ts';

// ============================================================================
// Example 1: Basic LazyAsync usage
// ============================================================================
console.log('=== Example 1: Basic LazyAsync usage ===\n');

const asyncValue = LazyAsync(async () => {
    console.log('Fetching data...');
    await new Promise(r => setTimeout(r, 100));
    return { data: 'Hello, World!' };
});

console.log(`Before force: isInitialized = ${asyncValue.isInitialized()}`);
console.log(`get() = ${asyncValue.get().isNone() ? 'None' : asyncValue.get().unwrap()}`);

console.log('\nFirst access via force():');
const result = await asyncValue.force();
console.log(`Result: ${JSON.stringify(result)}`);

console.log('\nSecond access (cached):');
const cached = await asyncValue.force();
console.log(`Result: ${JSON.stringify(cached)} (no fetching log)`);
console.log(`isInitialized = ${asyncValue.isInitialized()}`);

// ============================================================================
// Example 2: LazyAsync for database connection
// ============================================================================
console.log('\n=== Example 2: LazyAsync for database connection ===\n');

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
// Example 3: LazyAsync configuration loader
// ============================================================================
console.log('\n=== Example 3: LazyAsync configuration loader ===\n');

interface AppConfig {
    apiUrl: string;
    timeout: number;
    features: string[];
}

const config = LazyAsync<AppConfig>(async () => {
    console.log('Loading configuration from remote...');
    await new Promise(r => setTimeout(r, 50));
    // Simulated remote config
    return {
        apiUrl: 'https://api.example.com',
        timeout: 5000,
        features: ['feature-a', 'feature-b'],
    };
});

async function getApiUrl(): Promise<string> {
    return (await config.force()).apiUrl;
}

async function getTimeout(): Promise<number> {
    return (await config.force()).timeout;
}

// Configuration is loaded on first access
console.log('Calling getApiUrl():');
console.log(`API URL: ${await getApiUrl()}`);

console.log('\nCalling getTimeout():');
console.log(`Timeout: ${await getTimeout()} (config already loaded, no log)`);

// ============================================================================
// Example 4: LazyAsync with retry on failure
// ============================================================================
console.log('\n=== Example 4: LazyAsync with failure handling ===\n');

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
// Example 5: LazyAsync singleton service
// ============================================================================
console.log('\n=== Example 5: LazyAsync singleton service ===\n');

class ApiService {
    private baseUrl: string;

    private static _instance = LazyAsync(async () => {
        console.log('Initializing ApiService...');
        await new Promise(r => setTimeout(r, 50));
        return new ApiService('https://api.example.com');
    });

    private constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    static async getInstance(): Promise<ApiService> {
        return ApiService._instance.force();
    }

    async get(path: string): Promise<string> {
        return `GET ${this.baseUrl}${path}`;
    }
}

// Service is initialized on first access
const api1 = await ApiService.getInstance();
console.log(await api1.get('/users'));

const api2 = await ApiService.getInstance();
console.log(await api2.get('/posts'));

console.log(`Same instance: ${api1 === api2}`);

// ============================================================================
// Example 6: Concurrent initialization safety
// ============================================================================
console.log('\n=== Example 6: Concurrent initialization safety ===\n');

let initCount = 0;

const heavyResource = LazyAsync(async () => {
    initCount++;
    console.log(`Starting heavy initialization (count: ${initCount})...`);
    await new Promise(r => setTimeout(r, 100));
    console.log('Heavy initialization complete');
    return { initialized: true, count: initCount };
});

// Launch many concurrent requests
console.log('Launching 10 concurrent force() calls...');
const promises = Array.from({ length: 10 }, (_, i) =>
    heavyResource.force().then(r => {
        console.log(`Request ${i + 1} got result`);
        return r;
    }),
);

const results = await Promise.all(promises);
console.log(`\nAll requests completed. Init count: ${initCount}`);
console.log(`All results identical: ${results.every(r => r === results[0])}`);
