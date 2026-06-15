package com.aicodequality.model;

public class ControlDomain {
    private final String name;
    private final String systemAsset;
    private final String industryMapping;
    private final String requiredEvidence;

    public ControlDomain(String name, String systemAsset, String industryMapping, String requiredEvidence) {
        this.name = name;
        this.systemAsset = systemAsset;
        this.industryMapping = industryMapping;
        this.requiredEvidence = requiredEvidence;
    }

    public String name() {
        return name;
    }

    public String systemAsset() {
        return systemAsset;
    }

    public String industryMapping() {
        return industryMapping;
    }

    public String requiredEvidence() {
        return requiredEvidence;
    }
}
