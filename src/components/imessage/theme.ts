export const IMESSAGE_FONT =
  'var(--font-inter), "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif';

/** iOS status bar clock — SF Pro Display Semibold, not Inter */
export const STATUS_BAR_TIME_FONT =
  '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif';

export const IMESSAGE_FONT_WEIGHT = {
  body: 500,
  semibold: 600,
  bold: 700,
} as const;

export const IMESSAGE = {
  blue: "#2496FF",
  bubbleContactDark: "#262629",
  bubbleContactLight: "#E9E9EB",
  bgDark: "#000000",
  bgLight: "#FFFFFF",
  textPrimary: "#FFFFFF",
  textSecondary: "#8E8E93",
  headerBlurDark: "rgba(0, 0, 0, 0.65)",
  headerBlurLight: "rgba(249, 249, 249, 0.82)",
  pillBgDark: "rgba(28, 28, 30, 0.96)",
  pillBgLight: "rgba(120, 120, 128, 0.16)",
  inputBarDark: "#000000",
  inputBarLight: "#F2F2F7",
  inputFieldDark: "#1C1C1E",
  inputFieldLight: "#FFFFFF",
  plusBtnDark: "rgba(118, 118, 128, 0.36)",
  avatarGradient:
    "linear-gradient(180deg, #6E6690 0%, #4A4560 50%, #2E2A3D 100%)",
  radiusBubble: 18,
  radiusBubbleChain: 4,
  spacingSameSender: 6,
  spacingDiffSender: 5,
  headerHeight: 118,
  headerPaddingLeft: 14,
  headerPaddingRight: 18,
  headerButtonSize: 50,
  headerBackChevronSize: 23,
  /** Ajuste fin pour aligner le « 1 » de l'heure avec la pointe de la flèche retour. */
  statusBarTimeNudgeX: 9,
  statusBarTimeNudgeY: 2,
  statusBarIconsNudgeY: 7,
  statusBarIconsNudgeX: 3,
  /** Léger décalage vers le haut du header (flèche, caméra, contact). */
  headerChromeLift: 7,
  /** Remonte visuellement l'heure et les icônes de statut (sans déplacer le reste). */
  statusBarLift: 15,
  statusBarHeight: 54,
  /** Hauteur du dégradé d'assombrissement en haut (bulles qui remontent). */
  conversationTopFadeHeight: 228,
  bubblePaddingX: 13,
  bubblePaddingY: 7,
  /** Police unique — barre iMessage et bulles (contact + moi). */
  messageTextFontSize: 19,
  messageTextFontWeight: 550,
  messageTextLineHeight: 22,
  messageTextLetterSpacing: "-0.01em",
  bubbleLineHeight: 22,
  screenPaddingX: 20,
  inputBarPaddingX: 26,
  screenWidth: 430,
  screenHeight: 862,
  bubbleMaxWidth: "75%",
} as const;
