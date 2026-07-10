import { Message, ConversationSettings, AnimationState } from "./types";
import { getMessageDelay } from "./autoDelay";
import { formatDate, sleep } from "./utils";
import { resetAnimationFields, resetDraftFields, endAnimationKeyboardFields } from "./animationDefaults";
import {
  charToKeyLabel,
  getCharDelay,
  getPauseBeforeSend,
  getContactTypingDurationMs,
  TypingSpeed,
} from "./keyboardTyping";

export type AnimationCallbacks = {
  onUpdate: (state: Partial<AnimationState>) => void;
  onSound?: (type: "send" | "receive") => void;
  shouldStop?: () => boolean;
};

function shouldUseKeyboardTyping(message: Message): boolean {
  return (
    message.sender === "me" &&
    message.showKeyboardTyping !== false &&
    !message.imageUrl &&
    message.content.length > 0
  );
}

async function openKeyboardIfNeeded(
  onUpdate: AnimationCallbacks["onUpdate"],
  shouldStop?: () => boolean,
  alreadyOpen?: boolean
): Promise<boolean> {
  if (alreadyOpen) return true;

  onUpdate({
    ...resetDraftFields(),
    showKeyboard: true,
    keyboardOpen: false,
  });
  await sleep(16);
  onUpdate({ keyboardOpen: true });
  await sleep(230);
  if (shouldStop?.()) return false;
  return true;
}

async function playKeyboardTyping(
  message: Message,
  onUpdate: AnimationCallbacks["onUpdate"],
  shouldStop?: () => boolean,
  keyboardAlreadyOpen = false
): Promise<void> {
  const speed = (message.typingSpeed ?? "normal") as TypingSpeed;
  const text = message.content;

  if (!(await openKeyboardIfNeeded(onUpdate, shouldStop, keyboardAlreadyOpen))) {
    return;
  }

  onUpdate({
    ...resetDraftFields(),
    keyboardTargetText: text,
  });

  for (let i = 0; i < text.length; i++) {
    if (shouldStop?.()) return;

    const char = text[i];
    const keyLabel = charToKeyLabel(char);

    if (keyLabel) {
      onUpdate({ pressedKey: keyLabel });
      await sleep(50);
    }

    onUpdate({ draftText: text.slice(0, i + 1) });

    if (keyLabel) {
      await sleep(90);
      onUpdate({ pressedKey: null });
    }

    if (i < text.length - 1) {
      await sleep(getCharDelay(speed));
    }
  }

  await sleep(getPauseBeforeSend());
  if (shouldStop?.()) return;

  onUpdate({ showSendButton: true });
  await sleep(180);
  if (shouldStop?.()) return;

  onUpdate({ draftText: "", showSendButton: false, pressedKey: null, keyboardTargetText: null });
  await sleep(80);
}

const KEY_PRESS_MS = 50 + 90;
const KEYBOARD_SEND_MS = 180 + 80;

async function playContactTyping(
  message: Message,
  onUpdate: AnimationCallbacks["onUpdate"],
  shouldStop?: () => boolean
): Promise<void> {
  const fallbackMs = getContactTypingDurationMs(message);

  if (message.imageUrl || message.content.length === 0) {
    onUpdate({
      isTyping: true,
      typingSender: message.sender,
    });
    await sleep(fallbackMs);
    if (shouldStop?.()) return;
    onUpdate({ isTyping: false, typingSender: null });
    return;
  }

  const speed = (message.typingSpeed ?? "normal") as TypingSpeed;
  const text = message.content;

  onUpdate({
    isTyping: true,
    typingSender: message.sender,
  });

  for (let i = 0; i < text.length; i++) {
    if (shouldStop?.()) return;

    const keyLabel = charToKeyLabel(text[i]);
    if (keyLabel) await sleep(KEY_PRESS_MS);

    if (i < text.length - 1) {
      await sleep(getCharDelay(speed));
    }
  }

  await sleep(getPauseBeforeSend());
  if (shouldStop?.()) return;

  await sleep(KEYBOARD_SEND_MS);
  if (shouldStop?.()) return;

  onUpdate({ isTyping: false, typingSender: null });
}

export async function playConversationAnimation(
  messages: Message[],
  settings: ConversationSettings,
  callbacks: AnimationCallbacks
): Promise<void> {
  const { onUpdate, onSound, shouldStop } = callbacks;

  onUpdate({
    visibleMessageIds: [],
    isTyping: false,
    typingSender: null,
    activeTimestamps: {},
    showReadReceipt: false,
    isPlaying: true,
    isComplete: false,
    ...resetAnimationFields(),
  });

  if (!(await openKeyboardIfNeeded(onUpdate, shouldStop))) return;

  let previousContent = "";
  let keyboardOpen = true;

  for (let i = 0; i < messages.length; i++) {
    if (shouldStop?.()) return;

    const message = messages[i];
    const delay = getMessageDelay(message, previousContent);

    if (i > 0) {
      await sleep(delay);
      if (shouldStop?.()) return;
    }

    if (message.showTimestamp) {
      const ts =
        message.timestampMode === "auto"
          ? formatDate()
          : message.timestampText;
      onUpdate({
        activeTimestamps: { [message.id]: ts },
      });
      await sleep(400);
      if (shouldStop?.()) return;
    }

    const useKeyboard = shouldUseKeyboardTyping(message);

    if (useKeyboard) {
      await playKeyboardTyping(message, onUpdate, shouldStop, keyboardOpen);
      keyboardOpen = true;
      if (shouldStop?.()) return;
    } else if (message.showTyping) {
      await playContactTyping(message, onUpdate, shouldStop);
      if (shouldStop?.()) return;
    }

    onUpdate({
      visibleMessageIds: messages.slice(0, i + 1).map((m) => m.id),
    });

    if (message.sender === "me") {
      onSound?.("send");
    } else {
      onSound?.("receive");
    }

    previousContent = message.content;
    await sleep(300);
  }

  if (settings.showReadReceipt) {
    await sleep(500);
    onUpdate({ showReadReceipt: true });
  }

  onUpdate({ isPlaying: false, isComplete: true, ...endAnimationKeyboardFields() });
}
