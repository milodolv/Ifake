"use client";

import { IMESSAGE } from "./theme";

interface MessageInputBarProps {
  darkMode: boolean;
}

export function MessageInputBar({ darkMode }: MessageInputBarProps) {
  const plusBg = darkMode ? IMESSAGE.plusBtnDark : "rgba(120, 120, 128, 0.16)";
  const plusColor = darkMode ? "#FFFFFF" : "#8E8E93";
  const iconColor = IMESSAGE.textSecondary;
  const fieldBg = darkMode ? IMESSAGE.inputFieldDark : IMESSAGE.inputFieldLight;
  const placeholderColor = IMESSAGE.textSecondary;

  return (
    <div
      className="shrink-0"
      style={{
        backgroundColor: darkMode
          ? IMESSAGE.inputBarDark
          : IMESSAGE.inputBarLight,
      }}
    >
      <div
        className="flex items-center"
        style={{ padding: "8px 10px 4px", gap: 6 }}
      >
        {/* Bouton + */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: plusBg,
            color: plusColor,
          }}
          aria-hidden
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 2.5v9M2.5 7h9"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Appareil photo */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{ width: 26, height: 26, color: iconColor }}
          aria-hidden
        >
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
            <path
              d="M2 4.5h3l1.5-2h7l1.5 2H18a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H2A1.5 1.5 0 0 1 .5 13V6A1.5 1.5 0 0 1 2 4.5z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <circle
              cx="10"
              cy="9"
              r="3"
              stroke="currentColor"
              strokeWidth="1.3"
            />
          </svg>
        </div>

        {/* App Store */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{ width: 26, height: 26, color: iconColor }}
          aria-hidden
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle
              cx="10"
              cy="10"
              r="8"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <path
              d="M6.5 14l3.5-8 3.5 8M8 11.5h4"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Champ iMessage */}
        <div
          className="flex-1 flex items-center rounded-full"
          style={{
            backgroundColor: fieldBg,
            minHeight: 36,
            paddingLeft: 14,
            paddingRight: 10,
            border: darkMode ? "none" : "1px solid #E5E5EA",
          }}
        >
          <span
            className="flex-1"
            style={{
              fontSize: 17,
              color: placeholderColor,
              letterSpacing: "-0.01em",
            }}
          >
            iMessage
          </span>
          <svg
            width="14"
            height="20"
            viewBox="0 0 14 20"
            fill="none"
            style={{ color: iconColor, flexShrink: 0 }}
            aria-hidden
          >
            <rect
              x="4.5"
              y="1"
              width="5"
              height="10"
              rx="2.5"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <path
              d="M2 9.5v1a5 5 0 0 0 10 0v-1"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d="M7 15v3"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Home indicator */}
      <div className="flex justify-center" style={{ paddingBottom: 8, paddingTop: 2 }}>
        <div
          style={{
            width: 134,
            height: 5,
            borderRadius: 3,
            backgroundColor: darkMode
              ? "rgba(255, 255, 255, 0.3)"
              : "rgba(0, 0, 0, 0.2)",
          }}
        />
      </div>
    </div>
  );
}
