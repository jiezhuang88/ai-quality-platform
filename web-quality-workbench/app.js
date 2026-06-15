const $ = (id) => document.getElementById(id);

const fieldIds = [
  "title", "businessGoal", "aiUsage", "forbiddenScope", "acceptance", "rollback", "residualRisk",
  "userImpact", "dataImpact", "complexity", "reversibility", "confidence", "compliance", "agency", "supplyChain",
  "unitTests", "integrationTests", "e2eTests", "securityTests", "performanceTests", "manualChecks",
  "aiReviewNotes", "humanReviewNotes",
  "leadTime", "deployFrequency", "changeFailRate", "recoveryTime", "reworkRate", "escapedDefects", "aiFailureRate", "regressionPassRate"
];

const testControls = [
  ["unitPass", "单元测试通过", "基础行为与边界条件已覆盖"],
  ["integrationPass", "集成/契约测试通过", "接口、数据库、消息和第三方适配器已验证"],
  ["e2ePass", "关键旅程 E2E 通过", "核心用户路径没有被 AI 变更破坏"],
  ["mutationPass", "变异/属性测试完成", "测试不是只覆盖样例，而能发现逻辑变异"],
  ["accessibilityPass", "可访问性检查通过", "前端变更满足基本可访问性要求"],
  ["observabilityPass", "可观测性验证完成", "日志、指标、追踪和告警能支撑发现问题"]
];

const securityControls = [
  ["staticPass", "SAST/静态扫描通过", "识别注入、越权、危险 API 和不安全模式"],
  ["secretPass", "密钥扫描通过", "没有令牌、密码、私钥等敏感信息进入仓库"],
  ["dependencyPass", "依赖/SCA 扫描通过", "新增依赖没有已知高危漏洞或许可证风险"],
  ["sbomReady", "SBOM 已生成", "发布包能追溯组件清单和版本"],
  ["provenanceReady", "构建来源/签名就绪", "产物来源、构建过程和签名可审计"],
  ["llmThreatReviewed", "LLM/AI 风险已评审", "覆盖提示注入、过度代理、数据泄露和不安全输出处理"]
];

const reviewControls = [
  ["aiReviewDone", "AI 辅助评审完成", "AI 已从测试、安全、架构和边界场景角度审查"],
  ["promptLogged", "Prompt 和假设已记录", "关键提示词、约束和模型假设可追溯"],
  ["humanReviewDone", "人工评审完成", "人工确认 AI 产物符合业务和架构约束"],
  ["rollbackReady", "回滚/缓解方案就绪", "高风险变更具备可执行恢复路径"],
  ["releaseMonitorReady", "发布监控就绪", "发布后有明确指标、告警和观察窗口"],
  ["escapedLearningReady", "逃逸缺陷学习机制就绪", "缺陷会转化为测试、Prompt 和门禁改进"]
];

const allCheckIds = [...testControls, ...securityControls, ...reviewControls].map(([id]) => id);

let activeScenarioId = "order-coupon";
let activeStageId = "requirement";

const scenarioStages = [
  ["requirement", "需求澄清"],
  ["design", "方案评审"],
  ["coding", "AI 编码"],
  ["pr", "PR 门禁"],
  ["verification", "测试验证"],
  ["uat", "UAT 验收"],
  ["release", "发布灰度"],
  ["review", "复盘沉淀"]
];

const simulationScenarios = [
  {
    id: "order-coupon",
    name: "订单交易优惠规则变更",
    domain: "订单 / 优惠 / 库存 / 支付",
    risk: "L3 高风险",
    decision: "Blocked",
    decisionClass: "critical",
    summary: "调整全场券与商品券叠加规则，影响结算金额、库存锁定、支付前金额一致性。",
    teams: ["产品", "订单研发", "优惠研发", "库存研发", "支付研发", "QA", "UAT", "发布"],
    hotspots: ["金额计算", "库存并发", "支付前校验", "优惠服务降级"],
    dependencies: [
      ["优惠服务接口契约", "Accepted", "优惠研发"],
      ["库存锁定幂等校验", "In Progress", "库存研发"],
      ["支付前金额一致性", "Blocked", "支付研发"],
      ["UAT 金额规则确认", "Open", "业务验收"]
    ],
    gates: [
      ["Sonar 无阻断", "passed"],
      ["核心接口自动化", "passed"],
      ["商品券 + 全场券组合 E2E", "failed"],
      ["库存并发测试", "running"],
      ["支付前金额一致性", "missing"],
      ["灰度与回滚预案", "passed"]
    ],
    agents: [
      ["需求澄清 Agent", "识别全场券、商品券叠加顺序和门槛边界，建议补充支付前重算一致性验收点。"],
      ["PR Diff Agent", "改动触达 order-price、coupon-calc、payment-check 三个核心模块，风险不得低于 L3。"],
      ["测试策略 Agent", "推荐 10 类场景：仅商品券、仅全场券、叠加、门槛不足、库存不足、支付失败、并发下单等。"],
      ["发布风险 Agent", "建议灰度 5% 起步，绑定结算金额不一致、库存释放失败、支付失败率告警。"]
    ],
    tools: [
      ["数据银行", "已生成 32 组优惠/库存/支付异常数据"],
      ["自动化框架", "126/132 通过，失败集中在叠加优惠 E2E"],
      ["性能平台", "结算接口 P95 180ms，较基线 +12ms"],
      ["混沌工程", "优惠服务超时降级通过，库存服务重试仍在执行"],
      ["监控平台", "已绑定金额差异率、库存释放失败率、支付失败率"]
    ],
    testData: [
      ["全场券", "满 199 减 20，支持与商品券叠加"],
      ["商品券", "SKU-10086 减 15，仅限指定商品"],
      ["库存", "SKU-10086 可售 2 件，并发 20 用户下单"],
      ["支付异常", "支付超时、支付失败、支付前金额被重算"]
    ],
    stages: {
      requirement: ["重点：业务规则必须结构化", "平台抽取全场券、商品券、叠加顺序、门槛、优惠上限和支付前金额一致性。"],
      design: ["重点：依赖和回滚要提前确认", "订单、优惠、库存、支付四个服务需要接口契约和降级策略，缺少支付前校验方案会阻断。"],
      coding: ["重点：AI 代码默认不可信", "AI 生成优惠计算分支和部分单测，研发必须声明 Prompt 假设和禁止触碰范围。"],
      pr: ["重点：PR 是第一道强门禁", "PR Diff Agent 识别核心交易链路，自动加严 E2E、数据银行、性能和 UAT 证据。"],
      verification: ["重点：自动化不是只跑用例", "平台按风险编排数据、接口自动化、E2E、性能、混沌和探索测试。"],
      uat: ["重点：业务验收确认真实规则", "UAT 只确认全场券和商品券规则，不引入平台券、店铺券等不存在概念。"],
      release: ["重点：发布看证据完整度", "缺支付前金额一致性证据时不能全量发布，只能补证据或走例外审批。"],
      review: ["重点：线上问题反哺规则", "若发生金额差异，必须新增回归用例、更新 Agent 提示和门禁规则。"]
    }
  },
  {
    id: "inventory-promise",
    name: "履约库存可售承诺改造",
    domain: "库存 / 履约 / 数据",
    risk: "L4 严重风险",
    decision: "Exception Review",
    decisionClass: "critical",
    summary: "调整库存可售承诺逻辑，涉及库存流水、履约时效、离线数据回补和前台展示。",
    teams: ["库存研发", "履约研发", "数据团队", "QA", "运营", "发布"],
    hotspots: ["库存超卖", "数据回补", "履约时效", "批量状态修正"],
    dependencies: [
      ["库存流水口径", "Accepted", "数据团队"],
      ["履约 ETA 接口", "Blocked", "履约研发"],
      ["离线回补任务", "In Progress", "数据团队"],
      ["运营灰度名单", "Open", "运营"]
    ],
    gates: [
      ["接口契约", "passed"],
      ["数据回补校验", "failed"],
      ["库存并发压测", "passed"],
      ["混沌故障注入", "running"],
      ["回滚演练", "missing"],
      ["发布负责人审批", "missing"]
    ],
    agents: [
      ["依赖治理 Agent", "识别履约 ETA 接口阻塞发布路径，建议先完成契约冻结。"],
      ["数据变更 Agent", "发现库存流水回补会影响两个报表口径和一个运营看板。"],
      ["测试策略 Agent", "建议增加库存不足、部分履约、离线任务重复执行、回补失败场景。"]
    ],
    tools: [
      ["数据银行", "已生成库存流水、履约状态、回补任务数据"],
      ["性能平台", "库存锁定接口 P99 380ms，低于阈值 500ms"],
      ["混沌工程", "履约服务超时注入进行中"],
      ["数据质量平台", "回补后库存余额校验失败 3 条"]
    ],
    testData: [
      ["库存流水", "锁定、释放、扣减、回补四类事件"],
      ["履约时效", "当日达、次日达、不可配送区域"],
      ["批量回补", "10 万条库存状态修正模拟"],
      ["异常", "重复消息、乱序消息、履约接口超时"]
    ],
    stages: {
      requirement: ["重点：定义可售承诺边界", "明确库存可售、履约 ETA、前台展示和运营口径。"],
      design: ["重点：数据一致性和回补策略", "数据团队必须确认库存流水血缘、回补任务幂等和报表影响。"],
      coding: ["重点：状态机和幂等", "AI 代码涉及库存状态机，必须人工确认幂等和异常补偿。"],
      pr: ["重点：跨团队依赖阻塞", "履约 ETA 契约未冻结，PR 可评审但不能进入发布准入。"],
      verification: ["重点：并发、乱序、回补", "必须验证超卖、重复消息、回补失败和服务超时。"],
      uat: ["重点：运营口径确认", "运营确认可售展示和履约承诺是否符合业务预期。"],
      release: ["重点：L4 需要演练", "缺回滚演练和发布审批，不能发布。"],
      review: ["重点：数据问题复盘", "回补失败要沉淀数据质量规则和回放用例。"]
    }
  },
  {
    id: "search-model",
    name: "搜索排序模型灰度上线",
    domain: "算法 / 搜索 / 数据 / 前端",
    risk: "L3 高风险",
    decision: "Ready for Canary",
    decisionClass: "medium",
    summary: "新搜索排序模型准备灰度，涉及特征数据、模型版本、搜索服务和业务指标观测。",
    teams: ["算法", "搜索研发", "数据团队", "前端", "QA", "业务运营"],
    hotspots: ["模型效果", "特征稳定性", "在线离线一致性", "灰度观测"],
    dependencies: [
      ["特征数据延迟", "Resolved", "数据团队"],
      ["模型版本注册", "Resolved", "算法"],
      ["搜索服务降级", "Accepted", "搜索研发"],
      ["业务观测指标", "Resolved", "运营"]
    ],
    gates: [
      ["离线指标达标", "passed"],
      ["在线影子流量", "passed"],
      ["特征稳定性", "passed"],
      ["搜索接口自动化", "passed"],
      ["灰度监控", "passed"],
      ["回滚开关", "passed"]
    ],
    agents: [
      ["算法变更 Agent", "离线 NDCG +2.1%，但提示需观察低频类目曝光。"],
      ["数据变更 Agent", "特征延迟 P95 为 4 分钟，低于阈值 5 分钟。"],
      ["发布风险 Agent", "建议 1% 搜索流量灰度，观察转化率、无结果率、延迟。"]
    ],
    tools: [
      ["模型平台", "模型 v2026.06.11 已注册并可回滚"],
      ["自动化框架", "搜索接口回归 88/88 通过"],
      ["监控平台", "已绑定 CTR、CVR、无结果率、P95 延迟"],
      ["数据质量平台", "特征完整率 99.96%"]
    ],
    testData: [
      ["搜索词", "高频词、长尾词、无结果词、品牌词"],
      ["特征", "价格、销量、库存、用户偏好、类目"],
      ["灰度", "1% 用户，排除高价值运营活动流量"],
      ["回滚", "模型开关可 3 分钟内回切"]
    ],
    stages: {
      requirement: ["重点：定义效果指标", "业务确认 CTR、CVR、无结果率、延迟和低频类目曝光指标。"],
      design: ["重点：模型和服务降级", "搜索服务必须支持模型版本切换和兜底排序。"],
      coding: ["重点：特征和推理路径", "AI 辅助生成特征校验脚本，算法和数据团队共同确认。"],
      pr: ["重点：模型不是只有代码", "PR 门禁同时检查模型版本、特征血缘和搜索接口影响。"],
      verification: ["重点：离线 + 影子流量", "离线评估、影子流量、接口自动化和前端展示一起验证。"],
      uat: ["重点：业务可解释", "运营确认搜索结果样例和重点类目表现。"],
      release: ["重点：小流量灰度", "证据齐全，允许 1% 灰度并绑定回滚开关。"],
      review: ["重点：效果持续观测", "灰度期持续对比实验组和对照组。"]
    }
  }
];

let agentRun = {
  scenarioId: "agent-order-coupon",
  currentStep: -1,
  log: []
};

const agentScenarios = [
  {
    id: "agent-order-coupon",
    title: "订单交易优惠规则项目群",
    domain: "订单 / 优惠 / 库存 / 支付",
    riskLevel: "L3 高风险",
    decision: "阻断发布",
    summary: "Agent 群接管全场券与商品券叠加规则变更，从需求澄清、方案评审、代码生成、PR 门禁到测试验证和发布决策全流程编排。",
    tags: ["全场券", "商品券", "库存锁定", "支付前金额一致性", "跨 8 个团队"],
    risks: [
      ["金额计算", 92],
      ["库存并发", 78],
      ["支付一致性", 95],
      ["发布回滚", 64],
      ["AI 不确定性", 72]
    ],
    dependencies: [
      ["产品", "优惠叠加规则确认", "done"],
      ["订单研发", "结算金额模型改造", "done"],
      ["优惠研发", "商品券/全场券接口契约", "done"],
      ["库存研发", "并发锁库存压测", "running"],
      ["支付研发", "支付前金额一致性校验", "blocked"],
      ["QA", "E2E 和探索测试补齐", "running"],
      ["UAT", "业务金额规则签收", "waiting"],
      ["发布", "灰度与回滚预案", "done"]
    ],
    steps: [
      {
        agent: "需求澄清 Agent",
        stage: "需求澄清",
        status: "done",
        goal: "把业务需求转成结构化规则和验收标准。",
        input: "需求：调整全场券和商品券叠加规则，优化结算页金额展示。",
        output: "抽取 18 条业务规则、12 个验收点、4 个歧义点；确认不涉及平台券/店铺券。",
        artifacts: ["需求规则卡：全场券/商品券叠加顺序", "UAT 验收清单 v1", "业务歧义问题列表"],
        tools: ["知识库检索", "历史缺陷检索", "业务规则比对"],
        gate: "通过：业务规则已结构化"
      },
      {
        agent: "方案评审 Agent",
        stage: "方案评审",
        status: "done",
        goal: "识别服务依赖、数据一致性和回滚策略。",
        input: "技术方案、接口契约、服务依赖、回滚草案。",
        output: "识别订单、优惠、库存、支付 4 个核心服务依赖；建议增加支付前金额重算校验。",
        artifacts: ["服务依赖图", "接口契约差异", "回滚风险清单"],
        tools: ["服务目录", "接口契约平台", "调用链分析"],
        gate: "通过：依赖已确认，支付校验为强制门禁"
      },
      {
        agent: "Coding Agent",
        stage: "AI 编码",
        status: "done",
        goal: "基于约束生成代码、单测和自检说明。",
        input: "Prompt 约束：不得修改支付扣款逻辑，不得引入新券类型。",
        output: "生成优惠叠加计算分支、单测 26 条、异常处理说明；人工需复核金额边界。",
        artifacts: ["PR 草稿", "单测草案", "AI 假设与禁止范围记录"],
        tools: ["代码生成", "单测生成", "静态规则检查"],
        gate: "通过：禁止范围未被触碰"
      },
      {
        agent: "PR Diff Agent",
        stage: "PR 门禁",
        status: "done",
        goal: "根据 Diff 识别影响范围并匹配门禁。",
        input: "PR #ORD-4821，改动 21 个文件，涉及 order-price、coupon-calc、payment-check。",
        output: "风险等级 L3；强制要求 E2E、数据银行、性能、混沌、UAT 和支付一致性证据。",
        artifacts: ["PR 风险摘要", "Review 检查清单", "门禁策略 ORD-L3"],
        tools: ["Git Diff", "Sonar", "覆盖率平台", "历史缺陷检索"],
        gate: "通过：进入高风险验证流程"
      },
      {
        agent: "测试编排 Agent",
        stage: "测试验证",
        status: "running",
        goal: "自动准备数据并编排工具任务。",
        input: "风险等级 L3、业务规则、历史缺陷、核心链路画像。",
        output: "生成 36 组测试数据、推荐 132 条接口/E2E 回归，触发性能和混沌任务。",
        artifacts: ["测试策略 v2", "数据银行任务 DB-9088", "自动化任务 AUTO-7712"],
        tools: ["数据银行", "自动化框架", "性能平台", "混沌工程"],
        gate: "执行中：库存并发任务未完成"
      },
      {
        agent: "UAT Agent",
        stage: "UAT 验收",
        status: "waiting",
        goal: "把技术证据转成业务可验收语言。",
        input: "测试报告、优惠金额样例、失败用例、业务规则卡。",
        output: "生成 UAT 样例 9 组，等待业务确认支付前金额不一致场景。",
        artifacts: ["UAT 金额样例表", "业务签收单", "剩余风险说明"],
        tools: ["证据中心", "规则样例生成", "UAT 模板"],
        gate: "等待：业务未签收"
      },
      {
        agent: "发布决策 Agent",
        stage: "发布决策",
        status: "blocked",
        goal: "根据证据完整度给出发布/阻断建议。",
        input: "门禁结果、灰度计划、监控项、回滚预案。",
        output: "阻断全量发布：缺支付前金额一致性证据，库存并发任务未完成。允许补证据后重新评估。",
        artifacts: ["发布准入报告", "阻断原因说明", "灰度观察指标"],
        tools: ["发布系统", "监控平台", "证据中心"],
        gate: "阻断：2 个关键证据未完成"
      },
      {
        agent: "复盘沉淀 Agent",
        stage: "复盘沉淀",
        status: "pending",
        goal: "发布后或阻断后沉淀知识和规则。",
        input: "阻断原因、失败用例、人工反馈。",
        output: "建议新增支付前金额一致性为订单优惠 L3 必选门禁。",
        artifacts: ["门禁规则变更建议", "新增回归用例", "Prompt 模板更新"],
        tools: ["知识库", "用例库", "门禁规则中心"],
        gate: "待执行：发布决策完成后触发"
      }
    ],
    tools: [
      ["Sonar", "通过", "0 blocker / 2 minor"],
      ["单测覆盖率", "通过", "82.4%，较基线 +1.8%"],
      ["数据银行", "通过", "36 组券/库存/支付数据已生成"],
      ["接口自动化", "失败", "126/132 通过，6 条优惠叠加 E2E 失败"],
      ["性能平台", "通过", "结算 P95 180ms，阈值 220ms"],
      ["混沌工程", "执行中", "库存服务超时重试验证中"],
      ["监控平台", "就绪", "金额差异率、库存释放失败率、支付失败率"]
    ],
    mockData: [
      ["优惠组合 A", "商品券 SKU-10086 减 15 + 全场券满 199 减 20，期望优惠 35"],
      ["优惠组合 B", "商品券不适用 SKU，只有全场券生效，期望优惠 20"],
      ["库存并发", "SKU-10086 库存 2，并发 20 用户下单，期望不超卖"],
      ["支付失败", "支付超时后释放库存，订单金额状态回滚"],
      ["金额篡改", "支付前金额与结算金额不一致，期望阻断支付"]
    ]
  },
  {
    id: "agent-inventory-data",
    title: "库存可售承诺与数据回补项目群",
    domain: "库存 / 履约 / 数据",
    riskLevel: "L4 严重风险",
    decision: "需例外审批",
    summary: "Agent 群编排库存可售承诺、履约 ETA、离线回补和运营展示，重点治理数据一致性与发布回滚。",
    tags: ["库存流水", "履约 ETA", "数据回补", "运营展示", "L4 审批"],
    risks: [["库存超卖", 96], ["数据回补", 91], ["履约时效", 82], ["回滚难度", 88], ["跨团队依赖", 86]],
    dependencies: [
      ["库存研发", "锁库存幂等改造", "done"],
      ["履约研发", "ETA 接口契约冻结", "blocked"],
      ["数据团队", "库存流水回补脚本", "running"],
      ["运营", "灰度城市名单", "waiting"],
      ["发布", "回滚演练", "blocked"]
    ],
    steps: [
      ["需求澄清 Agent", "需求澄清", "done", "抽取库存可售、履约 ETA、运营展示规则。"],
      ["依赖治理 Agent", "依赖分析", "done", "识别 ETA 接口和回补脚本为关键阻塞路径。"],
      ["数据变更 Agent", "数据评审", "running", "发现库存流水回补影响 3 个报表和 2 个运营看板。"],
      ["测试编排 Agent", "验证编排", "running", "触发库存并发、乱序消息、回补失败和混沌测试。"],
      ["发布决策 Agent", "发布决策", "blocked", "缺 ETA 契约冻结和回滚演练，建议禁止发布。"]
    ].map(([agent, stage, status, output]) => ({
      agent, stage, status, goal: "保障库存与履约复杂变更可控", input: "项目群上下文", output,
      artifacts: ["依赖图", "数据血缘报告", "L4 门禁报告"], tools: ["数据血缘", "性能平台", "混沌工程"], gate: output
    })),
    tools: [["数据质量", "失败", "回补后 3 条库存余额不一致"], ["性能平台", "通过", "P99 380ms"], ["混沌工程", "执行中", "履约超时注入中"], ["发布系统", "阻断", "回滚演练缺失"]],
    mockData: [["库存流水", "锁定/释放/扣减/回补事件"], ["回补批次", "10 万条库存状态修正"], ["异常消息", "重复、乱序、延迟消息"], ["灰度城市", "上海、广州 5% 门店"]]
  },
  {
    id: "agent-search-model",
    title: "搜索排序模型灰度项目群",
    domain: "算法 / 搜索 / 数据 / 前端",
    riskLevel: "L3 高风险",
    decision: "允许 1% 灰度",
    summary: "Agent 群编排模型版本、特征数据、搜索服务、前端展示和业务指标观测，支持算法变更上线。",
    tags: ["模型版本", "特征稳定性", "影子流量", "灰度实验", "可回滚"],
    risks: [["模型效果", 68], ["特征延迟", 48], ["搜索延迟", 55], ["低频类目", 72], ["回滚", 35]],
    dependencies: [
      ["算法", "模型 v2026.06.11 注册", "done"],
      ["数据团队", "特征完整率校验", "done"],
      ["搜索研发", "模型降级开关", "done"],
      ["前端", "搜索展示兼容", "done"],
      ["运营", "低频类目样例确认", "waiting"]
    ],
    steps: [
      ["需求澄清 Agent", "效果目标", "done", "确认 CTR、CVR、无结果率、P95 延迟和低频类目曝光。"],
      ["算法变更 Agent", "模型评审", "done", "离线 NDCG +2.1%，提示关注低频类目。"],
      ["数据变更 Agent", "特征校验", "done", "特征完整率 99.96%，延迟 P95 4 分钟。"],
      ["测试编排 Agent", "验证编排", "done", "搜索接口 88/88 通过，影子流量无异常。"],
      ["发布决策 Agent", "灰度决策", "done", "证据齐全，建议 1% 灰度并绑定回滚开关。"]
    ].map(([agent, stage, status, output]) => ({
      agent, stage, status, goal: "保障算法模型可解释、可观测、可回滚", input: "模型与特征上下文", output,
      artifacts: ["模型评审报告", "特征质量报告", "灰度计划"], tools: ["模型平台", "数据质量", "监控平台"], gate: output
    })),
    tools: [["模型平台", "通过", "模型已注册"], ["数据质量", "通过", "特征完整率 99.96%"], ["自动化", "通过", "88/88"], ["监控", "就绪", "CTR/CVR/无结果率/P95"]],
    mockData: [["搜索词", "高频词、长尾词、品牌词"], ["特征", "价格、销量、库存、偏好"], ["灰度", "1% 用户，不含大促活动"], ["回滚", "3 分钟内回切旧模型"]]
  }
];

const controlCatalog = [
  {
    title: "治理与风险",
    doc: "docs/quality-strategy.md / docs/risk-matrix.md",
    frameworks: "NIST AI RMF, NIST SSDF",
    evidence: "风险评分、准入标准、验收标准、责任人、回滚计划"
  },
  {
    title: "测试工程",
    doc: "docs/test-strategy.md",
    frameworks: "测试金字塔、契约测试、变异测试、属性测试、E2E 关键旅程",
    evidence: "测试计划、覆盖率、回归结果、关键路径保护"
  },
  {
    title: "AI 代码评审",
    doc: "docs/ai-code-review-standard.md / docs/prompt-guidelines.md",
    frameworks: "Human-in-the-loop, Prompt traceability, secure AI coding",
    evidence: "AI 评审记录、人工复核、假设记录、边界条件清单"
  },
  {
    title: "安全与供应链",
    doc: "新增应用控制域",
    frameworks: "OWASP LLM Top 10, SLSA, OpenSSF, SBOM, Sigstore",
    evidence: "SAST、SCA、密钥扫描、SBOM、来源证明、签名"
  },
  {
    title: "持续度量",
    doc: "docs/quality-metrics.md",
    frameworks: "DORA, 缺陷逃逸率, AI 变更失败率",
    evidence: "前置时间、部署频率、变更失败率、恢复时间、逃逸缺陷"
  },
  {
    title: "持续改进",
    doc: "docs/adoption-roadmap.md / escaped defect template",
    frameworks: "Shift-left, Quality gates, Incident learning",
    evidence: "复盘项、回归用例、Prompt 更新、门禁调优"
  }
];

function init() {
  initScoreBoxes();
  renderControls();
  renderCatalog();
  renderScenarioCards();
  renderSimulation();
  renderAgentScenarioOptions();
  resetAgentRun(false);
  bindEvents();
  refresh();
}

function initScoreBoxes() {
  ["userImpact", "dataImpact", "complexity", "reversibility", "confidence", "compliance", "agency", "supplyChain"].forEach((id) => {
    for (let score = 1; score <= 5; score += 1) {
      const option = document.createElement("option");
      option.value = String(score);
      option.textContent = String(score);
      $(id).append(option);
    }
  });
}

function renderControls() {
  renderCheckGroup("testChecks", testControls);
  renderCheckGroup("securityChecks", securityControls);
  renderCheckGroup("reviewChecks", reviewControls);
}

function renderCheckGroup(containerId, controls) {
  $(containerId).innerHTML = controls.map(([id, label, desc]) => `
    <label>
      <input id="${id}" type="checkbox">
      <span>${label}</span>
      <small>${desc}</small>
    </label>
  `).join("");
}

function renderCatalog() {
  $("controlCatalog").innerHTML = controlCatalog.map((item) => `
    <article>
      <h3>${item.title}</h3>
      <p><strong>体系资产：</strong>${item.doc}</p>
      <p><strong>行业映射：</strong>${item.frameworks}</p>
      <p><strong>证据：</strong>${item.evidence}</p>
    </article>
  `).join("");
}

function bindEvents() {
  document.querySelectorAll(".step").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".step").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".panel").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      $(button.dataset.target).classList.add("active");
      refresh();
    });
  });

  [...fieldIds, ...allCheckIds].forEach((id) => {
    const element = $(id);
    element.addEventListener("input", refresh);
    element.addEventListener("change", refresh);
  });

  $("sampleBtn").addEventListener("click", fillSample);
  $("exportBtn").addEventListener("click", exportReport);
  $("runScenarioBtn").addEventListener("click", runScenarioSimulation);
  $("agentScenarioSelect").addEventListener("change", () => {
    agentRun.scenarioId = $("agentScenarioSelect").value;
    resetAgentRun(false);
  });
  $("startAgentRunBtn").addEventListener("click", () => {
    agentRun.currentStep = 0;
    agentRun.log = [`${timeNow()} Agent 群已启动，进入 ${activeAgentScenario().steps[0].stage}`];
    renderAgentLab();
  });
  $("nextAgentStepBtn").addEventListener("click", runNextAgentStep);
  $("autoAgentRunBtn").addEventListener("click", autoRunAgentSteps);
  $("resetAgentRunBtn").addEventListener("click", () => resetAgentRun(true));
  $("agentFlow").addEventListener("click", (event) => {
    const button = event.target.closest("[data-agent-step]");
    if (!button) return;
    agentRun.currentStep = Number(button.dataset.agentStep);
    agentRun.log.push(`${timeNow()} 手动查看 ${activeAgentScenario().steps[agentRun.currentStep].stage}`);
    renderAgentLab();
  });
  $("scenarioCards").addEventListener("click", (event) => {
    const button = event.target.closest("[data-scenario-id]");
    if (!button) return;
    activeScenarioId = button.dataset.scenarioId;
    activeStageId = "requirement";
    renderScenarioCards();
    renderSimulation();
  });
  $("scenarioFlow").addEventListener("click", (event) => {
    const button = event.target.closest("[data-stage-id]");
    if (!button) return;
    activeStageId = button.dataset.stageId;
    renderSimulation();
  });
}

function activeAgentScenario() {
  return agentScenarios.find((scenario) => scenario.id === agentRun.scenarioId) || agentScenarios[0];
}

function renderAgentScenarioOptions() {
  $("agentScenarioSelect").innerHTML = agentScenarios.map((scenario) => `
    <option value="${scenario.id}">${scenario.title}</option>
  `).join("");
  $("agentScenarioSelect").value = agentRun.scenarioId;
}

function resetAgentRun(showToast) {
  agentRun.currentStep = -1;
  agentRun.log = [`${timeNow()} 已加载场景：${activeAgentScenario().title}`];
  renderAgentLab();
  if (showToast) toast("Agent 编排已重置");
}

function runNextAgentStep() {
  const scenario = activeAgentScenario();
  if (agentRun.currentStep < scenario.steps.length - 1) {
    agentRun.currentStep += 1;
    const step = scenario.steps[agentRun.currentStep];
    agentRun.log.push(`${timeNow()} ${step.agent} 完成：${step.output}`);
  } else {
    agentRun.log.push(`${timeNow()} Agent 流程已到达最终节点`);
  }
  renderAgentLab();
}

function autoRunAgentSteps() {
  const scenario = activeAgentScenario();
  const blockedIndex = scenario.steps.findIndex((step) => step.status === "blocked");
  agentRun.currentStep = blockedIndex >= 0 ? blockedIndex : scenario.steps.length - 1;
  agentRun.log = scenario.steps.slice(0, agentRun.currentStep + 1).map((step, index) =>
    `${timeNow(index)} ${step.agent} -> ${step.stage}：${step.output}`
  );
  agentRun.log.push(`${timeNow(agentRun.currentStep + 1)} 自动编排结束，发布建议：${scenario.decision}`);
  renderAgentLab();
  toast(`已自动跑到门禁：${scenario.decision}`);
}

function renderAgentLab() {
  const scenario = activeAgentScenario();
  const currentIndex = agentRun.currentStep >= 0 ? agentRun.currentStep : 0;
  const currentStep = scenario.steps[currentIndex];
  const completedCount = agentRun.currentStep < 0 ? 0 : agentRun.currentStep + 1;
  const evidenceScore = Math.round((scenario.steps.filter((step, index) => index <= agentRun.currentStep && step.status !== "blocked").length / scenario.steps.length) * 100);

  $("agentRunState").textContent = agentRun.currentStep < 0 ? "待启动" : currentStep.status === "blocked" ? "门禁阻断" : "运行中";
  $("agentRunState").className = `badge ${agentRun.currentStep < 0 ? "warn" : currentStep.status === "blocked" ? "critical" : "medium"}`;
  $("agentImpactTitle").textContent = scenario.title;
  $("agentImpactSummary").textContent = scenario.summary;
  $("agentImpactTags").innerHTML = scenario.tags.map((tag) => `<span>${tag}</span>`).join("");
  $("agentRiskLevel").textContent = scenario.riskLevel;
  $("agentProgress").textContent = `${completedCount}/${scenario.steps.length}`;
  $("agentEvidenceScore").textContent = `${Math.max(0, evidenceScore)}%`;
  $("agentDecision").textContent = scenario.decision;

  $("agentFlow").innerHTML = scenario.steps.map((step, index) => {
    const state = index < completedCount ? step.status : "pending";
    const active = index === currentIndex && agentRun.currentStep >= 0 ? "active" : "";
    return `
      <button class="agent-node ${active}" type="button" data-agent-step="${index}">
        <span class="status ${statusClass(state)}">${stateText(state)}</span>
        <strong>${step.stage}</strong>
        <small>${step.agent}</small>
      </button>
    `;
  }).join("");

  $("agentStepDetail").innerHTML = `
    <span class="eyebrow">${currentStep.agent}</span>
    <h3>${currentStep.stage}</h3>
    <p>${currentStep.goal}</p>
    <dl>
      <dt>输入</dt><dd>${currentStep.input}</dd>
      <dt>输出</dt><dd>${currentStep.output}</dd>
      <dt>门禁</dt><dd>${currentStep.gate}</dd>
    </dl>
  `;

  $("agentDependencyGraph").innerHTML = scenario.dependencies.map(([team, item, state]) => `
    <div class="dependency-card">
      <span class="status ${statusClass(state)}">${stateText(state)}</span>
      <strong>${team}</strong>
      <small>${item}</small>
    </div>
  `).join("");

  $("agentRiskRadar").innerHTML = scenario.risks.map(([name, score]) => `
    <div class="risk-bar">
      <span>${name}</span>
      <strong>${score}</strong>
      <div><i style="width:${score}%"></i></div>
    </div>
  `).join("");

  $("agentArtifacts").innerHTML = currentStep.artifacts.map((item) => `
    <div class="artifact-item"><strong>${item}</strong><span>由 ${currentStep.agent} 生成</span></div>
  `).join("");

  $("agentToolQueue").innerHTML = scenario.tools.map(([tool, state, detail]) => `
    <div class="tool-item">
      <span class="status ${statusClass(state)}">${stateText(state)}</span>
      <strong>${tool}</strong>
      <small>${detail}</small>
    </div>
  `).join("");

  $("agentMockData").innerHTML = scenario.mockData.map(([name, detail]) => `
    <div class="mock-item"><strong>${name}</strong><span>${detail}</span></div>
  `).join("");

  $("agentExecutionLog").innerHTML = agentRun.log.map((line) => `<p>${line}</p>`).join("");
}

function stateText(state) {
  const map = {
    done: "完成",
    running: "执行中",
    waiting: "等待",
    pending: "待执行",
    blocked: "阻断",
    passed: "通过",
    failed: "失败",
    missing: "缺失",
    "通过": "通过",
    "失败": "失败",
    "执行中": "执行中",
    "就绪": "就绪",
    "阻断": "阻断"
  };
  return map[state] || state;
}

function timeNow(offset = 0) {
  const date = new Date(Date.now() + offset * 1000);
  return date.toLocaleTimeString("zh-CN", {hour12: false});
}

function activeScenario() {
  return simulationScenarios.find((scenario) => scenario.id === activeScenarioId) || simulationScenarios[0];
}

function renderScenarioCards() {
  $("scenarioCards").innerHTML = simulationScenarios.map((scenario) => `
    <button class="scenario-card ${scenario.id === activeScenarioId ? "active" : ""}" type="button" data-scenario-id="${scenario.id}">
      <span>${scenario.domain}</span>
      <strong>${scenario.name}</strong>
      <small>${scenario.summary}</small>
      <em>${scenario.risk}</em>
    </button>
  `).join("");
}

function renderSimulation() {
  const scenario = activeScenario();
  const stage = scenario.stages[activeStageId] || scenario.stages.requirement;
  $("scenarioDecision").textContent = scenario.decision;
  $("scenarioDecision").className = `badge ${scenario.decisionClass}`;
  $("scenarioTitle").textContent = scenario.name;
  $("scenarioMeta").textContent = `${scenario.risk} | ${scenario.teams.join(" / ")}`;

  $("scenarioFlow").innerHTML = scenarioStages.map(([id, label], index) => `
    <button class="stage-node ${id === activeStageId ? "active" : ""}" type="button" data-stage-id="${id}">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <strong>${label}</strong>
    </button>
  `).join("");

  $("stageDetail").innerHTML = `
    <div>
      <span class="eyebrow">当前阶段重点</span>
      <h3>${stage[0]}</h3>
      <p>${stage[1]}</p>
    </div>
    <div class="stage-actions">
      ${stageActions(activeStageId, scenario).map((item) => `<span>${item}</span>`).join("")}
    </div>
  `;

  $("riskHotspots").innerHTML = scenario.hotspots.map((item) => `<span>${item}</span>`).join("");
  $("dependencyList").innerHTML = scenario.dependencies.map(([name, status, owner]) => `
    <div class="dep-row">
      <span class="status ${statusClass(status)}">${status}</span>
      <strong>${name}</strong>
      <small>${owner}</small>
    </div>
  `).join("");
  $("gateSimulation").innerHTML = scenario.gates.map(([name, status]) => `
    <div class="gate-row">
      <span class="dot ${statusClass(status)}"></span>
      <strong>${name}</strong>
      <small>${statusLabel(status)}</small>
    </div>
  `).join("");
  $("agentSimulation").innerHTML = scenario.agents.map(([name, summary]) => `
    <div><strong>${name}</strong><p>${summary}</p></div>
  `).join("");
  $("toolSimulation").innerHTML = scenario.tools.map(([name, summary]) => `
    <div><strong>${name}</strong><p>${summary}</p></div>
  `).join("");
  $("dataSimulation").innerHTML = scenario.testData.map(([name, summary]) => `
    <div><strong>${name}</strong><p>${summary}</p></div>
  `).join("");
}

function stageActions(stageId, scenario) {
  const map = {
    requirement: ["抽取验收标准", "识别业务规则", "初判风险"],
    design: ["生成依赖图", "检查回滚方案", "冻结接口契约"],
    coding: ["记录 AI 假设", "检查禁止范围", "生成单测建议"],
    pr: ["Diff 风险评分", "匹配门禁策略", "生成 Review 清单"],
    verification: ["编排测试数据", "触发自动化", "汇总工具证据"],
    uat: ["突出业务风险", "收集 UAT 签收", "确认剩余风险"],
    release: ["检查灰度", "绑定监控", "校验回滚"],
    review: ["归因逃逸缺陷", "新增回归用例", "更新知识库"]
  };
  if (scenario.decision === "Ready for Canary" && stageId === "release") return ["允许 1% 灰度", "观察核心指标", "保留回滚开关"];
  return map[stageId] || [];
}

function statusClass(status) {
  const normalized = String(status).toLowerCase();
  if (["passed", "resolved", "accepted", "ready for canary", "done", "通过", "完成", "就绪"].includes(normalized) || ["通过", "完成", "就绪"].includes(status)) return "ok";
  if (["running", "in progress", "open", "exception review", "pending", "waiting", "执行中", "等待", "待执行"].includes(normalized) || ["执行中", "等待", "待执行"].includes(status)) return "pending";
  return "bad";
}

function statusLabel(status) {
  const labels = {
    passed: "已通过",
    failed: "失败",
    running: "执行中",
    missing: "缺失"
  };
  return labels[status] || status;
}

function runScenarioSimulation() {
  const scenario = activeScenario();
  const failed = scenario.gates.filter(([, status]) => status === "failed" || status === "missing");
  const running = scenario.gates.filter(([, status]) => status === "running");
  const message = failed.length > 0
    ? `模拟完成：${scenario.name} 仍有 ${failed.length} 个阻断项，${running.length} 个执行中任务。`
    : `模拟完成：${scenario.name} 证据齐全，可以进入灰度或发布审批。`;
  toast(message);
  renderSimulation();
}

function state() {
  const data = {};
  [...fieldIds, ...allCheckIds].forEach((id) => {
    const element = $(id);
    data[id] = element.type === "checkbox" ? element.checked : element.value.trim();
  });
  return data;
}

function riskInfo(data) {
  const dimensions = ["userImpact", "dataImpact", "complexity", "reversibility", "confidence", "compliance", "agency", "supplyChain"];
  const total = dimensions.map((id) => Number(data[id] || 1)).reduce((sum, score) => sum + score, 0);
  if (total <= 12) return {total, level: "Low", className: "low"};
  if (total <= 22) return {total, level: "Medium", className: "medium"};
  if (total <= 32) return {total, level: "High", className: "high"};
  return {total, level: "Critical", className: "critical"};
}

function gateInfo(data, risk) {
  const missing = [];
  const require = (ok, label) => {
    if (!ok) missing.push(label);
  };

  require(data.unitPass, "单元测试通过");
  require(data.staticPass, "SAST/静态扫描通过");
  require(data.secretPass, "密钥扫描通过");
  require(data.humanReviewDone, "人工评审完成");
  require(data.promptLogged, "Prompt 和假设已记录");

  if (risk.level !== "Low") {
    require(data.integrationPass, "集成/契约测试通过");
    require(data.dependencyPass, "依赖/SCA 扫描通过");
    require(data.aiReviewDone, "AI 辅助评审完成");
  }
  if (risk.level === "High" || risk.level === "Critical") {
    require(data.e2ePass, "关键旅程 E2E 通过");
    require(data.llmThreatReviewed, "LLM/AI 风险已评审");
    require(data.sbomReady, "SBOM 已生成");
    require(data.rollbackReady, "回滚/缓解方案就绪");
    require(data.releaseMonitorReady, "发布监控就绪");
  }
  if (risk.level === "Critical") {
    require(data.provenanceReady, "构建来源/签名就绪");
    require(data.mutationPass, "变异/属性测试完成");
    require(data.observabilityPass, "可观测性验证完成");
  }

  return {ready: missing.length === 0, missing};
}

function completion(data, controls) {
  const done = controls.filter(([id]) => data[id]).length;
  return Math.round((done / controls.length) * 100);
}

function maturity(data) {
  const gateDone = allCheckIds.filter((id) => data[id]).length / allCheckIds.length;
  const changeDone = ["title", "businessGoal", "aiUsage", "acceptance", "rollback"].filter((id) => data[id]).length / 5;
  const metricDone = Number(data.regressionPassRate || 0) > 0 || Number(data.deployFrequency || 0) > 0 ? 1 : 0;
  return Math.round(((gateDone * 0.55) + (changeDone * 0.3) + (metricDone * 0.15)) * 100);
}

function refresh() {
  const data = state();
  const risk = riskInfo(data);
  const gate = gateInfo(data, risk);
  const tests = completion(data, testControls);
  const security = completion(data, securityControls);
  const systemMaturity = maturity(data);

  updateBadges(risk, gate, tests, security, systemMaturity, data);
  updateAdvice(data, risk, gate);
  $("reportText").textContent = markdownReport(data, risk, gate, tests, security, systemMaturity);
}

function updateBadges(risk, gate, tests, security, systemMaturity, data) {
  setBadge("riskBadge", `${risk.level} ${risk.total}/40`, risk.className);
  setBadge("testBadge", `${tests}%`, tests >= 70 ? "low" : tests >= 40 ? "medium" : "warn");
  setBadge("securityBadge", `${security}%`, security >= 70 ? "low" : security >= 40 ? "medium" : "warn");
  setBadge("readinessBadge", gate.ready ? "Ready" : "Not ready", gate.ready ? "low" : "warn");

  $("riskSummary").textContent = `${risk.level} ${risk.total}/40`;
  $("gateSummary").textContent = `${allCheckIds.filter((id) => data[id]).length}/${allCheckIds.length}`;
  $("testSummary").textContent = `${tests}%`;
  $("maturitySummary").textContent = `${systemMaturity}%`;
}

function setBadge(id, text, className) {
  const badge = $(id);
  badge.textContent = text;
  badge.className = `badge ${className}`;
}

function updateAdvice(data, risk, gate) {
  $("riskAdvice").innerHTML = `
    <strong>${risk.level} 风险建议</strong>
    <p>${riskRecommendation(risk.level)}</p>
  `;

  $("recommendations").innerHTML = gate.ready
    ? `<article class="ok"><strong>当前可合并</strong><p>证据满足 ${risk.level} 风险等级的质量门禁。发布后继续观察 DORA 与缺陷逃逸指标。</p></article>`
    : `<article><strong>优先补齐证据</strong><p>${gate.missing.slice(0, 6).join("、") || "请完善变更说明和质量证据。"}</p></article>`;

  $("metricAdvice").innerHTML = metricAdvice(data);
}

function riskRecommendation(level) {
  if (level === "Low") return "保持快速反馈：单元测试、静态扫描、密钥扫描和人工评审必须通过。";
  if (level === "Medium") return "增加集成/契约测试、依赖扫描和 AI 辅助评审，确保变更不会破坏模块边界。";
  if (level === "High") return "要求关键旅程 E2E、SBOM、LLM 风险评审、回滚计划和发布监控。";
  return "按关键发布处理：需要来源证明/签名、变异或属性测试、可观测性验证和明确审批。";
}

function metricAdvice(data) {
  const issues = [];
  if (Number(data.changeFailRate || 0) > 15) issues.push("变更失败率偏高，优先复盘失败变更并增加风险门禁。");
  if (Number(data.aiFailureRate || 0) > 10) issues.push("AI 变更失败率偏高，需要改进 Prompt 模板和 AI 代码评审清单。");
  if (Number(data.regressionPassRate || 0) > 0 && Number(data.regressionPassRate) < 90) issues.push("自动化回归通过率偏低，应治理 flaky 测试和关键路径覆盖。");
  if (Number(data.escapedDefects || 0) > 0) issues.push("存在逃逸缺陷，应转化为回归用例、门禁规则和复盘模板更新。");
  if (issues.length === 0) issues.push("暂无明显异常。建议持续跟踪 DORA 四项指标和 AI 变更失败率。");
  return `<strong>度量建议</strong><p>${issues.join(" ")}</p>`;
}

async function exportReport() {
  refresh();
  const markdown = $("reportText").textContent;
  const response = await fetch("/api/report", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({markdown})
  });
  const result = await response.json();
  toast(result.ok ? `报告已导出：${result.path}` : "导出失败");
}

function fillSample() {
  const values = {
    title: "AI 辅助新增订单权限校验",
    businessGoal: "阻止非订单归属用户访问订单详情，降低越权访问风险。",
    aiUsage: "AI 生成了权限校验分支、单元测试草稿和接口异常处理说明，人工复核了业务规则和边界条件。",
    forbiddenScope: "不得修改支付结算逻辑；不得引入新依赖；不得改变订单状态机。",
    acceptance: "- 非归属用户访问返回 403\n- 归属用户访问保持原有响应\n- 管理员角色按现有规则放行\n- 日志不输出用户敏感数据",
    rollback: "保留特性开关，发现异常后关闭权限校验新分支并回退到上一版本。",
    residualRisk: "管理员角色边界依赖现有权限服务，发布后观察 403 激增和客服反馈。",
    unitTests: "覆盖归属用户、非归属用户、管理员、订单不存在、权限服务异常。",
    integrationTests: "覆盖订单服务与权限服务契约，验证 401/403/404 响应兼容性。",
    e2eTests: "覆盖用户查看本人订单、越权访问他人订单、管理员查询订单。",
    securityTests: "覆盖水平越权、ID 枚举、敏感日志和错误信息泄露。",
    performanceTests: "压测权限服务调用增加后的 P95 延迟，并验证超时降级策略。",
    manualChecks: "测试工程师执行探索测试，重点检查老订单、退款订单和管理员场景。",
    aiReviewNotes: "AI 提醒需要补充权限服务异常路径和日志脱敏检查。",
    humanReviewNotes: "人工确认不改变订单状态机，拒绝 AI 建议的新增依赖方案。",
    leadTime: "8",
    deployFrequency: "5",
    changeFailRate: "8",
    recoveryTime: "1",
    reworkRate: "6",
    escapedDefects: "0",
    aiFailureRate: "5",
    regressionPassRate: "96"
  };

  Object.entries(values).forEach(([id, value]) => {
    $(id).value = value;
  });
  ["userImpact", "dataImpact", "complexity", "reversibility", "confidence", "compliance", "agency", "supplyChain"].forEach((id, index) => {
    $(id).value = [4, 4, 3, 2, 3, 3, 3, 2][index];
  });
  ["unitPass", "integrationPass", "e2ePass", "staticPass", "secretPass", "dependencyPass", "sbomReady", "llmThreatReviewed", "aiReviewDone", "promptLogged", "humanReviewDone", "rollbackReady", "releaseMonitorReady", "observabilityPass"].forEach((id) => {
    $(id).checked = true;
  });
  refresh();
  toast("已填充高风险变更示例");
}

function markdownReport(data, risk, gate, tests, security, systemMaturity) {
  const value = (text) => text && text.length > 0 ? text : "_未填写_";
  const yesNo = (ok) => ok ? "Yes" : "No";
  const now = new Date().toISOString();

  return `# AI Code Quality Assurance Report

- Generated At: ${now}
- Change: ${value(data.title)}
- Risk: ${risk.level} (${risk.total}/40)
- Merge Recommendation: ${gate.ready ? "Ready" : "Not ready"}
- Test Adequacy: ${tests}%
- Security/Supply Chain Adequacy: ${security}%
- System Maturity: ${systemMaturity}%

## 1. Change Intake

### Business Goal

${value(data.businessGoal)}

### AI Assistance

${value(data.aiUsage)}

### Forbidden Scope

${value(data.forbiddenScope)}

### Acceptance Criteria

${value(data.acceptance)}

## 2. Risk Assessment

| Dimension | Score |
| --- | --- |
| User impact | ${data.userImpact || 1} |
| Data impact | ${data.dataImpact || 1} |
| Complexity | ${data.complexity || 1} |
| Reversibility risk | ${data.reversibility || 1} |
| Confidence gap | ${data.confidence || 1} |
| Compliance/privacy impact | ${data.compliance || 1} |
| AI agency | ${data.agency || 1} |
| Supply chain impact | ${data.supplyChain || 1} |

## 3. Test Strategy

- Unit tests pass: ${yesNo(data.unitPass)}
- Integration/contract tests pass: ${yesNo(data.integrationPass)}
- Critical journey E2E pass: ${yesNo(data.e2ePass)}
- Mutation/property testing done: ${yesNo(data.mutationPass)}
- Accessibility check pass: ${yesNo(data.accessibilityPass)}
- Observability validation done: ${yesNo(data.observabilityPass)}

### Test Notes

**Unit:** ${value(data.unitTests)}

**Integration/Contract:** ${value(data.integrationTests)}

**E2E:** ${value(data.e2eTests)}

**Security:** ${value(data.securityTests)}

**Performance/Resilience:** ${value(data.performanceTests)}

**Manual Exploration:** ${value(data.manualChecks)}

## 4. Security And Supply Chain

- SAST/static scan pass: ${yesNo(data.staticPass)}
- Secret scan pass: ${yesNo(data.secretPass)}
- Dependency/SCA scan pass: ${yesNo(data.dependencyPass)}
- SBOM ready: ${yesNo(data.sbomReady)}
- Provenance/signature ready: ${yesNo(data.provenanceReady)}
- LLM/AI threat review done: ${yesNo(data.llmThreatReviewed)}

## 5. AI And Human Review

- AI review done: ${yesNo(data.aiReviewDone)}
- Prompt and assumptions logged: ${yesNo(data.promptLogged)}
- Human review done: ${yesNo(data.humanReviewDone)}
- Rollback ready: ${yesNo(data.rollbackReady)}
- Release monitoring ready: ${yesNo(data.releaseMonitorReady)}
- Escaped defect learning ready: ${yesNo(data.escapedLearningReady)}

### AI Review Notes

${value(data.aiReviewNotes)}

### Human Review Notes

${value(data.humanReviewNotes)}

## 6. Metrics

| Metric | Value |
| --- | --- |
| Lead time hours | ${data.leadTime || 0} |
| Deploy frequency per week | ${data.deployFrequency || 0} |
| Change failure rate % | ${data.changeFailRate || 0} |
| Recovery time hours | ${data.recoveryTime || 0} |
| Rework rate % | ${data.reworkRate || 0} |
| Escaped defects per week | ${data.escapedDefects || 0} |
| AI change failure rate % | ${data.aiFailureRate || 0} |
| Regression pass rate % | ${data.regressionPassRate || 0} |

## 7. Missing Evidence

${gate.missing.length === 0 ? "_None_" : gate.missing.map((item) => `- ${item}`).join("\n")}

## 8. Rollback And Residual Risk

### Rollback Plan

${value(data.rollback)}

### Residual Risk

${value(data.residualRisk)}
`;
}

function toast(message) {
  const toastElement = $("toast");
  toastElement.textContent = message;
  toastElement.style.display = "block";
  window.clearTimeout(window.toastTimer);
  window.toastTimer = window.setTimeout(() => {
    toastElement.style.display = "none";
  }, 4200);
}

init();
