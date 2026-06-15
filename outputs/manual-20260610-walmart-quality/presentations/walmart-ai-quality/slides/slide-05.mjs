import { C, bg, header, footer, text, bullet } from "./common.mjs";

export async function slide05(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, C.white);
  header(slide, ctx, "04 | 风险分级与门禁", "风险等级决定门禁强度：不拖慢低风险，不放松高风险", "AI Coding 大量提交代码时，风险分级是 PR 门禁的第一步。");
  const cols = [
    ["低风险", "文案、样式、非核心页面", ["Sonar 无高危", "单测/快照", "人工 Review"], C.green, C.softGreen],
    ["中风险", "普通接口、数据展示", ["接口自动化", "覆盖率不下降", "AI 测试建议"], C.blue, C.softBlue],
    ["高风险", "订单、优惠、库存、支付", ["E2E/契约测试", "性能/混沌验证", "测试负责人 Review"], C.amber, C.softAmber],
    ["严重风险", "金额规则、批量数据、核心交易", ["灰度+回滚", "业务审批", "发布监控与应急预案"], C.red, C.softRed],
  ];
  cols.forEach(([level, scene, items, color, fill], i) => {
    const x = 62 + i * 290;
    ctx.addShape(slide, { x, y: 210, w: 246, h: 350, fill, line: { style: "solid", fill: color, width: 1.2 }, geometry: "roundRect" });
    text(slide, ctx, x + 18, 234, 190, 28, level, 21, color, true);
    text(slide, ctx, x + 18, 272, 200, 34, scene, 12, C.muted);
    bullet(slide, ctx, x + 22, 334, 196, items, 12.8, C.ink, 44);
  });
  text(slide, ctx, 68, 616, 1050, 22, "阻断示例：高风险 PR 缺优惠组合测试、库存并发测试、支付金额一致性测试、支付失败释放库存测试，禁止合并。", 14.2, C.red, true);
  footer(slide, ctx, 5);
  return slide;
}
