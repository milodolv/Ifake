"use client";

interface ReadReceiptProps {
  type: "delivered" | "read";
  time?: string;
  darkMode: boolean;
}

export function ReadReceipt({ type, time, darkMode }: ReadReceiptProps) {
  const text =
    type === "delivered" ? "Distribué" : `Lu ${time ?? ""}`.trim();

  return (
    <div className="flex justify-end px-4 mb-2">
      <span
        className="text-[11px] font-medium"
        style={{ color: darkMode ? "#8E8E93" : "#8E8E93" }}
      >
        {text}
      </span>
    </div>
  );
}
