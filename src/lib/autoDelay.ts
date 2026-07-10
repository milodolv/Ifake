/** Délai de base avant chaque message (mode auto). */
export const AUTO_DELAY_BASE_MS = 400;
/** Millisecondes ajoutées par caractère du message précédent. */
export const AUTO_DELAY_MS_PER_CHAR = 24;
export const AUTO_DELAY_MIN_MS = 320;
export const AUTO_DELAY_MAX_MS = 4500;

/** Délai manuel par défaut (si bascule en mode manuel). */
export const DEFAULT_MESSAGE_DELAY_MS = 700;

export function calculateAutoDelay(text: string): number {
  const length = text.trim().length;
  const delay = AUTO_DELAY_BASE_MS + length * AUTO_DELAY_MS_PER_CHAR;
  return Math.min(
    AUTO_DELAY_MAX_MS,
    Math.max(AUTO_DELAY_MIN_MS, delay)
  );
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

export function formatAutoDelayFormula(): string {
  return `${AUTO_DELAY_BASE_MS} + ${AUTO_DELAY_MS_PER_CHAR}/car.`;
}
