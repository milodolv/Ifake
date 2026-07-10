"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatPlaybackTime } from "@/lib/animationTimeline";

function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="6" y="5" width="4.5" height="14" rx="1" />
      <rect x="13.5" y="5" width="4.5" height="14" rx="1" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.5v13l10.5-6.5L8 5.5z" />
    </svg>
  );
}

interface AnimationPlaybackControlsProps {
  currentMs: number;
  durationMs: number;
  isPlaying: boolean;
  isPaused: boolean;
  visible: boolean;
  onTogglePlayPause: () => void;
  onSeek: (deltaMs: number) => void;
  onSeekTo: (timeMs: number) => void;
}

export function AnimationPlaybackControls({
  currentMs,
  durationMs,
  isPlaying,
  isPaused,
  visible,
  onTogglePlayPause,
  onSeek,
  onSeekTo,
}: AnimationPlaybackControlsProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const progress =
    durationMs > 0 ? Math.min(100, (currentMs / durationMs) * 100) : 0;

  const seekFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track || durationMs === 0) return;
      const { left, width } = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - left) / width));
      onSeekTo(ratio * durationMs);
    },
    [durationMs, onSeekTo]
  );

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (event: PointerEvent) => seekFromClientX(event.clientX);
    const onUp = () => setIsDragging(false);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [isDragging, seekFromClientX]);

  const handleTrackPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (durationMs === 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    seekFromClientX(event.clientX);
  };

  if (!visible) return null;

  const atEnd = currentMs >= durationMs && durationMs > 0;
  const showPause = isPlaying && !isPaused && !atEnd;

  const seekButtonClass =
    "min-w-[52px] px-2.5 py-2 rounded-lg bg-white/10 text-white/80 text-xs font-medium tabular-nums hover:bg-white/15 transition disabled:opacity-40 disabled:pointer-events-none";

  return (
    <div className="w-full max-w-lg rounded-xl border border-white/10 bg-white/[0.07] px-5 py-4 space-y-4">
      <div className="space-y-2">
        <div
          ref={trackRef}
          role="slider"
          aria-label="Position dans l'animation"
          aria-valuemin={0}
          aria-valuemax={durationMs}
          aria-valuenow={Math.round(currentMs)}
          aria-disabled={durationMs === 0}
          className={`relative h-5 flex items-center select-none touch-none ${
            durationMs === 0 ? "opacity-40 pointer-events-none" : "cursor-pointer"
          }`}
          onPointerDown={handleTrackPointerDown}
        >
          <div className="absolute inset-x-0 h-2 rounded-full bg-white/10" />
          <div
            className={`absolute left-0 h-2 rounded-full bg-accent pointer-events-none ${
              isDragging ? "" : "transition-[width] duration-100"
            }`}
            style={{ width: `${progress}%` }}
          />
          <div
            className={`absolute top-1/2 z-10 h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_0_2px_rgba(10,132,255,0.45)] pointer-events-none ${
              isDragging ? "" : "transition-[left] duration-100"
            }`}
            style={{
              left: `${progress}%`,
              transform: `translate(-50%, -50%)${isDragging ? " scale(1.1)" : ""}`,
            }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-white/50 tabular-nums">
          <span>{formatPlaybackTime(currentMs)}</span>
          <span>{formatPlaybackTime(durationMs)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={() => onSeek(-10000)}
          disabled={durationMs === 0}
          className={seekButtonClass}
        >
          -10s
        </button>
        <button
          type="button"
          onClick={() => onSeek(-5000)}
          disabled={durationMs === 0}
          className={seekButtonClass}
        >
          -5s
        </button>
        <button
          type="button"
          onClick={onTogglePlayPause}
          disabled={durationMs === 0}
          aria-label={showPause ? "Pause" : atEnd ? "Rejouer" : "Lecture"}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 transition disabled:opacity-40"
        >
          {showPause ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          type="button"
          onClick={() => onSeek(5000)}
          disabled={durationMs === 0}
          className={seekButtonClass}
        >
          +5s
        </button>
        <button
          type="button"
          onClick={() => onSeek(10000)}
          disabled={durationMs === 0}
          className={seekButtonClass}
        >
          +10s
        </button>
      </div>
    </div>
  );
}
