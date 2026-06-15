import { C, bg, header, footer, panel, text, bullet } from "./common.mjs";

export async function slide08(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  header(slide, ctx, "07 | Case 质量保障闭环", "用现有平台把沃尔玛交易变更转化为可执行质量证据", "覆盖 PR 门禁、测试验证、UAT 业务验收和发布后监控。");
  panel(slide, ctx, 60, 198, 252, 316, "数据银行", C.blue, C.white);
  bullet(slide, ctx, 86, 244, 196, ["全场券 / 商品券", "不参与优惠商品", "库存临界商品", "支付失败/超时", "部分退款/全额退款"], 11.5, C.ink, 35);
  panel(slide, ctx, 340, 198, 252, 316, "自动化框架", C.green, C.white);
  bullet(slide, ctx, 366, 244, 196, ["优惠计算接口", "库存锁定接口", "支付前校验", "支付回调", "订单状态/退款"], 11.5, C.ink, 35);
  panel(slide, ctx, 620, 198, 252, 316, "性能 + 混沌", C.amber, C.white);
  bullet(slide, ctx, 646, 244, 196, ["优惠计算 P95/P99", "库存锁定并发", "支付服务超时", "回调延迟", "消息队列延迟"], 11.5, C.ink, 35);
  panel(slide, ctx, 900, 198, 252, 316, "AI + PR 门禁", C.red, C.white);
  bullet(slide, ctx, 926, 244, 196, ["AI diff 影响分析", "回归范围推荐", "Sonar/覆盖率", "遗留缺陷检查", "证据不足阻断"], 11.5, C.ink, 35);
  ctx.addShape(slide, { x: 72, y: 566, w: 1040, h: 46, fill: C.navy, line: ctx.line(), geometry: "roundRect" });
  text(slide, ctx, 96, 580, 980, 18, "UAT 重点：业务方确认全场券/商品券规则、不参与优惠商品、订单金额展示、支付失败提示、退款分摊和订单状态展示。", 13.2, C.white, true, "center");
  footer(slide, ctx, 8);
  return slide;
}
