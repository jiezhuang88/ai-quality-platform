import { C, bg, title, footer, metric, card } from "./common.mjs";

export async function slide10(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, C.paper);
  title(slide, ctx, "09 | EXECUTIVE ASK", "需要高管批准的不是一个工具，而是一套 AI 代码质量经营机制", "用指标衡量收益，用门禁控制风险，用复盘持续改进。");
  metric(slide, ctx, 72, 210, 230, "缺陷逃逸率", "核心质量指标", "衡量生产缺陷是否被前置拦截", C.red);
  metric(slide, ctx, 330, 210, 230, "AI 变更失败率", "AI 专属指标", "衡量 AI 代码质量和 Prompt 体系成熟度", C.amber);
  metric(slide, ctx, 588, 210, 230, "回归通过率", "自动化可信度", "衡量测试资产是否稳定保护核心链路", C.blue);
  metric(slide, ctx, 846, 210, 230, "恢复时间", "韧性指标", "衡量高风险变更出问题后的恢复能力", C.green);
  card(slide, ctx, 72, 418, 332, 118, "决策 1：流程纳入", "所有 AI 参与代码必须进入 PR 门禁，禁止绕过主干保护。", C.blue);
  card(slide, ctx, 444, 418, 332, 118, "决策 2：平台投入", "建设自动化测试、扫描、AI 分析和质量报告能力。", C.green);
  card(slide, ctx, 816, 418, 332, 118, "决策 3：组织授权", "测试工程师负责门禁规则，开发、安全、架构共同承担证据。", C.amber);
  ctx.addText(slide, { x: 74, y: 606, w: 1010, h: 28, text: "预期结果：在不显著牺牲交付速度的前提下，让 AI 代码的合并风险可见、可控、可追责。", fontSize: 17, bold: true, color: C.ink });
  footer(slide, ctx, 10);
  return slide;
}
