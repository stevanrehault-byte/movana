// ═══════════════════════════════════════════════════════════════
// MOVANA DATABASE SCHEMA - Exports
// ═══════════════════════════════════════════════════════════════

export * from './tables';

// Re-export types for convenience
export type { 
  InferSelectModel, 
  InferInsertModel 
} from 'drizzle-orm';
