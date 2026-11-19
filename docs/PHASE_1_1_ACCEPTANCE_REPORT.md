# DataFix — Phase 1.1: Frontend Stabilisation and Acceptance Audit Report

**Audit Date:** 19 Nov 2026  
**Auditor:** Antigravity (Implementation Engineer)  
**Lead Authority:** Akash (Frontend Owner & Lead Architect)  
**Design Authority:** Claude (`docs/FRONTEND_DESIGN_SPEC.md`)  
**Status:** **ACCEPTED & STABLE**

---

## 1. Files Inspected

Every newly created component, layout element, page, and contract adapter in the repository was inspected in detail:

| Area | Files Inspected |
| :--- | :--- |
| **Application Shell & Layout** | `frontend/src/app/AppShell.tsx`, `frontend/src/components/layout/TopBar.tsx`, `frontend/src/components/layout/SafetyRibbon.tsx`, `frontend/src/components/layout/StageRail.tsx` |
| **Routing & State Context** | `frontend/src/app/routes.tsx`, `frontend/src/app/context/RunContext.tsx`, `frontend/src/app/context/SystemContext.tsx` |
| **Intake Page & Upload** | `frontend/src/pages/IntakePage.tsx`, `frontend/src/components/intake/Dropzone.tsx`, `frontend/src/components/intake/SampleDatasetCard.tsx`, `frontend/src/components/intake/WakingServerBanner.tsx` |
| **Overview Screen** | `frontend/src/pages/OverviewPage.tsx` |
| **Repair Studio** | `frontend/src/pages/StudioPage.tsx` |
| **Proof, History, Export** | `frontend/src/pages/ProofPage.tsx`, `frontend/src/pages/HistoryPage.tsx`, `frontend/src/pages/ExportPage.tsx` |
| **Design Tokens & Styles** | `frontend/src/styles/tokens.css`, `frontend/src/styles.css` |
| **Common UI Primitives** | `frontend/src/components/common/Badge.tsx`, `frontend/src/components/common/Button.tsx`, `frontend/src/components/common/Card.tsx`, `frontend/src/components/common/StatusDot.tsx` |
| **API Client & Contracts** | `frontend/src/lib/api.ts`, `frontend/src/lib/constants.ts`, `frontend/src/lib/contract-types.ts`, `frontend/src/lib/fixtures.ts`, `frontend/src/lib/generated-types.ts` |
| **Configuration** | `frontend/.env.example`, `frontend/.env`, `frontend/package.json`, `frontend/vite.config.ts`, `frontend/tsconfig.json` |

---

## 2. Problems Discovered During Audit

1. **State Persistence on Browser Reload / Deep Links:**
   - *Issue:* When users reloaded the page or navigated directly to `#/runs/run_demo_01/studio`, the React memory context reset to `null`, resulting in an unexpected "No active run loaded" message.
2. **Safety Ribbon to Studio Lane Parameter Synchronization:**
   - *Issue:* In `StudioPage.tsx`, `activeLane` was initialized only on mount (`useState(initialLane)`). Clicking the Safety Ribbon segments (`Auto-apply`, `Needs approval`, `Refused`) updated the URL hash, but the active queue lane did not switch unless the page was re-mounted.
3. **Safety Ribbon Proportional Bar:**
   - *Issue:* Segment buttons displayed text counts, but the proportional visual progress bar specified in Claude's spec (`[██████ 9 Auto-apply][████ 5 Needs approval][███ 4 Refused]`) was missing visual proportional width feedback.
4. **Fixture Mode Ambiguity in Studio Panel:**
   - *Issue:* While the global TopBar showed the amber fixture badge, the Studio Application Plan panel did not indicate that the proposals shown were development fixtures.
5. **Contract Type Demarcation:**
   - *Issue:* `contract-types.ts` lacked explicit demarcation between live generated backend OpenAPI types and proposed future contract models (GAP-1 to GAP-10).
6. **Environment Variable Guidance:**
   - *Issue:* `frontend/.env.example` lacked detailed instructions for local development vs. Vercel production deployment and needed prominent security warnings.

---

## 3. Problems Fixed

1. **Persistent Run Storage (`RunContext.tsx`):**
   - Implemented `localStorage` synchronization for active run state with fallback safety.
   - Added direct deep-link initialization so URLs referencing `#/runs/run_demo_01/...` immediately load the walkthrough fixture without losing state.
2. **Synchronized Route Parameters (`StudioPage.tsx`):**
   - Added `useEffect` listening to `routeState.params?.lane` and `routeState.params?.proposal`.
   - Clicking Safety Ribbon buttons or deep-linking immediately switches the queue lane and selects the targeted proposal.
3. **Proportional Visual Ribbon Bar (`SafetyRibbon.tsx`):**
   - Added a proportional 4px multi-segment bar displaying Emerald, Amber, and Indigo segments sized proportionally to active proposal tallies.
4. **Explicit Fixture Callout (`StudioPage.tsx`):**
   - Added an amber notice inside the Application Plan panel: *"Notice: Viewing development fixture for design evaluation."*
5. **Structured Contract Type Architecture (`contract-types.ts`):**
   - Re-exported generated types from `generated-types.ts`.
   - Explicitly divided file into **Tier 1 (Generated Backend Models)**, **Tier 2 (Implemented Milestone 1 Models)**, **Tier 3 (Proposed Milestone 2 Contract GAPs)**, and **Tier 4 (Application State)**.
6. **Environment Documentation (`frontend/.env.example`):**
   - Documented local (`http://127.0.0.1:8000`) and Vercel production (`https://...onrender.com`) settings, explicitly emphasizing that zero credentials belong in frontend environment variables.

---

## 4. Build and Test Results

### 4.1 Strict TypeScript Check & Production Build
```powershell
Set-Location frontend
npm run build
```
- **Exit Code:** `0`
- **TypeScript Errors:** `0`
- **Output:**
  - `dist/index.html`: `0.55 kB`
  - `dist/assets/index-BAsAYWOm.css`: `37.56 kB`
  - `dist/assets/index-BuajIuqp.js`: `296.41 kB`
- **Build Duration:** `475ms`

### 4.2 Live API Integration Verification
- **`GET http://127.0.0.1:8000/health`:**
  - HTTP 200 OK `{"status": "ok", "service": "datafix-api", "environment": "development"}`
  - TopBar displays `API online` with pulsing green indicator.
- **`POST http://127.0.0.1:8000/api/v1/datasets/profile`:**
  - Upload of `sample_data/customers_demo.csv` returns HTTP 200 with 5 rows, 6 columns, 30 cells, 3 missing cells, 1 duplicate row.
  - Correctly transitions to `/runs/:runId/overview` without error or fixture fallback.
- **Negative Testing:**
  - Non-CSV rejection: HTTP 415 handled gracefully by Dropzone client-side check & backend fallback.
  - File limit: 20 MB ceiling enforced.
  - Network drop: Red error banner rendered without falling back to mock data.

---

## 5. Visual Acceptance Screenshots

Automated headless Chromium captures were performed at **1280 × 720** and **1440 × 900** desktop resolutions:

| Screen / State | Resolution | File Location | Fixture or Live Data | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Intake Page** | 1280 × 720 | [01_intake_1280x720.png](file:///d:/DataFix/docs/screenshots/01_intake_1280x720.png) | Live System | Drag-and-drop, API status, StageRail |
| **Intake Page** | 1440 × 900 | [01_intake_1440x900.png](file:///d:/DataFix/docs/screenshots/01_intake_1440x900.png) | Live System | Desktop widescreen layout |
| **Overview Screen** | 1440 × 900 | [02_overview_1440x900.png](file:///d:/DataFix/docs/screenshots/02_overview_1440x900.png) | Fixture Data | Metric cards, Column profile table, Safety Ribbon |
| **Overview Screen (Real API)** | 1440 × 900 | [08_overview_live_api_1440x900.png](file:///d:/DataFix/docs/screenshots/08_overview_live_api_1440x900.png) | **Live API Data** | Real Pandas profiling metrics, no fixture badge |
| **Repair Studio (3-panel)** | 1440 × 900 | [03_studio_1440x900.png](file:///d:/DataFix/docs/screenshots/03_studio_1440x900.png) | Fixture Data | Queue, Dossier, Plan, Before/After Diff |
| **Repair Studio (1280px)** | 1280 × 720 | [03_studio_1280x720.png](file:///d:/DataFix/docs/screenshots/03_studio_1280x720.png) | Fixture Data | Verified responsive layout at 1280px width |
| **Refused Repair Card** | 1440 × 900 | [04_refused_card_1440x900.png](file:///d:/DataFix/docs/screenshots/04_refused_card_1440x900.png) | Fixture Data | **Guardian treatment**: hatch pattern, zero red, reason |
| **Proof Screen (Locked)** | 1440 × 900 | [05_proof_1440x900.png](file:///d:/DataFix/docs/screenshots/05_proof_1440x900.png) | Live State | Honest locked state before plan is applied |
| **Proof Screen (Verified)** | 1440 × 900 | [05_proof_verified_1440x900.png](file:///d:/DataFix/docs/screenshots/05_proof_verified_1440x900.png) | Fixture Data | 4 Claims + "What this does and does not prove" |
| **Repair History Ledger** | 1440 × 900 | [06_history_1440x900.png](file:///d:/DataFix/docs/screenshots/06_history_1440x900.png) | Fixture Data | Applied operations & deterministic JSON recipe |
| **Export Bundle** | 1440 × 900 | [07_export_1440x900.png](file:///d:/DataFix/docs/screenshots/07_export_1440x900.png) | Fixture Data | Cleaned CSV, Log, Recipe, Quality Report |
| **Studio Live Empty State** | 1440 × 900 | [09_studio_live_empty_1440x900.png](file:///d:/DataFix/docs/screenshots/09_studio_live_empty_1440x900.png) | **Live API Data** | Honest "in development by Teammate 3" message |

---

## 6. Actual Working Frontend Functionality (Real Backend)

1. **Service Connectivity:**
   - Real-time polling of `GET /health` with abort signal timeout and cold-start detection.
   - Live status dots in header: Green ("API online"), Amber ("API waking"), Red ("API unreachable").
2. **Dataset Intake & Profiling:**
   - Real CSV file drag-and-drop and manual file picker.
   - Enforces 20 MB size ceiling and `.csv` extension verification.
   - Real multipart upload to `POST /api/v1/datasets/profile`.
   - Real-time elapsed timer during profiling requests.
3. **Overview Results Display:**
   - Renders actual row count (5), column count (6), total cells (30), missing cells (3), and duplicate rows (1) returned by Pandas.
   - Renders per-column data types, missing counts, missing percentages, and distinct value counts.
   - Displays real backend notes (`"This is an initial profile only..."`).
4. **Navigation Shell & Safety Gates:**
   - Hash-based URL routing (`/`, `/runs/:id/overview`, `/runs/:id/studio`, etc.).
   - Locked stage enforcement (Proof and Export locked until plan is applied).
   - Real error banners on 413, 415, and 422 API responses.

---

## 7. Fixture-Only Functionality (Clearly Labelled)

The following UI capabilities currently run in isolated fixture mode for design review until Teammate 3 delivers corresponding backend endpoints:

1. **Three-Lane Proposal Queue:** Auto-apply, Needs approval, and Refused lanes.
2. **Interactive Repair Dossier:** Character-level diffs (`C003` → `∅ removed`), Blast-radius calculations, Safety invariant checklists.
3. **Guardian Refusal UI:** Prevention notice, zero-fabrication invariant, "Why can't I override?" dialog.
4. **Closed-Loop Proof Verification:** 4 checkable claim cards and epistemic boundaries panel.
5. **History Ledger & Replay:** Sequential operation log and JSON recipe export.

*All screens using fixture data display the prominent amber banner:* `DEVELOPMENT / DEMO DATA (ISOLATED FIXTURE)`.

---

## 8. Outstanding Dependencies on Teammate 3

Before Phase 2 can replace the development fixtures with live backend data, Teammate 3 must implement:

1. **`POST /api/v1/runs`:** Persistent run creation from upload.
2. **`POST /api/v1/runs/{id}/analyze`:** Automated issue detection, hypothesis generation, and repair proposal generation.
3. **`POST /api/v1/runs/{id}/decisions`:** Batch recording of human approval/rejection.
4. **`POST /api/v1/runs/{id}/apply`:** Atomic application of approved repairs to a separate working copy.
5. **`POST /api/v1/runs/{id}/verify`:** Verification replay against the untouched original file.
6. **Contract Gaps Alignment:** Review and sign off on [FRONTEND_BACKEND_CONTRACT.md](file:///d:/DataFix/docs/FRONTEND_BACKEND_CONTRACT.md) (specifically GAP-1 for confidence structure and GAP-2 for refusal classification).

---

## 9. Outstanding Concerns & Readiness

- **Readiness:** **READY FOR PHASE 2 INTEGRATION.** The frontend foundation, design tokens, routing, shell, intake, real profiling, error handling, and component architecture are stable, verified, and strictly type-checked.
- **Python Version Parity:** The local machine is running Python 3.12.10, whereas `.python-version` targets 3.13.17. All dependencies currently function identically, but teammates should confirm Python minor line alignment before final packaging.
- **No Blockers:** Frontend Phase 1.1 audit is complete and clean.
