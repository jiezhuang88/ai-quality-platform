# AI Code Review Standard

Use this standard when reviewing AI-assisted code.

## Required Review Questions

### Intent

- Does the code solve the stated problem and only that problem?
- Are acceptance criteria traceable to tests?
- Are assumptions documented in the PR?

### Correctness

- Are edge cases covered?
- Are failure paths handled deliberately?
- Are data transformations reversible or auditable where required?
- Are time, currency, precision, and locale rules correct?

### Security

- Are authorization checks explicit?
- Is sensitive data protected in logs, errors, and telemetry?
- Are inputs validated and encoded?
- Are dependencies trusted and pinned where appropriate?
- Are secrets absent from code and tests?

### Maintainability

- Does the code follow local architecture?
- Is the abstraction level justified?
- Are names and boundaries clear?
- Is generated code simple enough for humans to own?

### Tests

- Do tests verify behavior rather than implementation details?
- Do tests fail on the bug they claim to prevent?
- Are negative and boundary cases included?
- Are mocks realistic enough?
- Is flaky timing avoided?

### Operations

- Is the change observable?
- Is there a rollback or mitigation plan for risky changes?
- Are migrations backward compatible?
- Are alerts or dashboards affected?

## Red Flags

- Large generated change with weak explanation.
- Tests added only for happy paths.
- Broad `except`, `catch`, or silent fallback behavior.
- New dependency with unclear purpose.
- Security-sensitive logic without negative tests.
- Code that bypasses existing shared helpers.
- TODOs replacing real error handling.
- Generated comments that restate obvious code.
