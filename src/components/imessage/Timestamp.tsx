"use client";

interface TimestampProps {
  text: string;
  darkMode: boolean;
}

export function Timestamp({ text, darkMode }: TimestampProps) {
  return (
    <div className="flex justify-center my-3 px-3">
      <span
        className="text-[11px] font-medium px-2"
        style={{ color: darkMode ? "#8E8E93" : "#8E8E93" }}
      >
        {text}
      </span>
    </div>
  );
}
