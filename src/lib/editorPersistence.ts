import {
  ConversationSettings,
  Message,
  normalizeSettings,
  normalizeMessage,
} from "./types";

const STORAGE_KEY = "ifake_editor_draft";

export interface ImportDraft {
  importText: string;
  importedImageUrl?: string;
  showVideoOverlay: boolean;
}

export const EMPTY_IMPORT_DRAFT: ImportDraft = {
  importText: "",
  showVideoOverlay: true,
};

export interface EditorDraft {
  settings: ConversationSettings;
  messages: Message[];
  importDraft?: ImportDraft;
}

function isValidMessage(value: unknown): value is Message {
  if (!value || typeof value !== "object") return false;
  const m = value as Message;
  return (
    typeof m.id === "string" &&
    typeof m.content === "string" &&
    (m.sender === "me" || m.sender === "contact")
  );
}

function normalizeImportDraft(value: unknown): ImportDraft {
  if (!value || typeof value !== "object") {
    return { ...EMPTY_IMPORT_DRAFT };
  }

  const draft = value as Partial<ImportDraft>;
  return {
    importText:
      typeof draft.importText === "string" ? draft.importText : "",
    importedImageUrl:
      typeof draft.importedImageUrl === "string"
        ? draft.importedImageUrl
        : undefined,
    showVideoOverlay: draft.showVideoOverlay !== false,
  };
}

export function loadEditorDraft(): EditorDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw) as Partial<EditorDraft>;
    if (!Array.isArray(data.messages)) return null;
    if (!data.messages.every(isValidMessage)) return null;

    return {
      settings: normalizeSettings(data.settings ?? {}),
      messages: data.messages.map(normalizeMessage),
      importDraft: normalizeImportDraft(data.importDraft),
    };
  } catch {
    return null;
  }
}

export function saveEditorDraft(
  settings: ConversationSettings,
  messages: Message[],
  importDraft: ImportDraft = EMPTY_IMPORT_DRAFT
): void {
  if (typeof window === "undefined") return;

  try {
    const draft: EditorDraft = { settings, messages, importDraft };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Ignore quota / private mode errors.
  }
}

export function clearEditorDraft(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
