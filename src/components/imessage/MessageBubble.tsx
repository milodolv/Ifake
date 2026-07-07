"use client";

import { Message } from "@/lib/types";
import { IMESSAGE } from "./theme";

interface MessageBubbleProps {
  message: Message;
  darkMode: boolean;
  isLastInGroup: boolean;
  isFirstInGroup: boolean;
  sameSenderAsPrev: boolean;
  isFirstInConversation?: boolean;
}

function BubbleTail({
  color,
  side,
}: {
  color: string;
  side: "left" | "right";
}) {
  if (side === "right") {
    return (
      <span
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          right: -5,
          bottom: 0,
          width: 16,
          height: 16,
          background: "transparent",
          borderBottomLeftRadius: 14,
          boxShadow: `-3px 0 0 0 ${color}`,
        }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className="absolute pointer-events-none"
      style={{
        left: -5,
        bottom: 0,
        width: 16,
        height: 16,
        background: "transparent",
        borderBottomRightRadius: 14,
        boxShadow: `3px 0 0 0 ${color}`,
      }}
    />
  );
}

export function MessageBubble({
  message,
  darkMode,
  isLastInGroup,
  isFirstInGroup,
  sameSenderAsPrev,
  isFirstInConversation = false,
}: MessageBubbleProps) {
  const isMe = message.sender === "me";

  const bubbleBg = isMe
    ? IMESSAGE.blue
    : darkMode
      ? IMESSAGE.bubbleContactDark
      : IMESSAGE.bubbleContactLight;

  const textColor = isMe
    ? "#FFFFFF"
    : darkMode
      ? "#FFFFFF"
      : "#000000";

  const r = IMESSAGE.radiusBubble;
  const c = IMESSAGE.radiusBubbleChain;

  const radius = isMe
    ? {
        borderTopLeftRadius: r,
        borderTopRightRadius: isFirstInGroup ? r : c,
        borderBottomLeftRadius: r,
        borderBottomRightRadius: isLastInGroup ? r : c,
      }
    : {
        borderTopLeftRadius: isFirstInGroup ? r : c,
        borderTopRightRadius: r,
        borderBottomLeftRadius: isLastInGroup ? r : c,
        borderBottomRightRadius: r,
      };

  const marginTop = sameSenderAsPrev
    ? IMESSAGE.spacingSameSender
    : isFirstInConversation
      ? 0
      : IMESSAGE.spacingDiffSender;

  return (
    <div
      className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
      style={{ marginTop }}
    >
      <div
        className="relative break-words"
        style={{
          maxWidth: IMESSAGE.bubbleMaxWidth,
          padding: `${IMESSAGE.bubblePaddingY}px ${IMESSAGE.bubblePaddingX}px`,
          fontSize: IMESSAGE.bubbleFontSize,
          lineHeight: `${IMESSAGE.bubbleLineHeight}px`,
          backgroundColor: bubbleBg,
          color: textColor,
          letterSpacing: "-0.01em",
          ...radius,
        }}
      >
        {message.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={message.imageUrl}
            alt=""
            className="rounded-2xl max-w-full"
            style={{ maxHeight: 200 }}
          />
        ) : (
          message.content
        )}

        {isLastInGroup && (
          <BubbleTail color={bubbleBg} side={isMe ? "right" : "left"} />
        )}
      </div>
    </div>
  );
}
