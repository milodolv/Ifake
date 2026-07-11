"use client";

import { useCallback, useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { getKeyboardSuggestions } from "@/lib/keyboardSuggestions";
import { Numeric123Label, KEYBOARD_FONT } from "./KeyboardIcon";
import {
  ArrowUpIcon,
  DeleteLeftIcon,
  FaceSmilingIcon,
  GlobeIcon,
  MicIcon,
  PlusIcon,
  ReturnIcon,
  ShiftKeyIcon,
} from "./icons/svgIcons";
import { IMESSAGE, IMESSAGE_FONT, IMESSAGE_FONT_WEIGHT } from "./theme";

interface IOSKeyboardProps {
  pressedKey: string | null;
  isOpen: boolean;
  draftText: string;
  showSend: boolean;
  targetText?: string | null;
  onOverlayHeightChange?: (height: number) => void;
  playbackRate?: number;
  playbackPaused?: boolean;
  exportCaptureMode?: boolean;
}

const ROW1 = "azertyuiop".split("");
const ROW2 = "qsdfghjklm".split("");
const ROW3 = "wxcvbn".split("");

const PANEL_BG = "#1C1C1E";
const INPUT_FIELD_BG = "#1C1C1E";
const KEY_BG = "#3A3A3C";
const KEY_PRESSED_BG = "#AEAEB2";
/** Bas du callout pressé : un peu plus clair que KEY_BG (réf. iOS). */
const KEY_CALLOUT_GRADIENT_BOTTOM = "#4A4A4E";
const KEY_CALLOUT_GRADIENT_MID = "#3F3F42";
const ICON_KEY_SIZE = 21;
const LETTER_SHIFT_FONT_WEIGHT = 700;
const GLOBE_MIC_ICON_SIZE = 29;
const KEY_GAP_H = 6;
const ROW3_SHIFT_FLEX = 1.22;
const ROW3_DELETE_FLEX = 1.15;
const ROW3_W_FLEX = 0.82;
const ROW3_CENTER_LETTER_FLEX = 0.86;
const ROW3_APOSTROPHE_FLEX = 0.85;
const ROW3_SHIFT_SIDE_GAP = 5;
const ROW3_APOSTROPHE_DELETE_GAP = 10;
const KEY_GAP_V = 11;
const KEY_GAP_V_LAST = 12;
const KEYBOARD_BOTTOM_PADDING = 38;
const GLOBE_ROW_TOP_PADDING = 4;
const GLOBE_ROW_ICON_NUDGE_Y = 18;
const INPUT_KEYBOARD_GAP = 10;
const SUGGESTION_KEYS_GAP = 8;
const SUGGESTION_BAR_HEIGHT = 36;
const KEY_HEIGHT = 46;
const KEY_SIDE_INSET = 1;
const KEY_RADIUS = 6;
const KEYBOARD_PANEL_TOP_RADIUS = 24;
const KEYBOARD_PANEL_BOTTOM_RADIUS = 32;
const BOTTOM_ROW_SIDE_FLEX = 0.93;
const BOTTOM_ROW_123_FLEX = BOTTOM_ROW_SIDE_FLEX * 2;
const BOTTOM_ROW_FACE_FLEX = BOTTOM_ROW_SIDE_FLEX;
const BOTTOM_ROW_RETURN_FLEX = BOTTOM_ROW_SIDE_FLEX * 2 + 0.22;
const BOTTOM_ROW_SPACE_FLEX = 4.3;
const BOTTOM_ROW_123_FONT_SIZE = 19.5;
const BOTTOM_ROW_FACE_ICON_SIZE = 27;
const SEND_BLUE = IMESSAGE.blue;

const KEY_CALLOUT_WIDTH_EXTRA = 22;
const KEY_CALLOUT_FUNNEL_HEIGHT = 8;
/** Espace laissé sous la barre iMessage (rangée 1). */
const KEY_CALLOUT_IMESSAGE_GAP = 2;
const KEY_CALLOUT_BULB_HEIGHT = KEY_HEIGHT + 14 - KEY_CALLOUT_IMESSAGE_GAP;
const KEY_CALLOUT_TOP_RADIUS = 11;
const KEY_CALLOUT_LETTER_FONT_SIZE = 34;
const KEY_CALLOUT_LETTER_NUDGE_Y = 3;
const KEY_CALLOUT_FUNNEL_CORNER_RADIUS = 4;
const KEY_CALLOUT_FUNNEL_SIDE_BIAS = 3.2;
const KEY_CALLOUT_FUNNEL_FLATNESS = 0.9;

function buildKeyCalloutPath(keyWidth: number): string {
  const totalW = keyWidth + KEY_CALLOUT_WIDTH_EXTRA;
  const keyLeft = (totalW - keyWidth) / 2;
  const keyRight = keyLeft + keyWidth;
  const bulbH = KEY_CALLOUT_BULB_HEIGHT;
  const keyTopY = bulbH + KEY_CALLOUT_FUNNEL_HEIGHT;
  const totalH = keyTopY + KEY_HEIGHT;
  const topR = KEY_CALLOUT_TOP_RADIUS;
  const r = KEY_RADIUS;
  const fr = Math.min(
    KEY_CALLOUT_FUNNEL_CORNER_RADIUS,
    KEY_CALLOUT_FUNNEL_HEIGHT * 0.48,
    KEY_CALLOUT_WIDTH_EXTRA * 0.28
  );

  return [
    `M ${keyLeft + r} ${totalH}`,
    `H ${keyRight - r}`,
    `Q ${keyRight} ${totalH} ${keyRight} ${totalH - r}`,
    `V ${keyTopY + fr}`,
    `C ${keyRight + KEY_CALLOUT_FUNNEL_SIDE_BIAS} ${keyTopY + 0.6}, ${totalW} ${bulbH + KEY_CALLOUT_FUNNEL_FLATNESS}, ${totalW} ${bulbH - fr}`,
    `V ${topR}`,
    `Q ${totalW} 0 ${totalW - topR} 0`,
    `H ${topR}`,
    `Q 0 0 0 ${topR}`,
    `V ${bulbH - fr}`,
    `C 0 ${bulbH + KEY_CALLOUT_FUNNEL_FLATNESS}, ${keyLeft - KEY_CALLOUT_FUNNEL_SIDE_BIAS} ${keyTopY + 0.6}, ${keyLeft} ${keyTopY + fr}`,
    `V ${totalH - r}`,
    `Q ${keyLeft} ${totalH} ${keyLeft + r} ${totalH}`,
    "Z",
  ].join(" ");
}

function KeyCallout({
  label,
  fontWeight,
  keyWidth,
}: {
  label: string;
  fontWeight?: number;
  keyWidth: number;
}) {
  const totalW = keyWidth + KEY_CALLOUT_WIDTH_EXTRA;
  const totalH = KEY_CALLOUT_BULB_HEIGHT + KEY_CALLOUT_FUNNEL_HEIGHT + KEY_HEIGHT;
  const path = buildKeyCalloutPath(keyWidth);
  const gradientId = `callout-grad-${useId().replace(/:/g, "")}`;

  return (
    <div
      className="absolute pointer-events-none z-20"
      style={{
        bottom: -1,
        left: "50%",
        transform: "translateX(-50%)",
        width: totalW,
        height: totalH,
      }}
    >
      <svg
        width={totalW}
        height={totalH}
        viewBox={`0 0 ${totalW} ${totalH}`}
        fill="none"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0"
            y1="0"
            x2="0"
            y2={totalH}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={KEY_BG} />
            <stop offset="55%" stopColor={KEY_CALLOUT_GRADIENT_MID} />
            <stop offset="100%" stopColor={KEY_CALLOUT_GRADIENT_BOTTOM} />
          </linearGradient>
        </defs>
        <path d={path} fill={`url(#${gradientId})`} />
      </svg>
      <div
        className="absolute text-white"
        data-export-key-callout-label
        style={{
          top: 0,
          left: 0,
          width: totalW,
          height: KEY_CALLOUT_BULB_HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: KEY_CALLOUT_LETTER_FONT_SIZE,
          lineHeight: 1,
          fontFamily: KEYBOARD_FONT,
          fontWeight: fontWeight ?? IMESSAGE_FONT_WEIGHT.semibold,
          fontVariationSettings: `"wght" ${fontWeight ?? IMESSAGE_FONT_WEIGHT.semibold}`,
          transform: `translateY(${KEY_CALLOUT_LETTER_NUDGE_Y}px)`,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function Key({
  label,
  pressedKey,
  flex = 1,
  children,
  fontSize,
  fontWeight,
  marginRight,
  marginLeft,
}: {
  label?: string;
  pressedKey: string | null;
  flex?: number;
  children?: React.ReactNode;
  fontSize?: number;
  fontWeight?: number;
  marginRight?: number;
  marginLeft?: number;
}) {
  const matchLabel = label?.toUpperCase() ?? null;
  const isPressed = matchLabel != null && pressedKey === matchLabel;
  const keyCapRef = useRef<HTMLDivElement>(null);
  const [keyWidth, setKeyWidth] = useState(0);

  const measureKeyWidth = useCallback(() => {
    const nextWidth = Math.round(keyCapRef.current?.offsetWidth ?? 0);
    if (nextWidth > 0) {
      setKeyWidth((current) => (current === nextWidth ? current : nextWidth));
    }
  }, []);

  useLayoutEffect(() => {
    measureKeyWidth();
  }, [measureKeyWidth, flex, marginLeft, marginRight]);

  useLayoutEffect(() => {
    if (isPressed) measureKeyWidth();
  }, [isPressed, measureKeyWidth]);

  const showCallout = isPressed && Boolean(label) && keyWidth > 0;

  return (
    <div
      className="relative flex items-end justify-center"
      data-export-key-wrapper
      style={{
        flex,
        minWidth: 0,
        height: KEY_HEIGHT,
        marginRight,
        marginLeft,
        zIndex: isPressed ? 20 : 1,
        overflow: "visible",
      }}
    >
      {showCallout && (
        <KeyCallout label={label!} fontWeight={fontWeight} keyWidth={keyWidth} />
      )}
      <div
        ref={keyCapRef}
        data-export-key-cap
        className="relative flex items-center justify-center select-none"
        style={{
          height: KEY_HEIGHT,
          width: `calc(100% - ${KEY_SIDE_INSET * 2}px)`,
          marginLeft: "auto",
          marginRight: "auto",
          backgroundColor: showCallout ? "transparent" : isPressed ? KEY_PRESSED_BG : KEY_BG,
          borderRadius: KEY_RADIUS,
          fontSize: fontSize ?? (label && label.length === 1 ? 23 : 16),
          fontWeight: fontWeight ?? IMESSAGE_FONT_WEIGHT.semibold,
          fontVariationSettings: `"wght" ${fontWeight ?? IMESSAGE_FONT_WEIGHT.semibold}`,
          fontFamily: KEYBOARD_FONT,
          color: "#FFFFFF",
        }}
      >
        {children ??
          (label ? (
            <span
              className="ifake-export-text"
              style={{ visibility: showCallout ? "hidden" : "visible" }}
            >
              {label}
            </span>
          ) : null)}
      </div>
    </div>
  );
}

function KeyRow({
  children,
  last,
}: {
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className="flex w-full"
      style={{
        gap: KEY_GAP_H,
        marginBottom: last ? KEY_GAP_V_LAST : KEY_GAP_V,
      }}
    >
      {children}
    </div>
  );
}

const INPUT_ROW_HEIGHT = 45;
const SEND_BUTTON_HEIGHT = 32;
const SEND_BUTTON_WIDTH = 42;
const INPUT_FIELD_V_PADDING = (INPUT_ROW_HEIGHT - SEND_BUTTON_HEIGHT) / 2;
/** Remonte texte + bouton envoi/micro sur une ligne (optique iOS). */
const INPUT_FIELD_SINGLE_LINE_LIFT_PX = 1;

/** Période du curseur bleu clignotant (ms à vitesse x1). */
const CURSOR_BLINK_MS = 1000;

function cursorBlinkStyle(
  playbackRate = 1,
  paused = false
): CSSProperties {
  return {
    animation: "ifake-cursor step-end infinite",
    animationDuration: `${CURSOR_BLINK_MS / Math.max(playbackRate, 0.1)}ms`,
    animationPlayState: paused ? "paused" : "running",
  };
}
/** Padding vertical 1 ligne — laisse 32 px pour le bouton envoi dans 45 px. */
const INPUT_FIELD_SINGLE_LINE_PAD_TOP = 9;
const INPUT_FIELD_SINGLE_LINE_PAD_BOTTOM = 4;
/** Réduit la bulle iMessage côté gauche ; le padding interne garde l’espace du « i ». */
const INPUT_FIELD_LEFT_TRIM = 4;
/** Rayon du champ iMessage multiligne (réf. iOS). */
const INPUT_FIELD_RADIUS = 22;

function useDraftMultiline(
  draftText: string,
  hasDraft: boolean,
  trailingAction: boolean
) {
  const draftRef = useRef<HTMLSpanElement>(null);
  const [isMultilineDraft, setIsMultilineDraft] = useState(false);

  useLayoutEffect(() => {
    if (!hasDraft) {
      setIsMultilineDraft(false);
      return;
    }

    if (draftText.includes("\n")) {
      setIsMultilineDraft(true);
      return;
    }

    const el = draftRef.current;
    if (!el) return;

    if (isMultilineDraft) {
      return;
    }

    if (el.scrollWidth > el.clientWidth + 1) {
      setIsMultilineDraft(true);
    }
  }, [draftText, hasDraft, isMultilineDraft, trailingAction]);

  return { draftRef, isMultilineDraft };
}

function InputBar({
  draftText,
  showSend,
  showMicButton = false,
  showIdleCursor = false,
  horizontalPadding = IMESSAGE.inputBarPaddingX,
  playbackRate = 1,
  playbackPaused = false,
}: {
  draftText: string;
  showSend: boolean;
  showMicButton?: boolean;
  /** Curseur bleu + placeholder « iMessage » (clavier ouvert, champ vide). */
  showIdleCursor?: boolean;
  horizontalPadding?: number;
  playbackRate?: number;
  playbackPaused?: boolean;
}) {
  const hasDraft = draftText.length > 0;
  const trailingAction = showSend || showMicButton;
  const { draftRef, isMultilineDraft } = useDraftMultiline(
    draftText,
    hasDraft,
    trailingAction
  );
  const useSingleLineLayout = !isMultilineDraft;
  const fieldPadTop = useSingleLineLayout
    ? INPUT_FIELD_SINGLE_LINE_PAD_TOP
    : INPUT_FIELD_V_PADDING + 2;
  const fieldPadBottom = useSingleLineLayout
    ? INPUT_FIELD_SINGLE_LINE_PAD_BOTTOM
    : INPUT_FIELD_V_PADDING - 2;

  return (
    <div
      className="flex gap-2 shrink-0"
      data-export-flex-center
      style={{
        padding: `8px ${horizontalPadding}px 6px`,
        alignItems: useSingleLineLayout ? "center" : "flex-end",
      }}
    >
      <div
        className="flex items-center justify-center shrink-0 rounded-full"
        style={{
          width: INPUT_ROW_HEIGHT,
          height: INPUT_ROW_HEIGHT,
          backgroundColor: INPUT_FIELD_BG,
          flexShrink: 0,
        }}
      >
        <PlusIcon size={21} />
      </div>

      <div
        className="flex-1 min-w-0 flex"
        data-export-flex-center
        data-export-input-field
        style={{
          marginLeft: INPUT_FIELD_LEFT_TRIM,
          backgroundColor: INPUT_FIELD_BG,
          borderRadius: hasDraft ? INPUT_FIELD_RADIUS : 9999,
          minHeight: INPUT_ROW_HEIGHT,
          alignItems: useSingleLineLayout ? "center" : "flex-end",
          color: hasDraft ? "#FFFFFF" : "#8E8E93",
          fontFamily: KEYBOARD_FONT,
          fontSize: IMESSAGE.messageTextFontSize,
          fontWeight: hasDraft
            ? IMESSAGE.messageTextFontWeight
            : IMESSAGE_FONT_WEIGHT.body,
          fontVariationSettings: hasDraft
            ? `"wght" ${IMESSAGE.messageTextFontWeight}`
            : undefined,
          letterSpacing: IMESSAGE.messageTextLetterSpacing,
          paddingLeft: 19,
          paddingRight: trailingAction ? 5 : 16,
          paddingTop: fieldPadTop,
          paddingBottom: fieldPadBottom,
        }}
      >
        <div
          className="flex min-w-0 w-full"
          data-export-flex-center
          data-export-input-inner
          style={{
            flex: 1,
            alignItems: useSingleLineLayout ? "center" : "flex-end",
            transform: useSingleLineLayout
              ? `translateY(-${INPUT_FIELD_SINGLE_LINE_LIFT_PX}px)`
              : undefined,
          }}
        >
          <div
            className={`flex-1 min-w-0 relative flex ${useSingleLineLayout ? "items-center" : "items-end"}`}
            data-export-flex-center
            style={{
              minHeight: useSingleLineLayout ? SEND_BUTTON_HEIGHT : undefined,
              lineHeight: useSingleLineLayout ? 1.1 : `${IMESSAGE.messageTextLineHeight}px`,
            }}
          >
            {hasDraft ? (
              <span
                ref={draftRef}
                className="min-w-0 max-w-full"
                data-export-input-draft
                style={{
                  whiteSpace: useSingleLineLayout ? "nowrap" : "pre-wrap",
                  wordBreak: "break-word",
                  width: "100%",
                  display: "block",
                }}
              >
                {draftText}
                <span
                  className="inline-block w-[2px] h-[18px] ml-[1px]"
                  style={{
                    backgroundColor: IMESSAGE.blue,
                    verticalAlign: "-2px",
                    ...cursorBlinkStyle(playbackRate, playbackPaused),
                  }}
                />
              </span>
            ) : showIdleCursor ? (
              <span className="inline-flex items-center min-w-0">
                <span
                  className="inline-block w-[2px] h-[18px] shrink-0"
                  style={{
                    backgroundColor: IMESSAGE.blue,
                    ...cursorBlinkStyle(playbackRate, playbackPaused),
                  }}
                />
                <span
                  data-export-input-placeholder
                  style={{
                    fontWeight: 585,
                    fontVariationSettings: '"wght" 585',
                    lineHeight: 1.1,
                  }}
                >
                  iMessage
                </span>
              </span>
            ) : (
              <span
                data-export-input-placeholder
                style={{
                  fontWeight: 585,
                  fontVariationSettings: '"wght" 585',
                  lineHeight: 1.1,
                }}
              >
                iMessage
              </span>
            )}
            {!trailingAction && !hasDraft && !showIdleCursor && (
              <svg
                className="absolute right-0 top-1/2 -translate-y-1/2"
                width="14"
                height="18"
                viewBox="0 0 16 20"
                fill="#8E8E93"
              >
                <rect x="6" y="2" width="4" height="8" rx="2" />
                <path
                  d="M3 10c0 3 2 5 5 5s5-2 5-5"
                  stroke="#8E8E93"
                  strokeWidth="1.2"
                  fill="none"
                />
              </svg>
            )}
          </div>

          {showMicButton && (
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: SEND_BUTTON_WIDTH,
                height: SEND_BUTTON_HEIGHT,
                marginLeft: 6,
              }}
            >
              <MicIcon height={20} width={14} />
            </div>
          )}

          {showSend && (
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: SEND_BUTTON_WIDTH,
                height: SEND_BUTTON_HEIGHT,
                borderRadius: SEND_BUTTON_HEIGHT / 2,
                backgroundColor: SEND_BLUE,
                marginLeft: 6,
              }}
            >
              <ArrowUpIcon size={17} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ComposeInputBar() {
  return (
    <div className="shrink-0" style={{ paddingBottom: 34 }}>
      <InputBar
        draftText=""
        showSend={false}
        showMicButton
        horizontalPadding={IMESSAGE.inputBarPaddingX}
      />
    </div>
  );
}

const SUGGESTION_BAR_PADDING_X = 6;

function getSuggestionDividerLeft(sectionIndex: 1 | 2): string {
  const horizontalPadding = SUGGESTION_BAR_PADDING_X * 2;
  return `calc(${SUGGESTION_BAR_PADDING_X}px + (${sectionIndex} * (100% - ${horizontalPadding}px) / 3))`;
}

function SuggestionDivider({ left }: { left: string }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left,
        top: "50%",
        transform: "translateX(-0.5px) translateY(-50%)",
        width: 1,
        height: 24,
        backgroundColor: "#48484A",
        pointerEvents: "none",
      }}
    />
  );
}

function SuggestionRegion({
  left,
  right,
  children,
}: {
  left: string;
  right: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute inset-y-0 flex items-center justify-center min-w-0"
      style={{ left, right }}
    >
      {children}
    </div>
  );
}

function SuggestionBar({
  draftText,
  targetText,
}: {
  draftText: string;
  targetText?: string | null;
}) {
  const [s1, s2, s3] = getKeyboardSuggestions(draftText, targetText);
  const dividerFirst = getSuggestionDividerLeft(1);
  const dividerSecond = getSuggestionDividerLeft(2);

  const suggestionTextStyle = {
    color: "#FFFFFF",
    fontFamily: IMESSAGE_FONT,
    fontSize: IMESSAGE.messageTextFontSize,
    fontWeight: IMESSAGE.messageTextFontWeight,
    fontVariationSettings: `"wght" ${IMESSAGE.messageTextFontWeight}`,
    letterSpacing: IMESSAGE.messageTextLetterSpacing,
  } as const;

  return (
    <div
      className="relative"
      data-export-suggestion-bar
      style={{
        height: SUGGESTION_BAR_HEIGHT,
        backgroundColor: PANEL_BG,
      }}
    >
      <SuggestionDivider left={dividerFirst} />
      <SuggestionDivider left={dividerSecond} />

      <SuggestionRegion
        left={`${SUGGESTION_BAR_PADDING_X}px`}
        right={`calc(100% - ${dividerFirst})`}
      >
        <span className="truncate px-2 ifake-export-text" data-export-suggestion-text style={suggestionTextStyle}>
          {s1}
        </span>
      </SuggestionRegion>

      <SuggestionRegion left={dividerFirst} right={`calc(100% - ${dividerSecond})`}>
        <span className="truncate px-2 ifake-export-text" data-export-suggestion-text style={suggestionTextStyle}>
          {s2}
        </span>
      </SuggestionRegion>

      <SuggestionRegion
        left={dividerSecond}
        right={`${SUGGESTION_BAR_PADDING_X}px`}
      >
        <span className="truncate px-2 ifake-export-text" data-export-suggestion-text style={suggestionTextStyle}>
          {s3}
        </span>
      </SuggestionRegion>
    </div>
  );
}

export function IOSKeyboard({
  pressedKey,
  isOpen,
  draftText,
  showSend,
  targetText,
  onOverlayHeightChange,
  playbackRate = 1,
  playbackPaused = false,
  exportCaptureMode = false,
}: IOSKeyboardProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!onOverlayHeightChange) return;
    const node = rootRef.current;
    if (!node) return;

    const report = () => {
      const height = node.offsetHeight;
      if (height > 0) onOverlayHeightChange(height);
    };

    report();
    const observer = new ResizeObserver(report);
    observer.observe(node);
    return () => observer.disconnect();
  }, [
    draftText,
    showSend,
    isOpen,
    onOverlayHeightChange,
  ]);

  const shiftActive = draftText.length === 0;
  const letterFontWeight = shiftActive
    ? LETTER_SHIFT_FONT_WEIGHT
    : IMESSAGE_FONT_WEIGHT.semibold;
  const letterLabel = (key: string) => (shiftActive ? key.toUpperCase() : key);

  return (
    <div
      ref={rootRef}
      data-export-keyboard
      data-keyboard-closed={isOpen ? undefined : "true"}
      className="absolute left-0 right-0 bottom-0 z-30"
      style={{
        transform: isOpen ? "translateY(0)" : "translateY(100%)",
        transition: exportCaptureMode
          ? "none"
          : "transform 220ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      }}
    >
      <InputBar
        draftText={draftText}
        showSend={showSend}
        showMicButton={!showSend}
        showIdleCursor
        playbackRate={playbackRate}
        playbackPaused={playbackPaused}
      />

      <div
        style={{
          backgroundColor: PANEL_BG,
          borderTopLeftRadius: KEYBOARD_PANEL_TOP_RADIUS,
          borderTopRightRadius: KEYBOARD_PANEL_TOP_RADIUS,
          borderBottomLeftRadius: KEYBOARD_PANEL_BOTTOM_RADIUS,
          borderBottomRightRadius: KEYBOARD_PANEL_BOTTOM_RADIUS,
          marginTop: INPUT_KEYBOARD_GAP,
          paddingTop: SUGGESTION_KEYS_GAP,
        }}
      >
        <SuggestionBar draftText={draftText} targetText={targetText} />

        <div
          style={{
            padding: `${SUGGESTION_KEYS_GAP}px ${KEY_GAP_H}px 4px`,
            backgroundColor: PANEL_BG,
            overflow: "visible",
          }}
        >
          <KeyRow>
            {ROW1.map((key) => (
              <Key
                key={key}
                label={letterLabel(key)}
                pressedKey={pressedKey}
                fontWeight={letterFontWeight}
              />
            ))}
          </KeyRow>
          <KeyRow>
            {ROW2.map((key) => (
              <Key
                key={key}
                label={letterLabel(key)}
                pressedKey={pressedKey}
                fontWeight={letterFontWeight}
              />
            ))}
          </KeyRow>
          <KeyRow>
            <Key pressedKey={pressedKey} flex={ROW3_SHIFT_FLEX} marginRight={ROW3_SHIFT_SIDE_GAP}>
              <ShiftKeyIcon size={ICON_KEY_SIZE} editorOnly />
            </Key>
            {ROW3.map((key) => (
              <Key
                key={key}
                label={letterLabel(key)}
                pressedKey={pressedKey}
                flex={key === "w" ? ROW3_W_FLEX : ROW3_CENTER_LETTER_FLEX}
                fontWeight={letterFontWeight}
              />
            ))}
            <Key
              label={letterLabel("'")}
              pressedKey={pressedKey}
              fontSize={22}
              flex={ROW3_APOSTROPHE_FLEX}
              marginRight={ROW3_APOSTROPHE_DELETE_GAP}
              fontWeight={letterFontWeight}
            />
            <Key pressedKey={pressedKey} flex={ROW3_DELETE_FLEX}>
              <DeleteLeftIcon size={ICON_KEY_SIZE} editorOnly />
            </Key>
          </KeyRow>
          <KeyRow last>
            <Key pressedKey={pressedKey} flex={BOTTOM_ROW_123_FLEX}>
              <Numeric123Label fontSize={BOTTOM_ROW_123_FONT_SIZE} />
            </Key>
            <Key pressedKey={pressedKey} flex={BOTTOM_ROW_FACE_FLEX}>
              <FaceSmilingIcon size={BOTTOM_ROW_FACE_ICON_SIZE} editorOnly />
            </Key>
            <Key pressedKey={pressedKey} flex={BOTTOM_ROW_SPACE_FLEX}>
              <span
                data-export-space-label
                style={{
                  position: "absolute",
                  right: 7,
                  bottom: 4,
                  fontFamily:
                    '"SF Pro Text", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: 12.5,
                  fontWeight: 700,
                  fontVariationSettings: '"wght" 700',
                  letterSpacing: "calc(-0.08em + 1px)",
                  lineHeight: 1,
                  color: "#98989D",
                  transform: "scaleX(0.82) scaleY(1.18)",
                  transformOrigin: "bottom right",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              >
                FR
              </span>
            </Key>
            <Key pressedKey={pressedKey} flex={BOTTOM_ROW_RETURN_FLEX}>
              <ReturnIcon height={19} width={74} editorOnly />
            </Key>
          </KeyRow>
        </div>

        <div
          className="flex items-end justify-between"
          data-export-globe-row
          style={{
            height: 54,
            padding: `${GLOBE_ROW_TOP_PADDING}px 22px ${KEYBOARD_BOTTOM_PADDING}px`,
            backgroundColor: PANEL_BG,
          }}
        >
          <span
            data-export-globe-icon
            style={{
              transform: `translateY(${GLOBE_ROW_ICON_NUDGE_Y}px)`,
              display: "inline-flex",
            }}
          >
            <GlobeIcon size={GLOBE_MIC_ICON_SIZE} editorOnly />
          </span>
          <span
            data-export-globe-icon
            style={{
              transform: `translateY(${GLOBE_ROW_ICON_NUDGE_Y}px)`,
              display: "inline-flex",
            }}
          >
            <MicIcon height={GLOBE_MIC_ICON_SIZE} width={20} editorOnly />
          </span>
        </div>
      </div>
    </div>
  );
}

export const KEYBOARD_PANEL_HEIGHT = 434;
/** Hauteur totale de la barre iMessage au repos (+ home indicator). */
export const COMPOSE_INPUT_BAR_HEIGHT = INPUT_ROW_HEIGHT + 8 + 6 + 34;
