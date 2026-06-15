import { C, bg, header, footer, panel, metric, bullet } from "./common.mjs";

export async function slide02(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  header(slide, ctx, "01 | 现状与挑战", "AI 代码产出提速，但电商交易链路质量风险同步放大", "挑战不是缺少工具，而是需要把已有平台和指标编排成统一质量门禁。");
  metric(slide, ctx, 78, 210, 250, "AI 代码量", "持续上升", "人工 Review 与手工测试无法线性扩张", C.blue);
  metric(slide, ctx, 388, 210, 250, "交易链路", "高耦合", "优惠、库存、支付、订单状态、履约互相影响", C.amber);
  metric(slide, ctx, 698, 210, 250, "质量证据", "分散", "数据、自动化、性能、混沌、指标尚未形成统一决策链", C.red);
  panel(slide, ctx, 78, 408, 310, 146, "AI Coding 新风险", C.red);
  bullet(slide, ctx, 104, 456, 250, ["误解优惠/库存/支付规则", "生成无效测试", "遗漏异常与并发路径"], 11.8, C.ink, 30);
  panel(slide, ctx, 432, 408, 310, 146, "现有基础", C.blue);
  bullet(slide, ctx, 458, 456, 250, ["数据银行", "自动化框架、性能平台", "混沌工程与质量指标"], 11.8, C.ink, 30);
  panel(slide, ctx, 786, 408, 310, 146, "建设方向", C.green);
  bullet(slide, ctx, 812, 456, 250, ["风险分级", "PR 自动门禁", "AI 分析 + UAT 验收闭环"], 11.8, C.ink, 30);
  footer(slide, ctx, 2);
  return slide;
}
