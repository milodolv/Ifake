"use client";

import { getInitials, getAvatarColor } from "@/lib/utils";

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
  const textColor = darkMode ? "#FFFFFF" : "#000000";
  const subColor = darkMode ? "#8E8E93" : "#8E8E93";

  return (
    <div
      className="flex flex-col items-center pt-1 pb-2 border-b"
      style={{
        borderColor: darkMode ? "#2C2C2E" : "#E5E5EA",
        backgroundColor: darkMode ? "#000000" : "#F9F9F9",
      }}
    >
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt={name}
          className="w-10 h-10 rounded-full object-cover mb-1"
        />
      ) : (
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold mb-1"
          style={{ backgroundColor: getAvatarColor(name) }}
        >
          {getInitials(name)}
        </div>
      )}
      <span
        className="text-[11px] font-medium"
        style={{ color: subColor }}
      >
        iMessage
      </span>
      <span
        className="text-[13px] font-semibold"
        style={{ color: textColor }}
      >
        {name || "Contact"}
      </span>
    </div>
  );
}
