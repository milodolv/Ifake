export const STATUS_BAR_ICON_CHARS: Record<string, string> = {
  wifi: "\u{100647}",
  cellularbars: "\u{100b67}",
  battery: "\u{100eb8}",
};

export type StatusBarIconName = keyof typeof STATUS_BAR_ICON_CHARS;
