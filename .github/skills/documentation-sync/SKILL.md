---
name: documentation-sync
description: Keeps the generated Express API reference aligned with route source
---

1. Inspect changed files under `src/api/routes`.
2. Run `npm run docs:sync`.
3. Review `docs/api-reference.md` for unexpected `Not Found` values.
4. Run `npm run docs:check`.
5. Include the generated document in the same change as the route update.
