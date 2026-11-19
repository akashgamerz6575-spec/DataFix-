# First Setup Session — Checklist

## Account and access

- [ ] One teammate creates a GitHub account and private `datafix` repository.
- [ ] Add the other two teammates as collaborators.
- [ ] Each teammate installs Git, Node.js 26 LTS, Python 3.13 and Antigravity.
- [ ] Each teammate clones the repository and starts frontend and backend locally.
- [ ] Each teammate uploads the sample CSV and confirms the profile result.

## Team ownership

- [ ] Confirm Member 1 owns architecture, integration, AI adapter and deployment.
- [ ] Confirm Member 2 owns frontend.
- [ ] Confirm Member 3 owns data profiling, repair and validation engine.
- [ ] Create GitHub Issues for the first milestone.

## Platform accounts (create only when ready)

- [ ] GitHub: private repository and collaborators.
- [ ] Vercel: import the repository, set project root to `frontend`.
- [ ] Render: connect the repository, use `render.yaml` or set root directory to `backend`.
- [ ] Supabase: create a project and keep service credentials server-side.
- [ ] GroqCloud: create a personal key and confirm available model IDs and rate limits.

## First deployment test

- [ ] Deploy the API before the full UI is complete; verify `/health`.
- [ ] Deploy the Vite frontend.
- [ ] Set `VITE_API_BASE_URL` in Vercel to the Render service URL.
- [ ] Set `CORS_ORIGINS` in Render to the exact Vercel origin.
- [ ] Upload the sample CSV using the public URL.
- [ ] Test from a second device or a different network.
