# Application Flow

```text
AI-assisted change
        |
        v
Control framework
  - quality strategy
  - industry mapping
  - required evidence
        |
        v
Change tab
  - title
  - goal
  - AI usage
  - acceptance criteria
  - rollback and residual risk
        |
        v
Risk tab
  - score five risk dimensions
  - calculate Low, Medium, High, or Critical
        |
        v
Tests tab
  - define test evidence by layer
        |
        v
Gate tab
  - mark evidence completion
  - calculate merge readiness based on risk
  - strengthen gates for high and critical risk
        |
        v
Metrics tab
  - DORA metrics
  - escaped defects
  - AI change failure rate
        |
        v
Report tab
  - preview Markdown quality report
  - export to reports/ai-quality-report.md
```

## Merge Readiness Rules

Low risk requires:

- Unit tests pass.
- Static analysis pass.
- Secret scan pass.
- Human review done.

Medium risk additionally requires:

- Integration tests pass.

High and critical risk additionally require:

- Security review done.
- Rollback plan ready.

## Main Classes

- `QualityWorkbenchApp`: Application entry point.
- `QualityWorkbenchFrame`: Swing UI and workflow orchestration.
- `QualityCase`: Aggregate model for the quality workflow.
- `RiskAssessment`: Risk scoring logic.
- `GateStatus`: Merge readiness rules.
- `ControlCatalog`: Control domains mapped to NIST AI RMF, SSDF, OWASP LLM Top 10, SLSA, OpenSSF, SBOM, Sigstore, and DORA.
- `ReportGenerator`: Markdown report generation.
