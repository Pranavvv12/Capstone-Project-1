# Summary

Adds an automated documentation synchronization capability to the existing
Express TypeScript API. Static route definitions now generate a deterministic,
version-controlled API reference that can be updated through an API or CLI and
enforced in CI.

# Changes Made

- Added `requirements.md`, `architecture.md`, `design-review.md`, and
  `impl-plan.md` to document the Agentic SDLC decisions.
- Added a typed documentation service for route discovery, rendering, stale
  checks, and filesystem synchronization.
- Added `POST /api/documentation/sync` with input validation and bounded errors.
- Added `docs:sync`, `docs:check`, and `verify` npm scripts.
- Added unit, controller, and filesystem integration tests.
- Added the generated `docs/api-reference.md`.
- Replaced the pull-only workflow with build, lint, test, and docs checks.
- Added Copilot repository instructions, a prompt, a review agent, and a skill.
- Added structured review, verification evidence, and changelog entries.

# Test Evidence

```text
npm run verify
TypeScript build: passed
ESLint: passed
Test suites: passed
Documentation check: up-to-date

npm run coverage -- --runInBand
Statements: 91.76%
Branches: 72.92%
Functions: 100%
Lines: 91.76%
```

# Known Limitations

- Dynamic/computed Express routes are not discoverable and must be documented
  separately.
- OpenAPI request/response schema inference and external publishing are out of
  scope.
- The legacy starter dependency tree reports known vulnerabilities and requires
  a separate breaking modernization effort before production release.

# Reviewer Checklist

- [ ] Confirm generated routes match `src/api/routes`.
- [ ] Confirm request data cannot control filesystem paths.
- [ ] Run `npm run verify`.
- [ ] Review missing-source, stale-document, and `Not Found` behavior.
- [ ] Approve the documented dependency-modernization follow-up.
