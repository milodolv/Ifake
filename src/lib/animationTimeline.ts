import { Message, ConversationSettings, AnimationState } from "./types";
import { getMessageDelay } from "./autoDelay";
import { formatDate } from "./utils";
import {
  DEFAULT_ANIMATION_STATE,
  endAnimationKeyboardFields,
  resetAnimationFields,
  resetDraftFields,
} from "./animationDefaults";
import {
  charToKeyLabel,
  getCharDelayFixed,
  getPauseBeforeSendFixed,
  getContactTypingDurationMs,
  TypingSpeed,
} from "./keyboardTyping";

export interface TimelineKeyframe {
  timeMs: number;
  state: AnimationState;
}

function shouldUseKeyboardTyping(message: Message): boolean {
  return (
    message.sender === "me" &&
    message.showKeyboardTyping !== false &&
    !message.imageUrl &&
    message.content.length > 0
  );
}

function pushKeyframe(
  keyframes: TimelineKeyframe[],
  timeMs: number,
  partial: Partial<AnimationState>,
  state: AnimationState
): number {
  Object.assign(state, partial);
  keyframes.push({ timeMs, state: { ...state } });
  return timeMs;
}

function appendKeyboardOpen(
  keyframes: TimelineKeyframe[],
  startMs: number,
  state: AnimationState
): number {
  if (state.showKeyboard && state.keyboardOpen) return startMs;

  let t = startMs;

  if (!state.showKeyboard) {
    t = pushKeyframe(
      keyframes,
      t,
      { showKeyboard: true, keyboardOpen: false },
      state
    );
    t += 16;
  }

  if (!state.keyboardOpen) {
    t = pushKeyframe(keyframes, t, { keyboardOpen: true }, state);
    t += 230;
  }

  return t;
}

function appendKeyboardTyping(
  keyframes: TimelineKeyframe[],
  startMs: number,
  message: Message,
  state: AnimationState
): number {
  let t = startMs;
  const speed = (message.typingSpeed ?? "normal") as TypingSpeed;
  const text = message.content;

  t = appendKeyboardOpen(keyframes, t, state);
  t = pushKeyframe(
    keyframes,
    t,
    {
      ...resetDraftFields(),
      keyboardTargetText: text,
    },
    state
  );

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const keyLabel = charToKeyLabel(char);

    if (keyLabel) {
      t = pushKeyframe(keyframes, t, { pressedKey: keyLabel }, state);
      t += 50;
    }

    t = pushKeyframe(
      keyframes,
      t,
      { draftText: text.slice(0, i + 1) },
      state
    );

    if (keyLabel) {
      t = pushKeyframe(keyframes, t, { pressedKey: null }, state);
      t += 90;
    }

    if (i < text.length - 1) {
      t += getCharDelayFixed(speed);
    }
  }

  t += getPauseBeforeSendFixed();
  t = pushKeyframe(keyframes, t, { showSendButton: true }, state);
  t += 180;
  t = pushKeyframe(
    keyframes,
    t,
    {
      draftText: "",
      showSendButton: false,
      pressedKey: null,
      keyboardTargetText: null,
    },
    state
  );
  t += 80;

  return t;
}

export function buildAnimationTimeline(
  messages: Message[],
  settings: ConversationSettings
): { keyframes: TimelineKeyframe[]; durationMs: number } {
  const keyframes: TimelineKeyframe[] = [];
  const state: AnimationState = {
    ...DEFAULT_ANIMATION_STATE,
    isPlaying: true,
    isComplete: false,
  };

  let timeMs = pushKeyframe(
    keyframes,
    0,
    {
      visibleMessageIds: [],
      isTyping: false,
      typingSender: null,
      activeTimestamps: {},
      showReadReceipt: false,
      ...resetAnimationFields(),
    },
    state
  );

  timeMs = appendKeyboardOpen(keyframes, timeMs, state);

  let previousContent = "";

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const delay = getMessageDelay(message, previousContent);

    if (i > 0) {
      timeMs += delay;
    }

    if (message.showTimestamp) {
      const ts =
        message.timestampMode === "auto"
          ? formatDate()
          : message.timestampText;
      timeMs = pushKeyframe(
        keyframes,
        timeMs,
        { activeTimestamps: { [message.id]: ts } },
        state
      );
      timeMs += 400;
    }

    if (shouldUseKeyboardTyping(message)) {
      timeMs = appendKeyboardTyping(keyframes, timeMs, message, state);
    } else if (message.showTyping) {
      const typingMs = getContactTypingDurationMs(message);
      timeMs = pushKeyframe(
        keyframes,
        timeMs,
        {
          isTyping: true,
          typingSender: message.sender,
        },
        state
      );
      timeMs += typingMs;
      timeMs = pushKeyframe(
        keyframes,
        timeMs,
        { isTyping: false, typingSender: null },
        state
      );
    }

    timeMs = pushKeyframe(
      keyframes,
      timeMs,
      { visibleMessageIds: messages.slice(0, i + 1).map((m) => m.id) },
      state
    );

    previousContent = message.content;
    timeMs += 300;
  }

  if (settings.showReadReceipt) {
    timeMs += 500;
    timeMs = pushKeyframe(keyframes, timeMs, { showReadReceipt: true }, state);
  }

  timeMs = pushKeyframe(
    keyframes,
    timeMs,
    { isPlaying: false, isComplete: true, ...endAnimationKeyboardFields() },
    state
  );

  return { keyframes, durationMs: timeMs };
}

export function getStateAtTime(
  keyframes: TimelineKeyframe[],
  timeMs: number
): AnimationState {
  if (keyframes.length === 0) return { ...DEFAULT_ANIMATION_STATE };

  let lo = 0;
  let hi = keyframes.length - 1;

  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (keyframes[mid].timeMs <= timeMs) lo = mid;
    else hi = mid - 1;
  }

  return { ...keyframes[lo].state };
}

export function formatPlaybackTime(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}
