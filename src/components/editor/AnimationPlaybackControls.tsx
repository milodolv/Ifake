"use client";

import { formatPlaybackTime } from "@/lib/animationTimeline";

const SPEEDS = [0.5, 1, 1.5, 2] as const;

interface AnimationPlaybackControlsProps {
  currentMs: number;
  durationMs: number;
  isPlaying: boolean;
  isPaused: boolean;
  playbackRate: number;
  visible: boolean;
  onTogglePlayPause: () => void;
  onSkipForward: () => void;
  onSpeedChange: (rate: number) => void;
}

export function AnimationPlaybackControls({
  currentMs,
  durationMs,
  isPlaying,
  isPaused,
  playbackRate,
  visible,
  onTogglePlayPause,
  onSkipForward,
  onSpeedChange,
}: AnimationPlaybackControlsProps) {
  if (!visible) return null;

  const atEnd = currentMs >= durationMs && durationMs > 0;
  const showPause = isPlaying && !isPaused && !atEnd;

  return (
    <div className="w-full max-w-md rounded-lg border border-white/10 bg-white/5 p-3 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/60">Durée totale</span>
        <span className="text-white font-medium tabular-nums">
          {formatPlaybackTime(durationMs)}
        </span>
      </div>

      <div className="relative h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-accent rounded-full transition-[width] duration-100"
          style={{
            width:
              durationMs > 0
                ? `${Math.min(100, (currentMs / durationMs) * 100)}%`
                : "0%",
          }}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-white/80 text-sm tabular-nums min-w-[80px]">
          {formatPlaybackTime(currentMs)} / {formatPlaybackTime(durationMs)}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTogglePlayPause}
            className="px-3 py-1.5 rounded-md bg-white/10 text-white text-sm hover:bg-white/15"
          >
            {showPause ? "Pause" : atEnd ? "Rejouer" : "Lecture"}
          </button>
          <button
            type="button"
            onClick={onSkipForward}
            disabled={durationMs === 0}
            className="px-3 py-1.5 rounded-md bg-white/10 text-white text-sm hover:bg-white/15 disabled:opacity-40"
          >
            +10s
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-white/60 text-xs">Vitesse</span>
        {SPEEDS.map((speed) => (
          <button
            key={speed}
            type="button"
            onClick={() => onSpeedChange(speed)}
            className={`px-2.5 py-1 text-xs rounded-md transition ${
              playbackRate === speed
                ? "bg-accent/30 text-accent"
                : "bg-white/5 text-white/50 hover:text-white/70"
            }`}
          >
            {speed}x
          </button>
        ))}
      </div>
    </div>
  );
}
