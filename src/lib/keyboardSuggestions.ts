const GENERIC_START = ["Je", "Tu", "C'est"] as const;

const WORD_FOLLOWUPS: Record<string, [string, string]> = {
  je: ["suis", "vais"],
  tu: ["es", "vas"],
  très: ["bien", "content"],
  bien: ["merci", "sûr"],
  merci: ["et", "beaucoup"],
  salut: ["!", "comment"],
  comment: ["ça", "vas"],
  ça: ["va", "?"],
  et: ["toi", "?"],
  oui: ["!", "et"],
  non: ["!", "merci"],
  super: ["!", "merci"],
  bon: ["jour", "soir"],
  coucou: ["!", "comment"],
};

/** Dictionnaire de complétions — mots entiers, sans « … ». */
const COMPLETION_DICTIONARY = [
  "n'oublie",
  "n'oubliez",
  "n'oublier",
  "n'oublierai",
  "n'oublieras",
  "oublie",
  "oublier",
  "oubliez",
  "m'en",
  "m'envoyer",
  "m'entendre",
  "m'excuser",
  "m'appeler",
  "m'attendre",
  "j'ai",
  "j'aime",
  "j'arrive",
  "j'espère",
  "t'es",
  "t'as",
  "c'est",
  "qu'il",
  "qu'elle",
  "d'accord",
  "lui",
  "raconter",
  "comment",
  "bientôt",
  "rentrer",
  "rentré",
  "devoirs",
  "préviens",
  "maman",
  "sorti",
  "aujourd'hui",
  "football",
  "foot",
  "es-tu",
  "merci",
  "salut",
  "super",
  "bien",
  "très",
  "pas",
  "pour",
  "que",
  "qui",
  "avec",
  "dans",
  "chez",
  "aussi",
];

const TRAILING_PUNCT_RE = /[.,!?…:;]+$/;

function splitWordAndPunctuation(token: string): {
  word: string;
  trailingPunct: string;
} {
  const trailingPunct = token.match(TRAILING_PUNCT_RE)?.[0] ?? "";
  const word = trailingPunct
    ? token.slice(0, token.length - trailingPunct.length)
    : token;
  return { word, trailingPunct };
}

/** Mot en cours de frappe (après le dernier espace, sans espace final). */
export function getCurrentDraftWord(draftText: string): string {
  if (!draftText || draftText.endsWith(" ")) return "";
  const lastSpace = draftText.lastIndexOf(" ");
  return lastSpace >= 0 ? draftText.slice(lastSpace + 1) : draftText;
}

function collectDictionaryWords(targetText?: string | null): string[] {
  const words = new Set<string>(COMPLETION_DICTIONARY);

  if (targetText) {
    for (const token of targetText.split(/\s+/)) {
      const { word } = splitWordAndPunctuation(token);
      if (word) words.add(word.toLowerCase());
    }
  }

  for (const key of Object.keys(WORD_FOLLOWUPS)) {
    words.add(key);
    for (const w of WORD_FOLLOWUPS[key]) {
      if (w.length > 1 && !/^[?!.,…]+$/.test(w)) words.add(w.toLowerCase());
    }
  }

  return Array.from(words);
}

function getPartialCompletions(
  partialRaw: string,
  targetText?: string | null
): [string, string] {
  const partial = partialRaw.toLowerCase();
  if (!partial) return ["", ""];

  const matches = collectDictionaryWords(targetText).filter(
    (word) => word.startsWith(partial) && word !== partial
  );

  matches.sort((a, b) => a.length - b.length || a.localeCompare(b, "fr"));

  return [matches[0] ?? "", matches[1] ?? ""];
}

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
    const { word } = splitWordAndPunctuation(words[i]);
    if (word) suggestions.push(word);
  }

  return suggestions;
}

function getPostSpaceSuggestions(
  draftText: string,
  targetText?: string | null
): [string, string] {
  if (targetText?.startsWith(draftText)) {
    const next = nextWordsFromTarget(getRemainingTarget(draftText, targetText), 2);
    return [next[0] ?? "", next[1] ?? ""];
  }

  const lastWord =
    splitWordAndPunctuation(
      draftText.trim().split(/\s+/).pop() ?? ""
    ).word.toLowerCase();
  const followups = WORD_FOLLOWUPS[lastWord];
  if (followups) return [followups[0], followups[1]];

  return ["", ""];
}

export function getKeyboardSuggestions(
  draftText: string,
  targetText?: string | null
): [string, string, string] {
  if (!draftText.trim()) {
    return [...GENERIC_START];
  }

  const rawWord = getCurrentDraftWord(draftText);

  if (rawWord) {
    const { word, trailingPunct } = splitWordAndPunctuation(rawWord);
    const s1 = word ? `«${word}»${trailingPunct}` : "";
    const [s2, s3] = word
      ? getPartialCompletions(word, targetText)
      : ["", ""];
    return [s1, s2, s3];
  }

  const [s2, s3] = getPostSpaceSuggestions(draftText, targetText);
  return ["", s2, s3];
}
