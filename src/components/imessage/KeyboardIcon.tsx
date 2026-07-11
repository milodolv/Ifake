import { IMESSAGE_FONT } from "./theme";

export const KEYBOARD_FONT = IMESSAGE_FONT;

export function Numeric123Label({ fontSize = 21 }: { fontSize?: number }) {
  return (
    <span
      data-export-key-glyphs
      aria-hidden
      data-keyboard-editor-icon
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
