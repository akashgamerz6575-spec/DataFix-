# DataFix — Baseline Environment and Implementation Audit

**Audit Timestamp:** 2026-11-19T10:05:00+05:30 (04:35:00 UTC)  
**Auditor / Agent:** Antigravity (Implementation Agent)  
**Host Platform:** Microsoft Windows 11 Home (Version 10.0.26300, Build 26300, 64-bit)  
**Working Directory:** `d:\DataFix`  
**Overall Status:** **PASS**

---

## 1. Tooling & Runtime Environment

| Tool / Runtime | Command / Target | Version / Result | Notes |
| :--- | :--- | :--- | :--- |
| **Git** | `git --version` | `git version 2.54.0.windows.1` | Installed and operational |
| **Node.js** | `node --version` | `v24.13.0` | Node.js runtime ready |
| **npm** | `npm --version` | `11.6.2` | Package manager ready |
| **Python (3.13 Launcher)** | `py -3.13 --version` | *No suitable Python runtime found* | Python 3.13 not installed on system |
| **Python (System)** | `python --version` | `Python 3.12.10 (64-bit)` | Active system Python used for `.venv` |
| **PowerShell** | `$PSVersionTable.PSVersion` | `5.1.26100.2161` | Default Windows shell |

> [!NOTE]
> `.python-version` specifies `3.13.17`. System currently runs Python `3.12.10`. All backend dependencies (`fastapi`, `pandas`, `uvicorn`, `openpyxl`, `python-dotenv`, `httpx`) installed and executed cleanly on Python 3.12.10.

---

## 2. Setup Commands Executed

1. **Git Initialization & Ignore Verification:**
   ```powershell
   git init
   git check-ignore backend\.env frontend\.env backend\.venv frontend\node_modules frontend\dist
   ```
   *Result:* All environment files (`.env`), virtual environments (`.venv`), node modules (`node_modules`), and build artifacts (`dist`) confirmed ignored by Git.

2. **Environment Configuration Files:**
   ```powershell
   Copy-Item backend\.env.example backend\.env
   Copy-Item frontend\.env.example frontend\.env
   ```
   *Result:* Created without overwriting any pre-existing secrets.

3. **Backend Virtual Environment & Dependency Installation:**
   ```powershell
   python -m venv backend\.venv
   .\backend\.venv\Scripts\python.exe -m pip install --upgrade pip
   .\backend\.venv\Scripts\pip.exe install -r backend\requirements.txt
   ```
   *Result:* Successfully upgraded pip to 26.3 and installed all 29 dependencies (FastAPI 0.165.0, Uvicorn 0.54.0, Pandas 3.1.1, Pydantic 2.14.3, openpyxl 3.1.5, python-multipart 0.0.34, etc.).

4. **Frontend Dependency Installation & Build:**
   ```powershell
   cd frontend
   npm install
   npm run build
   ```
   *Result:* Successfully installed packages (`package-lock.json` generated), `tsc --noEmit && vite build` built production bundle in 191ms without errors or warnings.

5. **Server Executions (Background Daemons):**
   - **FastAPI Backend:**
     `.\backend\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000`
   - **Vite Frontend Dev Server:**
     `npm run dev` (running on `http://127.0.0.1:5173/`)

---

## 3. Verification Test Results

### 3.1 Backend Health & Documentation Endpoints
- **Endpoint:** `GET http://127.0.0.1:8000/health`
  - **HTTP Status:** `200 OK`
  - **Payload:**
    ```json
    {
      "status": "ok",
      "service": "datafix-api",
      "environment": "development"
    }
    ```
- **Endpoint:** `GET http://127.0.0.1:8000/docs`
  - **HTTP Status:** `200 OK` (Swagger UI served)

### 3.2 Frontend Production Build
- **Command:** `npm run build`
- **Exit Code:** `0`
- **Output:**
  - `dist/index.html`: `0.55 kB`
  - `dist/assets/index-Dkt05r7R.css`: `8.44 kB`
  - `dist/assets/index-DWDodOGq.js`: `228.03 kB`
- **Type Checking:** Passed (`tsc --noEmit` clean).

### 3.3 CSV Upload & Profiling (`sample_data/customers_demo.csv`)
- **Endpoint:** `POST http://127.0.0.1:8000/api/v1/datasets/profile`
- **Input File:** `sample_data/customers_demo.csv` (5 rows, 6 columns, contains missing values and 1 duplicate row)
- **HTTP Status:** `200 OK`
- **Profiling Result Summary:**
  - `row_count`: `5`
  - `column_count`: `6`
  - `total_cells`: `30`
  - `missing_cells`: `3`
  - `duplicate_rows`: `1`
  - `columns`:
    - `customer_id`: `str`, missing: `0` (0.0%), distinct: `4`
    - `full_name`: `str`, missing: `0` (0.0%), distinct: `4`
    - `email`: `str`, missing: `0` (0.0%), distinct: `4`
    - `city`: `str`, missing: `1` (20.0%), distinct: `2`
    - `joined_on`: `str`, missing: `0` (0.0%), distinct: `4`
    - `age`: `float64`, missing: `2` (40.0%), distinct: `3`
  - `notes`:
    - `"This is an initial profile only. No data has been modified."`
    - `"A blank string is not automatically treated as a missing value in this first milestone."`

### 3.4 Negative & Error Path Testing

| Test Case | Scenario / File | Expected Status | Actual Status | Observed Response / Error Detail |
| :--- | :--- | :--- | :--- | :--- |
| **Empty File** | `empty.csv` (0 bytes) | `422` | `422 Unprocessable Entity` | `{"detail":"The uploaded file is empty."}` |
| **Unsupported File Type** | `test.txt` (text/plain) | `415` | `415 Unsupported Media Type` | `{"detail":"The starter currently accepts CSV files only. XLSX and JSON support will be added in a later milestone."}` |
| **Header Only CSV** | `header_only.csv` (headers, no rows) | `422` | `422 Unprocessable Entity` | `{"detail":"The CSV contains column headers but no data rows."}` |
| **Malformed Syntax** | `unclosed_quote.csv` (unclosed quote / bad quoting) | `422` | `422 Unprocessable Entity` | `{"detail":"The CSV structure is invalid or inconsistent. Check its delimiters and quoting."}` |
| **Bad Encoding** | `bad_encoding.csv` (invalid UTF-8 byte sequence) | `422` | `422 Unprocessable Entity` | `{"detail":"The CSV encoding could not be read. Please upload a UTF-8 CSV file."}` |

---

## 4. Repository State & Files Changed

| File Path | Action | Purpose / Reason |
| :--- | :--- | :--- |
| `backend/.env` | Created | Local backend environment variables (from `.env.example`). Ignored by Git. |
| `frontend/.env` | Created | Local frontend Vite variables (from `.env.example`). Ignored by Git. |
| `frontend/package-lock.json` | Generated | Created by `npm install` to pin deterministic dependencies. Tracked by Git. |
| `.git/` | Initialized | Git repository initialized locally. |
| `docs/BASELINE_AUDIT.md` | Created | Audit deliverable documenting baseline verification. |

No functional application code or architecture contracts were changed. Existing source files remain intact.

---

## 5. Security & Boundary Verification

- [x] No secrets or credentials exposed in frontend files, source control, or responses.
- [x] `.env` files are confirmed untracked and excluded in `.gitignore`.
- [x] `backend/.venv` and `frontend/node_modules` confirmed excluded in `.gitignore`.
- [x] Profiling service is confirmed strictly read-only; no dataset mutations occur.
- [x] Maximum upload limit enforced at 20 MB via `MAX_UPLOAD_BYTES`.
- [x] No external accounts, third-party cloud deployments, or API credentials created.

---

## 6. Blockers & Next Actions

- **Current Blocker Status:** **None.** The baseline vertical slice is operational.
- **Environment Note:** Python 3.12.10 is currently used on this workstation instead of Python 3.13.x specified in `.python-version`. If the team requires strict Python 3.13 parity across all team members, Python 3.13 (64-bit) can be installed via the official Windows installer.
- **Next Step:** Antigravity stands ready to receive Claude's `FRONTEND_DESIGN_SPEC.md` from Akash. Once provided, Antigravity will compare the specification against `AGENTS.md` and the existing API contract, outline a phased implementation plan for Phase 1, and await approval before modifying any frontend code.
