# Verification Evidence

Verified on 2026-10-23.

## Full verification

Command:

```text
npm run verify
```

Result:

```text
TypeScript build: passed
ESLint: passed
Test suites: 3 passed, 3 total
Tests: 8 passed, 8 total
Documentation check: up-to-date
Generated routes: 2
Checksum: fe55e44f37b4b90995579d338ad9db6023695a006d7533f64979cf4377813a6f
```

## Coverage

Command:

```text
npm run coverage -- --runInBand
```

Result:

```text
Statements: 91.76%
Branches: 72.92%
Functions: 100%
Lines: 91.76%
Coverage thresholds: passed
```

## Content quality

- The generated document has one heading, generation guidance, a route count,
  and a consistently formatted route table.
- Paths are repository-relative and contain no local absolute path.
- The generated output contains both current API routes.
- `npm run docs:check` confirms byte-for-byte freshness.
