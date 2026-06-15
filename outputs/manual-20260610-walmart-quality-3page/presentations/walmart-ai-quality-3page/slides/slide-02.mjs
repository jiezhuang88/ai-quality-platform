import { C, bg, header, footer, text, pill, bullet, arrow } from "./common.mjs";

export async function slide02(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, C.white);
  header(slide, ctx, "01 | 目标流程", "SDLC 全链路质量门禁：风险等级决定门禁强度", "安全与供应链不是独立阶段，而是贯穿需求、PR、测试验证、UAT 准入与发布的横向控制能力。");

  const stages = [
    ["需求/设计", "需求风险识别\n验收标准结构化", C.softBlue, C.blue],
    ["AI 编码", "Prompt 约束\n单测自检", C.softCyan, C.cyan],
    ["PR", "Diff 风险评分\nSonar/覆盖率/依赖", C.softPurple, C.purple],
    ["测试验证", "接口自动化\n性能/混沌/数据", C.softGreen, C.green],
    ["UAT", "业务验收\n金额/库存/履约", C.softAmber, C.amber],
    ["发布复盘", "灰度监控\n缺陷逃逸复盘", C.softRed, C.red],
  ];

  stages.forEach(([name, desc, fill, color], i) => {
    const x = 56 + i * 195;
    ctx.addShape(slide, { x, y: 172, w: 154, h: 104, fill, line: { style: "solid", fill: color, width: 1 }, geometry: "roundRect" });
    text(slide, ctx, x + 12, 190, 130, 20, name, 14, color, true, "center");
    text(slide, ctx, x + 12, 224, 130, 36, desc, 10.3, C.ink, false, "center");
    if (i < stages.length - 1) arrow(slide, ctx, x + 157, 224, x + 188, 224, C.line);
  });

  text(slide, ctx, 58, 316, 380, 20, "风险分级：把 AI 大量提交变成可治理队列", 14.5, C.ink, true);
  const risks = [
    ["低", "文案/样式/非核心页面", "Sonar 无高危 + 单测/快照"],
    ["中", "普通接口/数据展示", "接口自动化 + 覆盖率不下降"],
    ["高", "订单/优惠/库存/支付", "E2E + 契约 + 性能/混沌"],
    ["严重", "金额规则/批量数据/核心交易", "业务审批 + 灰度 + 回滚预案"],
  ];
  risks.forEach(([level, scope, gate], i) => {
    const y = 352 + i * 58;
    const colors = [C.green, C.blue, C.amber, C.red];
    ctx.addShape(slide, { x: 58, y, w: 45, h: 34, fill: [C.softGreen, C.softBlue, C.softAmber, C.softRed][i], line: { style: "solid", fill: colors[i], width: 1 }, geometry: "roundRect" });
    text(slide, ctx, 66, y + 9, 28, 15, level, 10.5, colors[i], true, "center");
    text(slide, ctx, 122, y + 2, 196, 15, scope, 10.6, C.ink, true);
    text(slide, ctx, 122, y + 20, 300, 14, gate, 9.4, C.muted);
  });

  ctx.addShape(slide, { x: 488, y: 316, w: 328, h: 246, fill: C.paper, line: { style: "solid", fill: C.line, width: 1 }, geometry: "roundRect" });
  text(slide, ctx, 510, 338, 260, 20, "现有平台升级方式", 14.5, C.blue, true);
  bullet(slide, ctx, 512, 378, 270, [
    "数据银行：自动准备优惠、库存、支付测试数据",
    "自动化框架：按 Diff 推荐接口/E2E 回归集",
    "性能平台：高风险 PR 触发核心接口 P95/P99 验证",
    "混沌工程：订单链路依赖降级、超时、重试验证",
    "质量指标：从展示指标升级为阻断/放行规则"
  ], 10.8, C.ink, 32);

  ctx.addShape(slide, { x: 856, y: 316, w: 328, h: 246, fill: "#10213F", line: { style: "solid", fill: "#10213F", width: 1 }, geometry: "roundRect" });
  text(slide, ctx, 880, 338, 260, 20, "AI 测试智能体编排", 14.5, C.walmartYellow, true);
  const agents = [
    ["需求 Agent", "抽取规则与验收点"],
    ["PR Diff Agent", "识别模块/链路/风险等级"],
    ["用例 Agent", "生成边界、组合、回归建议"],
    ["日志 Agent", "失败归因与缺陷定位"],
    ["复盘 Agent", "沉淀规则和门禁阈值"],
  ];
  agents.forEach(([name, desc], i) => {
    const y = 376 + i * 34;
    pill(slide, ctx, 884, y, 96, name, "#20345D", C.white);
    text(slide, ctx, 998, y + 6, 150, 14, desc, 9.5, "#D7E3F5");
  });

  text(slide, ctx, 60, 612, 1060, 20, "执行原则：低风险快速通过，高风险自动加严，严重风险必须形成“技术证据 + 业务验收 + 发布预案”后才能进入下一阶段。", 13.3, C.red, true);
  footer(slide, ctx, 2);
  return slide;
}
