import { C, bg, title, footer } from "./common.mjs";

export async function slide04(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, C.paper);
  title(slide, ctx, "03 | EXECUTION FLOW", "阶段流程：每一次 AI 代码提交都必须形成质量证据链", "门禁前移到 PR 阶段，阻断风险代码进入主干。");
  const steps = [
    ["需求/变更", "明确目标"],
    ["AI 编码", "记录参与范围"],
    ["提交 PR", "进入准入检查"],
    ["风险评估", "确定门禁强度"],
    ["自动测试", "生成机器证据"],
    ["AI 分析", "补充测试盲区"],
    ["人工 Review", "业务语义裁决"],
    ["门禁判定", "合并/阻断/返工"],
    ["发布监控", "复盘持续改进"],
  ];
  steps.forEach(([head, sub], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 76 + col * 374;
    const y = 196 + row * 134;
    ctx.addShape(slide, { x, y, w: 286, h: 82, fill: C.white, line: { style: "solid", fill: C.line, width: 1 }, geometry: "roundRect" });
    ctx.addText(slide, { x: x + 18, y: y + 15, w: 52, h: 24, text: String(i + 1).padStart(2, "0"), fontSize: 16, bold: true, color: C.blue });
    ctx.addText(slide, { x: x + 78, y: y + 14, w: 180, h: 24, text: head, fontSize: 17, bold: true, color: C.ink });
    ctx.addText(slide, { x: x + 78, y: y + 43, w: 180, h: 20, text: sub, fontSize: 12.5, color: C.muted });
    if (col < 2) ctx.addText(slide, { x: x + 300, y: y + 28, w: 38, h: 24, text: "→", fontSize: 22, color: C.muted, align: "center" });
  });
  footer(slide, ctx, 4);
  return slide;
}
