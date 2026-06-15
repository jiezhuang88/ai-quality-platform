import { C, bg, header, footer, text, panel, bullet } from "./common.mjs";

export async function slide10(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  header(slide, ctx, "09 | 落地路线与决策", "建议分 4 步推进：先规则，再整合，再智能化，最后质量经营", "用现有平台先跑通高风险交易链路，逐步扩展到全域研发流程。");
  const phases = [
    ["0-3 个月", "规则和 PR 门禁", ["AI 范围必填", "风险等级必填", "高风险测试负责人 Review"], C.blue],
    ["3-6 个月", "工具平台整合", ["数据银行模板", "自动化/性能/混沌接入门禁", "指标统一报告"], C.green],
    ["6-12 个月", "AI 测试分析", ["AI diff 分析", "回归范围推荐", "日志归因与质量报告"], C.amber],
    ["12 个月后", "质量经营", ["CTO 看板", "缺陷模式库", "业务风险图谱和智能调度"], C.red],
  ];
  phases.forEach(([time, titleText, items, color], i) => {
    const x = 62 + i * 286;
    panel(slide, ctx, x, 216, 246, 250, time, color, C.white);
    text(slide, ctx, x + 20, 264, 190, 22, titleText, 18, C.ink, true);
    bullet(slide, ctx, x + 24, 320, 190, items, 11.5, C.ink, 40);
  });
  ctx.addShape(slide, { x: 76, y: 540, w: 1030, h: 58, fill: C.navy, line: ctx.line(), geometry: "roundRect" });
  text(slide, ctx, 102, 558, 960, 22, "CTO 决策建议：流程纳入、平台投入、组织授权、指标治理。先以订单交易链路试点，再扩展到全域 AI Coding 质量门禁。", 14, C.white, true, "center");
  footer(slide, ctx, 10);
  return slide;
}
