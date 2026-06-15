const C = {
  navy: "#14213D",
  ink: "#1D2430",
  muted: "#667085",
  blue: "#2457B7",
  cyan: "#0EA5B7",
  green: "#147A52",
  amber: "#B26300",
  red: "#B42318",
  line: "#D8DEE8",
  paper: "#F6F8FB",
  white: "#FFFFFF",
  softBlue: "#EAF2FF",
  softGreen: "#EAF7EF",
  softAmber: "#FFF4E5",
  softRed: "#FFF0ED",
};

function bg(slide, ctx, color = C.paper) {
  ctx.addShape(slide, { x: 0, y: 0, w: ctx.W, h: ctx.H, fill: color, line: ctx.line() });
}

function text(slide, ctx, x, y, w, h, value, size, color = C.ink, bold = false, align = "left") {
  return ctx.addText(slide, {
    x, y, w, h, text: value, fontSize: size, color, bold, align,
    typeface: bold ? ctx.fonts.title : ctx.fonts.body,
  });
}

function panel(slide, ctx, x, y, w, h, title, fill = C.white, accent = C.blue) {
  ctx.addShape(slide, { x, y, w, h, fill, line: { style: "solid", fill: C.line, width: 1 }, geometry: "roundRect" });
  ctx.addShape(slide, { x, y, w: 5, h, fill: accent, line: ctx.line() });
  text(slide, ctx, x + 18, y + 14, w - 36, 24, title, 15, accent, true);
}

function pill(slide, ctx, x, y, w, label, fill, color = C.ink) {
  ctx.addShape(slide, { x, y, w, h: 28, fill, line: { style: "solid", fill, width: 1 }, geometry: "roundRect" });
  text(slide, ctx, x + 8, y + 7, w - 16, 14, label, 10.5, color, true, "center");
}

export async function slide01(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, C.paper);

  ctx.addShape(slide, { x: 0, y: 0, w: 1280, h: 92, fill: C.navy, line: ctx.line() });
  text(slide, ctx, 48, 20, 770, 34, "未来测试质量保障：从测试执行到 AI 时代质量经营", 27, C.white, true);
  text(slide, ctx, 870, 28, 330, 22, "面向 CTO 的工作模式演进建议", 13, "#D7E3F5", true, "right");
  text(slide, ctx, 48, 62, 860, 18, "核心判断：AI 提升代码产出速度，测试团队必须把业务风险转化为规则、自动化、AI 智能体与线上闭环。", 12.5, "#D7E3F5");

  // Left: evolution
  panel(slide, ctx, 48, 126, 330, 500, "1. 工作模式演进", C.white, C.blue);
  const stages = [
    ["过去", "用例执行者", "需求后介入，手工验证功能正确性", C.muted],
    ["现在", "质量门禁建设者", "PR 阶段风险分级，自动化阻断缺失证据", C.blue],
    ["未来", "质量经营者", "编排 AI 测试智能体，经营线上质量指标", C.green],
  ];
  stages.forEach(([tag, head, body, color], i) => {
    const y = 178 + i * 126;
    ctx.addShape(slide, { x: 75, y, w: 70, h: 70, fill: i === 0 ? "#EEF2F7" : i === 1 ? C.softBlue : C.softGreen, line: ctx.line(), geometry: "ellipse" });
    text(slide, ctx, 84, y + 24, 52, 20, tag, 13, color, true, "center");
    text(slide, ctx, 166, y + 8, 180, 24, head, 17, C.ink, true);
    text(slide, ctx, 166, y + 38, 170, 34, body, 11.5, C.muted);
    if (i < 2) text(slide, ctx, 105, y + 78, 20, 24, "↓", 18, C.muted, true, "center");
  });
  text(slide, ctx, 76, 560, 260, 40, "组织变化：测试不再靠人力线性扩张，而是负责质量规则、平台和 AI 测试能力。", 12.5, C.ink, true);

  // Center: operating loop
  panel(slide, ctx, 410, 126, 430, 500, "2. AI Coding 质量保障闭环", C.white, C.green);
  const loop = [
    ["业务风险建模", "电商核心链路、资损、库存、履约、风控"],
    ["AI 编码约束", "Prompt 规则、禁止范围、高风险模块清单"],
    ["PR 质量门禁", "风险分级、自动测试、安全扫描、证据报告"],
    ["AI 辅助测试", "Diff 分析、用例生成、回归推荐、日志归因"],
    ["发布与线上监控", "灰度、回滚、业务指标、异常告警"],
    ["缺陷模式反哺", "回归用例、Prompt 约束、门禁规则更新"],
  ];
  loop.forEach(([head, body], i) => {
    const x = 438 + (i % 2) * 190;
    const y = 178 + Math.floor(i / 2) * 116;
    ctx.addShape(slide, { x, y, w: 164, h: 84, fill: i < 2 ? C.softBlue : i < 4 ? C.softAmber : C.softGreen, line: { style: "solid", fill: C.line, width: 1 }, geometry: "roundRect" });
    text(slide, ctx, x + 12, y + 12, 140, 18, head, 13, C.ink, true);
    text(slide, ctx, x + 12, y + 36, 140, 36, body, 9.6, C.muted);
    if (i % 2 === 0) text(slide, ctx, x + 166, y + 24, 24, 24, "→", 16, C.muted, true, "center");
  });
  text(slide, ctx, 444, 548, 350, 38, "关键机制：风险等级决定门禁强度；AI 负责辅助发现盲区，人负责业务风险裁决。", 13, C.green, true);

  // Right: case proof
  panel(slide, ctx, 872, 126, 360, 500, "3. 实际 Case：优惠券叠加规则", C.white, C.amber);
  pill(slide, ctx, 900, 176, 86, "高风险", C.softRed, C.red);
  pill(slide, ctx, 996, 176, 120, "可能资损", C.softAmber, C.amber);
  pill(slide, ctx, 1124, 176, 70, "需灰度", C.softBlue, C.blue);
  text(slide, ctx, 902, 228, 280, 38, "需求：平台券+店铺券可叠加，新人券不能与满减叠加，退款按优惠比例分摊。", 12.5, C.ink, true);
  const caseRows = [
    ["风险识别", "金额、优惠资产、支付金额、退款分摊、并发使用"],
    ["AI 约束", "不得改支付入账；金额用 BigDecimal；必须补负金额/互斥/退款测试"],
    ["PR 门禁", "单测+契约+金额回归+AI diff 分析；缺退款分摊测试即阻断"],
    ["上线保护", "优惠开关、灰度发布、订单/支付金额对账、异常告警"],
    ["复盘沉淀", "优惠规则模板、金额一致性脚本、PR 自动高风险标记"],
  ];
  caseRows.forEach(([head, body], i) => {
    const y = 292 + i * 56;
    text(slide, ctx, 904, y, 78, 18, head, 12.5, i < 3 ? C.blue : C.green, true);
    text(slide, ctx, 994, y, 190, 32, body, 10.2, C.muted);
  });
  ctx.addShape(slide, { x: 898, y: 572, w: 294, h: 42, fill: C.navy, line: ctx.line(), geometry: "roundRect" });
  text(slide, ctx, 910, 583, 270, 22, "CTO 决策点：批准建设风险驱动质量平台 + AI 测试智能体能力", 10.5, C.white, true, "center");

  ctx.addShape(slide, { x: 48, y: 660, w: 1140, h: 1.1, fill: C.line, line: ctx.line() });
  text(slide, ctx, 48, 674, 760, 18, "落地路径：先建业务风险地图和 PR 门禁，再补核心链路自动化，随后接入 AI 测试分析与线上质量闭环。", 11, C.muted);
  text(slide, ctx, 1100, 674, 100, 18, "1 page", 10, C.muted, false, "right");
  return slide;
}
