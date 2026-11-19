# DataFix

> **Trustworthy structured-data quality and repair web application.**
> Detect and diagnose data quality issues, propose safe repairs through a structured safety gate, validate outcomes deterministically, and preserve a complete audit trail.

**Repository:** [https://github.com/akashgamerz6575-spec/DataFix-.git](https://github.com/akashgamerz6575-spec/DataFix-.git) (Public)
**Primary Branch:** `main`

---

## 1. Team & Responsibilities

DataFix is built by two human developers:

- **Akash**: Frontend, architecture, LLM provider adapter, deployment configuration, and cross-module integration.
- **Teammate 3**: Backend and data engineering, profiling services, deterministic transformation engines, and API endpoints.

---

## 2. Product Objectives & Core Principles

1. **Safety First**: Deterministic Python code owns profiling, validation, and transformations. The LLM suggests and diagnoses repairs; it never mutates data directly.
2. **Immutable Originals**: The source dataset is never mutated in place. All changes are simulated and applied to an isolated working copy.
3. **Structured Safety Gate**: Every proposed repair is categorized into one of three distinct lanes:
   - **Auto-Apply**: Format-only and lossless deduplications that pass all invariants.
   - **Needs Approval**: Ambiguous transformations, value substitutions, or higher-risk actions requiring explicit human confirmation.
   - **Refused**: Changes rejected by DataFix because of invariant violations or insufficient evidence to prevent hallucinated data.
4. **Zero-Fabrication Design Principle**: Missing values should never be fabricated or imputed without verifiable domain context, foreign keys, or reference tables.
5. **Cryptographic Audit Trail Principle**: Architecture designed so every applied, skipped, or rejected operation can be sequenced, logged, and verified via closed-loop replay and SHA-256 integrity hashing once backend verification is implemented.

---

## 3. Current Implementation Status

> **Important**: Only the service health check and CSV profiling endpoints are currently live in the backend. All Repair Studio, Proof, History, and Export capabilities are implemented as frontend screens and client-side prototypes backed by `RunContext` state and development fixtures (`fixtures.ts`). Genuine backend execution for these stages is planned for subsequent milestones.

### Live Backend Functionality (Currently Working)

- `GET /health`: Service health endpoint returning service status, name, and environment.
- `POST /api/v1/datasets/profile`: Deterministic Pandas CSV profiling returning dataset row/column counts, total cells, missing cells, duplicate rows, and per-column data types and distinct counts.
- Multi-origin CORS support and file size limit enforcement (20 MB default limit).

### Implemented Frontend Screens (UI & Client Architecture)

- **Design System**: Comprehensive design tokens (`tokens.css`) for typography, spacing, semantic colors, and surfaces.
- **Application Shell**: Shared shell with `TopBar`, `StageRail` (6-stage workflow navigation), and `SafetyRibbon` featuring a visual proportional distribution bar.
- **Intake Screen (`IntakePage.tsx`)**: Drag-and-drop CSV upload connecting to live `POST /api/v1/datasets/profile`, synthetic benchmark dataset loader, and live waking-server cold-start detection.
- **Overview Screen (`OverviewPage.tsx`)**: Renders real profiling results from live backend upload (or demo fixtures), displaying dataset KPIs, column profiling table, and detected issues summary.
- **Repair Studio Screen (`StudioPage.tsx`)**: Interactive frontend layout with three-lane proposal queue (Auto-apply, Needs approval, Refused), proposal dossier inspector, refusal explanation cards, and side-by-side cell diffs *(client-side prototype)*.
- **Proof Screen (`ProofPage.tsx`)**: Verification interface displaying invariant status checks and SHA-256 cryptographic seal preview *(client-side prototype)*.
- **History Screen (`HistoryPage.tsx`)**: Chronological audit trail display with sequenced operations, decision origins, and simulated rollback interaction *(client-side prototype)*.
- **Export Screen (`ExportPage.tsx`)**: Cleaned dataset preview and audit receipt download interface *(client-side prototype)*.

### Planned Backend Functionality (GAPs 1–10 API Contract)

The following backend endpoints are formally specified in [docs/FRONTEND_BACKEND_CONTRACT.md](docs/FRONTEND_BACKEND_CONTRACT.md) and planned for backend implementation:

| Endpoint | Method | Status | Required For |
| :--- | :--- | :--- | :--- |
| `/api/v1/runs` | `POST` | **PLANNED** | Create a persistent run from uploaded CSV/XLSX |
| `/api/v1/runs/{id}/analyze` | `POST` | **PLANNED** | Run detection, hypothesis generation, and repair simulation |
| `/api/v1/runs/{id}/proposals/{proposal_id}/diff` | `GET` | **PLANNED** | Full diff and merge group pagination (GAP-3) |
| `/api/v1/runs/{id}/decisions` | `POST` | **PLANNED** | Record user approval / rejection on proposals |
| `/api/v1/runs/{id}/apply` | `POST` | **PLANNED** | Atomically apply approved and auto-apply repairs |
| `/api/v1/runs/{id}/verify` | `POST` | **PLANNED** | Closed-loop verification replay against untouched original |
| `/api/v1/runs/{id}/operations` | `GET` | **PLANNED** | Retrieve ordered history of applied operations |
| `/api/v1/runs/{id}/undo/{op_id}` | `POST` | **PLANNED** | Remove an operation from the log and replay state |
| `/api/v1/runs/{id}/export` | `GET` | **PLANNED** | Download zip bundle with cleaned CSV, report, log, recipe |
| `/api/v1/policy` | `GET` | **PLANNED** | Inspect active gate rules, invariants, and thresholds |

- **Planned Model Integration & Persistence**:
  - Server-side Groq LLM integration with structured JSON schema outputs (strictly called via backend; never from the browser).
  - Supabase persistence for runs, datasets, and immutable audit logs.
  - Multi-table, XLSX, and JSON file format parsers.

---

## 4. Technology Baseline

- **Operating System:** Windows 10/11 (cross-platform compatible)
- **Node.js:** Node.js 20+ (Verified on Node.js v24.13.0)
- **Python:** Python 3.13.x (64-bit)
- **Frontend Stack:** React 19 + TypeScript + Vite
- **Backend Stack:** FastAPI + Uvicorn + Pandas + Pydantic v2
- **Source Control:** GitHub (Public repository: `https://github.com/akashgamerz6575-spec/DataFix-.git`)
- **Primary IDE:** Antigravity

---

## 5. Local Development Setup

### Prerequisites

Verify toolchains in PowerShell:

```powershell
git --version
node --version
npm --version
python --version
```

### 1. Clone Repository

```powershell
git clone https://github.com/akashgamerz6575-spec/DataFix-.git
cd DataFix-
```

### 2. Backend Setup

From the repository root:

```powershell
cd backend
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Verify backend in your browser:
- Health check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- Interactive API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 3. Frontend Setup

Open a second terminal from the repository root:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Open the local application URL (normally [http://localhost:5173](http://localhost:5173)).

---

## 6. End-to-End Verification Check

1. Confirm the UI shows the backend server is **online** (`GET /health`).
2. Navigate to **Intake** and click **Load synthetic benchmark dataset** or upload `sample_data/customers_demo.csv`.
3. Verify that the **Overview** page displays the real profiling results returned by FastAPI:
   - Row count: 5
   - Column count: 6
   - Missing cells: 3
   - Duplicate rows: 1
4. Inspect the **Repair Studio**, **Proof**, **History**, and **Export** screens to explore the frontend safety gate workflows, proposal inspector, and refusal explanations (currently driven by client-side state until backend endpoints are implemented).

---

## 7. Environment Variables & Security Rules

- `backend/.env`: Backend runtime configuration and server-side API keys.
- `frontend/.env`: Browser-safe Vite variables (`VITE_API_BASE_URL`).

### Strict Security Rules:
- Never expose `GROQ_API_KEY`, Supabase service-role keys, or database passwords in `frontend/.env`, React code, Git, or logs.
- All `.env` files are strictly ignored by `.gitignore`. Keep `.env.example` committed with documentation and empty placeholders only.
- Only synthetic test data is allowed in `sample_data/`.

---

## 8. Collaboration & Branching Workflow

- `main` remains deployable at all times.
- Both teammates create short-lived feature branches: `feat/<feature-name>`.
- Changes are merged via GitHub Pull Requests after code review and type checks pass.
- Do not rewrite Git history or use `git push --force` on `main`.

---

## 9. Deployment Architecture

- **Frontend Hosting:** Vercel (Root directory: `frontend`, Build command: `npm run build`, Output: `dist`).
- **Backend Hosting:** Render (Configured via root `render.yaml` blueprint).
- **Environment Links:**
  - Vercel `VITE_API_BASE_URL` points to the Render backend service URL.
  - Render `CORS_ORIGINS` includes the production Vercel URL.

---

## 10. Documentation Index

- `AGENTS.md`: Non-negotiable engineering rules and operational constraints.
- `docs/architecture.md`: System architecture and data flow.
- `docs/FRONTEND_DESIGN_SPEC.md`: Authoritative design specification.
- `docs/FRONTEND_BACKEND_CONTRACT.md`: GAPs 1–10 request/response API contracts for Phase 2 backend implementation.
- `docs/PHASE_1_1_ACCEPTANCE_REPORT.md`: Comprehensive Phase 1.1 acceptance audit with screenshots.
- `docs/GITHUB_INITIAL_PUSH_REPORT.md`: Initial publication and security verification report.
