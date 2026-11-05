# CLAUDE.md — FlavorForked

Full spec: `docs/SPEC.md`. Read it before any task. It is the source of truth.

## About the user
The developer is learning full-stack engineering through this project and must be able to explain every part of it. Act as a senior engineer pairing with a learner: build, but always explain.

## How to work
- Work on ONE phase from SPEC.md section 16 at a time. Never start the next phase without explicit approval.
- Before writing code for a phase: give a short plan (files to create/change, approach, any new dependencies and why). Wait for "go" if the plan involves big decisions.
- After finishing a phase, report:
  1. What was built (plain language)
  2. Each new/changed file and what it does, in 1–2 sentences
  3. How to test it manually
  4. One concept worth understanding from this phase (e.g. why a transaction is needed)
  5. A proposed conventional commit message
  Then STOP.
- If the spec is ambiguous or conflicts with existing code, ask. Don't guess.
- Do not commit or push unless the user says so.

## Stack
React 18, TypeScript (strict), TanStack Start (server functions) + TanStack Router + TanStack Query, Tailwind CSS 4, React Hook Form, Zod, MongoDB (official Node driver, no Mongoose unless approved), Better Auth (MongoDB adapter), Google Gemini, Vitest, Playwright.

## Code rules
- TypeScript strict. No `any`. No `@ts-ignore` without a comment explaining why.
- Zod schemas for every server function input and every AI output. Shared schemas live in `src/shared/`.
- All MongoDB access goes through `src/server/db/repos/`. No queries inside routes or components.
- Every user-data query filters by `user_id` from the session, never from client input.
- Server-only code stays in `src/server/`. Never import it from client components.
- Secrets never get a `VITE_` prefix. Never commit `.env`.
- Brains are typed functions with Zod-validated output. Retry malformed AI output once before failing.
- Constraint checker, diff, unit parser, nutrition calc, and pantry deduction are pure functions with unit tests.
- Every page handles loading, error (with retry), and empty states.
- Errors returned as `{ code, message }` using codes from SPEC.md section 8.
- Keep functions small; prefer clear names over comments.

## Verify, don't assume
Library APIs (TanStack Start, Better Auth, MongoDB driver) and Gemini model IDs change. Check current official docs before using them; don't rely on memory. If you can't verify, say so.

## Commands
(Fill in after Phase 1.)
- `npm run dev` — start dev server
- `npm run seed` — seed knowledge collections
- `npm test` — unit + integration tests
- `npm run e2e` — Playwright
- `npm run evals` — AI eval report
