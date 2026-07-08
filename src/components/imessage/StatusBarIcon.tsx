import {
  STATUS_BAR_ICON_CHARS,
  StatusBarIconName,
} from "@/lib/statusBarIcons";

interface StatusBarIconProps {
  name: StatusBarIconName;
  size?: number;
  color?: string;
  weight?: number;
}

export function StatusBarIcon({
  name,
  size = 17,
  color = "#FFFFFF",
  weight = 600,
}: StatusBarIconProps) {
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
      }}
    >
      {STATUS_BAR_ICON_CHARS[name]}
    </span>
  );
}
