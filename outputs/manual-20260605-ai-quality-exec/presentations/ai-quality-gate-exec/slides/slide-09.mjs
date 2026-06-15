import { C, bg, title, footer } from "./common.mjs";

export async function slide09(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, C.white);
  title(slide, ctx, "08 | 90-DAY ROLLOUT", "90 天落地路线：先建规则，再接自动化，最后平台化度量", "用分阶段推进控制组织阻力，避免一次性大改流程。");
  const phases = [
    ["0-2 周", "建立规则", "PR 模板、风险分级、低/中/高门禁、AI 参与范围说明"],
    ["3-6 周", "接入自动化", "单元、接口、静态扫描、密钥扫描、覆盖率、CI 阻断"],
    ["7-10 周", "AI 测试分析", "diff 影响分析、测试建议、风险总结、日志归因"],
    ["11-13 周", "风险驱动回归", "核心链路 E2E、变更影响选择回归、高风险专项测试"],
    ["持续", "度量改进", "逃逸缺陷、AI 失败率、DORA 指标、门禁迭代"],
  ];
  phases.forEach(([time, head, body], i) => {
    const x = 72 + i * 218;
    ctx.addShape(slide, { x, y: 236, w: 170, h: 18, fill: i < 2 ? C.blue : i < 4 ? C.amber : C.green, line: ctx.line() });
    ctx.addShape(slide, { x: x + 78, y: 246, w: 14, h: 14, fill: C.white, line: { style: "solid", fill: C.ink, width: 1 }, geometry: "ellipse" });
    ctx.addText(slide, { x, y: 292, w: 178, h: 24, text: time, fontSize: 16, bold: true, color: C.blue });
    ctx.addText(slide, { x, y: 328, w: 178, h: 24, text: head, fontSize: 18, bold: true, color: C.ink });
    ctx.addText(slide, { x, y: 366, w: 178, h: 102, text: body, fontSize: 12.2, color: C.muted });
  });
  ctx.addText(slide, { x: 74, y: 570, w: 920, h: 28, text: "建议启动方式：选择 1-2 条高价值业务线试点，2 周内建立 PR 门禁规则，6 周内形成自动阻断能力。", fontSize: 16, bold: true, color: C.ink });
  footer(slide, ctx, 9);
  return slide;
}
