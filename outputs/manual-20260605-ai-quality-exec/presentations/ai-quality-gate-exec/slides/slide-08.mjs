import { C, bg, title, footer } from "./common.mjs";

export async function slide08(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, C.paper);
  title(slide, ctx, "07 | OPERATING MODEL", "职责边界：测试工程师成为质量门禁负责人，而不是人工补位者", "AI 时代的质量治理需要明确角色，避免“AI 生成、无人负责”。");
  const rows = [
    ["测试工程师", "制定风险规则、门禁标准、自动化策略；审核 AI 测试建议；推动缺陷模式沉淀"],
    ["开发团队", "提供变更说明、测试证据、修复失败门禁；约束 AI 生成范围"],
    ["架构/安全", "审核高风险变更、供应链风险、权限安全和核心链路影响"],
    ["业务负责人", "确认严重风险变更的发布价值、灰度策略和风险接受"],
    ["平台/DevOps", "把门禁接入 PR、CI、发布和监控链路"],
  ];
  ctx.addShape(slide, { x: 72, y: 200, w: 1050, h: 54, fill: C.navy, line: ctx.line(), geometry: "roundRect" });
  ctx.addText(slide, { x: 96, y: 217, w: 230, h: 20, text: "角色", fontSize: 14, bold: true, color: C.white });
  ctx.addText(slide, { x: 360, y: 217, w: 720, h: 20, text: "核心职责", fontSize: 14, bold: true, color: C.white });
  rows.forEach(([role, duty], i) => {
    const y = 260 + i * 74;
    ctx.addShape(slide, { x: 72, y, w: 1050, h: 62, fill: C.white, line: { style: "solid", fill: C.line, width: 1 }, geometry: "roundRect" });
    ctx.addText(slide, { x: 96, y: y + 18, w: 230, h: 22, text: role, fontSize: 15, bold: true, color: C.blue });
    ctx.addText(slide, { x: 360, y: y + 15, w: 720, h: 28, text: duty, fontSize: 13.5, color: C.ink });
  });
  footer(slide, ctx, 8);
  return slide;
}
