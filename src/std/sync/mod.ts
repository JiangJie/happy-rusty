/**
 * @module
 * Synchronization primitives inspired by Rust's std::sync module.
 *
 * This module provides:
 * - `Once` - A primitive for one-time initialization
 * - `Lazy` / `LazyAsync` - Values initialized on first access
 * - `Mutex` - Async mutual exclusion for serializing async operations
 */
export * from './lazy.ts';
export * from './mutex.ts';
export * from './once.ts';
