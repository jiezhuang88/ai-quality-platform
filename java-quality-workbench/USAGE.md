# How To Use The Java Workbench

## 1. Start A Change

Open the app and fill in:

- Change title.
- Business goal.
- AI assistance used.
- Acceptance criteria.
- Rollback plan.
- Residual risk.

This creates a clear quality context before code is reviewed or merged.

## 2. Score Risk

Use the Risk tab to score each dimension from 1 to 5:

- User impact.
- Data impact.
- Complexity.
- Reversibility.
- Confidence gap.

The app calculates the total score and risk level automatically.

## 3. Define The Test Plan

Use the Tests tab to document:

- Unit tests.
- Integration tests.
- E2E tests.
- Security tests.
- Performance tests.
- Manual checks.

The higher the risk, the stronger the test evidence should be.

## 4. Run The Quality Gate

Use the Gate tab to record required evidence:

- Unit tests pass.
- Integration tests pass.
- Static analysis pass.
- Secret scan pass.
- Security review done.
- Rollback plan ready.
- Human review done.

The merge recommendation changes based on risk level.

## 5. Export The Report

Use the Report tab to preview the Markdown report.

Click `Export Markdown` to write:

```text
reports/ai-quality-report.md
```

Attach this report to a PR, release note, or quality review record.
