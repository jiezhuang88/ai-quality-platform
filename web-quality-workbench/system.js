const state = {
  agents: [],
  portfolio: null,
  programs: [],
  runs: [],
  selectedProgramId: null,
  selectedAgentId: "test-orchestration-agent",
  currentRun: null,
  selectedStepIndex: 0,
  report: "",
};

const els = {
  programList: document.querySelector("#programList"),
  runList: document.querySelector("#runList"),
  programName: document.querySelector("#programName"),
  programDesc: document.querySelector("#programDesc"),
  riskLevel: document.querySelector("#riskLevel"),
  evidenceScore: document.querySelector("#evidenceScore"),
  decisionText: document.querySelector("#decisionText"),
  stepProgress: document.querySelector("#stepProgress"),
  pipeline: document.querySelector("#pipeline"),
  stepTitle: document.querySelector("#stepTitle"),
  stepStatus: document.querySelector("#stepStatus"),
  stepDetail: document.querySelector("#stepDetail"),
  riskRadar: document.querySelector("#riskRadar"),
  dependencyBoard: document.querySelector("#dependencyBoard"),
  toolTable: document.querySelector("#toolTable"),
  mockData: document.querySelector("#mockData"),
  logStream: document.querySelector("#logStream"),
  agentRegistry: document.querySelector("#agentRegistry"),
  portfolioBoard: document.querySelector("#portfolioBoard"),
  roleBoard: document.querySelector("#roleBoard"),
  intakeProjectBtn: document.querySelector("#intakeProjectBtn"),
  agentSelect: document.querySelector("#agentSelect"),
  saveAgentBtn: document.querySelector("#saveAgentBtn"),
  simulateAgentBtn: document.querySelector("#simulateAgentBtn"),
  agentOwnerInput: document.querySelector("#agentOwnerInput"),
  agentVersionInput: document.querySelector("#agentVersionInput"),
  agentMissionInput: document.querySelector("#agentMissionInput"),
  agentPromptInput: document.querySelector("#agentPromptInput"),
  agentInputSchemaInput: document.querySelector("#agentInputSchemaInput"),
  agentOutputSchemaInput: document.querySelector("#agentOutputSchemaInput"),
  agentToolsInput: document.querySelector("#agentToolsInput"),
  agentPoliciesInput: document.querySelector("#agentPoliciesInput"),
  agentEvalInput: document.querySelector("#agentEvalInput"),
  agentMaintenanceInput: document.querySelector("#agentMaintenanceInput"),
  agentChangeNoteInput: document.querySelector("#agentChangeNoteInput"),
  agentSimulationOutput: document.querySelector("#agentSimulationOutput"),
  reportPreview: document.querySelector("#reportPreview"),
  reportHint: document.querySelector("#reportHint"),
  modeSelect: document.querySelector("#modeSelect"),
  startRunBtn: document.querySelector("#startRunBtn"),
  nextStepBtn: document.querySelector("#nextStepBtn"),
  autoRunBtn: document.querySelector("#autoRunBtn"),
  approveBtn: document.querySelector("#approveBtn"),
  exportBtn: document.querySelector("#exportBtn"),
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

function decisionLabel(decision) {
  const labels = {
    running: "执行中",
    passed: "允许合入",
    blocked: "阻断发布",
    exception_review: "例外评审",
    canary: "灰度放行",
    approved: "人工批准",
  };
  return labels[decision] || decision || "-";
}

function badgeClass(value) {
  if (["passed", "approved", "ok", "done", "success"].includes(value)) {
    return "success";
  }
  if (["blocked", "failed", "reject"].includes(value)) {
    return "danger";
  }
  if (["exception_review", "canary", "warning", "partial"].includes(value)) {
    return "warning";
  }
  return "info";
}

function currentProgram() {
  return state.programs.find((program) => program.id === state.selectedProgramId);
}

function currentRunProgram() {
  if (state.currentRun?.program) return state.currentRun.program;
  return currentProgram();
}

function agentById(agentId) {
  return state.agents.find((agent) => agent.id === agentId);
}

function selectedAgent() {
  return agentById(state.selectedAgentId) || state.agents[0];
}

function prettyJson(value) {
  return JSON.stringify(value ?? {}, null, 2);
}

function parseJsonField(element, label) {
  try {
    return JSON.parse(element.value || "null");
  } catch (error) {
    throw new Error(`${label} 不是合法 JSON`);
  }
}

async function loadData() {
  const [portfolioResponse, agentsResponse, programsResponse, runsResponse] = await Promise.all([
    api("/api/portfolio"),
    api("/api/agents"),
    api("/api/programs"),
    api("/api/runs"),
  ]);
  state.portfolio = portfolioResponse;
  state.agents = agentsResponse.agents || [];
  state.programs = programsResponse.programs || [];
  state.runs = runsResponse.runs || [];
  if (!state.selectedProgramId && state.programs.length > 0) {
    state.selectedProgramId = state.programs[0].id;
  }
  render();
}

async function selectProgram(programId) {
  state.selectedProgramId = programId;
  state.currentRun = null;
  state.selectedStepIndex = 0;
  state.report = "";
  render();
}

async function selectRun(runId) {
  const response = await api(`/api/runs/${runId}`);
  state.currentRun = response.run;
  state.selectedProgramId = response.run.program_id;
  state.selectedStepIndex = Math.min(
    response.run.current_step || 0,
    (response.run.program?.steps?.length || 1) - 1,
  );
  state.report = "";
  render();
}

async function startRun() {
  const program = currentProgram();
  if (!program) return;
  const response = await api("/api/runs/start", {
    method: "POST",
    body: JSON.stringify({
      program_id: program.id,
      mode: els.modeSelect.value,
    }),
  });
  state.currentRun = response.run;
  state.selectedStepIndex = 0;
  await loadData();
  await selectRun(response.run.id);
  toast("已启动全流程 AI Agent 任务");
}

async function nextStep() {
  if (!state.currentRun) return;
  const response = await api(`/api/runs/${state.currentRun.id}/next`, {
    method: "POST",
  });
  state.currentRun = response.run;
  state.selectedStepIndex = Math.min(
    response.run.current_step || 0,
    (response.run.program?.steps?.length || 1) - 1,
  );
  await loadData();
  await selectRun(response.run.id);
  toast("已推进到下一质量阶段");
}

async function autoRun() {
  if (!state.currentRun) return;
  const response = await api(`/api/runs/${state.currentRun.id}/auto`, {
    method: "POST",
  });
  state.currentRun = response.run;
  state.selectedStepIndex = Math.max(0, (response.run.program?.steps?.length || 1) - 1);
  await loadData();
  await selectRun(response.run.id);
  toast("Agent 已自动完成全部阶段");
}

async function approveRun() {
  if (!state.currentRun) return;
  const response = await api(`/api/runs/${state.currentRun.id}/approve`, {
    method: "POST",
  });
  state.currentRun = response.run;
  await loadData();
  await selectRun(response.run.id);
  toast("已记录人工批准与审计日志");
}

async function exportReport() {
  if (!state.currentRun) return;
  const response = await api(`/api/reports/${state.currentRun.id}`);
  state.report = response.report || "";
  els.reportPreview.textContent = state.report;
  els.reportHint.textContent = `报告生成时间：${new Date().toLocaleString()}`;
  await api("/api/report", {
    method: "POST",
    body: JSON.stringify({ markdown: state.report }),
  });
  toast("报告已生成到 reports/ai-quality-report.md");
}

function render() {
  renderPortfolio();
  renderRoles();
  renderPrograms();
  renderRuns();
  renderOverview();
  renderPipeline();
  renderStepDetail();
  renderRisks();
  renderDependencies();
  renderTools();
  renderMockData();
  renderLogs();
  renderAgents();
  renderAgentStudio();
  updateButtons();
}

function renderPrograms() {
  els.programList.innerHTML = state.programs
    .map(
      (program) => `
        <button class="program-card ${program.id === state.selectedProgramId ? "active" : ""}" data-program-id="${escapeHtml(program.id)}">
          <strong>${escapeHtml(program.name)}</strong>
          <div class="meta-line">
            <span class="pill ${badgeClass(program.decision)}">${escapeHtml(program.risk_level)}</span>
            <span>${escapeHtml(program.owner)}</span>
            <span>${escapeHtml(decisionLabel(program.decision))}</span>
          </div>
        </button>
      `,
    )
    .join("");

  els.programList.querySelectorAll("[data-program-id]").forEach((button) => {
    button.addEventListener("click", () => selectProgram(button.dataset.programId));
  });
}

function renderPortfolio() {
  if (!els.portfolioBoard) return;
  const portfolio = state.portfolio;
  if (!portfolio) {
    els.portfolioBoard.innerHTML = `<p class="muted">年度项目组合加载中。</p>`;
    return;
  }
  const summary = portfolio.summary || {};
  const projects = portfolio.projects || [];
  const template = (portfolio.workflow_templates || [])[0] || {};
  els.portfolioBoard.innerHTML = `
    <div class="portfolio-metrics">
      <div class="metric compact"><span>年度承载能力</span><strong>${escapeHtml(summary.annual_capacity || 0)}</strong></div>
      <div class="metric compact"><span>当前台账项目</span><strong>${escapeHtml(summary.current_projects || 0)}</strong></div>
      <div class="metric compact"><span>预计 Agent 执行</span><strong>${escapeHtml(summary.agent_run_forecast || 0)}</strong></div>
      <div class="metric compact"><span>阶段模板</span><strong>${escapeHtml(summary.template_stage_count || 0)}</strong></div>
    </div>
    <div class="template-strip">
      ${(template.stages || [])
        .map(
          (stage, index) => `
            <div class="template-stage">
              <span>${index + 1}</span>
              <strong>${escapeHtml(stage.stage)}</strong>
              <small>${escapeHtml(stage.role)}</small>
            </div>
          `,
        )
        .join("")}
    </div>
    <div class="portfolio-table">
      <table>
        <thead>
          <tr>
            <th>项目</th>
            <th>域</th>
            <th>风险</th>
            <th>季度</th>
            <th>状态</th>
            <th>角色</th>
            <th>Agent 次数</th>
          </tr>
        </thead>
        <tbody>
          ${projects
            .slice(0, 12)
            .map(
              (project) => `
                <tr>
                  <td><strong>${escapeHtml(project.id)}</strong><br />${escapeHtml(project.name)}</td>
                  <td>${escapeHtml(project.domain)}</td>
                  <td><span class="pill ${badgeClass(project.status)}">${escapeHtml(project.risk_level)}</span></td>
                  <td>${escapeHtml(project.quarter)}</td>
                  <td>${escapeHtml(project.status)}</td>
                  <td>${escapeHtml((project.roles || []).join(" / "))}</td>
                  <td>${escapeHtml(project.agent_runs)}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderRoles() {
  if (!els.roleBoard) return;
  const roles = state.portfolio?.role_variants || [];
  if (!roles.length) {
    els.roleBoard.innerHTML = `<p class="muted">暂无角色化 Agent 配置。</p>`;
    return;
  }
  els.roleBoard.innerHTML = roles
    .map(
      (role) => `
        <article class="role-card">
          <div class="role-card-head">
            <strong>${escapeHtml(role.role)}</strong>
            <span class="badge info">${escapeHtml((role.agent_ids || []).length)} Agents</span>
          </div>
          <p>${escapeHtml(role.responsibility)}</p>
          <dl>
            <div><dt>绑定 Agent</dt><dd>${escapeHtml((role.agent_ids || []).join(" / "))}</dd></div>
            <div><dt>审批点</dt><dd>${escapeHtml(role.approval)}</dd></div>
          </dl>
        </article>
      `,
    )
    .join("");
}

function renderRuns() {
  if (!state.runs.length) {
    els.runList.innerHTML = `<p class="muted">暂无执行记录，先启动一个任务。</p>`;
    return;
  }
  els.runList.innerHTML = state.runs
    .map(
      (run) => `
        <button class="run-card ${state.currentRun?.id === run.id ? "active" : ""}" data-run-id="${escapeHtml(run.id)}">
          <strong>${escapeHtml(run.program_name)}</strong>
          <div class="meta-line">
            <span>${escapeHtml(run.id)}</span>
            <span class="pill ${badgeClass(run.decision)}">${escapeHtml(decisionLabel(run.decision))}</span>
            <span>${escapeHtml(run.mode)}</span>
          </div>
        </button>
      `,
    )
    .join("");

  els.runList.querySelectorAll("[data-run-id]").forEach((button) => {
    button.addEventListener("click", () => selectRun(button.dataset.runId));
  });
}

function renderOverview() {
  const program = currentRunProgram();
  const run = state.currentRun;
  els.programName.textContent = program?.name || "-";
  els.programDesc.textContent = program?.description || "请选择项目群并启动 Agent 流程。";
  els.riskLevel.textContent = program?.risk_level || "-";
  els.evidenceScore.textContent = run ? `${run.evidence_score}` : "-";
  els.decisionText.textContent = decisionLabel(run?.decision || program?.decision);
  const total = program?.steps?.length || 0;
  const done = run ? Math.min((run.current_step || 0) + 1, total) : 0;
  els.stepProgress.textContent = total ? `${done}/${total}` : "-";
}

function renderPipeline() {
  const program = currentRunProgram();
  const steps = program?.steps || [];
  if (!steps.length) {
    els.pipeline.innerHTML = "";
    return;
  }
  const currentStep = state.currentRun?.current_step ?? -1;
  const isFinalBlocked = state.currentRun?.decision === "blocked";
  els.pipeline.innerHTML = steps
    .map((step, index) => {
      const status =
        index < currentStep ? "done" : index === currentStep ? "current" : "pending";
      const blocked = isFinalBlocked && index === currentStep ? "blocked" : "";
      return `
        <button class="pipe-step ${status} ${blocked}" data-step-index="${index}">
          <span class="pipe-index">${index + 1}</span>
          <strong>${escapeHtml(step.name)}</strong>
          <span>${escapeHtml(step.agent)} · ${escapeHtml(step.stage)}</span>
        </button>
      `;
    })
    .join("");

  els.pipeline.querySelectorAll("[data-step-index]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedStepIndex = Number(button.dataset.stepIndex);
      renderPipeline();
      renderStepDetail();
    });
  });
}

function renderStepDetail() {
  const program = currentRunProgram();
  const step = program?.steps?.[state.selectedStepIndex];
  const agent = agentById(step?.agent_id);
  if (!step) {
    els.stepTitle.textContent = "等待启动";
    els.stepStatus.textContent = "未开始";
    els.stepStatus.className = "badge";
    els.stepDetail.innerHTML = `<p class="muted">选择项目群后启动任务，系统会从需求澄清、影响分析、测试设计、环境数据、自动化执行到发布门禁全流程推进。</p>`;
    return;
  }

  const currentStep = state.currentRun?.current_step ?? -1;
  const status =
    state.selectedStepIndex < currentStep
      ? "已完成"
      : state.selectedStepIndex === currentStep
        ? "执行中"
        : "待执行";
  els.stepTitle.textContent = step.name;
  els.stepStatus.textContent = status;
  els.stepStatus.className = `badge ${
    status === "已完成" ? "success" : status === "执行中" ? "info" : ""
  }`;

  els.stepDetail.innerHTML = `
    <div class="detail-box">
      <strong>责任 Agent</strong>
      <p>${escapeHtml(step.agent)}${agent ? ` · ${escapeHtml(agent.version)}` : ""}</p>
    </div>
    <div class="detail-box">
      <strong>输入资产</strong>
      <p>${escapeHtml(step.input)}</p>
    </div>
    <div class="detail-box">
      <strong>输出资产</strong>
      <p>${escapeHtml(step.output)}</p>
    </div>
    <div class="detail-box">
      <strong>门禁规则</strong>
      <p>${escapeHtml(step.gate)}</p>
    </div>
    <div class="detail-box">
      <strong>沉淀证据</strong>
      <p>${escapeHtml(step.artifact)}</p>
    </div>
    <div class="detail-box">
      <strong>协同对象</strong>
      <p>${escapeHtml((step.collaborators || []).join("、"))}</p>
    </div>
    <div class="detail-box">
      <strong>人工确认点</strong>
      <p>${escapeHtml(agent?.human_checkpoint || "按阶段风险等级触发人工确认")}</p>
    </div>
    <div class="detail-box">
      <strong>工具权限</strong>
      <p>${escapeHtml((agent?.tools || []).join("、"))}</p>
    </div>
  `;
}

function renderRisks() {
  const program = currentRunProgram();
  const risks = program?.risks || [];
  els.riskRadar.innerHTML = risks
    .map(
      (risk) => `
        <div class="risk-row">
          <span>${escapeHtml(risk.name)}</span>
          <div class="bar"><span style="width:${Number(risk.score) || 0}%"></span></div>
          <strong>${escapeHtml(risk.score)}</strong>
        </div>
      `,
    )
    .join("");
}

function renderDependencies() {
  const program = currentRunProgram();
  const dependencies = program?.dependencies || [];
  els.dependencyBoard.innerHTML = dependencies
    .map(
      (item) => `
        <div class="dependency-item">
          <strong>${escapeHtml(item.name)}</strong>
          <p>${escapeHtml(item.owner)} · <span class="pill ${badgeClass(item.status)}">${escapeHtml(item.status)}</span></p>
        </div>
      `,
    )
    .join("");
}

function renderTools() {
  const program = currentRunProgram();
  const tools = program?.tools || [];
  if (!tools.length) {
    els.toolTable.innerHTML = `<p class="muted">暂无工具数据。</p>`;
    return;
  }
  els.toolTable.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>工具平台</th>
          <th>指标/证据</th>
          <th>阈值</th>
          <th>当前结果</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        ${tools
          .map(
            (tool) => `
              <tr>
                <td>${escapeHtml(tool.name)}</td>
                <td>${escapeHtml(tool.metric)}</td>
                <td>${escapeHtml(tool.threshold)}</td>
                <td>${escapeHtml(tool.value)}</td>
                <td><span class="pill ${badgeClass(tool.status)}">${escapeHtml(tool.status)}</span></td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderMockData() {
  const program = currentRunProgram();
  const data = program?.mock_data || [];
  els.mockData.innerHTML = data
    .map(
      (item) => `
        <div class="data-item">
          <strong>${escapeHtml(item.name)}</strong>
          <p>${escapeHtml(item.value)}</p>
        </div>
      `,
    )
    .join("");
}

function renderLogs() {
  const logs = state.currentRun?.logs || [];
  if (!logs.length) {
    els.logStream.innerHTML = `<p class="muted">任务启动后展示 Agent 执行日志。</p>`;
    return;
  }
  els.logStream.innerHTML = logs
    .slice()
    .reverse()
    .map((log) => {
      const item =
        typeof log === "string"
          ? { time: log.slice(0, 19), message: log.slice(20) || log }
          : log;
      return `
        <div class="log-item">
          <time>${escapeHtml(item.time)}</time>
          <div>${escapeHtml(item.message)}</div>
        </div>
      `;
    })
    .join("");
}

function renderAgents() {
  if (!els.agentRegistry) return;
  const program = currentRunProgram();
  const activeAgentIds = new Set((program?.steps || []).map((step) => step.agent_id));
  if (!state.agents.length) {
    els.agentRegistry.innerHTML = `<p class="muted">暂无 Agent 维护信息。</p>`;
    return;
  }

  els.agentRegistry.innerHTML = state.agents
    .map((agent) => {
      const active = activeAgentIds.has(agent.id);
      return `
        <article class="agent-card ${active ? "active" : ""}">
          <div class="agent-card-head">
            <div>
              <span class="pill ${active ? "success" : "info"}">${escapeHtml(agent.stage)}</span>
              <strong>${escapeHtml(agent.name)}</strong>
            </div>
            <span class="badge ${badgeClass(agent.status)}">${escapeHtml(agent.version)}</span>
          </div>
          <p>${escapeHtml(agent.mission)}</p>
          <dl>
            <div><dt>维护 Owner</dt><dd>${escapeHtml(agent.owner_role)}</dd></div>
            <div><dt>输入契约</dt><dd>${escapeHtml((agent.input_contract || []).join(" / "))}</dd></div>
            <div><dt>输出契约</dt><dd>${escapeHtml((agent.output_contract || []).join(" / "))}</dd></div>
            <div><dt>交接下游</dt><dd>${escapeHtml((agent.handoff_to || []).join(" → "))}</dd></div>
            <div><dt>强制门禁</dt><dd>${escapeHtml((agent.guardrails || []).join("；"))}</dd></div>
            <div><dt>评估指标</dt><dd>${escapeHtml((agent.eval_metrics || []).join(" / "))}</dd></div>
          </dl>
        </article>
      `;
    })
    .join("");
}

function renderAgentStudio() {
  if (!els.agentSelect || !state.agents.length) return;
  if (!state.selectedAgentId || !agentById(state.selectedAgentId)) {
    state.selectedAgentId = "test-orchestration-agent";
  }
  if (!agentById(state.selectedAgentId)) {
    state.selectedAgentId = state.agents[0].id;
  }
  const agent = selectedAgent();

  els.agentSelect.innerHTML = state.agents
    .map(
      (item) => `
        <option value="${escapeHtml(item.id)}" ${item.id === agent.id ? "selected" : ""}>
          ${escapeHtml(item.stage)} · ${escapeHtml(item.name)}
        </option>
      `,
    )
    .join("");

  els.agentOwnerInput.value = agent.owner_role || "";
  els.agentVersionInput.value = agent.version || "";
  els.agentMissionInput.value = agent.mission || "";
  els.agentPromptInput.value = agent.system_prompt || "";
  els.agentInputSchemaInput.value = prettyJson(agent.input_schema);
  els.agentOutputSchemaInput.value = prettyJson(agent.output_schema);
  els.agentToolsInput.value = prettyJson(agent.tool_permissions);
  els.agentPoliciesInput.value = prettyJson(agent.policy_rules);
  els.agentEvalInput.value = prettyJson(agent.eval_cases);
  els.agentMaintenanceInput.value = prettyJson(agent.maintenance);
}

async function saveAgentConfig() {
  const agent = selectedAgent();
  if (!agent) return;
  const payload = {
    owner_role: els.agentOwnerInput.value.trim(),
    version: els.agentVersionInput.value.trim(),
    mission: els.agentMissionInput.value.trim(),
    system_prompt: els.agentPromptInput.value.trim(),
    input_schema: parseJsonField(els.agentInputSchemaInput, "输入 Schema"),
    output_schema: parseJsonField(els.agentOutputSchemaInput, "输出 Schema"),
    tool_permissions: parseJsonField(els.agentToolsInput, "工具权限"),
    policy_rules: parseJsonField(els.agentPoliciesInput, "策略规则"),
    eval_cases: parseJsonField(els.agentEvalInput, "评测用例"),
    maintenance: parseJsonField(els.agentMaintenanceInput, "维护机制"),
    change_note: els.agentChangeNoteInput.value.trim(),
  };
  const response = await api(`/api/agents/${agent.id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  const index = state.agents.findIndex((item) => item.id === agent.id);
  if (index >= 0) state.agents[index] = response.agent;
  els.agentChangeNoteInput.value = "";
  renderAgents();
  renderAgentStudio();
  toast("Agent 配置已保存");
}

async function simulateAgent() {
  const agent = selectedAgent();
  if (!agent) return;
  const program = currentRunProgram() || currentProgram();
  const response = await api(`/api/agents/${agent.id}/simulate`, {
    method: "POST",
    body: JSON.stringify({ program_id: program?.id }),
  });
  els.agentSimulationOutput.textContent = prettyJson(response.result);
  toast("Agent 试运行完成");
}

async function intakeProject() {
  const next = (state.portfolio?.summary?.current_projects || 0) + 1;
  await api("/api/projects/intake", {
    method: "POST",
    body: JSON.stringify({
      name: `年度质量保障接入项目 ${next}`,
      domain: next % 3 === 0 ? "交易" : next % 3 === 1 ? "履约" : "数据",
      risk_level: next % 5 === 0 ? "L4" : next % 2 === 0 ? "L3" : "L2",
      quarter: ["Q1", "Q2", "Q3", "Q4"][next % 4],
      roles: next % 5 === 0
        ? ["产品 Owner", "研发 Owner", "QA Owner", "架构 Owner", "发布经理", "质量运营"]
        : ["产品 Owner", "研发 Owner", "QA Owner", "发布经理"],
    }),
  });
  await loadData();
  toast("新项目已接入年度质量保障台账");
}

function updateButtons() {
  const hasProgram = Boolean(currentProgram());
  const hasRun = Boolean(state.currentRun);
  const totalSteps = state.currentRun?.program?.steps?.length || 0;
  const finished = hasRun && state.currentRun.current_step >= totalSteps - 1;
  els.startRunBtn.disabled = !hasProgram;
  els.nextStepBtn.disabled = !hasRun || finished;
  els.autoRunBtn.disabled = !hasRun || finished;
  els.approveBtn.disabled = !hasRun || state.currentRun.decision !== "exception_review";
  els.exportBtn.disabled = !hasRun;
  if (!state.report) {
    els.reportPreview.textContent = hasRun
      ? "点击“生成报告”可输出本次运行的质量门禁报告，并落盘到 reports/ai-quality-report.md。"
      : "暂无运行报告。";
  }
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.hidden = false;
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => {
    els.toast.hidden = true;
  }, 2600);
}

function bindEvents() {
  els.startRunBtn.addEventListener("click", () => startRun().catch(handleError));
  els.nextStepBtn.addEventListener("click", () => nextStep().catch(handleError));
  els.autoRunBtn.addEventListener("click", () => autoRun().catch(handleError));
  els.approveBtn.addEventListener("click", () => approveRun().catch(handleError));
  els.exportBtn.addEventListener("click", () => exportReport().catch(handleError));
  els.refreshBtn.addEventListener("click", () => loadData().catch(handleError));
  els.intakeProjectBtn.addEventListener("click", () => intakeProject().catch(handleError));
  els.agentSelect.addEventListener("change", () => {
    state.selectedAgentId = els.agentSelect.value;
    renderAgentStudio();
  });
  els.saveAgentBtn.addEventListener("click", () => saveAgentConfig().catch(handleError));
  els.simulateAgentBtn.addEventListener("click", () => simulateAgent().catch(handleError));
}

function handleError(error) {
  console.error(error);
  toast(error.message || "系统异常");
}

bindEvents();
loadData().catch(handleError);
