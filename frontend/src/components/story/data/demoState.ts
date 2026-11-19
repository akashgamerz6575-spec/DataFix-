/**
 * demoState.ts — Pure deterministic derivation functions for the DataFix guided demo.
 *
 * All four exported functions are PURE: given the same isDuplicateApproved value,
 * they always return the same result. They never mutate SAMPLE_ROWS or any
 * exported constant. Working copies are always cloned fresh from SAMPLE_ROWS.
 *
 * Data invariants (enforced in DEV assertions below):
 *   - SAMPLE_ROWS always has 6 rows (source is READ-ONLY)
 *   - Working copy without approval: 6 rows
 *   - Working copy with approval:    5 rows (R-104 consolidated into R-102)
 *   - Proof baseline score:          80%  (24/30 clean cells)
 *   - Proof score after auto only:   93%  (28/30 clean cells)
 *   - Proof score after approved:    97%  (29/30 clean cells)
 *   - R-103 customer_tax_id:         always null — never fabricated
 */

import { SAMPLE_ROWS, type SampleOrderRow } from './demoData';

// ---------------------------------------------------------------------------
// Operation types
// ---------------------------------------------------------------------------

export type OperationResult =
  | 'applied'       // safe, deterministically applied
  | 'approved'      // human-approved, now applied
  | 'pending'       // waiting for human approval
  | 'refused';      // refused by policy, original preserved

export interface OperationState {
  id: string;        // e.g. 'I-01'
  issueId: string;   // matches SAMPLE_ISSUES key
  affectedRow: string;
  column: string;
  original: string;
  resolved: string | null; // null for refused
  result: OperationResult;
  lane: 'emerald' | 'amber' | 'violet';
  label: string;
}

// ---------------------------------------------------------------------------
// Working copy types
// ---------------------------------------------------------------------------

export interface WorkingCopyResult {
  rows: SampleOrderRow[];
  rowCount: number;
  duplicateApproved: boolean;
  appliedSafeIssueIds: string[];   // I-01 through I-04
  approvedIssueIds: string[];      // I-05 if approved
  pendingIssueIds: string[];       // I-05 if not yet approved
  refusedIssueIds: string[];       // I-06 always
}

// ---------------------------------------------------------------------------
// Verification check types
// ---------------------------------------------------------------------------

export type CheckResult = 'passed' | 'pending' | 'guarded';

export interface DerivedCheck {
  id: string;
  label: string;
  scope: string;
  result: CheckResult;
  outcomeText: string;
}

// ---------------------------------------------------------------------------
// Proof types
// ---------------------------------------------------------------------------

export interface DerivedProof {
  baselineCells: 30;
  baselineScore: 80;
  currentScore: 93 | 97;
  cleanCells: 28 | 29;
  totalCells: 30;
  resolvedIssues: 4 | 5;
  remainingIssues: 2 | 1;
  pendingIssues: 1 | 0;
  refusedIssues: 1;
  workingCopyRowCount: 5 | 6;
  baselineCleanCells: 24;
  baselineIssues: 6;
  autoResolvedIssues: 4;
}

// ---------------------------------------------------------------------------
// Issue catalogue (stable IDs for cross-referencing)
// ---------------------------------------------------------------------------

export const SAMPLE_ISSUES = {
  'I-01': { rowId: 'R-102', column: 'customer',         category: 'inconsistent' },
  'I-02': { rowId: 'R-102', column: 'order_date',       category: 'invalid'      },
  'I-03': { rowId: 'R-102', column: 'amount',           category: 'inconsistent' },
  'I-04': { rowId: 'R-105', column: 'order_date',       category: 'invalid'      },
  'I-05': { rowId: 'R-104', column: 'order_id',         category: 'duplicate'    },
  'I-06': { rowId: 'R-103', column: 'customer_tax_id',  category: 'missing'      },
} as const;

// ---------------------------------------------------------------------------
// deriveOperations
// ---------------------------------------------------------------------------

/**
 * Returns the full list of 6 operations and their current gate status.
 * The amber lane (I-05) flips from pending → approved based on the flag.
 * The violet lane (I-06) is always refused — original NULL is preserved.
 */
export function deriveOperations(isDuplicateApproved: boolean): OperationState[] {
  return [
    {
      id: 'op-01',
      issueId: 'I-01',
      affectedRow: 'R-102',
      column: 'customer',
      original: '"  Meridian Supply Co "',
      resolved: 'Meridian Supply Co',
      result: 'applied',
      lane: 'emerald',
      label: 'Whitespace trimmed — ISO customer name',
    },
    {
      id: 'op-02',
      issueId: 'I-02',
      affectedRow: 'R-102',
      column: 'order_date',
      original: '14/09/2026',
      resolved: '2026-09-14',
      result: 'applied',
      lane: 'emerald',
      label: 'Date standardized to ISO-8601',
    },
    {
      id: 'op-03',
      issueId: 'I-03',
      affectedRow: 'R-102',
      column: 'amount',
      original: 'USD 890.5',
      resolved: '$890.50',
      result: 'applied',
      lane: 'emerald',
      label: 'Currency normalized to USD format',
    },
    {
      id: 'op-04',
      issueId: 'I-04',
      affectedRow: 'R-105',
      column: 'order_date',
      original: '09-16-2026',
      resolved: '2026-09-16',
      result: 'applied',
      lane: 'emerald',
      label: 'Date standardized to ISO-8601',
    },
    {
      id: 'op-05',
      issueId: 'I-05',
      affectedRow: 'R-104',
      column: 'order_id',
      original: 'ORD-8842 (duplicate)',
      resolved: isDuplicateApproved ? 'Merged into R-102 (removed)' : null,
      result: isDuplicateApproved ? 'approved' : 'pending',
      lane: 'amber',
      label: isDuplicateApproved
        ? 'Duplicate consolidated — R-104 removed'
        : 'Awaiting human approval to consolidate duplicate',
    },
    {
      id: 'op-06',
      issueId: 'I-06',
      affectedRow: 'R-103',
      column: 'customer_tax_id',
      original: 'NULL',
      resolved: null, // NEVER fabricated
      result: 'refused',
      lane: 'violet',
      label: 'Refused — no authoritative source · NULL preserved',
    },
  ];
}

// ---------------------------------------------------------------------------
// deriveWorkingCopy
// ---------------------------------------------------------------------------

/**
 * Clones SAMPLE_ROWS fresh, applies the 4 deterministic safe transforms,
 * and optionally removes R-104 when the duplicate is approved.
 *
 * CRITICAL rules:
 *  - Clone first — NEVER mutate SAMPLE_ROWS or any element of it.
 *  - R-103 taxId remains null always.
 *  - R-104 is removed only when isDuplicateApproved === true.
 */
export function deriveWorkingCopy(isDuplicateApproved: boolean): WorkingCopyResult {
  // Deep-clone source rows — spread of primitive fields is sufficient here
  // because SampleOrderRow has no nested object references beyond `issues`
  const cloned: SampleOrderRow[] = SAMPLE_ROWS.map((r) => ({ ...r, issues: { ...r.issues } }));

  // Apply 4 safe deterministic transforms
  const r102 = cloned.find((r) => r.rowId === 'R-102');
  if (r102) {
    r102.customer  = 'Meridian Supply Co';   // I-01: trim whitespace
    r102.orderDate = '2026-09-14';            // I-02: ISO-8601
    r102.amount    = '$890.50';               // I-03: USD format
    r102.issues    = {};                       // issues resolved
  }

  const r105 = cloned.find((r) => r.rowId === 'R-105');
  if (r105) {
    r105.orderDate = '2026-09-16';            // I-04: ISO-8601
    r105.issues    = {};                       // issue resolved
  }

  // R-103: taxId MUST remain null — never fabricate
  // (no mutation needed; it was already null in SAMPLE_ROWS)

  // Conditionally remove R-104 (duplicate consolidation)
  const rows = isDuplicateApproved
    ? cloned.filter((r) => r.rowId !== 'R-104')
    : cloned;

  return {
    rows,
    rowCount: rows.length,
    duplicateApproved: isDuplicateApproved,
    appliedSafeIssueIds: ['I-01', 'I-02', 'I-03', 'I-04'],
    approvedIssueIds: isDuplicateApproved ? ['I-05'] : [],
    pendingIssueIds: isDuplicateApproved ? [] : ['I-05'],
    refusedIssueIds: ['I-06'],
  };
}

// ---------------------------------------------------------------------------
// deriveChecks
// ---------------------------------------------------------------------------

/**
 * Returns the 4 dynamic verification checks whose status depends on approval state.
 *
 * Check 2 (row-count invariant):
 *   - Before approval: row count is 6 (unchanged — duplicate still pending)
 *   - After approval:  row count is 5 (R-104 removed) — invariant confirmed
 *
 * Check 3 (primary-key uniqueness):
 *   - Before approval: 'pending' — duplicate ORD-8842 still present
 *   - After approval:  'passed'  — only unique order_ids remain
 */
export function deriveChecks(isDuplicateApproved: boolean): DerivedCheck[] {
  const { rowCount } = deriveWorkingCopy(isDuplicateApproved);

  return [
    {
      id: 'chk-schema',
      label: 'Schema & format conformance',
      scope: 'customer, order_date, amount',
      result: 'passed',
      outcomeText:
        'All 4 auto-applied safe transforms produce valid ISO-8601 dates, trimmed customer strings, and standard USD currency. Schema rules satisfied.',
    },
    {
      id: 'chk-rowcount',
      label: 'Row-count invariant',
      scope: 'Working copy vs. approved plan',
      result: 'passed',
      outcomeText: isDuplicateApproved
        ? `Row delta confirmed: 6 source rows → ${rowCount} working-copy rows. Reduction of 1 matches the approved duplicate consolidation plan.`
        : `Row count held at ${rowCount}. No structural changes without approval — invariant satisfied for current state.`,
    },
    {
      id: 'chk-pk',
      label: 'Primary-key uniqueness',
      scope: 'order_id',
      result: isDuplicateApproved ? 'passed' : 'pending',
      outcomeText: isDuplicateApproved
        ? 'All 5 working-copy rows have distinct order_id values. ORD-8842 duplicate resolved by approved consolidation.'
        : 'ORD-8842 appears on both R-102 and R-104. Duplicate consolidation pending human approval before this check can pass.',
    },
    {
      id: 'chk-nofab',
      label: 'No fabricated identifiers',
      scope: 'customer_tax_id (R-103)',
      result: 'guarded',
      outcomeText:
        'Anti-fabrication policy enforced: R-103 customer_tax_id NULL was explicitly refused. No synthetic identifier was generated. Original NULL preserved.',
    },
  ];
}

// ---------------------------------------------------------------------------
// deriveProof
// ---------------------------------------------------------------------------

/**
 * Returns the full proof metrics derived deterministically from the 30-cell source.
 *
 * Fixed baseline:   30 cells (6 rows × 5 data columns, rowId excluded)
 * Baseline score:   80% → 24 of 30 cells clean (6 issues detected)
 * After 4 auto:     93% → 28 of 30 cells clean (2 issues remain: 1 pending + 1 refused)
 * After approval:   97% → 29 of 30 cells clean (1 issue remains: refused)
 */
export function deriveProof(isDuplicateApproved: boolean): DerivedProof {
  const totalCells = 30 as const;
  const baselineCells = 30 as const;
  const baselineScore = 80 as const;
  const baselineCleanCells = 24 as const;
  const baselineIssues = 6 as const;
  const autoResolvedIssues = 4 as const;
  const refusedIssues = 1 as const;

  if (isDuplicateApproved) {
    return {
      baselineCells,
      baselineScore,
      currentScore: 97,
      cleanCells: 29,
      totalCells,
      resolvedIssues: 5,
      remainingIssues: 1,
      pendingIssues: 0,
      refusedIssues,
      workingCopyRowCount: 5,
      baselineCleanCells,
      baselineIssues,
      autoResolvedIssues,
    };
  }

  return {
    baselineCells,
    baselineScore,
    currentScore: 93,
    cleanCells: 28,
    totalCells,
    resolvedIssues: 4,
    remainingIssues: 2,
    pendingIssues: 1,
    refusedIssues,
    workingCopyRowCount: 6,
    baselineCleanCells,
    baselineIssues,
    autoResolvedIssues,
  };
}

// ---------------------------------------------------------------------------
// DEV-only self-verification assertions
// ---------------------------------------------------------------------------

// Use a type-safe way to check dev mode without requiring vite/client types
const __IS_DEV__ = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (import.meta as any).env?.DEV === true;
  } catch {
    return false;
  }
})();

if (__IS_DEV__) {
  // Source immutability — SAMPLE_ROWS must never be mutated
  if (SAMPLE_ROWS.length !== 6) {
    console.error('[demoState] ASSERTION FAILED: SAMPLE_ROWS.length must be 6, got', SAMPLE_ROWS.length);
  }

  // Working copy row counts
  const wcBefore = deriveWorkingCopy(false);
  const wcAfter  = deriveWorkingCopy(true);
  if (wcBefore.rowCount !== 6) {
    console.error('[demoState] ASSERTION FAILED: working copy (unapproved) must have 6 rows, got', wcBefore.rowCount);
  }
  if (wcAfter.rowCount !== 5) {
    console.error('[demoState] ASSERTION FAILED: working copy (approved) must have 5 rows, got', wcAfter.rowCount);
  }

  // Source immutability after derivation
  if (SAMPLE_ROWS.length !== 6) {
    console.error('[demoState] ASSERTION FAILED: SAMPLE_ROWS mutated during working-copy derivation!');
  }
  const r104InSource = SAMPLE_ROWS.find((r) => r.rowId === 'R-104');
  if (!r104InSource) {
    console.error('[demoState] ASSERTION FAILED: R-104 missing from SAMPLE_ROWS after approved working copy derivation!');
  }
  const r103InSource = SAMPLE_ROWS.find((r) => r.rowId === 'R-103');
  if (r103InSource?.taxId !== null) {
    console.error('[demoState] ASSERTION FAILED: R-103 taxId was mutated (expected null, got', r103InSource?.taxId, ')');
  }

  // Proof scores
  const proofBefore = deriveProof(false);
  const proofAfter  = deriveProof(true);
  if (proofBefore.currentScore !== 93) {
    console.error('[demoState] ASSERTION FAILED: proof score (unapproved) must be 93%, got', proofBefore.currentScore);
  }
  if (proofAfter.currentScore !== 97) {
    console.error('[demoState] ASSERTION FAILED: proof score (approved) must be 97%, got', proofAfter.currentScore);
  }
}
