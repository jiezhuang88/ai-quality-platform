package com.aicodequality.service;

import com.aicodequality.model.GateStatus;
import com.aicodequality.model.QualityCase;
import com.aicodequality.model.RiskAssessment;
import com.aicodequality.model.RiskLevel;
import com.aicodequality.model.TestPlan;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class ReportGenerator {
    public String generate(QualityCase qualityCase) {
        RiskAssessment risk = qualityCase.riskAssessment();
        TestPlan tests = qualityCase.testPlan();
        GateStatus gate = qualityCase.gateStatus();
        RiskLevel level = risk.level();

        StringBuilder report = new StringBuilder();
        report.append("# AI Code Quality Report\n\n");
        report.append("- Generated At: ").append(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)).append("\n");
        report.append("- Change: ").append(orPlaceholder(qualityCase.title())).append("\n");
        report.append("- Risk: ").append(level.label()).append(" (").append(risk.totalScore()).append("/25)\n");
        report.append("- Merge Recommendation: ").append(gate.readyToMerge(level) ? "Ready" : "Not ready").append("\n\n");

        report.append("## Change Summary\n\n");
        report.append("### Business Goal\n\n").append(orPlaceholder(qualityCase.businessGoal())).append("\n\n");
        report.append("### AI Assistance\n\n").append(orPlaceholder(qualityCase.aiUsage())).append("\n\n");
        report.append("### Acceptance Criteria\n\n").append(orPlaceholder(qualityCase.acceptanceCriteria())).append("\n\n");

        report.append("## Risk Assessment\n\n");
        report.append("| Dimension | Score |\n");
        report.append("| --- | --- |\n");
        report.append("| User impact | ").append(risk.userImpact()).append(" |\n");
        report.append("| Data impact | ").append(risk.dataImpact()).append(" |\n");
        report.append("| Complexity | ").append(risk.complexity()).append(" |\n");
        report.append("| Reversibility | ").append(risk.reversibility()).append(" |\n");
        report.append("| Confidence | ").append(risk.confidence()).append(" |\n\n");

        report.append("## Test Plan\n\n");
        appendSection(report, "Unit Tests", tests.unitTests());
        appendSection(report, "Integration Tests", tests.integrationTests());
        appendSection(report, "E2E Tests", tests.e2eTests());
        appendSection(report, "Security Tests", tests.securityTests());
        appendSection(report, "Performance Tests", tests.performanceTests());
        appendSection(report, "Manual Checks", tests.manualChecks());

        report.append("## Quality Gate\n\n");
        report.append("- Unit tests pass: ").append(yesNo(gate.unitTestsPass())).append("\n");
        report.append("- Integration tests pass: ").append(yesNo(gate.integrationTestsPass())).append("\n");
        report.append("- Static analysis pass: ").append(yesNo(gate.staticAnalysisPass())).append("\n");
        report.append("- Secret scan pass: ").append(yesNo(gate.secretScanPass())).append("\n");
        report.append("- Security review done: ").append(yesNo(gate.securityReviewDone())).append("\n");
        report.append("- Rollback plan ready: ").append(yesNo(gate.rollbackPlanReady())).append("\n");
        report.append("- Human review done: ").append(yesNo(gate.humanReviewDone())).append("\n\n");

        report.append("## Rollback And Residual Risk\n\n");
        appendSection(report, "Rollback Plan", qualityCase.rollbackPlan());
        appendSection(report, "Residual Risk", qualityCase.residualRisk());
        return report.toString();
    }

    private void appendSection(StringBuilder report, String title, String body) {
        report.append("### ").append(title).append("\n\n");
        report.append(orPlaceholder(body)).append("\n\n");
    }

    private String yesNo(boolean value) {
        return value ? "Yes" : "No";
    }

    private String orPlaceholder(String value) {
        if (value == null || value.isBlank()) {
            return "_Not provided_";
        }
        return value;
    }
}
