# First Instruction for Antigravity — DataFix Baseline & Handoff

You are the implementation agent for **DataFix**, a three-person hackathon project. The working repository is a Windows-first monorepo. The primary IDE is Antigravity.

## Your first task

Do a careful repository and local-environment audit, then prove that the existing starter works locally. Do **not** begin a visual redesign or implement new product capabilities yet. The frontend design will first be specified by Claude in a separate `FRONTEND_DESIGN_SPEC.md`; you will implement that specification after the user provides it.

## Read these files first, in this order

1. `AGENTS.md` — mandatory engineering and safety rules.
2. `README.md` — setup instructions and current milestone.
3. `docs/architecture.md` — current architecture and actual API contract.
4. `docs/team-workflow.md` — current ownership and collaboration rules.
5. `docs/model-integration.md` — future Groq integration constraints.
6. `docs/CLAUDE_FRONTEND_DESIGN_BRIEF.md` — the design brief that will be sent to Claude.

Inspect the existing source files before making any changes. The starter already contains an initial React screen and a FastAPI CSV profiling endpoint; do not assume the project is blank.

## Confirmed team ownership

- **Akash:** Product/technical lead, frontend owner, integration, AI provider adapter, deployment configuration and final end-to-end acceptance.
- **Backend/data-engine teammate:** Owns `backend/app/services/`, backend routes and tests for profiling, repairs, validation and audit logic. Coordinate API contracts before changing them.
- If another teammate is actively contributing, ask the user to assign QA, test-data, documentation or demo ownership; do not invent an owner.

Respect the ownership split. Do not rewrite backend services while doing the baseline audit. Do not make broad frontend changes before the Claude design specification is approved.

## Current implementation — treat this as the source of truth

Implemented now:

- `GET /health`
- `POST /api/v1/datasets/profile`
- CSV upload only, with a current default 20 MB limit.
- Read-only Pandas profiling: row count, column count, total cells, missing cells, duplicate rows, and per-column data type, missing count/percentage and distinct count.
- A React/Vite UI that calls the health and CSV profiling endpoints.

Not implemented yet:

- XLSX or JSON upload.
- AI diagnosis or Groq integration.
- Repair recommendations, preview, approval/rejection or transformations.
- Post-repair validation.
- Persistent dataset history, Supabase or audit history.
- Export of repaired data or reports.

Do not present future capabilities as working features. Do not add fake metrics or hard-coded results to make the interface look populated.

## Baseline tasks

1. Inspect the current Git state and directory structure. Do not delete or rename existing files.
2. Check installed versions from PowerShell:
   - `git --version`
   - `node --version`
   - `npm --version`
   - `py -3.13 --version` (or report if the Python launcher/version is unavailable)
3. Backend setup from the repository root:
   - Create `backend/.venv` if missing.
   - Install `backend/requirements.txt`.
   - Copy `backend/.env.example` to `backend/.env` only if `.env` does not already exist. Never overwrite a user's existing `.env`.
   - Start FastAPI and verify `GET http://127.0.0.1:8000/health` and the docs page.
4. Frontend setup:
   - Run `npm install` inside `frontend/`.
   - Preserve and commit `frontend/package-lock.json` once generated; do not hand-edit it.
   - Run `npm run build` and then `npm run dev`.
5. End-to-end check:
   - Use `sample_data/customers_demo.csv`.
   - Verify the frontend can reach the backend and show profile counts.
   - Test an empty or malformed CSV and a non-CSV file; confirm a clear error is displayed.
6. Check that `.env`, `.venv`, `node_modules`, build output and other local secrets/artifacts are ignored by Git.
7. Do not create cloud projects, sign up for services, configure billing, deploy, or request API keys during this first task. The user will create accounts manually when ready.

## Allowed changes during this first task

Only make small, justified fixes needed to get the existing baseline running. If a source change is needed, explain why and keep it narrow. Do not add new product features, dependencies, UI redesigns, database integration or LLM calls.

Do not weaken CORS, file validation, upload limits, secret handling or any rule in `AGENTS.md` to make a check pass.

## Required deliverable

Create `docs/BASELINE_AUDIT.md` containing:

- Date/time and operating-system information.
- Detected tool versions.
- Commands executed.
- Frontend build result.
- Backend health result.
- CSV upload/profile result using the supplied sample.
- Error-path results (malformed/empty CSV and wrong file type).
- Any files changed and why.
- Any remaining blocker, with the exact error and next action.

Finish by reporting a concise status to the user: **PASS**, **PASS WITH BLOCKERS**, or **BLOCKED**. Do not claim a check passed unless you actually ran it and observed the result.

## After this first task

Stop and wait for the user to provide Claude's `FRONTEND_DESIGN_SPEC.md`. Then:

1. Compare the design specification with `AGENTS.md`, the actual API contract and current implementation.
2. Flag any design item that would require a backend endpoint or data field that does not exist yet.
3. Propose a phased implementation plan, with the first phase limited to the currently working CSV upload/profile flow.
4. Wait for the user's approval before implementing the visual redesign.
