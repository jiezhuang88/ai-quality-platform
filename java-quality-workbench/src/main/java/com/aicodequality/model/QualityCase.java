package com.aicodequality.model;

public class QualityCase {
    private String title = "";
    private String businessGoal = "";
    private String aiUsage = "";
    private String acceptanceCriteria = "";
    private String rollbackPlan = "";
    private String residualRisk = "";
    private final RiskAssessment riskAssessment = new RiskAssessment();
    private final TestPlan testPlan = new TestPlan();
    private final GateStatus gateStatus = new GateStatus();

    public String title() {
        return title;
    }

    public void setTitle(String title) {
        this.title = valueOrEmpty(title);
    }

    public String businessGoal() {
        return businessGoal;
    }

    public void setBusinessGoal(String businessGoal) {
        this.businessGoal = valueOrEmpty(businessGoal);
    }

    public String aiUsage() {
        return aiUsage;
    }

    public void setAiUsage(String aiUsage) {
        this.aiUsage = valueOrEmpty(aiUsage);
    }

    public String acceptanceCriteria() {
        return acceptanceCriteria;
    }

    public void setAcceptanceCriteria(String acceptanceCriteria) {
        this.acceptanceCriteria = valueOrEmpty(acceptanceCriteria);
    }

    public String rollbackPlan() {
        return rollbackPlan;
    }

    public void setRollbackPlan(String rollbackPlan) {
        this.rollbackPlan = valueOrEmpty(rollbackPlan);
    }

    public String residualRisk() {
        return residualRisk;
    }

    public void setResidualRisk(String residualRisk) {
        this.residualRisk = valueOrEmpty(residualRisk);
    }

    public RiskAssessment riskAssessment() {
        return riskAssessment;
    }

    public TestPlan testPlan() {
        return testPlan;
    }

    public GateStatus gateStatus() {
        return gateStatus;
    }

    private String valueOrEmpty(String value) {
        return value == null ? "" : value.trim();
    }
}
