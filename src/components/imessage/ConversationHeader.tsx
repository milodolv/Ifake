"use client";

import { getInitials } from "@/lib/utils";
import { IMESSAGE } from "./theme";

interface ConversationHeaderProps {
  name: string;
  photoUrl?: string;
  darkMode: boolean;
}

export function ConversationHeader({
  name,
  photoUrl,
  darkMode,
}: ConversationHeaderProps) {
  const iconColor = darkMode ? "#FFFFFF" : "#007AFF";

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
        className="flex items-center justify-between"
        style={{
          height: IMESSAGE.headerHeight,
          paddingLeft: 8,
          paddingRight: 12,
          paddingBottom: 4,
        }}
      >
        {/* Chevron retour */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{ width: 40, height: 40, color: iconColor }}
          aria-hidden
        >
          <svg width="11" height="19" viewBox="0 0 11 19" fill="none">
            <path
              d="M9.5 1.5L2 9.5l7.5 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Avatar + pastille nom */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={name}
              className="rounded-full object-cover"
              style={{ width: 50, height: 50, marginBottom: 2 }}
            />
          ) : (
            <div
              className="rounded-full flex items-center justify-center text-white font-normal"
              style={{
                width: 50,
                height: 50,
                marginBottom: 2,
                background: IMESSAGE.avatarGradient,
                fontSize: 24,
                fontWeight: 400,
              }}
            >
              {getInitials(name)}
            </div>
          )}

          <div
            className="flex items-center rounded-full"
            style={{
              backgroundColor: darkMode
                ? IMESSAGE.pillBgDark
                : IMESSAGE.pillBgLight,
              padding: "3px 10px",
              gap: 2,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: darkMode ? "#FFFFFF" : "#000000",
                letterSpacing: "-0.01em",
              }}
            >
              {name || "Contact"}
            </span>
            <svg width="5" height="8" viewBox="0 0 5 8" fill="none">
              <path
                d="M1 1l3 3-3 3"
                stroke="#8E8E93"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Caméra vidéo */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{ width: 40, height: 40, color: iconColor }}
          aria-hidden
        >
          <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
            <rect
              x="1"
              y="2"
              width="13"
              height="10"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path
              d="M14 5.5l7-4v11l-7-4V5.5z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
