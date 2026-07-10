"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ConversationSettings, Message, AnimationState } from "@/lib/types";
import { StatusBar } from "./StatusBar";
import { ConversationHeader } from "./ConversationHeader";
import { MessageBubble } from "./MessageBubble";
import { MessageBubbleEntrance } from "./MessageBubbleEntrance";
import { getWidestBubbleLine } from "@/lib/bubbleTextWrap";
import { TypingIndicator, TYPING_INDICATOR_PILL_INSET_X } from "./TypingIndicator";
import { Timestamp } from "./Timestamp";
import { ReadReceipt } from "./ReadReceipt";
import { ComposeInputBar, IOSKeyboard, KEYBOARD_PANEL_HEIGHT, COMPOSE_INPUT_BAR_HEIGHT } from "./IOSKeyboard";
import { TAIL_OUT } from "./bubblePath";
import { IMESSAGE, IMESSAGE_FONT } from "./theme";

interface IMessagePreviewProps {
  settings: ConversationSettings;
  messages: Message[];
  animation: AnimationState;
  /** Vitesse de lecture (bulle « en train d’écrire » incluse). */
  playbackRate?: number;
  playbackPaused?: boolean;
  /** Animation d'apparition des bulles (lecture / export). */
  bubbleEntranceEnabled?: boolean;
  /** Mode capture export — layout stable, sans transitions. */
  exportCaptureMode?: boolean;
}

export function IMessagePreview({
  settings,
  messages,
  animation,
  playbackRate = 1,
  playbackPaused = false,
  bubbleEntranceEnabled = false,
  exportCaptureMode = false,
}: IMessagePreviewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const meBodyWidthsRef = useRef(new Map<string, number>());
  const [meWidthVersion, setMeWidthVersion] = useState(0);
  const [keyboardOverlayHeight, setKeyboardOverlayHeight] = useState(
    KEYBOARD_PANEL_HEIGHT
  );
  const visibleIds = animation.visibleMessageIds;
  const dark = settings.imessageDarkMode;
  const bg = dark ? IMESSAGE.bgDark : IMESSAGE.bgLight;
  const keyboardActive = animation.showKeyboard;

  const lastMeMessageId = [...messages]
    .reverse()
    .find((m) => m.sender === "me")?.id;

  const reportMeBodyWidth = useCallback((messageId: string, width: number) => {
    if (meBodyWidthsRef.current.get(messageId) === width) return;
    meBodyWidthsRef.current.set(messageId, width);
    setMeWidthVersion((version) => version + 1);
  }, []);

  const getMinMeBodyWidthPx = useCallback(
    (messageId: string) => {
      void meWidthVersion;
      if (messageId !== lastMeMessageId) return undefined;
      const widths = Array.from(meBodyWidthsRef.current.entries())
        .filter(([id]) => id !== messageId)
        .map(([, width]) => width);
      if (widths.length === 0) return undefined;
      return Math.max(...widths);
    },
    [lastMeMessageId, meWidthVersion]
  );

  const showReceipt =
    settings.showReadReceipt &&
    !!lastMeMessageId &&
    (!animation.isPlaying || animation.showReadReceipt);

  const showContactTyping =
    animation.isTyping && animation.typingSender === "contact";

  const lastVisibleMessage = messages
    .filter((m) => visibleIds.includes(m.id))
    .at(-1);

  const contactTypingMarginTop = lastVisibleMessage
    ? lastVisibleMessage.sender === "contact"
      ? IMESSAGE.spacingSameSender
      : IMESSAGE.spacingDiffSender
    : 0;

  const contactBubbleMarginLeft =
    IMESSAGE.headerPaddingLeft - IMESSAGE.screenPaddingX;

  const hasDraft = animation.draftText.length > 0;
  const showSend =
    animation.showSendButton || (keyboardActive && hasDraft);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight - el.clientHeight;
  }, []);

  useEffect(() => {
    if (!keyboardActive) setKeyboardOverlayHeight(KEYBOARD_PANEL_HEIGHT);
  }, [keyboardActive]);

  useLayoutEffect(() => {
    scrollToBottom();
  }, [
    visibleIds,
    animation.activeTimestamps,
    animation.isTyping,
    animation.showReadReceipt,
    showReceipt,
    keyboardOverlayHeight,
    keyboardActive,
    messages,
    scrollToBottom,
  ]);

  useEffect(() => {
    const meIds = new Set(
      messages.filter((m) => m.sender === "me").map((m) => m.id)
    );
    for (const id of Array.from(meBodyWidthsRef.current.keys())) {
      if (!meIds.has(id)) meBodyWidthsRef.current.delete(id);
    }
  }, [messages]);

  return (
    <div
      className={`relative overflow-hidden shrink-0${exportCaptureMode ? " ifake-export-capture" : ""}`}
      style={{
        width: IMESSAGE.screenWidth,
        height: IMESSAGE.screenHeight,
        backgroundColor: bg,
        fontFamily: IMESSAGE_FONT,
        fontWeight: 500,
        WebkitFontSmoothing: "antialiased",
      }}
      data-export-target="true"
    >
      <div
        ref={scrollRef}
        data-export-scroll
        className="absolute inset-0 overflow-y-auto overflow-x-hidden z-0"
        style={{
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
          overscrollBehavior: "contain",
        }}
      >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              minHeight: "100%",
              paddingTop: IMESSAGE.headerHeight,
              paddingBottom:
                (keyboardActive
                  ? keyboardOverlayHeight
                  : COMPOSE_INPUT_BAR_HEIGHT) + 4,
              paddingLeft: IMESSAGE.screenPaddingX + TAIL_OUT,
              paddingRight: IMESSAGE.screenPaddingX + TAIL_OUT,
              boxSizing: "border-box",
            }}
          >
            {messages.map((message, msgIndex) => {
              const ts = animation.activeTimestamps[message.id];
              const isVisible = visibleIds.includes(message.id);

              if (!isVisible && !ts) return null;

              const prevInConversation =
                msgIndex > 0 ? messages[msgIndex - 1] : null;
              const nextInConversation =
                msgIndex < messages.length - 1
                  ? messages[msgIndex + 1]
                  : null;

              const isFirstInGroup =
                !prevInConversation ||
                prevInConversation.sender !== message.sender;
              const isLastInGroup =
                !nextInConversation ||
                nextInConversation.sender !== message.sender;
              const sameSenderAsPrev =
                prevInConversation !== null &&
                prevInConversation.sender === message.sender;
              const isFirstInConversation = msgIndex === 0;

              const isLastMeInConversation =
                isVisible &&
                message.sender === "me" &&
                message.id === lastMeMessageId;

              const prevMeMessage = messages
                .slice(0, msgIndex)
                .reverse()
                .find((m) => m.sender === "me");

              const lastMeTailAlignRefLine =
                isLastMeInConversation &&
                sameSenderAsPrev &&
                prevMeMessage &&
                !prevMeMessage.imageUrl
                  ? getWidestBubbleLine(prevMeMessage.content)
                  : undefined;

              return (
                <div key={message.id}>
                  {ts && <Timestamp text={ts} darkMode={dark} />}
                  {isVisible && (
                    <MessageBubbleEntrance
                      messageId={message.id}
                      isVisible={isVisible}
                      enabled={bubbleEntranceEnabled}
                      isMe={message.sender === "me"}
                      playbackRate={playbackRate}
                    >
                      <MessageBubble
                        message={message}
                        darkMode={dark}
                        isFirstInGroup={isFirstInGroup}
                        isLastInGroup={isLastInGroup}
                        sameSenderAsPrev={sameSenderAsPrev}
                        isFirstInConversation={isFirstInConversation}
                        isLastMeInConversation={isLastMeInConversation}
                        lastMeTailAlignRefLine={lastMeTailAlignRefLine}
                        minMeBodyWidthPx={getMinMeBodyWidthPx(message.id)}
                        onMeBodyWidthReport={
                          message.sender === "me"
                            ? (width) => reportMeBodyWidth(message.id, width)
                            : undefined
                        }
                      />
                    </MessageBubbleEntrance>
                  )}
                </div>
              );
            })}

            {showContactTyping && (
              <div
                className="flex w-full justify-start"
                style={{ marginTop: contactTypingMarginTop }}
              >
                <div
                  style={{
                    marginLeft:
                      contactBubbleMarginLeft - TYPING_INDICATOR_PILL_INSET_X,
                  }}
                >
                  <TypingIndicator
                    darkMode={dark}
                    playbackRate={playbackRate}
                    paused={playbackPaused}
                  />
                </div>
              </div>
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

      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          height: IMESSAGE.conversationTopFadeHeight,
          background: dark
            ? "linear-gradient(to bottom, rgba(0, 0, 0, 0.94) 0%, rgba(0, 0, 0, 0.78) 22%, rgba(0, 0, 0, 0.42) 52%, rgba(0, 0, 0, 0.12) 78%, rgba(0, 0, 0, 0) 100%)"
            : "linear-gradient(to bottom, rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.78) 22%, rgba(255, 255, 255, 0.42) 52%, rgba(255, 255, 255, 0.12) 78%, rgba(255, 255, 255, 0) 100%)",
        }}
      />

      {settings.showStatusBar && (
        <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
          <StatusBar
            time={settings.statusBarTime}
            darkMode={dark}
            useLiveTime={settings.statusBarLiveTime}
            batteryLevel={settings.statusBarBatteryLevel}
          />
        </div>
      )}

      <ConversationHeader
        name={settings.contactName}
        photoUrl={settings.contactPhotoUrl}
        darkMode={dark}
        top={
          (settings.showStatusBar ? IMESSAGE.statusBarHeight : 0) -
          IMESSAGE.headerChromeLift
        }
      />

      {!keyboardActive && (
        <div className="absolute left-0 right-0 bottom-0 z-20 pointer-events-none">
          <ComposeInputBar />
        </div>
      )}

      {keyboardActive && (
        <IOSKeyboard
          pressedKey={animation.pressedKey}
          isOpen={animation.keyboardOpen}
          draftText={animation.draftText}
          showSend={showSend}
          targetText={animation.keyboardTargetText}
          onOverlayHeightChange={setKeyboardOverlayHeight}
          playbackRate={playbackRate}
          playbackPaused={playbackPaused}
          exportCaptureMode={exportCaptureMode}
        />
      )}
    </div>
  );
}
