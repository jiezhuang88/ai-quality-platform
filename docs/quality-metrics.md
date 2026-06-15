# Quality Metrics

Use these metrics to measure whether AI coding is increasing delivery speed without hiding quality cost.

## Core Metrics

| Metric | Purpose | Suggested Cadence |
| --- | --- | --- |
| Defect escape rate | Measures production defects not caught before release | Weekly |
| Change failure rate | Measures releases that cause incidents or rollback | Weekly |
| AI-assisted change failure rate | Measures quality of AI-generated or AI-modified code | Weekly |
| Regression pass rate | Measures stability of the automated suite | Daily |
| Flaky test rate | Measures trustworthiness of tests | Weekly |
| Critical path coverage | Measures protection of important user journeys | Monthly |
| Mean time to detect | Measures observability and feedback speed | Weekly |
| Mean time to repair | Measures recovery ability | Weekly |

## Review Metrics

Track review comments by category:

- Correctness.
- Missing tests.
- Security.
- Architecture drift.
- Edge cases.
- Poor generated code quality.
- Incomplete requirements.

This helps identify whether the problem is prompting, review standards, test coverage, or architecture documentation.

## Quality Review Ritual

Every week, review:

- Which AI-assisted changes failed.
- Which defects escaped.
- Which tests were missing or weak.
- Which prompts led to bad assumptions.
- Which gate should be added, removed, or tuned.

The output should be one small improvement to the system, not a long report.
