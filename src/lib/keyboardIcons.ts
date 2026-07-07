export const KEYBOARD_ICON_CHARS: Record<string, string> = {
  "delete-left": "\u{10019b}",
  shift: "\u{10019d}",
  return: "\u{100147}",
  "face-smiling": "\u{1003b8}",
  globe: "\u{1001aa}",
  mic: "\u{1002b0}",
  "123": "\u{100171}",
  "arrow-up": "\u{100128}",
  plus: "\u{10017c}",
};

export type KeyboardIconName = keyof typeof KEYBOARD_ICON_CHARS;
