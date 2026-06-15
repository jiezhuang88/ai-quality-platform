# Java AI Code Quality Workbench

This is a dependency-free Java Swing application for managing AI-assisted code quality.
It turns the quality system in the repository root into an interactive workflow and domain model.

## Workflow

1. Control framework: map local quality assets to industry practices.
2. Change: describe the AI-assisted code change.
3. Risk: score impact, data, complexity, reversibility, confidence, compliance, AI agency, and supply chain impact.
4. Tests: define unit, contract, E2E, security, performance, and observability checks.
5. Security supply chain: record SAST, SCA, secrets, SBOM, provenance, and LLM threat review evidence.
6. Gate: review required quality evidence.
7. Metrics: track DORA, escaped defects, and AI change failure rate.
8. Report: generate and export a Markdown quality report.

## Requirements

- JDK 17 or newer.

## Run

From this directory:

```bash
./scripts/run.sh
```

Or manually:

```bash
mkdir -p out
javac -d out $(find src/main/java -name "*.java")
java -cp out com.aicodequality.app.QualityWorkbenchApp
```

## Test

```bash
./scripts/test.sh
```

The tests use a small standard-library test runner, so no Maven, Gradle, or JUnit download is required.

## Exported Reports

Reports are written to `reports/ai-quality-report.md`.
