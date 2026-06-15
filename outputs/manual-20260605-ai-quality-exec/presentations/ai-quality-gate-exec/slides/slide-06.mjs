import { C, bg, title, footer, card } from "./common.mjs";

export async function slide06(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, C.paper);
  title(slide, ctx, "05 | AUTOMATION + AI TESTING", "自动化负责快速阻断，AI 负责发现测试盲区，人负责最终裁决", "把 AI 从“代码生成者”扩展为“测试增强助手”，但不让 AI 单独决定放行。");
  const leftX = 70;
  const rightX = 720;
  card(slide, ctx, leftX, 198, 500, 92, "CI/CD 自动门禁", "单元测试、接口/集成、契约、E2E、静态扫描、密钥扫描、依赖扫描、覆盖率检查。", C.blue);
  card(slide, ctx, leftX, 318, 500, 92, "AI 辅助测试分析", "分析 PR diff、识别影响范围、生成边界场景、建议回归范围、分析失败日志。", C.amber);
  card(slide, ctx, leftX, 438, 500, 92, "人工质量裁决", "确认业务语义、判断风险等级、审核 AI 测试质量、处理例外发布。", C.green);
  ctx.addShape(slide, { x: 620, y: 254, w: 70, h: 2, fill: C.line, line: ctx.line() });
  ctx.addText(slide, { x: 626, y: 232, w: 58, h: 24, text: "证据", fontSize: 13, bold: true, color: C.muted, align: "center" });
  ctx.addShape(slide, { x: rightX, y: 202, w: 370, h: 330, fill: C.white, line: { style: "solid", fill: C.line, width: 1 }, geometry: "roundRect" });
  ctx.addText(slide, { x: rightX + 28, y: 226, w: 310, h: 26, text: "每个 PR 输出质量报告", fontSize: 20, bold: true, color: C.ink });
  ["风险等级", "必须补充测试", "自动化执行结果", "安全/依赖扫描", "AI 评审结论", "人工 Review 结论", "是否允许合并"].forEach((item, i) => {
    ctx.addText(slide, { x: rightX + 34, y: 278 + i * 35, w: 292, h: 20, text: `✓ ${item}`, fontSize: 14, color: C.ink });
  });
  footer(slide, ctx, 6);
  return slide;
}
