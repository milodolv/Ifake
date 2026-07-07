export type Sender = "me" | "contact";

export type DelayMode = "auto" | "manual";

export interface Message {
  id: string;
  content: string;
  imageUrl?: string;
  sender: Sender;
  delayMode: DelayMode;
  delayMs: number;
  showTyping: boolean;
  typingDurationMs: number;
  showKeyboardTyping?: boolean;
  typingSpeed?: "slow" | "normal" | "fast";
  showTimestamp: boolean;
  timestampText: string;
  timestampMode: "auto" | "manual";
}

export interface ConversationSettings {
  contactName: string;
  contactPhotoUrl?: string;
  imessageDarkMode: boolean;
  showStatusBar: boolean;
  statusBarTime: string;
  showReadReceipt: boolean;
  readReceiptType: "delivered" | "read";
  readReceiptTime: string;
  readReceiptDate: string;
  readReceiptIsToday: boolean;
}

export interface ConversationData {
  settings: ConversationSettings;
  messages: Message[];
}

export interface Template {
  id: string;
  name: string;
  created_at: string;
  data: ConversationData;
  user_id?: string;
}

export interface AnimationState {
  visibleMessageIds: string[];
  isTyping: boolean;
  typingSender: Sender | null;
  activeTimestamps: Record<string, string>;
  showReadReceipt: boolean;
  isPlaying: boolean;
  isComplete: boolean;
  showKeyboard: boolean;
  keyboardOpen: boolean;
  draftText: string;
  pressedKey: string | null;
  showSendButton: boolean;
  keyboardTargetText: string | null;
}

export const DEFAULT_SETTINGS: ConversationSettings = {
  contactName: "Adonis",
  imessageDarkMode: true,
  showStatusBar: true,
  statusBarTime: "9:41",
  showReadReceipt: false,
  readReceiptType: "read",
  readReceiptTime: "14:32",
  readReceiptDate: "05/05/2026",
  readReceiptIsToday: false,
};

export function normalizeSettings(
  settings: Partial<ConversationSettings>
): ConversationSettings {
  return { ...DEFAULT_SETTINGS, ...settings };
}

export const createDefaultMessage = (sender: Sender = "contact"): Message => ({
  id: crypto.randomUUID(),
  content: "",
  sender,
  delayMode: "auto",
  delayMs: 1500,
  showTyping: false,
  typingDurationMs: 1200,
  showKeyboardTyping: sender === "me",
  typingSpeed: "normal",
  showTimestamp: false,
  timestampText: "Aujourd'hui 14:32",
  timestampMode: "auto",
});
