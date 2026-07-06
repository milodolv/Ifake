"use client";

import { ConversationSettings, Message, AnimationState } from "@/lib/types";
import { StatusBar } from "./StatusBar";
import { ConversationHeader } from "./ConversationHeader";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { Timestamp } from "./Timestamp";
import { ReadReceipt } from "./ReadReceipt";

interface IMessagePreviewProps {
  settings: ConversationSettings;
  messages: Message[];
  animation: AnimationState;
}

export function IMessagePreview({
  settings,
  messages,
  animation,
}: IMessagePreviewProps) {
  const visibleIds = animation.visibleMessageIds;
  const visibleMessages = messages.filter((m) => visibleIds.includes(m.id));
  const bg = settings.imessageDarkMode ? "#000000" : "#FFFFFF";

  const lastMeMessage = [...visibleMessages]
    .reverse()
    .find((m) => m.sender === "me");

  return (
    <div
      className="relative overflow-hidden flex flex-col shrink-0"
      style={{
        width: 390,
        height: 844,
        backgroundColor: bg,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
      }}
      data-export-target="true"
    >
      {settings.showStatusBar && (
        <StatusBar
          time={settings.statusBarTime}
          darkMode={settings.imessageDarkMode}
        />
      )}

      <ConversationHeader
        name={settings.contactName}
        photoUrl={settings.contactPhotoUrl}
        darkMode={settings.imessageDarkMode}
      />

      <div className="flex-1 overflow-hidden py-2">
        {messages.map((message) => {
          const ts = animation.activeTimestamps[message.id];
          const isVisible = visibleIds.includes(message.id);

          if (!isVisible && !ts) return null;

          const visibleIndex = visibleMessages.indexOf(message);
          const prev = visibleIndex > 0 ? visibleMessages[visibleIndex - 1] : null;
          const next =
            visibleIndex >= 0 && visibleIndex < visibleMessages.length - 1
              ? visibleMessages[visibleIndex + 1]
              : null;
          const isFirstInGroup = !prev || prev.sender !== message.sender;
          const isLastInGroup = !next || next.sender !== message.sender;

          return (
            <div key={message.id}>
              {ts && (
                <Timestamp
                  text={ts}
                  darkMode={settings.imessageDarkMode}
                />
              )}
              {isVisible && (
                <MessageBubble
                  message={message}
                  darkMode={settings.imessageDarkMode}
                  isFirstInGroup={isFirstInGroup}
                  isLastInGroup={isLastInGroup}
                />
              )}
            </div>
          );
        })}

        {animation.isTyping && animation.typingSender === "contact" && (
          <TypingIndicator darkMode={settings.imessageDarkMode} />
        )}
      </div>

      {animation.showReadReceipt && lastMeMessage && (
        <ReadReceipt
          type={settings.readReceiptType}
          time={settings.readReceiptTime}
          darkMode={settings.imessageDarkMode}
        />
      )}

      <div
        className="px-3 py-2 border-t flex items-center gap-2"
        style={{
          borderColor: settings.imessageDarkMode ? "#2C2C2E" : "#E5E5EA",
          backgroundColor: settings.imessageDarkMode ? "#1C1C1E" : "#F2F2F7",
        }}
      >
        <div
          className="flex-1 rounded-full px-4 py-[7px] text-[17px]"
          style={{
            backgroundColor: settings.imessageDarkMode ? "#2C2C2E" : "#FFFFFF",
            color: settings.imessageDarkMode ? "#8E8E93" : "#C7C7CC",
            border: settings.imessageDarkMode ? "none" : "1px solid #E5E5EA",
          }}
        >
          iMessage
        </div>
      </div>
    </div>
  );
}
