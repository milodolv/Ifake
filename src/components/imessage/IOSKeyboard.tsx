"use client";

import { getKeyboardSuggestions } from "@/lib/keyboardSuggestions";
import { KeyboardIcon, EmojiFaceIcon, Numeric123Label, KEYBOARD_FONT } from "./KeyboardIcon";
import { IMESSAGE, IMESSAGE_FONT_WEIGHT } from "./theme";

interface IOSKeyboardProps {
  pressedKey: string | null;
  isOpen: boolean;
  draftText: string;
  showSend: boolean;
  targetText?: string | null;
}

const ROW1 = "azertyuiop".split("");
const ROW2 = "qsdfghjklm".split("");
const ROW3 = "wxcvbn".split("");

const BASE_BG = "#000000";
const PANEL_BG = "#1C1C1E";
const INPUT_FIELD_BG = "#1C1C1E";
const KEY_BG = "#3A3A3C";
const KEY_PRESSED_BG = "#AEAEB2";
const ICON_KEY_SIZE = 21;
const ICON_SYMBOL_WEIGHT = 470;
const ICON_SYMBOL_STROKE = 0.1;
const ICON_SYSTEM_SIZE = 26;
const ICON_SYSTEM_WEIGHT = 460;
const ICON_SYSTEM_STROKE = 0.08;
const EMOJI_FACE_SIZE = 25;
const SEND_BLUE = IMESSAGE.blue;
const KEY_GAP_H = 6;
const ROW3_SHIFT_FLEX = 1.42;
const ROW3_DELETE_FLEX = 1.42;
const ROW3_LETTER_FLEX = 0.9;
const ROW3_APOSTROPHE_FLEX = 1;
const ROW3_SIDE_GAP = 5;
const KEY_GAP_V = 10;
const KEY_GAP_V_LAST = 12;
const KEYBOARD_BOTTOM_PADDING = 20;
const GLOBE_ROW_TOP_PADDING = 7;
const INPUT_KEYBOARD_GAP = 8;
const SUGGESTION_KEYS_GAP = 8;
const KEY_HEIGHT = 44;
const KEY_RADIUS = 6;
const BOTTOM_ROW_SIDE_FLEX = 1.1;
const BOTTOM_ROW_RETURN_FLEX = BOTTOM_ROW_SIDE_FLEX * 2;
const BOTTOM_ROW_SPACE_FLEX = 4.05;

function DictationIcon() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
      <rect x="0" y="1" width="14" height="1.5" rx="0.75" fill="#8E8E93" />
      <rect x="0" y="5.5" width="14" height="1.5" rx="0.75" fill="#8E8E93" />
      <rect x="0" y="10" width="14" height="1.5" rx="0.75" fill="#8E8E93" />
      <text x="16" y="12.5" fill="#8E8E93" fontSize="11" fontWeight="600" fontFamily="system-ui">
        A
      </text>
    </svg>
  );
}

function KeyCallout({ label }: { label: string }) {
  return (
    <div
      className="absolute pointer-events-none z-20"
      style={{
        bottom: KEY_HEIGHT - 2,
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% + 18px)",
        height: 56,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 50 56"
        preserveAspectRatio="none"
        fill="none"
        style={{ display: "block" }}
      >
        <path
          d="M7 56 L7 24 C7 11 12 5 25 3 C38 5 43 11 43 24 L43 56 Z"
          fill={KEY_PRESSED_BG}
        />
      </svg>
      <span
        className="absolute text-white"
        style={{
          top: 6,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 28,
          lineHeight: 1,
          fontFamily: KEYBOARD_FONT,
          fontWeight: IMESSAGE_FONT_WEIGHT.semibold,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function Key({
  label,
  pressedKey,
  flex = 1,
  children,
  fontSize,
  marginRight,
  marginLeft,
}: {
  label?: string;
  pressedKey: string | null;
  flex?: number;
  children?: React.ReactNode;
  fontSize?: number;
  marginRight?: number;
  marginLeft?: number;
}) {
  const matchLabel = label?.toUpperCase() ?? null;
  const isPressed = matchLabel != null && pressedKey === matchLabel;

  return (
    <div
      className="relative flex items-end justify-center"
      style={{
        flex,
        minWidth: 0,
        height: KEY_HEIGHT,
        marginRight,
        marginLeft,
      }}
    >
      {isPressed && label && <KeyCallout label={label} />}
      <div
        className="relative flex items-center justify-center w-full select-none"
        style={{
          height: KEY_HEIGHT,
          backgroundColor: isPressed ? KEY_PRESSED_BG : KEY_BG,
          borderRadius: KEY_RADIUS,
          fontSize: fontSize ?? (label && label.length === 1 ? 23 : 16),
          fontWeight: IMESSAGE_FONT_WEIGHT.semibold,
          fontFamily: KEYBOARD_FONT,
          color: "#FFFFFF",
          zIndex: isPressed ? 10 : 1,
        }}
      >
        {children ?? label}
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

const INPUT_ROW_HEIGHT = 42;
const SEND_BUTTON_HEIGHT = 32;
const SEND_BUTTON_WIDTH = 42;
const INPUT_FIELD_V_PADDING = (INPUT_ROW_HEIGHT - SEND_BUTTON_HEIGHT) / 2;

function InputBar({
  draftText,
  showSend,
  showMicButton = false,
  horizontalPadding = 8,
}: {
  draftText: string;
  showSend: boolean;
  showMicButton?: boolean;
  horizontalPadding?: number;
}) {
  const hasDraft = draftText.length > 0;
  const trailingAction = showSend || showMicButton;

  return (
    <div
      className="flex items-center gap-2 shrink-0"
      style={{
        padding: `8px ${horizontalPadding}px 6px`,
        backgroundColor: BASE_BG,
      }}
    >
      <div
        className="flex items-center justify-center shrink-0 rounded-full"
        style={{
          width: INPUT_ROW_HEIGHT,
          height: INPUT_ROW_HEIGHT,
          backgroundColor: INPUT_FIELD_BG,
        }}
      >
        <KeyboardIcon
          name="plus"
          size={20}
          color="#FFFFFF"
          weight={550}
          strokeWidth={0.25}
        />
      </div>

      <div
        className="flex-1 rounded-full flex items-center min-w-0"
        style={{
          height: INPUT_ROW_HEIGHT,
          backgroundColor: INPUT_FIELD_BG,
          color: hasDraft ? "#FFFFFF" : "#8E8E93",
          fontFamily: KEYBOARD_FONT,
          fontSize: 17,
          fontWeight: IMESSAGE_FONT_WEIGHT.body,
          letterSpacing: "-0.01em",
          paddingLeft: 16,
          paddingRight: trailingAction ? 5 : 16,
          paddingTop: INPUT_FIELD_V_PADDING,
          paddingBottom: INPUT_FIELD_V_PADDING,
        }}
      >
        <div className="flex-1 min-w-0 flex items-center relative">
          {hasDraft ? (
            <>
              <span className="truncate">{draftText}</span>
              <span
                className="inline-block w-[2px] h-[20px] ml-[1px] shrink-0"
                style={{
                  backgroundColor: IMESSAGE.blue,
                  animation: "ifake-cursor 1s step-end infinite",
                }}
              />
            </>
          ) : (
            "iMessage"
          )}
          {!trailingAction && (
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
            <KeyboardIcon
              name="mic"
              size={22}
              color="#8E8E93"
              weight={ICON_SYSTEM_WEIGHT}
              strokeWidth={ICON_SYSTEM_STROKE}
            />
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
            <KeyboardIcon
              name="arrow-up"
              size={17}
              color="#FFFFFF"
              weight={700}
              strokeWidth={1}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function ComposeInputBar() {
  return (
    <div
      className="shrink-0"
      style={{ backgroundColor: BASE_BG, paddingBottom: 22 }}
    >
      <InputBar
        draftText=""
        showSend={false}
        showMicButton
        horizontalPadding={16}
      />
    </div>
  );
}

const SUGGESTION_BAR_PADDING_X = 6;
const ROW1_KEY_COUNT = ROW1.length;
const SUGGESTION_DIVIDER_KEY_INDEXES = { first: 2, second: 5, third: 8 } as const;

const SUGGESTION_DIVIDER_NUDGE_LEFT = 1;

function getRow1KeyEndLeft(keyIndex: number, nudgeLeft = 0): string {
  const gaps = ROW1_KEY_COUNT - 1;
  const horizontalPadding = SUGGESTION_BAR_PADDING_X * 2;
  const totalGap = gaps * KEY_GAP_H;
  const nudge = nudgeLeft > 0 ? ` - ${nudgeLeft}px` : "";

  return `calc(${SUGGESTION_BAR_PADDING_X}px + (${keyIndex + 1} * (100% - ${horizontalPadding}px - ${totalGap}px) / ${ROW1_KEY_COUNT}) + ${keyIndex * KEY_GAP_H}px${nudge})`;
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
  const dividerE = getRow1KeyEndLeft(SUGGESTION_DIVIDER_KEY_INDEXES.first);
  const dividerY = getRow1KeyEndLeft(
    SUGGESTION_DIVIDER_KEY_INDEXES.second,
    SUGGESTION_DIVIDER_NUDGE_LEFT
  );
  const dividerO = getRow1KeyEndLeft(
    SUGGESTION_DIVIDER_KEY_INDEXES.third,
    SUGGESTION_DIVIDER_NUDGE_LEFT
  );

  return (
    <div
      className="relative"
      style={{
        height: 36,
        backgroundColor: PANEL_BG,
      }}
    >
      <SuggestionDivider left={dividerE} />
      <SuggestionDivider left={dividerY} />
      <SuggestionDivider left={dividerO} />

      <SuggestionRegion
        left={`${SUGGESTION_BAR_PADDING_X}px`}
        right={`calc(100% - ${dividerE})`}
      >
        <span
          className="truncate px-2"
          style={{
            color: "#FFFFFF",
            fontFamily: KEYBOARD_FONT,
            fontSize: 17,
            fontWeight: IMESSAGE_FONT_WEIGHT.body,
            letterSpacing: "-0.02em",
          }}
        >
          {s1}
        </span>
      </SuggestionRegion>

      <SuggestionRegion left={dividerE} right={`calc(100% - ${dividerY})`}>
        <span
          className="truncate px-2"
          style={{
            color: "#FFFFFF",
            fontFamily: KEYBOARD_FONT,
            fontSize: 17,
            fontWeight: IMESSAGE_FONT_WEIGHT.body,
            letterSpacing: "-0.02em",
          }}
        >
          {s2}
        </span>
      </SuggestionRegion>

      <SuggestionRegion left={dividerY} right={`calc(100% - ${dividerO})`}>
        <span
          className="truncate px-2"
          style={{
            color: "#FFFFFF",
            fontFamily: KEYBOARD_FONT,
            fontSize: 16,
            fontWeight: IMESSAGE_FONT_WEIGHT.body,
            letterSpacing: 1,
          }}
        >
          {s3}
        </span>
      </SuggestionRegion>

      <SuggestionRegion
        left={dividerO}
        right={`${SUGGESTION_BAR_PADDING_X}px`}
      >
        <DictationIcon />
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
}: IOSKeyboardProps) {
  return (
    <div
      className="absolute left-0 right-0 bottom-0 z-30 overflow-hidden"
      style={{
        backgroundColor: BASE_BG,
        transform: isOpen ? "translateY(0)" : "translateY(100%)",
        transition: "transform 220ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      }}
    >
      <InputBar draftText={draftText} showSend={showSend} />

      <div
        style={{
          backgroundColor: PANEL_BG,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          overflow: "hidden",
          marginTop: INPUT_KEYBOARD_GAP,
          paddingTop: SUGGESTION_KEYS_GAP,
        }}
      >
        <SuggestionBar draftText={draftText} targetText={targetText} />

        <div
          style={{
            padding: `${SUGGESTION_KEYS_GAP}px ${KEY_GAP_H}px 4px`,
            backgroundColor: PANEL_BG,
          }}
        >
          <KeyRow>
            {ROW1.map((key) => (
              <Key key={key} label={key} pressedKey={pressedKey} />
            ))}
          </KeyRow>
          <KeyRow>
            {ROW2.map((key) => (
              <Key key={key} label={key} pressedKey={pressedKey} />
            ))}
          </KeyRow>
          <KeyRow>
            <Key pressedKey={pressedKey} flex={ROW3_SHIFT_FLEX} marginRight={ROW3_SIDE_GAP}>
              <KeyboardIcon
                name="shift"
                size={ICON_KEY_SIZE}
                weight={ICON_SYMBOL_WEIGHT}
                strokeWidth={ICON_SYMBOL_STROKE}
              />
            </Key>
            {ROW3.map((key) => (
              <Key
                key={key}
                label={key}
                pressedKey={pressedKey}
                flex={ROW3_LETTER_FLEX}
              />
            ))}
            <Key
              label="'"
              pressedKey={pressedKey}
              fontSize={22}
              flex={ROW3_APOSTROPHE_FLEX}
              marginRight={ROW3_SIDE_GAP}
            />
            <Key pressedKey={pressedKey} flex={ROW3_DELETE_FLEX}>
              <KeyboardIcon
                name="delete-left"
                size={ICON_KEY_SIZE}
                weight={ICON_SYMBOL_WEIGHT}
                strokeWidth={ICON_SYMBOL_STROKE}
              />
            </Key>
          </KeyRow>
          <KeyRow last>
            <Key pressedKey={pressedKey} flex={BOTTOM_ROW_SIDE_FLEX}>
              <Numeric123Label />
            </Key>
            <Key pressedKey={pressedKey} flex={BOTTOM_ROW_SIDE_FLEX}>
              <EmojiFaceIcon size={EMOJI_FACE_SIZE} />
            </Key>
            <Key pressedKey={pressedKey} flex={BOTTOM_ROW_SPACE_FLEX}>
              <span
                style={{
                  position: "absolute",
                  right: 10,
                  bottom: 7,
                  fontSize: 10,
                  color: "#8E8E93",
                  fontWeight: 400,
                  letterSpacing: "0.02em",
                }}
              >
                FR
              </span>
            </Key>
            <Key pressedKey={pressedKey} flex={BOTTOM_ROW_RETURN_FLEX}>
              <KeyboardIcon
                name="return"
                size={ICON_KEY_SIZE}
                weight={ICON_SYMBOL_WEIGHT}
                strokeWidth={ICON_SYMBOL_STROKE}
              />
            </Key>
          </KeyRow>
        </div>

        <div
          className="flex items-center justify-between"
          style={{
            height: 54,
            padding: `${GLOBE_ROW_TOP_PADDING}px 22px ${KEYBOARD_BOTTOM_PADDING}px`,
            backgroundColor: PANEL_BG,
          }}
        >
          <KeyboardIcon
            name="globe"
            size={ICON_SYSTEM_SIZE}
            color="#FFFFFF"
            weight={ICON_SYSTEM_WEIGHT}
            strokeWidth={ICON_SYSTEM_STROKE}
          />
          <KeyboardIcon
            name="mic"
            size={ICON_SYSTEM_SIZE}
            color="#FFFFFF"
            weight={ICON_SYSTEM_WEIGHT}
            strokeWidth={ICON_SYSTEM_STROKE}
          />
        </div>
      </div>
    </div>
  );
}

export const KEYBOARD_PANEL_HEIGHT = 402;
