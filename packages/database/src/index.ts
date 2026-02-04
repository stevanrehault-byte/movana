// ═══════════════════════════════════════════════════════════════
// @movana/database - Main Exports
// ═══════════════════════════════════════════════════════════════

export { db, closeConnection } from './client';
export type { Database } from './client';

export * from './schema';

// Re-export drizzle utilities
export { eq, ne, gt, gte, lt, lte, like, ilike, and, or, not, inArray, notInArray, isNull, isNotNull, sql, desc, asc } from 'drizzle-orm';
