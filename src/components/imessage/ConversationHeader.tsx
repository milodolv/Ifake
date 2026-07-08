"use client";

import { getInitials } from "@/lib/utils";
import { IMESSAGE, IMESSAGE_FONT_WEIGHT } from "./theme";
import { HeaderIcon } from "./HeaderIcon";
import { KEYBOARD_FONT } from "./KeyboardIcon";

interface ConversationHeaderProps {
  name: string;
  photoUrl?: string;
  darkMode: boolean;
}

const AVATAR_SIZE = 62;
const HEADER_BUTTON_SIZE = 50;
const HEADER_ROW_TOP = 14;
const NAME_PILL_OVERLAP = 6;

function HeaderIconButton({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-center shrink-0"
      style={{
        width: HEADER_BUTTON_SIZE,
        height: HEADER_BUTTON_SIZE,
        borderRadius: "50%",
        backgroundColor: "rgba(58, 58, 62, 0.58)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        color: "#FFFFFF",
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
}: ConversationHeaderProps) {
  return (
    <div
      className="absolute top-0 left-0 right-0 z-10"
      style={{
        backgroundColor: darkMode
          ? IMESSAGE.headerBlurDark
          : IMESSAGE.headerBlurLight,
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
      }}
    >
      <div
        className="flex items-start justify-between"
        style={{
          height: IMESSAGE.headerHeight,
          paddingLeft: 8,
          paddingRight: 12,
          paddingTop: HEADER_ROW_TOP,
          paddingBottom: 4,
        }}
      >
        <HeaderIconButton>
          <HeaderIcon name="chevron-left" size={23} weight={680} strokeWidth={0.58} />
        </HeaderIconButton>

        <div className="flex flex-col items-center flex-1 min-w-0">
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
              {getInitials(name)}
            </div>
          )}

          <div
            className="flex items-center rounded-full"
            style={{
              marginTop: -NAME_PILL_OVERLAP,
              position: "relative",
              zIndex: 1,
              backgroundColor: darkMode
                ? IMESSAGE.pillBgDark
                : IMESSAGE.pillBgLight,
              padding: "7px 10px",
              gap: 2,
            }}
          >
            <span
              style={{
                fontFamily: KEYBOARD_FONT,
                fontSize: 17,
                fontWeight: IMESSAGE_FONT_WEIGHT.bold,
                fontVariationSettings: `"wght" ${IMESSAGE_FONT_WEIGHT.bold}`,
                color: darkMode ? "#FFFFFF" : "#000000",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              {name || "Contact"}
            </span>
            <HeaderIcon
              name="chevron-compact-right"
              size={15}
              color="#8E8E93"
              weight={760}
              strokeWidth={0.48}
            />
          </div>
        </div>

        <HeaderIconButton>
          <HeaderIcon name="video" size={22} weight={500} strokeWidth={0.28} />
        </HeaderIconButton>
      </div>
    </div>
  );
}
