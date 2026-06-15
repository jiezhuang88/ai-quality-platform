import unittest

from scripts.quality_gate import extract_coverage_percentage
from scripts.sdlc_gate import evaluate


class QualityGateTests(unittest.TestCase):
    def test_extract_coverage_from_istanbul_summary(self):
        data = {"total": {"lines": {"pct": 83.4}}}

        self.assertEqual(extract_coverage_percentage(data), 83.4)

    def test_extract_coverage_from_nested_summary(self):
        data = {"project": {"summary": {"coverage": 91}}}

        self.assertEqual(extract_coverage_percentage(data), 91.0)

    def test_extract_coverage_returns_none_when_absent(self):
        data = {"total": {"lines": {"covered": 10, "total": 20}}}

        self.assertIsNone(extract_coverage_percentage(data))

    def test_sdlc_gate_detects_missing_high_risk_evidence(self):
        policy = {
            "risk_levels": ["low", "medium", "high", "critical"],
            "stages": [
                {
                    "id": "verification",
                    "name": "测试验证",
                    "owner": "Test Engineer",
                    "required_evidence": {"high": ["unit_test_result", "e2e_test_result"]},
                }
            ],
        }
        manifest = {"risk_level": "high", "evidence": {"unit_test_result": "passed"}}

        results = evaluate(policy, manifest)

        self.assertFalse(results[0].passed)
        self.assertEqual(results[0].missing, ["e2e_test_result"])


if __name__ == "__main__":
    unittest.main()
