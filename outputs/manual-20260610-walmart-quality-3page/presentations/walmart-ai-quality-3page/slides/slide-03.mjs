import { C, bg, header, footer, text, card, bullet, pill, arrow } from "./common.mjs";

export async function slide03(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, C.paper);
  header(slide, ctx, "02 | 业务落地 Case", "沃尔玛订单交易核心链路：用一个高风险 PR 跑通质量闭环", "场景只使用当前业务真实优惠类型：全场券 + 商品券，验证优惠计算、库存锁定、支付前金额一致性和异常回滚。");

  const x0 = 58;
  const flow = [
    ["选品", "商品券命中"],
    ["结算", "全场券叠加"],
    ["锁库存", "并发/超卖"],
    ["支付前", "金额一致"],
    ["支付后", "履约/释放"],
  ];
  flow.forEach(([name, desc], i) => {
    const x = x0 + i * 210;
    ctx.addShape(slide, { x, y: 166, w: 150, h: 76, fill: C.white, line: { style: "solid", fill: C.walmartBlue, width: 1.1 }, geometry: "roundRect" });
    text(slide, ctx, x + 16, 184, 118, 18, name, 13.5, C.walmartBlue, true, "center");
    text(slide, ctx, x + 16, 214, 118, 14, desc, 9.8, C.muted, false, "center");
    if (i < flow.length - 1) arrow(slide, ctx, x + 154, 204, x + 200, 204, C.line);
  });

  card(slide, ctx, 58, 292, 338, 258, "高风险 PR 触发条件", C.red, C.white);
  bullet(slide, ctx, 82, 338, 274, [
    "改动优惠计算、订单金额、库存锁定、支付前校验",
    "AI 代码触达核心链路，且覆盖率/用例证据不足",
    "影响全场券与商品券叠加、退款、支付失败释放库存",
    "历史遗留缺陷或线上异常集中在相同模块"
  ], 11.2, C.ink, 34);

  card(slide, ctx, 424, 292, 338, 258, "自动化与 AI 执行动作", C.blue, C.white);
  bullet(slide, ctx, 448, 338, 278, [
    "Diff Agent 输出风险等级、影响链路与必须验证点",
    "数据银行构造商品券、全场券、库存边界数据",
    "自动化框架选择优惠组合、库存并发、支付回滚集",
    "性能/混沌平台验证下单、结算、库存服务降级"
  ], 11.2, C.ink, 34);

  card(slide, ctx, 790, 292, 338, 258, "门禁放行证据", C.green, C.white);
  bullet(slide, ctx, 814, 338, 276, [
    "Sonar 无阻断问题，单测覆盖率不下降",
    "核心接口自动化通过，关键接口响应时长未劣化",
    "优惠金额、库存状态、支付金额三方一致性验证通过",
    "UAT 确认业务规则，并形成发布监控/回滚预案"
  ], 11.2, C.ink, 34);

  ctx.addShape(slide, { x: 58, y: 574, w: 1070, h: 88, fill: C.white, line: { style: "solid", fill: C.line, width: 1 }, geometry: "roundRect" });
  const metrics = [
    ["AI CFR", "AI 变更失败率", "按模块与模型来源追踪", C.red, 82],
    ["Escape", "缺陷逃逸率", "测试遗漏进入线上", C.amber, 264],
    ["P95/P99", "核心接口时延", "结算/下单/支付前校验", C.blue, 446],
    ["Coverage", "自动化覆盖", "接口、E2E、契约覆盖", C.green, 628],
    ["Debt", "遗留缺陷", "高风险模块清零策略", C.purple, 810],
  ];
  metrics.forEach(([value, label, note, color, x]) => {
    text(slide, ctx, x, 586, 150, 28, value, 23, color, true);
    text(slide, ctx, x, 616, 150, 14, label, 9.3, C.ink, true);
    text(slide, ctx, x, 634, 150, 12, note, 7.6, C.muted);
  });
  pill(slide, ctx, 1000, 594, 96, "CTO 看板", C.walmartYellow, C.ink);
  text(slide, ctx, 986, 626, 126, 12, "按风险看交付质量", 8.8, C.muted, false, "center");

  footer(slide, ctx, 3);
  return slide;
}
