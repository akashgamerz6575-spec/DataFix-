# DataFix — Instructions for AI Coding Agents

This repository is a two-person hackathon project. Read this file and `docs/architecture.md` before making changes.

## Product objective

Build a trustworthy structured-data quality and repair web application. It must detect and diagnose issues, propose safe repairs, validate outcomes, and preserve a complete audit trail.

## Current implementation status

The current scaffold implements only:
- FastAPI health endpoint (`GET /health`)
- CSV upload/profile endpoint (`POST /api/v1/datasets/profile`)
- React upload screen and profile results table

Do not describe unimplemented capabilities as finished. Repair application, LLM diagnosis, XLSX/JSON input, Supabase persistence, audit history, and exports are future work.

## Non-negotiable engineering rules

1. Never call an LLM directly from browser code. All model calls go through the backend.
2. Never expose API keys, database URLs, Supabase service-role keys, or secrets in frontend environment variables, committed files, logs, or UI responses.
3. Deterministic Python code owns profiling, validation, and data transformations. The LLM may diagnose and propose a structured repair plan; it must not directly mutate data.
4. Keep the original dataset immutable. Apply approved repairs to a separate working copy.
5. Never automatically delete, merge, or overwrite records when identity or relationships are ambiguous.
6. Each proposed repair must include target, old value, proposed value, reason, confidence, risk level, and validation rules.
7. High-risk or low-confidence repairs require explicit human approval.
8. Record all applied, rejected, and skipped changes in an audit trail.
9. Enforce file-size and type limits. Do not execute uploaded files as code.
10. Use synthetic demo data only. Do not commit real personal, customer, or confidential datasets.
11. Keep API contracts explicit and typed. Update frontend and backend together when a contract changes.
12. Keep `main` runnable. Make small changes, run relevant checks, and summarise changed files and test results.

## Working conventions

- Akash owns `frontend/` and combines product/technical leadership, architecture, LLM provider adapter, deployment configuration, and cross-module integration.
- The backend/data-engine teammate owns `backend/app/services/`, backend routes and backend tests.
- Coordinate API contracts before changing routes or response shapes.
- Do not edit another owner's module without coordinating in the team's issue/PR workflow.
- Use feature branches and pull requests. Do not commit secrets or local `.env` files.

## Definition of done

A feature is not complete until its expected user path works, failure cases are handled, tests or a reproducible manual check are documented, and no secret or unintended data mutation is introduced.
