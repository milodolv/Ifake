"use client";

import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";

/** Durée de l'animation d'apparition des bulles (ms à vitesse x1). */
export const BUBBLE_ENTRANCE_MS = 340;

interface MessageBubbleEntranceProps {
  messageId: string;
  isVisible: boolean;
  enabled: boolean;
  isMe: boolean;
  playbackRate?: number;
  children: ReactNode;
}

export function MessageBubbleEntrance({
  messageId,
  isVisible,
  enabled,
  isMe,
  playbackRate = 1,
  children,
}: MessageBubbleEntranceProps) {
  const wasVisibleRef = useRef(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      wasVisibleRef.current = false;
      setIsAnimating(false);
      return;
    }

    if (!enabled || wasVisibleRef.current) return;

    wasVisibleRef.current = true;
    setIsAnimating(true);

    const durationMs = BUBBLE_ENTRANCE_MS / Math.max(playbackRate, 0.1);
    const timerId = window.setTimeout(() => setIsAnimating(false), durationMs);

    return () => window.clearTimeout(timerId);
  }, [isVisible, enabled, messageId, playbackRate]);

  const durationMs = BUBBLE_ENTRANCE_MS / Math.max(playbackRate, 0.1);
  const origin = isMe ? "right bottom" : "left bottom";

  const style: CSSProperties | undefined = isAnimating
    ? {
        transformOrigin: origin,
        animation: `ifake-bubble-enter ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1) both`,
      }
    : undefined;

  return (
    <div className="ifake-bubble-enter-wrap w-full" style={style}>
      {children}
    </div>
  );
}
