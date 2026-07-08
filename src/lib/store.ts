"use client";

import { create } from "zustand";
import {
  ConversationSettings,
  Message,
  DEFAULT_SETTINGS,
  createDefaultMessage,
  AnimationState,
  normalizeSettings,
} from "./types";
import { DEFAULT_ANIMATION_STATE } from "./animationDefaults";
import {
  advanceBatteryForNewConversation,
} from "./batterySimulation";
import { formatTime24 } from "./formatTime24";

interface EditorStore {
  settings: ConversationSettings;
  messages: Message[];
  animation: AnimationState;
  setSettings: (partial: Partial<ConversationSettings>) => void;
  addMessage: () => void;
  updateMessage: (id: string, partial: Partial<Message>) => void;
  removeMessage: (id: string) => void;
  duplicateMessage: (id: string) => void;
  moveMessage: (id: string, direction: "up" | "down") => void;
  setAnimation: (partial: Partial<AnimationState>) => void;
  resetAnimation: () => void;
  loadConversation: (settings: ConversationSettings, messages: Message[]) => void;
  newConversation: () => void;
}

const initialAnimation: AnimationState = { ...DEFAULT_ANIMATION_STATE };

const DEFAULT_MESSAGE_IDS = {
  contact: "seed-message-contact",
  me: "seed-message-me",
} as const;

const defaultMessages = (): Message[] => [
  {
    ...createDefaultMessage("contact"),
    id: DEFAULT_MESSAGE_IDS.contact,
    content: "Salut ! Comment ça va ?",
  },
  {
    ...createDefaultMessage("me"),
    id: DEFAULT_MESSAGE_IDS.me,
    content: "Très bien merci, et toi ?",
  },
];

export const useEditorStore = create<EditorStore>((set, get) => ({
  settings: { ...DEFAULT_SETTINGS },
  messages: defaultMessages(),
  animation: { ...initialAnimation },

  setSettings: (partial) =>
    set((s) => ({ settings: { ...s.settings, ...partial } })),

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
      messages,
      animation: {
        ...initialAnimation,
        visibleMessageIds: messages.map((m) => m.id),
      },
    }),

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
}));

// Preview mode: show all messages by default when not animating
export function usePreviewAnimation(): AnimationState {
  const animation = useEditorStore((s) => s.animation);
  const messages = useEditorStore((s) => s.messages);
  const settings = useEditorStore((s) => s.settings);

  if (animation.isPlaying || animation.isComplete) {
    return animation;
  }

  return {
    ...animation,
    visibleMessageIds: messages.map((m) => m.id),
    showReadReceipt: settings.showReadReceipt,
  };
}
