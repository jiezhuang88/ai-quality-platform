package com.aicodequality.model;

public class TestPlan {
    private String unitTests = "";
    private String integrationTests = "";
    private String e2eTests = "";
    private String securityTests = "";
    private String performanceTests = "";
    private String manualChecks = "";

    public String unitTests() {
        return unitTests;
    }

    public void setUnitTests(String unitTests) {
        this.unitTests = valueOrEmpty(unitTests);
    }

    public String integrationTests() {
        return integrationTests;
    }

    public void setIntegrationTests(String integrationTests) {
        this.integrationTests = valueOrEmpty(integrationTests);
    }

    public String e2eTests() {
        return e2eTests;
    }

    public void setE2eTests(String e2eTests) {
        this.e2eTests = valueOrEmpty(e2eTests);
    }

    public String securityTests() {
        return securityTests;
    }

    public void setSecurityTests(String securityTests) {
        this.securityTests = valueOrEmpty(securityTests);
    }

    public String performanceTests() {
        return performanceTests;
    }

    public void setPerformanceTests(String performanceTests) {
        this.performanceTests = valueOrEmpty(performanceTests);
    }

    public String manualChecks() {
        return manualChecks;
    }

    public void setManualChecks(String manualChecks) {
        this.manualChecks = valueOrEmpty(manualChecks);
    }

    private String valueOrEmpty(String value) {
        return value == null ? "" : value.trim();
    }
}
