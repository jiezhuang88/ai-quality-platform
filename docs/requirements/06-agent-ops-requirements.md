# 06 Agent 运营与治理需求文档

版本：v0.1  
日期：2026-06-15  
对应规划：8 个阶段 Agent、Skills、Context Builder、Tool Permission、Eval、Audit

## 1. 背景和目标

平台不能只展示 8 个 Agent 名称，而要把 Agent 作为可维护、可评测、可审计的工程组件。Agent 运营模块的目标是让每个 Agent 有清晰职责、输入输出、工具权限、上下文边界、评测集和审计记录。

## 2. Agent 范围

| Agent | 阶段 | 职责 |
| --- | --- | --- |
| 需求澄清 Agent | 需求 | PRD 解析、规则卡、歧义识别 |
| 方案评审 Agent | 方案 | 影响面、接口契约、数据影响、回滚检查 |
| AI 编码协同 Agent | 编码 | 变更边界、自检说明、单测建议、越权检查 |
| PR Diff Agent | PR | 多仓库 PR 风险、Sonar/覆盖率、必跑测试 |
| 测试编排 Agent | 测试 | 用例生成、数据计划、自动化/性能/混沌建议 |
| UAT Agent | UAT | 验收包、样例数据、遗留风险 |
| 发布决策 Agent | 发布 | 证据汇总、发布门禁、灰度/回滚检查 |
| 复盘沉淀 Agent | 复盘 | 缺陷归因、规则反哺、用例反哺、Eval 样例 |

## 3. Agent Registry

Agent 配置字段：

- Agent ID。
- Agent 名称。
- 阶段。
- Owner。
- 版本。
- 状态。
- Skill Prompt。
- 输入 Schema。
- 输出 Schema。
- 可用工具。
- 权限等级。
- 评测集。
- 发布时间。
- 最近评测结果。

## 4. Context Builder

Context Builder 必须按最小必要原则构造上下文：

- 只允许读取当前项目授权数据。
- 按角色控制可见字段。
- 按风险等级增加必要证据。
- 不向 Agent 提供无关项目、无关用户、敏感生产数据。
- 所有上下文必须记录 context snapshot ID。

## 5. Tool Permission

工具权限分为：

| 权限 | 说明 | 例子 |
| --- | --- | --- |
| read | 读取证据和配置 | 读取 PRD、Sonar、测试结果 |
| suggest | 生成建议，不执行动作 | 生成测试计划、风险摘要 |
| write_candidate | 写入候选资产 | 生成候选用例、候选规则 |
| execute | 触发外部工具 | 触发自动化、数据银行任务 |
| approve | 形成正式结论 | 发布准入通过、风险降级 |

一期 Agent 不允许直接 approve，approve 必须由人工完成。

## 6. Agent Eval

评测类型：

- 冒烟评测。
- 输出 Schema 合规评测。
- 缺证据阻断评测。
- 误放行评测。
- 误阻断评测。
- 真实缺陷回放评测。

Agent 变更必须先通过 Eval，再允许发布。

## 7. Agent Audit

每次 Agent 运行必须记录：

- Agent ID 和版本。
- 输入对象。
- context snapshot ID。
- 输出内容。
- evidence_refs。
- human_checkpoints。
- 工具调用。
- 人工采纳、修改、驳回记录。

## 8. 一期范围

一期必须支持：

- 维护 8 个 Agent 的配置。
- 维护 Skill、输入输出 Schema、工具权限。
- Agent 试运行。
- 输出审计记录。

一期暂不强制实现：

- 自动评测流水线。
- 自动灰度发布 Agent。
- Agent 多模型路由。

## 9. 验收标准

- 每个 Agent 必须有 Owner、版本和状态。
- Agent 输出必须符合 Schema。
- Agent 输出必须带证据引用或说明证据缺失。
- Agent 工具调用必须可审计。
- Agent 生成正式资产前必须经过人工确认。
