# DataFix — Team Starter

A Windows-first monorepo starter for the DataFix hackathon project.

## Product scope for the first milestone

The first vertical slice is intentionally small:

1. Start a React web interface.
2. Start a FastAPI backend.
3. Check backend health from the UI.
4. Upload a CSV file.
5. Return a basic data profile: row/column counts, missing cells, duplicate rows, and per-column summaries.

This is a development scaffold, not the completed hackathon solution. Repair recommendations, repair approval, validation, audit history, XLSX/JSON support, Supabase persistence, and Groq integration are subsequent milestones.

## Technology baseline

- Windows 10/11
- Node.js 26 LTS
- Python 3.13.x (use the same minor line for all teammates)
- React 19 + TypeScript + Vite
- FastAPI + Pandas
- GitHub for source control
- Antigravity as the primary IDE

The package manifest pins the current stable React/Vite toolchain at scaffold creation. Keep `package-lock.json` in Git after the first `npm install` so all teammates use the same dependency tree.

## Prerequisites

Install:

- Git for Windows: https://git-scm.com/download/win
- Node.js 26 LTS: https://nodejs.org/en/download/
- Python 3.13 (64-bit): https://www.python.org/downloads/windows/
- Antigravity: use the official installer available to your team

During Python installation, enable **Add Python to PATH** if using the standard installer.

Verify in PowerShell:

```powershell
git --version
node --version
npm --version
py -3.13 --version
```

## Local setup

### 1. Backend terminal

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

If PowerShell blocks activation for the current terminal, run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

Check:

- API health: http://127.0.0.1:8000/health
- API docs: http://127.0.0.1:8000/docs

### 2. Frontend terminal

Open a second PowerShell terminal from the repository root:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173).

### 3. First end-to-end check

1. Confirm the UI reports that the API is online.
2. Upload a small `.csv` file.
3. Confirm that a profile is returned.
4. Try a CSV with blank cells and repeated rows.
5. Confirm that the missing-cell and duplicate-row counts change as expected.

A small synthetic test CSV is included in `sample_data/`.

## Environment variables

- `backend/.env`: backend settings and future server-side API credentials.
- `frontend/.env`: browser-safe Vite variables only.

Never put `GROQ_API_KEY`, Supabase service-role keys, database passwords, or other secrets in `frontend/.env`, React source code, Git, screenshots, or public issue comments.

## GitHub setup

1. One teammate creates a new **private** GitHub repository named `datafix`.
2. Extract this starter folder and initialise Git from its root:

   ```powershell
   git init
   git add .
   git commit -m "chore: initialise DataFix monorepo"
   git branch -M main
   git remote add origin https://github.com/<TEAM-OWNER>/datafix.git
   git push -u origin main
   ```

3. Add the other two teammates as collaborators.
4. Keep `main` deployable. Use feature branches and pull requests rather than all three committing directly to `main`.
5. Commit `frontend/package-lock.json` after the first successful `npm install`.

## Deployment direction

- Vercel project root: `frontend`
- Render service root: `backend`
- Render build command: `pip install -r requirements.txt`
- Render start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Configure `CORS_ORIGINS` on Render with the exact Vercel production URL.
- Configure `VITE_API_BASE_URL` in Vercel with the Render backend URL.
- Supabase and Groq credentials belong only in Render environment variables.

Deployment provider quotas and free-tier terms can change. Verify current limits in each dashboard before relying on a free plan for the final demo. Render free services may cold-start after inactivity; the UI therefore does not disable uploads just because the first health check is offline. Allow the first API request to wake the backend.

## First milestone acceptance checklist

- [ ] All three teammates can clone the repository.
- [ ] Backend starts on each Windows machine.
- [ ] Frontend starts on each Windows machine.
- [ ] UI can reach `/health`.
- [ ] CSV upload and profile endpoint work.
- [ ] Empty or malformed CSV returns a clear error.
- [ ] `.env` files are ignored by Git.
- [ ] A pull request from a feature branch can be reviewed and merged.

See `docs/` for architecture, roles, and workflow.
