# AI Code Quality Strategy

## Goal

Build a repeatable system that allows teams to use AI coding speed without losing control of correctness, security, maintainability, and release confidence.

## Operating Model

### 1. Quality Before Generation

Every AI-assisted change should begin with:

- Clear business intent.
- Acceptance criteria.
- Risk level.
- Expected tests.
- Rollback or mitigation plan for high-risk changes.

Good prompts should include constraints such as architecture boundaries, test expectations, observability requirements, and forbidden changes.

### 2. AI Code Is Not Automatically Trusted

AI-generated code must pass the same gates as human-written code:

- Static checks.
- Unit tests.
- Integration or contract tests when interfaces change.
- Security review for sensitive flows.
- Human code review.
- CI quality gate.

### 3. Risk-Based Verification

Testing depth should match risk:

| Risk | Typical Change | Required Evidence |
| --- | --- | --- |
| Low | UI copy, internal refactor | Unit tests or snapshot where relevant, peer review |
| Medium | API behavior, data mapping, validation | Unit tests, integration tests, regression notes |
| High | Auth, payment, permission, data migration | Full test evidence, security review, rollback plan |
| Critical | Production safety, compliance, financial correctness | Dedicated test plan, approval, monitoring plan |

### 4. Quality Gates

Minimum merge gates:

- Tests exist for changed behavior.
- No high-severity static analysis findings.
- No secrets committed.
- Risk assessment exists for AI-assisted changes.
- Coverage meets the agreed threshold or gap is justified.
- PR describes test evidence and residual risk.

### 5. Feedback Loops

Track these metrics weekly:

- Defect escape rate.
- AI-generated change failure rate.
- Regression failure rate.
- Mean time to detect defects.
- Mean time to fix defects.
- Test flakiness rate.
- Coverage of critical business paths.

## Roles

### Test Engineer

- Defines quality gates and risk model.
- Builds automated regression coverage.
- Reviews test quality, not only test existence.
- Uses production incidents and escaped defects to improve prompts, test data, and gates.

### Developer

- Provides implementation and test evidence.
- Keeps AI prompts aligned with architecture and coding standards.
- Fixes failing checks before review.

### Reviewer

- Challenges assumptions.
- Checks risk classification.
- Reviews edge cases, security impact, and maintainability.

## Definition of Done

A change is done when:

- Acceptance criteria are met.
- Automated tests pass.
- Risk-specific evidence is attached.
- Observability and rollback are addressed when needed.
- Review comments are resolved.
- CI quality gate passes.
