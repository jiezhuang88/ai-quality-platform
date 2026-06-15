#!/usr/bin/env python3
"""SDLC-wide quality gate for AI-assisted code changes."""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_POLICY = ROOT / "policies" / "sdlc-quality-policy.json"


@dataclass
class StageResult:
    stage_id: str
    stage_name: str
    owner: str
    passed: bool
    required: list[str]
    missing: list[str]


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def present(value: Any) -> bool:
    if value is None:
        return False
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return bool(value.strip())
    if isinstance(value, (list, dict, tuple, set)):
        return bool(value)
    return True


def evaluate(policy: dict[str, Any], manifest: dict[str, Any]) -> list[StageResult]:
    risk_level = str(manifest.get("risk_level", "")).lower()
    allowed_risks = set(policy.get("risk_levels", []))
    if risk_level not in allowed_risks:
        raise ValueError(f"Unsupported risk_level '{risk_level}'. Expected one of: {', '.join(sorted(allowed_risks))}")

    evidence = manifest.get("evidence", {})
    if not isinstance(evidence, dict):
        raise ValueError("Manifest field 'evidence' must be an object.")

    results: list[StageResult] = []
    for stage in policy.get("stages", []):
        required = list(stage.get("required_evidence", {}).get(risk_level, []))
        missing = [key for key in required if not present(evidence.get(key))]
        results.append(
            StageResult(
                stage_id=stage["id"],
                stage_name=stage["name"],
                owner=stage["owner"],
                passed=not missing,
                required=required,
                missing=missing,
            )
        )
    return results


def markdown_report(policy: dict[str, Any], manifest: dict[str, Any], results: list[StageResult]) -> str:
    failed = [result for result in results if not result.passed]
    risk_level = str(manifest.get("risk_level", "")).upper()
    lines = [
        "# AI Coding SDLC Quality Gate Report",
        "",
        f"- Policy: {policy.get('name', 'Unknown')}",
        f"- Policy Version: {policy.get('version', 'Unknown')}",
        f"- Change: {manifest.get('change_id', 'Unknown')} - {manifest.get('title', 'Untitled')}",
        f"- Risk Level: {risk_level}",
        f"- AI Assisted: {manifest.get('ai_assisted', False)}",
        f"- Decision: {'BLOCK' if failed else 'PASS'}",
        "",
        "## Stage Results",
        "",
        "| Stage | Owner | Result | Missing Evidence |",
        "| --- | --- | --- | --- |",
    ]

    for result in results:
        missing = ", ".join(result.missing) if result.missing else "-"
        lines.append(f"| {result.stage_name} | {result.owner} | {'PASS' if result.passed else 'FAIL'} | {missing} |")

    lines.extend(
        [
            "",
            "## Required Follow-Up",
            "",
        ]
    )
    if failed:
        for result in failed:
            lines.append(f"- {result.stage_name}: 补齐 {', '.join(result.missing)}")
    else:
        lines.append("- 所有 SDLC 阶段证据满足当前风险等级要求。")

    return "\n".join(lines) + "\n"


def print_results(policy: dict[str, Any], manifest: dict[str, Any], results: list[StageResult]) -> None:
    failed = [result for result in results if not result.passed]
    print(f"Policy: {policy.get('name')} v{policy.get('version')}")
    print(f"Change: {manifest.get('change_id', 'Unknown')} - {manifest.get('title', 'Untitled')}")
    print(f"Risk: {manifest.get('risk_level')}")
    print()

    for result in results:
        status = "PASS" if result.passed else "FAIL"
        print(f"[{status}] {result.stage_name} ({result.owner})")
        if result.missing:
            print(f"       Missing: {', '.join(result.missing)}")

    print()
    if failed:
        print(f"SDLC gate blocked: {len(failed)} stage(s) missing required evidence.")
    else:
        print("SDLC gate passed.")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run SDLC quality gate for AI-assisted changes.")
    parser.add_argument("--manifest", type=Path, required=True, help="Path to a change evidence manifest JSON.")
    parser.add_argument("--policy", type=Path, default=DEFAULT_POLICY, help="Path to SDLC quality policy JSON.")
    parser.add_argument("--report", type=Path, help="Optional Markdown report output path.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    policy = load_json(args.policy)
    manifest = load_json(args.manifest)
    results = evaluate(policy, manifest)
    print_results(policy, manifest, results)

    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(markdown_report(policy, manifest, results), encoding="utf-8")

    return 1 if any(not result.passed for result in results) else 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(2)
