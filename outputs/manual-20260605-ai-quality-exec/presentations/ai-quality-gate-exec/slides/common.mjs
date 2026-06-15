export const C = {
  navy: "#14213D",
  ink: "#1D2430",
  muted: "#667085",
  blue: "#2457B7",
  cyan: "#0EA5B7",
  green: "#147A52",
  amber: "#B26300",
  red: "#B42318",
  line: "#D8DEE8",
  paper: "#F6F8FB",
  white: "#FFFFFF",
  softBlue: "#EAF2FF",
  softGreen: "#EAF7EF",
  softAmber: "#FFF4E5",
  softRed: "#FFF0ED",
};

export function bg(slide, ctx, color = C.white) {
  ctx.addShape(slide, { x: 0, y: 0, w: ctx.W, h: ctx.H, fill: color, line: ctx.line() });
}

export function title(slide, ctx, kicker, main, sub = "") {
  ctx.addText(slide, { x: 54, y: 38, w: 860, h: 24, text: kicker, fontSize: 13, bold: true, color: C.blue, typeface: ctx.fonts.body });
  ctx.addText(slide, { x: 54, y: 66, w: 980, h: 58, text: main, fontSize: 32, bold: true, color: C.ink, typeface: ctx.fonts.title });
  if (sub) ctx.addText(slide, { x: 54, y: 138, w: 980, h: 34, text: sub, fontSize: 15, color: C.muted });
}

export function footer(slide, ctx, n) {
  ctx.addShape(slide, { x: 54, y: 684, w: 1000, h: 1.2, fill: C.line, line: ctx.line() });
  ctx.addText(slide, { x: 54, y: 694, w: 560, h: 18, text: "AI 代码质量门禁建设方案 | 高管汇报", fontSize: 9, color: C.muted });
  ctx.addText(slide, { x: 1162, y: 694, w: 64, h: 18, text: String(n).padStart(2, "0"), fontSize: 9, color: C.muted, align: "right" });
}

export function pill(slide, ctx, x, y, w, text, fill, color = C.ink) {
  ctx.addShape(slide, { x, y, w, h: 30, fill, line: { style: "solid", fill, width: 1 }, geometry: "roundRect" });
  ctx.addText(slide, { x: x + 12, y: y + 7, w: w - 24, h: 16, text, fontSize: 11, bold: true, color, align: "center" });
}

export function metric(slide, ctx, x, y, w, value, label, note, color = C.blue) {
  ctx.addText(slide, { x, y, w, h: 46, text: value, fontSize: 34, bold: true, color, typeface: ctx.fonts.title });
  ctx.addText(slide, { x, y: y + 48, w, h: 22, text: label, fontSize: 13, bold: true, color: C.ink });
  ctx.addText(slide, { x, y: y + 73, w, h: 34, text: note, fontSize: 10.5, color: C.muted });
}

export function card(slide, ctx, x, y, w, h, heading, body, accent = C.blue) {
  ctx.addShape(slide, { x, y, w, h, fill: C.white, line: { style: "solid", fill: C.line, width: 1 }, geometry: "roundRect" });
  ctx.addShape(slide, { x, y, w: 5, h, fill: accent, line: ctx.line(), geometry: "rect" });
  ctx.addText(slide, { x: x + 18, y: y + 16, w: w - 36, h: 24, text: heading, fontSize: 15, bold: true, color: C.ink });
  ctx.addText(slide, { x: x + 18, y: y + 45, w: w - 36, h: h - 58, text: body, fontSize: 11.5, color: C.muted });
}

export function lane(slide, ctx, x, y, w, h, label, fill, color = C.ink) {
  ctx.addShape(slide, { x, y, w, h, fill, line: { style: "solid", fill: C.line, width: 1 }, geometry: "roundRect" });
  ctx.addText(slide, { x: x + 12, y: y + 12, w: w - 24, h: 22, text: label, fontSize: 14, bold: true, color });
}
