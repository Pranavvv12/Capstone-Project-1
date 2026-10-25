# Automated Documentation Sync - Requirements

## User story

As a maintainer, I want API documentation to be generated from the repository's
route definitions so that documentation stays aligned with the implementation
and pull requests fail when generated documentation is stale.

## Assumptions and scope

- The current Node.js/TypeScript repository is the source of truth.
- Express route files under `src/api/routes` are in scope.
- Generated output is committed at `docs/api-reference.md`.
- Synchronization can be requested through an authenticated deployment boundary
  using the API or locally using an npm command. Authentication itself is an
  infrastructure concern and is outside this capstone.
- Existing user API behavior must remain unchanged.

## Functional requirements

1. The system shall discover TypeScript Express route files recursively.
2. It shall extract supported HTTP methods and combine router paths with the
   `/api` prefix and each route module's base path.
3. It shall generate deterministic Markdown containing the document title,
   source location, route count, method, path, and source file.
4. It shall write the generated document only when content has changed.
5. It shall report `updated` or `up-to-date`, the output path, and route count.
6. It shall expose `POST /api/documentation/sync`.
7. The endpoint shall require a non-empty `title` field and return HTTP 400 for
   invalid input.
8. It shall expose `npm run docs:sync` to update documentation.
9. It shall expose `npm run docs:check` and return a non-zero exit code when the
   committed document is missing or stale.
10. When no routes are found, the output shall explicitly contain `Not Found`.
11. When the configured route source directory is missing, the operation shall
    fail explicitly with a not-found error and shall not create success-shaped
    output.

## Non-functional requirements

- **Determinism:** Identical source produces byte-identical Markdown.
- **Security:** Clients cannot provide source or output paths; all paths are
  repository-controlled. Error responses do not expose stack traces.
- **Reliability:** Writes create the target directory when needed and avoid
  rewriting unchanged files.
- **Maintainability:** Route discovery, rendering, and persistence remain in a
  typed service independent of Express.
- **Compatibility:** The implementation supports the repository's TypeScript
  3.5 and Node.js 12 baseline.
- **Testability:** Unit tests cover parsing/rendering; integration tests cover
  filesystem sync, stale checks, missing sources, and empty results.
- **CI:** Build, lint, tests, and documentation freshness are checked on pushes
  and pull requests.

## Acceptance criteria

- Given a route module with `/users` and `POST /`, generated documentation lists
  `POST /api/users`.
- Given current generated documentation, a sync reports `up-to-date` and does
  not rewrite the file.
- Given stale or absent generated documentation, `docs:check` fails and
  `docs:sync` repairs it.
- Given a missing `title`, the API returns 400 with a clear message.
- Given no discoverable routes, generated documentation contains `Not Found`.
- Given a missing route directory, sync fails with a not-found error.

## Out of scope

- Publishing to Confluence or Jira.
- Parsing dynamically constructed routes.
- Authentication/authorization provider implementation.
- OpenAPI schema inference from controller request and response bodies.
