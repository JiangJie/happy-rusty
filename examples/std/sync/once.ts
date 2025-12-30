/**
 * Once example: One-time initialization with value storage
 *
 * Demonstrates using Once for lazy initialization of expensive resources,
 * configuration loading, and singleton patterns. Once is for synchronous use only.
 *
 * For async initialization, see once_async.ts which demonstrates OnceAsync.
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
// Example 4: Singleton pattern
// ============================================================================
console.log('\n=== Example 4: Singleton pattern ===\n');

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
// Example 5: tryInsert() for conditional initialization
// ============================================================================
console.log('\n=== Example 5: tryInsert() ===\n');

const cacheOnce = Once<Map<string, number>>();

// First insert succeeds
const insert1 = cacheOnce.tryInsert(new Map([['a', 1], ['b', 2]]));
console.log(`First insert: ${insert1.isOk() ? 'Success' : 'Failed'}`);
if (insert1.isOk()) {
    console.log(`Cache size: ${insert1.unwrap().size}`);
}

// Second insert fails, returns both current and passed values
const insert2 = cacheOnce.tryInsert(new Map([['x', 100]]));
console.log(`Second insert: ${insert2.isOk() ? 'Success' : 'Failed'}`);
if (insert2.isErr()) {
    const [current, passed] = insert2.unwrapErr();
    console.log(`Current cache size: ${current.size}, Passed cache size: ${passed.size}`);
}

// ============================================================================
// Example 6: Configuration with validation
// ============================================================================
console.log('\n=== Example 6: Configuration with validation ===\n');

interface AppConfig {
    port: number;
    host: string;
    maxConnections: number;
}

const appConfig = Once<AppConfig>();

function loadAppConfig(rawConfig: Record<string, unknown>): AppConfig {
    return appConfig.getOrTryInit(() => {
        // Validate required fields
        if (typeof rawConfig['port'] !== 'number' || rawConfig['port'] < 1 || rawConfig['port'] > 65535) {
            return Err(new Error('Invalid port number'));
        }
        if (typeof rawConfig['host'] !== 'string' || rawConfig['host'].length === 0) {
            return Err(new Error('Invalid host'));
        }

        return Ok({
            port: rawConfig['port'] as number,
            host: rawConfig['host'] as string,
            maxConnections: (rawConfig['maxConnections'] as number) || 100,
        });
    }).unwrapOr({
        port: 3000,
        host: 'localhost',
        maxConnections: 100,
    });
}

// Load with valid config
const config1 = loadAppConfig({ port: 8080, host: 'api.example.com', maxConnections: 500 });
console.log('Loaded config:', config1);

// Try to load again with different config - returns cached value
const config2 = loadAppConfig({ port: 9000, host: 'other.example.com' });
console.log('Second load (cached):', config2);
console.log(`Same config: ${config1 === config2}`);
