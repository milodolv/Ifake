"use client";

import { useEffect, useRef } from "react";
import { ConversationSettings, Message, AnimationState } from "@/lib/types";
import { StatusBar } from "./StatusBar";
import { ConversationHeader } from "./ConversationHeader";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { Timestamp } from "./Timestamp";
import { ReadReceipt } from "./ReadReceipt";
import { ComposeInputBar, IOSKeyboard, KEYBOARD_PANEL_HEIGHT } from "./IOSKeyboard";
import { IMESSAGE, IMESSAGE_FONT } from "./theme";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const visibleIds = animation.visibleMessageIds;
  const visibleMessages = messages.filter((m) => visibleIds.includes(m.id));
  const dark = settings.imessageDarkMode;
  const bg = dark ? IMESSAGE.bgDark : IMESSAGE.bgLight;
  const keyboardActive = animation.showKeyboard;

  const lastMeMessage = [...visibleMessages]
    .reverse()
    .find((m) => m.sender === "me");

  const showReceipt =
    settings.showReadReceipt &&
    !!lastMeMessage &&
    (!animation.isPlaying || animation.showReadReceipt);

  const hasDraft = animation.draftText.length > 0;
  const showSend =
    animation.showSendButton || (keyboardActive && hasDraft);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = 0;
  }, [messages, visibleIds, animation.isTyping, showReceipt]);

  return (
    <div
      className="relative overflow-hidden flex flex-col shrink-0"
      style={{
        width: 402,
        height: 844,
        backgroundColor: bg,
        fontFamily: IMESSAGE_FONT,
        fontWeight: 500,
        WebkitFontSmoothing: "antialiased",
      }}
      data-export-target="true"
    >
      {settings.showStatusBar && (
        <StatusBar
          time={settings.statusBarTime}
          darkMode={dark}
          useLiveTime={settings.statusBarLiveTime}
          batteryLevel={settings.statusBarBatteryLevel}
        />
      )}

      <div className="flex-1 relative overflow-hidden min-h-0">
        <div
          ref={scrollRef}
          className="absolute inset-0 overflow-y-auto overflow-x-hidden"
          style={{
            paddingBottom: keyboardActive ? KEYBOARD_PANEL_HEIGHT : undefined,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              paddingTop: IMESSAGE.headerHeight,
              paddingBottom: 4,
              paddingLeft: IMESSAGE.screenPaddingX,
              paddingRight: IMESSAGE.screenPaddingX,
              boxSizing: "border-box",
            }}
          >
            {messages.map((message, msgIndex) => {
              const ts = animation.activeTimestamps[message.id];
              const isVisible = visibleIds.includes(message.id);

              if (!isVisible && !ts) return null;

              const visibleIndex = visibleMessages.indexOf(message);
              const prev =
                visibleIndex > 0 ? visibleMessages[visibleIndex - 1] : null;
              const next =
                visibleIndex >= 0 && visibleIndex < visibleMessages.length - 1
                  ? visibleMessages[visibleIndex + 1]
                  : null;
              const isFirstInGroup =
                !prev || prev.sender !== message.sender;
              const isLastInGroup =
                !next || next.sender !== message.sender;

              const prevVisible = messages
                .slice(0, msgIndex)
                .reverse()
                .find((m) => visibleIds.includes(m.id));
              const sameSenderAsPrev =
                isVisible &&
                prevVisible !== undefined &&
                prevVisible.sender === message.sender;

              const isFirstInConversation =
                isVisible && visibleIndex === 0;

              return (
                <div key={message.id}>
                  {ts && <Timestamp text={ts} darkMode={dark} />}
                  {isVisible && (
                    <MessageBubble
                      message={message}
                      darkMode={dark}
                      isFirstInGroup={isFirstInGroup}
                      isLastInGroup={isLastInGroup}
                      sameSenderAsPrev={!!sameSenderAsPrev}
                      isFirstInConversation={isFirstInConversation}
                    />
                  )}
                </div>
              );
            })}

            {animation.isTyping && animation.typingSender === "contact" && (
              <TypingIndicator darkMode={dark} />
            )}

            {showReceipt && (
              <ReadReceipt
                type={settings.readReceiptType}
                time={settings.readReceiptTime}
                date={settings.readReceiptDate}
                isToday={settings.readReceiptIsToday}
                darkMode={dark}
              />
            )}
          </div>
        </div>

        <ConversationHeader
          name={settings.contactName}
          photoUrl={settings.contactPhotoUrl}
          darkMode={dark}
        />
      </div>

      {!keyboardActive && <ComposeInputBar />}

      {keyboardActive && (
        <IOSKeyboard
          pressedKey={animation.pressedKey}
          isOpen={animation.keyboardOpen}
          draftText={animation.draftText}
          showSend={showSend}
          targetText={animation.keyboardTargetText}
        />
      )}
    </div>
  );
}
