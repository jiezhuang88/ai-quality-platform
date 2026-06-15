# Adoption Roadmap

## Phase 1: Baseline

Duration: 1-2 weeks.

- Adopt the PR template.
- Require a risk assessment for medium and higher risk changes.
- Run the local quality gate before every merge.
- Identify the top 10 critical user journeys.
- Record current defect escape rate and regression failure rate.

## Phase 2: Automation

Duration: 2-4 weeks.

- Connect the quality gate to CI.
- Add stack-specific test commands.
- Add dependency, secret, and static analysis scanning.
- Create fast regression coverage for critical journeys.
- Track flaky tests and fix the worst offenders.

## Phase 3: Risk-Based Release

Duration: 4-8 weeks.

- Require stronger evidence for high-risk changes.
- Add staged rollout guidance.
- Add production monitoring checks to release plans.
- Review escaped defects every week.
- Update prompts, tests, and review standards based on real failures.

## Phase 4: Continuous Improvement

Ongoing.

- Audit AI-generated code quality trends.
- Improve test data realism.
- Expand contract tests around important APIs.
- Add chaos or resilience testing for critical services.
- Keep the gate strict enough to matter and fast enough to use.
