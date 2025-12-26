/**
 * Option example: User profile lookup with optional fields
 *
 * Demonstrates using Option for handling nullable/optional values
 * in a type-safe way without null checks scattered throughout code.
 */
import { None, type Option, Some } from '../../../src/mod.ts';

// Simulated user data with optional fields
interface User {
    id: number;
    name: string;
    email?: string;
    age?: number;
}

const users: User[] = [
    { id: 1, name: 'Alice', email: 'alice@example.com', age: 28 },
    { id: 2, name: 'Bob', age: 35 },
    { id: 3, name: 'Charlie', email: 'charlie@example.com' },
];

/**
 * Find a user by ID, returning Option<User>
 */
function findUserById(id: number): Option<User> {
    const user = users.find(u => u.id === id);
    return user ? Some(user) : None;
}

/**
 * Get user's email as Option<string>
 */
function getUserEmail(user: User): Option<string> {
    return user.email ? Some(user.email) : None;
}

/**
 * Check if user is an adult (age >= 18)
 */
function isAdult(user: User): Option<boolean> {
    return user.age !== undefined ? Some(user.age >= 18) : None;
}

// Example 1: Chain operations to get user email domain
console.log('=== Example 1: Get email domain ===');
const emailDomain = findUserById(1)
    .inspect(user => console.log(`Found user: ${user.name}`))
    .andThen(getUserEmail)
    .inspect(email => console.log(`User email: ${email}`))
    .map(email => email.split('@')[1])
    .unwrapOr('no-domain');

console.log(`Email domain: ${emailDomain}\n`);

// Example 2: Handle missing user gracefully
console.log('=== Example 2: Handle missing user ===');
const missingUser = findUserById(999)
    .inspect(user => console.log(`Found: ${user.name}`))
    .orElse(() => {
        console.log('User not found, using guest');
        return Some({ id: 0, name: 'Guest' });
    })
    .map(user => `Welcome, ${user.name}!`)
    .unwrap();

console.log(`${missingUser}\n`);

// Example 3: Filter and transform
console.log('=== Example 3: Filter adult users ===');
for (const id of [1, 2, 3]) {
    const result = findUserById(id)
        .andThen(user => isAdult(user).map(adult => ({ user, adult })))
        .filter(({ adult }) => adult)
        .map(({ user }) => user.name)
        .unwrapOr('Not an adult or age unknown');

    console.log(`User ${id}: ${result}`);
}

// Example 4: Zip two Options together
console.log('\n=== Example 4: Combine user data ===');
const user1 = findUserById(1);
const user2 = findUserById(2);

const combined = user1
    .zip(user2)
    .map(([u1, u2]) => `${u1.name} and ${u2.name} are friends`)
    .unwrapOr('Could not find both users');

console.log(combined);
