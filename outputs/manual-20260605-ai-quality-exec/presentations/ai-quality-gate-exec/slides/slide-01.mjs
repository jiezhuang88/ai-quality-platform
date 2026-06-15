import { C, bg, metric, pill } from "./common.mjs";

export async function slide01(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, C.navy);
  ctx.addShape(slide, { x: 0, y: 0, w: 1280, h: 720, fill: C.navy, line: ctx.line() });
  ctx.addShape(slide, { x: 0, y: 0, w: 1280, h: 720, fill: "#00000000", line: ctx.line() });
  ctx.addText(slide, { x: 60, y: 58, w: 650, h: 26, text: "EXECUTIVE BRIEFING", fontSize: 13, bold: true, color: "#8EC5FF" });
  ctx.addText(slide, { x: 60, y: 118, w: 760, h: 126, text: "AI 大量提交代码时代的质量门禁建设方案", fontSize: 42, bold: true, color: C.white, typeface: ctx.fonts.title });
  ctx.addText(slide, { x: 62, y: 270, w: 740, h: 58, text: "用风险分级、自动化测试与 AI 辅助评审，建立一套让 AI 代码不能带病合并、不能带病上线的工程治理体系。", fontSize: 20, color: "#D7E3F5" });
  pill(slide, ctx, 62, 364, 178, "统一准入", "#20345D", C.white);
  pill(slide, ctx, 258, 364, 178, "风险分级", "#20345D", C.white);
  pill(slide, ctx, 454, 364, 178, "自动门禁", "#20345D", C.white);
  pill(slide, ctx, 650, 364, 178, "持续度量", "#20345D", C.white);
  ctx.addShape(slide, { x: 850, y: 96, w: 318, h: 410, fill: "#FFFFFF12", line: { style: "solid", fill: "#FFFFFF33", width: 1 }, geometry: "roundRect" });
  metric(slide, ctx, 890, 138, 250, "4 层", "门禁强度", "低 / 中 / 高 / 严重风险动态放行", "#8EC5FF");
  metric(slide, ctx, 890, 258, 250, "9 类", "自动证据", "测试、扫描、覆盖率、供应链、监控", "#8EF0D3");
  metric(slide, ctx, 890, 378, 250, "90 天", "落地周期", "从规则到平台化质量治理", "#FFD08A");
  ctx.addText(slide, { x: 62, y: 650, w: 620, h: 20, text: "建议决策：批准建立 AI 代码质量门禁机制，并纳入 PR / CI / 发布流程。", fontSize: 14, bold: true, color: "#FFFFFF" });
  return slide;
}
