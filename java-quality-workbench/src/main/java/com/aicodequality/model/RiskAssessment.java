package com.aicodequality.model;

public class RiskAssessment {
    private int userImpact = 1;
    private int dataImpact = 1;
    private int complexity = 1;
    private int reversibility = 1;
    private int confidence = 1;

    public int userImpact() {
        return userImpact;
    }

    public void setUserImpact(int userImpact) {
        this.userImpact = clamp(userImpact);
    }

    public int dataImpact() {
        return dataImpact;
    }

    public void setDataImpact(int dataImpact) {
        this.dataImpact = clamp(dataImpact);
    }

    public int complexity() {
        return complexity;
    }

    public void setComplexity(int complexity) {
        this.complexity = clamp(complexity);
    }

    public int reversibility() {
        return reversibility;
    }

    public void setReversibility(int reversibility) {
        this.reversibility = clamp(reversibility);
    }

    public int confidence() {
        return confidence;
    }

    public void setConfidence(int confidence) {
        this.confidence = clamp(confidence);
    }

    public int totalScore() {
        return userImpact + dataImpact + complexity + reversibility + confidence;
    }

    public RiskLevel level() {
        return RiskLevel.fromScore(totalScore());
    }

    private int clamp(int value) {
        return Math.max(1, Math.min(5, value));
    }
}
