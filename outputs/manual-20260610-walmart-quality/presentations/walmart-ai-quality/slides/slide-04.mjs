import { C, bg, header, footer, text } from "./common.mjs";

export async function slide04(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  header(slide, ctx, "03 | SDLC 模型", "质量保障覆盖 8 个阶段，安全与供应链作为横向门禁贯穿其中", "符合当前流程：测试验证后进入 UAT 业务验收，再进入发布。");
  const stages = ["需求", "设计", "AI 编码", "PR", "测试验证", "UAT", "发布", "运行复盘"];
  stages.forEach((stage, i) => {
    const x = 58 + i * 140;
    ctx.addShape(slide, { x, y: 224, w: 112, h: 62, fill: i < 4 ? C.softBlue : i === 5 ? C.softAmber : C.softGreen, line: { style: "solid", fill: C.line, width: 1 }, geometry: "roundRect" });
    text(slide, ctx, x + 10, 244, 92, 18, stage, 14, C.ink, true, "center");
    if (i < stages.length - 1) text(slide, ctx, x + 116, 244, 22, 18, "→", 14, C.muted, true, "center");
  });
  const rows = [
    ["阶段质量动作", "需求验收标准、设计可测性、AI 修改范围、PR 风险分级、测试验证、业务验收、灰度发布、复盘沉淀"],
    ["横向质量门禁", "Sonar、密钥扫描、依赖风险、权限/越权、覆盖率、接口响应时长、性能、混沌、发布风险确认"],
    ["质量证据", "PR 报告、测试报告、UAT 结论、扫描结果、性能报告、混沌验证、监控指标、复盘规则更新"],
  ];
  rows.forEach(([head, body], i) => {
    const y = 364 + i * 78;
    ctx.addShape(slide, { x: 82, y, w: 1020, h: 58, fill: C.white, line: { style: "solid", fill: C.line, width: 1 }, geometry: "roundRect" });
    text(slide, ctx, 108, y + 18, 130, 18, head, 13.5, i === 1 ? C.red : C.blue, true);
    text(slide, ctx, 268, y + 17, 790, 20, body, 12.6, C.ink);
  });
  footer(slide, ctx, 4);
  return slide;
}
