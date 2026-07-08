"use client";

import { Message } from "@/lib/types";
import { IMESSAGE, IMESSAGE_FONT } from "./theme";

interface MessageBubbleProps {
  message: Message;
  darkMode: boolean;
  isLastInGroup: boolean;
  isFirstInGroup: boolean;
  sameSenderAsPrev: boolean;
  isFirstInConversation?: boolean;
}

function BubbleTailRight({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="absolute pointer-events-none"
      style={{
        zIndex: 0,
        right: -9,
        bottom: 0,
        width: 20,
        height: 24,
        backgroundColor: color,
        borderBottomLeftRadius: 24,
      }}
    />
  );
}

function BubbleTailLeft({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="absolute pointer-events-none"
      style={{
        zIndex: 0,
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

  const showRightTail = isLastInGroup && isMe;
  const showLeftTail = isLastInGroup && !isMe;

  return (
    <div
      className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
      style={{ marginTop }}
    >
      <div
        className="relative break-words"
        style={{
          maxWidth: IMESSAGE.bubbleMaxWidth,
          marginRight: showRightTail ? 8 : 0,
          marginLeft: showLeftTail ? 6 : 0,
        }}
      >
        {showRightTail && <BubbleTailRight color={bubbleBg} />}
        {showLeftTail && <BubbleTailLeft color={bubbleBg} />}

        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: `${IMESSAGE.bubblePaddingY}px ${IMESSAGE.bubblePaddingX}px`,
            fontSize: IMESSAGE.bubbleFontSize,
            fontWeight: IMESSAGE.bubbleFontWeight,
            fontFamily: IMESSAGE_FONT,
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
              style={{ maxHeight: 200, position: "relative", zIndex: 2 }}
            />
          ) : (
            <span style={{ position: "relative", zIndex: 2 }}>{message.content}</span>
          )}
        </div>
      </div>
    </div>
  );
}
