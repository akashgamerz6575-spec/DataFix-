/**
 * DataFix Contract Types
 *
 * Organised in three clear tiers:
 * Tier 1: Real Generated Backend Models (from /openapi.json via openapi-typescript)
 * Tier 2: Real Milestone 1 Profiling Models (active in FastAPI backend)
 * Tier 3: Proposed Future Contract Models (GAPs 1-10 for Teammate 3 integration)
 */

// ============================================================================
// TIER 1: GENERATED BACKEND MODELS
// ============================================================================
export type { paths, components, operations } from './generated-types';

// ============================================================================
// TIER 2: ACTUAL IMPLEMENTED BACKEND MODELS (Milestone 1)
// Active in POST /api/v1/datasets/profile and GET /health
// ============================================================================

export interface ColumnProfile {
  name: string;
  data_type: string;
  missing_count: number;
  missing_percent: number;
  distinct_count: number;
  is_key_candidate?: boolean;
}

export interface DatasetProfile {
  filename: string;
  row_count: number;
  column_count: number;
  total_cells: number;
  missing_cells: number;
  duplicate_rows: number;
  columns: ColumnProfile[];
  notes: string[];
}

export interface ApiHealthResponse {
  status: string;
  service: string;
  environment: string;
}

// ============================================================================
// TIER 3: PROPOSED FUTURE CONTRACT MODELS (Milestone 2 / GAPs 1-10)
// Documented in docs/FRONTEND_BACKEND_CONTRACT.md for Teammate 3
// ============================================================================

export type GateDecisionType = "auto_apply" | "needs_approval" | "refused";

export type RefusalKind = "invariant_failed" | "insufficient_evidence" | "kept_as_valid";

/** GAP-1: Structured Confidence */
export interface ConfidenceEstimate {
  value: number | null; // null when evidence is insufficient
  method: "rule_support" | "backtest" | "similarity" | "losslessness";
  components: Array<{
    label: string;
    value: number;
    note?: string;
  }>;
  n_support: number;
  lower_bound: number | null;
  caveat: string | null;
}

/** GAP-4: Invariant Status and Thresholds */
export interface InvariantResult {
  name: string;
  label: string;
  status: "pass" | "fail" | "skipped";
  detail: string;
  observed?: number | string;
  threshold?: number | string;
  unit?: string;
}

/** GAP-3: Cell Diffs */
export interface CellDiff {
  row_id: string | number;
  column: string;
  before: string | number | null;
  after: string | number | null;
  was_valid?: boolean;
}

export interface SimulationReport {
  cells_changed: number;
  rows_affected: number;
  rows_removed: number;
  previously_valid_cells_changed: number;
  aggregate_drift: Record<string, number>;
  new_issues_introduced: number;
  invariants: InvariantResult[];
  sample_diff: CellDiff[];
}

/** Proposed Repair Proposal Model */
export interface RepairProposal {
  id: string;
  op: string;
  column: string;
  risk_class: "format_only" | "value_substitution" | "row_removal" | "structural";
  source: "rule" | "stat" | "llm_assisted";
  issue_ids: string[];
  title: string;
  explanation: string;
  decision: GateDecisionType;
  reasons: string[];
  refusal_kind?: RefusalKind;
  evidence_gap?: {
    summary: string;
    observed?: number | string;
    required?: number | string;
    competing?: Array<{ label: string; count: number }>;
  };
  confidence: ConfidenceEstimate;
  evidence: Array<{
    kind: string;
    label: string;
    detail: string;
  }>;
  simulation?: SimulationReport;
  user_action?: "pending" | "approved" | "rejected";
  applied?: boolean;
}

export interface DetectedIssue {
  id: string;
  category: "missing" | "duplicate" | "format" | "inconsistent" | "anomaly";
  column: string;
  likely_cause: string;
  affected_cells: number;
  linked_proposal_id?: string;
}

// ============================================================================
// TIER 4: FRONTEND APPLICATION RUN STATE
// ============================================================================

export interface RunState {
  run_id: string;
  filename: string;
  input_hash?: string;
  created_at: string;
  profile: DatasetProfile;
  issues: DetectedIssue[];
  proposals: RepairProposal[];
  is_applied: boolean;
  is_verified: boolean;
}
