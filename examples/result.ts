/**
 * Result example: Form validation and data processing
 *
 * Demonstrates using Result for error handling in a type-safe way,
 * replacing try-catch with chainable operations.
 */
import { Err, Ok, type Result } from '../src/mod.ts';

// Error types
interface ValidationError {
    field: string;
    message: string;
}

// User registration data
interface RegistrationForm {
    email: string;
    password: string;
    age: string;
}

interface ValidatedUser {
    email: string;
    passwordHash: string;
    age: number;
}

/**
 * Validate email format
 */
function validateEmail(email: string): Result<string, ValidationError> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return Err({ field: 'email', message: 'Invalid email format' });
    }
    return Ok(email.toLowerCase());
}

/**
 * Validate password strength
 */
function validatePassword(password: string): Result<string, ValidationError> {
    if (password.length < 8) {
        return Err({ field: 'password', message: 'Password must be at least 8 characters' });
    }
    if (!/\d/.test(password)) {
        return Err({ field: 'password', message: 'Password must contain a number' });
    }
    return Ok(password);
}

/**
 * Validate and parse age
 */
function validateAge(ageStr: string): Result<number, ValidationError> {
    const age = parseInt(ageStr, 10);
    if (isNaN(age)) {
        return Err({ field: 'age', message: 'Age must be a number' });
    }
    if (age < 18 || age > 120) {
        return Err({ field: 'age', message: 'Age must be between 18 and 120' });
    }
    return Ok(age);
}

/**
 * Hash password (simulated)
 */
function hashPassword(password: string): string {
    return `hashed_${password}_${Date.now()}`;
}

/**
 * Validate entire registration form
 */
function validateRegistration(form: RegistrationForm): Result<ValidatedUser, ValidationError> {
    return validateEmail(form.email)
        .inspect(email => console.log(`Email validated: ${email}`))
        .andThen(email =>
            validatePassword(form.password)
                .inspect(() => console.log('Password validated'))
                .map(password => ({ email, passwordHash: hashPassword(password) })),
        )
        .andThen(partial =>
            validateAge(form.age)
                .inspect(age => console.log(`Age validated: ${age}`))
                .map(age => ({ ...partial, age })),
        );
}

// Example 1: Successful validation
console.log('=== Example 1: Valid registration ===');
const validForm: RegistrationForm = {
    email: 'Alice@Example.com',
    password: 'secure123',
    age: '25',
};

const result1 = validateRegistration(validForm);
if (result1.isOk()) {
    const user = result1.unwrap();
    console.log(`Registered: ${user.email}, age ${user.age}\n`);
}

// Example 2: Validation error
console.log('=== Example 2: Invalid registration ===');
const invalidForm: RegistrationForm = {
    email: 'invalid-email',
    password: 'short',
    age: '16',
};

const result2 = validateRegistration(invalidForm)
    .inspectErr(err => console.log(`Validation failed: ${err.field} - ${err.message}`))
    .mapErr(err => `Error in ${err.field}: ${err.message}`);

console.log(`Result: ${result2.unwrapOr({ email: '', passwordHash: '', age: 0 })}\n`);

// Example 3: Error recovery with orElse
console.log('=== Example 3: Error recovery ===');
const formWithBadAge: RegistrationForm = {
    email: 'bob@example.com',
    password: 'password123',
    age: 'twenty-five',
};

const result3 = validateRegistration(formWithBadAge)
    .orElse(err => {
        if (err.field === 'age') {
            console.log('Age parsing failed, using default age 18');
            return Ok({
                email: formWithBadAge.email.toLowerCase(),
                passwordHash: hashPassword(formWithBadAge.password),
                age: 18,
            });
        }
        return Err(err);
    });

console.log(`Recovered user age: ${result3.map(u => u.age).unwrapOr(-1)}\n`);

// Example 4: Transform errors
console.log('=== Example 4: Error transformation ===');
interface ApiError {
    code: number;
    message: string;
}

const apiResult = validateEmail('bad-email')
    .mapErr((err): ApiError => ({
        code: 400,
        message: `Validation error: ${err.message}`,
    }));

console.log(
    apiResult
        .map(email => `Success: ${email}`)
        .unwrapOr(`API Error ${ apiResult.err().map(e => e.code).unwrapOr(0) }`),
);
