import { C, bg, text, pill, footer } from "./common.mjs";

export async function slide01(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, C.navy);

  text(slide, ctx, 58, 42, 560, 20, "CTO REVIEW DRAFT | WHOLE-R&D PLATFORM", 11.5, "#9EC9FF", true);
  text(slide, ctx, 58, 92, 860, 92, "AI 时代研发协同与质量工程平台建设方案", 39, C.white, true);
  text(slide, ctx, 60, 208, 800, 60, "老板的核心诉求不是“QA 怎么测试 AI 代码”，而是让产品、研发、测试、发布、业务验收在同一平台上协同，让 AI 带来的效率增益不以质量和稳定性失控为代价。", 16.2, "#D7E3F5");

  const chips = [
    ["流程协同", 60, 112], ["工具协同", 194, 112], ["AI Agent 协同", 328, 146], ["质量风险治理", 496, 146], ["研发经营", 664, 112],
  ];
  chips.forEach(([label, x, w]) => pill(slide, ctx, x, 294, w, label, "#20345D", C.white));

  const shifts = [
    ["过去", "QA 后置验证", "需求、开发、测试、发布割裂；风险在测试阶段集中暴露"],
    ["现在", "工具平台分散支撑", "数据银行、自动化、性能、混沌、Sonar 等能力已有，但协同链路未完全打通"],
    ["未来", "研发协同操作系统", "平台编排流程，AI 辅助决策，证据驱动放行，持续沉淀组织知识"],
  ];
  shifts.forEach(([stage, title, desc], i) => {
    const x = 62 + i * 266;
    const fill = i === 2 ? "#163763" : "#FFFFFF12";
    const stroke = i === 2 ? C.walmartYellow : "#FFFFFF30";
    ctx.addShape(slide, { x, y: 378, w: 232, h: 144, fill, line: { style: "solid", fill: stroke, width: 1.2 }, geometry: "roundRect" });
    text(slide, ctx, x + 18, 398, 70, 18, stage, 12, i === 2 ? C.walmartYellow : "#9EC9FF", true);
    text(slide, ctx, x + 18, 430, 190, 24, title, 16.5, C.white, true);
    text(slide, ctx, x + 18, 468, 190, 36, desc, 9.4, "#D7E3F5");
  });

  ctx.addShape(slide, { x: 888, y: 102, w: 308, h: 468, fill: "#FFFFFF12", line: { style: "solid", fill: "#FFFFFF33", width: 1 }, geometry: "roundRect" });
  text(slide, ctx, 922, 134, 244, 24, "建设目标", 18, C.walmartYellow, true, "center");
  const goals = [
    ["1 条作业流", "需求到复盘端到端打通", "统一入口、统一状态、统一证据", "#9EC9FF", 186],
    ["3 类协同", "流程 / 工具 / 智能体", "跨产品、研发、QA、业务验收", "#8EF0D3", 300],
    ["1 个 cockpit", "研发经营与风险决策", "效率、质量、稳定性、成本统一度量", "#FFD98A", 414],
  ];
  goals.forEach(([value, label, note, color, y]) => {
    text(slide, ctx, 924, y, 238, 36, value, 27, color, true);
    text(slide, ctx, 924, y + 40, 238, 18, label, 11.5, C.white, true);
    text(slide, ctx, 924, y + 62, 238, 28, note, 9.2, "#D7E3F5");
  });

  text(slide, ctx, 62, 620, 980, 24, "核心结论：未来平台不是 QA 工具箱，而是面向全研发团队的协同生产系统，让每一次 AI 代码变更都可评估、可验证、可追踪、可复盘。", 14.1, C.white, true);
  footer(slide, ctx, 1);
  return slide;
}
