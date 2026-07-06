import { Message, ConversationSettings, AnimationState } from "./types";
import { getMessageDelay } from "./autoDelay";
import { formatDate, sleep } from "./utils";

export type AnimationCallbacks = {
  onUpdate: (state: Partial<AnimationState>) => void;
  onSound?: (type: "send" | "receive") => void;
  shouldStop?: () => boolean;
};

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

    if (message.showTyping) {
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

  onUpdate({ isPlaying: false, isComplete: true });
}
