/**
 * Lazy example: Lazy initialization on first access
 *
 * Demonstrates using Lazy for deferred synchronous initialization.
 * Unlike Once, the initialization function is bound at creation time.
 */
import { Lazy, Once } from '../../../src/mod.ts';

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
// Example 3: Lazy singleton pattern
// ============================================================================
console.log('\n=== Example 3: Lazy singleton pattern ===\n');

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
// Example 4: Lazy with expensive computation
// ============================================================================
console.log('\n=== Example 4: Lazy expensive computation ===\n');

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
// Example 5: Comparison between Lazy and Once
// ============================================================================
console.log('\n=== Example 5: Lazy vs Once ===\n');

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

// ============================================================================
// Example 6: Lazy with error handling
// ============================================================================
console.log('\n=== Example 6: Lazy with error handling ===\n');

const shouldFail = true;

const riskyValue = Lazy(() => {
    console.log('Attempting to compute value...');
    if (shouldFail) {
        throw new Error('Computation failed!');
    }
    return 'Success!';
});

console.log('First attempt (will fail):');
try {
    riskyValue.force();
} catch (e) {
    console.log(`Error: ${(e as Error).message}`);
    console.log(`isInitialized: ${riskyValue.isInitialized()}`);
}

console.log('\nNote: After error, Lazy is still uninitialized.');
console.log('Unlike Once, Lazy will retry initialization on next force().');

// In real code, you might create a new Lazy or handle differently
// For demo purposes, we'll just show the state
console.log(`Final isInitialized: ${riskyValue.isInitialized()}`);
