import {
  KEYBOARD_ICON_CHARS,
  KeyboardIconName,
} from "@/lib/keyboardIcons";
import { IMESSAGE_FONT } from "./theme";

interface KeyboardIconProps {
  name: KeyboardIconName;
  size?: number;
  color?: string;
  className?: string;
  weight?: number;
  strokeWidth?: number;
}

export function KeyboardIcon({
  name,
  size = 20,
  color = "#FFFFFF",
  className = "",
  weight = 400,
  strokeWidth,
}: KeyboardIconProps) {
  return (
    <span
      data-export-icon
      className={className}
      aria-hidden
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        fontFamily:
          '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
        fontSize: size,
        lineHeight: 1,
        fontWeight: weight,
        fontVariationSettings: `"wght" ${weight}`,
        color,
        userSelect: "none",
        pointerEvents: "none",
        ...(strokeWidth != null
          ? {
              WebkitTextStroke: `${strokeWidth}px ${color}`,
              paintOrder: "stroke fill",
            }
          : {}),
      }}
    >
      {KEYBOARD_ICON_CHARS[name]}
    </span>
  );
}

export const KEYBOARD_FONT = IMESSAGE_FONT;

export function Numeric123Label({ fontSize = 21 }: { fontSize?: number }) {
  return (
    <span
      data-export-key-glyphs
      aria-hidden
      style={{
        fontFamily: KEYBOARD_FONT,
        fontSize,
        fontWeight: 700,
        fontVariationSettings: '"wght" 700',
        letterSpacing: "-0.05em",
        color: "#FFFFFF",
        lineHeight: 1,
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      123
    </span>
  );
}

export function ShiftKeyIcon({
  size = 21,
  filled = false,
}: {
  size?: number;
  filled?: boolean;
}) {
  return (
    <KeyboardIcon
      name={filled ? "shift-fill" : "shift"}
      size={size}
      color="#FFFFFF"
      weight={470}
      strokeWidth={0.1}
    />
  );
}

export function EmojiFaceIcon({ size = 25 }: { size?: number }) {
  return (
    <svg
      data-export-icon
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10.2" fill="#FFFFFF" />
      <circle cx="9" cy="10" r="1.45" fill="#636366" />
      <circle cx="15" cy="10" r="1.45" fill="#636366" />
      <path
        d="M8.1 14.1C9.6 16.3 14.4 16.3 15.9 14.1"
        stroke="#636366"
        strokeWidth="1.55"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
