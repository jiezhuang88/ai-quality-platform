import { C, bg, title, footer, card, metric } from "./common.mjs";

export async function slide02(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, C.paper);
  title(slide, ctx, "01 | WHY NOW", "AI 编码速度正在超过传统质量控制能力", "问题不是 AI 写得太快，而是现有 Review 和测试机制无法线性扩容。");
  metric(slide, ctx, 74, 218, 260, "产出速度", "显著提升", "AI 可在短时间内生成大量实现、测试和重构代码", C.blue);
  metric(slide, ctx, 390, 218, 260, "隐性风险", "同步上升", "错误假设、伪测试、越权、安全和依赖风险更难靠肉眼发现", C.red);
  metric(slide, ctx, 706, 218, 260, "人工 Review", "成为瓶颈", "逐行检查无法匹配 AI 代码提交频率", C.amber);
  ctx.addShape(slide, { x: 74, y: 412, w: 1060, h: 2, fill: C.line, line: ctx.line() });
  card(slide, ctx, 74, 462, 330, 118, "核心矛盾", "AI 提高交付速度，但如果缺少自动化门禁，质量风险会从开发阶段转移到生产阶段。", C.red);
  card(slide, ctx, 440, 462, 330, 118, "管理挑战", "高管需要看到每次 AI 代码合并的风险等级、质量证据和可追溯责任。", C.amber);
  card(slide, ctx, 806, 462, 330, 118, "解决方向", "用风险分级决定门禁强度，用自动化和 AI 辅助测试提升反馈速度。", C.green);
  footer(slide, ctx, 2);
  return slide;
}
