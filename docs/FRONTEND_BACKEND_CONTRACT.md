# DataFix — Frontend / Backend Contract Specification

**Author:** Akash (Frontend Owner) & Antigravity (Implementation Engineer)  
**Target Audience:** Teammate 3 (Backend & Data Engine Owner)  
**Date:** 19 Nov 2026  
**Reference Document:** `docs/FRONTEND_DESIGN_SPEC.md`  
**Purpose:** Formalise request/response shapes for unimplemented endpoints and resolve contract gaps GAP-1 through GAP-10.

---

## 1. Summary of Required Endpoints

| Endpoint | Method | Status | Required For |
| :--- | :--- | :--- | :--- |
| `/api/v1/datasets/profile` | `POST` | **IMPLEMENTED** | Initial CSV profiling (20 MB limit) |
| `/health` | `GET` | **IMPLEMENTED** | Service health & environment check |
| `/api/v1/runs` | `POST` | **PROPOSED** | Create a persistent run from uploaded CSV/XLSX |
| `/api/v1/runs/{id}/analyze` | `POST` | **PROPOSED** | Run detection, hypothesis generation, and repair simulation |
| `/api/v1/runs/{id}/decisions` | `POST` | **PROPOSED** | Record user approval / rejection on proposals |
| `/api/v1/runs/{id}/apply` | `POST` | **PROPOSED** | Atomically apply approved and auto-apply repairs |
| `/api/v1/runs/{id}/verify` | `POST` | **PROPOSED** | Closed-loop verification replay against untouched original |
| `/api/v1/runs/{id}/operations` | `GET` | **PROPOSED** | Retrieve ordered history of applied operations |
| `/api/v1/runs/{id}/undo/{op_id}` | `POST` | **PROPOSED** | Remove an operation from the log and replay state |
| `/api/v1/runs/{id}/export` | `GET` | **PROPOSED** | Download zip bundle with cleaned CSV, report, log, recipe |
| `/api/v1/policy` | `GET` | **PROPOSED** | Inspect active gate rules, invariants, and thresholds |

---

## 2. Detailed Gap Specifications (GAP-1 to GAP-10)

### GAP-1: Confidence Structure
**Problem:** Proposals currently have no confidence or evidence metric. A raw floating number (e.g. `0.95`) without methodology is unconvincing to evaluators.  
**Proposed Schema:**
```typescript
export interface ConfidenceEstimate {
  value: number | null; // null when evidence is insufficient
  method: "rule_support" | "backtest" | "similarity" | "losslessness";
  components: Array<{
    label: string;
    value: number;
    note?: string;
  }>;
  n_support: number;
  lower_bound: number | null; // Conservative statistical bound
  caveat: string | null;
}
```
**Fallback if not delivered:** Frontend displays the evidence list only and marks confidence as `"Not provided by backend"`.

---

### GAP-2: Refusal Classification
**Problem:** The UI must distinguish between:
1. *Unsafe change prevented* (an integrity invariant failed)
2. *Insufficient evidence* (system cannot choose between ambiguous values, e.g. day/month date lean)
3. *Kept as valid* (an apparent outlier that satisfies all business rules)
**Proposed Schema:**
```typescript
export interface GateDecision {
  decision: "auto_apply" | "needs_approval" | "refused";
  reasons: string[];
  refusal_kind?: "invariant_failed" | "insufficient_evidence" | "kept_as_valid";
  evidence_gap?: {
    summary: string;
    observed?: number | string;
    required?: number | string;
    competing?: Array<{ label: string; count: number }>;
  };
}
```
**Fallback:** If `refusal_kind` is absent, any proposal with a failing invariant is styled as `invariant_failed`; otherwise as generic `insufficient_evidence`. `kept_as_valid` is omitted.

---

### GAP-3: Full Diff and Merge Groups
**Problem:** The backend only returns `sample_diff` (first N rows). Merge and deduplication operations need kept vs removed row visibility.  
**Proposed Endpoint:** `GET /api/v1/runs/{id}/proposals/{proposal_id}/diff?offset=0&limit=50`  
**Proposed Schema:**
```typescript
export interface DiffItem {
  row_id: string | number;
  column: string;
  before: string | number | null;
  after: string | number | null;
  was_valid: boolean;
}

export interface ProposalDiffResponse {
  total: number;
  items: DiffItem[];
  removed_rows?: Array<{ row_id: string | number; values: Record<string, unknown> }>;
  groups?: Array<{ keep_row_id: string | number; remove_row_ids: Array<string | number> }>;
}
```
**Fallback:** Render `sample_diff` only, with an explicit label: `"Showing N of M changes"`.

---

### GAP-4: Invariant Status and Thresholds
**Problem:** A simple boolean `passed: boolean` cannot represent skipped checks (e.g. cross-table referential integrity when only one table is uploaded).  
**Proposed Schema:**
```typescript
export interface InvariantResult {
  name: string;
  label: string;
  status: "pass" | "fail" | "skipped";
  detail: string;
  observed?: number | string;
  threshold?: number | string;
  unit?: string;
}
```
**Fallback:** If `status` is absent, treat `passed: true` as pass and `passed: false` as fail. Omit threshold comparison indicators.

---

### GAP-5: Verification Response Shape
**Problem:** Verification requires proof that replaying the modification log on the untouched original produces the exported file, and that zero valid cells were damaged.  
**Proposed Endpoint:** `POST /api/v1/runs/{id}/verify`  
**Proposed Schema:**
```typescript
export interface VerificationReport {
  replay: {
    operations_count: number;
    input_hash: string;
    replay_hash: string;
    match: boolean;
  };
  issues: {
    before: number;
    after: number;
    resolved: number;
    introduced: number;
    by_category: Array<{
      category: string;
      before: number;
      after: number;
    }>;
  };
  valid_cells_damaged: number;
  quality_score: {
    before: number;
    after: number;
    method: string;
  };
  remaining: Array<{
    issue_id: string;
    column: string;
    reason: string;
    status: "refused" | "pending";
  }>;
  benchmark?: {
    dataset_name: string;
    precision: number;
    recall: number;
    abstentions: number;
    generated_at: string;
  };
}
```
**Fallback:** Render only available fields; hide missing sections without generating placeholder values.

---

### GAP-6: Operation History Read Endpoint
**Problem:** History page requires ordered operations with timestamp, sequencer, affected cells, and decision origin (`auto` vs `user`).  
**Proposed Endpoint:** `GET /api/v1/runs/{id}/operations`  
**Proposed Schema:**
```typescript
export interface OperationRecord {
  seq: number;
  op_id: string;
  proposal_id: string;
  op: string;
  column: string;
  cells_changed: number;
  decided_by: "auto" | "user";
  applied_at: string;
  confidence_at_decision?: number | null;
}
```
**Fallback:** Accumulate operations returned by the `apply` response within the browser session.

---

### GAP-7: Policy and Limits
**Problem:** Thresholds (e.g. max aggregate drift percentage, max allowable missingness) should come from backend configuration.  
**Proposed Endpoint:** `GET /api/v1/policy`  
**Proposed Schema:**
```typescript
export interface PolicyResponse {
  engine_version: string;
  upload_limits: {
    max_bytes: number;
    max_rows: number;
    allowed_types: string[];
  };
  invariants: string[];
  thresholds: Record<string, number>;
}
```
**Fallback:** Hardcode frontend constants matching `backend/.env.example` (`MAX_UPLOAD_BYTES=20000000`) and `README.md`.

---

### GAP-8: Dataset Profiling Information in Run Payload
**Problem:** When viewing an active run (`/runs/:id`), the UI needs dataset row count, column count, and column profile summary without requiring a re-upload.  
**Proposed Schema:** Include `profile` in `GET /api/v1/runs/{id}` response or `POST /api/v1/runs/{id}/analyze` response:
```typescript
export interface RunOverview {
  run_id: string;
  filename: string;
  input_hash: string;
  row_count: number;
  column_count: number;
  created_at: string;
  columns: Array<{
    name: string;
    data_type: string;
    missing_count: number;
    missing_percent: number;
    distinct_count: number;
    is_key_candidate?: boolean;
  }>;
}
```

---

### GAP-9: Evidence Structure
**Problem:** Evidence needs a standard structure so the UI can format metrics and examples cleanly.  
**Proposed Schema:**
```typescript
export interface EvidenceItem {
  kind: "pattern_match" | "frequency" | "functional_dependency" | "rule";
  label: string;
  detail: string;
  metrics?: Record<string, number>;
  examples?: string[];
}
```

---

### GAP-10: Decision, Apply, and Undo Semantics
**Specification:**
1. **Decisions Batching:** `POST /api/v1/runs/{id}/decisions`
   ```json
   {
     "decisions": [
       { "proposal_id": "prop_01", "action": "approve" },
       { "proposal_id": "prop_02", "action": "reject" }
     ]
   }
   ```
   *Rule:* Decisions are idempotent and can be toggled until `apply` is called.
2. **Apply Execution:** `POST /api/v1/runs/{id}/apply`
   - Returns applied operations:
   ```json
   {
     "status": "applied",
     "applied_operations": [ ... ],
     "skipped_proposals": [ ... ]
   }
   ```
3. **Undo Conflict Semantics:** `POST /api/v1/runs/{id}/undo/{op_id}`
   - If a subsequent operation depends on the undone operation, return HTTP 409 Conflict:
   ```json
   {
     "detail": "Conflict: subsequent operation touches overlapping cells.",
     "blocking_op_ids": ["op_05", "op_08"]
   }
   ```
