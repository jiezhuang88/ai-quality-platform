import { C, bg, header, footer, text } from "./common.mjs";

export async function slide03(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, C.white);
  header(slide, ctx, "02 | 工作模式演进", "测试团队从执行测试，升级为经营质量系统", "未来测试价值在于把业务风险变成规则、自动化、AI 能力和线上闭环。");
  const rows = [
    ["过去", "用例执行者", "需求后介入，手工写用例、执行测试、提交缺陷", C.muted, "#EEF2F7"],
    ["现在", "质量门禁建设者", "在 PR 和测试验证阶段建立风险分级、自动化阻断和质量报告", C.blue, C.softBlue],
    ["未来", "AI 时代质量经营者", "编排 AI 测试智能体，经营核心链路质量指标，沉淀缺陷模式库", C.green, C.softGreen],
  ];
  rows.forEach(([tag, role, desc, color, fill], i) => {
    const y = 214 + i * 122;
    ctx.addShape(slide, { x: 80, y, w: 1060, h: 86, fill, line: { style: "solid", fill: C.line, width: 1 }, geometry: "roundRect" });
    ctx.addShape(slide, { x: 110, y: y + 18, w: 50, h: 50, fill: C.white, line: { style: "solid", fill: C.line, width: 1 }, geometry: "ellipse" });
    text(slide, ctx, 119, y + 34, 32, 16, tag, 11, color, true, "center");
    text(slide, ctx, 196, y + 18, 230, 24, role, 20, color, true);
    text(slide, ctx, 196, y + 50, 740, 22, desc, 14, C.ink);
    if (i < 2) text(slide, ctx, 122, y + 89, 28, 24, "↓", 18, C.muted, true, "center");
  });
  text(slide, ctx, 84, 606, 940, 28, "组织建议：测试负责人拥有风险模型、门禁策略、AI 测试 Prompt 和质量看板的治理权。", 16, C.ink, true);
  footer(slide, ctx, 3);
  return slide;
}
