import { C, bg, text, metric, pill } from "./common.mjs";

export async function slide01(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, C.navy);
  text(slide, ctx, 60, 48, 560, 20, "CTO REVIEW DRAFT", 12, "#8EC5FF", true);
  text(slide, ctx, 60, 104, 820, 98, "AI Coding 时代测试质量保障工作模式演进", 43, C.white, true);
  text(slide, ctx, 62, 224, 780, 48, "基于现有数据银行、自动化、性能、混沌工程与质量指标，构建风险驱动、AI 辅助、UAT 闭环的质量经营体系。", 18, "#D7E3F5");
  pill(slide, ctx, 62, 318, 150, "风险驱动", "#20345D", C.white);
  pill(slide, ctx, 232, 318, 150, "自动门禁", "#20345D", C.white);
  pill(slide, ctx, 402, 318, 150, "AI 辅助", "#20345D", C.white);
  pill(slide, ctx, 572, 318, 150, "UAT 闭环", "#20345D", C.white);
  ctx.addShape(slide, { x: 846, y: 96, w: 320, h: 410, fill: "#FFFFFF12", line: { style: "solid", fill: "#FFFFFF33", width: 1 }, geometry: "roundRect" });
  metric(slide, ctx, 890, 140, 240, "8 阶段", "SDLC 质量控制", "需求到运行复盘，全链路证据化", "#8EC5FF");
  metric(slide, ctx, 890, 260, 240, "4 平台", "现有能力复用", "数据银行 / 自动化 / 性能 / 混沌", "#8EF0D3");
  metric(slide, ctx, 890, 380, 240, "6 指标", "质量经营抓手", "Sonar、覆盖率、响应时长、缺陷、通过率", "#FFD08A");
  text(slide, ctx, 62, 650, 880, 20, "核心结论：测试团队从用例执行升级为质量门禁建设者和质量经营者，支撑 AI 代码规模化安全交付。", 14, C.white, true);
  return slide;
}
