package com.aicodequality.service;

import com.aicodequality.model.ControlDomain;

import java.util.List;

public class ControlCatalog {
    public List<ControlDomain> domains() {
        return List.of(
                new ControlDomain(
                        "治理与风险",
                        "docs/quality-strategy.md, docs/risk-matrix.md",
                        "NIST AI RMF, NIST SSDF",
                        "风险评分、准入标准、验收标准、责任人、回滚计划"
                ),
                new ControlDomain(
                        "测试工程",
                        "docs/test-strategy.md",
                        "测试金字塔、契约测试、变异测试、属性测试、E2E 关键旅程",
                        "测试计划、覆盖率、回归结果、关键路径保护"
                ),
                new ControlDomain(
                        "AI 代码评审",
                        "docs/ai-code-review-standard.md, docs/prompt-guidelines.md",
                        "Human-in-the-loop, Prompt traceability, secure AI coding",
                        "AI 评审记录、人工复核、假设记录、边界条件清单"
                ),
                new ControlDomain(
                        "安全与供应链",
                        "应用控制域",
                        "OWASP LLM Top 10, SLSA, OpenSSF, SBOM, Sigstore",
                        "SAST、SCA、密钥扫描、SBOM、来源证明、签名"
                ),
                new ControlDomain(
                        "持续度量",
                        "docs/quality-metrics.md",
                        "DORA, 缺陷逃逸率, AI 变更失败率",
                        "前置时间、部署频率、变更失败率、恢复时间、逃逸缺陷"
                ),
                new ControlDomain(
                        "持续改进",
                        "docs/adoption-roadmap.md, escaped defect template",
                        "Shift-left, Quality gates, Incident learning",
                        "复盘项、回归用例、Prompt 更新、门禁调优"
                )
        );
    }
}
