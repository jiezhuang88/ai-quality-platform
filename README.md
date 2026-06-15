# AI Code Quality System

This repository is a ready-to-adapt quality system for teams using AI coding heavily.
It combines human review standards, test strategy, risk control, and executable quality gates.

## What Is Included

- `docs/quality-strategy.md`: Overall quality operating model.
- `docs/test-strategy.md`: Test pyramid, regression, CI, and release testing guidance.
- `docs/ai-code-review-standard.md`: Review checklist for AI-generated changes.
- `docs/risk-matrix.md`: Risk scoring model and examples.
- `docs/prompt-guidelines.md`: Safer prompting patterns for AI-generated code.
- `docs/quality-metrics.md`: Metrics and review ritual for continuous improvement.
- `docs/adoption-roadmap.md`: Step-by-step rollout plan.
- `docs/industry-quality-blueprint.md`: Industry-aligned blueprint for the upgraded platform.
- `docs/executable-ai-code-quality-gate-plan.md`: Executable plan for AI code quality gates.
- `docs/sdlc-ai-quality-system.md`: Full SDLC quality system for AI coding.
- `policies/sdlc-quality-policy.json`: Machine-readable SDLC quality policy.
- `scripts/sdlc_gate.py`: SDLC-wide evidence gate runner.
- `templates/sdlc-evidence-manifest.json`: Per-change evidence manifest template.
- `templates/change-risk-assessment.md`: Template for every AI-assisted change.
- `templates/pr-description.md`: Pull request template focused on quality evidence.
- `scripts/quality_gate.py`: Local quality gate runner.
- `.github/workflows/quality-gate.yml`: CI workflow that runs the quality gate.
- `.github/pull_request_template.md`: GitHub pull request template.
- `.github/ISSUE_TEMPLATE/escaped-defect.md`: Escaped defect learning template.
- `java-quality-workbench/`: Runnable Java Swing workbench for the full quality workflow.
- `web-quality-workbench/`: Browser-accessible platform built on the full quality system.
- `quality-platform/`: OpenSDLC AI Quality Platform, the product-grade local web app with executable PRD gates, PR gates, test asset flow, release gates, Agent Skills, and Mock Adapter integration.

## Quick Start

Run the local quality gate:

```bash
python3 scripts/quality_gate.py
```

Run the full SDLC evidence gate:

```bash
python3 scripts/sdlc_gate.py --manifest examples/sdlc/evidence-manifest.sample.json
```

For stricter checks, provide coverage data:

```bash
python3 scripts/quality_gate.py --coverage-file coverage/coverage-summary.json --min-coverage 80
```

The gate is intentionally framework-neutral. It checks for the quality artifacts and signals that should exist around AI-generated code, then can be extended for your stack.

## Recommended Workflow

1. Start every AI-assisted change with `templates/change-risk-assessment.md`.
2. Ask AI to generate implementation and tests together.
3. Run unit, integration, and security checks locally.
4. Run `python3 scripts/quality_gate.py`.
5. Open a PR using `templates/pr-description.md`.
6. Merge only when CI and human review both pass.

## Rollout Path

Start with `docs/adoption-roadmap.md`. The recommended sequence is:

1. Adopt risk assessment and PR templates.
2. Run the local gate on every change.
3. Add stack-specific tests and scanners.
4. Track quality metrics weekly.
5. Convert escaped defects into tests, prompt guidance, and gate improvements.

## Java Workbench

The Java desktop app provides an interactive quality workflow:

```bash
cd java-quality-workbench
./scripts/run.sh
```

Use it to fill in change information, calculate risk, define the test plan, check quality gate evidence, and export a Markdown report.

## Web Platform

The recommended product-grade local app is `quality-platform`:

```bash
cd quality-platform/backend
python3 server.py --host 127.0.0.1 --port 8790
```

Open:

```text
http://127.0.0.1:8790
```

Use the `开源运行台` page to run the full SDLC quality gate flow end to end.

Design docs:

- `docs/open-source-ai-quality-platform-prd.md`
- `docs/open-source-ai-quality-platform-technical-solution.md`

The earlier browser workbench remains available for reference:

```bash
cd web-quality-workbench
python3 server.py --host 127.0.0.1 --port 8787
```

Open:

```text
http://127.0.0.1:8787
```

It includes governance mapping, AI change intake, risk-based gates, testing strategy, security supply chain evidence, AI review, DORA-style metrics, and report export.

## Quality Principles

- AI-generated code is treated as untrusted until verified.
- High-risk changes require stronger evidence than low-risk changes.
- Tests are part of the change, not a follow-up task.
- Fast feedback is more valuable than late inspection.
- Quality ownership stays with the team, not the model.
