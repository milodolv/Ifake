"use client";

import { create } from "zustand";
import {
  ConversationSettings,
  Message,
  Sender,
  DEFAULT_SETTINGS,
  createDefaultMessage,
  AnimationState,
  normalizeMessage,
  normalizeSettings,
} from "./types";
import { DEFAULT_ANIMATION_STATE } from "./animationDefaults";
import {
  advanceBatteryForNewConversation,
} from "./batterySimulation";
import { formatTime24 } from "./formatTime24";
import {
  EMPTY_IMPORT_DRAFT,
  ImportDraft,
  saveEditorDraft,
} from "./editorPersistence";

interface EditorStore {
  settings: ConversationSettings;
  messages: Message[];
  importDraft: ImportDraft;
  animation: AnimationState;
  setSettings: (partial: Partial<ConversationSettings>) => void;
  setImportDraft: (partial: Partial<ImportDraft>) => void;
  addMessage: () => void;
  updateMessage: (id: string, partial: Partial<Message>) => void;
  removeMessage: (id: string) => void;
  duplicateMessage: (id: string) => void;
  moveMessage: (id: string, direction: "up" | "down") => void;
  setAnimation: (partial: Partial<AnimationState>) => void;
  resetAnimation: () => void;
  loadConversation: (settings: ConversationSettings, messages: Message[]) => void;
  importMessages: (
    entries: {
      sender: Sender;
      content: string;
      imageUrl?: string;
      showVideoOverlay?: boolean;
    }[]
  ) => void;
  newConversation: () => void;
  clearAll: () => void;
}

const initialAnimation: AnimationState = { ...DEFAULT_ANIMATION_STATE };

const DEFAULT_MESSAGE_IDS = {
  contact1: "seed-message-contact-1",
  me1: "seed-message-me-1",
  me2: "seed-message-me-2",
  contact2: "seed-message-contact-2",
  contact3: "seed-message-contact-3",
  me3: "seed-message-me-3",
  me4: "seed-message-me-4",
} as const;

const defaultMessages = (): Message[] => [
  {
    ...createDefaultMessage("contact"),
    id: DEFAULT_MESSAGE_IDS.contact1,
    content: "Salut ! Comment ça va ?",
  },
  {
    ...createDefaultMessage("me"),
    id: DEFAULT_MESSAGE_IDS.me1,
    content: "Très bien merci, et toi ?",
  },
  {
    ...createDefaultMessage("me"),
    id: DEFAULT_MESSAGE_IDS.me2,
    content: "T'es rentré ?",
  },
  {
    ...createDefaultMessage("contact"),
    id: DEFAULT_MESSAGE_IDS.contact2,
    content: "Oui ça va, merci 👍",
  },
  {
    ...createDefaultMessage("contact"),
    id: DEFAULT_MESSAGE_IDS.contact3,
    content: "Oui je suis rentré à la maison.",
  },
  {
    ...createDefaultMessage("me"),
    id: DEFAULT_MESSAGE_IDS.me3,
    content:
      "Super, bah je vais rentrer bientôt aussi. Je ferrai mes devoirs en rentrant, tu préviens maman pour moi !",
  },
  {
    ...createDefaultMessage("me"),
    id: DEFAULT_MESSAGE_IDS.me4,
    content:
      "Et n'oublie pas de lui raconter comment je m'en suis bien sorti au foot aujourd'hui !",
  },
];

export const useEditorStore = create<EditorStore>((set, get) => ({
  settings: { ...DEFAULT_SETTINGS },
  messages: defaultMessages(),
  importDraft: { ...EMPTY_IMPORT_DRAFT },
  animation: { ...initialAnimation },

  setSettings: (partial) =>
    set((s) => ({ settings: { ...s.settings, ...partial } })),

  setImportDraft: (partial) =>
    set((s) => ({ importDraft: { ...s.importDraft, ...partial } })),

  addMessage: () =>
    set((s) => ({
      messages: [...s.messages, createDefaultMessage("me")],
    })),

  updateMessage: (id, partial) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, ...partial } : m
      ),
    })),

  removeMessage: (id) =>
    set((s) => ({
      messages: s.messages.filter((m) => m.id !== id),
    })),

  duplicateMessage: (id) => {
    const msg = get().messages.find((m) => m.id === id);
    if (!msg) return;
    const copy: Message = {
      ...msg,
      id: crypto.randomUUID(),
    };
    set((s) => {
      const idx = s.messages.findIndex((m) => m.id === id);
      const messages = [...s.messages];
      messages.splice(idx + 1, 0, copy);
      return { messages };
    });
  },

  moveMessage: (id, direction) =>
    set((s) => {
      const idx = s.messages.findIndex((m) => m.id === id);
      if (idx === -1) return s;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= s.messages.length) return s;
      const messages = [...s.messages];
      [messages[idx], messages[newIdx]] = [messages[newIdx], messages[idx]];
      return { messages };
    }),

  setAnimation: (partial) =>
    set((s) => ({ animation: { ...s.animation, ...partial } })),

  resetAnimation: () =>
    set((s) => ({
      animation: {
        ...initialAnimation,
        visibleMessageIds: s.messages.map((m) => m.id),
      },
    })),

  loadConversation: (settings, messages) =>
    set({
      settings: normalizeSettings(settings),
      messages: messages.map(normalizeMessage),
      animation: {
        ...initialAnimation,
        visibleMessageIds: messages.map((m) => m.id),
      },
    }),

  importMessages: (entries) => {
    const messages = entries.map((entry) =>
      normalizeMessage({
        ...createDefaultMessage(entry.sender),
        content: entry.imageUrl ? "" : entry.content,
        imageUrl: entry.imageUrl,
        showVideoOverlay: entry.imageUrl ? entry.showVideoOverlay ?? true : undefined,
      })
    );

    set({
      messages,
      animation: {
        ...initialAnimation,
        visibleMessageIds: messages.map((m) => m.id),
      },
    });
  },

  newConversation: () => {
    const prev = get().settings;
    const timeHint = prev.statusBarLiveTime
      ? formatTime24()
      : prev.statusBarTime;
    const level = prev.statusBarBatteryAuto
      ? advanceBatteryForNewConversation(timeHint)
      : prev.statusBarBatteryLevel;

    set({
      settings: {
        ...DEFAULT_SETTINGS,
        statusBarBatteryLevel: level,
        statusBarBatteryAuto: prev.statusBarBatteryAuto,
      },
      messages: defaultMessages(),
      animation: { ...initialAnimation },
    });
  },

  clearAll: () => {
    const prev = get().settings;
    const clearedImport = { ...EMPTY_IMPORT_DRAFT };
    const clearedMessages: Message[] = [];

    const clearedSettings: ConversationSettings = {
      ...DEFAULT_SETTINGS,
      imessageDarkMode: prev.imessageDarkMode,
      showStatusBar: prev.showStatusBar,
      statusBarLiveTime: prev.statusBarLiveTime,
      statusBarTime: prev.statusBarTime,
      statusBarBatteryLevel: prev.statusBarBatteryLevel,
      statusBarBatteryAuto: prev.statusBarBatteryAuto,
      showReadReceipt: prev.showReadReceipt,
      readReceiptType: prev.readReceiptType,
      readReceiptTime: prev.readReceiptTime,
      readReceiptDate: prev.readReceiptDate,
      readReceiptIsToday: prev.readReceiptIsToday,
      contactName: "",
      contactPhotoUrl: undefined,
    };

    set({
      settings: clearedSettings,
      messages: clearedMessages,
      importDraft: clearedImport,
      animation: { ...initialAnimation },
    });

    saveEditorDraft(clearedSettings, clearedMessages, clearedImport);
  },
}));

// Preview mode: show all messages by default when not animating
export function usePreviewAnimation(): AnimationState {
  const animation = useEditorStore((s) => s.animation);
  const messages = useEditorStore((s) => s.messages);
  const settings = useEditorStore((s) => s.settings);

  if (animation.isPlaying) {
    return animation;
  }

  return {
    ...animation,
    visibleMessageIds: messages.map((m) => m.id),
    showReadReceipt: settings.showReadReceipt,
    isComplete: false,
  };
}
