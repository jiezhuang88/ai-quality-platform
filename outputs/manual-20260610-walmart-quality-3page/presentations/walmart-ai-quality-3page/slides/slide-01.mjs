import { C, bg, text, pill, footer } from "./common.mjs";

export async function slide01(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, C.navy);

  text(slide, ctx, 58, 42, 520, 20, "CTO REVIEW | 3-PAGE EXECUTIVE VERSION", 11.5, "#9EC9FF", true);
  text(slide, ctx, 58, 92, 820, 92, "AI Coding 时代沃尔玛电商质量保障体系演进", 40, C.white, true);
  text(slide, ctx, 60, 208, 820, 50, "从“测试阶段验证”升级为“AI-Native Quality Engineering”：用风险门禁、测试智能体和质量经营体系，支撑 AI 大量提交代码下的稳定交付。", 17, "#D7E3F5");

  const chips = [
    ["风险经营", 60], ["SDLC 前移", 194], ["AI 测试智能体", 328], ["自动门禁", 498], ["业务验收闭环", 632],
  ];
  chips.forEach(([label, x]) => pill(slide, ctx, x, 294, label.length > 5 ? 150 : 112, label, "#20345D", C.white));

  const shifts = [
    ["过去", "测试执行 / 用例通过", "集中在测试验证阶段，发现问题偏后"],
    ["现在", "工具平台 + 指标监控", "已有数据银行、自动化、性能、混沌与 Sonar 等基础"],
    ["未来", "AI-Native 质量经营", "AI 自动识别风险、推荐测试、生成证据、驱动门禁"],
  ];
  shifts.forEach(([stage, title, desc], i) => {
    const x = 62 + i * 260;
    const fill = i === 2 ? "#163763" : "#FFFFFF12";
    const stroke = i === 2 ? C.walmartYellow : "#FFFFFF30";
    ctx.addShape(slide, { x, y: 378, w: 226, h: 138, fill, line: { style: "solid", fill: stroke, width: 1.2 }, geometry: "roundRect" });
    text(slide, ctx, x + 18, 396, 70, 18, stage, 12, i === 2 ? C.walmartYellow : "#9EC9FF", true);
    text(slide, ctx, x + 18, 426, 188, 24, title, 16, C.white, true);
    text(slide, ctx, x + 18, 462, 186, 36, desc, 9.6, "#D7E3F5");
  });

  ctx.addShape(slide, { x: 882, y: 102, w: 314, h: 468, fill: "#FFFFFF12", line: { style: "solid", fill: "#FFFFFF33", width: 1 }, geometry: "roundRect" });
  text(slide, ctx, 916, 134, 244, 24, "建设目标", 18, C.walmartYellow, true, "center");
  const targetMetrics = [
    ["4 道门禁", "PR / 测试 / UAT / 发布", "风险等级决定门禁强度", "#9EC9FF", 186],
    ["5 类智能体", "需求、Diff、用例、日志、复盘", "让 AI 参与质量分析与证据生成", "#8EF0D3", 300],
    ["1 个看板", "质量经营 cockpit", "缺陷逃逸、AI 变更失败、核心链路稳定性", "#FFD98A", 414],
  ];
  targetMetrics.forEach(([value, label, note, color, y]) => {
    text(slide, ctx, 924, y, 238, 36, value, 27, color, true);
    text(slide, ctx, 924, y + 40, 238, 18, label, 11.5, C.white, true);
    text(slide, ctx, 924, y + 62, 238, 28, note, 9.4, "#D7E3F5");
  });

  text(slide, ctx, 62, 620, 980, 24, "核心结论：测试团队的未来角色不是“多跑测试”，而是经营 AI 代码变更风险，并把质量证据自动沉淀到每次交付决策中。", 14.3, C.white, true);
  footer(slide, ctx, 1);
  return slide;
}
