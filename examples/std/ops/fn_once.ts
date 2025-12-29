/**
 * FnOnce Examples
 *
 * Demonstrates how to use FnOnce for one-time callable synchronous functions.
 * FnOnce is useful for ensuring operations execute exactly once,
 * such as cleanup handlers, resource disposal, or one-time events.
 */

import { FnOnce } from '../../../src/mod.ts';

// ============================================================================
// Example 1: Basic FnOnce Usage
// ============================================================================

console.log('=== Example 1: Basic FnOnce Usage ===\n');

const greet = FnOnce((name: string) => `Hello, ${name}!`);

console.log(`Before call: ${greet.toString()}`);
console.log(`isConsumed: ${greet.isConsumed()}`);

const message = greet.call('World');
console.log(`Result: ${message}`);

console.log(`After call: ${greet.toString()}`);
console.log(`isConsumed: ${greet.isConsumed()}`);

// Second call would throw:
// greet.call('Again'); // Error: FnOnce has already been consumed

// ============================================================================
// Example 2: Safe Call with tryCall
// ============================================================================

console.log('\n=== Example 2: Safe Call with tryCall ===\n');

const calculate = FnOnce((a: number, b: number) => a * b);

const result1 = calculate.tryCall(6, 7);
console.log(`First tryCall: ${result1.isSome() ? result1.unwrap() : 'None'}`);

const result2 = calculate.tryCall(10, 10);
console.log(`Second tryCall: ${result2.isSome() ? result2.unwrap() : 'None'}`);

// Using mapOr pattern
const compute = FnOnce(() => Math.random());
const value = compute.tryCall().mapOr(
    'Already consumed',
    v => `Got value: ${v.toFixed(4)}`,
);
console.log(value);

// ============================================================================
// Example 3: One-Time Cleanup Pattern
// ============================================================================

console.log('\n=== Example 3: One-Time Cleanup Pattern ===\n');

interface Connection {
    id: string;
    cleanup: ReturnType<typeof FnOnce<[], void>>;
}

function createConnection(id: string): Connection {
    console.log(`[${id}] Connection opened`);

    return {
        id,
        cleanup: FnOnce(() => {
            console.log(`[${id}] Connection closed and resources released`);
        }),
    };
}

const conn = createConnection('conn-1');

// Simulate multiple cleanup attempts (e.g., from error handling + finally)
conn.cleanup.tryCall(); // Actually cleans up
conn.cleanup.tryCall(); // No-op, already cleaned
conn.cleanup.tryCall(); // No-op, already cleaned

console.log('Cleanup called multiple times safely');

// ============================================================================
// Example 4: Resource Disposal with Error Handling
// ============================================================================

console.log('\n=== Example 4: Resource Disposal with Error Handling ===\n');

interface FileHandle {
    path: string;
    write(data: string): void;
    close: ReturnType<typeof FnOnce<[], void>>;
}

function openFile(path: string): FileHandle {
    console.log(`Opening file: ${path}`);
    let closed = false;

    return {
        path,
        write(data: string) {
            if (closed) {
                throw new Error('Cannot write to closed file');
            }
            console.log(`Writing to ${path}: "${data}"`);
        },
        close: FnOnce(() => {
            closed = true;
            console.log(`Closing file: ${path}`);
        }),
    };
}

const file = openFile('/tmp/data.txt');

try {
    file.write('Hello');
    file.write('World');
    // Simulate error
    throw new Error('Something went wrong');
} catch (error) {
    console.log(`Error: ${(error as Error).message}`);
    file.close.tryCall(); // Cleanup on error
} finally {
    file.close.tryCall(); // Ensure cleanup in finally (no-op if already closed)
}

// ============================================================================
// Example 5: One-Time Event Handler
// ============================================================================

console.log('\n=== Example 5: One-Time Event Handler ===\n');

// Simulated event emitter
class EventEmitter {
    private handlers: ((data: unknown) => void)[] = [];

    on(handler: (data: unknown) => void) {
        this.handlers.push(handler);
    }

    emit(data: unknown) {
        for (const handler of this.handlers) {
            handler(data);
        }
    }
}

const emitter = new EventEmitter();
const clicks: number[] = [];

// Only handle the first event
const onFirstEvent = FnOnce((eventData: { x: number; }) => {
    clicks.push(eventData.x);
    console.log(`First event handled: x=${eventData.x}`);
});

emitter.on((data) => {
    onFirstEvent.tryCall(data as { x: number; });
});

// Emit multiple events
emitter.emit({ x: 10 });
emitter.emit({ x: 20 });
emitter.emit({ x: 30 });

console.log(`Recorded clicks: [${clicks.join(', ')}]`); // Only [10]

// ============================================================================
// Example 6: Initialization Guard
// ============================================================================

console.log('\n=== Example 6: Initialization Guard ===\n');

class Application {
    private _initialize: ReturnType<typeof FnOnce<[], { ready: boolean; }>>;

    constructor() {
        this._initialize = FnOnce(() => {
            console.log('Initializing application...');
            console.log('  - Loading config');
            console.log('  - Setting up database');
            console.log('  - Starting services');
            return { ready: true };
        });
    }

    start() {
        const result = this._initialize.tryCall();
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

const app = new Application();
console.log(`Is initialized: ${app.isInitialized}`);

app.start();
console.log(`Is initialized: ${app.isInitialized}`);

app.start(); // No-op, already initialized

// ============================================================================
// Example 7: Callback Factory Pattern
// ============================================================================

console.log('\n=== Example 7: Callback Factory Pattern ===\n');

type UnsubscribeFn = ReturnType<typeof FnOnce<[], void>>;

function subscribe(topic: string, _callback: (msg: string) => void): UnsubscribeFn {
    console.log(`Subscribed to: ${topic}`);

    // Simulated subscription
    const subscriptionId = Math.random().toString(36).slice(2, 8);

    return FnOnce(() => {
        console.log(`Unsubscribed from: ${topic} (id: ${subscriptionId})`);
        // Actual cleanup logic would go here
    });
}

const unsub1 = subscribe('news', msg => console.log(`News: ${msg}`));
const unsub2 = subscribe('weather', msg => console.log(`Weather: ${msg}`));

// Clean up subscriptions
unsub1.call();
unsub2.call();

// Safe to call again (will throw, but we use tryCall for safety)
unsub1.tryCall(); // No-op

// ============================================================================
// Example 8: Promise Resolution Guard
// ============================================================================

console.log('\n=== Example 8: Promise Resolution Guard ===\n');

function createDeferredPromise<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: unknown) => void;
    let settled = false;

    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    // Single FnOnce to guard settlement
    const settle = FnOnce((action: 'resolve' | 'reject', value: T | unknown) => {
        settled = true;
        if (action === 'resolve') {
            console.log('Resolving promise');
            resolve(value as T);
        } else {
            console.log('Rejecting promise');
            reject(value);
        }
    });

    return {
        promise,
        resolve: (value: T) => settle.tryCall('resolve', value),
        reject: (reason: unknown) => settle.tryCall('reject', reason),
        isSettled: () => settled,
    };
}

const deferred = createDeferredPromise<string>();

// Multiple resolution attempts
deferred.resolve('First');  // Resolves
deferred.resolve('Second'); // No-op
deferred.reject('Error');   // No-op

const result = await deferred.promise;
console.log(`Promise result: ${result}`);
console.log(`Is settled: ${deferred.isSettled()}`);

// ============================================================================
// Example 9: Comparison with Regular Functions
// ============================================================================

console.log('\n=== Example 9: Comparison with Regular Functions ===\n');

// Regular function - can be called multiple times
function regularCleanup() {
    console.log('Regular: cleanup called');
}

regularCleanup();
regularCleanup();
regularCleanup();

console.log('');

// Boolean guard pattern - manual tracking
let manualCleaned = false;
function manualCleanup() {
    if (manualCleaned) return;
    manualCleaned = true;
    console.log('Manual: cleanup called');
}

manualCleanup();
manualCleanup();
manualCleanup();

console.log('');

// FnOnce - automatic tracking, type-safe
const fnOnceCleanup = FnOnce(() => {
    console.log('FnOnce: cleanup called');
});

fnOnceCleanup.tryCall();
fnOnceCleanup.tryCall();
fnOnceCleanup.tryCall();

console.log('\nFnOnce advantages:');
console.log('  - No manual boolean flags needed');
console.log('  - Type-safe: tryCall() returns Option<R>');
console.log('  - call() throws if already consumed (fail-fast)');
console.log('  - isConsumed() for status checking');

console.log('\n=== FnOnce Examples Complete ===');
