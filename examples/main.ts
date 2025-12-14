/**
 * Happy-Rusty Examples
 *
 * Run with: deno run -A examples/main.ts
 *
 * Each example demonstrates real-world usage patterns for Option and Result types.
 */

console.log('╔════════════════════════════════════════════════╗');
console.log('║         Happy-Rusty Usage Examples             ║');
console.log('╚════════════════════════════════════════════════╝\n');

console.log('┌────────────────────────────────────────────────┐');
console.log('│  Option: User Profile Lookup                   │');
console.log('└────────────────────────────────────────────────┘\n');
await import('./option.ts');

console.log('\n┌────────────────────────────────────────────────┐');
console.log('│  Async Option: Remote Data with Caching        │');
console.log('└────────────────────────────────────────────────┘\n');
await import('./option.async.ts');

console.log('\n┌────────────────────────────────────────────────┐');
console.log('│  Result: Form Validation                       │');
console.log('└────────────────────────────────────────────────┘\n');
await import('./result.ts');

console.log('\n┌────────────────────────────────────────────────┐');
console.log('│  Async Result: API Calls with Error Handling   │');
console.log('└────────────────────────────────────────────────┘\n');
await import('./result.async.ts');

console.log('\n┌────────────────────────────────────────────────┐');
console.log('│  Once: One-Time Initialization                 │');
console.log('└────────────────────────────────────────────────┘\n');
await import('./once.ts');

console.log('\n┌────────────────────────────────────────────────┐');
console.log('│  Lazy: Deferred Initialization                 │');
console.log('└────────────────────────────────────────────────┘\n');
await import('./lazy.ts');

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║              Examples Complete                 ║');
console.log('╚════════════════════════════════════════════════╝');
