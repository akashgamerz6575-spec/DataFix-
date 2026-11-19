# DATAFIX — IMPLEMENTATION READINESS & REPOSITORY COMPATIBILITY REPORT

**Report Date:** 19 November 2026  
**Auditor:** Antigravity (Implementation Engineer)  
**Target Specification:** `docs/research/datafix_master_design_spec.md` (Version 1.1)  
**Target Codebase:** `d:\DataFix` (Vite + React 19 + Tailwind CSS v4 + FastAPI)  
**Audience:** ChatGPT (Product & Architectural Authority) & Akash (Frontend Owner)  
**Status:** Audit Complete — Zero code modified, zero dependencies installed, zero contracts changed.

---

## 1. Executive Summary

This report establishes the implementation readiness of the DataFix repository against **DATAFIX_MASTER_DESIGN_SPEC.md (Version 1.1)**. 

### Key Audit Findings:
1. **Routing Compatibility (100% Non-Breaking):** Adding `/welcome` is purely additive and can be mounted without modifying or colliding with any existing run routes, hash bookmarks, or intake flows.
2. **Screen Count Correction (6 Implemented vs. 7 Specified):** The codebase currently implements **6 screens** (`Intake`, `Overview`, `Studio`, `Proof`, `History`, `Export`). **`Dataset Explorer` DOES NOT EXIST** in the codebase and represents a completely new screen.
3. **Backend Capability Reality (Only Profiling is Live):** The FastAPI backend currently implements only 3 endpoints: `GET /`, `GET /health`, and `POST /api/v1/datasets/profile`. No endpoints exist for repair proposals, LLM diagnosis, invariant simulation, plan execution, verification, audit history, or export downloads.
4. **Fixture / Live-Data Isolation (Solid):** The frontend already enforces rigorous provenance separation via `isDemoFixture` in `RunContext.tsx`, preventing secret substitution of mock data during live runs.
5. **Tailwind v4 & Dependencies:** The project uses modern Tailwind CSS v4 with `@theme` in `styles/tokens.css`. `lucide-react` is already installed. The dual-surface token system specified in Section 7 of the spec can be integrated directly into `@theme`.
6. **Overall Readiness:** The repository is **immediately ready** for Phase 0 (Design Tokens, Typography, and `AppShell` visual polish), Phase 1 (Repair Studio & Proof visual overhaul using fixtures), and Phase 4 (Experience A `/welcome` marketing page and 8-stage interactive demonstration). Phase 2 (Dataset Explorer) requires building the new grid from scratch.

---

## 2. Verification 1: Routing System, Deep Links, and `/welcome` Mount

### 2.1 Existing Router Architecture
- **Router Implementation File:** [frontend/src/app/routes.tsx](file:///d:/DataFix/frontend/src/app/routes.tsx)
- **Framework Type:** Lightweight custom hash-based / path-based router using React Context (`RouterProvider`, `useRouter`). **Note:** The project does not currently use `react-router-dom` packages; it uses an in-house router tailored to SPA tab switches and hash parameters.
- **Configured Routes (`RoutePath` Union):**
  - `'/'` → Default intake flow
  - `'/runs/:runId/overview'` → Dataset health overview
  - `'/runs/:runId/studio'` → Repair Studio (3-panel workspace)
  - `'/runs/:runId/proof'` → Verification proof
  - `'/runs/:runId/history'` → Audit history ledger
  - `'/runs/:runId/export'` → Artifact download center

### 2.2 Deep Links & Hash Parameter Handling
In [frontend/src/app/context/RunContext.tsx](file:///d:/DataFix/frontend/src/app/context/RunContext.tsx#L36-L40), the application initializes state directly from deep links:
- `window.location.hash.includes('run_demo_01')` → Automatically mounts `DEMO_RUN_FIXTURE` with `isDemoFixture = true`.
- `window.location.hash.includes('run_live_real')` → Mounts a live test run state.
- `localStorage` persistence (`datafix_active_run`, `datafix_is_fixture`) preserves session state across page reloads.

### 2.3 Confirmation: Safe Addition of `/welcome`
In [frontend/src/app/routes.tsx](file:///d:/DataFix/frontend/src/app/routes.tsx#L36-L50), `parsePath` extracts `cleanPath`. Any path not matching `/runs/:runId/...` returns `{ path: cleanPath, params }`.
- **Verdict: 100% Safe and Non-Breaking.**
- Adding `| '/welcome'` to `RoutePath` in `routes.tsx` allows the router to recognize `/welcome`.
- In [frontend/src/app/AppShell.tsx](file:///d:/DataFix/frontend/src/app/AppShell.tsx#L16-L31), when `routeState.path === '/welcome'`, the app can conditionally render `<MarketingLayout />` (bypassing `TopBar`, `SafetyRibbon`, and `StageRail`), leaving all existing routes and deep links completely intact.

---

## 3. Verification 2: Existing Screens & Components vs. Proposed Spec

### 3.1 Screen Status Audit

| Screen Name | Pipeline Stage | Implementation Status | Existing File Reference | Notes & Gaps |
| :--- | :--- | :--- | :--- | :--- |
| **Intake** | `1. Detect (Ingest)` | **Already Implemented** | [frontend/src/pages/IntakePage.tsx](file:///d:/DataFix/frontend/src/pages/IntakePage.tsx) | Live CSV dropzone, format check, waking server banner, and fixture card. Needs preview table polish. |
| **Overview** | `1. Detect → 2. Diagnose` | **Already Implemented** | [frontend/src/pages/OverviewPage.tsx](file:///d:/DataFix/frontend/src/pages/OverviewPage.tsx) | Health KPI cards, column profile table from backend. Needs `QualityScoreDial` SVG radial dial. |
| **Dataset Explorer** | `1. Detect → 2. Diagnose` | **DOES NOT EXIST** | *None* | **Must be built from scratch as a new page.** Requires virtualized grid, column health bars, and contextual inspector. |
| **Repair Studio** | `3. Propose → 5. Gate` | **Already Implemented** | [frontend/src/pages/StudioPage.tsx](file:///d:/DataFix/frontend/src/pages/StudioPage.tsx) | Full 3-panel architecture (Queue, Dossier, Plan) exists. Needs dual-surface visual polish and diff styling. |
| **Proof** | `7. Verify` | **Already Implemented** | [frontend/src/pages/ProofPage.tsx](file:///d:/DataFix/frontend/src/pages/ProofPage.tsx) | Before/after metrics, invariants table, sample diff. Needs radial score gain dial and Indigo refusal badge. |
| **History** | `7. Verify (Audit)` | **Already Implemented** | [frontend/src/pages/HistoryPage.tsx](file:///d:/DataFix/frontend/src/pages/HistoryPage.tsx) | Vertical timeline and event detail drawer exist. Currently fixture-backed. |
| **Export** | `7. Deliver` | **Already Implemented** | [frontend/src/pages/ExportPage.tsx](file:///d:/DataFix/frontend/src/pages/ExportPage.tsx) | Artifact cards with download triggers. Explicitly flags fixture mode. |
| **Welcome / Marketing** | `Product Intro` | **Proposed New Screen** | *None* | Proposed in Master Spec for `/welcome`. To be implemented in Phase 4. |

### 3.2 Component Architecture Audit

```
EXISTING COMPONENTS (10 Total):
├── common/
│   ├── Badge.tsx           (Semantic status badges)
│   ├── Button.tsx          (Primary, outline, ghost variants)
│   ├── Card.tsx            (Generic container card)
│   └── StatusDot.tsx       (Color dot indicator)
├── intake/
│   ├── Dropzone.tsx        (Drag-and-drop file upload target)
│   ├── SampleDatasetCard.tsx (Demo dataset selector)
│   └── WakingServerBanner.tsx (Render cold-start notice)
└── layout/
    ├── SafetyRibbon.tsx    (3-way count ribbon)
    ├── StageRail.tsx       (Left-hand vertical navigation rail)
    └── TopBar.tsx          (Top command bar with provenance pill)
```

**Proposed Components To Be Created (Spec Section 10):**
- **Domain:** `SafetyDecisionBadge.tsx`, `FixtureProvenanceBanner.tsx`, `QualityScoreDial.tsx`, `ColumnHealthBar.tsx`, `DiffViewer.tsx`, `InvariantCheckList.tsx`, `RepairDossierCard.tsx`, `VirtualDataGrid.tsx`.
- **Marketing (`/welcome`):** `MarketingLayout.tsx`, `HeroSection.tsx`, `FailureTaxonomyStrip.tsx`, `GuidedDemoSection.tsx`, `ScrollBeamSvg.tsx`, `ApproachComparison.tsx`.
- **UI Primitives:** `Tabs.tsx`, `Drawer.tsx`, `EmptyState.tsx`, `Skeleton.tsx`.

---

## 4. Verification 3: Actual FastAPI Endpoints & OpenAPI Schema

### 4.1 Exhaustive Backend Endpoint Inventory
- **Backend Entrypoint:** [backend/app/main.py](file:///d:/DataFix/backend/app/main.py)
- **API Router:** [backend/app/api/routes.py](file:///d:/DataFix/backend/app/api/routes.py)
- **Profiling Engine:** [backend/app/services/profiling.py](file:///d:/DataFix/backend/app/services/profiling.py)

| Method | Endpoint Path | Function Name | Request Type | Implemented Response Schema | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | `root` | None | `{"service": str, "docs": str, "health": str}` | **Live** |
| `GET` | `/health` | `health` | None | `{"status": str, "service": str, "environment": str}` | **Live** |
| `POST` | `/api/v1/datasets/profile` | `create_dataset_profile` | `multipart/form-data` (`file: UploadFile`) | `{"status": "profiled", "profile": DatasetProfile}` | **Live** |

### 4.2 Actual `DatasetProfile` Schema (Returned by Backend)
```json
{
  "filename": "string",
  "row_count": 0,
  "column_count": 0,
  "total_cells": 0,
  "missing_cells": 0,
  "duplicate_rows": 0,
  "columns": [
    {
      "name": "string",
      "data_type": "string",
      "missing_count": 0,
      "missing_percent": 0.0,
      "distinct_count": 0
    }
  ],
  "notes": ["string"]
}
```

### 4.3 Unimplemented Backend Capabilities (Contract-Dependent)
The following endpoints and capabilities referenced in Spec Section 12.2 do **not** exist in the backend:
1. `GET /api/v1/runs/:runId` or `GET /api/v1/runs` (No run persistence in database/Supabase).
2. `GET /api/v1/datasets/:datasetId/rows` (No endpoint to stream or paginate raw/parsed CSV rows).
3. `POST /api/v1/repairs/diagnose` or `GET /api/v1/repairs/proposals` (No LLM diagnosis or heuristic rule engine).
4. `POST /api/v1/repairs/simulate` (No invariant checking or before/after diff computation).
5. `POST /api/v1/repairs/apply` (No working-copy mutation engine).
6. `POST /api/v1/verification/verify` (No closed-loop re-profiling or proof generation).
7. `GET /api/v1/audit/history` (No cryptographic hash chain or audit log persistence).
8. `GET /api/v1/export/bundle` (No zip/csv bundle generation).

---

## 5. Verification 4: Existing Frontend API Client & State Management

### 5.1 API Client Implementation
- **File:** [frontend/src/lib/api.ts](file:///d:/DataFix/frontend/src/lib/api.ts)
- **Functions:**
  - `checkApiHealth()` → Queries `GET /health` with a 6-second abort controller. Detects waking cold-starts on Render.
  - `profileDataset(file)` → Posts `multipart/form-data` to `POST /api/v1/datasets/profile`.
- **Environment Base URL:** `import.meta.env.VITE_API_BASE_URL` (defaulting to `http://127.0.0.1:8000`).

### 5.2 State Management Architecture
- **Contexts:**
  - [frontend/src/app/context/SystemContext.tsx](file:///d:/DataFix/frontend/src/app/context/SystemContext.tsx) → Tracks backend `online`, `waking`, and `lastChecked`.
  - [frontend/src/app/context/RunContext.tsx](file:///d:/DataFix/frontend/src/app/context/RunContext.tsx) → Manages `currentRun: RunState | null`, `isDemoFixture: boolean`, decision updates, and application plan counters.
- **Contract Types:** [frontend/src/lib/contract-types.ts](file:///d:/DataFix/frontend/src/lib/contract-types.ts)
  - Explicitly defines TypeScript interfaces for `DatasetProfile`, `ColumnProfile`, `DataIssue`, `RepairProposal`, `ConfidenceScore`, `SimulationResult`, and `RunState`.

---

## 6. Verification 5: Tailwind Configuration, Tokens, Dependencies & Fonts

### 6.1 Tailwind CSS Version & Theme Setup
- **Version:** Tailwind CSS **v4.3.5** (`@tailwindcss/vite: ^4.3.5`).
- **Configuration Mechanism:** In Tailwind v4, there is no `tailwind.config.js`. Themes are configured directly in CSS via `@theme` inside [frontend/src/styles/tokens.css](file:///d:/DataFix/frontend/src/styles/tokens.css).
- **Existing Semantic Gate Colors:**
  - `--color-auto-*` (Emerald `#10B981` / `#059669`)
  - `--color-approval-*` (Amber `#F59E0B` / `#D97706`)
  - `--color-guard-*` (Indigo/Violet `#6366F1` / `#4F46E5` / `#312E81`)
  - `--color-system-err-*` (Red `#EF4444` / `#DC2626`)
- **Missing Token Categories:**
  - Dual-surface tokens from Spec Section 7.1 (`--surface-light-canvas`, `--surface-dark-canvas`, `--surface-mint-hero`, `--surface-dark-dramatic`, `--border-light-subtle`, `--border-dark-subtle`). These can be added cleanly into `@theme` without conflict.

### 6.2 Fonts & Typography
- **Current Configuration:**
  - `--font-sans: "DM Sans", "Manrope", system-ui, -apple-system, sans-serif;`
  - `--font-mono: "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;`
- **Spec Requirements:**
  - Display Font: **Outfit** (for Marketing `/welcome` headings)
  - Interface Font: **Inter** (for in-app application typography)
  - Code/Data Font: **JetBrains Mono**
- **Action Required:** Neither `Outfit` nor `Inter` is currently imported in `frontend/index.html`. They should be added via Google Fonts `<link>` tags in `index.html`.

### 6.3 Package Dependencies
- **Already Installed in `package.json`:**
  - `react`: `^19.3.1`
  - `react-dom`: `^19.3.1`
  - `lucide-react`: `^1.75.0` (**Verified — already available**)
  - `tailwindcss`: `^4.3.5`
  - `typescript`: `^5.9.0`
  - `vite`: `^8.3.8`
- **Missing Optional Packages:**
  - `@tanstack/react-virtual` is **not installed**. If virtualized row scrolling for 50k rows in Dataset Explorer is required, it must either be installed in Phase 2 or implemented cleanly.

---

## 7. Verification 6: Fixture vs. Live-Data Separation

### 7.1 Separation Integrity Audit
The repository strictly respects Engineering Rule 10 (synthetic demo data only) and Rule 8 (provenance tracking):
1. **Fixture Isolation:** All demo data resides in [frontend/src/lib/fixtures.ts](file:///d:/DataFix/frontend/src/lib/fixtures.ts) as `DEMO_RUN_FIXTURE`.
2. **Provenance Tracking:** `RunContext.tsx` sets `isDemoFixture = true` for sample datasets, and `isDemoFixture = false` when a real CSV is profiled through `profileDataset()`.
3. **UI Transparency:**
   - [TopBar.tsx](file:///d:/DataFix/frontend/src/components/layout/TopBar.tsx#L40-L46) renders an Amber outline pill `[DEV FIXTURE]` when in fixture mode and an Emerald pill `[LIVE API]` when backed by a live run.
   - [SafetyRibbon.tsx](file:///d:/DataFix/frontend/src/components/layout/SafetyRibbon.tsx#L32-L42) displays an explicit warning whenever fixture mode is active.
   - [ExportPage.tsx](file:///d:/DataFix/frontend/src/pages/ExportPage.tsx#L55-L65) disables live export claims and states that downloads reflect development fixtures.
4. **Zero Secret Fallback:** In live mode, `issues: []` and `proposals: []`. The UI does **not** secretly inject `DEMO_RUN_FIXTURE` when live endpoints are absent. It presents clear empty states.

---

## 8. Compatibility Matrix

| Spec Requirement | Existing Implementation | Backend Dependency | Required Action | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **Additive `/welcome` Route** | Custom Router in `routes.tsx` handles `/runs/...` and default `/`. | None | Add `| '/welcome'` to `RoutePath`; render `MarketingLayout` when path matches. | **P0 (Phase 0)** |
| **Dual-Surface Theme Tokens** | `tokens.css` has gate colors and single-surface tokens. | None | Add Spec Section 7 `--surface-*` and `--border-*` tokens into `@theme`. | **P0 (Phase 0)** |
| **Typography (`Outfit` & `Inter`)** | `tokens.css` uses `DM Sans`. | None | Add Google Fonts link in `index.html`; update `--font-sans` and `--font-display`. | **P0 (Phase 0)** |
| **`AppShell` Light/Dark Balance** | `StageRail` & `TopBar` are dark slate; content is light slate. | None | Minor polish to match exact spec tokens (`#0F172A` topbar, `#0B111E` rail). | **P0 (Phase 0)** |
| **Safety Decision Badges** | `Badge.tsx` has basic variants. | None | Create `SafetyDecisionBadge.tsx` supporting light/dark surfaces and icons. | **P0 (Phase 0)** |
| **Repair Studio 3-Panel Polish** | Fully working 3 panels in `StudioPage.tsx` using fixtures. | None for UI polish; Backend required for live proposals. | Refine diff highlights (`DiffViewer`), add caution hatching, polish application plan. | **P1 (Phase 1)** |
| **Proof Screen & Refusal Count** | Implemented in `ProofPage.tsx` with delta calculations. | None for UI; Backend required for live replay. | Add `QualityScoreDial`, enforce Indigo refusal badge (*"Preserved safely"*). | **P1 (Phase 1)** |
| **Overview Screen Polish** | Implemented in `OverviewPage.tsx` with live/fixture toggle. | Live `POST /profile` already feeds this. | Add `QualityScoreDial` and link to Repair Studio. | **P2 (Phase 2)** |
| **Dataset Explorer Grid** | **DOES NOT EXIST.** | Needs rows endpoint for live data; can parse client CSV or use fixture. | Build new `DatasetExplorerPage.tsx`, sticky column headers, and inspector drawer. | **P2 (Phase 2)** |
| **History Operational Timeline** | Implemented in `HistoryPage.tsx` with fixture data. | Backend audit log endpoint missing. | Polish timeline styling, retain explicit disclaimer on cryptographic hashes. | **P3 (Phase 3)** |
| **Export Screen Artifact Cards** | Implemented in `ExportPage.tsx`. | Backend artifact downloads missing. | Retain `Unavailable` disabled state for unimplemented downloads per Spec 12.2. | **P3 (Phase 3)** |
| **Experience A (`/welcome`) Page** | **DOES NOT EXIST.** | None (Driven by client-side sample state machine). | Build `HeroSection`, `TaxonomyStrip`, `GuidedDemoSection` (8 stages), and `ApproachComparison`. | **P4 (Phase 4)** |
| **Performance & A11y Targets** | Standard React render without profiling. | None | Phase 5 Lighthouse audit, WCAG contrast verification, reduced-motion testing. | **P5 (Phase 5)** |

---

## 9. Feature Categorization & Scope Analysis

### Category A: Features Ready for Immediate Implementation (Zero Backend Dependency)
These features depend purely on frontend presentation, client-side state machines, or existing fixture adapters:
1. **Experience A (`/welcome`):** The entire marketing landing page, including the Hero, 5-class detection taxonomy strip, approach comparison, and the **8-Stage Sticky Product Demonstration** (`GuidedDemoSection` + `ScrollBeamSvg`). As mandated in Spec Section 5.1, this runs on an explicit, self-contained client-side sample state machine (`orders_demo_sample.csv`).
2. **Design System & Token Expansion:** Injecting the dual-surface tokens (`--surface-light-*`, `--surface-dark-*`) into `tokens.css` and loading `Outfit` + `Inter` in `index.html`.
3. **AppShell Refinement:** Updating navigation chrome to crisp `#0F172A` / `#0B111E` with active step indicators and routing bridge to `/welcome`.
4. **Repair Studio Visual & Diff Overhaul:** Upgrading `StudioPage.tsx` with the structured `RepairDossierCard`, light-surface token diffs, amber caution hatching, and sticky application plan.
5. **Proof Screen Visual Upgrade:** Adding the animated radial `QualityScoreDial` and prominent Indigo refusal badge.
6. **Reusable Design Primitives:** Building `SafetyDecisionBadge`, `FixtureProvenanceBanner`, `DiffViewer`, `Tabs`, `Drawer`, and `EmptyState`.

### Category B: Features Gated Behind Future Backend Integration
These features can only be fully wired when Teammate 3 delivers corresponding backend endpoints:
1. **Live Repair Proposals & LLM Diagnosis:** Generating real proposal dossiers for uploaded datasets (requires `POST /api/v1/repairs/diagnose`).
2. **Live Before/After Simulation:** Computing cell diffs and invariant pre-checks on raw data (requires `POST /api/v1/repairs/simulate`).
3. **Working Copy Mutation:** Applying approved repair plans to an isolated dataset copy (requires `POST /api/v1/repairs/apply`).
4. **Closed-Loop Verification Replay:** Re-profiling the working copy and checking schema invariants (requires `POST /api/v1/verification/verify`).
5. **Persistent Audit History:** Storing historical runs, operations, and actors in a persistent database (requires Supabase / PostgreSQL persistence).
6. **Live Bundle Exports:** Downloading genuine repaired CSVs, PDF compliance certificates, or JSON audit logs.

### Category C: New Features Requiring Additional Engineering Scope
1. **Dataset Explorer (Screen 3):**
   - *Scope:* This screen does not exist anywhere in the codebase.
   - *Technical Consideration:* To inspect large datasets (up to 50,000 rows as targeted in Section 11.2) on the frontend without a backend pagination endpoint, the frontend would need to read and parse the raw CSV file in the browser (e.g., via PapaParse or Web Worker) or install `@tanstack/react-virtual` for virtualized rendering.
   - *Recommendation:* Scope Dataset Explorer for Phase 2 as planned, using a bounded client-side preview slice (e.g., 500 rows) or fixture data until a streaming rows endpoint is added.

---

## 10. Summary and Sign-Off for ChatGPT Review

- **Zero Breaking Risks:** The existing routing, API client, and live CSV profiling flow are completely preserved.
- **Architectural Alignment:** The master specification's dual-surface visual strategy (dark navigation chrome + light operational content surfaces) matches DataFix's existing ergonomic implementation.
- **Honesty & Provenance Enforced:** The plan adheres strictly to zero-fabrication rules: live mode displays genuine backend results only, while sample data and development fixtures carry prominent, unambiguous badging.
- **Recommended Next Step:** Upon approval of this readiness report by ChatGPT and Akash, proceed to **Phase 0** (Design Tokens, Typography, and Foundation Components).
