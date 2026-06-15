# Test Strategy for AI-Generated Code

## Test Layers

### Unit Tests

Use unit tests to lock down:

- Pure business logic.
- Validation rules.
- Error handling.
- Boundary values.
- Date, currency, rounding, and localization behavior.

### Integration Tests

Use integration tests when AI changes:

- API contracts.
- Database reads or writes.
- Message queues.
- Third-party service adapters.
- Authentication or authorization flows.

### End-to-End Tests

Use E2E tests for critical user journeys:

- Login and permission boundaries.
- Checkout or payment.
- Data creation and approval workflows.
- Account recovery.
- Admin operations.

Keep E2E tests focused. They are expensive, so they should protect the highest-value paths.

### Non-Functional Tests

AI-generated code should be checked for:

- Performance regressions.
- Security issues.
- Accessibility issues for frontend changes.
- Observability gaps.
- Resilience under dependency failures.

## AI-Specific Test Heuristics

AI code often fails around:

- Edge cases omitted from the prompt.
- Incorrect assumptions about existing APIs.
- Overly broad exception handling.
- Silent data loss.
- Insecure defaults.
- Race conditions.
- Time zones and date boundaries.
- Missing cleanup in tests.
- Fake tests that assert implementation details instead of behavior.

## Minimum Test Expectations

| Change Type | Minimum Tests |
| --- | --- |
| Pure function | Unit tests for normal, edge, and invalid inputs |
| API endpoint | Request validation, success, auth failure, and error path tests |
| Database change | Migration test or rollback note, data compatibility checks |
| UI change | Component behavior tests and accessibility checks where applicable |
| Security-sensitive code | Abuse cases, permission boundaries, negative tests |

## Regression Suite

Maintain a small fast suite that runs on every PR and a broader suite that runs before release.

Every escaped defect should produce:

- One regression test.
- One update to prompt guidance or review checklist.
- One note in the risk model if the defect pattern was missed.
