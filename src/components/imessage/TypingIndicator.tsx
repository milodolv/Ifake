"use client";

import { IMESSAGE } from "./theme";

interface TypingIndicatorProps {
  darkMode: boolean;
}

export function TypingIndicator({ darkMode }: TypingIndicatorProps) {
  const bg = darkMode
    ? IMESSAGE.bubbleContactDark
    : IMESSAGE.bubbleContactLight;

  return (
    <div
      className="flex justify-start w-full"
      style={{ marginTop: IMESSAGE.spacingDiffSender }}
    >
      <div
        className="flex items-center"
        style={{
          backgroundColor: bg,
          borderRadius: IMESSAGE.radiusBubble,
          padding: "10px 14px",
          gap: 5,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="rounded-full animate-bounce"
            style={{
              width: 7,
              height: 7,
              backgroundColor: IMESSAGE.textSecondary,
              animationDelay: `${i * 0.15}s`,
              animationDuration: "0.8s",
            }}
          />
        ))}
      </div>
    </div>
  );
}
