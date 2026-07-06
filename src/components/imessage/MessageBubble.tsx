"use client";

import { Message } from "@/lib/types";

interface MessageBubbleProps {
  message: Message;
  darkMode: boolean;
  isLastInGroup: boolean;
  isFirstInGroup: boolean;
}

export function MessageBubble({
  message,
  darkMode,
  isLastInGroup,
  isFirstInGroup,
}: MessageBubbleProps) {
  const isMe = message.sender === "me";

  const bubbleBg = isMe
    ? "#0A84FF"
    : darkMode
      ? "#3A3A3C"
      : "#E9E9EB";

  const textColor = isMe ? "#FFFFFF" : darkMode ? "#FFFFFF" : "#000000";

  const radius = isMe
    ? {
        borderTopLeftRadius: 18,
        borderTopRightRadius: isFirstInGroup ? 18 : 6,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: isLastInGroup ? 18 : 6,
      }
    : {
        borderTopLeftRadius: isFirstInGroup ? 18 : 6,
        borderTopRightRadius: 18,
        borderBottomLeftRadius: isLastInGroup ? 18 : 6,
        borderBottomRightRadius: 18,
      };

  return (
    <div
      className={`flex mb-[2px] px-3 ${isMe ? "justify-end" : "justify-start"}`}
    >
      <div
        className="relative max-w-[75%] px-[14px] py-[8px] text-[17px] leading-[22px] break-words"
        style={{
          backgroundColor: bubbleBg,
          color: textColor,
          ...radius,
        }}
      >
        {message.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={message.imageUrl}
            alt=""
            className="rounded-xl max-w-full"
            style={{ maxHeight: 200 }}
          />
        ) : (
          message.content
        )}

        {/* Queue de bulle */}
        {isLastInGroup && (
          <span
            className="absolute bottom-0"
            style={{
              [isMe ? "right" : "left"]: -5,
              width: 0,
              height: 0,
              borderStyle: "solid",
              borderWidth: isMe ? "0 0 12px 10px" : "0 10px 12px 0",
              borderColor: isMe
                ? `transparent transparent ${bubbleBg} transparent`
                : `transparent ${bubbleBg} transparent transparent`,
              transform: isMe ? "rotate(-10deg)" : "rotate(10deg)",
              opacity: 0.9,
            }}
          />
        )}
      </div>
    </div>
  );
}
