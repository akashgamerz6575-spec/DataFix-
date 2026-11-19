# Team Plan — Two-Person Hackathon

Current confirmed ownership:

## Akash — Product/technical lead + frontend owner

Akash is combining the original lead/integration and frontend responsibilities:

- Own product scope, acceptance criteria and frontend user experience.
- Own `frontend/`: React components, dashboard, upload flow, profile results, future issue/repair/audit screens and responsive behaviour.
- Maintain architecture and API contracts with the backend owner.
- Own the Groq provider adapter after the team's personal API account is ready.
- Own Vercel/Render/Supabase configuration and final end-to-end deployment acceptance.
- Review backend/frontend integration and coordinate pull requests.

## Teammate 3 — Backend/data-engine owner

- Own `backend/app/services/`, backend routes and deterministic data-processing tests.
- Expand profiling to blank-string handling, type/format issues, duplicate analysis and anomalies.
- Build the repair-plan schema and safe deterministic transformations.
- Add validation and export logic.
- Keep uploaded files temporary unless the team explicitly implements persistent storage.
- Coordinate request/response contracts with Akash before changing API behaviour.

## Collaboration rules

- `main` must remain runnable.
- Each task gets a short-lived branch: `feat/<area>-<task>`.
- Open a pull request for integration; another teammate reviews it.
- Do not edit the same files across branches without coordinating first.
- Commit only working slices; don't wait until an entire module is finished.
- Keep sample data synthetic and non-sensitive.

## First working agreement

Before parallel feature work, spend 20–30 minutes agreeing on:

1. API request and response models.
2. File size and file type limits.
3. Dataset identity and how a row is referenced.
4. What counts as a missing value, duplicate and anomaly.
5. Repair risk levels and which changes require approval.
6. Which artifacts are stored in Supabase and when temporary files are deleted.
