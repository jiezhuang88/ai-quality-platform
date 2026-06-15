export const C = {
  ink: "#152033",
  navy: "#10213F",
  slate: "#344054",
  muted: "#667085",
  blue: "#2457B7",
  cyan: "#007C89",
  green: "#147A52",
  amber: "#B26300",
  red: "#B42318",
  purple: "#6E3CB4",
  paper: "#F6F8FB",
  white: "#FFFFFF",
  line: "#D8DEE8",
  softBlue: "#EAF2FF",
  softCyan: "#E6F7F8",
  softGreen: "#EAF7EF",
  softAmber: "#FFF4E5",
  softRed: "#FFF0ED",
  softPurple: "#F1EAFE",
  walmartBlue: "#0053E2",
  walmartYellow: "#FFC220",
};

export function bg(slide, ctx, color = C.paper) {
  ctx.addShape(slide, { x: 0, y: 0, w: ctx.W, h: ctx.H, fill: color, line: ctx.line() });
}

export function text(slide, ctx, x, y, w, h, value, size, color = C.ink, bold = false, align = "left") {
  return ctx.addText(slide, {
    x, y, w, h, text: value, fontSize: size, color, bold, align,
    typeface: bold ? ctx.fonts.title : ctx.fonts.body,
  });
}

export function header(slide, ctx, section, title, subtitle = "") {
  text(slide, ctx, 52, 32, 520, 20, section, 11.5, C.walmartBlue, true);
  text(slide, ctx, 52, 58, 1060, 46, title, 28, C.ink, true);
  if (subtitle) text(slide, ctx, 54, 112, 1000, 28, subtitle, 13.2, C.muted);
}

export function footer(slide, ctx, n) {
  ctx.addShape(slide, { x: 52, y: 684, w: 1076, h: 1, fill: C.line, line: ctx.line() });
  text(slide, ctx, 52, 694, 720, 16, "AI 时代研发协同与质量工程平台建设方案 | CTO Review Draft", 8.8, C.muted);
  text(slide, ctx, 1164, 694, 60, 16, String(n).padStart(2, "0"), 8.8, C.muted, false, "right");
}

export function card(slide, ctx, x, y, w, h, title, accent = C.blue, fill = C.white) {
  ctx.addShape(slide, { x, y, w, h, fill, line: { style: "solid", fill: C.line, width: 1 }, geometry: "roundRect" });
  ctx.addShape(slide, { x, y, w: 5, h, fill: accent, line: ctx.line() });
  text(slide, ctx, x + 18, y + 14, w - 36, 21, title, 14.4, accent, true);
}

export function pill(slide, ctx, x, y, w, label, fill, color = C.ink) {
  ctx.addShape(slide, { x, y, w, h: 27, fill, line: { style: "solid", fill, width: 1 }, geometry: "roundRect" });
  text(slide, ctx, x + 8, y + 7, w - 16, 13, label, 9.6, color, true, "center");
}

export function bullet(slide, ctx, x, y, w, items, size = 11.2, color = C.ink, gap = 28) {
  items.forEach((item, i) => text(slide, ctx, x, y + i * gap, w, 24, `• ${item}`, size, color));
}

export function arrow(slide, ctx, x1, y1, x2, y2, color = C.line) {
  ctx.addShape(slide, {
    x: x1, y: y1, w: x2 - x1, h: y2 - y1,
    geometry: "line",
    line: { style: "solid", fill: color, width: 1.5, beginArrowType: "none", endArrowType: "triangle" },
  });
}
