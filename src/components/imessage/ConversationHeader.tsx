"use client";

import { getInitials } from "@/lib/utils";
import { IMESSAGE, IMESSAGE_FONT_WEIGHT } from "./theme";
import {
  ChevronCompactRightIcon,
  ChevronLeftIcon,
  VideoIcon,
} from "./icons/svgIcons";
import { KEYBOARD_FONT } from "./KeyboardIcon";

interface ConversationHeaderProps {
  name: string;
  photoUrl?: string;
  darkMode: boolean;
  top: number;
}

const AVATAR_SIZE = 62;
const HEADER_BUTTON_SIZE = 50;
const HEADER_CAMERA_BUTTON_SIZE = 54;
const HEADER_CAMERA_ICON_SIZE = 27;
const HEADER_BUBBLE_LIFT = 15;
const HEADER_ROW_TOP = 14;
const NAME_PILL_OVERLAP = 7;

function HeaderIconButton({
  children,
  size = HEADER_BUTTON_SIZE,
  style,
}: {
  children: React.ReactNode;
  size?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      data-export-header-button
      className="flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: "rgba(58, 58, 62, 0.58)",
        color: "#FFFFFF",
        ...style,
      }}
      aria-hidden
    >
      {children}
    </div>
  );
}

export function ConversationHeader({
  name,
  photoUrl,
  darkMode,
  top,
}: ConversationHeaderProps) {
  return (
    <div
      className="absolute left-0 right-0 z-[15] pointer-events-none"
      style={{
        top,
      }}
    >
      <div
        className="flex items-start justify-between pointer-events-auto"
        style={{
          height: IMESSAGE.headerHeight,
          paddingLeft: IMESSAGE.headerPaddingLeft,
          paddingRight: IMESSAGE.headerPaddingRight,
          paddingTop: HEADER_ROW_TOP,
          paddingBottom: 4,
        }}
      >
        <HeaderIconButton style={{ marginTop: -HEADER_BUBBLE_LIFT }}>
          <ChevronLeftIcon height={21} width={12} />
        </HeaderIconButton>

        <div
          className="flex flex-col items-center flex-1 min-w-0"
          style={{ marginTop: -HEADER_BUBBLE_LIFT }}
        >
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={name}
              className="rounded-full object-cover"
              style={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                position: "relative",
                zIndex: 2,
              }}
            />
          ) : (
            <div
              className="rounded-full flex items-center justify-center text-white"
              data-export-contact-avatar
              style={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                position: "relative",
                zIndex: 2,
                background: IMESSAGE.avatarGradient,
                fontSize: 34,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              <span data-export-avatar-initial>{getInitials(name)}</span>
            </div>
          )}

          <div
            className="flex items-center rounded-full shrink-0"
            data-export-contact-pill
            style={{
              marginTop: -NAME_PILL_OVERLAP,
              position: "relative",
              zIndex: 1,
              backgroundColor: darkMode
                ? IMESSAGE.pillBgDark
                : IMESSAGE.pillBgLight,
              padding: "7px 12px",
              gap: 2,
              whiteSpace: "nowrap",
              width: "max-content",
              maxWidth: "min(280px, calc(100% - 8px))",
            }}
          >
            <span
              data-export-contact-name
              style={{
                fontFamily: KEYBOARD_FONT,
                fontSize: 17,
                fontWeight: IMESSAGE_FONT_WEIGHT.bold,
                fontVariationSettings: `"wght" ${IMESSAGE_FONT_WEIGHT.bold}`,
                color: darkMode ? "#FFFFFF" : "#000000",
                letterSpacing: "-0.02em",
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              {name || "Contact"}
            </span>
            <ChevronCompactRightIcon height={15} width={9} />
          </div>
        </div>

        <HeaderIconButton
          size={HEADER_CAMERA_BUTTON_SIZE}
          style={{ marginTop: -HEADER_BUBBLE_LIFT }}
        >
          <VideoIcon size={HEADER_CAMERA_ICON_SIZE} />
        </HeaderIconButton>
      </div>
    </div>
  );
}
