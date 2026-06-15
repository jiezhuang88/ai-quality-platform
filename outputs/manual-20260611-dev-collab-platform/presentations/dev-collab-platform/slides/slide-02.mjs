import { C, bg, header, footer, text, pill, bullet, arrow } from "./common.mjs";

export async function slide02(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, C.white);
  header(slide, ctx, "01 | 平台蓝图", "从流程、工具、协同三条主线搭建研发协同平台", "把 AI Coding、质量门禁、安全供应链、测试工具和发布治理纳入同一个工程作业流。");

  const stages = [
    ["需求", "AI 澄清\n验收标准"],
    ["设计", "方案评审\n风险识别"],
    ["编码", "AI Coding\n规范自检"],
    ["PR", "Diff 分析\n门禁触发"],
    ["验证", "自动测试\n性能混沌"],
    ["UAT", "业务验收\n规则确认"],
    ["发布", "灰度监控\n复盘沉淀"],
  ];
  stages.forEach(([name, desc], i) => {
    const x = 54 + i * 164;
    const color = [C.blue, C.cyan, C.purple, C.amber, C.green, C.red, C.slate][i];
    const fill = [C.softBlue, C.softCyan, C.softPurple, C.softAmber, C.softGreen, C.softRed, C.paper][i];
    ctx.addShape(slide, { x, y: 164, w: 128, h: 88, fill, line: { style: "solid", fill: color, width: 1 }, geometry: "roundRect" });
    text(slide, ctx, x + 12, 181, 104, 17, name, 13.2, color, true, "center");
    text(slide, ctx, x + 12, 205, 104, 30, desc, 9.4, C.ink, false, "center");
    if (i < stages.length - 1) arrow(slide, ctx, x + 132, 208, x + 158, 208, C.line);
  });

  const layers = [
    ["流程编排层", "统一研发作业流：阶段、责任人、输入输出、准入准出", C.blue, C.softBlue],
    ["AI 协同助手层", "需求 Agent / 方案 Agent / PR Agent / 测试 Agent / 复盘 Agent", C.purple, C.softPurple],
    ["工具集成层", "数据银行、自动化、性能、混沌、Sonar、覆盖率、CI/CD、监控", C.green, C.softGreen],
    ["质量风险治理层", "按业务链路与代码影响面分级，自动决定门禁强度", C.amber, C.softAmber],
    ["知识资产层", "业务规则、历史缺陷、链路画像、测试资产、发布复盘持续沉淀", C.cyan, C.softCyan],
    ["研发经营层", "效率、质量、稳定性、成本、AI 代码风险统一看板", C.red, C.softRed],
  ];
  layers.forEach(([name, desc, color, fill], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 62 + col * 560;
    const y = 310 + row * 86;
    ctx.addShape(slide, { x, y, w: 500, h: 62, fill, line: { style: "solid", fill: color, width: 1 }, geometry: "roundRect" });
    text(slide, ctx, x + 18, y + 13, 130, 18, name, 13.2, color, true);
    text(slide, ctx, x + 158, y + 13, 310, 32, desc, 10.2, C.ink);
  });

  ctx.addShape(slide, { x: 62, y: 584, w: 1060, h: 70, fill: C.navy, line: { style: "solid", fill: C.navy, width: 1 }, geometry: "roundRect" });
  pill(slide, ctx, 86, 604, 112, "平台原则", C.walmartYellow, C.ink);
  text(slide, ctx, 222, 600, 850, 18, "所有变更都要回答四个问题：影响什么链路、风险等级多高、需要哪些验证证据、是否满足发布决策。", 12.8, C.white, true);
  text(slide, ctx, 222, 626, 850, 14, "安全与供应链作为横向治理能力贯穿每个阶段，不再作为单独阶段割裂处理。", 9.2, "#D7E3F5");

  footer(slide, ctx, 2);
  return slide;
}
