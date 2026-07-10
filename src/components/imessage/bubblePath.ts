export interface CornerRadii {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
}

export const TAIL_OUT = 6;
export const TAIL_DOWN = 7;
const TAIL_BASE = 14;
const TAIL_NECK = 4;
const TAIL_TIP_RADIUS = 3.2;
const RIGHT_TAIL_TIP_RADIUS = 1.85;

function clampRadius(r: number, w: number, h: number): number {
  return Math.max(0, Math.min(r, w / 2, h / 2));
}

function buildRoundedRect(w: number, h: number, c: CornerRadii): string {
  const tl = clampRadius(c.topLeft, w, h);
  const tr = clampRadius(c.topRight, w, h);
  const br = clampRadius(c.bottomRight, w, h);
  const bl = clampRadius(c.bottomLeft, w, h);

  return [
    `M ${tl} 0`,
    `H ${w - tr}`,
    `A ${tr} ${tr} 0 0 1 ${w} ${tr}`,
    `V ${h - br}`,
    `A ${br} ${br} 0 0 1 ${w - br} ${h}`,
    `H ${bl}`,
    `A ${bl} ${bl} 0 0 1 0 ${h - bl}`,
    `V ${tl}`,
    `A ${tl} ${tl} 0 0 1 ${tl} 0`,
    "Z",
  ].join(" ");
}

function buildRightTailPath(w: number, h: number, c: CornerRadii): string {
  const tl = clampRadius(c.topLeft, w, h);
  const tr = clampRadius(c.topRight, w, h);
  const br = clampRadius(c.bottomRight, w, h);
  const tailEnd = Math.min(w - br - 8, TAIL_BASE);
  const tailAnchor = w - tailEnd;
  const tipX = w + TAIL_OUT;
  const tipY = h + TAIL_DOWN;
  const tipR = RIGHT_TAIL_TIP_RADIUS;
  const rejoinY = h - br * 0.55;

  return [
    `M ${tl} 0`,
    `H ${w - tr}`,
    `A ${tr} ${tr} 0 0 1 ${w} ${tr}`,
    `V ${h - br}`,
    `A ${br} ${br} 0 0 1 ${w - br} ${h}`,
    `H ${tailAnchor}`,
    `C ${tailAnchor + 1.5} ${h + 0.85} ${w + TAIL_OUT * 0.55} ${tipY} ${tipX - tipR} ${tipY - tipR * 0.85}`,
    `A ${tipR} ${tipR} 0 0 0 ${tipX - tipR * 1.55} ${tipY - tipR * 1.65}`,
    `C ${w + TAIL_OUT * 0.38} ${h + TAIL_DOWN * 0.42} ${w + 0.6} ${h + 0.55} ${w} ${rejoinY}`,
    `V ${tr}`,
    `A ${tr} ${tr} 0 0 1 ${w - tr} 0`,
    `H ${tl}`,
    "Z",
  ].join(" ");
}

function buildLeftTailPath(w: number, h: number, c: CornerRadii): string {
  const tl = clampRadius(c.topLeft, w, h);
  const tr = clampRadius(c.topRight, w, h);
  const br = clampRadius(c.bottomRight, w, h);
  const bl = clampRadius(c.bottomLeft, w, h);
  const tailEnd = Math.min(w - br - 8, TAIL_BASE);
  const tipX = -TAIL_OUT;
  const tipY = h + TAIL_DOWN;

  return [
    `M ${tl} 0`,
    `H ${w - tr}`,
    `A ${tr} ${tr} 0 0 1 ${w} ${tr}`,
    `V ${h - br}`,
    `A ${br} ${br} 0 0 1 ${w - br} ${h}`,
    `H ${tailEnd}`,
    `C ${tailEnd - 1} ${h + 1} ${-TAIL_OUT * 0.55} ${tipY} ${tipX + TAIL_TIP_RADIUS} ${tipY - TAIL_TIP_RADIUS}`,
    `A ${TAIL_TIP_RADIUS} ${TAIL_TIP_RADIUS} 0 0 1 ${tipX + TAIL_TIP_RADIUS * 1.6} ${tipY - TAIL_TIP_RADIUS * 1.8}`,
    `C ${-TAIL_OUT * 0.35} ${h + TAIL_DOWN * 0.45} ${4} ${h + 1} ${0} ${h - bl - TAIL_NECK}`,
    `V ${tl}`,
    `A ${tl} ${tl} 0 0 1 ${tl} 0`,
    "Z",
  ].join(" ");
}

export function buildTailOnlyPath(
  w: number,
  h: number,
  corners: CornerRadii,
  tail: "left" | "right"
): string {
  if (w <= 0 || h <= 0) return "";

  if (tail === "right") {
    const br = clampRadius(corners.bottomRight, w, h);
    const tailEnd = Math.min(w - br - 8, TAIL_BASE);
    const tailAnchor = w - tailEnd;
    const tipX = w + TAIL_OUT;
    const tipY = h + TAIL_DOWN;
    const tipR = RIGHT_TAIL_TIP_RADIUS;
    const rejoinY = h - br * 0.55;

    return [
      `M ${tailAnchor} ${h}`,
      `C ${tailAnchor + 1.5} ${h + 0.85} ${w + TAIL_OUT * 0.55} ${tipY} ${tipX - tipR} ${tipY - tipR * 0.85}`,
      `A ${tipR} ${tipR} 0 0 0 ${tipX - tipR * 1.55} ${tipY - tipR * 1.65}`,
      `C ${w + TAIL_OUT * 0.38} ${h + TAIL_DOWN * 0.42} ${w + 0.6} ${h + 0.55} ${w} ${rejoinY}`,
      `V ${h - br}`,
      `A ${br} ${br} 0 0 1 ${w - br} ${h}`,
      `H ${tailAnchor}`,
      "Z",
    ].join(" ");
  }

  const br = clampRadius(corners.bottomRight, w, h);
  const bl = clampRadius(corners.bottomLeft, w, h);
  const tailEnd = Math.min(w - br - 8, TAIL_BASE);
  const tipX = -TAIL_OUT;
  const tipY = h + TAIL_DOWN;

  return [
    `M ${tailEnd} ${h}`,
    `C ${tailEnd - 1} ${h + 1} ${-TAIL_OUT * 0.55} ${tipY} ${tipX + TAIL_TIP_RADIUS} ${tipY - TAIL_TIP_RADIUS}`,
    `A ${TAIL_TIP_RADIUS} ${TAIL_TIP_RADIUS} 0 0 1 ${tipX + TAIL_TIP_RADIUS * 1.6} ${tipY - TAIL_TIP_RADIUS * 1.8}`,
    `C ${-TAIL_OUT * 0.35} ${h + TAIL_DOWN * 0.45} ${4} ${h + 1} ${0} ${h - bl - TAIL_NECK}`,
    `V ${h - bl}`,
    `A ${bl} ${bl} 0 0 1 ${bl} ${h}`,
    `H ${tailEnd}`,
    "Z",
  ].join(" ");
}

export function buildRoundedBubbleBodyPath(
  w: number,
  h: number,
  corners: CornerRadii
): string {
  return buildRoundedRect(w, h, corners);
}

export function buildBubblePath(
  w: number,
  h: number,
  corners: CornerRadii,
  tail: "left" | "right" | null
): string {
  if (w <= 0 || h <= 0) return "";
  if (!tail) return buildRoundedRect(w, h, corners);
  if (tail === "right") return buildRightTailPath(w, h, corners);
  return buildLeftTailPath(w, h, corners);
}

export function getTailOverflow(tail: "left" | "right" | null) {
  return {
    right: tail === "right" ? TAIL_OUT : 0,
    left: tail === "left" ? TAIL_OUT : 0,
    bottom: tail ? TAIL_DOWN : 0,
  };
}

export function getSvgViewBox(
  w: number,
  h: number,
  tail: "left" | "right" | null
): string {
  const overflow = getTailOverflow(tail);
  const x = tail === "left" ? -overflow.left : 0;
  const width = w + overflow.left + overflow.right;
  const height = h + overflow.bottom;
  return `${x} 0 ${width} ${height}`;
}

export function getSvgSize(
  w: number,
  h: number,
  tail: "left" | "right" | null
) {
  const overflow = getTailOverflow(tail);
  return {
    width: w + overflow.left + overflow.right,
    height: h + overflow.bottom,
    left: tail === "left" ? -overflow.left : 0,
  };
}
