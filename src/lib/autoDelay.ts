const BASE_DELAY_MS = 800;
const MS_PER_CHAR = 50;
const MIN_DELAY_MS = 600;
const MAX_DELAY_MS = 8000;

export function calculateAutoDelay(text: string): number {
  const length = text.trim().length;
  const delay = BASE_DELAY_MS + length * MS_PER_CHAR;
  return Math.min(MAX_DELAY_MS, Math.max(MIN_DELAY_MS, delay));
}

export function getMessageDelay(
  message: { delayMode: "auto" | "manual"; delayMs: number; content: string },
  previousMessageContent?: string
): number {
  if (message.delayMode === "manual") {
    return message.delayMs;
  }
  return calculateAutoDelay(previousMessageContent ?? message.content);
}
