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
4. **Zero Fabrication Guarantee**: Missing values are never guessed without verifiable domain context, foreign keys, or postal reference tables.
5. **Cryptographic Audit Trail**: Every applied, skipped, or rejected operation is sequenced, timestamped, and provable via SHA-256 integrity verification.

---

## 3. Current Implementation Status

### Implemented (Phase 1 & Phase 1.1)

- **FastAPI Backend (`backend/`):**
  - `GET /health`: Service health endpoint returning status, service name, and runtime environment.
  - `POST /api/v1/datasets/profile`: Deterministic Pandas CSV profiling returning dataset row/column counts, total cells, missing cells, duplicate rows, and per-column data types and distinct counts.
  - Multi-origin CORS support and file size validation (20 MB default limit).
- **React Frontend (`frontend/`):**
  - **Design System**: Comprehensive design tokens (`tokens.css`) for typography, spacing, semantic colors, and surfaces.
  - **Application Shell**: Shared shell with `TopBar`, `StageRail` (6-stage workflow navigation), and `SafetyRibbon` featuring a visual proportional distribution bar.
  - **Intake Screen (`IntakePage.tsx`)**: Drag-and-drop CSV upload, demo dataset one-click loader, and live waking-server cold-start detection.
  - **Overview Screen (`OverviewPage.tsx`)**: Dataset health KPIs, column profiling grid, and detected issues summary.
  - **Repair Studio (`StudioPage.tsx`)**: Three-panel layout with a three-lane proposal queue (Auto-apply, Needs approval, Refused), detailed proposal inspector, refusal evidence gap cards, and side-by-side cell diff comparisons.
  - **Proof Screen (`ProofPage.tsx`)**: Deterministic verification summary, invariant status checks, and SHA-256 cryptographic seal generator.
  - **History Screen (`HistoryPage.tsx`)**: Chronological audit trail with sequencer, decision origins, affected cell metrics, and operation rollback simulation.
  - **Export Screen (`ExportPage.tsx`)**: Clean data export preview and compliance audit receipt download.
  - **State & Routing**: `RunContext` with `localStorage` persistence, URL-synchronized routing, and seamless live API vs development fixture toggling.

### Planned Functionality (Phase 2 & Future Milestones)

- **Backend Repair Plan Endpoints (GAPs 1–10 Contract):**
  - `POST /api/v1/runs/{id}/proposals`: Structured repair proposal generation via rules and heuristics.
  - `POST /api/v1/runs/{id}/simulate`: Deterministic repair simulation, cell-level diff generation, and invariant verification.
  - `POST /api/v1/runs/{id}/apply` & `POST /api/v1/runs/{id}/undo`: Deterministic state application and rollbacks.
  - `POST /api/v1/runs/{id}/verify`: Cryptographic verification and tamper-evident audit receipt.
  - `GET /api/v1/runs/{id}/export`: CSV/Excel export of the repaired dataset.
  - Full API specifications for these endpoints are defined in [docs/FRONTEND_BACKEND_CONTRACT.md](docs/FRONTEND_BACKEND_CONTRACT.md).
- **Model Integration & Persistence:**
  - Server-side Groq LLM integration with structured JSON schema outputs (all model calls routed strictly through the backend).
  - Supabase persistence for runs, datasets, and immutable audit logs.
  - Excel (`.xlsx`) and JSON data format parsers.

---

## 4. Technology Baseline

- **Operating System:** Windows 10/11 (cross-platform compatible)
- **Node.js:** Node.js 20+ LTS
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
4. Inspect the **Repair Studio** to explore the safety gate, proposal inspector, and refusal explanations.

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
