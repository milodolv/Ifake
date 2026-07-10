"use client";

import { formatPlaybackTime } from "@/lib/animationTimeline";

const SPEEDS = [0.2, 0.5, 1, 1.5, 2, 4, 5] as const;

function formatSpeedLabel(speed: number): string {
  const value =
    speed % 1 === 0 ? String(speed) : speed.toString().replace(".", ",");
  return `x${value}`;
}

interface ExportSpeedSelectorProps {
  playbackRate: number;
  onSpeedChange: (rate: number) => void;
  disabled?: boolean;
}

/** Vitesse d'export / lecture — toujours visible avant export. */
export function ExportSpeedSelector({
  playbackRate,
  onSpeedChange,
  disabled,
}: ExportSpeedSelectorProps) {
  return (
    <div className="w-full max-w-lg rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-white/50 uppercase tracking-wide">
          Vitesse export
        </span>
        <span className="text-xs text-white/40">
          {formatSpeedLabel(playbackRate)} sélectionné
        </span>
      </div>
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        {SPEEDS.map((speed) => (
          <button
            key={speed}
            type="button"
            disabled={disabled}
            onClick={() => onSpeedChange(speed)}
            className={`min-w-[46px] px-2.5 py-1.5 text-xs rounded-lg transition font-medium disabled:opacity-40 ${
              playbackRate === speed
                ? "bg-accent/30 text-accent"
                : "bg-white/5 text-white/60 hover:text-white/80 hover:bg-white/10"
            }`}
          >
            {formatSpeedLabel(speed)}
          </button>
        ))}
      </div>
    </div>
  );
}

export { SPEEDS, formatSpeedLabel, formatPlaybackTime };
