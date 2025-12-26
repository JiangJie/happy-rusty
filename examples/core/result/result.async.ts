/**
 * Async Result example: API calls with error handling
 *
 * Demonstrates using async Result methods for handling
 * asynchronous operations that may fail.
 */
import { Err, Ok, type Result, tryAsyncResult } from '../../../src/mod.ts';

// Types
interface User {
    id: number;
    name: string;
    email: string;
}

interface Post {
    id: number;
    userId: number;
    title: string;
    body: string;
}

interface ApiError {
    code: number;
    message: string;
}

// Simulated database
const users: User[] = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
];

const posts: Post[] = [
    { id: 1, userId: 1, title: 'Hello World', body: 'My first post' },
    { id: 2, userId: 1, title: 'Rust vs TypeScript', body: 'Both are great!' },
    { id: 3, userId: 2, title: 'Learning Option/Result', body: 'Very useful patterns' },
];

/**
 * Simulate API call to fetch user
 */
async function fetchUser(id: number): Promise<Result<User, ApiError>> {
    await new Promise(resolve => setTimeout(resolve, 100));

    const user = users.find(u => u.id === id);
    if (!user) {
        return Err({ code: 404, message: `User ${id} not found` });
    }
    return Ok(user);
}

/**
 * Simulate API call to fetch user's posts
 */
async function fetchUserPosts(userId: number): Promise<Result<Post[], ApiError>> {
    await new Promise(resolve => setTimeout(resolve, 100));

    const userPosts = posts.filter(p => p.userId === userId);
    if (userPosts.length === 0) {
        return Err({ code: 404, message: `No posts found for user ${userId}` });
    }
    return Ok(userPosts);
}

/**
 * Simulate sending notification
 */
async function sendNotification(email: string, message: string): Promise<Result<void, ApiError>> {
    await new Promise(resolve => setTimeout(resolve, 50));

    if (!email.includes('@')) {
        return Err({ code: 400, message: 'Invalid email address' });
    }

    console.log(`[Notification sent to ${email}]: ${message}`);
    return Ok(undefined);
}

// Example 1: Chain async operations
console.log('=== Example 1: Fetch user and their posts ===');

const userWithPosts = await (await fetchUser(1))
    .inspect(user => console.log(`Found user: ${user.name}`))
    .andThenAsync(async user => {
        const postsResult = await fetchUserPosts(user.id);
        return postsResult.map(posts => ({ user, posts }));
    });

userWithPosts
    .inspect(({ user, posts }) => {
        console.log(`${user.name} has ${posts.length} posts:`);
        posts.forEach(p => console.log(`  - ${p.title}`));
    })
    .inspectErr(err => console.log(`Error: ${err.message}`));

// Example 2: Error recovery with async fallback
console.log('\n=== Example 2: Fallback on error ===');

const result2 = await (await fetchUser(999))
    .inspectErr(err => console.log(`Primary fetch failed: ${err.message}`))
    .orElseAsync(async err => {
        console.log('Trying fallback: fetching first available user...');
        if (err.code === 404 && users.length > 0) {
            return Ok(users[0]);
        }
        return Err(err);
    });

console.log(`Got user: ${result2.map(u => u.name).unwrapOr('None')}`);

// Example 3: Async validation
console.log('\n=== Example 3: Async validation chain ===');

const isValidUser = await (await fetchUser(1)).isOkAndAsync(async user => {
    // Check if user has posts
    const postsResult = await fetchUserPosts(user.id);
    return postsResult.isOk() && postsResult.unwrap().length > 0;
});

console.log(`User 1 is valid (has posts): ${isValidUser}`);

// Example 4: Using tryAsyncResult
console.log('\n=== Example 4: Convert Promise to Result ===');

async function riskyOperation(): Promise<string> {
    if (Math.random() > 0.5) {
        throw new Error('Random failure');
    }
    return 'Operation succeeded';
}

// Run multiple times to see both outcomes
for (let i = 0; i < 3; i++) {
    const result = await tryAsyncResult(riskyOperation());
    console.log(
        result
            .map(msg => `Success: ${msg}`)
            .unwrapOr(`Failed: ${ result.err().map(e => e.message).unwrapOr('Unknown') }`),
    );
}

// Example 4b: tryAsyncResult with argument passing (like Promise.try)
console.log('\n=== Example 4b: tryAsyncResult with arguments ===');

async function fetchData(url: string, options: { method: string; }): Promise<string> {
    // Simulate fetch
    await new Promise(resolve => setTimeout(resolve, 50));
    return `Fetched from ${url} with method ${options.method}`;
}

// Pass arguments directly - no closure needed!
const fetchResult = await tryAsyncResult(fetchData, 'https://api.example.com', { method: 'GET' });
console.log(fetchResult.unwrapOr('Fetch failed'));

// Example 4c: tryAsyncResult with sync/async unified return
console.log('\n=== Example 4c: Sync/Async unified return ===');

// Cache example: returns sync if cached, async if not
const cache = new Map<string, string>([['user:1', 'Alice']]);

function getCachedOrFetch(key: string): string | Promise<string> {
    const cached = cache.get(key);
    if (cached !== undefined) {
        return cached; // Sync return
    }
    // Simulate async fetch
    return new Promise(resolve => {
        setTimeout(() => resolve(`Fetched: ${key}`), 50);
    });
}

// tryAsyncResult handles both sync and async returns uniformly
const cachedResult = await tryAsyncResult(getCachedOrFetch, 'user:1');
console.log(`Cached: ${cachedResult.unwrapOr('miss')}`); // Sync path

const fetchedResult = await tryAsyncResult(getCachedOrFetch, 'user:2');
console.log(`Fetched: ${fetchedResult.unwrapOr('miss')}`); // Async path

// Example 5: Complex async workflow
console.log('\n=== Example 5: Complete workflow ===');

async function processUserNotification(userId: number): Promise<Result<string, ApiError>> {
    const userResult = await fetchUser(userId);
    if (userResult.isErr()) {
        return userResult.asErr();
    }

    const user = userResult.unwrap();
    const postsResult = await fetchUserPosts(user.id);

    const message = postsResult
        .map(posts => `You have ${posts.length} posts`)
        .unwrapOr('Start writing your first post!');

    return (await sendNotification(user.email, message))
        .map(() => `Notification sent to ${user.name}`);
}

const notificationResult = await processUserNotification(1);
console.log(notificationResult.unwrapOr('Failed to send notification'));
