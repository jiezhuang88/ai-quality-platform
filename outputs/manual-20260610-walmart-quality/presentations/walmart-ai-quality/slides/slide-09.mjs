import { C, bg, header, footer, metric, text } from "./common.mjs";

export async function slide09(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, C.white);
  header(slide, ctx, "08 | CTO 质量看板", "用指标驱动质量经营，而不是只看测试是否完成", "质量指标要能回答：风险是否可控、能否合并、能否 UAT、能否发布。");
  const metrics = [
    ["Sonar 高危", "代码风险", "Blocker/Critical/Major", C.red],
    ["单测覆盖率", "代码基础保障", "核心模块优先", C.blue],
    ["接口覆盖率", "行为验证程度", "订单/优惠/库存/支付", C.green],
    ["P95/P99", "用户体验和容量", "核心交易接口", C.amber],
    ["遗留缺陷", "质量债", "影响高风险发布决策", C.red],
    ["用例通过率", "版本稳定性", "低于阈值进入风险评审", C.purple],
    ["缺陷逃逸率", "线上质量", "复盘反哺门禁", C.red],
    ["AI 变更失败率", "AI 质量成熟度", "Prompt 和门禁迭代", C.amber],
  ];
  metrics.forEach(([value, label, note, color], i) => {
    const x = 70 + (i % 4) * 282;
    const y = 210 + Math.floor(i / 4) * 170;
    metric(slide, ctx, x, y, 220, value, label, note, color);
  });
  text(slide, ctx, 74, 600, 980, 24, "建议：将指标分层用于 PR 准入、UAT 准入、发布准入和线上复盘，形成统一质量经营视图。", 15, C.ink, true);
  footer(slide, ctx, 9);
  return slide;
}
