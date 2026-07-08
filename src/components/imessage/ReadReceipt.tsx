"use client";

import { IMESSAGE, IMESSAGE_FONT } from "./theme";

interface ReadReceiptProps {
  type: "delivered" | "read";
  time?: string;
  date?: string;
  isToday?: boolean;
  darkMode: boolean;
}

export function ReadReceipt({
  type,
  time,
  date,
  isToday,
}: ReadReceiptProps) {
  let text = "Delivered";
  if (type === "read") {
    text = isToday
      ? `Lu ${time ?? ""}`.trim()
      : `Lu le ${date ?? time ?? ""}`.trim();
  }

  return (
    <div
      className="flex justify-end w-full"
      style={{ marginTop: 2, marginBottom: 6 }}
    >
      <span
        style={{
          fontFamily: IMESSAGE_FONT,
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
