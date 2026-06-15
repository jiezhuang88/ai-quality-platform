# Industry Blueprint for AI Code Quality

This blueprint upgrades the original quality system into an application-ready platform.
It is designed for teams using AI coding assistants, autonomous coding agents, and AI-generated tests.

## Reference Practices

The system maps to these current industry practices:

- NIST AI Risk Management Framework: governance, mapping, measurement, and risk management for AI systems.
- NIST Secure Software Development Framework: secure software development practices and verification evidence.
- OWASP Top 10 for LLM Applications: AI-specific risks such as prompt injection, insecure output handling, excessive agency, and sensitive information disclosure.
- SLSA and OpenSSF practices: build provenance, dependency health, supply chain integrity, and artifact trust.
- SBOM and signing practices: component visibility, traceability, and release accountability.
- DORA metrics: delivery speed, stability, recovery, and change failure feedback loops.
- Secure by Design: security responsibility shifts into product engineering, not only post-release scanning.

## Platform Capability Domains

| Domain | Purpose | Evidence |
| --- | --- | --- |
| Governance | Defines standards for AI-assisted changes | Strategy, PR template, prompt guidance |
| Intake | Makes AI changes auditable before implementation | Scope, assumptions, acceptance criteria |
| Risk | Adjusts gate strictness by blast radius | Risk score, level, recommendation |
| Testing | Verifies behavior and resilience | Unit, contract, E2E, mutation, observability |
| Security | Prevents insecure generated code | SAST, secrets, SCA, LLM threat review |
| Supply Chain | Proves release artifact trust | SBOM, provenance, signing |
| Review | Combines AI review with human accountability | AI findings, human decisions |
| Metrics | Measures whether AI improves or harms quality | DORA, escape rate, AI failure rate |
| Learning | Converts failures into better gates | Regression tests, prompt updates, checklist updates |

## Risk-Based Gate Rules

Low risk:

- Unit tests.
- Static scan.
- Secret scan.
- Prompt and assumption traceability.
- Human review.

Medium risk adds:

- Integration or contract tests.
- Dependency scan.
- AI-assisted review.

High risk adds:

- Critical journey E2E.
- LLM/AI threat review.
- SBOM.
- Rollback plan.
- Release monitoring.

Critical risk adds:

- Build provenance or signing.
- Mutation or property testing.
- Observability validation.
- Explicit release approval.

## Why This Matters

AI coding increases throughput, but it also increases hidden risk:

- Generated code may be plausible but wrong.
- Generated tests may only confirm the generated implementation.
- AI may introduce dependencies, insecure defaults, or broad exception handling.
- Autonomous changes can blur accountability.

The platform treats AI output as untrusted until evidence proves otherwise.
