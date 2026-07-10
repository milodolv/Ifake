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

/** Remet le brouillon / touches sans fermer le clavier. */
export function resetDraftFields(): Pick<
  AnimationState,
  | "draftText"
  | "pressedKey"
  | "showSendButton"
  | "keyboardTargetText"
> {
  return {
    draftText: "",
    pressedKey: null,
    showSendButton: false,
    keyboardTargetText: null,
  };
}

/** État clavier en fin d'animation — clavier ouvert, champ vide, curseur actif. */
export function endAnimationKeyboardFields(): Pick<
  AnimationState,
  | "showKeyboard"
  | "keyboardOpen"
  | "draftText"
  | "pressedKey"
  | "showSendButton"
  | "keyboardTargetText"
> {
  return {
    showKeyboard: true,
    keyboardOpen: true,
    ...resetDraftFields(),
  };
}

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
    ...resetDraftFields(),
  };
}
