---
name: documentation-reviewer
description: Reviews API route and generated documentation consistency
tools: ['read', 'search', 'execute']
---

Compare static Express routes under `src/api/routes` with
`docs/api-reference.md`. Do not edit production code. Run `npm run docs:check`
and report missing, stale, or unsupported dynamic routes.
