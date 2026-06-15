#!/usr/bin/env python3
"""Framework-neutral quality gate for AI-assisted codebases."""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

SECURITY_PATTERNS = [
    re.compile(r"AKIA[0-9A-Z]{16}"),
    re.compile(r"-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    re.compile(r"(?i)(password|passwd|secret|api_key|token)\s*=\s*['\"][^'\"]{8,}['\"]"),
]

SOURCE_EXTENSIONS = {
    ".py",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".java",
    ".go",
    ".rb",
    ".php",
    ".cs",
    ".rs",
}

TEST_HINTS = ("test", "spec", "__tests__")


@dataclass
class CheckResult:
    name: str
    passed: bool
    message: str


def iter_files(root: Path) -> list[Path]:
    ignored_dirs = {".git", "node_modules", ".venv", "venv", "dist", "build", "coverage", ".pytest_cache"}
    files: list[Path] = []
    for path in root.rglob("*"):
        if any(part in ignored_dirs for part in path.parts):
            continue
        if path.is_file():
            files.append(path)
    return files


def check_required_docs(root: Path) -> CheckResult:
    required = [
        "docs/quality-strategy.md",
        "docs/test-strategy.md",
        "docs/ai-code-review-standard.md",
        "docs/risk-matrix.md",
        "docs/sdlc-ai-quality-system.md",
        "policies/sdlc-quality-policy.json",
        "scripts/sdlc_gate.py",
        "templates/change-risk-assessment.md",
        "templates/pr-description.md",
        "templates/sdlc-evidence-manifest.json",
    ]
    missing = [item for item in required if not (root / item).exists()]
    if missing:
        return CheckResult("required-docs", False, f"Missing quality assets: {', '.join(missing)}")
    return CheckResult("required-docs", True, "Quality documentation and templates are present.")


def check_tests_exist(files: list[Path]) -> CheckResult:
    source_files = [path for path in files if path.suffix in SOURCE_EXTENSIONS and "scripts/quality_gate.py" not in path.as_posix()]
    if not source_files:
        return CheckResult("tests-exist", True, "No application source files detected yet.")

    test_files = [
        path
        for path in files
        if path.suffix in SOURCE_EXTENSIONS and any(hint in path.as_posix().lower() for hint in TEST_HINTS)
    ]
    if test_files:
        return CheckResult("tests-exist", True, f"Detected {len(test_files)} test-related file(s).")
    return CheckResult("tests-exist", False, "Application source exists, but no test files were detected.")


def check_security_patterns(files: list[Path]) -> CheckResult:
    findings: list[str] = []
    for path in files:
        if path.suffix.lower() in {".png", ".jpg", ".jpeg", ".gif", ".pdf", ".zip"}:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for pattern in SECURITY_PATTERNS:
            if pattern.search(text):
                findings.append(str(path.relative_to(ROOT)))
                break

    if findings:
        return CheckResult("secret-scan", False, f"Potential secrets found in: {', '.join(findings)}")
    return CheckResult("secret-scan", True, "No obvious secret patterns found.")


def check_coverage(coverage_file: Path | None, min_coverage: float) -> CheckResult:
    if coverage_file is None:
        return CheckResult("coverage", True, "No coverage file provided; skipped coverage threshold check.")

    if not coverage_file.exists():
        return CheckResult("coverage", False, f"Coverage file does not exist: {coverage_file}")

    data = json.loads(coverage_file.read_text(encoding="utf-8"))
    coverage = extract_coverage_percentage(data)
    if coverage is None:
        return CheckResult("coverage", False, "Could not find a coverage percentage in the provided file.")
    if coverage < min_coverage:
        return CheckResult("coverage", False, f"Coverage {coverage:.2f}% is below threshold {min_coverage:.2f}%.")
    return CheckResult("coverage", True, f"Coverage {coverage:.2f}% meets threshold {min_coverage:.2f}%.")


def extract_coverage_percentage(data: object) -> float | None:
    if isinstance(data, dict):
        candidate_paths = [
            ("total", "lines", "pct"),
            ("total", "statements", "pct"),
            ("totals", "percent_covered"),
            ("summary", "coverage"),
        ]
        for path in candidate_paths:
            current: object = data
            for key in path:
                if not isinstance(current, dict) or key not in current:
                    break
                current = current[key]
            else:
                if isinstance(current, (int, float)):
                    return float(current)

        for value in data.values():
            nested = extract_coverage_percentage(value)
            if nested is not None:
                return nested
    return None


def run(args: argparse.Namespace) -> int:
    files = iter_files(ROOT)
    checks = [
        check_required_docs(ROOT),
        check_tests_exist(files),
        check_security_patterns(files),
        check_coverage(args.coverage_file, args.min_coverage),
    ]

    failed = [check for check in checks if not check.passed]
    for check in checks:
        status = "PASS" if check.passed else "FAIL"
        print(f"[{status}] {check.name}: {check.message}")

    if failed:
        print(f"\nQuality gate failed: {len(failed)} check(s) need attention.")
        return 1

    print("\nQuality gate passed.")
    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run AI code quality gate checks.")
    parser.add_argument("--coverage-file", type=Path, help="Path to a coverage summary JSON file.")
    parser.add_argument("--min-coverage", type=float, default=80.0, help="Minimum acceptable coverage percentage.")
    return parser.parse_args()


if __name__ == "__main__":
    sys.exit(run(parse_args()))
