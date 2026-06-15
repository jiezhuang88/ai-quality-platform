import { C, bg, title, footer } from "./common.mjs";

export async function slide07(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, C.white);
  title(slide, ctx, "06 | PLATFORM CAPABILITIES", "落地平台：把制度、工具和证据统一到一个质量工作台", "当前已在本地实现 Web 原型，可继续接入真实 PR、CI 和测试平台。");
  const domains = [
    ["治理", "策略 / 模板 / Prompt 指南"],
    ["准入", "AI 范围 / 影响模块 / 回滚"],
    ["风险", "8 维评分 / 动态门禁"],
    ["测试", "单元 / 契约 / E2E / 变异"],
    ["安全", "SAST / 密钥 / LLM 风险"],
    ["供应链", "SCA / SBOM / 签名"],
    ["评审", "AI 建议 + 人工裁决"],
    ["度量", "DORA / 逃逸 / AI 失败率"],
  ];
  domains.forEach(([head, body], i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 64 + col * 286;
    const y = 216 + row * 156;
    ctx.addShape(slide, { x, y, w: 246, h: 112, fill: row === 0 ? C.softBlue : C.softGreen, line: { style: "solid", fill: C.line, width: 1 }, geometry: "roundRect" });
    ctx.addText(slide, { x: x + 18, y: y + 20, w: 200, h: 24, text: head, fontSize: 20, bold: true, color: row === 0 ? C.blue : C.green });
    ctx.addText(slide, { x: x + 18, y: y + 55, w: 200, h: 36, text: body, fontSize: 13.5, color: C.ink });
  });
  ctx.addText(slide, { x: 68, y: 596, w: 940, h: 28, text: "平台化价值：减少口径争议，让每次 AI 代码合并都有同一套风险、证据和责任记录。", fontSize: 16, bold: true, color: C.ink });
  footer(slide, ctx, 7);
  return slide;
}
