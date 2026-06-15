import { C, bg, header, footer, text, card, bullet, pill, arrow } from "./common.mjs";

export async function slide03(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, C.paper);
  header(slide, ctx, "02 | 端到端落地 Case", "沃尔玛订单交易核心链路：研发协同平台如何工作", "以全场券 + 商品券、库存锁定、支付前金额一致性为例，展示一个高风险 AI 代码变更如何被跨团队协同治理。");

  const flow = [
    ["需求", "优惠规则变更"],
    ["设计", "影响订单链路"],
    ["AI 编码", "生成实现与单测"],
    ["PR", "风险评分加严"],
    ["验证", "自动回归/性能/混沌"],
    ["UAT", "业务验收金额规则"],
    ["发布", "灰度监控与复盘"],
  ];
  flow.forEach(([name, desc], i) => {
    const x = 52 + i * 164;
    ctx.addShape(slide, { x, y: 160, w: 128, h: 72, fill: C.white, line: { style: "solid", fill: C.walmartBlue, width: 1 }, geometry: "roundRect" });
    text(slide, ctx, x + 12, 176, 104, 17, name, 12.5, C.walmartBlue, true, "center");
    text(slide, ctx, x + 12, 204, 104, 14, desc, 8.8, C.muted, false, "center");
    if (i < flow.length - 1) arrow(slide, ctx, x + 132, 196, x + 158, 196, C.line);
  });

  card(slide, ctx, 58, 282, 338, 268, "跨团队协同动作", C.blue, C.white);
  bullet(slide, ctx, 82, 328, 278, [
    "产品/业务：沉淀全场券、商品券叠加规则与验收口径",
    "研发：提交方案、AI 代码、单测与影响链路说明",
    "QA：编排数据、自动化、性能、混沌与 UAT 证据",
    "发布负责人：基于门禁结果决定灰度、回滚与监控策略"
  ], 10.6, C.ink, 42);

  card(slide, ctx, 424, 282, 338, 268, "平台自动编排", C.purple, C.white);
  bullet(slide, ctx, 448, 328, 278, [
    "需求 Agent 抽取金额、库存、支付前校验规则",
    "PR Agent 根据 Diff 标记核心交易高风险",
    "数据银行准备券、库存、支付异常和边界数据",
    "自动化平台选择优惠组合、库存并发、支付回滚集",
    "监控平台绑定核心接口 P95/P99 与业务异常"
  ], 10.4, C.ink, 36);

  card(slide, ctx, 790, 282, 338, 268, "统一放行证据", C.green, C.white);
  bullet(slide, ctx, 814, 328, 276, [
    "代码：Sonar 无阻断，单测覆盖率不下降",
    "接口：自动化通过，关键接口响应时长未劣化",
    "业务：优惠金额、库存状态、支付金额一致",
    "发布：灰度、告警、回滚预案与复盘任务就绪"
  ], 10.6, C.ink, 42);

  ctx.addShape(slide, { x: 58, y: 576, w: 1070, h: 82, fill: C.white, line: { style: "solid", fill: C.line, width: 1 }, geometry: "roundRect" });
  const metrics = [
    ["Lead Time", "需求到上线周期", C.blue, 82],
    ["AI CFR", "AI 变更失败率", C.red, 262],
    ["Escape", "缺陷逃逸率", C.amber, 442],
    ["Gate Hit", "高风险阻断率", C.purple, 622],
    ["P95/P99", "核心链路时延", C.green, 802],
  ];
  metrics.forEach(([value, label, color, x]) => {
    text(slide, ctx, x, 592, 142, 26, value, 22, color, true);
    text(slide, ctx, x, 626, 142, 14, label, 9.4, C.ink, true);
  });
  pill(slide, ctx, 984, 600, 116, "研发 cockpit", C.walmartYellow, C.ink);
  text(slide, ctx, 974, 632, 138, 12, "效率、质量、稳定性同屏", 8.5, C.muted, false, "center");

  footer(slide, ctx, 3);
  return slide;
}
