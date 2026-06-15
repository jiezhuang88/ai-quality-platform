import { C, bg, title, footer } from "./common.mjs";

export async function slide05(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, C.white);
  title(slide, ctx, "04 | RISK-BASED GATES", "风险等级决定门禁强度：越接近核心业务，证据要求越高", "避免一刀切：低风险不拖慢交付，高风险不降低标准。");
  const cols = [
    ["低风险", "文案、样式、小重构", ["PR 完整", "单元/快照", "静态扫描", "密钥扫描", "人工 Review"], C.green, C.softGreen],
    ["中风险", "API、校验、数据转换", ["低风险全部", "接口测试", "集成/契约", "覆盖率不下降", "AI 测试建议"], C.blue, C.softBlue],
    ["高风险", "权限、支付、订单、隐私", ["中风险全部", "关键 E2E", "安全测试", "依赖扫描", "回滚+监控"], C.amber, C.softAmber],
    ["严重风险", "不可逆数据、合规、金融", ["高风险全部", "独立评审", "灰度发布", "备份演练", "明确审批"], C.red, C.softRed],
  ];
  cols.forEach(([level, scene, items, color, fill], i) => {
    const x = 60 + i * 292;
    ctx.addShape(slide, { x, y: 202, w: 250, h: 380, fill, line: { style: "solid", fill: color, width: 1.3 }, geometry: "roundRect" });
    ctx.addText(slide, { x: x + 18, y: 224, w: 210, h: 30, text: level, fontSize: 22, bold: true, color });
    ctx.addText(slide, { x: x + 18, y: 262, w: 210, h: 34, text: scene, fontSize: 12.5, color: C.muted });
    items.forEach((item, j) => {
      ctx.addText(slide, { x: x + 22, y: 322 + j * 42, w: 194, h: 22, text: `• ${item}`, fontSize: 14, color: C.ink });
    });
  });
  ctx.addText(slide, { x: 68, y: 620, w: 1060, h: 28, text: "高风险阻断示例：权限变更无负向测试、核心链路无 E2E、数据库变更无回滚、新依赖未扫描。", fontSize: 15, bold: true, color: C.red });
  footer(slide, ctx, 5);
  return slide;
}
