export type TypingSpeed = "slow" | "normal" | "fast";

const SPEED_MULTIPLIERS: Record<TypingSpeed, number> = {
  slow: 1.45,
  normal: 1,
  fast: 0.6,
};

const AZERTY_KEYS = new Set(
  "AZERTYUIOPQSDFGHJKLMWXCVBN'".split("")
);

const CHAR_TO_KEY: Record<string, string> = {
  "'": "'",
  "`": "'",
  "\u2019": "'",
  é: "E",
  è: "E",
  ê: "E",
  ë: "E",
  à: "A",
  â: "A",
  ù: "U",
  û: "U",
  ü: "U",
  ô: "O",
  ö: "O",
  î: "I",
  ï: "I",
  ç: "C",
};

export function charToKeyLabel(char: string): string | null {
  if (char === " ") return null;

  const mapped = CHAR_TO_KEY[char] ?? char.toUpperCase();
  if (AZERTY_KEYS.has(mapped)) return mapped;
  return null;
}

export function getCharDelay(speed: TypingSpeed = "normal"): number {
  const base = 70;
  const variation = Math.random() * 40 - 20;
  return Math.max(30, Math.round((base + variation) * SPEED_MULTIPLIERS[speed]));
}

export function getCharDelayFixed(
  speed: TypingSpeed = "normal"
): number {
  return Math.round(70 * SPEED_MULTIPLIERS[speed]);
}

export function getPauseBeforeSend(): number {
  return 200 + Math.random() * 200;
}

export function getPauseBeforeSendFixed(): number {
  return 300;
}

const KEYBOARD_OPEN_MS = 16 + 230;
const KEY_PRESS_MS = 50 + 90;
const KEYBOARD_SEND_MS = 180 + 80 + 230;

/** Durée totale de la séquence clavier (timeline / durée contact équivalente). */
export function getKeyboardTypingDurationMs(
  content: string,
  speed: TypingSpeed = "normal"
): number {
  if (content.length === 0) return 0;

  let t = KEYBOARD_OPEN_MS;

  for (let i = 0; i < content.length; i++) {
    if (charToKeyLabel(content[i])) t += KEY_PRESS_MS;
    if (i < content.length - 1) t += getCharDelayFixed(speed);
  }

  t += getPauseBeforeSendFixed();
  t += KEYBOARD_SEND_MS;

  return t;
}

/** Durée indicateur contact = même rythme qu’une frappe clavier invisible. */
export function getContactTypingDurationMs(options: {
  content: string;
  typingSpeed?: TypingSpeed;
  typingDurationMs: number;
  imageUrl?: string;
}): number {
  if (options.imageUrl || options.content.length === 0) {
    return options.typingDurationMs;
  }
  return getKeyboardTypingDurationMs(
    options.content,
    options.typingSpeed ?? "normal"
  );
}
