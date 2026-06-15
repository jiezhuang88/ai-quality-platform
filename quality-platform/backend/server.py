#!/usr/bin/env python3
"""Product-grade local AI quality platform backend.

This backend is dependency-free so the local product can run immediately.
It models the same boundaries as the target Spring Boot architecture:
projects, requirements, PR gates, test assets, executions, release gates,
agents, integrations, policies, evidence and dashboard metrics.
"""

from __future__ import annotations

import argparse
import json
import threading
import time
import uuid
from json import JSONDecodeError
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend"
DATA = ROOT / "data"
STATE_FILE = DATA / "state.json"
STATE_LOCK = threading.Lock()


def now() -> str:
    return time.strftime("%Y-%m-%d %H:%M:%S")


def new_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8]}"


def seed_state() -> dict:
    return {
        "projects": [
            {
                "id": "P-2026-001",
                "name": "订单交易优惠规则改造",
                "business_domain": "交易",
                "project_type": "业务迭代",
                "risk_level": "L3",
                "status": "testing",
                "owner": "项目负责人",
                "product_owner": "产品 Owner",
                "dev_owner": "研发 Owner",
                "qa_owner": "QA Owner",
                "uat_owner": "业务验收 Owner",
                "repo_url": "https://git.example.com/order/order-service",
                "systems": [
                    {"name": "订单服务", "domain": "交易", "owner": "订单研发 Owner", "criticality": "核心", "repo_url": "https://git.example.com/order/order-service"},
                    {"name": "优惠服务", "domain": "营销", "owner": "优惠研发 Owner", "criticality": "核心", "repo_url": "https://git.example.com/promo/coupon-service"},
                    {"name": "库存服务", "domain": "履约", "owner": "库存研发 Owner", "criticality": "核心", "repo_url": "https://git.example.com/inventory/inventory-service"},
                    {"name": "支付校验服务", "domain": "支付", "owner": "支付研发 Owner", "criticality": "核心", "repo_url": "https://git.example.com/payment/payment-check-service"},
                ],
                "repositories": [
                    {"name": "order-service", "url": "https://git.example.com/order/order-service", "branch": "main", "owner": "订单研发 Owner", "system": "订单服务"},
                    {"name": "coupon-service", "url": "https://git.example.com/promo/coupon-service", "branch": "main", "owner": "优惠研发 Owner", "system": "优惠服务"},
                    {"name": "inventory-service", "url": "https://git.example.com/inventory/inventory-service", "branch": "main", "owner": "库存研发 Owner", "system": "库存服务"},
                    {"name": "payment-check-service", "url": "https://git.example.com/payment/payment-check-service", "branch": "main", "owner": "支付研发 Owner", "system": "支付校验服务"},
                ],
                "stakeholders": [
                    {"role": "产品 Owner", "name": "产品 Owner", "approval_scope": "业务规则和验收标准"},
                    {"role": "研发 Owner", "name": "订单研发 Owner", "approval_scope": "核心代码和接口契约"},
                    {"role": "QA Owner", "name": "QA Owner", "approval_scope": "测试覆盖和阻断项"},
                    {"role": "发布经理", "name": "发布经理", "approval_scope": "灰度、回滚和发布准入"},
                ],
                "stage": "测试验证",
                "evidence_score": 74,
                "blockers": ["接口自动化 6 条失败", "支付前金额一致性证据缺失"],
                "created_at": now(),
                "updated_at": now(),
            },
            {
                "id": "P-2026-002",
                "name": "库存可售承诺与数据回补",
                "business_domain": "履约",
                "project_type": "数据改造",
                "risk_level": "L4",
                "status": "blocked",
                "owner": "项目负责人",
                "product_owner": "产品 Owner",
                "dev_owner": "研发 Owner",
                "qa_owner": "QA Owner",
                "uat_owner": "业务验收 Owner",
                "repo_url": "https://git.example.com/inventory/inventory-service",
                "systems": [
                    {"name": "库存服务", "domain": "履约", "owner": "库存 Owner", "criticality": "核心", "repo_url": "https://git.example.com/inventory/inventory-service"},
                    {"name": "履约 ETA 服务", "domain": "履约", "owner": "履约 Owner", "criticality": "核心", "repo_url": "https://git.example.com/fulfillment/eta-service"},
                    {"name": "数据回补任务", "domain": "数据", "owner": "数据 Owner", "criticality": "高", "repo_url": "https://git.example.com/data/inventory-backfill"},
                ],
                "repositories": [
                    {"name": "inventory-service", "url": "https://git.example.com/inventory/inventory-service", "branch": "main", "owner": "库存 Owner", "system": "库存服务"},
                    {"name": "eta-service", "url": "https://git.example.com/fulfillment/eta-service", "branch": "main", "owner": "履约 Owner", "system": "履约 ETA 服务"},
                    {"name": "inventory-backfill", "url": "https://git.example.com/data/inventory-backfill", "branch": "main", "owner": "数据 Owner", "system": "数据回补任务"},
                ],
                "stakeholders": [
                    {"role": "架构 Owner", "name": "架构 Owner", "approval_scope": "L4 方案与回滚"},
                    {"role": "数据 Owner", "name": "数据 Owner", "approval_scope": "数据回补与一致性"},
                    {"role": "QA Owner", "name": "QA Owner", "approval_scope": "混沌与回归覆盖"},
                ],
                "stage": "发布决策",
                "evidence_score": 61,
                "blockers": ["ETA 契约未冻结", "回滚演练缺失"],
                "created_at": now(),
                "updated_at": now(),
            },
        ],
        "requirements": [],
        "requirement_sources": [],
        "prs": [],
        "sonar_results": [],
        "test_cases": [],
        "test_plans": [],
        "executions": [],
        "release_gates": [],
        "evidence": [],
        "external_mappings": seed_external_mappings(),
        "webhook_events": seed_webhook_events(),
        "sync_jobs": seed_sync_jobs(),
        "tool_runs": seed_tool_runs(),
        "agent_runs": [],
        "quality_metrics": seed_quality_metrics(),
        "agents": seed_agents(),
        "integrations": seed_integrations(),
        "policies": seed_policies(),
        "audit_logs": [],
    }


def seed_agents() -> list:
    def agent(agent_id, name, stage, role, prompt, capabilities, tools, policies, eval_case):
        return {
            "id": agent_id,
            "name": name,
            "stage": stage,
            "role": role,
            "version": "v1.0.0",
            "status": "active",
            "owner": role,
            "system_prompt": prompt,
            "capabilities": capabilities,
            "context_policy": {
                "scope": "project",
                "least_privilege": True,
                "allowed_context": ["project", "systems", "repositories", "requirements", "prs", "quality_metrics", "evidence"],
                "masked_fields": ["token", "secret", "password"],
                "max_context_items": 80,
            },
            "input_schema": {"required": ["project_id", "stage_context"]},
            "output_schema": {"required": ["decision", "findings", "actions", "evidence_refs"]},
            "tool_permissions": tools,
            "policy_rules": policies,
            "eval_cases": [{"id": eval_case[0], "expected": eval_case[1], "last_score": 0.92}],
            "maintenance": {
                "change_process": "Owner 提交变更，平台完成回归评测，通过后灰度启用。",
                "eval_frequency": "weekly",
                "rollback_version": "v0.9.0",
                "last_evaluated_at": now(),
            },
        }

    return [
        agent(
            "requirement-agent",
            "需求澄清 Agent",
            "需求澄清",
            "产品 Owner",
            "抽取 PRD 中的业务目标、业务规则、验收标准、歧义点和风险提示，禁止编造不存在的业务概念。",
            ["多源 PRD 解析", "业务规则卡生成", "歧义识别", "验收标准补全", "需求版本差异分析"],
            [{"tool": "PRD Parser", "access": "read"}, {"tool": "Feishu Docs", "access": "read"}, {"tool": "Jira", "access": "read"}],
            [{"id": "REQ-001", "rule": "歧义点未确认不得进入开发", "severity": "major"}],
            ("coupon-prd", "必须识别全场券、商品券和支付前金额一致性"),
        ),
        agent(
            "architecture-agent",
            "方案评审 Agent",
            "方案评审",
            "架构 Owner",
            "基于需求和系统影响面识别接口契约、数据一致性、容量、降级、回滚和跨系统依赖风险。",
            ["系统影响面分析", "接口契约检查", "容量风险识别", "回滚方案校验", "架构评审清单"],
            [{"tool": "API Catalog", "access": "read"}, {"tool": "CMDB", "access": "read"}, {"tool": "Architecture Review", "access": "write"}],
            [{"id": "ARCH-L3-001", "rule": "L3/L4 必须完成跨系统影响面和回滚方案评审", "severity": "blocker"}],
            ("multi-system-order", "订单、优惠、库存、支付任一核心系统缺少 Owner 必须提示"),
        ),
        agent(
            "coding-agent",
            "AI 编码协同 Agent",
            "AI 编码",
            "研发 Owner",
            "约束 AI Coding 在授权仓库和模块内工作，输出自检说明、单测建议和变更风险，不越权修改无关模块。",
            ["代码上下文构建", "编码约束检查", "单测建议", "变更自检", "代码影响面标注"],
            [{"tool": "Git", "access": "read"}, {"tool": "CI", "access": "read"}, {"tool": "Unit Test", "access": "execute"}],
            [{"id": "CODE-001", "rule": "AI 生成代码必须声明影响模块、测试证据和未覆盖风险", "severity": "major"}],
            ("ai-change-scope", "跨仓库变更必须输出每个仓库的影响范围"),
        ),
        agent(
            "pr-diff-agent",
            "PR Diff Agent",
            "PR 门禁",
            "研发 Owner + QA Owner",
            "识别 PR 影响范围、Sonar 阻断项、覆盖率缺口、AI 生成代码风险和必跑测试集。",
            ["多仓库 PR 汇总", "Diff 风险识别", "Sonar/SCA/SAST 汇聚", "覆盖率基线比对", "必跑测试推荐"],
            [{"tool": "Git", "access": "read"}, {"tool": "Sonar", "access": "read"}, {"tool": "CI", "access": "read"}],
            [{"id": "PR-001", "rule": "Sonar Quality Gate ERROR 必须阻断", "severity": "blocker"}],
            ("sonar-error", "Sonar ERROR 必须输出 block"),
        ),
        agent(
            "test-orchestration-agent",
            "测试编排 Agent",
            "测试验证",
            "QA Owner",
            "基于需求规则卡、PR 风险摘要和质量指标生成测试策略、用例候选、数据任务、自动化执行计划和门禁建议。",
            ["风险测试策略", "测试用例生成", "数据银行任务", "自动化套件推荐", "覆盖缺口分析"],
            [{"tool": "数据银行", "access": "read_write"}, {"tool": "自动化框架", "access": "execute"}, {"tool": "性能平台", "access": "execute", "approval_required": True}],
            [{"id": "TEST-L3-001", "rule": "L3/L4 必须覆盖核心链路、异常链路、回滚链路", "severity": "blocker"}, {"id": "TEST-PAY-001", "rule": "支付前金额一致性缺失必须阻断", "severity": "blocker"}],
            ("coupon-stack", "全场券+商品券叠加缺支付证据时必须 block"),
        ),
        agent(
            "uat-agent",
            "UAT 验收 Agent",
            "UAT 验收",
            "业务 Owner",
            "把需求规则卡转成业务验收清单，汇聚 UAT 结果、业务反馈和上线前遗留风险。",
            ["业务验收清单", "UAT 证据汇总", "业务反馈归因", "遗留风险确认"],
            [{"tool": "UAT Platform", "access": "read_write"}, {"tool": "Defect", "access": "read_write"}],
            [{"id": "UAT-001", "rule": "核心验收项未通过不得进入发布决策", "severity": "blocker"}],
            ("uat-coupon", "支付金额类验收失败必须阻断"),
        ),
        agent(
            "release-decision-agent",
            "发布决策 Agent",
            "发布决策",
            "发布经理",
            "汇总需求、PR、Sonar、自动化、UAT、监控、回滚和审批证据，给出发布准入结论。",
            ["证据完整性检查", "灰度计划检查", "回滚演练校验", "多仓库门禁汇总", "发布报告生成"],
            [{"tool": "发布系统", "access": "read"}, {"tool": "监控平台", "access": "read"}, {"tool": "审批", "access": "read"}],
            [{"id": "REL-001", "rule": "阻断项未关闭不得全量发布", "severity": "blocker"}],
            ("release-blocker", "存在 blocker 必须阻断"),
        ),
        agent(
            "retrospective-agent",
            "复盘沉淀 Agent",
            "复盘沉淀",
            "质量平台 Owner",
            "沉淀缺陷模式、门禁误报漏报、Agent 评测样例和组织级质量改进项。",
            ["缺陷模式挖掘", "策略调优建议", "Agent 评测样例生成", "知识库沉淀", "组织指标趋势"],
            [{"tool": "Defect", "access": "read"}, {"tool": "Knowledge Base", "access": "write"}, {"tool": "Metrics", "access": "read"}],
            [{"id": "RETRO-001", "rule": "P0/P1 问题必须形成策略或用例资产", "severity": "major"}],
            ("retro-p1", "P1 线上问题必须生成改进动作"),
        ),
    ]


def seed_quality_metrics() -> list:
    return [
        {"project_id": "P-2026-001", "metric": "sonar_gate_pass_rate", "value": 0.73, "target": 0.95, "status": "warning"},
        {"project_id": "P-2026-001", "metric": "unit_coverage", "value": 0.78, "target": 0.80, "status": "warning"},
        {"project_id": "P-2026-001", "metric": "api_automation_pass_rate", "value": 0.88, "target": 0.98, "status": "failed"},
        {"project_id": "P-2026-001", "metric": "api_p95_latency_ms", "value": 420, "target": 300, "status": "failed"},
        {"project_id": "P-2026-001", "metric": "legacy_defects", "value": 5, "target": 0, "status": "warning"},
        {"project_id": "P-2026-002", "metric": "sonar_gate_pass_rate", "value": 0.69, "target": 0.95, "status": "failed"},
        {"project_id": "P-2026-002", "metric": "automation_coverage", "value": 0.64, "target": 0.90, "status": "failed"},
    ]


def seed_integrations() -> list:
    return [
        {
            "id": "git-main",
            "type": "git",
            "category": "代码托管",
            "name": "企业 GitLab",
            "base_url": "https://git.example.com",
            "enabled": True,
            "health_status": "ok",
            "last_checked_at": now(),
            "integration_mode": "Link/Register",
            "reserved_capabilities": ["PR Webhook", "Diff 拉取", "Reviewer 状态"],
            "normalized_objects": ["PullRequest", "QualityEvidence"],
            "config": {"webhook_path": "/api/webhooks/git/git-main", "auth_type": "token_ref"},
        },
        {
            "id": "sonar-main",
            "type": "sonar",
            "category": "静态扫描",
            "name": "SonarQube",
            "base_url": "https://sonar.example.com",
            "enabled": True,
            "health_status": "ok",
            "last_checked_at": now(),
            "integration_mode": "Pull API + Link/Register",
            "reserved_capabilities": ["Quality Gate 拉取", "issues 拉取", "coverage 基线对比"],
            "normalized_objects": ["SonarResult", "QualityEvidence"],
            "config": {"project_key_field": "sonar_project_key", "auth_type": "token_ref"},
        },
        {
            "id": "ci-main",
            "type": "ci",
            "category": "CI/CD",
            "name": "企业流水线",
            "base_url": "https://ci.example.com",
            "enabled": True,
            "health_status": "manual_ready",
            "last_checked_at": now(),
            "integration_mode": "Webhook API + Link/Register",
            "reserved_capabilities": ["构建回调", "单测结果", "覆盖率报告"],
            "normalized_objects": ["QualityEvidence"],
            "config": {"webhook_path": "/api/webhooks/ci/ci-main", "auth_type": "webhook_secret_ref"},
        },
        {
            "id": "auto-main",
            "type": "automation",
            "category": "自动化测试",
            "name": "接口自动化平台",
            "base_url": "https://auto.example.com",
            "enabled": True,
            "health_status": "ok",
            "last_checked_at": now(),
            "integration_mode": "Trigger API + Webhook API",
            "reserved_capabilities": ["触发执行", "结果回调", "失败用例归一化"],
            "normalized_objects": ["TestExecution", "QualityEvidence"],
            "config": {"webhook_path": "/api/webhooks/automation/auto-main", "auth_type": "token_ref"},
        },
        {
            "id": "data-bank",
            "type": "data_bank",
            "category": "测试数据",
            "name": "数据银行",
            "base_url": "https://data.example.com",
            "enabled": True,
            "health_status": "ok",
            "last_checked_at": now(),
            "integration_mode": "Trigger API + Link/Register",
            "reserved_capabilities": ["创建数据任务", "回写数据集引用", "测试数据模板"],
            "normalized_objects": ["QualityEvidence"],
            "config": {"auth_type": "token_ref"},
        },
        {
            "id": "perf-main",
            "type": "performance",
            "category": "性能平台",
            "name": "性能测试平台",
            "base_url": "https://perf.example.com",
            "enabled": True,
            "health_status": "manual_ready",
            "last_checked_at": now(),
            "integration_mode": "Trigger API + Pull API",
            "reserved_capabilities": ["触发压测", "P95/吞吐拉取", "基线对比"],
            "normalized_objects": ["QualityEvidence"],
            "config": {"auth_type": "token_ref"},
        },
        {
            "id": "chaos-main",
            "type": "chaos",
            "category": "混沌工程",
            "name": "混沌工程平台",
            "base_url": "https://chaos.example.com",
            "enabled": True,
            "health_status": "manual_ready",
            "last_checked_at": now(),
            "integration_mode": "Trigger API + Link/Register",
            "reserved_capabilities": ["故障注入", "恢复时间回收", "告警证据"],
            "normalized_objects": ["QualityEvidence"],
            "config": {"auth_type": "token_ref"},
        },
        {
            "id": "defect-main",
            "type": "defect",
            "category": "缺陷/事故/监控",
            "name": "缺陷与事故平台",
            "base_url": "https://defect.example.com",
            "enabled": True,
            "health_status": "manual_ready",
            "last_checked_at": now(),
            "integration_mode": "Pull API + Link/Register",
            "reserved_capabilities": ["缺陷状态同步", "逃逸缺陷反哺", "Agent Eval Case"],
            "normalized_objects": ["DefectItem", "QualityEvidence"],
            "config": {"auth_type": "token_ref"},
        },
        {
            "id": "doc-main",
            "type": "document",
            "category": "文档/需求",
            "name": "飞书/Confluence/Jira",
            "base_url": "https://docs.example.com",
            "enabled": True,
            "health_status": "manual_ready",
            "last_checked_at": now(),
            "integration_mode": "Pull API + Link/Register",
            "reserved_capabilities": ["正文拉取", "版本变更检测", "规则卡差异分析"],
            "normalized_objects": ["RequirementSource"],
            "config": {"auth_type": "oauth_ref"},
        },
    ]


def seed_external_mappings() -> list:
    return [
        {
            "id": "MAP-pr-128",
            "integration_id": "git-main",
            "external_system": "GitLab",
            "external_object_type": "merge_request",
            "external_object_id": "order-service!128",
            "internal_object_type": "PullRequest",
            "internal_object_id": "pending-pr",
            "external_url": "https://git.example.com/order/order-service/pull/128",
            "last_synced_at": now(),
        },
        {
            "id": "MAP-doc-prd",
            "integration_id": "doc-main",
            "external_system": "Feishu",
            "external_object_type": "docx",
            "external_object_id": "order-coupon-prd",
            "internal_object_type": "RequirementSource",
            "internal_object_id": "pending-source",
            "external_url": "https://feishu.example.com/docx/order-coupon-prd",
            "last_synced_at": now(),
        },
    ]


def seed_webhook_events() -> list:
    return [
        {
            "id": "WH-ci-demo",
            "integration_id": "ci-main",
            "event_type": "pipeline.finished",
            "external_event_id": "pipe-20260615-001",
            "process_status": "processed",
            "signature_valid": True,
            "summary": "订单服务流水线完成，单测通过率 96%",
            "received_at": now(),
            "processed_at": now(),
        }
    ]


def seed_sync_jobs() -> list:
    return [
        {
            "id": "SYNC-sonar-demo",
            "integration_id": "sonar-main",
            "sync_type": "pull_quality_gate",
            "target_type": "project",
            "target_id": "P-2026-001",
            "status": "completed",
            "cursor_value": "analysis-20260615",
            "error_message": "",
            "started_at": now(),
            "finished_at": now(),
            "created_by": "quality-platform",
        }
    ]


def seed_tool_runs() -> list:
    return [
        {
            "id": "TOOL-auto-demo",
            "integration_id": "auto-main",
            "tool_type": "automation",
            "project_id": "P-2026-001",
            "request": {"suite": "order-core-risk-regression"},
            "external_task_id": "AUTO-20260615-001",
            "status": "completed",
            "result": {"total": 42, "passed": 36, "failed": 6},
            "evidence_id": "",
            "triggered_by": "test-orchestration-agent",
            "started_at": now(),
            "finished_at": now(),
        }
    ]


def seed_policies() -> list:
    return [
        {"id": "PR-L3-001", "name": "L3 PR 强门禁", "scope": {"risk_level": ["L3", "L4"]}, "rules": ["Sonar Quality Gate 必须通过", "单测覆盖率不得低于基线", "核心接口自动化必须通过", "失败用例必须归因"], "decision": "block_if_any_failed"},
        {"id": "REL-L4-001", "name": "L4 发布最高门禁", "scope": {"risk_level": ["L4"]}, "rules": ["架构审批", "回滚演练", "混沌验证", "质量委员会审批"], "decision": "manual_approval_required"},
    ]


def load_state() -> dict:
    DATA.mkdir(exist_ok=True)
    if not STATE_FILE.exists():
        state = seed_state()
        save_state(state)
        return state
    raw = STATE_FILE.read_text(encoding="utf-8")
    try:
        state = json.loads(raw)
    except JSONDecodeError:
        decoder = json.JSONDecoder()
        state, end = decoder.raw_decode(raw)
        backup = STATE_FILE.with_suffix(f".corrupt-{int(time.time())}.json")
        backup.write_text(raw, encoding="utf-8")
        STATE_FILE.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    for key, default in seed_state().items():
        state.setdefault(key, default)
    normalize_state(state)
    return state


def normalize_state(state: dict) -> None:
    seeded_agents = {agent["id"]: agent for agent in seed_agents()}
    current_agents = {agent.get("id"): agent for agent in state.get("agents", [])}
    for agent_id, seeded in seeded_agents.items():
        if agent_id not in current_agents:
            state.setdefault("agents", []).append(seeded)
        else:
            for key in ["capabilities", "context_policy", "maintenance", "owner"]:
                current_agents[agent_id].setdefault(key, seeded[key])
    state.setdefault("requirement_sources", [])
    state.setdefault("agent_runs", [])
    state.setdefault("quality_metrics", seed_quality_metrics())
    state.setdefault("external_mappings", seed_external_mappings())
    state.setdefault("webhook_events", seed_webhook_events())
    state.setdefault("sync_jobs", seed_sync_jobs())
    state.setdefault("tool_runs", seed_tool_runs())
    seeded_integrations = {item["id"]: item for item in seed_integrations()}
    current_integrations = {item.get("id"): item for item in state.get("integrations", [])}
    for integration_id, seeded in seeded_integrations.items():
        if integration_id not in current_integrations:
            state.setdefault("integrations", []).append(seeded)
        else:
            for key in ["category", "integration_mode", "reserved_capabilities", "normalized_objects", "config"]:
                current_integrations[integration_id].setdefault(key, seeded[key])
    seeded_projects = {project["id"]: project for project in seed_state()["projects"]}
    for project in state.get("projects", []):
        seeded_project = seeded_projects.get(project.get("id"))
        project.setdefault("systems", [])
        project.setdefault("repositories", [])
        project.setdefault("stakeholders", [])
        if seeded_project and (len(project["systems"]) <= 1 or len(project["repositories"]) <= 1):
            project["systems"] = seeded_project["systems"]
            project["repositories"] = seeded_project["repositories"]
            project["stakeholders"] = project["stakeholders"] or seeded_project["stakeholders"]
        if not project["repositories"] and project.get("repo_url"):
            repo_name = project["repo_url"].rstrip("/").split("/")[-1]
            project["repositories"].append({
                "name": repo_name,
                "url": project["repo_url"],
                "branch": "main",
                "owner": project.get("dev_owner", "研发 Owner"),
                "system": project.get("business_domain", "默认系统"),
            })
        if not project["systems"]:
            project["systems"].append({
                "name": project.get("business_domain", "默认系统"),
                "domain": project.get("business_domain", "未分类"),
                "owner": project.get("dev_owner", "研发 Owner"),
                "criticality": "普通",
                "repo_url": project.get("repo_url", ""),
            })
        for index, system in enumerate(project["systems"], start=1):
            system.setdefault("id", f"{project['id']}-SYS-{index:02d}")
            system.setdefault("domain", project.get("business_domain", "未分类"))
            system.setdefault("owner", project.get("dev_owner", "研发 Owner"))
            system.setdefault("criticality", "普通")
            system.setdefault("repo_url", "")
        for index, repo in enumerate(project["repositories"], start=1):
            repo.setdefault("id", f"{project['id']}-REPO-{index:02d}")
            repo.setdefault("branch", "main")
            repo.setdefault("owner", project.get("dev_owner", "研发 Owner"))
            repo.setdefault("system", project["systems"][0]["name"] if project["systems"] else "")
    for case in state.get("test_cases", []):
        if case.get("status") == "draft":
            case["status"] = "candidate"
        case.setdefault("review_status", "pending")
        case.setdefault("review_comments", [])
        case.setdefault("library_status", "not_in_library")
        case.setdefault("version", "v0.1")
        case.setdefault("owner", "QA Owner")
        case.setdefault("automation_binding", {"framework": "", "suite": "", "case_key": ""})


def parse_lines(value: str, fields: list[str]) -> list[dict]:
    items = []
    for line in value.split("\n"):
        line = line.strip()
        if not line:
            continue
        parts = [part.strip() for part in line.split("|")]
        item = {}
        for index, field in enumerate(fields):
            item[field] = parts[index] if index < len(parts) else ""
        items.append(item)
    return items


def infer_content_from_source(payload: dict, project: dict) -> str:
    content = payload.get("content", "").strip()
    if content:
        return content
    source_url = payload.get("source_url", "")
    source_name = payload.get("source_name", "外部 PRD")
    systems = "、".join(system.get("name", "") for system in project.get("systems", [])[:4])
    if "feishu" in source_url or "larksuite" in source_url:
        return (
            f"目标：从飞书文档《{source_name}》导入 {project['name']} 的需求，影响系统包括{systems}。\n"
            "规则：仅支持全场券和商品券，商品券按 SKU 生效，全场券按订单金额门槛生效。\n"
            "验收：支付前金额必须与结算金额一致；优惠计算失败时不得进入支付。\n"
            "风险：库存并发、优惠回滚、支付超时和跨系统接口契约需要验证。\n"
            "待确认：券叠加顺序是否以商品券优先。"
        )
    return (
        f"目标：导入外部 PRD《{source_name}》，用于 {project['name']} 的需求澄清。\n"
        "规则：需要产品 Owner 补充明确业务规则、边界条件和异常处理。\n"
        "验收：所有核心链路必须具备可执行验收标准。\n"
        "风险：跨系统依赖、数据一致性和回滚策略需要验证。"
    )


def build_project_context(state: dict, project: dict) -> dict:
    project_id = project["id"]
    return {
        "project": {"id": project_id, "name": project["name"], "risk_level": project["risk_level"], "stage": project["stage"]},
        "systems": project.get("systems", []),
        "repositories": project.get("repositories", []),
        "requirements": [item for item in state["requirements"] if item["project_id"] == project_id][:8],
        "prs": [item for item in state["prs"] if item["project_id"] == project_id][:8],
        "metrics": [item for item in state.get("quality_metrics", []) if item["project_id"] == project_id],
        "evidence": [item for item in state["evidence"] if item["project_id"] == project_id][:8],
    }


def summarize_agent_decision(agent: dict, project: dict, context: dict) -> dict:
    blockers = list(project.get("blockers", []))
    failed_metrics = [m for m in context["metrics"] if m.get("status") == "failed"]
    blocked_prs = [pr for pr in context["prs"] if pr.get("gate_status") == "blocked"]
    if failed_metrics:
        blockers.append(f"{len(failed_metrics)} 个质量指标未达标")
    if blocked_prs:
        blockers.append(f"{len(blocked_prs)} 个 PR 门禁阻断")
    findings = []
    if agent["id"] == "requirement-agent":
        findings = ["已生成需求规则卡", "需要产品 Owner 确认歧义点", "禁止引入 PRD 未声明业务概念"]
    elif agent["id"] == "pr-diff-agent":
        findings = ["已按仓库汇总 PR 风险", "Sonar/覆盖率/AI 生成比例纳入门禁", "推荐核心链路必跑测试"]
    elif agent["id"] == "test-orchestration-agent":
        findings = ["生成风险测试集", "推荐数据银行构造券和库存数据", "接口自动化失败需归因"]
    elif agent["id"] == "release-decision-agent":
        findings = ["汇总发布证据", "检查灰度和回滚", "阻断项未关闭不得发布"]
    else:
        findings = [f"{agent['stage']} 已完成上下文检查", "输出需要人工确认的控制点"]
    decision = "block" if blockers else ("manual_review" if project.get("risk_level") == "L4" else "pass")
    return {
        "decision": decision,
        "findings": findings,
        "actions": ["读取最小授权上下文", "执行阶段策略", "生成证据和人工确认点"],
        "blockers": blockers[:8],
        "evidence_refs": [item.get("id") for item in context["evidence"][:5]],
    }


def save_state(state: dict) -> None:
    DATA.mkdir(exist_ok=True)
    tmp = STATE_FILE.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(STATE_FILE)


def audit(state: dict, action: str, target: str, detail: str = "") -> None:
    state.setdefault("audit_logs", []).insert(0, {
        "id": new_id("AUD"),
        "action": action,
        "target": target,
        "detail": detail,
        "operator": "local-user",
        "created_at": now(),
    })


def find_item(state: dict, collection: str, item_id: str) -> dict:
    for item in state.get(collection, []):
        if item.get("id") == item_id:
            return item
    raise KeyError(item_id)


def parse_requirement_text(text: str, project_id: str) -> dict:
    normalized = text.replace("\r", "\n")
    rules = []
    acceptance = []
    ambiguities = []
    risk_hints = []
    for line in [line.strip("- 　\t") for line in normalized.split("\n") if line.strip()]:
        if any(keyword in line for keyword in ["规则", "必须", "只能", "不允许", "商品券", "全场券"]):
            rules.append(line)
        if any(keyword in line for keyword in ["验收", "期望", "通过", "确认"]):
            acceptance.append(line)
        if any(keyword in line for keyword in ["待确认", "不明确", "是否", "？", "?"]):
            ambiguities.append(line)
        if any(keyword in line for keyword in ["支付", "库存", "金额", "回滚", "数据", "大促"]):
            risk_hints.append(line)
    if not rules:
        rules = ["需求文本未显式列出业务规则，需要产品 Owner 补充规则卡。"]
    if not acceptance:
        acceptance = ["需要补充可验证的验收标准。"]
    return {
        "id": new_id("REQ"),
        "project_id": project_id,
        "source_type": "text",
        "business_goal": normalized.split("\n")[0][:160] if normalized else "未识别业务目标",
        "rules": rules[:12],
        "acceptance_criteria": acceptance[:12],
        "ambiguities": ambiguities[:8],
        "risk_hints": risk_hints[:8],
        "status": "draft",
        "created_at": now(),
        "confirmed_by": "",
    }


def generate_cases(project: dict, requirement: dict | None) -> list:
    requirement_id = requirement["id"] if requirement else ""
    requirement_rules = requirement.get("rules", []) if requirement else []
    risk_hints = requirement.get("risk_hints", []) if requirement else []
    systems = [system.get("name", "") for system in project.get("systems", []) if system.get("name")]
    core_systems = systems or [project.get("business_domain", "核心系统")]
    order_systems = [name for name in core_systems if any(keyword in name for keyword in ["订单", "优惠", "库存", "支付"])] or core_systems
    base = [
        {
            "title": "需求规则卡验收覆盖完整性检查",
            "objective": "确认 PRD 中已确认的业务规则均被测试资产覆盖，避免 AI 生成代码只覆盖 happy path。",
            "expected_result": "需求规则、验收标准、歧义点和风险提示均有对应测试覆盖或人工确认记录。",
            "priority": "P0",
            "case_type": "uat",
            "affected_systems": core_systems,
            "precondition": "需求规则卡已完成产品 Owner 初审，项目影响系统和 Owner 已维护。",
            "test_data": ["已导入 PRD", "需求规则卡", "项目系统清单"],
            "steps": ["打开需求规则卡", "逐条核对业务规则和验收标准", "检查每条规则是否映射到候选用例", "记录未覆盖规则和待确认问题"],
            "assertions": ["每条规则存在 traceability.requirement_ids", "未确认歧义点进入 review_notes", "L3/L4 风险点不允许无用例覆盖"],
            "negative_or_boundary": False,
            "automation_recommendation": {"recommended": False, "framework": "UAT 平台", "suite": "business-acceptance-review", "reason": "规则覆盖完整性需要人工确认"},
            "review_notes": ["确认是否存在 PRD 未说明但研发实现中新增的业务概念"],
        },
        {
            "title": "核心接口正常链路契约回归",
            "objective": "验证核心接口在标准输入下返回字段、错误码和状态符合契约。",
            "expected_result": "核心接口响应成功，关键字段类型、枚举、金额、状态符合接口契约。",
            "priority": "P0",
            "case_type": "contract",
            "affected_systems": order_systems,
            "precondition": "测试环境可用，接口契约版本已冻结，基础测试账号和商品数据已准备。",
            "test_data": ["标准用户账号", "可售商品", "有效请求参数", "接口契约基线"],
            "steps": ["构造标准请求", "调用核心接口", "校验响应字段和错误码", "校验服务日志和 Trace"],
            "assertions": ["HTTP 状态码符合预期", "必填字段不为空", "枚举值兼容旧版本", "Trace 中无下游异常"],
            "negative_or_boundary": False,
            "automation_recommendation": {"recommended": True, "framework": "接口自动化框架", "suite": "contract-regression", "reason": "契约回归适合稳定自动化"},
            "review_notes": ["补充具体接口路径和契约版本"],
        },
        {
            "title": "异常参数与幂等重复提交处理",
            "objective": "验证异常输入、重复提交和超时重试不会造成脏数据或重复业务动作。",
            "expected_result": "系统返回明确错误码或幂等结果，不产生重复订单、重复扣减或错误状态。",
            "priority": "P1",
            "case_type": "api",
            "affected_systems": order_systems,
            "precondition": "接口可调用，幂等键、请求流水号和日志检索能力可用。",
            "test_data": ["缺失必填字段请求", "非法枚举请求", "重复 request_id", "超时重试请求"],
            "steps": ["发送缺失必填字段请求", "发送非法枚举请求", "使用相同 request_id 重复提交", "查询业务数据和日志"],
            "assertions": ["错误码明确且可被调用方处理", "重复请求只产生一次业务结果", "无重复扣减或重复状态流转", "审计日志记录幂等命中"],
            "negative_or_boundary": True,
            "automation_recommendation": {"recommended": True, "framework": "接口自动化框架", "suite": "negative-idempotent-regression", "reason": "负向和幂等场景应长期回归"},
            "review_notes": ["确认幂等键字段和重复提交判定窗口"],
        },
        {
            "title": "失败后状态与数据回滚验证",
            "objective": "验证流程中任一核心依赖失败后，订单、库存、优惠、支付相关状态可回滚或进入可补偿状态。",
            "expected_result": "失败后业务状态一致，补偿任务可追踪，不允许进入不可恢复中间态。",
            "priority": "P1",
            "case_type": "e2e",
            "affected_systems": order_systems,
            "precondition": "可模拟下游失败，具备数据库、消息和日志观测权限。",
            "test_data": ["正常订单", "可售库存", "可用优惠", "下游失败注入开关"],
            "steps": ["创建订单并进入核心流程", "注入下游失败", "观察订单状态和补偿任务", "恢复依赖后验证最终状态"],
            "assertions": ["订单未进入错误终态", "库存和优惠占用被释放或可补偿", "补偿任务有唯一流水", "告警和日志可定位失败原因"],
            "negative_or_boundary": True,
            "automation_recommendation": {"recommended": True, "framework": "E2E 自动化框架", "suite": "rollback-compensation-regression", "reason": "L3/L4 必须覆盖回滚补偿"},
            "review_notes": ["确认失败注入方式和可观测数据表"],
        },
    ]
    domain = project.get("business_domain", "")
    if "交易" in domain or "订单" in project.get("name", ""):
        base.extend([
            {
                "title": "全场券与商品券叠加后应付金额计算正确",
                "objective": "验证当前真实业务中的全场券和商品券叠加规则，确保结算金额准确。",
                "expected_result": "应付金额等于商品金额减商品券优惠减全场券优惠，优惠明细和支付前金额一致。",
                "priority": "P0",
                "case_type": "api",
                "affected_systems": ["优惠服务", "订单服务", "支付校验服务"],
                "precondition": "商品 SKU-10086 支持商品券减 15，订单满足全场券满 199 减 20。",
                "test_data": ["SKU-10086 商品金额 219", "商品券减 15", "全场券满 199 减 20", "普通会员测试账号"],
                "steps": ["创建包含 SKU-10086 的订单", "选择商品券", "选择全场券", "提交结算", "查询结算结果和优惠明细"],
                "assertions": ["payable_amount = 219 - 15 - 20 = 184", "优惠明细包含商品券和全场券", "支付前金额校验通过", "不存在平台券或店铺券字段"],
                "negative_or_boundary": False,
                "automation_recommendation": {"recommended": True, "framework": "接口自动化框架", "suite": "order-core-risk-regression", "reason": "核心金额规则必须自动化回归"},
                "review_notes": ["确认商品券和全场券叠加顺序是否已由产品确认"],
            },
            {
                "title": "支付前金额与结算金额不一致时阻断支付",
                "objective": "验证支付前金额一致性门禁，防止 AI 修改结算或支付代码后产生资金风险。",
                "expected_result": "支付被阻断，订单状态不进入支付中，返回明确金额不一致错误。",
                "priority": "P0",
                "case_type": "e2e",
                "affected_systems": ["订单服务", "支付校验服务"],
                "precondition": "订单已完成结算，应付金额为 184，可模拟支付请求金额。",
                "test_data": ["已结算订单 payable_amount=184", "支付请求 amount=185", "支付前校验接口"],
                "steps": ["创建订单并完成优惠结算", "发起支付前校验", "传入不一致支付金额 185", "查询订单状态和支付审计日志"],
                "assertions": ["支付校验接口返回金额不一致错误码", "订单状态不进入支付中", "支付网关未创建支付单", "审计日志记录结算金额和请求金额"],
                "negative_or_boundary": True,
                "automation_recommendation": {"recommended": True, "framework": "E2E 自动化框架", "suite": "payment-guard-regression", "reason": "资金风险 P0 场景必须自动化"},
                "review_notes": ["确认金额精度、四舍五入和币种字段断言"],
            },
            {
                "title": "优惠服务超时时订单不得进入支付",
                "objective": "验证优惠依赖超时或不可用时，订单不会绕过优惠计算直接进入支付。",
                "expected_result": "结算失败或进入可重试状态，不允许支付，告警和 Trace 可定位优惠服务超时。",
                "priority": "P0",
                "case_type": "chaos",
                "affected_systems": ["订单服务", "优惠服务", "支付校验服务"],
                "precondition": "可通过混沌平台注入优惠服务超时或不可用故障。",
                "test_data": ["满足全场券和商品券条件的订单", "优惠服务超时注入规则", "Trace 查询条件"],
                "steps": ["注入优惠服务超时", "提交订单结算", "尝试发起支付", "查询订单状态、日志、Trace 和告警"],
                "assertions": ["订单未进入待支付或支付中", "返回明确的优惠计算失败或可重试错误", "触发优惠服务超时告警", "Trace 标记下游超时"],
                "negative_or_boundary": True,
                "automation_recommendation": {"recommended": True, "framework": "混沌工程平台", "suite": "coupon-timeout-chaos", "reason": "L3 核心交易链路需要混沌验证"},
                "review_notes": ["确认故障注入窗口和恢复后补偿行为"],
            },
            {
                "title": "库存并发扣减不超卖",
                "objective": "验证优惠叠加场景下并发下单不会绕过库存扣减保护。",
                "expected_result": "库存扣减不超过可售库存，超出请求返回库存不足或排队失败。",
                "priority": "P0",
                "case_type": "performance",
                "affected_systems": ["订单服务", "库存服务", "优惠服务"],
                "precondition": "SKU-10086 可售库存固定为 10，具备并发压测和库存查询能力。",
                "test_data": ["SKU-10086 库存 10", "并发用户 50", "全场券和商品券可用"],
                "steps": ["初始化库存为 10", "构造 50 个并发下单请求", "执行并发请求", "查询订单成功数、库存余量和失败原因"],
                "assertions": ["成功订单数不超过 10", "库存余量不为负数", "失败订单返回库存不足或明确失败原因", "无重复扣减消息"],
                "negative_or_boundary": True,
                "automation_recommendation": {"recommended": True, "framework": "性能测试平台", "suite": "inventory-concurrency-baseline", "reason": "库存并发属于核心容量和一致性风险"},
                "review_notes": ["确认压测环境隔离和库存初始化方式"],
            },
        ])
    cases = []
    for item in base:
        traceability = {
            "requirement_ids": [requirement_id] if requirement_id else [],
            "pr_ids": [],
            "risk_ids": risk_hints[:3],
            "defect_ids": [],
            "rules": requirement_rules[:3],
        }
        cases.append({
            "id": new_id("TC"),
            "project_id": project["id"],
            "requirement_id": requirement_id,
            "title": item["title"],
            "objective": item["objective"],
            "case_type": item["case_type"],
            "priority": item["priority"],
            "risk_level": project["risk_level"],
            "affected_systems": item["affected_systems"],
            "precondition": item["precondition"],
            "test_data": item["test_data"],
            "steps": item["steps"],
            "expected_result": item["expected_result"],
            "assertions": item["assertions"],
            "negative_or_boundary": item["negative_or_boundary"],
            "automation_recommendation": item["automation_recommendation"],
            "traceability": traceability,
            "review_notes": item["review_notes"],
            "test_data_refs": item["test_data"],
            "automation_binding": {"framework": "", "suite": "", "case_key": ""},
            "quality_score": 92 if item["priority"] == "P0" else 86,
            "source_type": "agent_generated",
            "generation_skill": "professional-test-case-generation-skill/v1",
            "status": "candidate",
            "review_status": "pending",
            "review_comments": [],
            "library_status": "not_in_library",
            "version": "v0.1",
            "owner": project.get("qa_owner", "QA Owner"),
            "created_at": now(),
            "updated_at": now(),
        })
    return cases


def case_lifecycle_summary(cases: list[dict]) -> dict:
    return {
        "total": len(cases),
        "candidate": len([case for case in cases if case.get("status") == "candidate"]),
        "reviewed": len([case for case in cases if case.get("status") == "reviewed"]),
        "returned": len([case for case in cases if case.get("status") == "returned"]),
        "baselined": len([case for case in cases if case.get("status") == "baselined"]),
        "automated": len([case for case in cases if case.get("automation_binding", {}).get("suite")]),
    }


def evaluate_release_gate(state: dict, project: dict) -> dict:
    evidence = [item for item in state["evidence"] if item["project_id"] == project["id"]]
    prs = [item for item in state["prs"] if item["project_id"] == project["id"]]
    executions = [item for item in state["executions"] if item["project_id"] == project["id"]]
    blockers = list(project.get("blockers", []))
    if any(pr.get("gate_status") == "blocked" for pr in prs):
        blockers.append("存在 PR 门禁阻断")
    if any(exe.get("status") == "failed" for exe in executions):
        blockers.append("存在自动化执行失败")
    if project["risk_level"] in {"L3", "L4"} and not executions:
        blockers.append("L3/L4 项目缺少自动化执行证据")
    decision = "blocked" if blockers else ("manual_review" if project["risk_level"] == "L4" else "passed")
    score = max(0, 100 - len(blockers) * 15)
    gate = {
        "id": new_id("REL"),
        "project_id": project["id"],
        "risk_level": project["risk_level"],
        "decision": decision,
        "evidence_score": score,
        "blockers": blockers,
        "evidence_count": len(evidence),
        "evaluated_at": now(),
    }
    state["release_gates"].insert(0, gate)
    return gate


def normalize_tool_result_to_evidence(integration: dict, tool_run: dict) -> dict:
    result = tool_run.get("result", {})
    if integration["type"] == "automation":
        summary = f"{result.get('passed', 0)}/{result.get('total', 0)} passed，失败 {result.get('failed', 0)} 条"
        status = "failed" if result.get("failed", 0) else "passed"
        evidence_type = "automation"
    elif integration["type"] == "data_bank":
        summary = f"数据任务已创建：{result.get('data_set_ref', 'DATASET-DEMO')}"
        status = "ready"
        evidence_type = "test_data"
    elif integration["type"] == "performance":
        summary = f"P95 {result.get('p95', 320)}ms，吞吐 {result.get('throughput', 1200)} rpm"
        status = "warning" if result.get("p95", 320) > 300 else "passed"
        evidence_type = "performance"
    elif integration["type"] == "chaos":
        summary = f"故障 {result.get('fault_type', 'dependency-timeout')}，恢复 {result.get('recovery_time', '45s')}"
        status = "passed"
        evidence_type = "chaos"
    else:
        summary = f"{integration['name']} 工具运行完成"
        status = "ready"
        evidence_type = integration["type"]
    return {
        "id": new_id("EVD"),
        "project_id": tool_run.get("project_id", ""),
        "evidence_type": evidence_type,
        "source_system": integration["type"],
        "source_id": tool_run["id"],
        "title": f"{integration['name']} 归一化证据",
        "summary": summary,
        "status": status,
        "result": status,
        "metrics": result,
        "uri": tool_run.get("external_task_id", ""),
        "collected_at": now(),
    }


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(FRONTEND), **kwargs)

    def send_json(self, payload: dict, status: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_json(self) -> dict:
        length = int(self.headers.get("Content-Length", "0"))
        if length == 0:
            return {}
        return json.loads(self.rfile.read(length).decode("utf-8"))

    def do_GET(self):  # noqa: N802
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"
        state = load_state()

        try:
            if path == "/api/dashboard":
                return self.send_json({"dashboard": self.dashboard(state)})
            if path == "/api/projects":
                return self.send_json({"projects": state["projects"]})
            if path.startswith("/api/projects/"):
                parts = path.split("/")
                project = find_item(state, "projects", parts[3])
                if len(parts) == 4:
                    return self.send_json({"project": project})
                if len(parts) == 5 and parts[4] == "requirements":
                    return self.send_json({"requirements": [r for r in state["requirements"] if r["project_id"] == project["id"]]})
                if len(parts) == 5 and parts[4] == "requirement-sources":
                    return self.send_json({"requirement_sources": [r for r in state["requirement_sources"] if r["project_id"] == project["id"]]})
                if len(parts) == 5 and parts[4] == "prs":
                    return self.send_json({"prs": [p for p in state["prs"] if p["project_id"] == project["id"]]})
                if len(parts) == 5 and parts[4] == "test-cases":
                    cases = [c for c in state["test_cases"] if c["project_id"] == project["id"]]
                    return self.send_json({"test_cases": cases, "summary": case_lifecycle_summary(cases)})
                if len(parts) == 5 and parts[4] == "executions":
                    return self.send_json({"executions": [e for e in state["executions"] if e["project_id"] == project["id"]]})
                if len(parts) == 5 and parts[4] == "release-gate":
                    gates = [g for g in state["release_gates"] if g["project_id"] == project["id"]]
                    return self.send_json({"release_gate": gates[0] if gates else None})
                if len(parts) == 5 and parts[4] == "evidence":
                    return self.send_json({"evidence": [e for e in state["evidence"] if e["project_id"] == project["id"]]})
                if len(parts) == 5 and parts[4] == "quality-metrics":
                    return self.send_json({"quality_metrics": [m for m in state.get("quality_metrics", []) if m["project_id"] == project["id"]]})
                if len(parts) == 5 and parts[4] == "agent-runs":
                    return self.send_json({"agent_runs": [r for r in state.get("agent_runs", []) if r["project_id"] == project["id"]]})
            if path == "/api/agents":
                return self.send_json({"agents": state["agents"]})
            if path.startswith("/api/agents/"):
                return self.send_json({"agent": find_item(state, "agents", path.split("/")[-1])})
            if path == "/api/integrations":
                return self.send_json({"integrations": state["integrations"]})
            if path == "/api/integration-summary":
                return self.send_json({
                    "integrations": state["integrations"],
                    "external_mappings": state.get("external_mappings", []),
                    "webhook_events": state.get("webhook_events", []),
                    "sync_jobs": state.get("sync_jobs", []),
                    "tool_runs": state.get("tool_runs", []),
                    "adapter_modes": {
                        "pull_api": len([i for i in state["integrations"] if "Pull API" in i.get("integration_mode", "")]),
                        "webhook_api": len([i for i in state["integrations"] if "Webhook API" in i.get("integration_mode", "")]),
                        "trigger_api": len([i for i in state["integrations"] if "Trigger API" in i.get("integration_mode", "")]),
                        "link_register": len([i for i in state["integrations"] if "Link/Register" in i.get("integration_mode", "")]),
                    },
                })
            if path == "/api/policies":
                return self.send_json({"policies": state["policies"]})
            if path == "/api/audit-logs":
                return self.send_json({"audit_logs": state["audit_logs"][:100]})
        except KeyError:
            return self.send_json({"error": "not found"}, 404)

        if path == "/":
            self.path = "/index.html"
        return super().do_GET()

    def do_POST(self):  # noqa: N802
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        state = load_state()
        payload = self.read_json()

        try:
            if path == "/api/projects":
                repositories = payload.get("repositories") or []
                systems = payload.get("systems") or []
                stakeholders = payload.get("stakeholders") or []
                repo_url = repositories[0]["url"] if repositories else payload.get("repo_url", "")
                project = {
                    "id": payload.get("id") or new_id("P"),
                    "name": payload.get("name", "新建项目"),
                    "business_domain": payload.get("business_domain", "未分类"),
                    "project_type": payload.get("project_type", "业务迭代"),
                    "risk_level": payload.get("risk_level", "L2"),
                    "status": "planning",
                    "owner": payload.get("owner", "项目负责人"),
                    "product_owner": payload.get("product_owner", "产品 Owner"),
                    "dev_owner": payload.get("dev_owner", "研发 Owner"),
                    "qa_owner": payload.get("qa_owner", "QA Owner"),
                    "uat_owner": payload.get("uat_owner", "业务验收 Owner"),
                    "repo_url": repo_url,
                    "systems": systems,
                    "repositories": repositories,
                    "stakeholders": stakeholders,
                    "stage": "项目接入",
                    "evidence_score": 0,
                    "blockers": [],
                    "created_at": now(),
                    "updated_at": now(),
                }
                state["projects"].insert(0, project)
                audit(state, "project.create", project["id"], project["name"])
                save_state(state)
                return self.send_json({"project": project}, 201)

            if path.startswith("/api/projects/"):
                parts = path.split("/")
                project = find_item(state, "projects", parts[3])
                action = parts[4] if len(parts) > 4 else ""
                if action == "requirements" and len(parts) == 6 and parts[5] == "import":
                    source_id = new_id("SRC")
                    content = infer_content_from_source(payload, project)
                    source = {
                        "id": source_id,
                        "project_id": project["id"],
                        "source_type": payload.get("source_type", "text"),
                        "source_category": payload.get("source_category", ""),
                        "source_provider": payload.get("source_provider", ""),
                        "import_action": payload.get("import_action", ""),
                        "source_category_id": payload.get("source_category_id", ""),
                        "source_provider_id": payload.get("source_provider_id", ""),
                        "import_mode": payload.get("import_mode", payload.get("source_type", "text")),
                        "source_name": payload.get("source_name", "手动导入"),
                        "source_url": payload.get("source_url", ""),
                        "file_name": payload.get("file_name", ""),
                        "external_provider": payload.get("external_provider", ""),
                        "external_doc_id": payload.get("external_doc_id", ""),
                        "version": payload.get("version", "v1"),
                        "content_hash": str(abs(hash(content))),
                        "parse_status": "parsed",
                        "permission_status": "verified" if payload.get("source_url") else "local",
                        "imported_at": now(),
                    }
                    req = parse_requirement_text(content, project["id"])
                    req["source_id"] = source_id
                    req["source_type"] = payload.get("source_type", "text")
                    req["source_name"] = payload.get("source_name", "手动导入")
                    req["source_url"] = payload.get("source_url", "")
                    req["file_name"] = payload.get("file_name", "")
                    req["import_mode"] = payload.get("import_mode", req["source_type"])
                    req["integration_status"] = "linked" if req["source_url"] else "uploaded"
                    state["requirement_sources"].insert(0, source)
                    state["requirements"].insert(0, req)
                    state["evidence"].insert(0, {"id": new_id("EVD"), "project_id": project["id"], "evidence_type": "requirement", "source_system": "platform", "title": "PRD 解析结果", "summary": req["business_goal"], "status": "ready", "uri": "", "collected_at": now()})
                    audit(state, "requirement.import", req["id"], f"{project['id']} / {source['import_mode']}")
                    save_state(state)
                    return self.send_json({"requirement": req, "source": source}, 201)
                if action == "prs" and len(parts) == 6 and parts[5] == "register":
                    pr = {
                        "id": new_id("PR"),
                        "project_id": project["id"],
                        "provider": payload.get("provider", "manual"),
                        "external_id": payload.get("external_id", ""),
                        "repository_url": payload.get("repository_url", project.get("repo_url", "")),
                        "repository_name": payload.get("repository_name", ""),
                        "system_name": payload.get("system_name", ""),
                        "branch": payload.get("branch", "feature/ai-quality-change"),
                        "changed_files": payload.get("changed_files", 18),
                        "lines_added": payload.get("lines_added", 420),
                        "lines_deleted": payload.get("lines_deleted", 86),
                        "title": payload.get("title", "登记 PR"),
                        "author": payload.get("author", "developer"),
                        "url": payload.get("url", ""),
                        "status": "open",
                        "ai_generated_ratio": payload.get("ai_generated_ratio", 60),
                        "gate_status": "pending",
                        "risk_summary": "",
                        "created_at": now(),
                        "updated_at": now(),
                    }
                    state["prs"].insert(0, pr)
                    audit(state, "pr.register", pr["id"], project["id"])
                    save_state(state)
                    return self.send_json({"pr": pr}, 201)
                if action == "test-cases" and len(parts) == 6 and parts[5] == "generate":
                    requirements = [r for r in state["requirements"] if r["project_id"] == project["id"]]
                    cases = generate_cases(project, requirements[0] if requirements else None)
                    state["test_cases"] = cases + state["test_cases"]
                    audit(state, "test_cases.generate", project["id"], f"{len(cases)} cases")
                    save_state(state)
                    return self.send_json({"test_cases": cases}, 201)
                if action == "executions" and len(parts) == 6 and parts[5] == "run":
                    cases = [c for c in state["test_cases"] if c["project_id"] == project["id"]]
                    failed = 2 if project["risk_level"] in {"L3", "L4"} else 0
                    execution = {
                        "id": new_id("AUTO"),
                        "project_id": project["id"],
                        "execution_type": payload.get("execution_type", "api_automation"),
                        "suite": payload.get("suite", "risk-based-regression"),
                        "triggered_by": "test-orchestration-agent",
                        "total_count": max(len(cases), 8),
                        "passed_count": max(len(cases), 8) - failed,
                        "failed_count": failed,
                        "status": "failed" if failed else "passed",
                        "report_url": "https://auto.example.com/reports/demo",
                        "logs_url": "https://auto.example.com/logs/demo",
                        "started_at": now(),
                        "finished_at": now(),
                    }
                    state["executions"].insert(0, execution)
                    state["evidence"].insert(0, {"id": new_id("EVD"), "project_id": project["id"], "evidence_type": "automation", "source_system": "automation", "title": "自动化执行结果", "summary": f"{execution['passed_count']}/{execution['total_count']} passed", "status": execution["status"], "uri": execution["report_url"], "collected_at": now()})
                    audit(state, "automation.run", execution["id"], project["id"])
                    save_state(state)
                    return self.send_json({"execution": execution}, 201)
                if action == "release-gate" and len(parts) == 6 and parts[5] == "evaluate":
                    gate = evaluate_release_gate(state, project)
                    audit(state, "release_gate.evaluate", gate["id"], gate["decision"])
                    save_state(state)
                    return self.send_json({"release_gate": gate}, 201)

            if path.startswith("/api/prs/") and path.endswith("/collect-sonar"):
                pr = find_item(state, "prs", path.split("/")[3])
                status = payload.get("qualityGateStatus") or ("ERROR" if pr.get("ai_generated_ratio", 0) > 50 else "OK")
                blockers = []
                if status == "ERROR":
                    blockers.append("Sonar Quality Gate ERROR")
                if pr.get("ai_generated_ratio", 0) >= 60:
                    blockers.append("AI 生成比例较高，需要加强单测和 Review")
                if pr.get("changed_files", 0) >= 20:
                    blockers.append("变更文件较多，需要拆分风险或补充影响面说明")
                sonar = {
                    "id": new_id("SONAR"),
                    "pr_id": pr["id"],
                    "project_id": pr["project_id"],
                    "projectKey": payload.get("projectKey", "demo-project"),
                    "repository_name": pr.get("repository_name", ""),
                    "system_name": pr.get("system_name", ""),
                    "qualityGateStatus": status,
                    "bugs": payload.get("bugs", 1 if status == "ERROR" else 0),
                    "vulnerabilities": payload.get("vulnerabilities", 0),
                    "codeSmells": payload.get("codeSmells", 12),
                    "coverage": payload.get("coverage", 78.5),
                    "duplicatedLinesDensity": payload.get("duplicatedLinesDensity", 1.1),
                    "blockerIssues": payload.get("blockerIssues", blockers),
                    "criticalIssues": payload.get("criticalIssues", []),
                    "collected_at": now(),
                }
                pr["gate_status"] = "blocked" if blockers else "passed"
                pr["risk_summary"] = "；".join(blockers) if blockers else "Sonar 通过，进入测试门禁。"
                state["sonar_results"].insert(0, sonar)
                state["evidence"].insert(0, {"id": new_id("EVD"), "project_id": pr["project_id"], "evidence_type": "sonar", "source_system": "sonar", "title": "Sonar 扫描结果", "summary": pr["risk_summary"], "status": pr["gate_status"], "uri": "", "collected_at": now()})
                audit(state, "sonar.collect", sonar["id"], pr["id"])
                save_state(state)
                return self.send_json({"sonar": sonar, "pr": pr}, 201)

            if path.startswith("/api/requirements/") and path.endswith("/confirm"):
                req = find_item(state, "requirements", path.split("/")[3])
                req["status"] = "confirmed"
                req["confirmed_by"] = payload.get("confirmed_by", "Product Owner")
                req["confirmed_at"] = now()
                audit(state, "requirement.confirm", req["id"], req["confirmed_by"])
                save_state(state)
                return self.send_json({"requirement": req})

            if path.startswith("/api/test-cases/") and path.endswith("/review"):
                with STATE_LOCK:
                    state = load_state()
                    case = find_item(state, "test_cases", path.split("/")[3])
                    action = payload.get("action", "approve")
                    if action == "approve":
                        case["status"] = "reviewed"
                        case["review_status"] = "approved"
                    elif action == "return":
                        case["status"] = "returned"
                        case["review_status"] = "returned"
                    elif action == "reject":
                        case["status"] = "rejected"
                        case["review_status"] = "rejected"
                    else:
                        case["status"] = payload.get("status", "reviewed")
                        case["review_status"] = payload.get("review_status", case["status"])
                    case["reviewed_by"] = payload.get("reviewed_by", "QA Owner")
                    case.setdefault("review_comments", []).append({
                        "by": case["reviewed_by"],
                        "action": action,
                        "comment": payload.get("comment", "Review completed"),
                        "created_at": now(),
                    })
                    case["updated_at"] = now()
                    audit(state, "test_case.review", case["id"], f"{case['status']} / {case['reviewed_by']}")
                    save_state(state)
                    return self.send_json({"test_case": case})

            if path.startswith("/api/test-cases/") and path.endswith("/library"):
                with STATE_LOCK:
                    state = load_state()
                    case = find_item(state, "test_cases", path.split("/")[3])
                    if case.get("status") not in {"reviewed", "baselined"}:
                        return self.send_json({"error": "case must be approved before library baseline"}, 400)
                    case["status"] = "baselined"
                    case["library_status"] = "in_library"
                    case["library_id"] = case.get("library_id") or new_id("LIB")
                    case["version"] = payload.get("version", "v1.0")
                    case["baselined_by"] = payload.get("baselined_by", "QA Owner")
                    case["baselined_at"] = now()
                    case["updated_at"] = now()
                    state["evidence"].insert(0, {
                        "id": new_id("EVD"),
                        "project_id": case["project_id"],
                        "evidence_type": "test_case_library",
                        "source_system": "quality-platform",
                        "title": "测试用例入库",
                        "summary": f"{case['title']} 已入库，版本 {case['version']}",
                        "status": "ready",
                        "uri": case["library_id"],
                        "collected_at": now(),
                    })
                    audit(state, "test_case.library", case["id"], case["library_id"])
                    save_state(state)
                    return self.send_json({"test_case": case})

            if path.startswith("/api/test-cases/") and path.endswith("/bind-automation"):
                with STATE_LOCK:
                    state = load_state()
                    case = find_item(state, "test_cases", path.split("/")[3])
                    case["automation_binding"] = {
                        "framework": payload.get("framework", "接口自动化框架"),
                        "suite": payload.get("suite", "order-core-risk-regression"),
                        "case_key": payload.get("case_key", f"AUTO-{case['id']}"),
                    }
                    case["automation_status"] = "bound"
                    case["updated_at"] = now()
                    audit(state, "test_case.bind_automation", case["id"], case["automation_binding"]["suite"])
                    save_state(state)
                    return self.send_json({"test_case": case})

            if path.startswith("/api/agents/") and path.endswith("/simulate"):
                agent = find_item(state, "agents", path.split("/")[3])
                project = find_item(state, "projects", payload.get("project_id", state["projects"][0]["id"]))
                context = build_project_context(state, project)
                output = summarize_agent_decision(agent, project, context)
                result = {
                    "id": new_id("RUN"),
                    "agent_id": agent["id"],
                    "agent_name": agent["name"],
                    "project_id": project["id"],
                    "stage": agent["stage"],
                    "context_summary": {
                        "systems": len(context["systems"]),
                        "repositories": len(context["repositories"]),
                        "requirements": len(context["requirements"]),
                        "prs": len(context["prs"]),
                        "metrics": len(context["metrics"]),
                        "evidence": len(context["evidence"]),
                    },
                    "tool_calls": [tool["tool"] for tool in agent.get("tool_permissions", [])],
                    "output": output,
                    "status": "completed",
                    "created_at": now(),
                }
                state.setdefault("agent_runs", []).insert(0, result)
                audit(state, "agent.simulate", agent["id"], project["id"])
                save_state(state)
                return self.send_json({"result": result})

            if path.startswith("/api/integrations/") and path.endswith("/health-check"):
                integration = find_item(state, "integrations", path.split("/")[3])
                integration["health_status"] = "ok"
                integration["last_checked_at"] = now()
                audit(state, "integration.health_check", integration["id"], "ok")
                save_state(state)
                return self.send_json({"integration": integration})

            if path.startswith("/api/integrations/") and path.endswith("/sync"):
                integration = find_item(state, "integrations", path.split("/")[3])
                job = {
                    "id": new_id("SYNC"),
                    "integration_id": integration["id"],
                    "sync_type": payload.get("sync_type", f"{integration['type']}.sync"),
                    "target_type": payload.get("target_type", "project"),
                    "target_id": payload.get("target_id", payload.get("project_id", "")),
                    "status": "completed",
                    "cursor_value": payload.get("cursor_value", f"cursor-{int(time.time())}"),
                    "error_message": "",
                    "started_at": now(),
                    "finished_at": now(),
                    "created_by": "local-user",
                }
                state.setdefault("sync_jobs", []).insert(0, job)
                audit(state, "integration.sync", integration["id"], job["sync_type"])
                save_state(state)
                return self.send_json({"sync_job": job}, 201)

            if path.startswith("/api/integrations/") and path.endswith("/tool-runs"):
                integration = find_item(state, "integrations", path.split("/")[3])
                project_id = payload.get("project_id", state["projects"][0]["id"])
                demo_results = {
                    "automation": {"total": 42, "passed": 39, "failed": 3},
                    "data_bank": {"data_set_ref": "DATASET-ORDER-COUPON-001", "templates": ["全场券", "商品券", "库存并发"]},
                    "performance": {"p95": 328, "throughput": 1180, "error_rate": 0.003},
                    "chaos": {"fault_type": "coupon-service-timeout", "recovery_time": "42s", "alert_triggered": True},
                }
                tool_run = {
                    "id": new_id("TOOL"),
                    "integration_id": integration["id"],
                    "tool_type": integration["type"],
                    "project_id": project_id,
                    "request": payload.get("request", {"source": "quality-platform"}),
                    "external_task_id": payload.get("external_task_id", f"{integration['type'].upper()}-{int(time.time())}"),
                    "status": "completed",
                    "result": payload.get("result", demo_results.get(integration["type"], {"status": "ok"})),
                    "evidence_id": "",
                    "triggered_by": payload.get("triggered_by", "local-user"),
                    "started_at": now(),
                    "finished_at": now(),
                }
                evidence = normalize_tool_result_to_evidence(integration, tool_run)
                tool_run["evidence_id"] = evidence["id"]
                state.setdefault("tool_runs", []).insert(0, tool_run)
                if evidence["project_id"]:
                    state["evidence"].insert(0, evidence)
                audit(state, "integration.tool_run", integration["id"], tool_run["id"])
                save_state(state)
                return self.send_json({"tool_run": tool_run, "evidence": evidence}, 201)

            if path.startswith("/api/webhooks/"):
                parts = path.split("/")
                integration_type = parts[3] if len(parts) > 3 else "unknown"
                integration_id = parts[4] if len(parts) > 4 else payload.get("integration_id", "manual")
                event = {
                    "id": new_id("WH"),
                    "integration_id": integration_id,
                    "event_type": payload.get("event_type", f"{integration_type}.event"),
                    "external_event_id": payload.get("external_event_id", f"evt-{int(time.time())}"),
                    "payload": payload,
                    "signature_valid": True,
                    "process_status": "processed",
                    "summary": payload.get("summary", f"{integration_type} webhook 已处理并等待字段归一化"),
                    "received_at": now(),
                    "processed_at": now(),
                }
                state.setdefault("webhook_events", []).insert(0, event)
                audit(state, "webhook.process", integration_id, event["event_type"])
                save_state(state)
                return self.send_json({"webhook_event": event}, 201)

        except KeyError:
            return self.send_json({"error": "not found"}, 404)

        return self.send_json({"error": "not found"}, 404)

    def do_PUT(self):  # noqa: N802
        path = urlparse(self.path).path.rstrip("/")
        state = load_state()
        payload = self.read_json()
        try:
            if path.startswith("/api/agents/"):
                agent = find_item(state, "agents", path.split("/")[-1])
                for key in ["system_prompt", "input_schema", "output_schema", "tool_permissions", "policy_rules", "eval_cases", "version", "status"]:
                    if key in payload:
                        agent[key] = payload[key]
                agent["updated_at"] = now()
                audit(state, "agent.update", agent["id"], agent.get("version", ""))
                save_state(state)
                return self.send_json({"agent": agent})
        except KeyError:
            return self.send_json({"error": "not found"}, 404)
        return self.send_json({"error": "not found"}, 404)

    def dashboard(self, state: dict) -> dict:
        projects = state["projects"]
        high_risk = [p for p in projects if p["risk_level"] in {"L3", "L4"}]
        blocked = [p for p in projects if p["status"] == "blocked" or p.get("blockers")]
        return {
            "project_count": len(projects),
            "high_risk_count": len(high_risk),
            "blocked_count": len(blocked),
            "evidence_count": len(state["evidence"]),
            "test_case_count": len(state["test_cases"]),
            "execution_count": len(state["executions"]),
            "agent_count": len(state["agents"]),
            "integration_health": {item["name"]: item["health_status"] for item in state["integrations"]},
            "risk_distribution": {
                level: len([p for p in projects if p["risk_level"] == level])
                for level in ["L1", "L2", "L3", "L4"]
            },
            "recent_audit": state["audit_logs"][:8],
        }


def main() -> None:
    parser = argparse.ArgumentParser(description="Start local product-grade AI quality platform.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8790)
    args = parser.parse_args()
    load_state()
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    print(f"AI Quality Platform running at http://{args.host}:{args.port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
