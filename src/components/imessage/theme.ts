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
  spacingSameSender: 2,
  spacingDiffSender: 14,
  headerHeight: 118,
  bubblePaddingX: 13,
  bubblePaddingY: 7,
  bubbleFontSize: 17,
  bubbleFontWeight: 500,
  bubbleLineHeight: 22,
  screenPaddingX: 14,
  bubbleMaxWidth: "75%",
} as const;
