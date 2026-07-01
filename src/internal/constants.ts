/**
 * @module
 * Internal cached Promise constants for async method optimization.
 *
 * Shared by `core/prelude.ts` and `std/sync/channel.ts` to avoid duplicate allocations.
 * Not re-exported from `src/mod.ts`; consumers cannot import these.
 */

/** Cached `Promise<true>` for reuse by async predicate short-circuit branches. */
export const ASYNC_TRUE: Promise<true> = /*#__PURE__*/ Promise.resolve(true);

/** Cached `Promise<false>` for reuse by async predicate short-circuit branches. */
export const ASYNC_FALSE: Promise<false> = /*#__PURE__*/ Promise.resolve(false);
