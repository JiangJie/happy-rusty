/**
 * @fileoverview
 * Synchronization primitives inspired by Rust's std::sync module.
 *
 * This module provides:
 * - `Once` - A primitive for one-time initialization
 * - `Lazy` / `LazyAsync` - Values initialized on first access
 */
export * from './lazy.ts';
export * from './once.ts';
