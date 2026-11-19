# Antigravity — Frontend Implementation Handoff (Use After Claude Review)

Use this instruction only after Akash has reviewed Claude's `FRONTEND_DESIGN_SPEC.md` and placed the approved file in `docs/`.

1. Read `AGENTS.md`, `docs/architecture.md`, `docs/team-workflow.md`, and the approved `docs/FRONTEND_DESIGN_SPEC.md`.
2. Compare every proposed interaction with the actual backend contract and current source code. Do not invent endpoints or response fields.
3. Implement **Phase 1 only** first: responsive application shell, CSV upload states, API connectivity state, profile summary and column profile results using the current API.
4. Preserve the current working upload/profile behaviour and typed API client. Improve the code structure only where needed for the approved design.
5. Keep future diagnosis, repair, validation, audit and export screens clearly marked as planned until corresponding backend endpoints are implemented. Do not use fabricated data to make them look functional.
6. Do not modify `backend/` unless Akash and the backend owner explicitly agree to a coordinated API change.
7. Do not add Groq calls, credentials, Supabase integration or authentication as part of the frontend visual implementation.
8. Implement desktop, tablet and mobile states, accessible keyboard focus, labelled controls, loading/empty/error states and backend cold-start/retry behaviour.
9. Run `npm run build`, verify the local upload/profile flow against FastAPI, and report the exact files changed and test results.
10. Work in a feature branch and do not push or deploy without the user's direction.

Before coding, provide a short implementation plan identifying the components/files to change and any mismatch between Claude's design and the actual API. Wait for Akash's approval if the mismatch requires product or backend decisions.
