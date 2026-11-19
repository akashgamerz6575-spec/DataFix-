# DataFix — Frontend Design Specification

**Revision:** Repair Studio direction (supersedes earlier direction)
**Date:** 19 Nov 2026
**Owner:** Akash (frontend, UI/UX, integration)
**Companion document:** `COMPETITIVE_AND_ENGINEERING_REVIEW.md` (referred to below as "the Review")
**Scope of this change:** design documentation only. No application code is created or modified by this document.

---

## 0. Read this first

### 0.1 What I could and could not see

| Item | Status | Consequence |
|---|---|---|
| Your existing `FRONTEND_DESIGN_SPEC.md` | **Not visible to me.** No copy was available in this environment. | This is a **complete replacement**, written to be diffed against yours. Section 1.2 lists every decision that changed, so you can merge by decision rather than by line. |
| Your repository and backend code | **Not visible.** | I cannot say which backend capabilities are *implemented*. I can only say which are *specified* in the Review. See the legend below. |
| Backend response shapes | Partly specified in the Review (section 7.3 and 9.4), partly missing. | Section 3 lists ten contract gaps (GAP-1 to GAP-10) that this design needs. **Several of these gaps are my own omissions in the Review**, for example it never gave proposals a confidence field. They are flagged, not hidden. |

### 0.2 Status legend (used on every UI element)

Every visual state in this document is tagged with where its data comes from.

| Tag | Meaning | Rule |
|---|---|---|
| **CONTRACT** | The field or endpoint is specified in the Review (7.3 data model, 9.4 data flow). It is *specified*, not necessarily built. | Verify against the generated OpenAPI schema before building the component. |
| **DERIVED** | Computed in the browser from CONTRACT data. No backend change. | Allowed anywhere. Must be arithmetic on real fields, never invented. |
| **GAP-n** | Needed by this design but not in the Review's contract. Each has an ID, a proposed minimal shape and a **fallback** in section 3. | Agree with Teammate 3 at the first integration checkpoint. If not agreed, use the fallback. |
| **PLANNED** | A nice-to-have that depends on backend work that is not in the contract. | **Never on the demo path.** Rendered only behind a feature flag with a visible "Planned" label, or omitted. |

Two further rules:

1. **Illustrative content.** Every example string, number or hash in this document (for example "14 cells", "Raigarh") is *illustrative*. Real text comes from the backend. The UI supplies sentence frames, never facts.
2. **No state without a source.** If a design element cannot be tagged with one of the four tags, it is removed from the design.

### 0.3 Notation for contract fields

Field names such as `cells_changed` and `previously_valid_cells_changed` are taken from the Review's `SimulationReport`. `decision` and `reasons` come from `GateDecision`. `op`, `risk_class`, `evidence` and `source` come from `RepairProposal`. **TypeScript types must be generated from the backend OpenAPI schema (`openapi-typescript`), never hand-written.** Interfaces shown here are *view-model sketches* for design discussion only.

---

## 1. Revised design direction

### 1.1 The change in one paragraph

The previous direction (as far as the Review's architecture implies) treated the app as a conventional pipeline: upload, issue table, a list of fixes, export. The revised direction makes **Repair Studio the product**. Intake and Overview exist to get the user into the Studio with context; Proof and History exist to confirm and defend what the Studio did. The Studio is where a user spends most of their time, and it is the one screen a judge will remember: a place where every proposed repair is *shown, measured, checked, scored and decided on*, and where DataFix visibly refuses unsafe changes.

### 1.2 Decisions that changed (use this to diff against your current spec)

| # | Decision | Before (assumed) | Now | Why |
|---|---|---|---|---|
| D1 | Central screen | Issues table | **Repair Studio** (queue, dossier, plan) | It is the signature feature (Review section 7). |
| D2 | Unit of interaction | An issue | **A repair proposal**, linked to the issue(s) it addresses | The gate decides per proposal, not per issue. |
| D3 | Decision vocabulary | Accept / reject | **Auto-apply, Needs approval, Refused**, plus accept/reject only inside "Needs approval" | The user asked for exactly these three. They match `GateDecision.decision`. |
| D4 | Refusal | Not designed, or an error/warning style | **A first-class, valued outcome** with its own palette, motion and three variants (section 7) | Refusal is the differentiator. It must read as the system working. |
| D5 | Red | General "bad" colour | **Red means system failure only** (network, server, parse). Never a judgement by DataFix. | Keeps refusal from reading as an error. |
| D6 | Confidence | A percentage badge | **A ledger of evidence** with method, support count and caveat. Shown as "n/a" when the backend gives none. | A bare number invites the "how is it measured?" question. |
| D7 | Verification | A success toast after apply | **A Proof screen** with four checkable claims and an explicit "what this does not prove" panel | The Review's D3 (closed-loop proof). |
| D8 | Progress | Animated stage steps | **Honest progress only**: an indeterminate state with an elapsed timer unless the backend reports stages | No fake progress (principle P5). |
| D9 | Navigation | Linear wizard | **Four-stage rail plus a persistent Safety Ribbon** on every run page | Keeps the decision counts visible while the user moves around. |
| D10 | Integrity | Implicit | **Invariants are always visible per proposal**, with pass, fail and skipped states | Makes "relationship preservation" demonstrable. |

### 1.3 Design principles

| # | Principle | What it forbids |
|---|---|---|
| P1 | **Decision first.** The first thing on every repair card is its gate decision and the one-line reason. | Burying the outcome under detail. |
| P2 | **Show the change, then the proof.** Before/after values come before explanation. | Adjective-led UI ("high risk") without numbers. |
| P3 | **Every number traces to a field.** | Decorative statistics; made-up risk labels such as "Low / Medium / High blast radius". |
| P4 | **Refusal is a result.** It gets care, craft and a clear benefit statement. | Warning triangles, red X marks, "Failed" or "Error" wording on a refusal. |
| P5 | **Honest uncertainty and honest progress.** Absent data renders as absent. | Fake percentages, invented stages, placeholder "N/A" shame, a confidence number the backend did not send. |
| P6 | **Reversible by default, and say so accurately.** Undo exists after apply; before apply, nothing has changed. | Implying a change has happened when it has only been previewed. |
| P7 | **Keyboard-first review.** A user can clear a queue without a mouse. | Hover-only controls. |
| P8 | **Colour is never the only carrier.** Every state has a word and a shape. | Colour-only status. |
| P9 | **One source of truth for type shapes.** Generated types, fixtures that match them. | Hand-maintained duplicate types. |
| P10 | **Scope to the clock.** Everything has a P0/P1/P2 tag. Cuts are pre-decided (section 14). | Designing screens that cannot be built in 24 hours. |

---

## 2. Backend capability map

This table is the contract between design and backend. Read it before reading any screen.

| UI element | Data source | Status | Notes |
|---|---|---|---|
| Upload and run creation | `POST /runs` (multipart) | CONTRACT | Review 9.4 step 1. |
| Sample dataset button | Static sample CSV bundled in the frontend, sent through the same `POST /runs` | DERIVED | No backend change. Sample file must match the demo dataset (Review 15.1). |
| Analyse and receive proposals | `POST /runs/{id}/analyze` returns issues, proposals, decisions | CONTRACT | Synchronous per Review 9.1; see GAP-8 for totals. |
| Issue list, categories, counts | Issues in the analyse response | CONTRACT | Grouping by category: DERIVED. |
| Dataset totals (rows, columns) | Run or profile payload | GAP-8 | Needed for "% of rows". Fallback: omit percentages. |
| Column profile strip (type, null %, distinct) | Profile payload | GAP-8 | Fallback: show only column names and issue counts per column (DERIVED). |
| Proposal fields: `op`, `column`, `risk_class`, `source`, `issue_ids` | `RepairProposal` | CONTRACT | |
| Gate decision and `reasons` | `GateDecision` | CONTRACT | |
| Refusal kind (unsafe / insufficient evidence / kept as valid) | Not in contract | **GAP-2** | Fallback derived from invariants (section 3). |
| Blast radius numbers | `SimulationReport`: `cells_changed`, `rows_affected`, `rows_removed`, `previously_valid_cells_changed`, `aggregate_drift`, `new_issues_introduced` | CONTRACT | |
| Percent of rows or column affected | `rows_affected` ÷ dataset rows | DERIVED, needs GAP-8 | |
| Sample of before/after values | `SimulationReport.sample_diff` (first N `CellDiff`) | CONTRACT | Always label "Showing N of M". |
| Full paginated diff, removed rows, merge groups | Not in contract | **GAP-3** | Fallback: sample only. |
| Invariant checklist | `SimulationReport.invariants` (name, passed, detail) | CONTRACT | |
| "Skipped" state and thresholds on invariants | Not in contract | **GAP-4** | Fallback: treat `passed=true` with empty detail as pass; omit threshold markers. |
| Confidence value, method, components | Not in contract | **GAP-1** | Fallback: show evidence list only, label confidence "not provided". |
| Evidence items | `RepairProposal.evidence` | CONTRACT (shape: GAP-9) | |
| Source badge (Rule / Stat / AI-assisted) | `RepairProposal.source` | CONTRACT | |
| AI availability indicator | `/health` reports LLM status | CONTRACT | Review section 14. |
| Gate policy table and thresholds | `GET /policy` | GAP-7 | Fallback: static copy of Review 7.5, flagged as static. |
| Approve / reject a proposal | `POST /runs/{id}/decisions` | CONTRACT (semantics: GAP-10) | |
| Apply plan | `POST /runs/{id}/apply` | CONTRACT (semantics: GAP-10) | |
| Verification | `POST /runs/{id}/verify` | CONTRACT (shape: GAP-5) | |
| Operation history | Operations in Postgres | CONTRACT in storage, **GAP-6** for a read endpoint | Fallback: show only the operations returned by `apply`. |
| Undo an operation | `POST /runs/{id}/undo/{op_id}` | CONTRACT | Conflict behaviour: GAP-10. |
| Export bundle (cleaned data, report, modification log, recipe) | `GET /runs/{id}/export` | CONTRACT | Review 9.4 step 6. |
| Reopen a past run | `GET` run state rebuilt from Storage and DB | CONTRACT in principle (Review 9.3), depends on the Supabase adapter | Mark P1. Run id list kept in browser storage: DERIVED. |
| Synthetic benchmark scorecard | Static JSON produced offline by the benchmark generator | PLANNED until the generator exists | Shown only for the sample dataset. |
| Key column declaration (invariant 3) | Not in contract | PLANNED | UI shows whatever keys the backend reports. |
| Manual override of a refusal | Not in contract | PLANNED | Not offered in v1. See section 7.7. |

---

## 3. Contract gaps this design needs

Ten gaps. Each has a proposed minimal shape and a fallback so the frontend is never blocked.

> **Priority key:** *Demo-critical* = the demo path breaks or loses its point without it. *Important* = quality drops. *Optional* = cosmetic.

| ID | Gap | Proposed minimal shape | Fallback if not delivered | Priority |
|---|---|---|---|---|
| **GAP-1** | Proposals have **no confidence field.** (This is a hole in the Review's `RepairProposal`, not a design choice.) | `confidence: { value: number \| null, method: "rule_support" \| "backtest" \| "similarity" \| "losslessness", components: {label, value, note}[], n_support: int, lower_bound: number \| null, caveat: string \| null }`. `value` is null when evidence is insufficient. | Show the evidence list; confidence section reads "Not provided by backend". Looks weak, but honest. | Demo-critical |
| **GAP-2** | **Refusal kind.** The UI needs to know why a proposal was refused, to choose a variant. | `gate.refusal_kind: "invariant_failed" \| "insufficient_evidence" \| "kept_as_valid"`. For insufficient evidence add `evidence_gap: { summary, observed?, required?, competing?: {label, count}[] }`. | Derive: any failing invariant gives "invariant_failed"; otherwise "insufficient_evidence". "Kept as valid" is not derivable, so that variant is omitted and those items show as generic refusals. | Demo-critical |
| **GAP-3** | **Full diff.** Only `sample_diff` (first N) exists. | `GET /runs/{id}/proposals/{pid}/diff?offset&limit` returns `{ total, items: {row_id, column, before, after, was_valid}[], removed_rows?: {row_id, values}[], groups?: {keep_row_id, remove_row_ids[]}[] }`. | Sample only, with an honest "Showing N of M" line. Merge and dedupe cards show counts, not groups. | Important (basic sample is enough for the demo) |
| **GAP-4** | **Invariant status and threshold.** `passed: bool` cannot express "not applicable". | `status: "pass" \| "fail" \| "skipped"`, optional `observed`, `threshold`, `unit`. | Booleans only; no skipped state; no threshold markers. | Important |
| **GAP-5** | **Verification report shape** is unspecified. | `{ replay: {operations, input_hash, replay_hash, match}, issues: {before, after, resolved, introduced, by_category[]}, valid_cells_damaged: int, quality_score: {before, after, method}, remaining: {issue_id, reason}[], benchmark?: {...} }` | Render only the fields that arrive; hide the rest. | Demo-critical |
| **GAP-6** | **Operations read endpoint** for the history screen. | `GET /runs/{id}/operations` returns ordered `{ seq, op_id, proposal_id, op, column, cells_changed, decided_by: "auto" \| "user", applied_at, confidence_at_decision }` | History built from the `apply` response for the current session only. | Important |
| **GAP-7** | **Policy and limits.** | `GET /policy` returns `{ gate_table, thresholds, invariants[], upload_limits, engine_version }` | Static policy copy plus one constants file mirroring the README. Risk: drift. | Optional |
| **GAP-8** | **Dataset totals and column profile.** | Run object includes `rows`, `columns`; `GET /runs/{id}/profile` gives per-column `{name, inferred_type, null_pct, distinct, is_key_candidate}` | Hide "% of rows" and the profile strip. | Important |
| **GAP-9** | **Evidence shape.** `Evidence` is described as "counts, examples, rule names" but not typed. | `{ kind, label, detail, metrics: Record<string, number>, examples: string[] }` | Render `label` plus `detail` only. | Important |
| **GAP-10** | **Decide / apply / undo semantics.** Is a decision changeable until apply? Is the decisions body batched? Does `apply` return per-operation results? Do auto-apply proposals get applied at analyse time or at apply time? What does undo return on a conflict with a later operation? | Decisions: idempotent per proposal until `apply`; body `{ decisions: [{proposal_id, action}] }`. Apply: returns `{ applied: op[], skipped: {proposal_id, reason}[] }`. Undo conflict: HTTP 409 with `{ code, blocking_op_ids[] }`. | The UI supports both "auto-apply at analyse" and "auto-apply at apply" through an `applied` flag. Undo conflicts show the server message verbatim. | Demo-critical |

**Process:** put GAP-1, GAP-2, GAP-5, GAP-10 on the agenda of the first integration checkpoint (Review roadmap CP1). Ask Teammate 3 to commit **fixture JSON files** for each gap shape the same day, so the frontend can build against the agreed shape before the endpoints exist.

---

## 4. Application shell and information architecture

### 4.1 Journey and routes

Repair Studio is stage 3 of four. The other stages feed it or follow from it.

```
 ① Intake ──► ② Overview ──► ③ REPAIR STUDIO ──► ④ Proof ──► Export
  upload       what we found   decide on repairs    verify      download
   │               │                 ▲   │             │          │
   │               └─ "Open in ──────┘   │             └─ remaining issues link back to Studio cards
   │                  Studio" per issue  └─ "Apply plan" runs apply then verify, lands on Proof
   └─ sample dataset button                History (ledger) is reachable from every run page
```

| Route | Screen | Priority |
|---|---|---|
| `/` | Intake | P0 |
| `/runs/:runId/overview` | Overview (profile summary and issue list) | P0 |
| `/runs/:runId/studio` and `/runs/:runId/studio?proposal=:id&lane=:lane` | **Repair Studio** (deep-linkable to a card) | P0 |
| `/runs/:runId/proof` | Post-repair verification | P0 (basic), P1 (full) |
| `/runs/:runId/history` | Repair ledger and reproducibility | P1 |
| `/runs/:runId/export` | Export bundle | P0 |
| `/runs/:runId/policy` (drawer, not a page) | "How DataFix decides" | P1 |

Deep-linkable proposals matter for the demo: you can jump straight to a prepared card (section 15).

### 4.2 App shell (present on every run page)

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ DataFix   orders_dirty.csv · 3,214 rows × 14 cols · input sha256 3f9a…c21     API ●  AI ● │  Top bar
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ SAFETY RIBBON  [██████ 9 Auto-apply][████ 5 Needs approval][███ 4 Refused]               │  Persistent
│ Changes prevented: 4 repairs · 67 cells (21 previously valid)        Plan: not applied   │
├────────┬─────────────────────────────────────────────────────────────────────────────────┤
│ ① Intake│                                                                                 │
│ ② Overview                       (page content)                                         │
│ ③ Studio│                                                                                 │
│ ④ Proof │                                                                                 │
│ ⑤ Export│                                                                                 │
│ History │                                                                                 │
└────────┴─────────────────────────────────────────────────────────────────────────────────┘
```

| Element | Content | Source | Status |
|---|---|---|---|
| File name, rows × columns | Run payload | GAP-8 (rows, columns). Fallback: file name only | GAP-8 |
| Input hash (short, copy-on-click) | Hash of the stored original | The Review says the original is content-hashed (SHA-256). Exposure in an API field is not specified | GAP-5 (`replay.input_hash`) or run payload. Fallback: omit |
| API dot | `/health` reachable | CONTRACT | Green = reachable, grey = waking, red = unreachable (system failure, so red is allowed) |
| AI dot | `/health` LLM status | CONTRACT | Neutral wording: "AI explanations on / off (rule-based)". Never red: AI being off is a designed fallback (Review 12.4) |
| Safety Ribbon segments | Counts of proposals by `decision` | CONTRACT, counts DERIVED | Segment widths proportional; each has a text count (P8) |
| "Changes prevented" | Sum over refused proposals that have a `SimulationReport`: count of refused proposals, `cells_changed`, `previously_valid_cells_changed` | DERIVED | Hidden if no refused proposal carries a simulation. Label says "would have changed", never "damage avoided" |
| "Plan: not applied / applied" | Whether `apply` has run | DERIVED from apply result | |
| Stage rail | Stage state: not started, current, done, locked | DERIVED | Proof is locked until apply has run |

The ribbon is the connective tissue between screens: it is visible on Overview, Studio, Proof, History and Export, and each segment is a link into the matching Studio lane.

### 4.3 Responsive rules (brief; full table in section 13)

- Designed for a laptop projected to judges: **1280 to 1920 px wide is the primary target.**
- Tablet and narrow screens must work without breaking: the Studio collapses to a single column with the queue as a drawer. Phone layout is **not** a priority and is not tested in the demo.

---

## 5. Intake and Overview (the on-ramp to the Studio)

### 5.1 Intake `/`

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Fix data without trusting a fix blindly.                                   │
│  Every repair is previewed, checked and either applied, held for you, or    │
│  refused.                                                                   │
│                                                                             │
│  ┌──────────────────────────────────────────────┐   ┌────────────────────┐ │
│  │  Drop a CSV here, or browse                   │   │  Try the sample    │ │
│  │  Max {limit} MB · {limit} rows                │   │  orders_dirty.csv  │ │
│  └──────────────────────────────────────────────┘   └────────────────────┘ │
│  Recent runs (this browser): orders_dirty.csv · 19 Nov · [Open]             │
└────────────────────────────────────────────────────────────────────────────┘
```

| State | Trigger | UI | Source |
|---|---|---|---|
| Idle | Page load | Dropzone and sample card. `{limit}` from GAP-7, else one constants file mirroring the README | GAP-7 / DERIVED |
| Dragging over | File hover | Dropzone highlights. Text: "Release to upload" | UI-only |
| Client validation fails | Extension not CSV (XLSX only if the backend supports it), or size over the limit | Inline message under the dropzone. Not a toast. Names the rule that failed | UI-only, must match backend rules |
| Waking server | First request is slow or `/health` unreachable | Banner: "Server is waking up (free hosting). This can take about a minute." Auto-retry with elapsed timer. No spinner without an explanation | CONTRACT (`/health`). Cold-start timing: Review 14 |
| Uploading | `POST /runs` in flight | Button disabled, file name and size shown | CONTRACT |
| Analysing | `POST /runs/{id}/analyze` in flight | **Indeterminate** bar and elapsed timer, with the line "Profiling, detecting, simulating repairs". No per-stage ticks (D8) unless the backend later sends stage timings | CONTRACT |
| Upload rejected | HTTP 413, 415 or 422 | Plain-language message with the backend's `message`. Offer "Try the sample" | CONTRACT (error envelope, Review 9) |
| Parse failure | Backend cannot parse | "We couldn't read this file as a table" plus the server detail. Suggest checking delimiter and encoding | CONTRACT |
| Network or server failure | 5xx or network | Red system-failure treatment, "Retry" | System failure, so red is allowed |
| Success | Analyse returns | Navigate to Overview | CONTRACT |

**Sample dataset** is a static file in the frontend uploaded through the normal path. It must be identical to the demo dataset. This also helps automated or remote evaluators who cannot upload files (Review 8).

**Recent runs (this browser)** is stored locally. It is a convenience list only. Opening one calls the backend and is real only if persistence and rebuild-on-miss (Review 9.3) are built. **P1**.

### 5.2 Overview `/runs/:id/overview`

Purpose: tell the user what was found and hand them to the Studio. It is deliberately light.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ We found 38 issues in 3,214 rows                [ Open Repair Studio → ]    │
│                                                                             │
│ Missing values 9 · Duplicates 4 · Invalid formats 11 · Inconsistent 8 ·     │
│ Anomalies 6                              (category chips filter the table)  │
│                                                                             │
│ Column health   order_id ▮▮▮▮▮  email ▮▮▮▯▯  city ▮▮▯▯▯  order_date ▮▯▯▯▯   │
│                                                                             │
│ Issue            Column      Likely cause          Cells   Repair status    │
│ Mixed formats    order_date  Format drift          412     ✔ Auto-apply     │
│ City variants    city        Spelling variants     57      ✋ Needs approval │
│ Rajgarh/Raigarh  city        Similar distinct vals 14      ⛨ Refused       │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Element | Source | Status |
|---|---|---|
| Totals, category chips | Issues in analyse response | CONTRACT, grouping DERIVED |
| Column health strip | Profile payload | GAP-8. Fallback: column names with per-column issue counts (DERIVED) |
| "Likely cause" | Diagnosis hypothesis attached to the issue | CONTRACT (diagnosis is part of the Review 7.2 flow). Exact field name to confirm |
| "Repair status" chip | The proposal linked by `issue_ids` and its `decision` | CONTRACT, join DERIVED |
| Issue with no proposal | No linked proposal | CONTRACT. Shown as "Flagged, no repair proposed" in neutral grey |
| Row click | Opens Studio at that proposal (`?proposal=`) | DERIVED |
| Zero issues | Empty analyse result | "No issues detected by the current detectors." Never "your data is clean": detectors have limits (see section 10) |

---

## 6. Repair Studio (the central experience)

### 6.1 Layout

Desktop (1280 px and up) uses three working areas under the shared shell:

```
┌───────────────────────┬─────────────────────────────────────────────┬──────────────────┐
│ QUEUE (340 px)        │ REPAIR DOSSIER (flex)                       │ PLAN (280 px)    │
│ Lanes:                │                                             │                  │
│ [All][✔ 9][✋ 5][⛨ 4] │ ┌ Decision header ────────────────────────┐ │ Will apply       │
│ search · group by ▾   │ │ ✋ NEEDS APPROVAL  Standardise city    │ │  9 auto          │
│ ───────────────────── │ │ 57 cells · evidence 94%                 │ │  + 2 approved    │
│ ▸ Format-only (lossless)│ └─────────────────────────────────────┘ │ 1,284 cells      │
│   ✔ order_date  412   │ 1 What and why                              │ 3 rows removed   │
│   ✔ email trim   88   │ 2 The change   (Before → After)             │                  │
│ ▸ Value substitution  │ 3 Blast radius                              │ Pending approval │
│ → ✋ city       57    │ 4 Safety checks (invariants)                │  3 not applied   │
│   ✋ unit_price 21    │ 5 Evidence and confidence                   │                  │
│ ▸ Refused             │ 6 Why this decision                         │ Refused: 4       │
│   ⛨ city (merge) 14   │                                             │ never applied    │
│   ⛨ order_date  6     │ [Reject (R)]  [Approve (A)]  [Skip (S)]     │ [Apply 11 repairs]│
└───────────────────────┴─────────────────────────────────────────────┴──────────────────┘
```

| Width | Layout |
|---|---|
| 1280 px and up | Three areas as above |
| 1024 to 1279 px | Queue and Dossier side by side; Plan collapses into a sticky bottom Apply bar with a drawer |
| Below 1024 px | Single column: Queue as a full-screen list, Dossier as a pushed view, Apply bar sticky. Functional, not polished |

### 6.2 Queue

| Feature | Behaviour | Source | Priority |
|---|---|---|---|
| Lane tabs | All, Auto-apply, Needs approval, Refused, each with a count | `decision` counts, DERIVED | P0 |
| Default lane on first load | **Needs approval** (where work is). If none, Auto-apply. A one-time strip appears when refusals exist: "4 repairs were refused. See why →" | DERIVED | P1 |
| Group by | Risk class (default), column, op | `risk_class`, `column`, `op` | P0 (risk class), P1 (others) |
| Sort | Within a group by `cells_changed` descending | CONTRACT | P0 |
| Search | By column name or op | DERIVED | P1 |
| Item content | Decision glyph, column, one-line title, `cells_changed`, state chip (queued, pending, approved, rejected, applied, sealed) | CONTRACT, state DERIVED | P0 |
| Multi-select | Checkbox on Needs-approval items only. Never on Refused items | DERIVED | P2 |
| Keyboard | `j`/`k` move, `Enter` open, `a` approve, `r` reject, `s` skip, `g` then `1/2/3/4` switch lane, `?` help | DERIVED | P1 |
| Empty lane | Lane-specific copy (section 10) | UI-only | P0 |

Auto-apply items are **grouped and collapsed by default** ("Format-only (lossless), 9 repairs") so the user is not asked to review what the gate has cleared. Each can still be opened for the full dossier. Transparency without burden.

### 6.3 Collapsed repair card (queue item and list card)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ✋ Needs approval      Standardise city values                  Rule · Stat  │
│ city · map_values · value_substitution                  Evidence 94% (backtest)│
│ "bangalore " → "Bengaluru"   "BLR" → "Bengaluru"   +2 more                    │
│ 57 cells · 54 rows · 0 previously valid cells touched · 0 new issues          │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Part | Source | Status |
|---|---|---|
| Decision stamp and label | `decision` | CONTRACT |
| Title | Frame text plus `op` and `column`, for example "Standardise {column} values". The frame table is UI copy; the numbers are data | DERIVED |
| Chips: column, `op`, `risk_class` | `RepairProposal` | CONTRACT |
| Source badge: Rule, Stat, AI-assisted | `source` (`rule`, `stat`, `llm_assisted`) | CONTRACT |
| Sample change line | First two entries of `sample_diff`, then "+N more" | CONTRACT, formatting DERIVED |
| Evidence chip: "Evidence 94% (backtest)" | `confidence.value` and `confidence.method` | GAP-1. Fallback: "Evidence: 3 items" from `evidence.length` |
| Counts line | `cells_changed`, `rows_affected`, `previously_valid_cells_changed`, `new_issues_introduced` | CONTRACT |

### 6.4 Dossier (expanded repair)

The dossier is one scrolling column with a sticky decision header and a sticky action footer. Section order is fixed so users learn it, and is the same for every decision type.

| # | Section | Contents | Source |
|---|---|---|---|
| H | **Decision header (sticky)** | Decision stamp, title, one-line headline reason (first of `reasons`), source badge | CONTRACT |
| 1 | **What and why** | The issue(s) addressed (`issue_ids`), likely cause, explanation text. If `source` is `llm_assisted`, show the AI explanation with the label "AI-written explanation, constrained to rule-generated hypotheses". Otherwise show the rule-based template text | CONTRACT; label text reflects Review 9.2 |
| 2 | **The change** (Original vs Proposed) | Section 6.5 | CONTRACT (sample), GAP-3 (full) |
| 3 | **Affected rows and cells** | Section 6.6 | CONTRACT, GAP-3 |
| 4 | **Blast radius** | Section 6.7 | CONTRACT |
| 5 | **Safety checks (invariants)** | Section 6.8 | CONTRACT, GAP-4 |
| 6 | **Evidence and confidence** | Section 6.9 | CONTRACT (evidence), GAP-1, GAP-9 |
| 7 | **Why this decision** | The `reasons` list in full, plus a "View policy" link to the policy drawer | CONTRACT, policy: GAP-7 |
| F | **Action footer (sticky)** | Depends on decision (section 6.10) | CONTRACT |

### 6.5 Original versus proposed values

One component, four modes. The mode is chosen automatically from `op`, and the user can switch.

| Mode | Used for | Layout | Source |
|---|---|---|---|
| **Inline diff list** (default) | Format normalisation, trimming, case, type casts, set-null | One line per change: `row 1042 · order_date   25/04/2024 → 2024-04-25`, with character-level highlighting | `sample_diff` (CONTRACT), full list GAP-3 |
| **Value mapping** | `map_values` (category standardisation) | Grouped: `Bengaluru ← bangalore (38) · Bangalore (12) · BLR (7)`. Counts are the number of cells per source value | Derived by grouping the diff. Complete only with GAP-3; with the sample it must say "based on a sample of N changes" |
| **Side-by-side table** | Any op, when the user wants context | Columns: row id, column, Original, Proposed. Context columns (neighbouring fields) greyed in | Row id and values from the diff. Context columns are **PLANNED** (need row context from the backend) |
| **Merge groups** | `merge_near_dupes`, `drop_exact_dupes` | Each group shows the **kept** row and the **removed** rows as stacked records with differing fields highlighted | GAP-3 (`groups`, `removed_rows`). Fallback: counts only ("12 rows would be removed") |

Rules for every mode:

1. **Always state coverage:** "Showing 20 of 412 changes" using `cells_changed` and the number of items actually held. Never imply the sample is the whole set.
2. **Make invisible differences visible.** Leading and trailing spaces render as `·`; tab and non-breaking space get glyphs; case changes underline the changed letters. Many repairs are whitespace or case, and a diff that looks identical is useless.
3. **Distinguish three kinds of "nothing":** `∅ null` (true missing), `∅ empty` (empty string), and placeholder text such as `"N/A"` shown as the literal string in quotes. A placeholder-to-null repair (Review 15.1, row 4) must read as `"N/A" → ∅ null`.
4. **Neutral diff colours.** Before is grey with strikethrough, after is sky blue. Diff colours never encode the gate decision (P4, D5).
5. Long values truncate with a copy button; full value on focus or hover.
6. A **Copy as CSV** control exports the visible diff (DERIVED). **P2**.

### 6.6 Affected rows and cells

Two parts: a **reach summary** and an **affected-cells table**.

**Reach summary** (all DERIVED from CONTRACT numbers):

```
Reach     412 cells · 412 rows (12.9% of 3,214) · 1 of 14 columns [order_date]
          ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  proportion of rows
```

- The bar is a **proportion**, not a map. It does not imply which rows are affected.
- If `rows_affected` is known but dataset rows are not (GAP-8), show the count without a percentage.
- Columns affected: `column` for single-column ops. Merge and dedupe ops touch several columns, shown only if the diff provides them (GAP-3).

**Affected-cells table** (paginated, 25 per page):

| Column | Content |
|---|---|
| Row | `row_id` (the original row identity, stable across replay) |
| Column | Column name |
| Original | Value with visible-whitespace rendering |
| Proposed | Value |
| Flag | "Previously valid" marker if the item is flagged |

- Filters: *All*, *Previously valid only*. The second needs a per-item `was_valid` flag, which I recommend adding to the GAP-3 item shape. Without it, omit the filter.
- Search by row id.
- Row selection is **not** offered: decisions are per proposal, not per cell.

**Dataset X-ray (PLANNED, P2):** a thumbnail of the whole table with affected cells highlighted, bucketed by row. It needs compact affected-row positions from the backend (beyond GAP-3). Not on the demo path.

### 6.7 Blast-radius analysis

Five blocks. All numbers are CONTRACT fields, not scores.

```
BLAST RADIUS                                                    (simulated on a copy; nothing changed yet)
┌ Reach ────────────┬ Collateral ──────────┬ Drift ────────────────┬ New issues ───┬ Reversible ───┐
│ 57 cells          │ 0 previously valid   │ quantity  mean  +0.0% │ 0 introduced  │ Undo available│
│ 54 rows (1.7%)    │ cells touched        │ total     sum   +0.0% │               │ after apply   │
│ 0 rows removed    │ ✔                    │ (numeric columns only)│ ✔             │               │
└───────────────────┴──────────────────────┴───────────────────────┴───────────────┴───────────────┘
```

| Block | Fields | Presentation rules |
|---|---|---|
| **Reach** | `cells_changed`, `rows_affected`, `rows_removed`, percent of rows (DERIVED, GAP-8) | Plain numbers. No "Low/Medium/High" label: any such label would be invented (P3) |
| **Collateral** | `previously_valid_cells_changed` | The most important number. `0` shows a tick and the plain sentence "No previously valid cells touched". A positive number shows the count in amber on approval cards, and in indigo emphasis on refused cards (section 7). Tooltip defines "previously valid": cells no detector flagged before the change |
| **Drift** | `aggregate_drift` (relative change per numeric column) | A small horizontal bar per column, with the signed percentage. A threshold tick appears **only** if the invariant result supplies one (GAP-4). Hidden entirely if the map is empty, with the line "No numeric columns affected" |
| **New issues** | `new_issues_introduced` | The count of issues re-detection finds on the simulated copy that were not there before. Positive count shows amber with a link to the invariant that explains it |
| **Reversible** | Architecture: state is original plus operation log; undo removes an operation and replays (Review D3) | Static assurance, but worded accurately: "Undo available after apply" (P6). Before apply, nothing has changed |

Footer line, always shown: **"Simulated on a copy of your data. The original file is never modified."** This is true by the Review's architecture (original immutable in Storage, state derived by replay).

Interaction between proposals: each simulation is independent. The UI must not imply the combined effect is predicted. See "Plan" (6.11).

### 6.8 Integrity invariant results

A checklist, always visible, in this fixed order (Review 7.4):

| # | Label shown | Review invariant | Notes |
|---|---|---|---|
| 1 | Columns and types unchanged | Column set and dtypes unchanged unless op declares a cast | |
| 2 | Row count as expected | Row count unchanged unless a dedupe within flagged groups | |
| 3 | Key columns unique and filled | Declared key columns remain unique and non-null | Key declaration is PLANNED; show whichever keys the backend reports |
| 4 | Valid cells left alone | Previously-valid cells unchanged unless explicitly targeted | |
| 5 | Cross-column rules hold | For example ship date not before order date; total equals quantity × price | |
| 6 | Dependencies preserved | Functional dependency groups gain no violations (for example pincode → city) | This is the invariant that catches the "similar but different" merge in section 7 |
| 7 | Aggregate drift within limit | Drift below the per-risk-class threshold | |
| 8 | Foreign keys intact | Referential integrity against a second table | **P1 stretch** in the Review. Show only if the backend returns it |

Row states (needs GAP-4; with booleans only, skipped is not representable):

| State | Glyph | Meaning | Style |
|---|---|---|---|
| Pass | Tick in circle | Check ran and held | Neutral with green tick (never colour alone: the word "Passed" is present) |
| Fail | Shield with bar | Check ran and **would be violated** | Indigo emphasis. This only occurs on refused proposals |
| Skipped | Dash in circle | Not applicable here (for example no second table) | Grey, with the reason from `detail` |

Each row has a one-line `detail` (CONTRACT) and expands to show the observed value and threshold if GAP-4 provides them.

**Defensive rule:** if a non-refused proposal contains a failed invariant, the backend contradicted its own gate policy ("any invariant fails → refused", Review 7.5). The UI shows a system-failure notice ("Inconsistent response from server"), logs to the console, and **disables Approve** for that card. Better a visible bug than a silent unsafe approval.

### 6.9 Evidence-backed confidence

The design principle is that **confidence is shown as an explained estimate, never as a bare number** (D6).

```
EVIDENCE AND CONFIDENCE
Confidence   94%        Method: backtest on known values in this column
             ──────────────────────●──────  ▏needs-approval band ▏auto band
Backtest     Recovered 46 of 50 held-out values · conservative lower bound 81%
Components   Pattern support 0.97 · Closed-set match 1.00 · Ambiguity margin 0.12
Evidence     • 52 of 57 cells match an existing canonical value in this column
             • pincode → city holds for 98% of rows with both values present
Caveat       Estimated from this column's known values. A proxy for the missing
             cells, not a guarantee.
Written by   Rule-based
```

| Element | Source | Status | Rules |
|---|---|---|---|
| Headline percentage | `confidence.value` | GAP-1 | Show only if not null. If null show "No confidence estimate: evidence insufficient", which is the honest reading of Review D2 |
| Method line | `confidence.method` | GAP-1 | Plain-language mapping of the four methods (`rule_support`, `backtest`, `similarity`, `losslessness`) |
| Gauge with policy bands | `confidence.value` plus thresholds from the policy | GAP-1 and GAP-7 | Draw band markers **only** if thresholds are known. Otherwise show the value with no bands |
| Backtest sentence | `n_support`, `lower_bound` | GAP-1 | Review D2 recommends a conservative bound so small samples do not look falsely confident. Show the bound *next to* the headline, never hidden |
| Components | `confidence.components` | GAP-1 | Label, value, optional note. Order as given |
| Evidence list | `evidence` items | CONTRACT (shape: GAP-9) | Plain bullets. Examples rendered as monospace chips |
| Caveat | `confidence.caveat` | GAP-1 | Always shown when present. Review D2 asks you to state the proxy limitation yourself |
| Written by | `source` | CONTRACT | If `llm_assisted`, add: "The AI chose between hypotheses the system generated. It did not set this score or write cell values." This reflects Review 9.2's constraints. Show it only for `llm_assisted` proposals |

**Words not to use:** "probability", "accuracy" (unless it is a measured benchmark figure with its sample), "certain", "guaranteed". Use "evidence" or "estimated".

### 6.10 The three decisions

| | **Auto-apply** | **Needs approval** | **Refused** |
|---|---|---|---|
| Backend value | `auto_apply` | `needs_approval` | `refused` |
| Short meaning | Cleared by the gate. Runs when the plan is applied | Needs your decision | DataFix declined to make this change |
| Label | "Auto-apply" | "Needs approval" | "Refused" |
| Colour tokens | Emerald (`auto`) | Amber (`approval`) | Indigo/violet (`guard`) |
| Glyph (lucide, **verify names in the installed version**) | `ShieldCheck` | `Hand` | `ShieldBan` |
| Shape of stamp | Rounded pill | Rounded pill with a hand cut-out | Circular **seal** (section 7) |
| Card edge | 2 px emerald bar | 3 px amber bar | 4 px indigo bar plus subtle hatch texture |
| Default presentation | Collapsed, grouped | Open in the queue | Open in its own lane, sealed treatment |
| Primary actions | "Exclude from plan" (**PLANNED**, see below) | **Approve** and **Reject** | None that change data (section 7.6) |
| State chips | Queued, Applied | Pending, Approved, Rejected, Applied | Sealed |
| Counts toward Plan | Yes | Only if Approved | Never |

**"Exclude from plan" on an Auto-apply card** is not in the contract (GAP-10 asks whether a decision on an auto item is accepted). Until confirmed, Auto-apply cards have **no action buttons**: they are inspect-only. That is a valid design and keeps the demo simpler. If GAP-10 allows it, the control is a secondary "Exclude" button.

### 6.11 Accept and reject interactions

**Per-card (Needs approval):**

| Action | Control | Behaviour |
|---|---|---|
| Approve | Primary button, `A` | Optimistic: chip changes to *Approved*, Plan updates. Sends `POST /runs/{id}/decisions`. On failure, rolls back and shows an inline error on the card (system failure, red allowed) |
| Reject | Secondary button, `R` | Same flow. Chip *Rejected*. The card stays in the queue, dimmed, so it can be reconsidered |
| Skip | Tertiary, `S` | Moves to the next pending card. No request. The card stays *Pending* |
| Change mind | Any time before apply, click the chip or use `U` | Decision reverts to *Pending*. Needs GAP-10 (idempotent re-decision). Otherwise offer a change only until the request is sent |
| Confirmation | None for a single approve. The card already shows the diff, blast radius and checks | Avoids click fatigue. Approve is not destructive: undo exists after apply |

**Batch (Needs approval only, P2):** multi-select then "Approve N selected". A confirmation sheet lists total cells, total rows removed, and the lowest evidence value among the selection. There is **no** "approve all" shortcut, and no batch control exists in the Refused lane.

**Plan panel (right) and Apply:**

```
PLAN
Will apply        9 auto-apply
                  + 2 approved
                  = 11 repairs
                  1,284 cells · 3 rows removed

Not applied       3 pending approval
                  4 refused (never applied)

Sums of independent previews. The combined effect is verified after apply.

[ Review order of operations ]
[ Apply 11 repairs ]
```

| Element | Source | Status |
|---|---|---|
| Tallies | Sums of `cells_changed` and `rows_removed` over proposals that will apply | DERIVED |
| "Sums of independent previews" caveat | Each simulation runs on its own copy (Review 7.2) | Static, accurate |
| Overlap warning ("2 repairs touch the same cells") | Needs cell sets from the backend | PLANNED |
| Review order | The operation order the backend will use | GAP-10 (apply must define order). Fallback: hide the drawer |
| Apply | `POST /runs/{id}/apply`, then automatically `POST /runs/{id}/verify`, then navigate to Proof | CONTRACT |
| Apply with pending items | **Allowed.** Pending items are simply not applied, and the Plan says so in words | DERIVED |
| Applying | Button shows progress, Studio becomes read-only | UI-only |
| Apply failure | Inline error in the Plan, with the server message; nothing is assumed applied unless the response says so | GAP-10 |
| After apply | Plan switches to "Applied: 11 repairs" with buttons *View proof* and *View history* | DERIVED |

### 6.12 Studio states

| State | Trigger | UI |
|---|---|---|
| Loading proposals | Analyse in flight, or navigating directly to the URL | Skeleton queue and dossier, indeterminate bar, elapsed timer |
| No proposals | Analyse returned no proposals | "No repairs proposed." If issues exist: "Issues were found but none could be turned into a repair. See Overview." |
| Lane empty | A lane has zero items | Auto-apply: "Nothing was cleared automatically." Needs approval: "Nothing needs your approval." Refused: "Nothing was refused." (neutral, not celebratory) |
| All decided | No pending items | Plan highlights Apply. Banner: "All decisions made. 11 repairs will apply." |
| Applied (read-only) | Apply succeeded | Cards show *Applied* chips; approve and reject controls are gone; undo lives in History |
| Stale run | Backend 404 for the run | "This run is no longer available." Offer "Start a new run" |
| API failure | 5xx or network | Red system-failure banner with Retry |
| Contract violation | Failed invariant on a non-refused proposal | Section 6.8 defensive rule |

---

## 7. Refused repairs: the Guardian treatment

### 7.1 The job of this design

A refusal is DataFix doing its most valuable work: it looked at a plausible-looking change, tested it, and kept the user's data safe. The interface must communicate three things in this order:

1. **We caught something.** (Specific: which check, what would have happened.)
2. **Nothing was changed.** (Reassurance, stated plainly.)
3. **Here is what we know and what would help.** (Useful next step, not a dead end.)

It must never look like a failed operation. If a judge glances at the refused lane for two seconds, the impression should be "this tool has judgement", not "this tool broke".

### 7.2 Visual language (the "Guardian" system)

| Element | Specification | Why |
|---|---|---|
| **Palette** | Indigo/violet family: `guard-50` `#EEF2FF`, `guard-700` `#6D28D9`, `guard-900` `#312E81`. **Never red.** | Red is reserved for system failure (D5). A distinct hue also makes the lane instantly recognisable |
| **Seal glyph** | A circular seal containing a shield and a raised hand (`ShieldBan` or a custom SVG), 40 px in the header | A seal reads as "official decision", not "error" |
| **Card edge** | 4 px indigo bar and a very light diagonal hatch (2% opacity) on the header band only | Marks the card as held without making it look disabled |
| **Typography** | Headline in `guard-900`, semibold. Body unchanged | Same reading experience as other cards |
| **Ghost diff** | The change DataFix *would have made* is drawn in dashed outlines with a "Prevented change" label (section 7.3) | Makes the benefit concrete |
| **The catch** | The check that caught the problem is called out in its own panel (section 7.3) | A visible reason beats an abstract rule name |
| **Seal motion** | On first reveal of a refused card, the seal settles in over about 240 ms (scale from 1.15 to 1.0 with a soft fade) and the ghost diff fades in 120 ms after. **No shake, no flash, no pulsing.** With `prefers-reduced-motion`, everything appears instantly | Calm, deliberate. Motion must never feel like an alarm |
| **Lane header** | A "vault" band: "Refused repairs. DataFix declined these. **Nothing here changes your data.**" | Frames the whole lane before the user reads a card |
| **Ledger line** | "Changes prevented: 4 repairs · 67 cells (21 previously valid)" shown in the Safety Ribbon and in the Proof screen | A running record of value delivered (DERIVED from simulations; see 7.5) |

### 7.3 Three variants, tied to real backend outcomes

The variant is chosen from `gate.refusal_kind` (**GAP-2**). Without GAP-2, only the first variant can be derived (any failed invariant) and the other two collapse into a generic refusal.

#### Variant A: **Unsafe change prevented** (`invariant_failed`)

Triggered when a simulated repair breaks an invariant. The Review's gate rule is "any invariant fails → refused".

```
┌─ ⛨ REFUSED ────────────────────────────────────────────────────────────────┐
│ (seal)  Refused: would merge two different cities                          │
│         Standardise city · map_values · 14 cells                            │
│         Nothing was changed.                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ THE CATCH                                                                   │
│  ⛨ Dependencies preserved: FAILED                                          │
│  Merging "Rajgarh" into "Raigarh" would break pincode → city for 14 rows.   │
│  Violations before: 0   after: 14   ▮▮▮▮▮▮▮▮▮▮▮▮▮▮                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ PREVENTED CHANGE  (what would have happened)            [ Hide ]            │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐         │
│  ╎ row 812   city   Rajgarh ⇢ Raigarh        (valid under every rule) ╎      │
│  ╎ row 1190  city   Rajgarh ⇢ Raigarh        (valid under every rule) ╎      │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘         │
│  Would have changed 14 cells · 14 were previously valid · 0 rows removed    │
├─────────────────────────────────────────────────────────────────────────────┤
│ Safety checks:  7 passed · 1 failed     Evidence: names differ by 1 letter  │
│ Why this was held back: similar spelling alone is not enough to merge when  │
│ the surrounding data says the values are different places.                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ [ Acknowledge ]   [ Why can't I override? ]                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Part | Source | Status |
|---|---|---|
| Headline | First of `reasons` (backend text). The frame "Refused:" is UI | CONTRACT |
| "The catch" panel | The failing `InvariantResult` (`name`, `detail`), plus observed and threshold values | CONTRACT (name, detail), GAP-4 (observed, threshold) |
| Before/after violation bar | Observed values from the invariant | GAP-4. Fallback: show `detail` text only, no bar |
| Prevented change counts | `SimulationReport.cells_changed`, `previously_valid_cells_changed`, `rows_removed` | CONTRACT |
| Ghost diff rows | `sample_diff` | CONTRACT |
| "valid under every rule" marker | Per-item `was_valid` | GAP-3. Fallback: show only the aggregate count |
| Explanation sentence | Backend `reasons` or diagnosis text. If the backend gives none, show only the facts above, **do not invent prose** | CONTRACT |

**Recommended addition to the demo dataset** (a change for the data teammate, not in the Review's table): include a *deliberate trap*, a pair of genuinely different but similarly spelled values (the Raigarh and Rajgarh pair is the illustration used here; **choose and verify real values yourselves**) that a spelling-similarity rule would merge, with the pincode dependency present so invariant 6 catches it. It needs the dependency invariant (Review 7.4, item 6) to be implemented. Without such a trap, Variant A has nothing real to show.

#### Variant B: **Insufficient evidence** (`insufficient_evidence`)

Triggered when the system cannot determine a safe value: ambiguous dates, or imputation with too little backtest support. No value is proposed, so there is no ghost diff.

```
┌─ ⛨ REFUSED ────────────────────────────────────────────────────────────────┐
│ (seal)  Refused: day-first or month-first can't be told apart               │
│         Normalise order_date · 6 cells · No value proposed                  │
│         Nothing was changed. These cells stay as they are and are flagged.  │
├─────────────────────────────────────────────────────────────────────────────┤
│ THE EVIDENCE GAP                                                            │
│   "03/04/2024" could be 3 April or 4 March.                                 │
│   Unambiguous rows in this column:                                          │
│     day-first    ███ 3                                                      │
│     month-first  ███ 3             → evidence is split; need a clear lean   │
├─────────────────────────────────────────────────────────────────────────────┤
│ What would help: confirm the date convention used by the source system,     │
│ then re-run.                                                                │
│ Safety checks: not run (no value was proposed)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ [ Acknowledge ]                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

For the imputation case, the gap panel becomes a **support meter**: "Known values to learn from: 9. Needed: 30" as a horizontal fill with a marker at the required line.

| Part | Source | Status |
|---|---|---|
| Headline | First of `reasons` | CONTRACT |
| Gap summary, competing counts, observed and required | `evidence_gap` | **GAP-2** |
| "Nothing was changed" | A refused proposal never applies (Review 7.2 and 7.5) | Static, accurate |
| "Safety checks: not run" | Absent or empty `simulation` | DERIVED. If the simulation is present, show the checklist as normal |
| "What would help" | UI copy template keyed on `op` and `refusal_kind` (for example date ambiguity, sparse imputation). The template is UI-owned advice, labelled "Suggested next step" | DERIVED (static copy) |

The date case is a perfect illustration of Review D2: support for day-first against month-first is computed from the unambiguous rows, and the system abstains when it is split.

#### Variant C: **Kept as valid** (`kept_as_valid`)

Triggered when a value looks statistically unusual but breaks no rule, so DataFix deliberately leaves it. This is the "does not corrupt valid data" moment (Review 15.1, row 12).

```
┌─ ⛨ LEFT UNTOUCHED ─────────────────────────────────────────────────────────┐
│ (seal)  Kept: unusually large order, but every rule holds                   │
│         quantity · 1 cell · No repair proposed                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ WHY WE BELIEVE IT'S REAL                                                    │
│   ✔ total equals quantity × unit_price                                      │
│   ✔ order and ship dates are consistent                                     │
│   ✔ Value is rare (higher than 99% of rows) but within a plausible range    │
├─────────────────────────────────────────────────────────────────────────────┤
│ [ Acknowledge ]                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Part | Source | Status |
|---|---|---|
| Whole variant | `refusal_kind = kept_as_valid`, plus an issue-level disposition for outliers that have no proposal | **GAP-2**, and the Review does not define whether such items appear as proposals or only as issues. Needs agreement |
| "Why we believe" checks | Diagnosis evidence and cross-column rule results | CONTRACT (diagnosis), exact shape GAP-9 |
| Header wording | "Left untouched" rather than "Refused", because no repair was proposed | UI copy. It still lives in the Refused lane with a sub-label (it is the system declining to change something) |

If GAP-2 is not delivered, **omit Variant C**. Do not fake it.

### 7.4 Copy rules

| Use | Avoid |
|---|---|
| "Refused", "Held back", "Declined", "Prevented change", "Left untouched" | "Error", "Failed", "Invalid", "Warning", "Problem", "Unable to" |
| "Nothing was changed." | "Operation aborted" |
| Specific cause from the backend text | Generic "Unsafe repair" |
| "What would help" (practical, optional) | Blame ("You must…") |

Icons not to use on refusals: warning triangle, red cross, exclamation mark in a circle. Colours not to use: any red or orange.

### 7.5 The "Changes prevented" ledger

A running figure shown in the Safety Ribbon and on the Proof screen.

- **Formula (DERIVED):** over refused proposals that carry a `SimulationReport`, count the proposals, sum `cells_changed`, and sum `previously_valid_cells_changed`.
- **Wording:** "would have changed", never "damage avoided" or "errors prevented". The first is a statement about the simulation; the others are claims about outcomes.
- **Honest limits:** abstentions without a simulation (Variant B) contribute nothing to the cell sums, so the figure undercounts. The label shows the number of refused repairs separately from the cell totals so nothing is overstated.
- On the Proof screen it sits beside the "valid cells damaged" figure, which together say: *nothing valid was changed, and here is how much we declined to change.*

### 7.6 Actions on a refused card

| Control | Behaviour | Source | Status |
|---|---|---|---|
| **Acknowledge** | Marks the card as reviewed in this browser, removing it from the "unreviewed refusals" count. No data effect and no backend call | DERIVED (browser-local) | P1. Label includes "(this browser)" in the tooltip |
| **Show / hide prevented change** | Toggles the ghost diff | UI-only | P1 |
| **Why can't I override?** | Opens a short explainer (section 7.7) | UI copy | P1 |
| **Include in report** | Refusals appear in the quality report | Report builder must include them. The Review lists a report, not its contents | **GAP**: confirm with the backend. Until confirmed, do not claim it |
| Approve / Apply anyway | **Not offered** | | By design |

### 7.7 Why there is no override in v1

The explainer text (UI copy, shown from "Why can't I override?"):

> Refused means DataFix could not make this change safely: either a check would be violated, or the evidence is too thin to choose a value. In this version refusals are final, so the audit log and the verification proof can say "every applied change cleared the gate." If you know the right value, fix it at the source and re-run.

This is a deliberate product decision, and it simplifies both the UI and the backend. A manual-fix flow (providing your own value, which would then be simulated, gated and logged) is **PLANNED** and not part of the demo.

### 7.8 Where refusals appear across the app

| Place | What shows | Source |
|---|---|---|
| Safety Ribbon | Refused segment and the "Changes prevented" line | CONTRACT, DERIVED |
| Overview issue table | Status chip "Refused" in the guard palette | CONTRACT |
| Studio queue | Dedicated lane with the vault header | CONTRACT |
| Plan panel | "Refused: 4 (never applied)" | DERIVED |
| Proof screen | "Remaining and refused" list with links back to cards, and the ledger figure | CONTRACT (`remaining`, GAP-5), DERIVED |
| History | Refusals are **not** operations (nothing was applied), so they are not in the ledger of operations. They appear in a separate "Declined" tab built from the proposals list | DERIVED |
| Export | In the quality report if the backend includes them | GAP (see 7.6) |

---

## 8. Post-repair verification: the Proof screen `/runs/:id/proof`

### 8.1 Purpose

Answer "how do you know the repair worked?" with checkable claims, and say plainly what the checks do **not** prove.

### 8.2 Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ✔ VERIFIED   11 repairs applied · re-checked against the untouched original │
│              Completed in 3.2 s                                             │
├──────────────────────┬──────────────────────┬───────────────────────────────┤
│ 1 ISSUES             │ 2 VALID CELLS        │ 3 REPLAY                      │
│ before 38 → after 14 │ DAMAGED              │ Replayed 11 operations on the │
│ 24 resolved          │      0               │ untouched original            │
│ 0 introduced         │ cells that were      │ result hash 7c1e…9a0          │
│ ▮▮▮▮▮▮▮▮▯▯▯          │ valid and changed    │ exported hash 7c1e…9a0  ✔ match│
├──────────────────────┴──────────────────────┴───────────────────────────────┤
│ 4 QUALITY SCORE   71 → 93   (how it is computed ↗)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ REMAINING AND REFUSED (14)    [ By category ▾ ]                             │
│  ⛨ order_date · ambiguous (6)   [Open in Studio]                            │
│  ✋ unit_price · pending approval (3)   [Open in Studio]                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ WHAT THIS DOES AND DOES NOT PROVE                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ Changes prevented: 4 repairs · 67 cells (21 previously valid)               │
│ [ Download evidence bundle ]  [ View history ]  [ Undo last apply ]         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.3 The four proof cards

| # | Card | Content | Source | Status |
|---|---|---|---|---|
| 1 | **Issues before and after** | Before count, after count, resolved, **introduced**. A paired bar per category | `issues` in the verification report | GAP-5 (re-detection result, Review D3a) |
| 2 | **Valid cells damaged** | One large number, target 0. If above 0, it is the single most prominent element on the screen, in amber, with a link to the responsible operation and an "Undo" button | `valid_cells_damaged` | GAP-5 (Review D3c) |
| 3 | **Replay check** | Number of operations replayed, input hash, result hash, exported-file hash, match tick. Hashes are short, monospace, with copy | `replay` | GAP-5 (Review D3b) |
| 4 | **Quality score** | Before and after, with a link to how the score is defined | `quality_score` | GAP-5. The formula's documentation is **PLANNED** (a README section the backend teammate writes) |

**Score caution:** the score is a *measure of detector-flagged issues*, not "accuracy". The "how it is computed" link and the "does not prove" panel say so. Without ground truth, accuracy cannot be claimed.

### 8.4 "What this does and does not prove" panel (always visible, collapsible after first view)

| Proves | Does **not** prove |
|---|---|
| Every applied change appears in the log, and replaying the log on the untouched original reproduces the exported file exactly | That each repair is *semantically correct* for your business |
| Re-running the detectors shows fewer issues, and none introduced | That the detectors found *every* problem in your data |
| No cell that was valid under the rules was changed | Anything about problems that no rule can express |
| (Sample dataset only) accuracy against injected errors, measured on a synthetic benchmark | General accuracy on your own data |

This panel is an honesty feature. It is also what makes the proof credible to an informed judge.

### 8.5 Verification states

| State | Trigger | UI |
|---|---|---|
| Locked | Apply has not run | Locked stage, copy: "Apply the plan to run verification" with a link to the Studio |
| Running | `verify` in flight | Four skeleton cards and an indeterminate bar. No fake per-check ticks unless the backend reports them |
| **Verified** | Replay matches, 0 valid cells damaged, 0 issues introduced | Header in emerald with a tick |
| **Verified with notes** | Replay matches but issues remain, or some are refused or pending | Neutral header, "Verified. N issues remain." This is the **normal** outcome, so it must feel fine, not like a partial failure |
| **Verification failed** | Replay mismatch, or valid cells damaged above 0, or issues introduced above 0 | Amber header (a real problem, but DataFix is reporting it honestly), naming the failed check. Primary action "Undo last apply" (CONTRACT undo). Red is not used unless the *request* failed |
| Request failed | Network or 5xx | Red system-failure banner and Retry. Result is "unknown", never "verified" |
| Benchmark absent | Not the sample dataset | The benchmark card is simply not shown. No "N/A" placeholder |
| Benchmark present | Sample dataset and the static benchmark file exists | Card labelled "Synthetic benchmark, precomputed offline", listing precision, recall, abstentions and damage as the generator reports them, plus the date and seed | PLANNED until the generator exists (Review 13.2). The card must always carry the "synthetic" label |

The distinction between **Verified with notes** (normal) and **Verification failed** (a check broke) is important to get right in copy and colour.

---

## 9. Repair history, reproducibility and export

### 9.1 History (the ledger) `/runs/:id/history`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ REPAIR HISTORY     [Applied (11)] [Declined (4)]                            │
│ #   Time      Operation              Column      Cells  Decided by  Evidence │
│ 11  14:02:31  normalise_date         order_date  412    Auto        —        │
│ 10  14:02:31  map_values             city        57     You         94% ⓘ    │
│ …                                                         [ Undo ]          │
├─────────────────────────────────────────────────────────────────────────────┤
│ REPRODUCE THIS RUN                                                          │
│  Input hash     3f9a…c21 (copy)      Engine version  0.1.0 (from recipe)    │
│  Operations     11 (ordered)         Recipe          [ View JSON ] [ Download ]│
│  [ Re-verify now ]     Result: ✔ replay matches (checked 14:05)             │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Element | Source | Status |
|---|---|---|
| Applied tab: ordered operations | `GET /runs/{id}/operations` | GAP-6. Fallback: operations from the current session's `apply` response |
| Columns: seq, time, op, column, cells | GAP-6 | GAP-6 |
| "Decided by": Auto or You | `decided_by` | GAP-6. **"You" means "this browser session"**: there is no authentication, so do not display a user name |
| Evidence at the time | `confidence_at_decision` | GAP-6, GAP-1 |
| Click a row | Opens the original dossier in read-only mode with an *Applied* chip | DERIVED from the proposal |
| **Declined tab** | Refused proposals and rejected approvals | DERIVED from the proposals list |
| **Undo** | `POST /runs/{id}/undo/{op_id}` | CONTRACT. Conflict handling GAP-10 |
| Recipe view and download | Recipe JSON in the export | CONTRACT (Review D3: "export includes a recipe") |
| Input hash and engine version | Recipe or replay payload | GAP-5, GAP-7 |
| **Re-verify now** | `POST /runs/{id}/verify` | CONTRACT |
| "Reproduce locally" command | A CLI to replay a recipe | **PLANNED**; the Review defines an endpoint, not a CLI. The honest alternative is a copyable `curl` for the verify endpoint (DERIVED) |

**Undo interaction:**

1. Click Undo on an operation. A confirmation sheet states: "This removes the operation from the log and rebuilds the dataset by replaying the remaining operations. Your original file is unchanged."
2. On success, the operation disappears from Applied and the proposal returns to **Needs approval** or **Auto-apply (queued)** in the Studio, with the Plan updated. Verification is re-run automatically and Proof is marked stale until it finishes.
3. On conflict (a later operation touches the same cells), show the server message verbatim, with the blocking operations listed and a button to undo those first (GAP-10).

### 9.2 Export `/runs/:id/export`

| File | Description (UI copy) | Source |
|---|---|---|
| Cleaned dataset | "Your data with the applied repairs" | CONTRACT |
| Quality report (HTML and JSON) | "Before and after, with the issues found" | CONTRACT |
| Modification log | "Every change: cell, old value, new value, reason, evidence, confidence" | CONTRACT (Review: cell-level log). Exact columns to confirm |
| Recipe | "The operations in order. Replay them on the original to reproduce the result" | CONTRACT |

| State | UI |
|---|---|
| Not applied | Disabled with "Apply the plan first". Optionally allow exporting the original profile and issue list only if the backend supports it (otherwise omit) |
| Ready | Four rows with size, format and Download; plus "Download all (zip)" if the backend returns a zip |
| Preparing | Per-file spinner |
| Failed | Red system-failure message with Retry |
| After download | Row shows a tick and the time |

A short preview of the first rows of the modification log may be shown inline (DERIVED from the History data). **P2**.

---

## 10. Global states and system messages

| Situation | Treatment | Colour |
|---|---|---|
| Server waking (free hosting cold start) | Banner with elapsed timer and auto-retry | Neutral |
| Server unreachable | Banner with Retry; run pages become read-only if data is cached | **Red** (system failure) |
| AI offline or quota exhausted | Neutral note: "Explanations are rule-based right now." Everything still works (Review 12.4) | Neutral, **not red** |
| Upload too large or unsupported | Inline message naming the rule | Amber for user-correctable input issues |
| Zero issues found | "No issues detected by the current detectors." with a link to the policy drawer | Neutral |
| All proposals refused | Studio banner: "All 6 repairs were refused. Nothing will change. Here's why." Plan's Apply button is disabled with "Nothing to apply" | Guard palette |
| Run not found (404) | "This run is no longer available" and a start-new button | Neutral |
| Browser storage unavailable | Recent-runs list is hidden. Nothing else depends on it | Silent |

**Colour contract (repeated for emphasis):**

| Meaning | Colour | Never use for |
|---|---|---|
| System failure (network, server, parse) | Red | Any decision by DataFix, including Refused |
| DataFix refused or held back | Indigo/violet (guard) | System errors |
| Needs your decision | Amber | Errors |
| Cleared by the gate | Emerald | Diffs |
| Diff before/after | Grey and sky blue | Decisions |
