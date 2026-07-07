import { Message, ConversationSettings, AnimationState } from "./types";
import { getMessageDelay } from "./autoDelay";
import { formatDate, sleep } from "./utils";
import { resetAnimationFields } from "./animationDefaults";
import {
  charToKeyLabel,
  getCharDelay,
  getPauseBeforeSend,
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

async function playKeyboardTyping(
  message: Message,
  onUpdate: AnimationCallbacks["onUpdate"],
  shouldStop?: () => boolean
): Promise<void> {
  const speed = (message.typingSpeed ?? "normal") as TypingSpeed;
  const text = message.content;

  onUpdate({
    ...resetAnimationFields(),
    showKeyboard: true,
    keyboardOpen: false,
    draftText: "",
    keyboardTargetText: text,
  });

  await sleep(16);
  onUpdate({ keyboardOpen: true });
  await sleep(230);
  if (shouldStop?.()) return;

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

  onUpdate({ draftText: "", showSendButton: false });
  await sleep(80);

  onUpdate({ keyboardOpen: false });
  await sleep(230);
  onUpdate(resetAnimationFields());
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

  let previousContent = "";

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
      await playKeyboardTyping(message, onUpdate, shouldStop);
      if (shouldStop?.()) return;
    } else if (message.showTyping) {
      onUpdate({
        isTyping: true,
        typingSender: message.sender,
      });
      await sleep(message.typingDurationMs);
      if (shouldStop?.()) return;
      onUpdate({ isTyping: false, typingSender: null });
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

  onUpdate({ isPlaying: false, isComplete: true, ...resetAnimationFields() });
}
