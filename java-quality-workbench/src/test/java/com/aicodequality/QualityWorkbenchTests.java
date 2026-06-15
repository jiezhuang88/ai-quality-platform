package com.aicodequality;

import com.aicodequality.model.GateStatus;
import com.aicodequality.model.QualityCase;
import com.aicodequality.model.RiskAssessment;
import com.aicodequality.model.RiskLevel;
import com.aicodequality.service.ControlCatalog;
import com.aicodequality.service.ReportGenerator;

public class QualityWorkbenchTests {
    public static void main(String[] args) {
        testRiskLevelCalculation();
        testGateRequiresMoreForHighRisk();
        testReportContainsRiskAndRecommendation();
        testControlCatalogContainsIndustryMappings();
        System.out.println("All Java quality workbench tests passed.");
    }

    private static void testRiskLevelCalculation() {
        RiskAssessment risk = new RiskAssessment();
        risk.setUserImpact(5);
        risk.setDataImpact(5);
        risk.setComplexity(5);
        risk.setReversibility(5);
        risk.setConfidence(5);

        assertEquals(RiskLevel.CRITICAL, risk.level(), "25 points should be critical");
    }

    private static void testGateRequiresMoreForHighRisk() {
        GateStatus gate = new GateStatus();
        gate.setUnitTestsPass(true);
        gate.setStaticAnalysisPass(true);
        gate.setSecretScanPass(true);
        gate.setHumanReviewDone(true);

        assertFalse(gate.readyToMerge(RiskLevel.HIGH), "High risk needs integration, security review, and rollback evidence");

        gate.setIntegrationTestsPass(true);
        gate.setSecurityReviewDone(true);
        gate.setRollbackPlanReady(true);

        assertTrue(gate.readyToMerge(RiskLevel.HIGH), "High risk should pass when all required evidence is present");
    }

    private static void testReportContainsRiskAndRecommendation() {
        QualityCase qualityCase = new QualityCase();
        qualityCase.setTitle("Add permission checks");
        qualityCase.riskAssessment().setUserImpact(4);
        qualityCase.riskAssessment().setDataImpact(4);
        qualityCase.riskAssessment().setComplexity(4);
        qualityCase.riskAssessment().setReversibility(4);
        qualityCase.riskAssessment().setConfidence(4);

        String report = new ReportGenerator().generate(qualityCase);

        assertTrue(report.contains("Add permission checks"), "Report should contain change title");
        assertTrue(report.contains("High"), "Report should contain risk level");
        assertTrue(report.contains("Not ready"), "Report should contain merge recommendation");
    }

    private static void testControlCatalogContainsIndustryMappings() {
        ControlCatalog catalog = new ControlCatalog();

        assertTrue(catalog.domains().size() >= 6, "Catalog should include the full quality system domains");
        assertTrue(catalog.domains().stream().anyMatch(domain -> domain.industryMapping().contains("SLSA")), "Catalog should include supply chain mapping");
        assertTrue(catalog.domains().stream().anyMatch(domain -> domain.industryMapping().contains("DORA")), "Catalog should include metrics mapping");
    }

    private static void assertEquals(Object expected, Object actual, String message) {
        if (!expected.equals(actual)) {
            throw new AssertionError(message + ". Expected " + expected + " but got " + actual);
        }
    }

    private static void assertTrue(boolean value, String message) {
        if (!value) {
            throw new AssertionError(message);
        }
    }

    private static void assertFalse(boolean value, String message) {
        if (value) {
            throw new AssertionError(message);
        }
    }
}
