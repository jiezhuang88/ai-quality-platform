# 专业测试用例生成 Skill 设计稿

## 1. Skill 定位

该 Skill 用于支撑测试编排 Agent 生成企业级、可评审、可入库、可自动化映射的专业测试用例。

它不是简单把 PRD 文本改写成用例，而是基于需求规则、系统影响面、PR Diff 风险、历史缺陷、质量指标和业务链路，按风险驱动方式生成覆盖完整、可执行、可追溯的候选用例。

适用场景：

- AI Coding 产生大量 PR，需要快速补齐风险测试覆盖。
- 大型项目涉及多系统、多仓库、多团队协同。
- 核心交易、支付、库存、营销等高风险链路需要强质量门禁。
- 测试团队需要把 AI 生成用例转成可 Review、可入库、可自动化的资产。

## 2. 行业标准参考原则

Skill 生成用例时遵循以下测试设计原则：

| 原则 | 用途 |
| --- | --- |
| 风险驱动测试 | 按业务影响、技术复杂度、变更范围、历史缺陷决定用例深度 |
| 等价类划分 | 避免重复生成同质用例，覆盖有效/无效输入集合 |
| 边界值分析 | 覆盖金额、数量、库存、时间、阈值、分页、限流等边界 |
| 决策表 | 处理优惠叠加、权限、状态机、规则组合类场景 |
| 状态迁移测试 | 覆盖订单、支付、库存、履约、退款等状态流转 |
| 场景法 | 覆盖端到端业务链路和用户真实路径 |
| 负向与异常测试 | 覆盖参数错误、依赖超时、重复提交、幂等、降级、回滚 |
| 契约测试 | 覆盖跨服务接口字段、枚举、兼容性和错误码 |
| 数据一致性测试 | 覆盖金额一致性、库存一致性、订单状态一致性、异步补偿 |
| 可观测性验证 | 覆盖日志、监控、告警、Trace、审计记录 |

## 3. Skill 输入

### 3.1 必须输入

| 输入 | 说明 |
| --- | --- |
| project | 项目 ID、名称、业务域、风险等级、阶段 |
| requirement_cards | 已确认或待确认的需求规则卡 |
| affected_systems | 影响系统、Owner、关键性、上下游依赖 |
| repositories | 多仓库信息、分支、代码 Owner |
| pr_risk_summary | PR Diff 风险、AI 生成比例、变更文件、Sonar 结果 |
| quality_metrics | 单测覆盖率、接口自动化覆盖率、接口响应时长、遗留缺陷、通过率 |

### 3.2 可选增强输入

| 输入 | 说明 |
| --- | --- |
| historical_defects | 历史缺陷、线上问题、逃逸缺陷 |
| existing_cases | 已有用例库，避免重复生成 |
| api_contracts | 接口契约、字段、错误码、兼容性约束 |
| data_assets | 数据银行可构造数据、测试账号、券、库存、订单样本 |
| automation_catalog | 自动化框架已有 suite、case_key、覆盖范围 |
| performance_baseline | 性能基线、容量模型、核心接口 SLA |
| chaos_scenarios | 混沌工程场景，如依赖超时、服务抖动、消息积压 |

## 4. Skill 输出

Skill 只输出候选用例，不直接入库。

每条用例必须包含：

| 字段 | 说明 |
| --- | --- |
| title | 用例标题，表达业务规则和验证目标 |
| objective | 测试目的 |
| case_type | api / e2e / uat / contract / performance / chaos / security / data |
| priority | P0 / P1 / P2 |
| risk_level | L1-L4 |
| source_requirement | 来源需求规则卡 |
| affected_systems | 覆盖系统 |
| precondition | 前置条件 |
| test_data | 测试数据要求 |
| steps | 可执行步骤 |
| expected_result | 明确可验证预期 |
| assertions | 断言点，包括接口、数据库、消息、日志、监控 |
| negative_or_boundary | 是否负向/边界场景 |
| automation_recommendation | 是否建议自动化，以及推荐 suite |
| traceability | 需求、PR、风险、历史缺陷追踪 |
| review_notes | 需要 QA Review 的关注点 |

## 5. 用例生成策略

### 5.1 需求规则解析

Skill 首先从需求规则卡中抽取：

- 业务目标
- 显式规则
- 隐式约束
- 验收标准
- 歧义点
- 风险提示
- 受影响系统
- 涉及数据对象

若规则存在歧义，必须生成“待确认问题”，不能编造业务概念。

### 5.2 风险分层

按以下维度计算用例强度：

| 维度 | 高风险信号 |
| --- | --- |
| 业务风险 | 支付、金额、库存、订单状态、权益、履约 SLA |
| 技术风险 | 多系统、多仓库、异步消息、缓存、批任务、数据回补 |
| 变更风险 | AI 生成比例高、变更文件多、核心模块变更、覆盖率下降 |
| 历史风险 | 历史缺陷多、线上事故、遗留缺陷未关闭 |
| 质量风险 | Sonar 未通过、接口自动化失败、性能指标恶化 |

风险等级决定用例数量和类型：

| 风险等级 | 必须生成 |
| --- | --- |
| L1 | 正常主流程、少量边界 |
| L2 | 主流程、异常、边界、接口回归 |
| L3 | 主流程、异常、边界、状态迁移、契约、数据一致性、自动化建议 |
| L4 | L3 全部内容 + 性能、混沌、回滚、灰度、监控、人工验收样例 |

### 5.3 用例类型矩阵

| 类型 | 生成规则 |
| --- | --- |
| 功能用例 | 覆盖每条业务规则和验收标准 |
| 接口用例 | 覆盖请求参数、响应字段、错误码、幂等、鉴权 |
| E2E 用例 | 覆盖用户完整链路和跨系统协同 |
| 契约用例 | 覆盖上下游接口兼容性、字段新增/删除/枚举变化 |
| 数据一致性用例 | 覆盖数据库、缓存、消息、搜索索引、对账结果 |
| 边界用例 | 覆盖金额、数量、时间、库存、券门槛、并发阈值 |
| 异常用例 | 覆盖超时、重试、重复提交、依赖不可用、降级 |
| 回滚用例 | 覆盖失败后状态恢复、数据补偿、灰度回退 |
| 性能用例 | 覆盖核心接口 P95、吞吐、并发、容量基线 |
| 混沌用例 | 覆盖依赖抖动、超时、消息积压、缓存失效 |
| UAT 样例 | 转换为业务可理解的验收场景 |

## 6. 用例质量门禁

生成的候选用例必须经过以下自检：

| 检查项 | 通过标准 |
| --- | --- |
| 可追溯 | 每条用例能追溯到需求规则、PR 风险或历史缺陷 |
| 可执行 | 步骤清晰，有前置条件和测试数据 |
| 可断言 | 预期结果可被接口、数据、日志或业务结果验证 |
| 不重复 | 与已有用例相似度过高时合并或标记重复 |
| 风险匹配 | L3/L4 必须覆盖异常、回滚、数据一致性和自动化建议 |
| 业务真实 | 不生成 PRD 未定义的业务概念 |
| 自动化友好 | API/E2E 用例应给出自动化绑定建议 |
| Review 友好 | 明确标注需要 QA 确认的点 |

不合格输出示例：

- 只有“验证功能正常”这种泛化预期。
- 没有测试数据。
- 没有明确断言。
- 只覆盖 happy path。
- 引入业务不存在的概念。
- 无法对应需求或风险来源。

## 7. 沃尔玛订单交易核心链路示例

业务前提：

- 当前只有全场券和商品券。
- 不引入平台券、店铺券等不存在概念。
- 核心链路涉及订单服务、优惠服务、库存服务、支付校验服务。

### 示例候选用例 1：全场券与商品券叠加金额计算

| 字段 | 内容 |
| --- | --- |
| title | 全场券与商品券叠加后应付金额计算正确 |
| case_type | api |
| priority | P0 |
| source_requirement | 商品券按 SKU 生效，全场券按订单金额门槛生效 |
| affected_systems | 优惠服务、订单服务、支付校验服务 |
| precondition | 商品 SKU-10086 支持商品券减 15；订单满足全场券满 199 减 20 |
| test_data | 商品金额 219，商品券 15，全场券 20 |
| steps | 创建订单；选择商品券；选择全场券；提交结算；查询结算结果 |
| expected_result | 应付金额 = 219 - 15 - 20 = 184 |
| assertions | 结算接口返回 payable_amount=184；优惠明细包含商品券和全场券；支付前金额校验通过 |
| automation_recommendation | 建议绑定接口自动化 order-core-risk-regression |

### 示例候选用例 2：支付前金额不一致必须阻断支付

| 字段 | 内容 |
| --- | --- |
| title | 支付前金额与结算金额不一致时阻断支付 |
| case_type | e2e |
| priority | P0 |
| source_requirement | 支付前金额必须与结算金额一致 |
| affected_systems | 订单服务、支付校验服务 |
| precondition | 订单已完成结算，应付金额 184 |
| test_data | 模拟支付请求金额 185 |
| steps | 创建订单；完成优惠结算；发起支付前校验；传入不一致金额 |
| expected_result | 支付被阻断，返回金额不一致错误 |
| assertions | 支付校验接口返回明确错误码；订单状态不进入支付中；审计日志记录金额不一致 |
| automation_recommendation | 建议绑定 E2E 自动化和支付校验接口自动化 |

### 示例候选用例 3：优惠服务超时时订单不得进入支付

| 字段 | 内容 |
| --- | --- |
| title | 优惠服务超时时订单不得进入支付 |
| case_type | chaos |
| priority | P0 |
| source_requirement | 优惠计算失败时不得进入支付 |
| affected_systems | 订单服务、优惠服务、支付校验服务 |
| precondition | 优惠服务注入超时或不可用故障 |
| test_data | 满足全场券和商品券条件的订单 |
| steps | 注入优惠服务超时；提交结算；尝试发起支付 |
| expected_result | 结算失败或进入可重试状态，不允许支付 |
| assertions | 订单状态未进入待支付；错误码明确；告警触发；Trace 可定位优惠服务超时 |
| automation_recommendation | L3/L4 建议纳入混沌回归套件 |

## 8. Prompt 模板

```text
你是企业级测试架构师和测试用例设计专家。

目标：
基于需求规则卡、PR 风险、系统影响面、质量指标和历史缺陷，生成专业、可执行、可评审、可入库、可自动化绑定的候选测试用例。

硬性约束：
1. 只能使用输入中存在的业务概念，不能编造新概念。
2. 每条用例必须可追溯到需求规则、PR 风险或历史缺陷。
3. 每条用例必须包含测试数据、执行步骤、明确断言。
4. L3/L4 风险必须覆盖异常、边界、数据一致性、回滚、自动化建议。
5. 输出候选用例，不直接入库。

输入：
- 项目信息：{{project}}
- 需求规则卡：{{requirement_cards}}
- 影响系统：{{affected_systems}}
- 仓库与 PR 风险：{{pr_risk_summary}}
- 质量指标：{{quality_metrics}}
- 历史缺陷：{{historical_defects}}
- 已有用例：{{existing_cases}}

输出 JSON：
{
  "coverage_summary": {
    "rules_covered": [],
    "risks_covered": [],
    "gaps": [],
    "questions": []
  },
  "candidate_cases": [
    {
      "title": "",
      "objective": "",
      "case_type": "",
      "priority": "",
      "risk_level": "",
      "source_requirement": "",
      "affected_systems": [],
      "precondition": "",
      "test_data": [],
      "steps": [],
      "expected_result": "",
      "assertions": [],
      "negative_or_boundary": false,
      "automation_recommendation": {
        "recommended": true,
        "framework": "",
        "suite": "",
        "reason": ""
      },
      "traceability": {
        "requirement_ids": [],
        "pr_ids": [],
        "risk_ids": [],
        "defect_ids": []
      },
      "review_notes": []
    }
  ],
  "quality_self_check": {
    "has_traceability": true,
    "has_test_data": true,
    "has_assertions": true,
    "duplicate_risk": "",
    "manual_review_required": []
  }
}
```

## 9. 后续接入平台建议

后续如果你确认该 Skill 方向可行，可以按以下方式接入当前系统：

1. 在 Agent 运维中把该 Skill 挂到测试编排 Agent。
2. 后端 `generate_cases` 不再使用固定模板，而是按 Skill 的 case matrix 生成结构化用例。
3. 前端候选用例表增加：
   - 来源规则
   - 断言点
   - 测试数据
   - 自动化建议
   - 覆盖缺口
4. Review 流程增加质量评分：
   - 可执行性
   - 覆盖度
   - 可自动化性
   - 重复度
5. 入库前必须通过用例质量门禁。
