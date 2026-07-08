import {
  HEADER_ICON_CHARS,
  HeaderIconName,
} from "@/lib/headerIcons";

interface HeaderIconProps {
  name: HeaderIconName;
  size?: number;
  color?: string;
  weight?: number;
  strokeWidth?: number;
}

export function HeaderIcon({
  name,
  size = 17,
  color = "#FFFFFF",
  weight = 560,
  strokeWidth = 0.35,
}: HeaderIconProps) {
  return (
    <span
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
        WebkitTextStroke: `${strokeWidth}px ${color}`,
        paintOrder: "stroke fill",
      }}
    >
      {HEADER_ICON_CHARS[name]}
    </span>
  );
}
