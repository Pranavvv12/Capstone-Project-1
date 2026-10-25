# Design Review

## Review summary

The proposed shared service with thin API and CLI adapters is appropriate for
the current repository. It avoids coupling documentation generation to MongoDB
and makes deterministic verification possible in CI.

## Findings and decisions

| Area | Risk or gap | Decision |
|---|---|---|
| Correctness | Dynamic Express expressions cannot be safely inferred with a regex parser | Support static string declarations and document this limitation |
| Security | User-provided paths could read or overwrite arbitrary files | Do not accept paths through the API |
| Reliability | Timestamps would make every check stale | Exclude volatile values from generated content |
| Error handling | Empty repositories can look like successful complete documentation | Emit an explicit `Not Found` row |
| Error handling | Missing route directories could silently create empty output | Raise a typed not-found error |
| Concurrency | Simultaneous writes could race | Generate deterministic content and use one whole-file write; distributed locking is out of scope |
| Testability | Existing app startup requires MongoDB | Test the service and controller adapters independently of server startup |
| CI | Existing workflow does not build or test | Replace it with install, build, lint, test, and docs-check steps |

## Approval

Approved with the safeguards above. No architecture change is required.
