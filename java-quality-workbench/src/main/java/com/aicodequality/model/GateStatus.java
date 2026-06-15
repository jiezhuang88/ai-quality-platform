package com.aicodequality.model;

public class GateStatus {
    private boolean unitTestsPass;
    private boolean integrationTestsPass;
    private boolean staticAnalysisPass;
    private boolean secretScanPass;
    private boolean securityReviewDone;
    private boolean rollbackPlanReady;
    private boolean humanReviewDone;

    public boolean unitTestsPass() {
        return unitTestsPass;
    }

    public void setUnitTestsPass(boolean unitTestsPass) {
        this.unitTestsPass = unitTestsPass;
    }

    public boolean integrationTestsPass() {
        return integrationTestsPass;
    }

    public void setIntegrationTestsPass(boolean integrationTestsPass) {
        this.integrationTestsPass = integrationTestsPass;
    }

    public boolean staticAnalysisPass() {
        return staticAnalysisPass;
    }

    public void setStaticAnalysisPass(boolean staticAnalysisPass) {
        this.staticAnalysisPass = staticAnalysisPass;
    }

    public boolean secretScanPass() {
        return secretScanPass;
    }

    public void setSecretScanPass(boolean secretScanPass) {
        this.secretScanPass = secretScanPass;
    }

    public boolean securityReviewDone() {
        return securityReviewDone;
    }

    public void setSecurityReviewDone(boolean securityReviewDone) {
        this.securityReviewDone = securityReviewDone;
    }

    public boolean rollbackPlanReady() {
        return rollbackPlanReady;
    }

    public void setRollbackPlanReady(boolean rollbackPlanReady) {
        this.rollbackPlanReady = rollbackPlanReady;
    }

    public boolean humanReviewDone() {
        return humanReviewDone;
    }

    public void setHumanReviewDone(boolean humanReviewDone) {
        this.humanReviewDone = humanReviewDone;
    }

    public int passedCount() {
        int count = 0;
        count += unitTestsPass ? 1 : 0;
        count += integrationTestsPass ? 1 : 0;
        count += staticAnalysisPass ? 1 : 0;
        count += secretScanPass ? 1 : 0;
        count += securityReviewDone ? 1 : 0;
        count += rollbackPlanReady ? 1 : 0;
        count += humanReviewDone ? 1 : 0;
        return count;
    }

    public boolean readyToMerge(RiskLevel level) {
        boolean baseline = unitTestsPass && staticAnalysisPass && secretScanPass && humanReviewDone;
        if (level == RiskLevel.LOW) {
            return baseline;
        }
        if (level == RiskLevel.MEDIUM) {
            return baseline && integrationTestsPass;
        }
        return baseline && integrationTestsPass && securityReviewDone && rollbackPlanReady;
    }
}
