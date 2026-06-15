package com.aicodequality.model;

public enum RiskLevel {
    LOW("Low", 5, 8),
    MEDIUM("Medium", 9, 14),
    HIGH("High", 15, 20),
    CRITICAL("Critical", 21, 25);

    private final String label;
    private final int minScore;
    private final int maxScore;

    RiskLevel(String label, int minScore, int maxScore) {
        this.label = label;
        this.minScore = minScore;
        this.maxScore = maxScore;
    }

    public String label() {
        return label;
    }

    public static RiskLevel fromScore(int score) {
        for (RiskLevel level : values()) {
            if (score >= level.minScore && score <= level.maxScore) {
                return level;
            }
        }
        if (score < LOW.minScore) {
            return LOW;
        }
        return CRITICAL;
    }
}
