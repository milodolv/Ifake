import { AnimationState } from "./types";

export const DEFAULT_ANIMATION_STATE: AnimationState = {
  visibleMessageIds: [],
  isTyping: false,
  typingSender: null,
  activeTimestamps: {},
  showReadReceipt: false,
  isPlaying: false,
  isComplete: false,
  showKeyboard: false,
  keyboardOpen: false,
  draftText: "",
  pressedKey: null,
  showSendButton: false,
  keyboardTargetText: null,
};

export function resetAnimationFields(): Pick<
  AnimationState,
  | "showKeyboard"
  | "keyboardOpen"
  | "draftText"
  | "pressedKey"
  | "showSendButton"
  | "keyboardTargetText"
> {
  return {
    showKeyboard: false,
    keyboardOpen: false,
    draftText: "",
    pressedKey: null,
    showSendButton: false,
    keyboardTargetText: null,
  };
}
