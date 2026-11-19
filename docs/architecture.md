# DataFix Architecture — Initial Baseline

## System boundary

```text
Browser (Vercel)
  React + TypeScript
       |
       | HTTPS JSON / multipart upload
       v
FastAPI service (Render)
  API routes
       |
       +--> Profiling and validation services (Python/Pandas)
       +--> Repair engine (later milestone)
       +--> LLM provider adapter (later milestone; Groq first)
       +--> Audit/event service (later milestone)
       |
       +--> Supabase PostgreSQL and Storage (later milestone)
```

## Design rules

1. Deterministic code performs profiling, validation and actual data transformations.
2. The LLM diagnoses patterns and proposes explanations or repair plans. It does not directly mutate uploaded datasets.
3. A repair plan must be schema-validated and checked by deterministic safeguards before execution.
4. The original upload is immutable during the repair workflow. Store a separate repaired artifact.
5. Every applied change must be recorded with row/column identity, prior value, new value, reason, confidence, action status and validation result.
6. Uncertain or high-impact changes require human approval.
7. Avoid sending full raw datasets to the LLM. Send only the minimum relevant profile, samples or aggregates, with sensitive fields removed or masked when possible.
8. Never store API secrets in frontend code or a VITE_ variable.

## Initial API contract

### `GET /health`

Returns a small status payload for deployment checks.

### `POST /api/v1/datasets/profile`

- Input: multipart upload containing one CSV file.
- Current limit: 20 MB, controlled by `MAX_UPLOAD_BYTES`.
- Output: row count, column count, missing-cell count, duplicate-row count and per-column profile.
- Side effects: none; profiling is read-only.

## Planned API contracts

These are future endpoints, not implemented yet:

- `POST /api/v1/datasets/{dataset_id}/diagnose`
- `POST /api/v1/repairs/preview`
- `POST /api/v1/repairs/{repair_id}/approve`
- `POST /api/v1/repairs/{repair_id}/reject`
- `POST /api/v1/repairs/{repair_id}/validate`
- `GET /api/v1/datasets/{dataset_id}/audit`
- `GET /api/v1/datasets/{dataset_id}/export`

The team should agree on request/response schemas before implementing these routes in parallel.
