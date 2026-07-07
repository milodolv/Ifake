"use client";

import { IMESSAGE } from "./theme";

interface TimestampProps {
  text: string;
  darkMode: boolean;
}

export function Timestamp({ text }: TimestampProps) {
  return (
    <div
      className="flex justify-center"
      style={{ margin: "16px 0 12px" }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: IMESSAGE.textSecondary,
          letterSpacing: "-0.01em",
        }}
      >
        {text}
      </span>
    </div>
  );
}
