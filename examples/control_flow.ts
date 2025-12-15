/**
 * ControlFlow Examples
 *
 * Demonstrates how to use ControlFlow for structured control flow handling.
 * ControlFlow is useful for short-circuiting operations and custom iterators.
 */

import { Break, Continue, type ControlFlow } from '../src/mod.ts';

// ============================================================================
// Example 1: Short-circuiting Search
// ============================================================================

console.log('=== Example 1: Short-circuiting Search ===\n');

/**
 * Using ControlFlow for more explicit control flow.
 * This pattern is useful when you need to carry additional state.
 */
function findFirstWithFlow<T>(arr: T[], predicate: (item: T) => boolean): ControlFlow<T, void> {
    for (const item of arr) {
        if (predicate(item)) {
            return Break(item);
        }
    }
    return Continue();
}

const numbers = [1, 4, 7, 10, 13, 16];

const result1 = findFirstWithFlow(numbers, n => n > 10);
if (result1.isBreak()) {
    console.log(`Found: ${result1.breakValue().unwrap()}`);
} else {
    console.log('Not found');
}

const result2 = findFirstWithFlow(numbers, n => n > 100);
if (result2.isBreak()) {
    console.log(`Found: ${result2.breakValue().unwrap()}`);
} else {
    console.log('Not found (as expected)');
}

// ============================================================================
// Example 2: Try-Fold Pattern (Failable Accumulation)
// ============================================================================

console.log('\n=== Example 2: Try-Fold Pattern ===\n');

/**
 * Sum numbers until the sum exceeds a limit.
 * Returns Break(sum) if limit exceeded, Continue(sum) if completed normally.
 */
function sumWithLimit(numbers: number[], limit: number): ControlFlow<number, number> {
    let sum = 0;
    for (const n of numbers) {
        sum += n;
        if (sum > limit) {
            return Break(sum);
        }
    }
    return Continue(sum);
}

const data = [10, 20, 30, 40, 50];

const sumResult = sumWithLimit(data, 75);
if (sumResult.isBreak()) {
    console.log(`Limit exceeded! Sum reached: ${sumResult.breakValue().unwrap()}`);
} else {
    console.log(`Completed. Total sum: ${sumResult.continueValue().unwrap()}`);
}

const sumResult2 = sumWithLimit(data, 200);
if (sumResult2.isContinue()) {
    console.log(`Completed normally. Total: ${sumResult2.continueValue().unwrap()}`);
}

// ============================================================================
// Example 3: Generic tryFold Implementation
// ============================================================================

console.log('\n=== Example 3: Generic tryFold ===\n');

/**
 * A generic try_fold that can short-circuit.
 * Similar to Rust's Iterator::try_fold.
 */
function tryFold<T, Acc, B>(
    items: T[],
    init: Acc,
    f: (acc: Acc, item: T) => ControlFlow<B, Acc>,
): ControlFlow<B, Acc> {
    let acc = init;
    for (const item of items) {
        const flow = f(acc, item);
        if (flow.isBreak()) {
            return flow;
        }
        acc = flow.continueValue().unwrap();
    }
    return Continue(acc);
}

// Use tryFold to find the first duplicate
const items = ['apple', 'banana', 'cherry', 'banana', 'date'];
const seen = new Set<string>();

const duplicateResult = tryFold(items, seen, (set, item) => {
    if (set.has(item)) {
        return Break(item); // Found duplicate!
    }
    set.add(item);
    return Continue(set);
});

if (duplicateResult.isBreak()) {
    console.log(`First duplicate found: "${duplicateResult.breakValue().unwrap()}"`);
} else {
    console.log('No duplicates found');
}

// ============================================================================
// Example 4: Mapping ControlFlow Values
// ============================================================================

console.log('\n=== Example 4: Mapping Values ===\n');

interface ParseError {
    line: number;
    message: string;
}

function parseLines(lines: string[]): ControlFlow<ParseError, string[]> {
    const results: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('#')) {
            // Skip comments
            continue;
        }
        if (line.includes('ERROR')) {
            return Break({ line: i + 1, message: `Invalid content: ${line}` });
        }
        results.push(line.toUpperCase());
    }

    return Continue(results);
}

const input = ['hello', '# comment', 'world', 'ERROR: something wrong', 'goodbye'];
const parseResult = parseLines(input);

// Map the break value to a formatted error string
const mappedResult = parseResult.mapBreak(err => `Line ${err.line}: ${err.message}`);

if (mappedResult.isBreak()) {
    console.log(`Parse failed - ${mappedResult.breakValue().unwrap()}`);
} else {
    console.log(`Parse succeeded: ${mappedResult.continueValue().unwrap()}`);
}

// Example without error
const cleanInput = ['hello', '# comment', 'world'];
const cleanResult = parseLines(cleanInput);

// Map the continue value
const mappedClean = cleanResult.mapContinue(lines => lines.join(', '));

if (mappedClean.isContinue()) {
    console.log(`Result: ${mappedClean.continueValue().unwrap()}`);
}

// ============================================================================
// Example 5: Async ControlFlow Pattern
// ============================================================================

console.log('\n=== Example 5: Async Pattern ===\n');

interface Task {
    id: number;
    name: string;
    shouldFail?: boolean;
}

async function processTask(task: Task): Promise<ControlFlow<Error, string>> {
    // Simulate async work
    await new Promise(r => setTimeout(r, 10));

    if (task.shouldFail) {
        return Break(new Error(`Task ${task.id} failed: ${task.name}`));
    }

    return Continue(`Task ${task.id} completed: ${task.name}`);
}

async function processTasks(tasks: Task[]): Promise<ControlFlow<Error, string[]>> {
    const results: string[] = [];

    for (const task of tasks) {
        const result = await processTask(task);

        if (result.isBreak()) {
            // Propagate the error - use mapContinue to change the continue type
            return result.mapContinue(() => results);
        }

        results.push(result.continueValue().unwrap());
    }

    return Continue(results);
}

// Run async example
async function runAsyncExample() {
    const tasks: Task[] = [
        { id: 1, name: 'Download' },
        { id: 2, name: 'Parse' },
        { id: 3, name: 'Validate', shouldFail: true },
        { id: 4, name: 'Save' },
    ];

    const result = await processTasks(tasks);

    if (result.isBreak()) {
        console.log(`Processing stopped: ${result.breakValue().unwrap().message}`);
    } else {
        console.log(`All tasks completed: ${result.continueValue().unwrap().join(', ')}`);
    }

    // Run without failures
    const successTasks: Task[] = [
        { id: 1, name: 'Download' },
        { id: 2, name: 'Parse' },
        { id: 3, name: 'Save' },
    ];

    const successResult = await processTasks(successTasks);
    if (successResult.isContinue()) {
        console.log(`Success: ${successResult.continueValue().unwrap().join(', ')}`);
    }
}

await runAsyncExample();

console.log('\n=== ControlFlow Examples Complete ===');
