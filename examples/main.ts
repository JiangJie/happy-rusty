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
await import('./core/option/option.ts');

console.log('\n┌────────────────────────────────────────────────┐');
console.log('│  Async Option: Remote Data with Caching        │');
console.log('└────────────────────────────────────────────────┘\n');
await import('./core/option/option.async.ts');

console.log('\n┌────────────────────────────────────────────────┐');
console.log('│  Result: Form Validation                       │');
console.log('└────────────────────────────────────────────────┘\n');
await import('./core/result/result.ts');

console.log('\n┌────────────────────────────────────────────────┐');
console.log('│  Async Result: API Calls with Error Handling   │');
console.log('└────────────────────────────────────────────────┘\n');
await import('./core/result/result.async.ts');

console.log('\n┌────────────────────────────────────────────────┐');
console.log('│  Once: One-Time Initialization                 │');
console.log('└────────────────────────────────────────────────┘\n');
await import('./std/sync/once.ts');

console.log('\n┌────────────────────────────────────────────────┐');
console.log('│  OnceAsync: Async One-Time Initialization      │');
console.log('└────────────────────────────────────────────────┘\n');
await import('./std/sync/once_async.ts');

console.log('\n┌────────────────────────────────────────────────┐');
console.log('│  Lazy: Deferred Initialization                 │');
console.log('└────────────────────────────────────────────────┘\n');
await import('./std/sync/lazy.ts');

console.log('\n┌────────────────────────────────────────────────┐');
console.log('│  LazyAsync: Async Deferred Initialization      │');
console.log('└────────────────────────────────────────────────┘\n');
await import('./std/sync/lazy_async.ts');

console.log('\n┌────────────────────────────────────────────────┐');
console.log('│  Mutex: Async Mutual Exclusion                 │');
console.log('└────────────────────────────────────────────────┘\n');
await import('./std/sync/mutex.ts');

console.log('\n┌────────────────────────────────────────────────┐');
console.log('│  RwLock: Async Read-Write Lock                 │');
console.log('└────────────────────────────────────────────────┘\n');
await import('./std/sync/rwlock.ts');

console.log('\n┌────────────────────────────────────────────────┐');
console.log('│  Channel: MPMC Async Message Passing           │');
console.log('└────────────────────────────────────────────────┘\n');
await import('./std/sync/channel.ts');

console.log('\n┌────────────────────────────────────────────────┐');
console.log('│  ControlFlow: Short-circuiting Operations      │');
console.log('└────────────────────────────────────────────────┘\n');
await import('./std/ops/control_flow.ts');

console.log('\n┌────────────────────────────────────────────────┐');
console.log('│  FnOnce: One-Time Callable Functions           │');
console.log('└────────────────────────────────────────────────┘\n');
await import('./std/ops/fn_once.ts');

console.log('\n┌────────────────────────────────────────────────┐');
console.log('│  FnOnceAsync: Async One-Time Callable          │');
console.log('└────────────────────────────────────────────────┘\n');
await import('./std/ops/fn_once_async.ts');

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║              Examples Complete                 ║');
console.log('╚════════════════════════════════════════════════╝');
