import { C, bg, title, footer, lane } from "./common.mjs";

export async function slide03(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, C.white);
  title(slide, ctx, "02 | TARGET MODEL", "建设目标：把 AI 代码纳入可治理、可审计、可度量的质量系统", "从“人盯代码”升级为“系统守门 + AI 辅助 + 人工裁决”。");
  const layers = [
    ["治理层", "PR 模板、风险矩阵、AI 使用说明、质量责任、审批策略", C.softBlue, C.blue],
    ["执行层", "CI 自动测试、静态扫描、安全扫描、依赖扫描、覆盖率与回归选择", C.softGreen, C.green],
    ["智能层", "AI 分析 diff、生成测试建议、识别边界条件、总结 PR 风险、分析失败日志", C.softAmber, C.amber],
    ["反馈层", "DORA 指标、缺陷逃逸率、AI 变更失败率、复盘与门禁规则迭代", C.softRed, C.red],
  ];
  layers.forEach(([name, body, fill, color], i) => {
    const y = 202 + i * 104;
    lane(slide, ctx, 82, y, 210, 72, name, fill, color);
    ctx.addText(slide, { x: 320, y: y + 14, w: 830, h: 46, text: body, fontSize: 18, color: C.ink });
    if (i < layers.length - 1) ctx.addText(slide, { x: 180, y: y + 75, w: 28, h: 26, text: "↓", fontSize: 20, color: C.muted, align: "center" });
  });
  ctx.addText(slide, { x: 82, y: 622, w: 950, h: 28, text: "高管视角：这不是单个测试工具采购，而是 AI 时代软件交付的质量操作系统。", fontSize: 17, bold: true, color: C.ink });
  footer(slide, ctx, 3);
  return slide;
}
