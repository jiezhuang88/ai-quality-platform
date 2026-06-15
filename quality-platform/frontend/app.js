const routes = [
  ["dashboard", "组织驾驶舱", "Portfolio"],
  ["runbook", "开源运行台", "Open Source"],
  ["workspace", "项目工作台", "Project Space"],
  ["intake", "项目接入", "Intake"],
  ["requirements", "PRD 与需求", "Requirement"],
  ["prs", "PR 质量门禁", "PR Gate"],
  ["testing", "测试资产与执行", "Testing"],
  ["release", "发布准入", "Release"],
  ["agents", "Agent 运维", "Agent Ops"],
  ["integrations", "集成与策略", "Integration"],
  ["audit", "审计追踪", "Audit"],
];

const stages = ["需求澄清", "方案评审", "AI 编码", "PR 门禁", "测试验证", "UAT 验收", "发布决策", "复盘沉淀"];

const prdSourceCatalog = {
  local: {
    label: "本地上传",
    providers: [
      { id: "markdown", label: "Markdown", action: "upload_snapshot", mode: "file", accept: ".md,.markdown,.txt" },
      { id: "word", label: "Word 文档", action: "upload_snapshot", mode: "file", accept: ".doc,.docx" },
      { id: "pdf", label: "PDF 文档", action: "upload_snapshot", mode: "file", accept: ".pdf" },
      { id: "text_file", label: "TXT 文本", action: "upload_snapshot", mode: "file", accept: ".txt" },
    ],
  },
  manual: {
    label: "手动录入",
    providers: [
      { id: "paste_text", label: "粘贴 PRD 文本", action: "parse_text", mode: "paste" },
      { id: "meeting_notes", label: "会议纪要摘录", action: "parse_text", mode: "paste" },
    ],
  },
  collaboration: {
    label: "协作文档",
    providers: [
      { id: "feishu", label: "飞书文档", action: "register_link", mode: "feishu" },
      { id: "confluence", label: "Confluence 页面", action: "register_link", mode: "url" },
    ],
  },
  delivery: {
    label: "研发协同",
    providers: [
      { id: "jira", label: "Jira Story", action: "register_link", mode: "url" },
      { id: "defect", label: "缺陷/变更单", action: "register_link", mode: "url" },
    ],
  },
  external: {
    label: "外部链接",
    providers: [
      { id: "url", label: "普通 URL", action: "register_link", mode: "url" },
      { id: "wiki", label: "知识库页面", action: "register_link", mode: "url" },
    ],
  },
};

const state = {
  route: location.hash.replace("#/", "") || "dashboard",
  dashboard: null,
  projects: [],
  selectedProjectId: null,
  agents: [],
  agentSkills: [],
  integrations: [],
  policies: [],
  testFilters: { status: "all", priority: "all", type: "all", system: "all", automation: "all", keyword: "", groupBy: "status" },
  selectedCaseId: null,
  initialized: false,
};

const els = {
  nav: document.querySelector("#nav"),
  view: document.querySelector("#view"),
  pageTitle: document.querySelector("#pageTitle"),
  pageEyebrow: document.querySelector("#pageEyebrow"),
  projectContext: document.querySelector("#projectContext"),
  refreshBtn: document.querySelector("#refreshBtn"),
  toast: document.querySelector("#toast"),
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `请求失败：${response.status}`);
  }
  return response.json();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function badge(value) {
  const text = value || "unknown";
  const danger = ["blocked", "failed", "ERROR", "L4", "block"].includes(text);
  const warning = ["testing", "planning", "manual_review", "pending", "draft", "candidate", "returned", "L3", "warning"].includes(text);
  const success = ["passed", "ok", "confirmed", "active", "ready", "completed", "pass", "reviewed", "approved", "baselined", "in_library", "bound"].includes(text);
  const klass = danger ? "danger" : warning ? "warning" : success ? "success" : "info";
  return `<span class="pill ${klass}">${escapeHtml(text)}</span>`;
}

function currentProject() {
  return state.projects.find((item) => item.id === state.selectedProjectId) || state.projects[0];
}

async function loadBase() {
  const [dashboard, projects, agents, skills, integrations, policies] = await Promise.all([
    api("/api/dashboard"),
    api("/api/projects"),
    api("/api/agents"),
    api("/api/agent-skills"),
    api("/api/integrations"),
    api("/api/policies"),
  ]);
  state.dashboard = dashboard.dashboard;
  state.projects = projects.projects || [];
  state.agents = agents.agents || [];
  state.agentSkills = skills.skills || [];
  state.integrations = integrations.integrations || [];
  state.policies = policies.policies || [];
  const preferredProject = state.projects.find((project) => project.id === "P-2026-001") || state.projects[0];
  if (!state.initialized && preferredProject) {
    state.selectedProjectId = preferredProject.id;
    state.initialized = true;
  }
  if (!state.selectedProjectId && preferredProject) state.selectedProjectId = preferredProject.id;
  if (!state.projects.find((project) => project.id === state.selectedProjectId) && state.projects[0]) state.selectedProjectId = state.projects[0].id;
  renderShell();
}

function renderShell() {
  els.nav.innerHTML = routes
    .map(([key, label, eyebrow]) => `<a href="#/${key}" class="${state.route === key ? "active" : ""}"><span>${label}</span><small>${eyebrow}</small></a>`)
    .join("");
  const route = routes.find(([key]) => key === state.route) || routes[0];
  els.pageTitle.textContent = route[1];
  els.pageEyebrow.textContent = route[2];
  els.projectContext.innerHTML = state.projects
    .map((project) => `<option value="${project.id}" ${project.id === state.selectedProjectId ? "selected" : ""}>${project.id} · ${project.name}</option>`)
    .join("");
  renderRoute().catch(handleError);
}

async function renderRoute() {
  const renderers = {
    dashboard: renderDashboard,
    runbook: renderRunbook,
    workspace: renderWorkspace,
    intake: renderIntake,
    requirements: renderRequirements,
    prs: renderPrs,
    testing: renderTesting,
    release: renderRelease,
    agents: renderAgents,
    integrations: renderIntegrations,
    audit: renderAudit,
  };
  await (renderers[state.route] || renderDashboard)();
}

function metric(label, value, hint = "") {
  return `<div class="metric"><span>${label}</span><strong>${escapeHtml(value ?? 0)}</strong><small>${escapeHtml(hint)}</small></div>`;
}

async function renderDashboard() {
  const data = state.dashboard || {};
  els.view.innerHTML = `
    <section class="grid four">
      ${metric("年度项目", data.project_count, "支持一年几百个项目台账")}
      ${metric("高风险项目", data.high_risk_count, "L3/L4 自动升级门禁")}
      ${metric("阻断项目", data.blocked_count, "需要 Owner 闭环")}
      ${metric("Agent 数量", data.agent_count, "覆盖 8 个 SDLC 阶段")}
    </section>
    <section class="grid two section-gap">
      <div class="panel">
        <div class="panel-head"><h2>大型项目质量主线</h2></div>
        <div class="flow">${stages.map((stage, index) => `<div class="flow-step"><b>${index + 1}</b><span>${stage}</span><small>${stageControl(stage)}</small></div>`).join("")}</div>
      </div>
      <div class="panel">
        <div class="panel-head"><h2>风险与工具健康</h2></div>
        <div class="split-list">
          <div>${Object.entries(data.risk_distribution || {}).map(([risk, count]) => `<div class="mini-card"><strong>${risk}</strong><span>${count} 个项目</span></div>`).join("")}</div>
          <div>${Object.entries(data.integration_health || {}).map(([name, status]) => `<div class="mini-card"><strong>${escapeHtml(name)}</strong>${badge(status)}</div>`).join("")}</div>
        </div>
      </div>
    </section>
    <section class="panel section-gap">
      <div class="panel-head"><h2>项目组合</h2><div class="action-row"><button data-route="runbook">运行开源流程</button><button data-route="intake">新建大型项目</button></div></div>
      ${projectTable(state.projects)}
    </section>
  `;
  bindRouteButtons();
}

async function renderRunbook() {
  const project = currentProject();
  const [blueprint, runbook] = await Promise.all([
    api("/api/open-source-blueprint"),
    api(`/api/projects/${project.id}/runbook`),
  ]);
  const data = runbook.runbook || {};
  els.view.innerHTML = `
    <section class="project-hero">
      <div>
        <p class="eyebrow">${escapeHtml(blueprint.name)}</p>
        <h2>开源端到端质量门禁演练</h2>
        <p>${escapeHtml(blueprint.positioning)} · 当前项目：${escapeHtml(project.name)}</p>
      </div>
      <div class="hero-actions">
        <button id="runAllBtn">一键跑完整流程</button>
        <button class="primary" data-route="workspace">查看项目证据</button>
      </div>
    </section>
    <section class="grid six section-gap">
      ${metric("PRD", data.counts?.requirements || 0, "规则卡")}
      ${metric("PR", data.counts?.prs || 0, "质量门禁")}
      ${metric("用例", data.counts?.test_cases || 0, "候选/入库")}
      ${metric("执行", data.counts?.executions || 0, "自动化")}
      ${metric("证据", data.counts?.evidence || 0, "Evidence")}
      ${metric("Agent", data.counts?.agent_runs || 0, "运行记录")}
    </section>
    <section class="grid layout-2-1 section-gap">
      <div class="panel">
        <div class="panel-head"><h2>可执行 Runbook</h2><span class="muted">逐步执行或一键完成</span></div>
        <div class="runbook-steps">${(data.steps || []).map((step, index) => runbookStep(step, index, data.latest_by_gate || {})).join("")}</div>
      </div>
      <div class="panel">
        <div class="panel-head"><h2>开源扩展点</h2></div>
        <div class="stage-list">
          ${(blueprint.extension_points || []).map((item) => `<div class="stage-item"><strong>${escapeHtml(item)}</strong><span>${extensionHint(item)}</span></div>`).join("")}
        </div>
        <div class="hint-box section-gap"><strong>启动命令</strong><span>${escapeHtml(blueprint.run_command)}</span></div>
      </div>
    </section>
    <section class="grid two section-gap">
      <div class="panel">
        <div class="panel-head"><h2>最新门禁结果</h2></div>
        <div class="stack">${(data.gate_runs || []).slice(0, 10).map((gate) => `<div class="mini-card rich-card"><strong>${escapeHtml(gate.gate)}</strong>${badge(gate.decision)}<p class="muted">${escapeHtml(gate.stage)} · ${escapeHtml(gate.created_at)}</p><p>${escapeHtml(gate.summary)}</p>${(gate.blockers || []).length ? `<p class="danger-text">${escapeHtml(gate.blockers.join("；"))}</p>` : ""}</div>`).join("") || `<p class="muted">暂无门禁执行记录。</p>`}</div>
      </div>
      <div class="panel">
        <div class="panel-head"><h2>Agent Skills 挂载矩阵</h2><button data-route="agents">进入 Agent 运维</button></div>
        ${skillMatrix(state.agentSkills)}
      </div>
    </section>
  `;
  document.querySelector("#runAllBtn").addEventListener("click", runAllRunbook);
  document.querySelectorAll("[data-run-step]").forEach((button) => button.addEventListener("click", () => runRunbookStep(button.dataset.runStep)));
  bindRouteButtons();
}

function runbookStep(step, index, latestByGate) {
  const latest = latestByGate[step.gate];
  return `<div class="runbook-step">
    <div class="runbook-index">${index + 1}</div>
    <div>
      <strong>${escapeHtml(step.title)}</strong>
      <p>${escapeHtml(step.description)}</p>
      <small>${escapeHtml(step.stage)} · ${escapeHtml(step.gate)} · ${escapeHtml(step.agent_id)}</small>
    </div>
    <div class="runbook-action">
      ${latest ? badge(latest.decision) : badge("not_run")}
      <button data-run-step="${step.id}">运行</button>
    </div>
  </div>`;
}

function extensionHint(item) {
  return {
    "Integration Adapter": "接入 Git、Sonar、CI、自动化、性能、混沌、缺陷和监控。",
    "Policy Rule": "沉淀 PRD、PR、测试、发布准入规则，并支持风险等级加严。",
    "Agent Skill": "为阶段 Agent 挂载可评测、可审计、可回滚的专业能力。",
    "Evidence Normalizer": "把外部工具结果统一转成 Evidence，支撑审计和报告。",
    "Runbook Step": "把组织流程固化为可执行步骤，支持一键演练和验收。",
  }[item] || "可按开源接口扩展。";
}

function skillMatrix(skills) {
  if (!skills.length) return `<p class="muted">暂无 Skill Catalog。</p>`;
  const grouped = skills.reduce((groups, skill) => {
    groups[skill.stage] = groups[skill.stage] || [];
    groups[skill.stage].push(skill);
    return groups;
  }, {});
  return `<div class="skill-matrix">${Object.entries(grouped).map(([stage, items]) => `<details open>
    <summary><strong>${escapeHtml(stage)}</strong><span>${items.length} skills</span></summary>
    <div class="stack">${items.map((skill) => `<div class="mini-card rich-card">
      <strong>${escapeHtml(skill.name)}</strong><span class="muted">${escapeHtml(skill.id)} / ${escapeHtml(skill.agent_id)}</span>
      <p>${escapeHtml(skill.description)}</p>
      <p><b>输入</b> ${escapeHtml((skill.inputs || []).join(" / "))}</p>
      <p><b>输出</b> ${escapeHtml((skill.outputs || []).join(" / "))}</p>
      <p><b>规则</b> ${escapeHtml((skill.quality_rules || []).join("；"))}</p>
    </div>`).join("")}</div>
  </details>`).join("")}</div>`;
}

async function runRunbookStep(stepId) {
  const project = currentProject();
  await api(`/api/projects/${project.id}/runbook/run-step`, {
    method: "POST",
    body: JSON.stringify({ step_id: stepId }),
  });
  toast("Runbook 步骤已执行");
  await loadBase();
}

async function runAllRunbook() {
  const project = currentProject();
  await api(`/api/projects/${project.id}/runbook/run-all`, { method: "POST", body: "{}" });
  toast("完整 SDLC 质量门禁流程已执行");
  await loadBase();
}

function stageControl(stage) {
  return {
    需求澄清: "PRD 多源导入、规则卡、歧义确认",
    方案评审: "多系统影响面、契约、回滚",
    "AI 编码": "仓库授权、AI 变更自检、单测建议",
    "PR 门禁": "Sonar、覆盖率、AI 生成比例、必跑测试",
    测试验证: "数据银行、自动化、性能、混沌",
    "UAT 验收": "业务验收清单、遗留风险签署",
    发布决策: "证据完整性、灰度、回滚、审批",
    复盘沉淀: "缺陷模式、策略调优、Agent 评测样例",
  }[stage] || "";
}

async function renderWorkspace() {
  const project = currentProject();
  const [requirements, prs, cases, executions, evidence, metrics, runs] = await Promise.all([
    api(`/api/projects/${project.id}/requirements`),
    api(`/api/projects/${project.id}/prs`),
    api(`/api/projects/${project.id}/test-cases`),
    api(`/api/projects/${project.id}/executions`),
    api(`/api/projects/${project.id}/evidence`),
    api(`/api/projects/${project.id}/quality-metrics`),
    api(`/api/projects/${project.id}/agent-runs`),
  ]);
  els.view.innerHTML = `
    <section class="project-hero">
      <div>
        <p class="eyebrow">Project Space</p>
        <h2>${escapeHtml(project.name)}</h2>
        <p>${escapeHtml(project.business_domain)} / ${escapeHtml(project.project_type)} · ${badge(project.risk_level)} ${badge(project.stage)} ${badge(project.status)}</p>
      </div>
      <div class="hero-actions">
        <button data-route="requirements">导入 PRD</button>
        <button data-route="prs">登记 PR</button>
        <button class="primary" data-route="release">评估发布</button>
      </div>
    </section>
    <section class="grid four section-gap">
      ${metric("系统", project.systems?.length || 0, "项目影响面")}
      ${metric("仓库", project.repositories?.length || 0, "PR 必须归属仓库")}
      ${metric("需求规则卡", requirements.requirements.length, "产品 Owner 确认")}
      ${metric("证据", evidence.evidence.length, "门禁可追溯")}
    </section>
    <section class="grid two section-gap">
      <div class="panel"><div class="panel-head"><h2>系统与仓库</h2></div>${systemRepoView(project)}</div>
      <div class="panel"><div class="panel-head"><h2>质量指标</h2></div>${metricList(metrics.quality_metrics)}</div>
    </section>
    <section class="grid two section-gap">
      <div class="panel"><div class="panel-head"><h2>当前阻断与 PR</h2></div>${blockerView(project, prs.prs)}</div>
      <div class="panel"><div class="panel-head"><h2>Agent 运行记录</h2><button data-route="agents">进入运维</button></div>${agentRunList(runs.agent_runs)}</div>
    </section>
    <section class="grid three section-gap">
      ${summaryPanel("测试用例", cases.test_cases.length, "由测试编排 Agent 基于 PRD 和 PR 风险生成", "testing")}
      ${summaryPanel("自动化执行", executions.executions.length, "对接自动化框架、性能平台和混沌工程", "testing")}
      ${summaryPanel("发布证据", evidence.evidence.length, "需求、PR、Sonar、自动化、UAT、回滚", "release")}
    </section>
  `;
  bindRouteButtons();
}

function summaryPanel(title, count, desc, route) {
  return `<div class="panel"><div class="panel-head"><h2>${title}</h2><strong>${count}</strong></div><p class="muted">${desc}</p><button data-route="${route}">查看</button></div>`;
}

function systemRepoView(project) {
  const systems = project.systems || [];
  const repos = project.repositories || [];
  return `<div class="stack">${systems.map((system) => {
    const linked = repos.filter((repo) => repo.system === system.name);
    return `<div class="mini-card">
      <strong>${escapeHtml(system.name)}</strong>${badge(system.criticality)}
      <p class="muted">${escapeHtml(system.domain)} · ${escapeHtml(system.owner)}</p>
      <p class="repo-line">${linked.map((repo) => escapeHtml(repo.name)).join(" / ") || "未绑定仓库"}</p>
    </div>`;
  }).join("")}</div>`;
}

function metricList(metrics) {
  if (!metrics.length) return `<p class="muted">暂无质量指标。</p>`;
  return `<div class="stack">${metrics.map((item) => `<div class="metric-row"><span>${metricLabel(item.metric)}</span><b>${escapeHtml(item.value)}</b><small>目标 ${escapeHtml(item.target)}</small>${badge(item.status)}</div>`).join("")}</div>`;
}

function metricLabel(metricName) {
  return {
    sonar_gate_pass_rate: "Sonar 通过率",
    unit_coverage: "单测覆盖率",
    api_automation_pass_rate: "接口自动化通过率",
    api_p95_latency_ms: "接口 P95 响应",
    legacy_defects: "遗留缺陷",
    automation_coverage: "自动化覆盖率",
  }[metricName] || metricName;
}

function blockerView(project, prs) {
  const blockers = project.blockers || [];
  return `<div class="stack">
    ${(blockers.length ? blockers : ["当前无项目级阻断"]).map((item) => `<div class="mini-card">${badge(blockers.length ? "blocked" : "ok")}<span>${escapeHtml(item)}</span></div>`).join("")}
    ${prs.slice(0, 5).map((pr) => `<div class="mini-card"><strong>${escapeHtml(pr.repository_name || pr.system_name || "未归属仓库")}</strong>${badge(pr.gate_status)}<p class="muted">${escapeHtml(pr.title)}</p></div>`).join("")}
  </div>`;
}

function agentRunList(runs) {
  if (!runs.length) return `<p class="muted">暂无运行记录。可在 Agent 运维页选择阶段 Agent 执行模拟。</p>`;
  return `<div class="stack">${runs.slice(0, 6).map((run) => `<div class="mini-card"><strong>${escapeHtml(run.agent_name)}</strong>${badge(run.output?.decision)}<p class="muted">${escapeHtml(run.created_at)} · 上下文：${Object.entries(run.context_summary || {}).map(([k, v]) => `${k}:${v}`).join(" ")}</p></div>`).join("")}</div>`;
}

async function renderIntake() {
  els.view.innerHTML = `
    <section class="grid layout-2-1">
      <div class="panel">
        <div class="panel-head"><h2>创建大型项目空间</h2><button class="primary" id="createProjectBtn">创建项目</button></div>
        <div class="form-grid">
          <label><span>项目名称</span><input id="projectName" value="订单履约支付联合改造项目" /></label>
          <label><span>业务域</span><input id="projectDomain" value="交易" /></label>
          <label><span>项目类型</span><select id="projectType"><option>业务迭代</option><option>架构改造</option><option>数据改造</option><option>算法灰度</option></select></label>
          <label><span>风险等级</span><select id="projectRisk"><option>L2</option><option selected>L3</option><option>L4</option></select></label>
          <label class="span-2"><span>涉及系统：系统名 | 业务域 | Owner | 关键性 | Git地址</span><textarea id="projectSystems">订单服务 | 交易 | 订单研发 Owner | 核心 | https://git.example.com/order/order-service
优惠服务 | 营销 | 优惠研发 Owner | 核心 | https://git.example.com/promo/coupon-service
库存服务 | 履约 | 库存研发 Owner | 核心 | https://git.example.com/inventory/inventory-service
支付校验服务 | 支付 | 支付研发 Owner | 核心 | https://git.example.com/payment/payment-check-service</textarea></label>
          <label class="span-2"><span>关联仓库：仓库名 | Git地址 | 默认分支 | Owner | 所属系统</span><textarea id="projectRepos">order-service | https://git.example.com/order/order-service | main | 订单研发 Owner | 订单服务
coupon-service | https://git.example.com/promo/coupon-service | main | 优惠研发 Owner | 优惠服务
inventory-service | https://git.example.com/inventory/inventory-service | main | 库存研发 Owner | 库存服务
payment-check-service | https://git.example.com/payment/payment-check-service | main | 支付研发 Owner | 支付校验服务</textarea></label>
          <label class="span-2"><span>关键角色：角色 | 姓名 | 审批范围</span><textarea id="projectStakeholders">产品 Owner | 产品负责人 | 业务规则和验收标准
研发 Owner | 订单研发 Owner | 核心代码和接口契约
QA Owner | QA Owner | 测试覆盖和阻断项
架构 Owner | 架构 Owner | L3/L4 方案评审
发布经理 | 发布经理 | 灰度、回滚和发布准入</textarea></label>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><h2>接入后自动准备</h2></div>
        <div class="stage-list">${stages.map((stage, index) => `<div class="stage-item"><strong>${index + 1}. ${stage}</strong><span>${stageControl(stage)}</span></div>`).join("")}</div>
      </div>
    </section>
    <section class="panel section-gap"><div class="panel-head"><h2>项目台账</h2></div>${projectTable(state.projects)}</section>
  `;
  document.querySelector("#createProjectBtn").addEventListener("click", createProject);
  bindRouteButtons();
}

function projectTable(projects) {
  return `<div class="table-scroll"><table><thead><tr><th>项目</th><th>业务</th><th>系统</th><th>仓库</th><th>风险</th><th>阶段</th><th>阻断项</th></tr></thead><tbody>
    ${projects.map((p) => `<tr><td><button class="linklike" data-select-project="${p.id}">${p.id}</button><br><strong>${escapeHtml(p.name)}</strong></td><td>${escapeHtml(p.business_domain)}<br><span class="muted">${escapeHtml(p.project_type)}</span></td><td>${p.systems?.length || 0}<br><span class="muted">${escapeHtml((p.systems || []).slice(0, 2).map((s) => s.name).join(" / "))}</span></td><td>${p.repositories?.length || 0}<br><span class="muted">${escapeHtml((p.repositories || []).slice(0, 2).map((r) => r.name).join(" / "))}</span></td><td>${badge(p.risk_level)}</td><td>${escapeHtml(p.stage)}</td><td>${escapeHtml((p.blockers || []).join("；") || "无")}</td></tr>`).join("")}
  </tbody></table></div>`;
}

async function createProject() {
  const payload = {
    name: document.querySelector("#projectName").value,
    business_domain: document.querySelector("#projectDomain").value,
    project_type: document.querySelector("#projectType").value,
    risk_level: document.querySelector("#projectRisk").value,
    systems: parseDelimitedLines(document.querySelector("#projectSystems").value, ["name", "domain", "owner", "criticality", "repo_url"]),
    repositories: parseDelimitedLines(document.querySelector("#projectRepos").value, ["name", "url", "branch", "owner", "system"]),
    stakeholders: parseDelimitedLines(document.querySelector("#projectStakeholders").value, ["role", "name", "approval_scope"]),
  };
  const response = await api("/api/projects", { method: "POST", body: JSON.stringify(payload) });
  state.selectedProjectId = response.project.id;
  state.route = "workspace";
  location.hash = "#/workspace";
  toast("大型项目空间已创建");
  await loadBase();
}

function parseDelimitedLines(value, fields) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const parts = line.split("|").map((part) => part.trim());
    return Object.fromEntries(fields.map((field, index) => [field, parts[index] || ""]));
  });
}

async function renderRequirements() {
  const project = currentProject();
  const [requirements, sources] = await Promise.all([
    api(`/api/projects/${project.id}/requirements`),
    api(`/api/projects/${project.id}/requirement-sources`),
  ]);
  const categoryOptions = Object.entries(prdSourceCatalog).map(([id, item]) => `<option value="${id}">${item.label}</option>`).join("");
  els.view.innerHTML = `
    <section class="grid layout-2-1">
      <div class="panel">
        <div class="panel-head"><h2>PRD 多源导入</h2><button class="primary" id="importPrdBtn">导入并解析</button></div>
        <div class="cascade-strip">
          <label><span>1 来源大类</span><select id="prdCategory">${categoryOptions}</select></label>
          <label><span>2 具体来源</span><select id="prdProvider"></select></label>
          <label><span>3 导入动作</span><input id="prdAction" readonly /></label>
        </div>
        <div class="form-grid section-gap">
          <label><span>来源名称</span><input id="prdName" value="订单优惠 PRD v1.0" /></label>
          <label><span>外部 ID / 文档 Token</span><input id="prdExternalId" value="order-coupon-prd" /></label>
          <label class="span-2 prd-link-field"><span>外部地址</span><input id="prdUrl" value="https://feishu.example.com/docx/order-coupon-prd" /></label>
          <label class="span-2 prd-file-field"><span>选择文件</span><input id="prdFile" type="file" /></label>
          <label class="span-2"><span>PRD 内容或解析预览</span><textarea id="prdContent">目标：支持全场券与商品券叠加，结算金额必须准确。
规则：商品券 SKU-10086 减 15，全场券满 199 减 20。
验收：支付前金额必须与结算金额一致。
风险：库存并发、支付超时、金额回滚需要验证。
待确认：券叠加顺序是否以商品券优先。</textarea></label>
        </div>
        <div class="hint-box" id="prdImportHint"></div>
      </div>
      <div class="panel">
        <div class="panel-head"><h2>导入来源资产</h2></div>
        <div class="stack">${sources.requirement_sources.map((source) => `<div class="mini-card"><strong>${escapeHtml(source.source_name)}</strong>${badge(source.parse_status)}<p class="muted">${escapeHtml(source.source_category || source.import_mode || "source")} / ${escapeHtml(source.source_provider || source.external_provider || "-")} / ${escapeHtml(source.import_action || source.import_mode || "-")}</p><p class="muted">${escapeHtml(source.source_url || source.file_name || "local snapshot")}</p></div>`).join("") || `<p class="muted">暂无来源资产。</p>`}</div>
      </div>
    </section>
    <section class="panel section-gap">
      <div class="panel-head"><h2>需求规则卡</h2></div>
      <div class="card-grid">${requirements.requirements.map(requirementCard).join("") || `<p class="muted">暂无需求规则卡。</p>`}</div>
    </section>
  `;
  document.querySelector("#prdCategory").addEventListener("change", updatePrdCascade);
  document.querySelector("#prdProvider").addEventListener("change", updatePrdCascade);
  document.querySelector("#prdFile").addEventListener("change", readPrdFile);
  updatePrdCascade();
  document.querySelector("#importPrdBtn").addEventListener("click", importPrd);
  document.querySelectorAll("[data-confirm-req]").forEach((button) => button.addEventListener("click", () => confirmRequirement(button.dataset.confirmReq)));
}

function selectedPrdSource() {
  const categoryId = document.querySelector("#prdCategory")?.value || "manual";
  const providerId = document.querySelector("#prdProvider")?.value;
  const category = prdSourceCatalog[categoryId] || prdSourceCatalog.manual;
  const provider = category.providers.find((item) => item.id === providerId) || category.providers[0];
  return { categoryId, category, provider };
}

function updatePrdCascade() {
  const categorySelect = document.querySelector("#prdCategory");
  const providerSelect = document.querySelector("#prdProvider");
  if (!categorySelect || !providerSelect) return;
  const category = prdSourceCatalog[categorySelect.value] || prdSourceCatalog.manual;
  const previousProvider = providerSelect.value;
  providerSelect.innerHTML = category.providers.map((item) => `<option value="${item.id}">${item.label}</option>`).join("");
  if (category.providers.some((item) => item.id === previousProvider)) providerSelect.value = previousProvider;
  const { provider } = selectedPrdSource();
  document.querySelector("#prdAction").value = provider.action;
  const fileField = document.querySelector(".prd-file-field");
  const linkField = document.querySelector(".prd-link-field");
  fileField.hidden = provider.mode !== "file";
  linkField.hidden = !["feishu", "url"].includes(provider.mode);
  document.querySelector("#prdFile").accept = provider.accept || ".txt,.md,.json,.csv,.doc,.docx,.pdf";
  document.querySelector("#prdImportHint").innerHTML = `<strong>${escapeHtml(category.label)} / ${escapeHtml(provider.label)}</strong><span>${provider.action === "register_link" ? "当前先登记链接和元数据，后续通过 Adapter 同步正文和版本变化。" : provider.action === "upload_snapshot" ? "文件会作为原始快照保存，并解析为规则卡候选。" : "文本会直接解析为规则卡候选，适合快速录入和会议纪要摘录。"}</span>`;
}

function requirementCard(req) {
  return `<div class="mini-card rich-card">
    <div class="card-top"><strong>${escapeHtml(req.business_goal)}</strong>${badge(req.status)}</div>
    <p><b>规则</b> ${escapeHtml((req.rules || []).slice(0, 3).join("；"))}</p>
    <p><b>验收</b> ${escapeHtml((req.acceptance_criteria || []).slice(0, 2).join("；"))}</p>
    <p><b>风险</b> ${escapeHtml((req.risk_hints || []).slice(0, 2).join("；") || "无")}</p>
    <button data-confirm-req="${req.id}">确认规则卡</button>
  </div>`;
}

async function readPrdFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  document.querySelector("#prdName").value = file.name;
  document.querySelector("#prdContent").value = text;
  toast("文件内容已读取到解析预览");
}

async function importPrd() {
  const project = currentProject();
  const { categoryId, category, provider } = selectedPrdSource();
  const file = document.querySelector("#prdFile").files?.[0];
  await api(`/api/projects/${project.id}/requirements/import`, {
    method: "POST",
    body: JSON.stringify({
      source_category: category.label,
      source_provider: provider.label,
      import_action: provider.action,
      source_type: provider.mode === "file" ? "file" : provider.mode,
      import_mode: provider.mode,
      source_name: document.querySelector("#prdName").value,
      source_url: ["feishu", "url"].includes(provider.mode) ? document.querySelector("#prdUrl").value : "",
      file_name: file?.name || "",
      external_provider: provider.id,
      external_doc_id: document.querySelector("#prdExternalId").value,
      source_category_id: categoryId,
      source_provider_id: provider.id,
      content: document.querySelector("#prdContent").value,
    }),
  });
  toast("PRD 已解析为需求规则卡和来源资产");
  await loadBase();
}

async function confirmRequirement(id) {
  await api(`/api/requirements/${id}/confirm`, { method: "POST", body: JSON.stringify({ confirmed_by: "Product Owner" }) });
  toast("需求规则卡已确认");
  await loadBase();
}

async function renderPrs() {
  const project = currentProject();
  const response = await api(`/api/projects/${project.id}/prs`);
  const repoOptions = (project.repositories || []).map((repo) => `<option value="${escapeHtml(repo.name)}" data-url="${escapeHtml(repo.url)}" data-system="${escapeHtml(repo.system)}">${escapeHtml(repo.system)} / ${escapeHtml(repo.name)}</option>`).join("");
  els.view.innerHTML = `
    <section class="grid layout-2-1">
      <div class="panel">
        <div class="panel-head"><h2>登记多仓库 PR</h2><button class="primary" id="registerPrBtn">登记 PR</button></div>
        <div class="form-grid">
          <label><span>所属仓库</span><select id="prRepo">${repoOptions}</select></label>
          <label><span>AI 生成比例</span><input id="aiRatio" type="number" value="65" min="0" max="100" /></label>
          <label><span>变更文件数</span><input id="changedFiles" type="number" value="24" min="1" /></label>
          <label><span>分支</span><input id="prBranch" value="feature/coupon-stack" /></label>
          <label class="span-2"><span>PR 标题</span><input id="prTitle" value="feat: 优惠叠加计算与支付前金额校验" /></label>
          <label class="span-2"><span>PR URL</span><input id="prUrl" value="https://git.example.com/order/order-service/pull/128" /></label>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><h2>PR 门禁策略</h2></div>
        <div class="stage-list">
          <div class="stage-item"><strong>Sonar</strong><span>Quality Gate ERROR 直接阻断</span></div>
          <div class="stage-item"><strong>AI 生成比例</strong><span>超过 60% 要求强化 Review 和单测证据</span></div>
          <div class="stage-item"><strong>多仓库汇总</strong><span>按项目 / 系统 / 仓库聚合门禁状态</span></div>
          <div class="stage-item"><strong>必跑测试</strong><span>根据 Diff 风险推荐接口自动化、回归、性能和混沌</span></div>
        </div>
      </div>
    </section>
    <section class="panel section-gap">
      <div class="panel-head"><h2>PR 门禁列表</h2></div>
      <div class="table-scroll"><table><thead><tr><th>系统/仓库</th><th>PR</th><th>AI/变更</th><th>状态</th><th>门禁</th><th>风险摘要</th><th>操作</th></tr></thead><tbody>
        ${response.prs.map((pr) => `<tr><td>${escapeHtml(pr.system_name)}<br><span class="muted">${escapeHtml(pr.repository_name)}</span></td><td><strong>${escapeHtml(pr.title)}</strong><br><span class="muted">${escapeHtml(pr.branch)} · ${escapeHtml(pr.url)}</span></td><td>${pr.ai_generated_ratio}%<br><span class="muted">${pr.changed_files || 0} files</span></td><td>${badge(pr.status)}</td><td>${badge(pr.gate_status)}</td><td>${escapeHtml(pr.risk_summary || "待扫描")}</td><td><button data-sonar="${pr.id}">拉取 Sonar</button></td></tr>`).join("")}
      </tbody></table></div>
    </section>
  `;
  document.querySelector("#registerPrBtn").addEventListener("click", registerPr);
  document.querySelectorAll("[data-sonar]").forEach((button) => button.addEventListener("click", () => collectSonar(button.dataset.sonar)));
}

async function registerPr() {
  const project = currentProject();
  const repoSelect = document.querySelector("#prRepo");
  const selected = repoSelect.options[repoSelect.selectedIndex];
  await api(`/api/projects/${project.id}/prs/register`, {
    method: "POST",
    body: JSON.stringify({
      title: document.querySelector("#prTitle").value,
      url: document.querySelector("#prUrl").value,
      repository_name: repoSelect.value,
      repository_url: selected?.dataset.url || "",
      system_name: selected?.dataset.system || "",
      branch: document.querySelector("#prBranch").value,
      changed_files: Number(document.querySelector("#changedFiles").value),
      ai_generated_ratio: Number(document.querySelector("#aiRatio").value),
    }),
  });
  toast("PR 已登记，等待 CI/Sonar 证据");
  await loadBase();
}

async function collectSonar(prId) {
  await api(`/api/prs/${prId}/collect-sonar`, { method: "POST", body: JSON.stringify({}) });
  toast("Sonar 结果已汇聚并更新 PR 门禁");
  await loadBase();
}

async function renderTesting() {
  const project = currentProject();
  const [cases, executions] = await Promise.all([
    api(`/api/projects/${project.id}/test-cases`),
    api(`/api/projects/${project.id}/executions`),
  ]);
  const allCases = cases.test_cases || [];
  const summary = cases.summary || {};
  const filters = state.testFilters;
  const filteredCases = filterTestCases(allCases, filters);
  const groupedCases = groupTestCases(filteredCases, filters.groupBy);
  const selectedCase = allCases.find((tc) => tc.id === state.selectedCaseId) || filteredCases[0] || allCases[0];
  const systemOptions = unique(allCases.flatMap((tc) => tc.affected_systems || [])).map((system) => `<option value="${escapeHtml(system)}" ${filters.system === system ? "selected" : ""}>${escapeHtml(system)}</option>`).join("");
  els.view.innerHTML = `
    <section class="grid four">
      ${metric("用例总数", summary.total || allCases.length, "当前项目测试资产")}
      ${metric("待 Review", (summary.candidate || 0) + (summary.returned || 0), "候选和退回队列")}
      ${metric("已入库", summary.baselined || 0, "版本化测试资产")}
      ${metric("已自动化", summary.automated || 0, "绑定自动化套件")}
    </section>
    <section class="panel section-gap">
      <div class="panel-head"><h2>测试资产管理工作台</h2><div class="action-row"><button class="primary" id="generateCasesBtn">生成候选用例</button><button id="runAutomationBtn">触发回归</button></div></div>
      <div class="asset-filters">
        <label><span>状态</span><select id="caseStatusFilter">${caseOption("all", "全部状态", filters.status)}${["candidate", "returned", "reviewed", "baselined", "rejected"].map((value) => caseOption(value, value, filters.status)).join("")}</select></label>
        <label><span>优先级</span><select id="casePriorityFilter">${caseOption("all", "全部优先级", filters.priority)}${["P0", "P1", "P2"].map((value) => caseOption(value, value, filters.priority)).join("")}</select></label>
        <label><span>类型</span><select id="caseTypeFilter">${caseOption("all", "全部类型", filters.type)}${unique(allCases.map((tc) => tc.case_type).filter(Boolean)).map((value) => caseOption(value, value, filters.type)).join("")}</select></label>
        <label><span>系统</span><select id="caseSystemFilter">${caseOption("all", "全部系统", filters.system)}${systemOptions}</select></label>
        <label><span>自动化</span><select id="caseAutomationFilter">${caseOption("all", "全部", filters.automation)}${caseOption("bound", "已绑定", filters.automation)}${caseOption("unbound", "未绑定", filters.automation)}</select></label>
        <label><span>分组</span><select id="caseGroupFilter">${["status", "system", "case_type", "priority", "automation"].map((value) => caseOption(value, caseGroupLabel(value), filters.groupBy)).join("")}</select></label>
        <label class="asset-search"><span>搜索</span><input id="caseKeywordFilter" value="${escapeHtml(filters.keyword)}" placeholder="标题 / 目标 / 断言 / 数据" /></label>
      </div>
    </section>
    <section class="grid asset-layout section-gap">
      <div class="panel">
        <div class="panel-head"><h2>分组队列</h2><span class="muted">${filteredCases.length}/${allCases.length} 条</span></div>
        <div class="case-groups">${Object.entries(groupedCases).map(([group, items]) => caseGroupBlock(group, items, selectedCase?.id)).join("") || `<p class="muted">当前筛选无用例。</p>`}</div>
      </div>
      <div class="panel">
        <div class="panel-head"><h2>用例详情与 Review</h2>${selectedCase ? badge(selectedCase.status) : ""}</div>
        ${selectedCase ? testCaseDetail(selectedCase) : `<p class="muted">请选择一条用例查看详情。</p>`}
      </div>
    </section>
    <section class="grid two section-gap">
      <div class="panel">
        <div class="panel-head"><h2>专项测试能力</h2></div>
        <div class="stage-list">
          <div class="stage-item"><strong>数据银行</strong><span>构造全场券、商品券、库存并发、支付异常数据</span></div>
          <div class="stage-item"><strong>自动化框架</strong><span>接口自动化、E2E、回归套件按风险触发</span></div>
          <div class="stage-item"><strong>性能平台</strong><span>L3/L4 关注核心接口 P95 和容量基线</span></div>
          <div class="stage-item"><strong>混沌工程</strong><span>支付超时、库存服务抖动、优惠服务降级验证</span></div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><h2>执行记录</h2></div>
        <div class="table-scroll"><table><thead><tr><th>执行</th><th>套件</th><th>结果</th><th>报告</th></tr></thead><tbody>
          ${executions.executions.map((exe) => `<tr><td>${exe.id}<br><span class="muted">${escapeHtml(exe.execution_type)}</span></td><td>${escapeHtml(exe.suite)}</td><td>${badge(exe.status)} ${exe.passed_count}/${exe.total_count}</td><td>${escapeHtml(exe.report_url)}</td></tr>`).join("")}
        </tbody></table></div>
      </div>
    </section>
  `;
  document.querySelector("#generateCasesBtn").addEventListener("click", generateCases);
  document.querySelector("#runAutomationBtn").addEventListener("click", runAutomation);
  bindCaseFilters();
  document.querySelectorAll("[data-select-case]").forEach((button) => button.addEventListener("click", () => {
    state.selectedCaseId = button.dataset.selectCase;
    renderTesting().catch(handleError);
  }));
  document.querySelectorAll("[data-case-review]").forEach((button) => button.addEventListener("click", () => reviewCase(button.dataset.caseReview, button.dataset.action)));
  document.querySelectorAll("[data-case-library]").forEach((button) => button.addEventListener("click", () => baselineCase(button.dataset.caseLibrary)));
  document.querySelectorAll("[data-bind-auto]").forEach((button) => button.addEventListener("click", () => bindAutomation(button.dataset.bindAuto, button.dataset.framework, button.dataset.suite)));
}

function caseOption(value, label, selected) {
  return `<option value="${escapeHtml(value)}" ${selected === value ? "selected" : ""}>${escapeHtml(label)}</option>`;
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function caseGroupLabel(value) {
  return { status: "按状态", system: "按系统", case_type: "按类型", priority: "按优先级", automation: "按自动化" }[value] || value;
}

function filterTestCases(cases, filters) {
  const keyword = (filters.keyword || "").trim().toLowerCase();
  return cases.filter((tc) => {
    const automationBound = Boolean(tc.automation_binding?.suite);
    const text = [tc.title, tc.objective, tc.expected_result, ...(tc.assertions || []), ...(tc.test_data || tc.test_data_refs || [])].join(" ").toLowerCase();
    return (filters.status === "all" || tc.status === filters.status)
      && (filters.priority === "all" || tc.priority === filters.priority)
      && (filters.type === "all" || tc.case_type === filters.type)
      && (filters.system === "all" || (tc.affected_systems || []).includes(filters.system))
      && (filters.automation === "all" || (filters.automation === "bound" ? automationBound : !automationBound))
      && (!keyword || text.includes(keyword));
  });
}

function groupTestCases(cases, groupBy) {
  return cases.reduce((groups, tc) => {
    const key = groupBy === "system"
      ? (tc.affected_systems?.[0] || "未标注系统")
      : groupBy === "automation"
        ? (tc.automation_binding?.suite ? "已绑定自动化" : "未绑定自动化")
        : (tc[groupBy] || "未分类");
    groups[key] = groups[key] || [];
    groups[key].push(tc);
    return groups;
  }, {});
}

function caseGroupBlock(group, items, selectedId) {
  const p0 = items.filter((tc) => tc.priority === "P0").length;
  return `<details class="case-group" open>
    <summary><strong>${escapeHtml(group)}</strong><span>${items.length} 条</span>${p0 ? badge(`P0 ${p0}`) : ""}</summary>
    <div class="case-list">${items.map((tc) => `<button class="case-list-item ${tc.id === selectedId ? "active" : ""}" data-select-case="${tc.id}">
      <span><strong>${escapeHtml(tc.title)}</strong><small>${escapeHtml((tc.affected_systems || []).join(" / ") || "未标注系统")}</small></span>
      <span>${badge(tc.priority)} ${badge(tc.case_type)} ${tc.automation_binding?.suite ? badge("auto") : ""}</span>
    </button>`).join("")}</div>
  </details>`;
}

function testCaseDetail(tc) {
  return `<div class="case-detail">
    <div class="case-detail-title">
      <h3>${escapeHtml(tc.title)}</h3>
      <div>${badge(tc.priority)} ${badge(tc.case_type)} ${badge(tc.risk_level)} ${tc.automation_binding?.suite ? badge("bound") : badge("unbound")}</div>
    </div>
    <p class="muted">${escapeHtml(tc.objective || "未填写测试目标")}</p>
    <div class="detail-grid">
      <div><b>影响系统</b><span>${escapeHtml((tc.affected_systems || []).join(" / ") || "未标注")}</span></div>
      <div><b>追溯</b><span>${escapeHtml((tc.traceability?.requirement_ids || []).join(" / ") || tc.requirement_id || "待关联")}</span></div>
      <div><b>版本</b><span>${escapeHtml(tc.version || "v0.1")} / ${escapeHtml(tc.library_id || "未入库")}</span></div>
      <div><b>评分</b><span>${escapeHtml(tc.quality_score || "-")}</span></div>
    </div>
    <h3>前置条件</h3><p>${escapeHtml(tc.precondition || "待补充")}</p>
    <h3>测试数据</h3>${listBlock(tc.test_data || tc.test_data_refs || [])}
    <h3>执行步骤</h3>${orderedBlock(tc.steps || [])}
    <h3>断言</h3>${listBlock(tc.assertions || [tc.expected_result])}
    <h3>自动化建议</h3><p>${escapeHtml(tc.automation_recommendation?.framework || "未推荐")} / ${escapeHtml(tc.automation_recommendation?.suite || "")}<br><span class="muted">${escapeHtml(tc.automation_recommendation?.reason || "")}</span></p>
    <h3>Review 记录</h3>${reviewHistory(tc)}
    <div class="action-row">
      <button data-case-review="${tc.id}" data-action="approve" ${tc.status === "baselined" ? "disabled" : ""}>Review 通过</button>
      <button data-case-review="${tc.id}" data-action="return" ${tc.status === "baselined" ? "disabled" : ""}>退回修改</button>
      <button data-case-library="${tc.id}" ${tc.status === "reviewed" ? "" : "disabled"}>批准入库</button>
      <button data-bind-auto="${tc.id}" data-framework="${escapeHtml(tc.automation_recommendation?.framework || "接口自动化框架")}" data-suite="${escapeHtml(tc.automation_recommendation?.suite || "order-core-risk-regression")}" ${tc.status === "baselined" ? "" : "disabled"}>绑定自动化</button>
    </div>
  </div>`;
}

function listBlock(items) {
  return `<ul class="detail-list">${(items.length ? items : ["待补充"]).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function orderedBlock(items) {
  return `<ol class="detail-list">${(items.length ? items : ["待补充"]).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`;
}

function reviewHistory(tc) {
  const comments = tc.review_comments || [];
  if (!comments.length) return `<p class="muted">暂无 Review 记录。</p>`;
  return `<div class="stack">${comments.slice(-5).map((item) => `<div class="mini-card"><strong>${escapeHtml(item.action)} · ${escapeHtml(item.by)}</strong><p class="muted">${escapeHtml(item.created_at)}</p><p>${escapeHtml(item.comment)}</p></div>`).join("")}</div>`;
}

function bindCaseFilters() {
  const mapping = [
    ["#caseStatusFilter", "status"],
    ["#casePriorityFilter", "priority"],
    ["#caseTypeFilter", "type"],
    ["#caseSystemFilter", "system"],
    ["#caseAutomationFilter", "automation"],
    ["#caseGroupFilter", "groupBy"],
    ["#caseKeywordFilter", "keyword"],
  ];
  mapping.forEach(([selector, key]) => {
    const el = document.querySelector(selector);
    if (!el) return;
    el.addEventListener("change", () => {
      state.testFilters[key] = el.value;
      state.selectedCaseId = null;
      renderTesting().catch(handleError);
    });
  });
}

function caseFlowHint(step) {
  return {
    "Agent 生成候选": "基于 PRD、PR 风险、质量指标生成",
    "QA Review": "确认步骤、期望、数据、优先级",
    "退回/修改": "补充边界条件或修正不可执行用例",
    "批准入库": "形成版本化测试资产",
    "自动化绑定": "关联框架、套件和 case_key",
    "执行证据关联": "执行结果回传证据中心",
  }[step] || "";
}

async function generateCases() {
  const project = currentProject();
  await api(`/api/projects/${project.id}/test-cases/generate`, { method: "POST", body: "{}" });
  toast("测试编排 Agent 已生成候选用例");
  await loadBase();
}

async function reviewCase(id, action) {
  const comment = action === "approve" ? "Review 通过：步骤、期望和风险覆盖满足入库要求。" : "退回修改：请补充前置数据、边界条件和可观测断言。";
  await api(`/api/test-cases/${id}/review`, {
    method: "POST",
    body: JSON.stringify({ action, reviewed_by: "QA Owner", comment }),
  });
  toast(action === "approve" ? "用例 Review 已通过" : "用例已退回修改");
  await loadBase();
}

async function baselineCase(id) {
  await api(`/api/test-cases/${id}/library`, {
    method: "POST",
    body: JSON.stringify({ version: "v1.0", baselined_by: "QA Owner" }),
  });
  toast("用例已入库并形成版本资产");
  await loadBase();
}

async function bindAutomation(id, framework = "接口自动化框架", suite = "order-core-risk-regression") {
  await api(`/api/test-cases/${id}/bind-automation`, {
    method: "POST",
    body: JSON.stringify({ framework, suite, case_key: `AUTO-${id}` }),
  });
  toast("用例已绑定自动化套件");
  await loadBase();
}

async function runAutomation() {
  const project = currentProject();
  await api(`/api/projects/${project.id}/executions/run`, { method: "POST", body: JSON.stringify({ suite: "risk-based-regression" }) });
  toast("自动化任务已执行并回传结果");
  await loadBase();
}

async function renderRelease() {
  const project = currentProject();
  const [gate, evidence] = await Promise.all([
    api(`/api/projects/${project.id}/release-gate`),
    api(`/api/projects/${project.id}/evidence`),
  ]);
  els.view.innerHTML = `
    <section class="grid layout-1-2">
      <div class="panel">
        <div class="panel-head"><h2>发布准入决策</h2><button class="primary" id="evaluateReleaseBtn">评估门禁</button></div>
        ${gate.release_gate ? `<div class="decision ${gate.release_gate.decision}"><strong>${escapeHtml(gate.release_gate.decision)}</strong><span>证据分 ${gate.release_gate.evidence_score}</span></div><div class="stack">${(gate.release_gate.blockers || []).map((item) => `<div class="mini-card">${badge("blocked")} ${escapeHtml(item)}</div>`).join("") || `<div class="mini-card">${badge("passed")} 无阻断项</div>`}</div>` : `<p class="muted">尚未评估发布门禁。</p>`}
      </div>
      <div class="panel">
        <div class="panel-head"><h2>证据中心</h2></div>
        <div class="card-grid">${evidence.evidence.map((item) => `<div class="mini-card rich-card"><strong>${escapeHtml(item.title)}</strong>${badge(item.status)}<p class="muted">${escapeHtml(item.source_system)} · ${escapeHtml(item.collected_at)}</p><p>${escapeHtml(item.summary)}</p></div>`).join("") || `<p class="muted">暂无证据。</p>`}</div>
      </div>
    </section>
  `;
  document.querySelector("#evaluateReleaseBtn").addEventListener("click", evaluateRelease);
}

async function evaluateRelease() {
  const project = currentProject();
  await api(`/api/projects/${project.id}/release-gate/evaluate`, { method: "POST", body: "{}" });
  toast("发布准入已评估");
  await loadBase();
}

async function renderAgents() {
  const project = currentProject();
  const runs = await api(`/api/projects/${project.id}/agent-runs`);
  const activeId = new URLSearchParams(location.hash.split("?")[1] || "").get("agent") || state.agents[0]?.id;
  const active = state.agents.find((agent) => agent.id === activeId) || state.agents[0];
  els.view.innerHTML = `
    <section class="grid agent-layout">
      <div class="panel">
        <div class="panel-head"><h2>8 个阶段 Agent</h2></div>
        <div class="agent-list">${state.agents.map((agent) => `<button class="agent-tab ${agent.id === active.id ? "active" : ""}" data-agent-tab="${agent.id}"><span>${escapeHtml(agent.name)}</span><small>${escapeHtml(agent.stage)} · ${escapeHtml(agent.role)}</small></button>`).join("")}</div>
      </div>
      <div class="panel">
        <div class="panel-head"><h2>${escapeHtml(active.name)}</h2><div>${badge(active.status)} ${badge(active.version)}</div></div>
        <div class="agent-detail">
          <label><span>系统提示词</span><textarea id="agentPrompt">${escapeHtml(active.system_prompt)}</textarea></label>
          <div><h3>挂载 Skills</h3>${agentSkillList(active.skills || state.agentSkills.filter((skill) => skill.agent_id === active.id))}</div>
          <div class="grid two">
            <div><h3>平台能力</h3>${tagList(active.capabilities || [])}</div>
            <div><h3>工具权限</h3>${toolList(active.tool_permissions || [])}</div>
          </div>
          <div class="grid two">
            <div><h3>上下文策略</h3><pre>${escapeHtml(JSON.stringify(active.context_policy, null, 2))}</pre></div>
            <div><h3>评测与维护</h3><pre>${escapeHtml(JSON.stringify(active.maintenance, null, 2))}</pre></div>
          </div>
          <div class="action-row">
            <button id="saveAgentBtn">保存配置</button>
            <button class="primary" id="simulateAgentBtn">按当前项目运行</button>
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><h2>运行审计</h2></div>
        ${agentRunList(runs.agent_runs)}
      </div>
    </section>
  `;
  document.querySelectorAll("[data-agent-tab]").forEach((button) => button.addEventListener("click", () => {
    location.hash = `#/agents?agent=${button.dataset.agentTab}`;
  }));
  document.querySelector("#saveAgentBtn").addEventListener("click", () => saveAgent(active.id));
  document.querySelector("#simulateAgentBtn").addEventListener("click", () => simulateAgent(active.id));
}

function tagList(items) {
  return `<div class="tag-list">${items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>`;
}

function toolList(items) {
  return `<div class="stack">${items.map((item) => `<div class="mini-card"><strong>${escapeHtml(item.tool)}</strong><span>${escapeHtml(item.access)}</span>${item.approval_required ? badge("approval") : ""}</div>`).join("")}</div>`;
}

function agentSkillList(skills) {
  if (!skills.length) return `<p class="muted">该 Agent 暂未挂载 Skill。</p>`;
  return `<div class="card-grid">${skills.map((skill) => `<div class="mini-card rich-card">
    <strong>${escapeHtml(skill.name)}</strong><span class="muted">${escapeHtml(skill.id)}</span>
    <p>${escapeHtml(skill.description)}</p>
    <p><b>输入</b> ${escapeHtml((skill.inputs || []).join(" / "))}</p>
    <p><b>输出</b> ${escapeHtml((skill.outputs || []).join(" / "))}</p>
    <p><b>工具</b> ${escapeHtml((skill.tools || []).join(" / "))}</p>
  </div>`).join("")}</div>`;
}

async function saveAgent(id) {
  await api(`/api/agents/${id}`, {
    method: "PUT",
    body: JSON.stringify({ system_prompt: document.querySelector("#agentPrompt").value }),
  });
  toast("Agent 配置已保存");
  await loadBase();
}

async function simulateAgent(id) {
  const project = currentProject();
  await api(`/api/agents/${id}/simulate`, { method: "POST", body: JSON.stringify({ project_id: project.id }) });
  toast("Agent 已按当前项目上下文运行");
  await loadBase();
}

async function renderIntegrations() {
  const summary = await api("/api/integration-summary");
  const modes = summary.adapter_modes || {};
  els.view.innerHTML = `
    <section class="grid four">
      ${metric("外部系统", summary.integrations.length, "9 类工具对接底座")}
      ${metric("对象映射", summary.external_mappings.length, "外部 ID -> 平台对象")}
      ${metric("Webhook", summary.webhook_events.length, "事件接收与幂等处理")}
      ${metric("ToolRun", summary.tool_runs.length, "触发工具并归一化证据")}
    </section>
    <section class="panel section-gap">
      <div class="panel-head"><h2>外部工具系统对接矩阵</h2><button class="primary" id="simulateWebhookBtn">模拟 Webhook</button></div>
      <div class="integration-modes">
        <div>${badge("Pull API")}<strong>${modes.pull_api || 0}</strong><span>主动拉取 Sonar、Git、缺陷、文档、性能报告</span></div>
        <div>${badge("Webhook API")}<strong>${modes.webhook_api || 0}</strong><span>接收 PR、CI、自动化、部署流水线事件</span></div>
        <div>${badge("Trigger API")}<strong>${modes.trigger_api || 0}</strong><span>触发自动化、数据银行、性能、混沌任务</span></div>
        <div>${badge("Link/Register")}<strong>${modes.link_register || 0}</strong><span>一期先手动登记链接和结果</span></div>
      </div>
      <div class="table-scroll section-gap"><table><thead><tr><th>类别/工具</th><th>对接模式</th><th>预留能力</th><th>归一化对象</th><th>状态</th><th>操作</th></tr></thead><tbody>
        ${summary.integrations.map((item) => `<tr>
          <td><strong>${escapeHtml(item.category || "工具")}</strong><br>${escapeHtml(item.name)}<br><span class="muted">${escapeHtml(item.base_url)}</span></td>
          <td>${escapeHtml(item.integration_mode || "Link/Register")}</td>
          <td>${escapeHtml((item.reserved_capabilities || []).join(" / "))}</td>
          <td>${escapeHtml((item.normalized_objects || []).join(" + "))}</td>
          <td>${badge(item.health_status)}</td>
          <td class="row-actions">
            <button data-health="${item.id}">健康检查</button>
            <button data-sync="${item.id}">同步</button>
            <button data-tool-run="${item.id}" ${["automation", "data_bank", "performance", "chaos"].includes(item.type) ? "" : "disabled"}>触发任务</button>
          </td>
        </tr>`).join("")}
      </tbody></table></div>
    </section>
    <section class="grid two section-gap">
      <div class="panel">
        <div class="panel-head"><h2>外部对象映射</h2></div>
        <div class="table-scroll"><table><thead><tr><th>外部系统</th><th>外部对象</th><th>平台对象</th><th>同步时间</th></tr></thead><tbody>
          ${summary.external_mappings.map((item) => `<tr><td>${escapeHtml(item.external_system)}</td><td>${escapeHtml(item.external_object_type)}<br><span class="muted">${escapeHtml(item.external_object_id)}</span></td><td>${escapeHtml(item.internal_object_type)}<br><span class="muted">${escapeHtml(item.internal_object_id)}</span></td><td>${escapeHtml(item.last_synced_at)}</td></tr>`).join("")}
        </tbody></table></div>
      </div>
      <div class="panel">
        <div class="panel-head"><h2>字段归一化规范</h2></div>
        <div class="stage-list">
          <div class="stage-item"><strong>Git PR</strong><span>PullRequest：repository_id、external_id、status、changed_files</span></div>
          <div class="stage-item"><strong>Sonar</strong><span>SonarResult + QualityEvidence：quality gate、bugs、coverage</span></div>
          <div class="stage-item"><strong>自动化</strong><span>TestExecution + QualityEvidence：total、passed、failed、pass_rate</span></div>
          <div class="stage-item"><strong>数据/性能/混沌/缺陷</strong><span>统一转成 QualityEvidence，供门禁、发布和看板消费</span></div>
        </div>
      </div>
    </section>
    <section class="grid two section-gap">
      <div class="panel">
        <div class="panel-head"><h2>同步任务与 ToolRun</h2></div>
        <div class="table-scroll"><table><thead><tr><th>类型</th><th>工具</th><th>状态</th><th>结果</th></tr></thead><tbody>
          ${summary.sync_jobs.slice(0, 6).map((job) => `<tr><td>Sync<br><span class="muted">${escapeHtml(job.sync_type)}</span></td><td>${escapeHtml(job.integration_id)}</td><td>${badge(job.status)}</td><td>${escapeHtml(job.cursor_value || job.error_message || "")}</td></tr>`).join("")}
          ${summary.tool_runs.slice(0, 6).map((run) => `<tr><td>ToolRun<br><span class="muted">${escapeHtml(run.tool_type)}</span></td><td>${escapeHtml(run.integration_id)}</td><td>${badge(run.status)}</td><td>${escapeHtml(JSON.stringify(run.result || {}))}</td></tr>`).join("")}
        </tbody></table></div>
      </div>
      <div class="panel">
        <div class="panel-head"><h2>Webhook 事件</h2></div>
        <div class="stack">${summary.webhook_events.slice(0, 8).map((event) => `<div class="mini-card rich-card"><strong>${escapeHtml(event.event_type)}</strong>${badge(event.process_status)} ${event.signature_valid ? badge("signature ok") : badge("invalid")}<p class="muted">${escapeHtml(event.integration_id)} · ${escapeHtml(event.received_at)}</p><p>${escapeHtml(event.summary || event.external_event_id)}</p></div>`).join("")}</div>
      </div>
    </section>
    <section class="panel section-gap"><div class="panel-head"><h2>门禁策略</h2></div><div class="stack">${state.policies.map((policy) => `<div class="mini-card rich-card"><strong>${escapeHtml(policy.name)}</strong>${badge(policy.decision)}<p class="muted">${escapeHtml((policy.rules || []).join("；"))}</p></div>`).join("")}</div></section>
  `;
  document.querySelectorAll("[data-health]").forEach((button) => button.addEventListener("click", () => healthCheck(button.dataset.health)));
  document.querySelectorAll("[data-sync]").forEach((button) => button.addEventListener("click", () => syncIntegration(button.dataset.sync)));
  document.querySelectorAll("[data-tool-run]").forEach((button) => button.addEventListener("click", () => triggerToolRun(button.dataset.toolRun)));
  document.querySelector("#simulateWebhookBtn").addEventListener("click", simulateWebhook);
}

async function healthCheck(id) {
  await api(`/api/integrations/${id}/health-check`, { method: "POST", body: "{}" });
  toast("集成健康检查完成");
  await loadBase();
}

async function syncIntegration(id) {
  const project = currentProject();
  await api(`/api/integrations/${id}/sync`, {
    method: "POST",
    body: JSON.stringify({ project_id: project.id, sync_type: "manual_acceptance_sync" }),
  });
  toast("同步任务已完成，结果进入集成底座");
  await loadBase();
}

async function triggerToolRun(id) {
  const project = currentProject();
  await api(`/api/integrations/${id}/tool-runs`, {
    method: "POST",
    body: JSON.stringify({ project_id: project.id, request: { project_id: project.id, source: "acceptance-demo" } }),
  });
  toast("外部工具任务已触发，结果已归一化为证据");
  await loadBase();
}

async function simulateWebhook() {
  await api("/api/webhooks/ci/ci-main", {
    method: "POST",
    body: JSON.stringify({ event_type: "pipeline.finished", summary: "模拟 CI Webhook：构建完成，等待证据归一化" }),
  });
  toast("Webhook 事件已接收并处理");
  await loadBase();
}

async function renderAudit() {
  const response = await api("/api/audit-logs");
  els.view.innerHTML = `<section class="panel"><div class="panel-head"><h2>审计日志</h2></div><div class="table-scroll"><table><thead><tr><th>时间</th><th>动作</th><th>对象</th><th>说明</th><th>操作人</th></tr></thead><tbody>
    ${response.audit_logs.map((log) => `<tr><td>${log.created_at}</td><td>${log.action}</td><td>${log.target}</td><td>${escapeHtml(log.detail)}</td><td>${log.operator}</td></tr>`).join("")}
  </tbody></table></div></section>`;
}

function bindRouteButtons() {
  document.querySelectorAll("[data-route]").forEach((button) => button.addEventListener("click", () => {
    state.route = button.dataset.route;
    location.hash = `#/${state.route}`;
  }));
  document.querySelectorAll("[data-select-project]").forEach((button) => button.addEventListener("click", () => {
    state.selectedProjectId = button.dataset.selectProject;
    state.route = "workspace";
    location.hash = "#/workspace";
    renderShell();
  }));
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    els.toast.hidden = true;
  }, 2600);
}

function handleError(error) {
  console.error(error);
  toast(error.message || "系统异常");
}

window.addEventListener("hashchange", () => {
  state.route = location.hash.replace("#/", "").split("?")[0] || "dashboard";
  renderShell();
});

els.projectContext.addEventListener("change", () => {
  state.selectedProjectId = els.projectContext.value;
  renderRoute().catch(handleError);
});

els.refreshBtn.addEventListener("click", () => loadBase().catch(handleError));

loadBase().catch(handleError);
