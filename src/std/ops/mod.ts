/**
 * @fileoverview
 * Operators and control flow types inspired by Rust's std::ops module.
 *
 * This module provides:
 * - `ControlFlow` - For signaling whether to break or continue in operations
 * - `isControlFlow` - Type guard for checking ControlFlow instances
 */
export * from './control_flow.ts';
export * from './guards.ts';
