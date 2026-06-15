import { C, bg, header, footer, text, pill } from "./common.mjs";

export async function slide07(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, C.white);
  header(slide, ctx, "06 | 沃尔玛交易链路 Case", "AI 修改全场券 + 商品券优惠计算、库存锁定、支付前校验", "这是高风险交易变更：涉及金额、优惠、库存、支付、订单状态、退款和履约。");
  const chain = ["登录", "商品", "购物车", "优惠计算", "库存锁定", "创建订单", "支付校验", "支付回调", "履约/退款"];
  chain.forEach((item, i) => {
    const x = 50 + i * 130;
    ctx.addShape(slide, { x, y: 204, w: 104, h: 48, fill: i >= 3 && i <= 7 ? C.softRed : C.softBlue, line: { style: "solid", fill: C.line, width: 1 }, geometry: "roundRect" });
    text(slide, ctx, x + 8, 220, 88, 16, item, 11.5, i >= 3 && i <= 7 ? C.red : C.blue, true, "center");
    if (i < chain.length - 1) text(slide, ctx, x + 106, 218, 20, 16, "→", 12, C.muted, true, "center");
  });
  ctx.addShape(slide, { x: 72, y: 310, w: 490, h: 220, fill: C.paper, line: { style: "solid", fill: C.line, width: 1 }, geometry: "roundRect" });
  text(slide, ctx, 96, 334, 170, 22, "业务规则", 17, C.blue, true);
  text(slide, ctx, 98, 374, 410, 112, "全场券作用于满足条件的订单整体金额；商品券只作用于指定商品或范围；部分商品不参与优惠；全场券与商品券是否叠加必须遵循当前业务规则；优惠后订单金额不能小于 0。", 13, C.ink);
  ctx.addShape(slide, { x: 628, y: 310, w: 490, h: 220, fill: C.softAmber, line: { style: "solid", fill: C.line, width: 1 }, geometry: "roundRect" });
  text(slide, ctx, 652, 334, 170, 22, "风险影响", 17, C.amber, true);
  text(slide, ctx, 654, 374, 410, 112, "库存锁定必须在支付前完成；支付金额必须与订单应付金额一致；支付失败或超时释放库存；支付回调延迟不能导致订单状态错误；退款需按实付金额和优惠分摊。", 13, C.ink);
  pill(slide, ctx, 80, 576, 112, "高风险", C.softRed, C.red);
  pill(slide, ctx, 210, 576, 112, "可能资损", C.softAmber, C.amber);
  pill(slide, ctx, 340, 576, 112, "可能超卖", C.softRed, C.red);
  pill(slide, ctx, 470, 576, 136, "订单状态异常", C.softBlue, C.blue);
  footer(slide, ctx, 7);
  return slide;
}
