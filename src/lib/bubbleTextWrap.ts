/** Largeur cible iMessage (~30 car.) — point de départ pour l'équilibrage. */
export const BUBBLE_TARGET_CHARS_PER_LINE = 30;

/** Plafond absolu (largeur max de bulle sur l'écran). */
export const BUBBLE_ABSOLUTE_MAX_CHARS = 36;

/** Marge minimale avant le bord droit (car. proportionnels ≈ padding bulle). */
export const BUBBLE_MIN_LINE_RIGHT_SLACK = 4;

function getLineCharLimit(maxChars: number): number {
  return Math.min(maxChars, BUBBLE_TARGET_CHARS_PER_LINE) - BUBBLE_MIN_LINE_RIGHT_SLACK;
}

/** Largeur visuelle estimée (majuscules / chiffres plus larges en Inter 19px). */
function estimateVisualLineUnits(text: string): number {
  let units = 0;
  for (const char of text) {
    if (/[A-ZÀ-ÖØ-Þ0-9]/.test(char)) units += 1.12;
    else if (/[!?…]/.test(char)) units += 1.06;
    else units += 1;
  }
  return units;
}

function fitsLineLimit(text: string, lineLimit: number): boolean {
  return (
    text.length <= lineLimit &&
    estimateVisualLineUnits(text) <= lineLimit + 0.25
  );
}

/**
 * Découpe le texte en lignes de max `maxChars` caractères, sans couper un mot.
 */
export function wrapBubbleTextAtMax(text: string, maxChars: number): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [""];

  const lineLimit = getLineCharLimit(maxChars);
  const words = trimmed.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (fitsLineLimit(candidate, lineLimit)) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
    currentLine = word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Remonte des mots de la ligne suivante tant qu'ils tiennent sur la ligne courante.
 */
function fillLinesUpward(lines: string[], maxChars: number): string[] {
  if (lines.length < 2) return lines;

  const lineLimit = getLineCharLimit(maxChars);
  const result = [...lines];
  let changed = true;

  while (changed) {
    changed = false;

    for (let i = 0; i < result.length - 1; i++) {
      const nextWords = result[i + 1].split(/\s+/).filter(Boolean);
      if (nextWords.length === 0) continue;

      const firstWord = nextWords[0];
      const candidate = result[i] ? `${result[i]} ${firstWord}` : firstWord;

      if (fitsLineLimit(candidate, lineLimit)) {
        result[i] = candidate;
        const remainder = nextWords.slice(1).join(" ");
        if (remainder) {
          result[i + 1] = remainder;
        } else {
          result.splice(i + 1, 1);
        }
        changed = true;
        break;
      }
    }
  }

  return result;
}

/**
 * Déplace le dernier mot d'une ligne pleine vers la suivante quand celle-ci
 * est nettement plus courte — même marge visuelle à droite dans la bulle.
 * Uniquement pour les messages de 3 lignes ou plus.
 */
function rebalanceLineFill(lines: string[]): string[] {
  if (lines.length < 3) return lines;

  const result = [...lines];
  let changed = true;

  while (changed) {
    changed = false;
    const maxLen = Math.max(...result.map((line) => line.length));

    for (let i = 0; i < result.length - 1; i++) {
      const line = result[i];
      const nextLine = result[i + 1];
      const words = line.split(/\s+/);
      if (words.length <= 1) continue;

      const lineLen = line.length;
      const nextLen = nextLine.length;

      if (lineLen >= maxLen - 1 && nextLen < lineLen - 6) {
        const lastWord = words[words.length - 1];
        const newCurrent = words.slice(0, -1).join(" ");
        const newNext = `${lastWord} ${nextLine}`;

        if (newCurrent.length > 0 && newNext.length <= maxLen) {
          result[i] = newCurrent;
          result[i + 1] = newNext;
          changed = true;
          break;
        }
      }
    }
  }

  return result;
}

function scoreBubbleLayout(
  lines: string[],
  totalChars: number,
  maxChars: number
): number {
  if (lines.length <= 1) {
    return Math.abs(maxChars - BUBBLE_TARGET_CHARS_PER_LINE) * 0.3;
  }

  const lengths = lines.map((l) => l.length);
  const maxLen = Math.max(...lengths);

  // Slack des lignes intermédiaires uniquement — la dernière peut être plus courte.
  const slack = lengths
    .slice(0, -1)
    .reduce((sum, len) => sum + (maxLen - len), 0);
  const lastSlack = maxLen - lengths[lengths.length - 1];

  let penalty = 0;
  const lastLen = lengths[lengths.length - 1];

  if (lastLen <= 1) penalty += 100;
  else if (lastLen <= 3) penalty += 50;
  else if (lastLen <= 6) penalty += 20;
  else if (lastLen < maxLen * 0.5) penalty += 10;

  const targetLines = Math.max(
    1,
    Math.ceil(totalChars / BUBBLE_TARGET_CHARS_PER_LINE)
  );
  penalty += Math.abs(lines.length - targetLines) * 35;

  for (let i = 0; i < lengths.length - 1; i++) {
    if (lengths[i] <= 6) penalty += 45;
  }

  if (maxLen > BUBBLE_ABSOLUTE_MAX_CHARS) {
    penalty += (maxLen - BUBBLE_ABSOLUTE_MAX_CHARS) * 25;
  }

  penalty += Math.abs(maxChars - BUBBLE_TARGET_CHARS_PER_LINE) * 2;

  return slack + lastSlack * 0.25 + penalty;
}

/**
 * Équilibre les lignes comme iMessage : largeur variable selon le nombre
 * de lignes, sans mot orphelin ni lignes quasi vides.
 */
export function wrapBubbleText(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [""];

  const words = trimmed.split(/\s+/);
  const longestWord = Math.max(...words.map((w) => w.length));
  const minMax = Math.max(longestWord, 1);
  const totalChars = trimmed.length;
  const targetLines = Math.max(
    1,
    Math.ceil(totalChars / BUBBLE_TARGET_CHARS_PER_LINE)
  );

  if (targetLines === 2) {
    const twoLine = pickBestTwoLineLayout(trimmed);
    if (twoLine) return twoLine;
  }

  let bestLines = layoutBubbleLines(trimmed, BUBBLE_TARGET_CHARS_PER_LINE);
  let bestScore = scoreBubbleLayout(
    bestLines,
    totalChars,
    BUBBLE_TARGET_CHARS_PER_LINE
  );

  for (let maxChars = minMax; maxChars <= BUBBLE_ABSOLUTE_MAX_CHARS; maxChars++) {
    const lines = layoutBubbleLines(trimmed, maxChars);
    const score = scoreBubbleLayout(lines, totalChars, maxChars);
    if (score < bestScore) {
      bestScore = score;
      bestLines = lines;
    }
  }

  return bestLines;
}

function layoutBubbleLines(text: string, maxChars: number): string[] {
  const lines = fillLinesUpward(wrapBubbleTextAtMax(text, maxChars), maxChars);
  return rebalanceLineFill(lines);
}

/** Pour 2 lignes : remplit au maximum la première avant de couper. */
function isAcceptableTwoLineLayout(lines: string[]): boolean {
  const last = lines[1].trim();
  const lastWords = last.split(/\s+/).filter(Boolean);
  if (lastWords.length >= 2) return true;
  return last.length >= 6;
}

function pickBestTwoLineLayout(text: string): string[] | null {
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/);
  const minMax = Math.max(...words.map((w) => w.length), 1);

  let bestLines: string[] | null = null;
  let bestFirstLen = 0;

  for (let maxChars = minMax; maxChars <= BUBBLE_ABSOLUTE_MAX_CHARS; maxChars++) {
    const lines = layoutBubbleLines(trimmed, maxChars);
    if (lines.length !== 2 || !isAcceptableTwoLineLayout(lines)) continue;

    const firstLen = lines[0].length;
    if (firstLen > bestFirstLen) {
      bestFirstLen = firstLen;
      bestLines = lines;
    }
  }

  return bestLines;
}

/** Ligne la plus longue après équilibrage — usage interne alignement dernière bulle. */
export function getWidestBubbleLine(text: string): string {
  const lines = wrapBubbleText(text);
  return lines.reduce(
    (widest, line) => (line.length >= widest.length ? line : widest),
    ""
  );
}
