export const C = {
  navy: "#14213D",
  ink: "#1D2430",
  muted: "#667085",
  blue: "#2457B7",
  green: "#147A52",
  amber: "#B26300",
  red: "#B42318",
  purple: "#6E3CB4",
  line: "#D8DEE8",
  paper: "#F6F8FB",
  white: "#FFFFFF",
  softBlue: "#EAF2FF",
  softGreen: "#EAF7EF",
  softAmber: "#FFF4E5",
  softRed: "#FFF0ED",
  softPurple: "#F1EAFE",
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
  text(slide, ctx, 54, 36, 520, 20, section, 12, C.blue, true);
  text(slide, ctx, 54, 62, 980, 48, title, 30, C.ink, true);
  if (subtitle) text(slide, ctx, 54, 122, 980, 30, subtitle, 14, C.muted);
}

export function footer(slide, ctx, n) {
  ctx.addShape(slide, { x: 54, y: 684, w: 1060, h: 1, fill: C.line, line: ctx.line() });
  text(slide, ctx, 54, 694, 620, 16, "AI Coding 时代测试质量保障方案 | CTO Review Draft", 8.8, C.muted);
  text(slide, ctx, 1162, 694, 60, 16, String(n).padStart(2, "0"), 8.8, C.muted, false, "right");
}

export function panel(slide, ctx, x, y, w, h, title, accent = C.blue, fill = C.white) {
  ctx.addShape(slide, { x, y, w, h, fill, line: { style: "solid", fill: C.line, width: 1 }, geometry: "roundRect" });
  ctx.addShape(slide, { x, y, w: 5, h, fill: accent, line: ctx.line() });
  text(slide, ctx, x + 18, y + 14, w - 36, 22, title, 15, accent, true);
}

export function bullet(slide, ctx, x, y, w, items, size = 12, color = C.ink, gap = 27) {
  items.forEach((item, i) => text(slide, ctx, x, y + i * gap, w, 20, `• ${item}`, size, color));
}

export function pill(slide, ctx, x, y, w, label, fill, color = C.ink) {
  ctx.addShape(slide, { x, y, w, h: 28, fill, line: { style: "solid", fill, width: 1 }, geometry: "roundRect" });
  text(slide, ctx, x + 8, y + 7, w - 16, 14, label, 10.5, color, true, "center");
}

export function metric(slide, ctx, x, y, w, value, label, note, color = C.blue) {
  text(slide, ctx, x, y, w, 42, value, 31, color, true);
  text(slide, ctx, x, y + 46, w, 20, label, 12.5, C.ink, true);
  text(slide, ctx, x, y + 70, w, 34, note, 9.8, C.muted);
}
