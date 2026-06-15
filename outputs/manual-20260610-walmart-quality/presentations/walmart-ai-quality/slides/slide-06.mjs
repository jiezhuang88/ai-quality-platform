import { C, bg, header, footer, text } from "./common.mjs";

export async function slide06(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  header(slide, ctx, "05 | 平台与指标", "复用现有平台能力，把工具结果沉淀为质量决策证据", "从“工具各自运行”升级为“统一质量门禁和 CTO 看板”。");
  const tools = [
    ["数据银行", "构造用户、商品、库存、全场券、商品券、订单、支付、退款数据", C.blue, C.softBlue],
    ["自动化框架", "接口自动化、核心链路回归、批量回归执行", C.green, C.softGreen],
    ["性能测试平台", "核心交易接口 P95/P99、容量评估、峰值压测", C.amber, C.softAmber],
    ["混沌工程", "服务超时、消息延迟、支付回调异常、补偿恢复验证", C.purple, C.softPurple],
  ];
  tools.forEach(([name, desc, color, fill], i) => {
    const x = 62 + (i % 2) * 560;
    const y = 206 + Math.floor(i / 2) * 134;
    ctx.addShape(slide, { x, y, w: 500, h: 92, fill, line: { style: "solid", fill: C.line, width: 1 }, geometry: "roundRect" });
    text(slide, ctx, x + 22, y + 18, 150, 22, name, 17, color, true);
    text(slide, ctx, x + 190, y + 17, 270, 42, desc, 12.4, C.ink);
  });
  ctx.addShape(slide, { x: 74, y: 502, w: 1030, h: 72, fill: C.white, line: { style: "solid", fill: C.line, width: 1 }, geometry: "roundRect" });
  text(slide, ctx, 98, 522, 130, 22, "质量指标", 16, C.red, true);
  text(slide, ctx, 250, 522, 820, 22, "Sonar 扫描 / 单测覆盖率 / 接口自动化覆盖率 / 接口响应时长 / 遗留缺陷 / 测试用例通过率", 13.6, C.ink);
  text(slide, ctx, 98, 606, 900, 22, "建设重点：把每个工具输出转化成 PR、UAT 准入和发布准入的可执行门禁。", 15, C.ink, true);
  footer(slide, ctx, 6);
  return slide;
}
