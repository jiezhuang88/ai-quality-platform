# AI Coding 质量保障平台

这是按产品级设计文档与技术方案落地的本地可运行版本。它采用零外部依赖实现，方便快速验证完整业务闭环；后续可按技术方案迁移为 React + Spring Boot + PostgreSQL 架构。

## 启动

```bash
cd quality-platform/backend
python3 server.py --host 127.0.0.1 --port 8790
```

访问：

```text
http://127.0.0.1:8790
```

## 已实现能力

- 多页面产品级应用框架。
- 首页驾驶舱。
- 项目中心与新建项目。
- PRD 文本/Markdown 导入与需求规则卡解析。
- PR 登记与 Sonar 结果汇聚。
- 测试用例候选生成。
- 自动化执行结果模拟与证据归集。
- 发布准入评估。
- Agent 管理。
- 集成中心与健康检查。
- 策略中心。
- 审计日志。
- 本地 JSON 持久化。

## API

- `GET /api/dashboard`
- `GET /api/projects`
- `POST /api/projects`
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
