# Claude Brief — DataFix Frontend Product & UX Design

You are acting as the **Product Designer and Frontend UX Architect** for DataFix. Your job is to inspect the supplied starter repository and create a complete, implementation-ready frontend design specification. The implementation will be done later by Antigravity, so produce precise design and behaviour instructions rather than taking over backend or deployment work.

The user (Akash) owns both frontend development and technical leadership. A teammate owns the Python backend/data engine. Antigravity is the coding/implementation agent. Your output will be handed to Antigravity as the source of truth for the frontend build.

## 1. Product and problem-statement context

**Product name:** DataFix  
**Product category:** Trust-first structured data quality and repair web application.  
**Hackathon challenge:** Problem Statement 01 — “DataFix – Autonomous Data Quality and Repair Engine”, from the official INNOVEDGE HACKATHON 2026 problem statement.

The challenge describes real-world datasets with missing values, duplicate records, incorrect formats, inconsistent entries and less-obvious data errors. The platform should inspect a dataset, identify quality issues, infer likely causes, recommend or apply appropriate corrections, preserve data integrity and relationships, and make every change explainable and traceable.

The official problem statement's capabilities are:

- **Detect:** identify missing values, duplicates, invalid formats, inconsistent entries and anomalies.
- **Diagnose:** analyse error patterns and infer likely root causes rather than relying only on fixed rules.
- **Repair:** reconstruct or correct affected data while preserving valid values, schema and relationships.
- **Validate:** re-check the repaired dataset and report quality changes, unresolved issues and confidence.
- **Explain:** show what changed, why the change was made and the confidence behind each proposed repair.
- **Track:** maintain an auditable history of modifications, including before-and-after values.

The expected outcome is a working prototype that accepts a dataset, presents detected issues, demonstrates safe repairs, and exports a cleaned dataset with a clear quality report and modification log. A strong solution demonstrates accurate detection, minimal unintended changes, explainability, confidence, scalability, usability and reproducibility.

The product's core promise is:

> DataFix does not simply clean data. It shows what it changed, why it changed it, and how the repaired dataset was validated.

## 2. Product principles — these must shape the UX

1. **Trust before automation.** Never make a repair look successful before it has been validated.
2. **Original data is immutable.** Show that profiling is read-only. Repairs later operate on a separate working copy.
3. **Explain every proposed change.** A user should be able to inspect the original value, proposed value, reason, confidence, risk and validation result.
4. **Human control for uncertainty.** High-risk, low-confidence or ambiguous repairs require explicit user approval. Do not imply that the AI can safely infer every missing value.
5. **Differentiate anomalies from errors.** An unusual value is not automatically wrong.
6. **Make uncertainty visible.** Use clear language such as “possible issue”, “needs review” and “insufficient evidence”; avoid absolute claims where evidence is incomplete.
7. **Never fabricate data.** No fake quality scores, fake row counts, fake AI explanations, fake test results or fabricated dataset history.
8. **Keep the user oriented.** Show dataset name, current stage, scan/repair status and next action consistently.
9. **A real web application, not a marketing site.** Prioritise a functional workspace with clear hierarchy, data-dense but readable tables, strong empty/loading/error states and a professional product feel.

## 3. Read the actual starter before designing

Inspect these files in the supplied repository:

- `AGENTS.md`
- `README.md`
- `docs/architecture.md`
- `docs/team-workflow.md`
- `frontend/src/App.tsx`
- `frontend/src/styles.css`
- `frontend/src/lib/api.ts`
- `backend/app/api/routes.py`
- `backend/app/services/profiling.py`

Do not assume that capabilities described as future work already exist. Your design must separate the **current functional milestone** from the **future product experience**.

### Current implementation and API contract (source of truth)

The current backend implements only:

- `GET /health`
- `POST /api/v1/datasets/profile` using multipart form field `file`.
- CSV files only at present.
- Current upload limit defaults to 20 MB.
- The profile endpoint is read-only and returns:

```json
{
  "status": "profiled",
  "profile": {
    "filename": "customers_demo.csv",
    "row_count": 100,
    "column_count": 5,
    "total_cells": 500,
    "missing_cells": 12,
    "duplicate_rows": 3,
    "columns": [
      {
        "name": "email",
        "data_type": "object",
        "missing_count": 2,
        "missing_percent": 2.0,
        "distinct_count": 96
      }
    ],
    "notes": ["This is an initial profile only. No data has been modified."]
  }
}
```

The example values above illustrate the response shape only; never hard-code them as real application data.

The current UI already has a basic application shell, sidebar, API status indicator, CSV upload action, profile metric cards and a column-profile table. It uses a dark navy sidebar, warm light-grey/white workspace, and a restrained yellow-green accent. Existing fonts are DM Sans and Manrope with fallbacks. You may refine this visual direction, but inspect the actual CSS and avoid replacing working behaviour unnecessarily.

Not implemented yet:

- XLSX/JSON/Parquet or database connectors.
- Issue-level diagnosis or LLM responses.
- Repair-plan preview, approval/rejection or mutation.
- Post-repair validation.
- Supabase persistence, saved datasets or audit history.
- Export of repaired datasets/reports.

Do not design current controls as though these endpoints already exist. You may design future screens and describe the required future API contracts separately, clearly marking them “planned / not in current milestone”.

## 4. Your design task

Create a distinctive, polished desktop-first SaaS workspace that can scale to tablet and mobile. It should feel like a serious data operations product used by analysts and engineering teams, not a generic AI chatbot dashboard or a hackathon landing page.

Consider the following product areas. You may improve the naming and navigation if the information architecture remains intuitive.

### A. Application shell

- Compact brand/wordmark for DataFix.
- Persistent workspace navigation.
- Clear current-page/title/breadcrumb region.
- Backend/API connection state that does not falsely claim the service is online.
- User/workspace controls only if they are real; do not invent authentication or a fake user profile.
- Responsive sidebar behaviour for smaller screens.

Suggested future navigation:

- Overview
- Datasets
- Data profiler / Issues
- Repair studio
- Validation
- Audit history

For the first implementation phase, only Overview and the CSV profiling flow are functional. Other areas should be hidden, disabled with an honest “Coming soon” label, or presented as planned navigation—not as working features.

### B. Overview / upload experience

Design the first screen to make the next action obvious:

- Drag-and-drop and browse-to-upload area.
- Show supported formats accurately: CSV only in the current milestone. Do not show XLSX/JSON as active until implemented.
- Show the 20 MB limit only if the UI receives or reliably knows that configured limit; otherwise use neutral help text.
- Show selected filename, file size, remove/replace action and upload progress where supported.
- Have clear idle, drag-over, selected, uploading, profiling, success and failure states.
- Explain that initial profiling is read-only and does not alter the dataset.
- Avoid fake demo charts or sample values that could be confused with actual user data.

### C. Profile results (current milestone)

Use only fields present in the actual API response:

- Filename.
- Row count.
- Column count.
- Total cells (if useful).
- Missing cells.
- Duplicate rows.
- Column profile table: column name, inferred data type, missing count, missing percentage and distinct count.
- Backend notes explaining the limits of the initial profile.

Design table behaviour for long datasets/columns: horizontal overflow on narrow screens, clear numeric alignment, readable labels, empty states and optional client-side sorting/search only when it is genuinely implemented.

Do not calculate or display a “Data Health Score” unless you define a transparent formula, label it as a derived metric, and ensure it is computed from actual API data. Prefer omitting it in the first milestone.

### D. Future diagnosis / issue review screen (design specification only)

Specify a future UI for issue categories such as missing values, duplicate records, invalid formats, inconsistent entries and anomalies. Explain how issue severity/impact and confidence should be displayed. Do not label every anomaly as an error.

### E. Future repair studio (design specification only)

Specify how users will review a proposed repair:

- Issue summary and affected records/columns.
- Original value and proposed value.
- Reason / evidence.
- Confidence indicator with clear meaning.
- Risk classification (low / medium / high) with explanatory text.
- Approve, reject or defer actions.
- Batch action controls only where safe and understandable.
- Clear protection against ambiguous record merges/deletions.

Make it visually obvious that proposed changes are not applied until approval. High-risk or low-confidence operations must require human review.

### F. Future validation, audit and export (design specification only)

Specify:

- Before/after comparisons based on real computed values.
- Resolved and unresolved issue counts.
- Validation status and any failed checks.
- Change history containing dataset/row/column identity, old value, new value, reason, confidence, risk, action status and validation result.
- Export options only for formats that the backend will actually generate.
- A clear distinction between original file and repaired output.

## 5. Visual design direction

Create a recognisable visual system for a trust-first data product.

- Professional, precise, calm and high-quality.
- Strong information hierarchy; legible dense data tables.
- Restrained dark ink/navy for the navigation shell, neutral light surfaces for work areas, and a distinctive but restrained green/lime accent for DataFix identity and positive statuses.
- Amber for caution/needs review, red for errors/high risk, neutral grey for unknown or informational states. Never rely on colour alone; pair each state with a label/icon.
- Avoid excessive gradients, glassmorphism, oversized hero sections, random decorative illustrations and generic chatbot motifs.
- Use consistent spacing, border radii, typography scale, button hierarchy, form controls, focus states, table density and empty-state treatment.
- Keep motion purposeful and subtle; support reduced-motion preferences.
- Ensure WCAG-conscious contrast, keyboard accessibility, visible focus, semantic labels and accessible status announcements.
- Desktop-first because the main use case is analysts inspecting datasets, but provide a practical mobile layout.

If you propose new UI dependencies (for example, an icon package or component library), explain why and keep the dependency footprint small. Do not assume a component library is already installed.

## 6. Required output from you

Produce one self-contained Markdown document named **`FRONTEND_DESIGN_SPEC.md`** that Antigravity can implement without needing to guess.

It must contain:

1. Product design summary and UX principles.
2. Information architecture and navigation map.
3. Screen-by-screen specifications for the current milestone and future product screens.
4. Text wireframes or layout descriptions with hierarchy and placement.
5. Design tokens: colour palette (hex values), typography, spacing, radius, shadows, breakpoints and interaction states.
6. Component inventory with responsibilities and key props/state (e.g. app shell, sidebar, upload dropzone, metric card, profile table, issue row, repair review panel, audit timeline, status badge, confirmation dialog, toast/alert).
7. Exact interaction behaviours and state transitions for upload/profile, including idle, drag-over, invalid file, uploading, backend waking/offline, success, empty data, malformed data, too-large file and retry.
8. Responsive behaviour for desktop, tablet and mobile.
9. Accessibility requirements.
10. Current API integration mapping using the real `/health` and `/api/v1/datasets/profile` contracts. Do not invent current endpoints.
11. A clearly separated list of future backend endpoints/data required for diagnosis, repair, validation, audit and export. Mark them as proposals, not existing functionality.
12. Phased frontend implementation sequence. Phase 1 must work with the current backend only. Later phases can be prepared in the architecture but must not show fake functionality.
13. Acceptance checklist that can be used by Antigravity and the user.

Include enough detail that a coding agent can implement the interface consistently. Avoid vague instructions such as “make it modern” without specifying hierarchy, behaviour and visual rules.

## 7. Boundaries

- Do not implement or alter backend code.
- Do not call an LLM from browser code.
- Do not create fake API responses or hard-code sample metrics in production UI.
- Do not claim XLSX/JSON support until backend support exists.
- Do not invent authentication, user accounts, data persistence or history features that are not implemented.
- Do not remove the safety rules in `AGENTS.md`.
- Do not start building the React application. Your deliverable is the design specification only.

At the end, summarise the core design choices and identify any unresolved product decisions. Antigravity will use your `FRONTEND_DESIGN_SPEC.md` to implement the frontend after the user reviews it.
