# AI 时代研发协同与质量工程平台

这是一个可运行的本地系统，用来支撑 AI Coding 大规模进入研发后的端到端质量门禁、Agent 编排、工具证据汇聚和发布决策。

系统不是单纯 QA 视角，而是覆盖产品、研发、测试、算法、数据、UAT、发布和管理层的研发协同控制面。

## 启动

```bash
python3 server.py --host 127.0.0.1 --port 8787
```

访问：

```text
http://127.0.0.1:8787
```

## 核心能力

- 项目群级协同：以大型复杂系统的项目群为单位组织需求、代码、测试、数据、依赖和发布。
- 全流程 Agent 托管：需求澄清、方案评审、AI 编码、PR 门禁、测试编排、UAT、发布决策、复盘沉淀。
- 风险分级门禁：按 L2/L3/L4 风险决定门禁强度，越高风险需要越完整的证据链。
- 工具证据中心：汇聚 Sonar、单测覆盖率、数据银行、接口自动化、性能平台、混沌工程、监控平台等证据。
- 跨团队依赖治理：展示产品、研发、数据、算法、测试、业务验收和发布团队之间的阻塞项。
- 可执行模拟数据：内置订单优惠、库存履约、搜索排序三类高风险场景。
- 发布决策报告：生成 Markdown 质量门禁报告并落盘到 `reports/ai-quality-report.md`。
- Agent Registry：维护 8 个 SDLC Agent 的职责、Owner、输入输出契约、工具权限、门禁规则和评估指标。

## 内置业务场景

- 订单交易优惠规则项目群：全场券与商品券叠加、库存锁定、支付前金额一致性。
- 库存可售承诺与数据回补项目群：库存流水、履约 ETA、数据回补、回滚演练。
- 搜索排序模型灰度项目群：模型版本、特征质量、搜索接口、业务指标灰度。

## 操作流程

1. 在左侧选择一个项目群。
2. 选择执行模式：全流程 Agent 托管、关键节点人工确认、仅审计与建议。
3. 点击“启动任务”创建一次 Agent 编排运行。
4. 点击“执行下一步”逐步观察每个阶段的输入、输出、门禁和证据。
5. 点击“自动跑完”直接推进到发布决策。
6. 对例外评审类任务，可点击“人工批准”记录审计。
7. 点击“生成报告”输出本次运行的质量门禁报告。

## API

- `GET /api/programs`：查询项目群。
- `GET /api/agents`：查询 8 个 Agent 维护信息。
- `GET /api/agents/{id}`：查询单个 Agent。
- `GET /api/programs/{id}`：查询单个项目群。
- `GET /api/runs`：查询运行记录。
- `GET /api/runs/{id}`：查询运行详情。
- `POST /api/runs/start`：启动 Agent 编排。
- `POST /api/runs/{id}/next`：推进下一阶段。
- `POST /api/runs/{id}/auto`：自动跑完整条流水线。
- `POST /api/runs/{id}/approve`：记录人工批准。
- `GET /api/reports/{run_id}`：生成运行报告。
- `POST /api/report`：保存报告到本地文件。

## 相关文档

- `docs/ai-dev-collaboration-platform-design.md`
- `docs/ai-dev-collaboration-platform-prd.md`
- `docs/ai-dev-collaboration-platform-technical-architecture.md`
- `docs/ai-dev-collaboration-platform-implementation-plan.md`
- `docs/ai-dev-collaboration-platform-prototype-guide.md`
- `docs/agent-governance-and-maintenance.md`
