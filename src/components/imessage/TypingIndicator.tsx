"use client";

import { IMESSAGE } from "./theme";

interface TypingIndicatorProps {
  darkMode: boolean;
  /** Vitesse de lecture de l’animation (1 = normal). */
  playbackRate?: number;
  paused?: boolean;
}

/** Corps principal — pilule typing indicator iOS. */
const BODY_W = 67;
const BODY_H = 40;
const PILL_LEFT = 12;
const PILL_TOP = 0;

const DOT_SIZE = 9.5;
const DOT_GAP = 6;
const DOT_CYCLE_MS = 1000;

/** Queue typing : 2 cercles séparés (moyen + petit), distincte des queues messages. */
const TAIL_MEDIUM_R = 7;
const TAIL_SMALL_R = 3.5;
const TAIL_BALL_GAP = 0;

const MEDIUM_CX = PILL_LEFT + 9;
const MEDIUM_CY = PILL_TOP + BODY_H - 2;
const SMALL_CX = MEDIUM_CX - 9;
const SMALL_CY = MEDIUM_CY + TAIL_MEDIUM_R + TAIL_BALL_GAP + TAIL_SMALL_R;

const CANVAS_W = PILL_LEFT + BODY_W + 4;
const CANVAS_H = SMALL_CY + TAIL_SMALL_R + 2;

/** Décalage interne — bord gauche pilule dans le canvas SVG. */
export const TYPING_INDICATOR_PILL_INSET_X = PILL_LEFT;
const TYPING_DOT_ACTIVE_DARK = "#98989D";
const TYPING_DOT_ACTIVE_LIGHT = "#7C7C80";

export function TypingIndicator({
  darkMode,
  playbackRate = 1,
  paused = false,
}: TypingIndicatorProps) {
  const bubbleBg = darkMode
    ? IMESSAGE.bubbleContactDark
    : IMESSAGE.bubbleContactLight;
  const dotActive = darkMode ? TYPING_DOT_ACTIVE_DARK : TYPING_DOT_ACTIVE_LIGHT;
  const dotCycleMs = DOT_CYCLE_MS / Math.max(playbackRate, 0.1);

  return (
    <div
      className="relative pointer-events-none"
      style={{
        width: CANVAS_W,
        height: CANVAS_H,
      }}
      aria-hidden
    >
      <svg
        width={CANVAS_W}
        height={CANVAS_H}
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
        fill="none"
        className="absolute top-0 left-0"
      >
        <rect
          x={PILL_LEFT}
          y={PILL_TOP}
          width={BODY_W}
          height={BODY_H}
          rx={BODY_H / 2}
          fill={bubbleBg}
        />
        <circle cx={MEDIUM_CX} cy={MEDIUM_CY} r={TAIL_MEDIUM_R} fill={bubbleBg} />
        <circle cx={SMALL_CX} cy={SMALL_CY} r={TAIL_SMALL_R} fill={bubbleBg} />
      </svg>

      <div
        className="absolute flex items-center justify-center"
        style={{
          left: PILL_LEFT,
          top: PILL_TOP,
          width: BODY_W,
          height: BODY_H,
          gap: DOT_GAP,
        }}
      >
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={`rounded-full ifake-typing-dot ifake-typing-dot-${index} shrink-0`}
            style={{
              width: DOT_SIZE,
              height: DOT_SIZE,
              backgroundColor: dotActive,
              animationDuration: `${dotCycleMs}ms`,
              animationPlayState: paused ? "paused" : "running",
            }}
          />
        ))}
      </div>
    </div>
  );
}
