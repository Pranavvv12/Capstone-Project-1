# Repository instructions

- Treat `requirements.md` and `architecture.md` as the source of truth.
- Keep generated API documentation deterministic.
- After changing files under `src/api/routes`, run `npm run docs:sync`.
- Before completing a change, run `npm run verify`.
- Never accept filesystem paths from API request data.
- Cover happy paths plus missing-file, stale-document, and empty-result cases.
