#!/usr/bin/env python3
"""AI-era R&D collaboration platform local system."""

from __future__ import annotations

import argparse
import json
import time
import uuid
from copy import deepcopy
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
STATE_FILE = DATA_DIR / "system_state.json"
REPORTS = ROOT / "reports"


def agent_catalog() -> list:
    return [
        {
            "id": "requirement-agent",
            "name": "需求澄清 Agent",
            "stage": "需求澄清",
            "owner_role": "产品负责人 + 需求治理委员会",
            "version": "v1.0.0",
            "status": "active",
            "mission": "把自然语言需求、业务背景、历史缺陷和运营规则转成可验收、可追溯、可测试的需求资产。",
            "input_contract": ["PRD/需求单", "业务规则", "历史缺陷", "UAT 反馈", "线上指标"],
            "output_contract": ["需求规则卡", "验收标准", "歧义问题清单", "影响范围初判"],
            "tools": ["需求知识库", "缺陷库", "指标平台", "业务规则库"],
            "guardrails": ["不得补造业务概念", "高风险歧义必须人工确认", "输出必须关联需求来源"],
            "handoff_to": ["solution-agent", "test-orchestration-agent"],
            "sla": "10 分钟内完成初版澄清；L3/L4 需求必须生成歧义清单",
            "eval_metrics": ["歧义召回率", "验收标准完整率", "需求返工率"],
            "human_checkpoint": "业务规则、金额规则、权限规则存在歧义时强制产品确认"
        },
        {
            "id": "solution-agent",
            "name": "方案评审 Agent",
            "stage": "方案评审",
            "owner_role": "架构负责人 + 服务 Owner",
            "version": "v1.0.0",
            "status": "active",
            "mission": "基于需求和系统拓扑识别服务、接口、数据、算法、配置和发布依赖，形成工程影响分析。",
            "input_contract": ["需求规则卡", "服务拓扑", "接口契约", "数据血缘", "历史事故"],
            "output_contract": ["影响面分析", "依赖图谱", "接口契约差异", "风险等级建议"],
            "tools": ["CMDB", "接口契约平台", "数据血缘平台", "事故库"],
            "guardrails": ["跨域依赖必须列出 Owner", "L4 风险必须要求架构评审", "不能只基于代码 diff 判断影响面"],
            "handoff_to": ["coding-agent", "pr-diff-agent", "test-orchestration-agent"],
            "sla": "L3 变更 30 分钟内完成影响分析；L4 必须进入人工评审",
            "eval_metrics": ["影响面漏判率", "依赖 Owner 完整率", "架构评审一次通过率"],
            "human_checkpoint": "涉及交易金额、库存、履约、支付、数据回补时需要服务 Owner 确认"
        },
        {
            "id": "coding-agent",
            "name": "Coding Agent",
            "stage": "AI 编码",
            "owner_role": "研发 Owner",
            "version": "v1.0.0",
            "status": "active",
            "mission": "根据已冻结需求和方案生成代码、单测、迁移说明和自检证据，并遵守代码所有权边界。",
            "input_contract": ["需求规则卡", "技术方案", "代码规范", "接口契约", "测试基线"],
            "output_contract": ["代码变更", "单测", "自检说明", "回滚说明", "PR 草稿"],
            "tools": ["代码仓库", "单测框架", "代码规范", "Mock 服务"],
            "guardrails": ["禁止修改未授权模块", "禁止绕过测试", "必须说明 AI 生成范围", "高风险代码必须人工 Review"],
            "handoff_to": ["pr-diff-agent"],
            "sla": "每次提交必须带单测和自检摘要",
            "eval_metrics": ["编译通过率", "单测新增率", "AI 代码返工率", "Review 缺陷密度"],
            "human_checkpoint": "核心交易链路、权限、安全、资金相关代码必须人工合入"
        },
        {
            "id": "pr-diff-agent",
            "name": "PR Diff Agent",
            "stage": "PR 门禁",
            "owner_role": "研发 Owner + QA Owner",
            "version": "v1.0.0",
            "status": "active",
            "mission": "对 PR diff 做风险识别、代码质量检查、测试影响分析和门禁强度推荐。",
            "input_contract": ["PR diff", "提交说明", "需求规则卡", "代码 Owner", "历史缺陷"],
            "output_contract": ["PR 风险摘要", "Review 清单", "必跑测试集", "阻断项"],
            "tools": ["Git", "Sonar", "SAST", "SCA", "覆盖率平台", "缺陷库"],
            "guardrails": ["AI 大量改动默认提高一级风险", "缺少测试证据不得放行", "安全和供应链问题不得降级处理"],
            "handoff_to": ["test-orchestration-agent", "release-decision-agent"],
            "sla": "PR 创建后 5 分钟内给出风险评级和必跑清单",
            "eval_metrics": ["风险评级准确率", "缺陷前置发现率", "误阻断率", "PR 周转时间"],
            "human_checkpoint": "L3/L4、高复杂度 diff、跨团队接口变更必须人工 Review"
        },
        {
            "id": "test-orchestration-agent",
            "name": "测试编排 Agent",
            "stage": "测试验证",
            "owner_role": "QA Owner + 测试平台 Owner",
            "version": "v1.0.0",
            "status": "active",
            "mission": "按风险等级自动生成测试策略、测试数据、自动化任务、性能和混沌验证计划。",
            "input_contract": ["PR 风险摘要", "需求规则卡", "影响面分析", "历史用例", "质量指标"],
            "output_contract": ["测试策略", "必跑用例集", "测试数据任务", "自动化执行计划", "缺陷归因"],
            "tools": ["数据银行", "自动化框架", "性能平台", "混沌工程", "Mock 平台"],
            "guardrails": ["L3/L4 必须覆盖核心链路和异常链路", "失败用例必须归因", "测试数据必须可回收"],
            "handoff_to": ["uat-agent", "release-decision-agent"],
            "sla": "PR 风险评级后 10 分钟内生成测试编排",
            "eval_metrics": ["自动化覆盖率", "缺陷逃逸率", "用例推荐命中率", "测试执行耗时"],
            "human_checkpoint": "业务金额、库存、履约、数据回补类异常场景需 QA 确认覆盖"
        },
        {
            "id": "uat-agent",
            "name": "UAT Agent",
            "stage": "UAT 验收",
            "owner_role": "业务验收 Owner + 产品 Owner",
            "version": "v1.0.0",
            "status": "active",
            "mission": "把技术验证结果翻译为业务可验收样例，组织业务确认和验收证据沉淀。",
            "input_contract": ["验收标准", "测试报告", "业务样例", "风险遗留项"],
            "output_contract": ["UAT 样例表", "业务验收结论", "遗留风险确认", "签收记录"],
            "tools": ["UAT 管理", "数据银行", "业务规则库", "报告中心"],
            "guardrails": ["不得替业务做最终签收", "金额和权益类样例必须有期望值", "遗留风险必须显式确认"],
            "handoff_to": ["release-decision-agent"],
            "sla": "测试验证完成后 1 个工作日内生成 UAT 包",
            "eval_metrics": ["UAT 一次通过率", "业务返工率", "样例覆盖完整率"],
            "human_checkpoint": "业务验收结论必须由业务 Owner 或授权代表确认"
        },
        {
            "id": "release-decision-agent",
            "name": "发布决策 Agent",
            "stage": "发布决策",
            "owner_role": "发布经理 + 质量委员会",
            "version": "v1.0.0",
            "status": "active",
            "mission": "汇总需求、代码、测试、UAT、监控、回滚和遗留风险证据，给出发布准入结论。",
            "input_contract": ["PR 门禁结果", "测试报告", "UAT 结论", "监控项", "回滚预案", "遗留缺陷"],
            "output_contract": ["发布准入报告", "阻断项", "灰度策略", "回滚策略", "审批记录"],
            "tools": ["发布系统", "监控平台", "缺陷平台", "审批流", "配置中心"],
            "guardrails": ["阻断项未关闭不得全量发布", "例外发布必须审批", "灰度必须绑定监控和回滚"],
            "handoff_to": ["retro-agent"],
            "sla": "发布窗口前自动形成准入报告",
            "eval_metrics": ["变更失败率", "回滚时长", "发布阻断准确率", "灰度异常发现时间"],
            "human_checkpoint": "L3/L4 例外发布、资金链路发布、重大活动发布必须人工审批"
        },
        {
            "id": "retro-agent",
            "name": "复盘沉淀 Agent",
            "stage": "复盘沉淀",
            "owner_role": "质量运营 + 平台治理 Owner",
            "version": "v1.0.0",
            "status": "active",
            "mission": "把发布结果、线上问题、门禁误判、用例缺口和 Agent 表现沉淀为规则、知识和指标改进。",
            "input_contract": ["发布报告", "线上监控", "事故复盘", "缺陷归因", "Agent 执行记录"],
            "output_contract": ["复盘报告", "规则改进建议", "知识库更新", "Agent 评估报告"],
            "tools": ["监控平台", "缺陷库", "知识库", "指标看板", "Agent 评测平台"],
            "guardrails": ["事故复盘必须关联证据", "规则变更需要审批", "Agent 低可信输出不得自动进入生产规则"],
            "handoff_to": ["requirement-agent", "solution-agent", "test-orchestration-agent"],
            "sla": "发布后 24 小时内完成初版复盘；事故类 48 小时内完成根因归档",
            "eval_metrics": ["规则采纳率", "重复缺陷下降率", "Agent 误判率", "知识命中率"],
            "human_checkpoint": "门禁规则、风险模型、Agent 权限变更必须由治理 Owner 审批"
        }
    ]


def complete_agent_profile(agent: dict) -> dict:
    profile = {
        "runtime": {
            "model_policy": "高风险链路使用强推理模型；低风险链路使用快速模型；所有结论必须带证据引用。",
            "temperature": 0.2,
            "max_retries": 2,
            "timeout_seconds": 300,
            "memory_scope": "仅读取当前项目群、当前 PR、授权知识库和历史质量资产"
        },
        "input_schema": {
            "required": ["program_id", "risk_level", "requirement_card", "change_summary", "evidence_refs"],
            "optional": ["pr_diff", "service_dependencies", "historical_defects", "release_window"]
        },
        "output_schema": {
            "required": ["decision", "risk_summary", "actions", "evidence", "human_checkpoints"],
            "decision_enum": ["pass", "block", "need_human_review", "canary"]
        },
        "system_prompt": (
            "你是企业级 SDLC 质量保障 Agent。你的输出必须基于输入证据，不得编造业务概念；"
            "必须按风险等级给出门禁结论、证据缺口、下一步动作和需要人工确认的节点。"
        ),
        "tool_permissions": [
            {"tool": tool, "access": "read", "approval_required": False}
            for tool in agent.get("tools", [])
        ],
        "policy_rules": [
            {"id": "POL-EVIDENCE-001", "rule": "所有结论必须引用输入证据或工具结果。", "severity": "blocker"},
            {"id": "POL-HUMAN-001", "rule": agent.get("human_checkpoint", "高风险节点必须人工确认。"), "severity": "major"},
            {"id": "POL-SCOPE-001", "rule": "不得越权访问未授权代码、数据或业务域。", "severity": "blocker"}
        ],
        "eval_cases": [
            {
                "id": f"{agent['id']}-smoke",
                "name": "标准链路冒烟评测",
                "input": "L3 变更，证据完整，工具结果全部通过。",
                "expected": "输出 pass 或 canary，并列出证据链。"
            },
            {
                "id": f"{agent['id']}-missing-evidence",
                "name": "缺失关键证据评测",
                "input": "L3/L4 变更，缺少关键工具证据或人工确认。",
                "expected": "输出 block 或 need_human_review，不允许直接放行。"
            }
        ],
        "maintenance": {
            "change_process": "配置变更 -> 评测集回归 -> 灰度启用 -> 指标观察 -> 正式发布",
            "approval_role": "平台治理 Owner",
            "rollback": "保留上一版本配置，失败时一键回退。",
            "review_cycle": "双周小版本、月度评测集更新、季度权限复核"
        },
        "versions": [
            {"version": agent.get("version", "v1.0.0"), "date": "2026-06-11", "change": "初始化企业级 Agent 配置"}
        ]
    }

    if agent["id"] == "test-orchestration-agent":
        profile.update({
            "system_prompt": (
                "你是互联网电商核心链路的测试编排 Agent，负责在 AI Coding 大量提交代码后，"
                "基于需求规则卡、PR 风险摘要、影响面分析、历史缺陷、质量指标和工具结果，"
                "自动生成分层测试策略、测试数据、自动化任务、性能/混沌验证、证据缺口和门禁结论。\n"
                "硬性要求：1. 不得虚构平台券、店铺券等不存在的业务概念；沃尔玛当前只按全场券和商品券建模。"
                "2. L3/L4 风险必须覆盖正常链路、异常链路、并发链路、回滚链路和监控项。"
                "3. 自动化失败、支付金额一致性缺失、库存超卖风险未验证时不得建议全量发布。"
                "4. 输出必须是结构化 JSON，并包含 evidence_refs、test_plan、data_plan、automation_plan、gate_decision。"
            ),
            "input_schema": {
                "required": [
                    "program_id",
                    "risk_level",
                    "requirement_card",
                    "pr_risk_summary",
                    "impact_analysis",
                    "quality_metrics",
                    "available_tools"
                ],
                "optional": ["historical_defects", "uat_examples", "release_window", "monitoring_baseline"],
                "example": {
                    "program_id": "order-coupon-program",
                    "risk_level": "L3",
                    "requirement_card": "全场券与商品券叠加，支付前金额必须与结算金额一致。",
                    "quality_metrics": {"unit_coverage": "82.4%", "api_pass": "126/132", "p95": "180ms"}
                }
            },
            "output_schema": {
                "required": [
                    "risk_summary",
                    "test_plan",
                    "data_plan",
                    "automation_plan",
                    "performance_plan",
                    "chaos_plan",
                    "evidence_gaps",
                    "gate_decision",
                    "human_checkpoints"
                ],
                "gate_decision_enum": ["pass", "block", "exception_review", "canary"],
                "example": {
                    "gate_decision": "block",
                    "evidence_gaps": ["支付前金额一致性证据缺失", "6 条优惠叠加 E2E 失败"],
                    "human_checkpoints": ["QA Owner 确认失败用例归因", "支付 Owner 确认金额校验"]
                }
            },
            "tool_permissions": [
                {"tool": "数据银行", "access": "read_write", "approval_required": False, "scope": "构造券、库存、支付异常测试数据"},
                {"tool": "自动化框架", "access": "execute", "approval_required": False, "scope": "触发接口、E2E、契约回归"},
                {"tool": "性能平台", "access": "execute", "approval_required": True, "scope": "L3/L4 关键链路压测"},
                {"tool": "混沌工程", "access": "execute", "approval_required": True, "scope": "库存、支付、履约异常注入"},
                {"tool": "缺陷平台", "access": "read_write", "approval_required": False, "scope": "创建缺陷、归因失败用例"},
                {"tool": "监控平台", "access": "read", "approval_required": False, "scope": "读取 P95、错误率、金额差异率"}
            ],
            "policy_rules": [
                {"id": "TEST-L3-001", "rule": "L3 及以上变更必须覆盖核心业务链路、异常链路、回滚链路。", "severity": "blocker"},
                {"id": "TEST-PAY-001", "rule": "订单支付前金额一致性缺失时必须阻断全量发布。", "severity": "blocker"},
                {"id": "TEST-DATA-001", "rule": "测试数据必须声明来源、用途、回收策略，不得污染生产数据。", "severity": "major"},
                {"id": "TEST-AUTO-001", "rule": "接口自动化或 E2E 失败必须归因，未归因不得放行。", "severity": "blocker"},
                {"id": "TEST-OBS-001", "rule": "灰度或发布必须绑定监控项、阈值和回滚动作。", "severity": "major"}
            ],
            "eval_cases": [
                {
                    "id": "coupon-stack-l3",
                    "name": "全场券 + 商品券叠加 L3 评测",
                    "input": "全场券与商品券叠加，接口自动化 126/132，缺支付前金额一致性证据。",
                    "expected": "必须输出 block，证据缺口包含支付前金额一致性和失败用例归因。"
                },
                {
                    "id": "inventory-chaos-l4",
                    "name": "库存回补 L4 评测",
                    "input": "库存流水回补，数据质量存在余额不一致，回滚演练缺失。",
                    "expected": "必须输出 block 或 exception_review，要求数据 Owner 和发布经理确认。"
                },
                {
                    "id": "search-model-canary-l3",
                    "name": "搜索模型灰度 L3 评测",
                    "input": "模型效果提升，自动化通过，特征完整率 99.96%，回滚开关存在。",
                    "expected": "允许输出 canary，必须包含灰度比例、监控指标和回滚条件。"
                }
            ],
            "maintenance": {
                "change_process": "新增策略或工具权限 -> 跑三类业务评测集 -> QA Owner 审核 -> 5% 项目灰度 -> 指标稳定后全量",
                "approval_role": "QA Owner + 测试平台 Owner",
                "rollback": "保存上一版 prompt、policy、tool_permissions；误阻断或漏检升高时回退。",
                "review_cycle": "每两周复盘失败用例，每月用线上逃逸缺陷更新评测集，每季度复核工具执行权限。"
            }
        })
    return profile


def workflow_template() -> dict:
    return {
        "id": "enterprise-sdlc-quality-template",
        "name": "大型项目 SDLC 质量保障模板",
        "annual_capacity": 360,
        "risk_distribution": {"L1": 120, "L2": 150, "L3": 72, "L4": 18},
        "stages": [
            {"stage": "需求澄清", "agent_id": "requirement-agent", "role": "产品/业务", "gate": "需求规则卡、验收标准、歧义清单齐全"},
            {"stage": "方案评审", "agent_id": "solution-agent", "role": "架构/研发", "gate": "影响面、依赖 Owner、接口契约和风险等级明确"},
            {"stage": "AI 编码", "agent_id": "coding-agent", "role": "研发", "gate": "代码、单测、自检、回滚说明齐全"},
            {"stage": "PR 门禁", "agent_id": "pr-diff-agent", "role": "研发/QA", "gate": "PR 风险、必跑测试、安全与覆盖率证据齐全"},
            {"stage": "测试验证", "agent_id": "test-orchestration-agent", "role": "QA/测试平台", "gate": "自动化、测试数据、性能、混沌和缺陷归因达标"},
            {"stage": "UAT 验收", "agent_id": "uat-agent", "role": "业务/产品", "gate": "业务样例、签收记录、遗留风险确认齐全"},
            {"stage": "发布决策", "agent_id": "release-decision-agent", "role": "发布/质量委员会", "gate": "发布准入、灰度、监控和回滚策略明确"},
            {"stage": "复盘沉淀", "agent_id": "retro-agent", "role": "质量运营/平台治理", "gate": "规则、知识、评测集和指标完成沉淀"}
        ],
        "risk_gate_policy": {
            "L1": "轻量门禁：静态扫描、基础单测、核心接口冒烟。",
            "L2": "标准门禁：单测、接口自动化、影响面回归、基础监控。",
            "L3": "强门禁：全链路回归、数据银行、性能基线、异常场景、人工 Review。",
            "L4": "最高门禁：架构评审、混沌工程、回滚演练、质量委员会审批、灰度观察。"
        }
    }


def role_variants() -> list:
    return [
        {"role": "产品 Owner", "agent_ids": ["requirement-agent", "uat-agent"], "responsibility": "需求准确性、业务验收、歧义确认", "approval": "业务规则和验收标准"},
        {"role": "研发 Owner", "agent_ids": ["solution-agent", "coding-agent", "pr-diff-agent"], "responsibility": "方案可落地、代码质量、PR 风险控制", "approval": "核心代码和接口契约"},
        {"role": "QA Owner", "agent_ids": ["pr-diff-agent", "test-orchestration-agent"], "responsibility": "测试策略、证据完整性、失败归因", "approval": "L3/L4 测试覆盖和阻断项"},
        {"role": "架构 Owner", "agent_ids": ["solution-agent"], "responsibility": "跨域依赖、架构风险、回滚可行性", "approval": "L4 或核心链路方案"},
        {"role": "数据/算法 Owner", "agent_ids": ["solution-agent", "test-orchestration-agent"], "responsibility": "数据血缘、特征质量、模型灰度证据", "approval": "数据回补和模型灰度"},
        {"role": "业务验收 Owner", "agent_ids": ["uat-agent"], "responsibility": "UAT 样例、业务签收、遗留风险接受", "approval": "业务验收结论"},
        {"role": "发布经理", "agent_ids": ["release-decision-agent"], "responsibility": "发布窗口、灰度策略、回滚和审批", "approval": "例外发布和全量发布"},
        {"role": "质量运营", "agent_ids": ["retro-agent"], "responsibility": "复盘、规则治理、Agent 评测集维护", "approval": "门禁规则和 Agent 权限变更"}
    ]


def portfolio_projects() -> list:
    projects = [
        ("P-2026-001", "订单交易优惠规则改造", "交易", "L3", "blocked", "Q1", 8),
        ("P-2026-002", "库存可售承诺与数据回补", "履约", "L4", "exception_review", "Q1", 11),
        ("P-2026-003", "搜索排序模型灰度", "算法", "L3", "canary", "Q1", 6),
        ("P-2026-004", "会员权益结算重构", "会员", "L3", "running", "Q2", 7),
        ("P-2026-005", "购物车跨端一致性", "交易", "L2", "running", "Q2", 5),
        ("P-2026-006", "履约 ETA 策略升级", "履约", "L3", "running", "Q2", 8),
        ("P-2026-007", "支付渠道降级治理", "支付", "L4", "blocked", "Q2", 10),
        ("P-2026-008", "运营活动库存保护", "营销", "L3", "running", "Q3", 6),
        ("P-2026-009", "商品价格中心改造", "商品", "L4", "planning", "Q3", 12),
        ("P-2026-010", "数据银行能力升级", "测试平台", "L2", "running", "Q3", 4),
        ("P-2026-011", "大促搜索稳定性专项", "搜索", "L3", "planning", "Q4", 9),
        ("P-2026-012", "核心链路混沌演练", "稳定性", "L4", "planning", "Q4", 10)
    ]
    return [
        {
            "id": item[0],
            "name": item[1],
            "domain": item[2],
            "risk_level": item[3],
            "status": item[4],
            "quarter": item[5],
            "agent_runs": item[6],
            "template_id": "enterprise-sdlc-quality-template",
            "roles": ["产品 Owner", "研发 Owner", "QA Owner", "发布经理"] if item[3] != "L4" else ["产品 Owner", "研发 Owner", "QA Owner", "架构 Owner", "发布经理", "质量运营"],
            "quality_objective": "按风险等级完成全流程证据闭环，并把阻断项纳入发布决策"
        }
        for item in projects
    ]


def seed_state() -> dict:
    return {
        "agents": agent_catalog(),
        "workflow_templates": [workflow_template()],
        "role_variants": role_variants(),
        "portfolio_projects": portfolio_projects(),
        "programs": [
            {
                "id": "order-coupon-program",
                "name": "订单交易优惠规则项目群",
                "domain": "订单 / 优惠 / 库存 / 支付",
                "risk_level": "L3",
                "decision": "blocked",
                "summary": "全场券与商品券叠加规则变更，影响结算金额、库存锁定、支付前金额一致性。",
                "teams": ["产品", "订单研发", "优惠研发", "库存研发", "支付研发", "QA", "UAT", "发布"],
                "risks": [
                    {"name": "金额计算", "score": 92},
                    {"name": "库存并发", "score": 78},
                    {"name": "支付一致性", "score": 95},
                    {"name": "发布回滚", "score": 64},
                    {"name": "AI 不确定性", "score": 72}
                ],
                "dependencies": [
                    {"team": "产品", "item": "全场券/商品券叠加规则确认", "status": "done", "owner": "业务产品"},
                    {"team": "订单研发", "item": "结算金额模型改造", "status": "done", "owner": "订单服务 Owner"},
                    {"team": "优惠研发", "item": "优惠试算接口契约", "status": "done", "owner": "优惠服务 Owner"},
                    {"team": "库存研发", "item": "库存并发锁定验证", "status": "running", "owner": "库存服务 Owner"},
                    {"team": "支付研发", "item": "支付前金额一致性校验", "status": "blocked", "owner": "支付服务 Owner"},
                    {"team": "UAT", "item": "金额样例业务签收", "status": "waiting", "owner": "业务验收"}
                ],
                "mock_data": [
                    {"name": "优惠组合 A", "value": "商品券 SKU-10086 减 15 + 全场券满 199 减 20，期望优惠 35"},
                    {"name": "优惠组合 B", "value": "商品券不适用 SKU，只有全场券生效，期望优惠 20"},
                    {"name": "库存并发", "value": "SKU-10086 库存 2，并发 20 用户下单，期望不超卖"},
                    {"name": "支付失败", "value": "支付超时后释放库存，订单金额状态回滚"},
                    {"name": "金额篡改", "value": "支付前金额与结算金额不一致，期望阻断支付"}
                ],
                "tools": [
                    {"name": "Sonar", "status": "passed", "detail": "0 blocker / 2 minor"},
                    {"name": "单测覆盖率", "status": "passed", "detail": "82.4%，较基线 +1.8%"},
                    {"name": "数据银行", "status": "passed", "detail": "36 组券/库存/支付异常数据已生成"},
                    {"name": "接口自动化", "status": "failed", "detail": "126/132 通过，6 条优惠叠加 E2E 失败"},
                    {"name": "性能平台", "status": "passed", "detail": "结算 P95 180ms，阈值 220ms"},
                    {"name": "混沌工程", "status": "running", "detail": "库存服务超时重试验证中"},
                    {"name": "监控平台", "status": "ready", "detail": "金额差异率、库存释放失败率、支付失败率已绑定"}
                ],
                "steps": [
                    {"agent": "需求澄清 Agent", "stage": "需求澄清", "status": "ready", "output": "抽取 18 条业务规则、12 个验收点、4 个歧义点。", "artifact": "需求规则卡 + UAT 验收清单"},
                    {"agent": "方案评审 Agent", "stage": "方案评审", "status": "ready", "output": "识别订单、优惠、库存、支付 4 个核心依赖。", "artifact": "服务依赖图 + 接口契约差异"},
                    {"agent": "Coding Agent", "stage": "AI 编码", "status": "ready", "output": "生成优惠叠加计算分支、单测 26 条、异常处理说明。", "artifact": "PR 草稿 + 单测草案"},
                    {"agent": "PR Diff Agent", "stage": "PR 门禁", "status": "ready", "output": "改动触达 order-price、coupon-calc、payment-check，风险 L3。", "artifact": "PR 风险摘要 + Review 清单"},
                    {"agent": "测试编排 Agent", "stage": "测试验证", "status": "ready", "output": "生成 36 组测试数据，推荐 132 条接口/E2E 回归。", "artifact": "测试策略 + 数据银行任务"},
                    {"agent": "UAT Agent", "stage": "UAT 验收", "status": "ready", "output": "生成 UAT 样例 9 组，等待支付前金额一致性业务确认。", "artifact": "UAT 金额样例表"},
                    {"agent": "发布决策 Agent", "stage": "发布决策", "status": "ready", "output": "缺支付前金额一致性证据，建议阻断全量发布。", "artifact": "发布准入报告"},
                    {"agent": "复盘沉淀 Agent", "stage": "复盘沉淀", "status": "ready", "output": "建议新增支付前金额一致性为订单优惠 L3 必选门禁。", "artifact": "门禁规则变更建议"}
                ]
            },
            {
                "id": "inventory-data-program",
                "name": "库存可售承诺与数据回补项目群",
                "domain": "库存 / 履约 / 数据",
                "risk_level": "L4",
                "decision": "exception_review",
                "summary": "库存可售承诺改造涉及库存流水、履约 ETA、离线回补和运营展示。",
                "teams": ["库存研发", "履约研发", "数据团队", "QA", "运营", "发布"],
                "risks": [
                    {"name": "库存超卖", "score": 96},
                    {"name": "数据回补", "score": 91},
                    {"name": "履约时效", "score": 82},
                    {"name": "回滚难度", "score": 88},
                    {"name": "跨团队依赖", "score": 86}
                ],
                "dependencies": [
                    {"team": "库存研发", "item": "锁库存幂等改造", "status": "done", "owner": "库存 Owner"},
                    {"team": "履约研发", "item": "ETA 接口契约冻结", "status": "blocked", "owner": "履约 Owner"},
                    {"team": "数据团队", "item": "库存流水回补脚本", "status": "running", "owner": "数据 Owner"},
                    {"team": "发布", "item": "回滚演练", "status": "blocked", "owner": "发布经理"}
                ],
                "mock_data": [
                    {"name": "库存流水", "value": "锁定/释放/扣减/回补四类事件"},
                    {"name": "回补批次", "value": "10 万条库存状态修正"},
                    {"name": "异常消息", "value": "重复、乱序、延迟消息"},
                    {"name": "灰度城市", "value": "上海、广州 5% 门店"}
                ],
                "tools": [
                    {"name": "数据质量", "status": "failed", "detail": "回补后 3 条库存余额不一致"},
                    {"name": "性能平台", "status": "passed", "detail": "P99 380ms"},
                    {"name": "混沌工程", "status": "running", "detail": "履约超时注入中"},
                    {"name": "发布系统", "status": "blocked", "detail": "回滚演练缺失"}
                ],
                "steps": [
                    {"agent": "需求澄清 Agent", "stage": "需求澄清", "status": "ready", "output": "抽取库存可售、履约 ETA、运营展示规则。", "artifact": "需求规则卡"},
                    {"agent": "依赖治理 Agent", "stage": "依赖分析", "status": "ready", "output": "识别 ETA 接口和回补脚本为关键阻塞路径。", "artifact": "依赖图谱"},
                    {"agent": "数据变更 Agent", "stage": "数据评审", "status": "ready", "output": "库存流水回补影响 3 个报表和 2 个运营看板。", "artifact": "数据血缘报告"},
                    {"agent": "测试编排 Agent", "stage": "验证编排", "status": "ready", "output": "触发库存并发、乱序消息、回补失败和混沌测试。", "artifact": "测试任务集"},
                    {"agent": "发布决策 Agent", "stage": "发布决策", "status": "ready", "output": "缺 ETA 契约冻结和回滚演练，建议禁止发布。", "artifact": "L4 门禁报告"}
                ]
            },
            {
                "id": "search-model-program",
                "name": "搜索排序模型灰度项目群",
                "domain": "算法 / 搜索 / 数据 / 前端",
                "risk_level": "L3",
                "decision": "canary",
                "summary": "搜索排序模型灰度涉及模型版本、特征数据、搜索服务和业务指标观测。",
                "teams": ["算法", "搜索研发", "数据团队", "前端", "QA", "业务运营"],
                "risks": [
                    {"name": "模型效果", "score": 68},
                    {"name": "特征延迟", "score": 48},
                    {"name": "搜索延迟", "score": 55},
                    {"name": "低频类目", "score": 72},
                    {"name": "回滚", "score": 35}
                ],
                "dependencies": [
                    {"team": "算法", "item": "模型 v2026.06.11 注册", "status": "done", "owner": "算法 Owner"},
                    {"team": "数据团队", "item": "特征完整率校验", "status": "done", "owner": "数据 Owner"},
                    {"team": "搜索研发", "item": "模型降级开关", "status": "done", "owner": "搜索 Owner"},
                    {"team": "运营", "item": "低频类目样例确认", "status": "waiting", "owner": "运营"}
                ],
                "mock_data": [
                    {"name": "搜索词", "value": "高频词、长尾词、品牌词"},
                    {"name": "特征", "value": "价格、销量、库存、偏好"},
                    {"name": "灰度", "value": "1% 用户，不含大促活动"},
                    {"name": "回滚", "value": "3 分钟内回切旧模型"}
                ],
                "tools": [
                    {"name": "模型平台", "status": "passed", "detail": "模型已注册"},
                    {"name": "数据质量", "status": "passed", "detail": "特征完整率 99.96%"},
                    {"name": "自动化", "status": "passed", "detail": "88/88"},
                    {"name": "监控", "status": "ready", "detail": "CTR/CVR/无结果率/P95"}
                ],
                "steps": [
                    {"agent": "需求澄清 Agent", "stage": "效果目标", "status": "ready", "output": "确认 CTR、CVR、无结果率、P95 延迟和低频类目曝光。", "artifact": "效果目标卡"},
                    {"agent": "算法变更 Agent", "stage": "模型评审", "status": "ready", "output": "离线 NDCG +2.1%，提示关注低频类目。", "artifact": "模型评审报告"},
                    {"agent": "数据变更 Agent", "stage": "特征校验", "status": "ready", "output": "特征完整率 99.96%，延迟 P95 4 分钟。", "artifact": "特征质量报告"},
                    {"agent": "测试编排 Agent", "stage": "验证编排", "status": "ready", "output": "搜索接口 88/88 通过，影子流量无异常。", "artifact": "验证报告"},
                    {"agent": "发布决策 Agent", "stage": "灰度决策", "status": "ready", "output": "证据齐全，建议 1% 灰度并绑定回滚开关。", "artifact": "灰度计划"}
                ]
            }
        ],
        "runs": [],
        "events": []
    }


def normalize_state(state: dict) -> dict:
    state["agents"] = normalize_agents(state.get("agents"))
    state.setdefault("workflow_templates", [workflow_template()])
    state.setdefault("role_variants", role_variants())
    state.setdefault("portfolio_projects", portfolio_projects())
    agent_ids_by_name = {agent["name"]: agent["id"] for agent in state["agents"]}
    agent_ids_by_stage = {agent["stage"]: agent["id"] for agent in state["agents"]}

    for program in state.get("programs", []):
        for dependency in program.get("dependencies", []):
            dependency.setdefault("name", dependency.get("item", "跨团队依赖"))
        for tool in program.get("tools", []):
            detail = tool.get("detail", "")
            tool.setdefault("metric", detail.split("，", 1)[0] if detail else "质量证据")
            tool.setdefault("threshold", "按风险等级动态门禁")
            tool.setdefault("value", detail or tool.get("status", "ready"))
        for step in program.get("steps", []):
            stage = step.get("stage", "质量阶段")
            step.setdefault(
                "agent_id",
                agent_ids_by_name.get(step.get("agent")) or agent_ids_by_stage.get(stage) or "test-orchestration-agent"
            )
            step.setdefault("input", f"{stage} 相关需求、代码、依赖、工具证据和历史缺陷数据")
            step.setdefault("gate", f"{stage} 输出必须形成可追溯证据，L3/L4 风险需满足强制门禁")
            step.setdefault("collaborators", program.get("teams", [])[:4])
    state.setdefault("runs", [])
    state.setdefault("events", [])
    return state


def portfolio_summary(state: dict) -> dict:
    projects = state.get("portfolio_projects", [])
    by_risk = {}
    by_quarter = {}
    status = {}
    for project in projects:
        by_risk[project["risk_level"]] = by_risk.get(project["risk_level"], 0) + 1
        by_quarter[project["quarter"]] = by_quarter.get(project["quarter"], 0) + 1
        status[project["status"]] = status.get(project["status"], 0) + 1
    annual_capacity = state["workflow_templates"][0]["annual_capacity"] if state.get("workflow_templates") else 0
    return {
        "annual_capacity": annual_capacity,
        "current_projects": len(projects),
        "estimated_yearly_projects": annual_capacity,
        "capacity_used_percent": round((len(projects) / annual_capacity) * 100, 1) if annual_capacity else 0,
        "by_risk": by_risk,
        "by_quarter": by_quarter,
        "by_status": status,
        "agent_run_forecast": sum(project.get("agent_runs", 0) for project in projects),
        "role_count": len(state.get("role_variants", [])),
        "template_stage_count": len(state.get("workflow_templates", [{}])[0].get("stages", []))
    }


def normalize_agents(agents: list | None) -> list:
    canonical = {agent["id"]: agent for agent in agent_catalog()}
    merged = []
    for agent in agent_catalog():
        current = deepcopy(agent)
        current.update(complete_agent_profile(agent))
        if agents:
            existing = next((item for item in agents if item.get("id") == agent["id"]), None)
            if existing:
                current.update(existing)
        for field, default in agent.items():
            current.setdefault(field, default)
        for field, default in complete_agent_profile(agent).items():
            current.setdefault(field, default)
        merged.append(current)
    return merged


def update_agent(state: dict, agent_id: str, payload: dict) -> dict:
    agent = find_agent(state, agent_id)
    editable_fields = {
        "owner_role",
        "version",
        "status",
        "mission",
        "system_prompt",
        "input_schema",
        "output_schema",
        "tool_permissions",
        "policy_rules",
        "eval_cases",
        "maintenance",
        "sla",
        "human_checkpoint",
        "eval_metrics",
        "guardrails",
        "tools",
        "handoff_to"
    }
    for field in editable_fields:
        if field in payload:
            agent[field] = payload[field]
    agent["updated_at"] = now()
    agent.setdefault("versions", [])
    if payload.get("change_note"):
        agent["versions"].insert(0, {
            "version": agent.get("version", "v1.0.0"),
            "date": now().split(" ")[0],
            "change": payload["change_note"]
        })
    save_state(state)
    return agent


def simulate_agent(agent: dict, program: dict | None) -> dict:
    program_name = program["name"] if program else "未选择项目"
    risk_level = program.get("risk_level", "L3") if program else "L3"
    failed_tools = [tool for tool in (program or {}).get("tools", []) if tool.get("status") in {"failed", "blocked"}]
    blocked_dependencies = [dep for dep in (program or {}).get("dependencies", []) if dep.get("status") == "blocked"]
    evidence_gaps = [tool["name"] for tool in failed_tools] + [dep["item"] for dep in blocked_dependencies]
    decision = "block" if evidence_gaps and risk_level in {"L3", "L4"} else "canary"
    if agent["id"] == "test-orchestration-agent":
        actions = [
            "生成全场券与商品券组合测试数据",
            "触发结算、优惠、库存、支付接口回归",
            "对失败自动化用例做缺陷归因",
            "补齐支付前金额一致性证据",
            "绑定金额差异率、库存释放失败率、支付失败率监控"
        ]
    else:
        actions = [
            f"读取 {program_name} 的阶段证据",
            "校验输入输出契约",
            "执行策略规则",
            "输出门禁建议和人工确认点"
        ]
    return {
        "agent_id": agent["id"],
        "agent_name": agent["name"],
        "program": program_name,
        "risk_level": risk_level,
        "decision": decision,
        "evidence_gaps": evidence_gaps or ["暂无阻断证据缺口"],
        "actions": actions,
        "human_checkpoints": [agent.get("human_checkpoint", "高风险节点需要人工确认")],
        "generated_at": now()
    }


def load_state() -> dict:
    DATA_DIR.mkdir(exist_ok=True)
    if not STATE_FILE.exists():
        state = normalize_state(seed_state())
        save_state(state)
        return state
    state = json.loads(STATE_FILE.read_text(encoding="utf-8"))
    normalized = normalize_state(state)
    if normalized != state:
        save_state(normalized)
    return normalized



def save_state(state: dict) -> None:
    DATA_DIR.mkdir(exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")


def find_program(state: dict, program_id: str) -> dict:
    for program in state["programs"]:
        if program["id"] == program_id:
            return program
    raise KeyError(program_id)


def find_run(state: dict, run_id: str) -> dict:
    for run in state["runs"]:
        if run["id"] == run_id:
            return run
    raise KeyError(run_id)


def find_agent(state: dict, agent_id: str) -> dict:
    for agent in state["agents"]:
        if agent["id"] == agent_id:
            return agent
    raise KeyError(agent_id)


def now() -> str:
    return time.strftime("%Y-%m-%d %H:%M:%S")


def decision_for(program: dict, completed_steps: int) -> str:
    if completed_steps < len(program["steps"]):
        return "running"
    return program["decision"]


def evidence_score(program: dict, completed_steps: int) -> int:
    if not program["steps"]:
        return 0
    base = round((completed_steps / len(program["steps"])) * 100)
    failed_tools = [tool for tool in program["tools"] if tool["status"] in {"failed", "blocked"}]
    return max(0, base - len(failed_tools) * 8)


def run_view(state: dict, run: dict) -> dict:
    program = find_program(state, run["program_id"])
    completed = run["current_step"] + 1 if run["current_step"] >= 0 else 0
    decision = decision_for(program, completed)
    if run.get("approvals") and run["approvals"][-1].get("decision") == "approved":
        decision = "approved"
    return {
        **run,
        "program": program,
        "completed_steps": completed,
        "evidence_score": evidence_score(program, completed),
        "decision": decision,
        "current": program["steps"][run["current_step"]] if run["current_step"] >= 0 else None,
    }


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

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

    def do_GET(self):
        parsed = urlparse(self.path)
        state = load_state()

        if parsed.path == "/":
            self.path = "/system.html"
            return super().do_GET()
        if parsed.path == "/api/portfolio":
            return self.send_json({
                "summary": portfolio_summary(state),
                "projects": state.get("portfolio_projects", []),
                "workflow_templates": state.get("workflow_templates", []),
                "role_variants": state.get("role_variants", [])
            })
        if parsed.path == "/api/agents":
            return self.send_json({"agents": state["agents"]})
        if parsed.path.startswith("/api/agents/"):
            try:
                return self.send_json({"agent": find_agent(state, parsed.path.rsplit("/", 1)[-1])})
            except KeyError:
                return self.send_json({"error": "agent not found"}, 404)
        if parsed.path == "/api/programs":
            return self.send_json({"programs": state["programs"]})
        if parsed.path.startswith("/api/programs/"):
            try:
                return self.send_json({"program": find_program(state, parsed.path.rsplit("/", 1)[-1])})
            except KeyError:
                return self.send_json({"error": "program not found"}, 404)
        if parsed.path == "/api/runs":
            return self.send_json({"runs": [run_view(state, run) for run in state["runs"]]})
        if parsed.path.startswith("/api/runs/"):
            run_id = parsed.path.rsplit("/", 1)[-1]
            try:
                return self.send_json({"run": run_view(state, find_run(state, run_id))})
            except KeyError:
                return self.send_json({"error": "run not found"}, 404)
        if parsed.path.startswith("/api/reports/"):
            run_id = parsed.path.rsplit("/", 1)[-1]
            try:
                run = find_run(state, run_id)
                report = build_report(state, run)
                return self.send_json({"report": report})
            except KeyError:
                return self.send_json({"error": "run not found"}, 404)

        return super().do_GET()

    def do_HEAD(self):
        parsed = urlparse(self.path)
        if parsed.path == "/":
            self.path = "/system.html"
        return super().do_HEAD()

    def do_PUT(self):
        parsed = urlparse(self.path)
        state = load_state()

        if parsed.path.startswith("/api/agents/"):
            agent_id = parsed.path.rsplit("/", 1)[-1]
            try:
                payload = self.read_json()
                agent = update_agent(state, agent_id, payload)
                return self.send_json({"agent": agent})
            except KeyError:
                return self.send_json({"error": "agent not found"}, 404)

        return self.send_json({"error": "not found"}, 404)

    def do_POST(self):
        parsed = urlparse(self.path)
        state = load_state()

        if parsed.path.startswith("/api/agents/") and parsed.path.endswith("/simulate"):
            parts = parsed.path.split("/")
            agent_id = parts[3] if len(parts) > 3 else ""
            payload = self.read_json()
            try:
                agent = find_agent(state, agent_id)
                program = None
                if payload.get("program_id"):
                    program = find_program(state, payload["program_id"])
                elif state.get("programs"):
                    program = state["programs"][0]
                return self.send_json({"result": simulate_agent(agent, program)})
            except KeyError:
                return self.send_json({"error": "agent or program not found"}, 404)

        if parsed.path == "/api/projects/intake":
            payload = self.read_json()
            project = {
                "id": payload.get("id") or f"P-2026-{len(state.get('portfolio_projects', [])) + 1:03d}",
                "name": payload.get("name", "新接入项目"),
                "domain": payload.get("domain", "未分类"),
                "risk_level": payload.get("risk_level", "L2"),
                "status": "planning",
                "quarter": payload.get("quarter", "Q4"),
                "agent_runs": len(state.get("workflow_templates", [{}])[0].get("stages", [])),
                "template_id": payload.get("template_id", "enterprise-sdlc-quality-template"),
                "roles": payload.get("roles", ["产品 Owner", "研发 Owner", "QA Owner", "发布经理"]),
                "quality_objective": payload.get("quality_objective", "按风险等级完成全流程证据闭环")
            }
            state.setdefault("portfolio_projects", []).insert(0, project)
            save_state(state)
            return self.send_json({"project": project, "summary": portfolio_summary(state)})

        if parsed.path == "/api/runs/start":
            payload = self.read_json()
            program_id = payload.get("program_id") or state["programs"][0]["id"]
            mode = payload.get("mode", "guarded")
            try:
                find_program(state, program_id)
            except KeyError:
                return self.send_json({"error": "program not found"}, 404)
            run = {
                "id": f"run-{uuid.uuid4().hex[:8]}",
                "program_id": program_id,
                "mode": mode,
                "current_step": -1,
                "status": "created",
                "created_at": now(),
                "updated_at": now(),
                "logs": [f"{now()} run created in {mode} mode"],
                "approvals": []
            }
            state["runs"].insert(0, run)
            save_state(state)
            return self.send_json({"run": run_view(state, run)})

        if parsed.path.startswith("/api/runs/") and parsed.path.endswith("/next"):
            run_id = parsed.path.split("/")[3]
            try:
                run = find_run(state, run_id)
                program = find_program(state, run["program_id"])
            except KeyError:
                return self.send_json({"error": "run not found"}, 404)
            if run["current_step"] < len(program["steps"]) - 1:
                run["current_step"] += 1
                step = program["steps"][run["current_step"]]
                run["status"] = "blocked" if step["stage"] == "发布决策" and program["decision"] == "blocked" else "running"
                run["logs"].append(f"{now()} {step['agent']} finished {step['stage']}: {step['output']}")
                run["updated_at"] = now()
            save_state(state)
            return self.send_json({"run": run_view(state, run)})

        if parsed.path.startswith("/api/runs/") and parsed.path.endswith("/auto"):
            run_id = parsed.path.split("/")[3]
            try:
                run = find_run(state, run_id)
                program = find_program(state, run["program_id"])
            except KeyError:
                return self.send_json({"error": "run not found"}, 404)
            run["current_step"] = len(program["steps"]) - 1
            run["status"] = "blocked" if program["decision"] == "blocked" else "ready"
            run["logs"].append(f"{now()} auto orchestration completed, decision={program['decision']}")
            run["updated_at"] = now()
            save_state(state)
            return self.send_json({"run": run_view(state, run)})

        if parsed.path.startswith("/api/runs/") and parsed.path.endswith("/approve"):
            run_id = parsed.path.split("/")[3]
            payload = self.read_json()
            try:
                run = find_run(state, run_id)
            except KeyError:
                return self.send_json({"error": "run not found"}, 404)
            run["approvals"].append({"at": now(), "by": payload.get("by", "current-user"), "decision": payload.get("decision", "approved"), "reason": payload.get("reason", "")})
            run["logs"].append(f"{now()} approval recorded: {payload.get('decision', 'approved')}")
            run["updated_at"] = now()
            save_state(state)
            return self.send_json({"run": run_view(state, run)})

        if parsed.path == "/api/report":
            payload = self.read_json()
            markdown = payload.get("markdown", "")
            REPORTS.mkdir(exist_ok=True)
            output = REPORTS / "ai-quality-report.md"
            output.write_text(markdown, encoding="utf-8")
            return self.send_json({"path": str(output), "ok": True})

        return self.send_json({"error": "not found"}, 404)


def build_report(state: dict, run: dict) -> str:
    program = find_program(state, run["program_id"])
    view = run_view(state, run)
    lines = [
        f"# {program['name']} Agent 编排报告",
        "",
        f"- Run: {run['id']}",
        f"- Mode: {run['mode']}",
        f"- Risk: {program['risk_level']}",
        f"- Decision: {view['decision']}",
        f"- Evidence Score: {view['evidence_score']}%",
        "",
        "## Steps",
    ]
    for index, step in enumerate(program["steps"], start=1):
        done = "DONE" if index <= view["completed_steps"] else "PENDING"
        lines.append(f"- {index}. [{done}] {step['stage']} / {step['agent']}: {step['output']}")
    lines.extend(["", "## Dependencies"])
    for dep in program["dependencies"]:
        lines.append(f"- {dep['team']} / {dep['item']}: {dep['status']} ({dep['owner']})")
    lines.extend(["", "## Tool Evidence"])
    for tool in program["tools"]:
        lines.append(f"- {tool['name']}: {tool['status']} - {tool['detail']}")
    lines.extend(["", "## Agent Governance"])
    for step in program["steps"]:
        agent = find_agent(state, step.get("agent_id", "test-orchestration-agent"))
        lines.append(
            f"- {agent['stage']} / {agent['name']} ({agent['version']}): "
            f"owner={agent['owner_role']}; checkpoint={agent['human_checkpoint']}"
        )
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description="Start the AI R&D collaboration platform.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8787)
    args = parser.parse_args()

    load_state()
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    print(f"AI R&D Collaboration Platform running at http://{args.host}:{args.port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
