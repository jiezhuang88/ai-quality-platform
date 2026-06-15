# OpenSDLC AI Quality Platform

这是一款面向 AI Coding 时代的软件研发质量门禁开源参考实现。它用零外部依赖的本地版本跑通完整 SDLC 质量保障流程：项目接入、PRD 质量门禁、PR 质量门禁、测试资产生成与 Review、自动化执行、发布准入、Agent Skills 运维和证据审计。

当前版本适合：

- 快速演示 AI Coding 质量保障平台应如何工作。
- 给测试、研发、产品、架构团队对齐端到端流程。
- 作为企业内网二次开发的参考实现。
- 为真实 Git、SonarQube、CI、自动化、性能、混沌、缺陷和监控系统接入预留 Adapter。

## 启动

```bash
cd quality-platform/backend
python3 server.py --host 127.0.0.1 --port 8790
```

访问：

```text
http://127.0.0.1:8790
```

## 一键跑全流程

启动后进入：

```text
开源运行台
```

选择当前项目后，可以：

1. 点击“一键跑完整流程”，自动完成端到端演练。
2. 或逐步执行 Runbook：
   - 确认大型项目空间。
   - 导入 PRD 并生成规则卡。
   - 确认 PRD 质量门禁。
   - 登记多仓库 PR。
   - 拉取 Sonar 并执行 PR 门禁。
   - 生成候选测试用例。
   - Review 并入库 P0/P1 用例。
   - 触发自动化执行。
   - 运行 8 个阶段 Agent。
   - 评估发布准入。

每一步都会写入门禁结果、证据或审计日志。

## 已实现能力

- 多页面产品级应用框架。
- 首页驾驶舱。
- 项目中心与新建项目。
- 开源运行台与可执行 Runbook。
- PRD 文件/文本/飞书/Confluence/Jira/URL 级联导入与需求规则卡解析。
- PRD 质量门禁。
- PR 登记与 Sonar 结果汇聚。
- PR 质量门禁。
- 测试用例候选生成、Review、退回、批准入库、自动化绑定。
- 自动化执行结果模拟与证据归集。
- 发布准入评估。
- 8 个阶段 Agent 管理与 Skills 挂载视图。
- 集成中心与健康检查。
- 策略中心。
- 审计日志。
- 本地 JSON 持久化。

## Agent Skills

系统内置 8 个阶段 Agent，并为每个 Agent 维护可审计的 Skill：

- 需求澄清：PRD 规则卡抽取、PRD 质量门禁。
- 方案评审：跨系统影响面分析。
- AI 编码：AI 编码约束。
- PR 门禁：PR Diff 风险门禁。
- 测试验证：专业测试用例生成、测试执行编排。
- UAT 验收：业务验收清单。
- 发布决策：发布证据准入。
- 复盘沉淀：复盘策略学习。

可在“开源运行台”和“Agent 运维”中查看 Skills 的输入、输出、工具、质量规则和评测样例。

## 外部系统扩展

当前版本使用 Mock Adapter。真实落地时可按以下接口替换：

- `health_check()`：检查外部系统可用性。
- `sync()`：主动拉取外部对象。
- `handle_webhook()`：接收 PR、CI、自动化、部署事件。
- `trigger()`：触发自动化、数据银行、性能、混沌任务。
- `normalize()`：归一化为平台标准对象或 Evidence。

## API

- `GET /api/dashboard`
- `GET /api/open-source-blueprint`
- `GET /api/agent-skills`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/{projectId}/runbook`
- `POST /api/projects/{projectId}/runbook/run-step`
- `POST /api/projects/{projectId}/runbook/run-all`
- `POST /api/projects/{projectId}/requirements/import`
- `POST /api/projects/{projectId}/prs/register`
- `POST /api/prs/{prId}/collect-sonar`
- `POST /api/projects/{projectId}/test-cases/generate`
- `POST /api/projects/{projectId}/executions/run`
- `POST /api/projects/{projectId}/release-gate/evaluate`
- `GET /api/agents`
- `GET /api/integrations`
- `POST /api/integrations/{integrationId}/health-check`
- `GET /api/policies`
- `GET /api/audit-logs`

## 数据

本地状态文件：

```text
quality-platform/data/state.json
```

删除该文件后重启服务，会重新生成种子数据。
