# DataFix — Frontend Implementation Plan (Phase 1)

**Author:** Antigravity (Frontend Implementation Engineer)  
**Authority:** Akash (Frontend Owner & Technical Lead)  
**Design Authority:** Claude (`docs/FRONTEND_DESIGN_SPEC.md` / `FRONTEND_DESIGN_SPEC.md`)  
**Date:** 19 Nov 2026  
**Status:** Approved for Phase 1 Foundation

---

## 1. Existing Frontend Structure

The repository started with a minimal single-component prototype:

- `frontend/src/App.tsx`: A single 144-line React component housing sidebar navigation, top bar, CSV file picker, and basic profile metric cards and column table.
- `frontend/src/lib/api.ts`: Hand-written TypeScript interfaces (`ColumnProfile`, `DatasetProfile`) and fetch helpers for `checkApiHealth()` and `profileCsv(file)`.
- `frontend/src/styles.css`: 8,400 bytes of custom vanilla CSS with hard-coded colors, fonts (DM Sans / Manrope), and layout rules.
- `frontend/package.json`: Vite 8 + React 19 + TypeScript 5.9. No UI library, router, icon library, or Tailwind CSS configured yet.
- Routing: Currently unrouted (renders only one static view on `/`).

---

## 2. Existing Backend Capabilities & OpenAPI Schema

The current FastAPI backend (`backend/app/main.py`, `backend/app/api/routes.py`, `backend/app/services/profiling.py`) provides:

### Implemented Endpoints
1. `GET /`: Root service discovery endpoint.
2. `GET /health`: Health status endpoint returning `{"status": "ok", "service": "datafix-api", "environment": "development"}`.
3. `POST /api/v1/datasets/profile`: Multipart form upload accepting a single `.csv` file up to 20 MB (`MAX_UPLOAD_BYTES`). Computes read-only deterministic Pandas metrics:
   - `row_count`, `column_count`, `total_cells`, `missing_cells`, `duplicate_rows`
   - Per-column `name`, `data_type`, `missing_count`, `missing_percent`, `distinct_count`
   - Defensive validation: HTTP 415 on non-CSV, HTTP 413 on oversized files, HTTP 422 on empty files, header-only CSVs, malformed delimiters/quotes, or invalid encodings.

### Missing Backend Capabilities (Required for full design)
The backend does **not** yet implement:
- Persistent run creation (`POST /runs` or `POST /api/v1/runs`)
- Issue detection & diagnosis (`POST /runs/{id}/analyze`)
- Repair proposal generation (`RepairProposal`) and Gate simulation (`SimulationReport`, `GateDecision`)
- Proposal approval / rejection endpoints (`POST /runs/{id}/decisions`)
- Repair plan application (`POST /runs/{id}/apply`)
- Post-repair verification & proof replay (`POST /runs/{id}/verify`)
- Operation history & undo (`GET /runs/{id}/operations`, `POST /runs/{id}/undo/{op_id}`)
- Export bundle generation (`GET /runs/{id}/export`)
- Gate policy & threshold inspection (`GET /policy`)

---

## 3. Contract Gaps Analysis (GAP-1 through GAP-10)

| Gap ID | Description | Design Spec Expectation | Current Reality & Frontend Strategy |
| :--- | :--- | :--- | :--- |
| **GAP-1** | Confidence Structure | Structured evidence ledger with `value`, `method`, `components`, `n_support`, `lower_bound`, `caveat`. | Not in backend schema. Frontend will declare the typed contract in `FRONTEND_BACKEND_CONTRACT.md`. For live data where missing, render "Not provided by backend". |
| **GAP-2** | Refusal Classification | Gate refusal kind: `invariant_failed`, `insufficient_evidence`, `kept_as_valid` with evidence gap details. | Not in backend schema. Fallback derives from failing invariants or falls back to generic refusal. Documented for Teammate 3. |
| **GAP-3** | Full Diff & Groups | Pagination offset/limit diff plus kept/removed rows for dedupe/merge. | Currently only profile statistics exist. Frontend will support `sample_diff` and label "Showing N of M". |
| **GAP-4** | Invariant Status & Thresholds | Explicit `status` (`pass`, `fail`, `skipped`), `observed`, `threshold`, and `unit`. | Not in backend. Frontend maps booleans or uses fallback styling. |
| **GAP-5** | Verification Response Shape | Replay hashes, issues resolved/introduced, valid cells damaged, quality score delta. | Not in backend. Proof screen will render honest locked state until `verify` endpoint is delivered. |
| **GAP-6** | Operation History Read Endpoint | `GET /runs/{id}/operations` returning sequential operations log. | Not in backend. History screen displays current-session applied operations as fallback. |
| **GAP-7** | Policy & Limits Endpoint | `GET /policy` returning active gate rules and thresholds. | Not in backend. Frontend uses static configuration mirroring documented rules. |
| **GAP-8** | Dataset Totals & Column Profile | Run object containing `rows`, `columns`, and column data types/null percent. | Partially available in `POST /api/v1/datasets/profile`. Needs binding to persistent run identifier. |
| **GAP-9** | Evidence Structure | Explicitly typed evidence items with metrics and examples. | Not in backend. Frontend will render plain labels and details when provided. |
| **GAP-10** | Decide / Apply / Undo Semantics | Idempotent decision batching, atomic apply results, conflict HTTP 409 on undo. | Not in backend. Documented in `FRONTEND_BACKEND_CONTRACT.md`. |

---

## 4. Proposed Frontend Component Architecture

```
frontend/src/
├── app/
│   ├── routes.tsx                    # Lightweight URL hash or history router
│   ├── AppShell.tsx                  # Topbar, branding, AI/API status, Safety Ribbon, Navigation Rail
│   └── context/
│       ├── RunContext.tsx            # Current run state, profile, and staged decisions
│       └── SystemContext.tsx         # Backend health, AI availability, cold-start waking detection
├── components/
│   ├── common/                       # Reusable UI primitives
│   │   ├── Badge.tsx                 # Semantic status chips (Auto, Approval, Refused, Neutral)
│   │   ├── Button.tsx                # Accessible primary, secondary, ghost, icon buttons
│   │   ├── Card.tsx                  # Standard surface cards with border and elevation
│   │   ├── Modal.tsx                 # Accessible dialogs/sheets
│   │   ├── Tooltip.tsx               # Explanatory tooltips for metrics and limits
│   │   └── StatusDot.tsx             # Pulsing/solid status indicator (API, AI)
│   ├── layout/
│   │   ├── TopBar.tsx                # Dataset filename, sha256, API/AI status dots
│   │   ├── SafetyRibbon.tsx          # Persistent 3-segment bar (Auto, Needs Approval, Refused)
│   │   └── StageRail.tsx             # 4-stage stepper (Intake, Overview, Studio, Proof, History, Export)
│   ├── intake/
│   │   ├── Dropzone.tsx              # Drag-and-drop CSV upload with file validation
│   │   ├── SampleDatasetCard.tsx     # One-click try with sample_data/customers_demo.csv
│   │   ├── WakingServerBanner.tsx    # Cold-start detection banner with elapsed timer
│   │   └── UploadProgress.tsx        # Indeterminate profiling progress indicator
│   ├── studio/                       # Studio components (prepared for Phase 2 integration)
│   │   ├── StudioQueue.tsx           # Left panel: lanes (All, Auto, Approval, Refused)
│   │   ├── RepairCard.tsx            # Queue item card with decision badge and diff snippet
│   │   ├── RepairDossier.tsx         # Center panel: 7-section evidence & blast-radius dossier
│   │   ├── GuardianSeal.tsx          # Refused lane seal & prevented change panel
│   │   └── PlanPanel.tsx             # Right panel: staged apply summary and apply trigger
│   └── proof/                        # Proof components (prepared for Phase 2)
│       ├── ProofCard.tsx             # 4 checkable claim cards
│       └── ClaimsPanel.tsx           # "What this does and does not prove" honesty panel
├── lib/
│   ├── api.ts                        # Typed API client bound to OpenAPI schema
│   ├── generated-types.ts            # Generated from FastAPI /openapi.json via openapi-typescript
│   ├── contract-types.ts             # Proposed Phase 2 contract types (GAP-1 - GAP-10)
│   ├── fixtures.ts                   # Isolated demo fixture data for development/demo mode
│   └── constants.ts                  # Upload limits, default sample definitions, policy constants
└── styles/
    ├── tokens.css                    # Design tokens (colors, spacing, shadows, radius)
    └── index.css                     # Tailwind CSS entry with semantic utility classes
```

---

## 5. Phase 1 Implementation Order

1. **Toolchain & Dependencies:**
   - Install `tailwindcss`, `@tailwindcss/vite`, `lucide-react`, `openapi-typescript`.
   - Configure Tailwind Vite plugin and establish strict semantic CSS tokens.
2. **Contract & Type Generation:**
   - Run `openapi-typescript` against `http://127.0.0.1:8000/openapi.json` to produce `frontend/src/lib/generated-types.ts`.
   - Author `docs/FRONTEND_BACKEND_CONTRACT.md` specifying GAP-1 through GAP-10 for Teammate 3.
3. **Design System & Semantic Palette:**
   - Establish tokens for Emerald (Auto-apply), Amber (Needs approval), Indigo/Violet (Refused / Guardian), Red (System failure only), Sky/Slate (Diff before/after).
4. **Application Shell & Route Infrastructure:**
   - Implement client-side routing supporting `/`, `/runs/:runId/overview`, `/runs/:runId/studio`, `/runs/:runId/proof`, `/runs/:runId/history`, `/runs/:runId/export`.
   - Build `AppShell` with DataFix branding, dataset context header, API health indicator, AI indicator, Stage Rail, and Safety Ribbon.
5. **Intake Page Implementation:**
   - Drag-and-drop CSV upload matching real 20 MB limit.
   - Client-side extension and size validation.
   - Waking server banner with live timer for Render cold-starts.
   - Profiling in-flight indeterminate progress.
   - Sample dataset integration (`customers_demo.csv`).
   - Clean, non-crashing transition from upload to Overview/Studio based on real backend response.
6. **Planned Route Shells:**
   - Overview, Studio, Proof, History, Export routes render honest "Waiting for backend analysis / Apply plan" states when no real run data exists, avoiding fabricated metrics.
7. **Verification & Build:**
   - Verify `tsc --noEmit`, `npm run build`, and live interaction with the running backend.

---

## 6. Files Created or Modified

- **Created Documentation:**
  - `docs/FRONTEND_IMPLEMENTATION_PLAN.md` (this file)
  - `docs/FRONTEND_BACKEND_CONTRACT.md`
- **Created Source Files:**
  - `frontend/src/lib/generated-types.ts`
  - `frontend/src/lib/contract-types.ts`
  - `frontend/src/lib/fixtures.ts`
  - `frontend/src/lib/constants.ts`
  - `frontend/src/styles/tokens.css`
  - `frontend/src/app/routes.tsx`
  - `frontend/src/app/AppShell.tsx`
  - `frontend/src/app/context/RunContext.tsx`
  - `frontend/src/app/context/SystemContext.tsx`
  - `frontend/src/components/layout/TopBar.tsx`
  - `frontend/src/components/layout/SafetyRibbon.tsx`
  - `frontend/src/components/layout/StageRail.tsx`
  - `frontend/src/components/intake/Dropzone.tsx`
  - `frontend/src/components/intake/SampleDatasetCard.tsx`
  - `frontend/src/components/intake/WakingServerBanner.tsx`
  - `frontend/src/components/common/Badge.tsx`
  - `frontend/src/components/common/Button.tsx`
  - `frontend/src/components/common/Card.tsx`
  - `frontend/src/pages/IntakePage.tsx`
  - `frontend/src/pages/OverviewPage.tsx`
  - `frontend/src/pages/StudioPage.tsx`
  - `frontend/src/pages/ProofPage.tsx`
  - `frontend/src/pages/HistoryPage.tsx`
  - `frontend/src/pages/ExportPage.tsx`
- **Modified Source Files:**
  - `frontend/package.json` (add dependencies)
  - `frontend/vite.config.ts` (Tailwind integration)
  - `frontend/src/main.tsx` (mount App with context and router)
  - `frontend/src/styles.css` (import tokens and Tailwind directives)
  - `frontend/src/lib/api.ts` (integrate generated types and robust error handlers)
