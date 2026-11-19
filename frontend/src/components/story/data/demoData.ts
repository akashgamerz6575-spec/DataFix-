export type SafetyDecision = 'auto_apply' | 'needs_approval' | 'refused';

export type StageAccent = 'cyan' | 'red' | 'amber' | 'tri' | 'emerald';

export interface DemoStageMeta {
  id: number;
  phase: string;
  title: string;
  shortLabel: string;
  summary: string;
  accent: StageAccent;
  accentHex: string;
}

export interface SampleOrderRow {
  rowId: string;
  orderId: string;
  customer: string;
  orderDate: string;
  amount: string;
  taxId: string | null;
  issues?: {
    orderId?: 'duplicate';
    customer?: 'inconsistent';
    orderDate?: 'invalid';
    amount?: 'inconsistent';
    taxId?: 'missing';
  };
}

export interface RepairProposal {
  id: string;
  column: string;
  operation: string;
  decision: SafetyDecision;
  decisionLabel: string;
  reason: string;
  affectedRows: string;
  issuesAddressed: number;
  ruleSnippet: string;
  policyNote: string;
}

export interface SimulationDiffRow {
  rowId: string;
  column: string;
  original: string;
  proposed: string;
  decision: SafetyDecision;
  note: string;
}

export interface IntegrityCheckItem {
  id: string;
  rule: string;
  scope: string;
  sampleOutcome: string;
  status: 'passed' | 'guarded';
}

export const DEMO_DATASET_META = {
  fileName: 'orders_demo_sample.csv',
  sampleRowsCount: 6,
  sampleColumnsCount: 5,
  totalSampleCells: 30, // 6 sample rows x 5 data columns (excluding row_id index)
  totalDetectedIssues: 6, // 1 missing + 1 duplicate + 2 invalid dates + 2 inconsistent formats
  sampleRowsLabel: '6 sample rows (illustrative slice)',
  sourceMode: 'READ-ONLY SOURCE SNAPSHOT',
  provenanceLabel: 'INTERACTIVE DEMONSTRATION — SAMPLE DATA',
  provenanceSubtext:
    'Deterministic client-side walkthrough using illustrative sample records. Not connected to live backend results.',
} as const;

/**
 * Transparent sample cleanliness calculation derived directly from the 30 sample cells
 * (6 rows x 5 data columns) and the 6 detected cell-level issues:
 *   - Baseline (6 issues):      (30 - 6) / 30 = 24 / 30 = 80%
 *   - Auto-apply only (2 left): (30 - 2) / 30 = 28 / 30 = 93%
 *   - Auto + Approved (1 left): (30 - 1) / 30 = 29 / 30 = 97%
 */
export function computeSampleProofMetrics(isDuplicateApproved: boolean) {
  const totalCells = DEMO_DATASET_META.totalSampleCells;
  const baselineIssues = DEMO_DATASET_META.totalDetectedIssues;
  const autoResolvedIssues = 4; // R-102 customer, R-102 order_date, R-102 amount, R-105 order_date
  const approvalResolvedIssues = isDuplicateApproved ? 1 : 0; // R-104 duplicate order_id
  const refusedIssues = 1; // R-103 customer_tax_id (preserved untouched)
  const pendingIssues = isDuplicateApproved ? 0 : 1;

  const resolvedIssues = autoResolvedIssues + approvalResolvedIssues;
  const remainingIssues = baselineIssues - resolvedIssues; // 2 if pending, 1 if approved
  const baselineCleanCells = totalCells - baselineIssues; // 24
  const afterCleanCells = totalCells - remainingIssues; // 28 or 29

  const baselineScorePct = Math.round((baselineCleanCells / totalCells) * 100); // 80%
  const afterScorePct = Math.round((afterCleanCells / totalCells) * 100); // 93% or 97%

  return {
    totalCells,
    baselineIssues,
    resolvedIssues,
    remainingIssues,
    pendingIssues,
    refusedIssues,
    appliedProposalsCount: isDuplicateApproved ? 2 : 1,
    pendingProposalsCount: isDuplicateApproved ? 0 : 1,
    baselineCleanCells,
    afterCleanCells,
    baselineScorePct,
    afterScorePct,
  };
}

export const DEMO_STAGES: DemoStageMeta[] = [
  {
    id: 1,
    phase: '01 · DETECT — INGEST',
    title: 'Dirty dataset enters safely',
    shortLabel: 'Ingest',
    summary:
      'orders_demo_sample.csv loads into a read-only intake sandbox. The original sample file stays untouched while DataFix profiles schema and column types.',
    accent: 'cyan',
    accentHex: '#00E5FF',
  },
  {
    id: 2,
    phase: '02 · DETECT — PROFILE',
    title: 'Anomalies surface with precision',
    shortLabel: 'Detect',
    summary:
      'Six distinct sample issues across all five data columns are isolated: 1 missing tax ID, 1 duplicate order ID, 2 malformed dates, and 2 inconsistent formats.',
    accent: 'red',
    accentHex: '#EF4444',
  },
  {
    id: 3,
    phase: '03 · DIAGNOSE',
    title: 'Contextual root-cause dossier',
    shortLabel: 'Diagnose',
    summary:
      'Instead of an opaque quality score, DataFix opens an evidence-backed diagnostic dossier listing every affected column and explaining why each issue occurred.',
    accent: 'cyan',
    accentHex: '#00E5FF',
  },
  {
    id: 4,
    phase: '04 · PROPOSE',
    title: 'Evidence-backed repair proposals',
    shortLabel: 'Propose',
    summary:
      'Three structured repair proposals account for all 6 detected sample issues, specifying exact target columns, transformation rules, and affected rows.',
    accent: 'amber',
    accentHex: '#F59E0B',
  },
  {
    id: 5,
    phase: '05 · SIMULATE',
    title: 'Before-and-after diff preview',
    shortLabel: 'Simulate',
    summary:
      'Inspect every proposed cell delta — customer whitespace trimming, date/currency normalization, the pending duplicate, and the locked refused tax ID. No changes are applied here.',
    accent: 'emerald',
    accentHex: '#10B981',
  },
  {
    id: 6,
    phase: '06 · GATE & APPLY',
    title: 'Three-way safety gate',
    shortLabel: 'Gate & Apply',
    summary:
      'Deterministic normalization auto-applies (Emerald, 4 issues), duplicate consolidation pauses for human approval (Amber, 1 issue), and identifier fabrication is refused (Violet, 1 issue).',
    accent: 'tri',
    accentHex: '#6366F1',
  },
  {
    id: 7,
    phase: '07 · VERIFY — INVARIANTS',
    title: 'Integrity & invariant checks',
    shortLabel: 'Verify',
    summary:
      'Before finalising the sample working copy, DataFix runs sequential schema, row-count, primary-key uniqueness, and anti-fabrication invariant checks.',
    accent: 'emerald',
    accentHex: '#10B981',
  },
  {
    id: 8,
    phase: '08 · VERIFY — PROOF',
    title: 'Transparent verification proof',
    shortLabel: 'Proof',
    summary:
      'Review transparent source-cell quality derived directly from the 30 sample cells, exact before-and-after issue counts, applied repairs, and explicitly refused records.',
    accent: 'emerald',
    accentHex: '#12E29D',
  },
];

export const SAMPLE_ROWS: SampleOrderRow[] = [
  {
    rowId: 'R-101',
    orderId: 'ORD-8841',
    customer: 'Northwind Logistics',
    orderDate: '2026-09-14',
    amount: '$1,420.00',
    taxId: 'TAX-99120',
  },
  {
    rowId: 'R-102',
    orderId: 'ORD-8842',
    customer: '  Meridian Supply Co ',
    orderDate: '14/09/2026',
    amount: 'USD 890.5',
    taxId: 'TAX-44102',
    issues: {
      customer: 'inconsistent',
      orderDate: 'invalid',
      amount: 'inconsistent',
    },
  },
  {
    rowId: 'R-103',
    orderId: 'ORD-8843',
    customer: 'Apex Freight Ltd',
    orderDate: '2026-09-15',
    amount: '$2,150.00',
    taxId: null,
    issues: {
      taxId: 'missing',
    },
  },
  {
    rowId: 'R-104',
    orderId: 'ORD-8842',
    customer: 'Meridian Supply',
    orderDate: '2026-09-14',
    amount: '$890.50',
    taxId: 'TAX-44102',
    issues: {
      orderId: 'duplicate',
    },
  },
  {
    rowId: 'R-105',
    orderId: 'ORD-8844',
    customer: 'Kestrel Retail',
    orderDate: '09-16-2026',
    amount: '$640.00',
    taxId: 'TAX-77819',
    issues: {
      orderDate: 'invalid',
    },
  },
  {
    rowId: 'R-106',
    orderId: 'ORD-8845',
    customer: 'Helios Industrial',
    orderDate: '2026-09-16',
    amount: '$3,110.00',
    taxId: 'TAX-55014',
  },
];

export const DIAGNOSTIC_DOSSIER = {
  title: '6 Sample Issues Isolated Across All 5 Data Columns',
  affectedColumns: ['order_id', 'customer', 'order_date', 'amount', 'customer_tax_id'],
  primaryAnomaly:
    'Mixed non-ISO dates, un-trimmed customer text, inconsistent currency prefix, duplicate order_id key, and null tax identifier',
  rootCause:
    'Regional CSV exports combined DD/MM/YYYY and MM-DD-YYYY date strings, un-trimmed customer padding and raw "USD" amounts on R-102, an un-deduplicated retry row (ORD-8842 on R-104), and a blank upstream tax_id on R-103.',
  evidence: [
    'order_date (2 issues): R-102 ("14/09/2026") and R-105 ("09-16-2026") violate ISO-8601 (YYYY-MM-DD).',
    'customer & amount (2 issues): R-102 contains leading/trailing whitespace in customer and non-standard currency string "USD 890.5".',
    'order_id (1 issue): "ORD-8842" repeats on R-104 with slightly different customer naming ("Meridian Supply" vs "Meridian Supply Co").',
    'customer_tax_id (1 issue): R-103 is NULL with no authoritative lookup key in the sample dataset.',
  ],
} as const;

export const REPAIR_PROPOSALS: RepairProposal[] = [
  {
    id: 'prop-normalize-format',
    column: 'customer, order_date, amount',
    operation: 'Trim customer whitespace & standardize ISO-8601 dates + USD currency',
    decision: 'auto_apply',
    decisionLabel: 'Auto-apply',
    reason: 'Lossless, deterministic formatting normalization resolving 4 sample cell issues.',
    affectedRows: '2 sample rows (R-102, R-105) · 4 issues',
    issuesAddressed: 4,
    ruleSnippet: 'trim(customer) && normalize_iso8601(order_date) && format_usd(amount)',
    policyNote: 'Safe deterministic transform — automatically staged for working copy.',
  },
  {
    id: 'prop-merge-dup',
    column: 'order_id',
    operation: 'Consolidate duplicate order ORD-8842 (merge R-104 into R-102)',
    decision: 'needs_approval',
    decisionLabel: 'Needs approval',
    reason: 'Duplicate primary key detected (1 issue), but customer naming varies across rows.',
    affectedRows: '2 sample rows (R-102, R-104) · 1 issue',
    issuesAddressed: 1,
    ruleSnippet: 'deduplicate_by(order_id="ORD-8842", keep="canonical_normalized")',
    policyNote: 'Row consolidation is destructive — requires explicit human sign-off.',
  },
  {
    id: 'prop-refuse-tax',
    column: 'customer_tax_id',
    operation: 'Impute missing tax identifier on R-103',
    decision: 'refused',
    decisionLabel: 'Refused',
    reason: 'No authoritative source exists in dataset; inventing a tax ID violates anti-fabrication policy.',
    affectedRows: '1 sample row (R-103) · 1 issue preserved',
    issuesAddressed: 1,
    ruleSnippet: 'POLICY_BLOCK: refuse_synthetic_identifier(column="customer_tax_id")',
    policyNote: 'Explicitly refused — original NULL value preserved safely without mutation.',
  },
];

export const SIMULATION_DIFFS: SimulationDiffRow[] = [
  {
    rowId: 'R-102',
    column: 'customer',
    original: '"  Meridian Supply Co "',
    proposed: 'Meridian Supply Co',
    decision: 'auto_apply',
    note: 'Whitespace trimmed (Auto-apply)',
  },
  {
    rowId: 'R-102',
    column: 'order_date',
    original: '14/09/2026',
    proposed: '2026-09-14',
    decision: 'auto_apply',
    note: 'ISO-8601 standardized (Auto-apply)',
  },
  {
    rowId: 'R-102',
    column: 'amount',
    original: 'USD 890.5',
    proposed: '$890.50',
    decision: 'auto_apply',
    note: 'Currency normalized (Auto-apply)',
  },
  {
    rowId: 'R-105',
    column: 'order_date',
    original: '09-16-2026',
    proposed: '2026-09-16',
    decision: 'auto_apply',
    note: 'ISO-8601 standardized (Auto-apply)',
  },
  {
    rowId: 'R-104',
    column: 'order_id',
    original: 'ORD-8842 (duplicate)',
    proposed: 'Merged into R-102',
    decision: 'needs_approval',
    note: 'Requires human approval in Stage 6',
  },
  {
    rowId: 'R-103',
    column: 'customer_tax_id',
    original: 'NULL',
    proposed: 'UNCHANGED — REFUSED',
    decision: 'refused',
    note: 'Locked by safety gate (zero fabrication)',
  },
];

export const INTEGRITY_CHECKS: IntegrityCheckItem[] = [
  {
    id: 'chk-schema',
    rule: 'Schema & format conformance',
    scope: 'customer, order_date, amount',
    sampleOutcome: 'Passed (sample demo): Whitespace, ISO-8601 & USD formats valid',
    status: 'passed',
  },
  {
    id: 'chk-rowcount',
    rule: 'Row-count invariant',
    scope: 'Working copy vs. staged plan',
    sampleOutcome: 'Passed (sample demo): Row delta matches approved consolidation policy',
    status: 'passed',
  },
  {
    id: 'chk-pk',
    rule: 'Primary-key uniqueness',
    scope: 'order_id',
    sampleOutcome: 'Passed when duplicate merge is approved (sample demo)',
    status: 'passed',
  },
  {
    id: 'chk-nofab',
    rule: 'No fabricated identifiers',
    scope: 'customer_tax_id (R-103)',
    sampleOutcome: 'Guarded (sample demo): Refused mutation preserved original NULL',
    status: 'guarded',
  },
];
