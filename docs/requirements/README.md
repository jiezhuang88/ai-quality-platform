# AI 质量保障平台需求文档索引

版本：v0.1  
日期：2026-06-15  
来源：`docs/2026-ai-quality-transformation-annual-plan.md`

## 1. 文档拆分原则

本目录按年度规划中的主链路和专项拆分需求文档，目标是支撑后续 PRD 评审、技术方案细化、迭代排期和验收。

拆分原则：

- 围绕研发全生命周期，而不是单一 QA 视角。
- 围绕大型企业项目形态，支持一个项目关联多个系统、多个仓库、多个 PR、多个团队。
- 围绕 AI Coding 规模化后的质量风险，重点治理需求不清、AI 代码不可解释、PR 风险不可见、测试资产不可沉淀、发布证据不完整。
- 每个模块必须能落到数据对象、流程、规则和验收标准。

## 2. 需求文档列表

| 序号 | 文档 | 对应年度规划 |
| --- | --- | --- |
| 01 | `01-project-space-requirements.md` | 项目空间、项目接入、年度项目组合管理 |
| 02 | `02-requirement-intake-requirements.md` | PRD 导入、需求规则卡、需求澄清 Agent |
| 03 | `03-risk-gate-requirements.md` | L1-L4 风险分级、阶段门禁、质量计划 |
| 04 | `04-pr-quality-gate-requirements.md` | AI Coding PR 门禁、多仓库 PR、Sonar/覆盖率/CI 证据 |
| 05 | `05-test-asset-requirements.md` | 专业测试用例生成、Review、入库、自动化绑定 |
| 06 | `06-agent-ops-requirements.md` | 8 个阶段 Agent、Skills、Context Builder、Eval、Audit |
| 07 | `07-evidence-center-requirements.md` | 证据中心、工具集成、发布准入报告 |
| 08 | `08-quality-operations-dashboard-requirements.md` | 公司级质量经营看板、业务域看板、Agent 运营看板 |

## 3. 一期优先级

一期目标是 7-8 月打通质量主链路 MVP：

1. 项目空间。
2. PRD 导入和需求规则卡。
3. L1-L4 风险分级。
4. PR 门禁和 Sonar 证据。
5. 测试用例候选、Review、入库、自动化绑定。
6. 发布准入证据汇总。

Agent Registry、Context Builder、工具自动触发、质量经营看板在二期逐步增强，但一期数据模型必须提前预留。

## 4. 共同验收原则

- 所有关键对象必须有 Owner、状态、更新时间和审计记录。
- 所有 Agent 输出必须可追溯输入来源和证据引用。
- 所有门禁结论必须可解释，不能只有 pass/fail。
- 所有 AI 生成内容必须经过人工确认后才能成为正式资产或发布依据。
- L3/L4 项目必须形成从 PRD 到发布准入的完整证据链。
