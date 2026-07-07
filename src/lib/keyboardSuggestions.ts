const GENERIC_START = ["Je", "Tu", "C'est"] as const;

const WORD_FOLLOWUPS: Record<string, [string, string, string]> = {
  je: ["suis", "vais", "peux"],
  tu: ["es", "vas", "peux"],
  très: ["bien", "content", "désolé"],
  bien: ["merci", "sûr", "👍"],
  merci: ["et", "beaucoup", "😊"],
  salut: ["!", "comment", "ça"],
  comment: ["ça", "vas", "tu"],
  ça: ["va", "?", "te"],
  et: ["toi", "?", "moi"],
  oui: ["!", "et", "👍"],
  non: ["!", "merci", "😅"],
  super: ["!", "merci", "😊"],
  bon: ["jour", "soir", "ne"],
  coucou: ["!", "comment", "😊"],
};

const EMOJI_SUGGESTIONS = ["😊", "🤩", "🙏"];

function getRemainingTarget(draftText: string, targetText: string): string {
  if (!targetText.startsWith(draftText)) return "";
  return targetText.slice(draftText.length);
}

function nextWordsFromTarget(remaining: string, count: number): string[] {
  const cleaned = remaining.replace(/^[\s,!?…]+/, "");
  if (!cleaned) return [];

  const words = cleaned.split(/\s+/).filter(Boolean);
  const suggestions: string[] = [];

  for (let i = 0; i < words.length && suggestions.length < count; i++) {
    const word = words[i].replace(/[.,!?…]+$/, "");
    if (word) suggestions.push(word);
  }

  return suggestions;
}

function partialWordSuggestions(
  draftText: string,
  targetText: string
): [string, string, string] | null {
  const lastSpace = draftText.lastIndexOf(" ");
  const partial = (lastSpace >= 0 ? draftText.slice(lastSpace + 1) : draftText).toLowerCase();
  if (!partial) return null;

  const targetWords = targetText.toLowerCase().split(/\s+/);
  const draftWords = draftText.toLowerCase().trim().split(/\s+/);
  const targetWord = targetWords[draftWords.length - 1];

  if (targetWord?.startsWith(partial) && targetWord !== partial) {
    return [targetWord, `${partial}…`, partial.length > 2 ? partial.slice(0, -1) : "…"];
  }

  const completions = Object.keys(WORD_FOLLOWUPS).filter(
    (w) => w.startsWith(partial) && w !== partial
  );

  if (completions.length > 0) {
    return [completions[0], completions[1] ?? partial, completions[2] ?? "…"];
  }

  return null;
}

export function getKeyboardSuggestions(
  draftText: string,
  targetText?: string | null
): [string, string, string] {
  if (!draftText.trim()) {
    return [...GENERIC_START];
  }

  if (targetText?.startsWith(draftText)) {
    const remaining = getRemainingTarget(draftText, targetText);
    const endsWithSpace = draftText.endsWith(" ");

    if (!endsWithSpace) {
      const partial = partialWordSuggestions(draftText, targetText);
      if (partial) return partial;
    }

    const nextWords = nextWordsFromTarget(remaining, 2);
    if (nextWords.length > 0) {
      const second =
        nextWords[0] === "et" && nextWords[1] === "toi"
          ? "es-tu"
          : (nextWords[1] ?? "es-tu");
      return [nextWords[0], second, EMOJI_SUGGESTIONS.join(" ")];
    }
  }

  const lastWord = draftText.trim().split(/\s+/).pop()?.toLowerCase() ?? "";
  const followups = WORD_FOLLOWUPS[lastWord];
  if (followups) return followups;

  const partial = partialWordSuggestions(draftText, targetText ?? draftText);
  if (partial) return partial;

  return ["et", "es-tu", EMOJI_SUGGESTIONS.join(" ")];
}
