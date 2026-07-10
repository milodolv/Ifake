"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { flushSync } from "react-dom";
import { useEditorStore, usePreviewAnimation } from "@/lib/store";
import {
  buildAnimationTimeline,
  getStateAtTime,
  TimelineKeyframe,
} from "@/lib/animationTimeline";
import {
  exportConversationVideo,
  shareOrDownloadVideo,
  EXPORT_PREVIEW_WIDTH,
  EXPORT_PREVIEW_HEIGHT,
} from "@/lib/videoExport";
import { AnimationState } from "@/lib/types";
import { DEFAULT_ANIMATION_STATE } from "@/lib/animationDefaults";
import { IMessagePreview } from "@/components/imessage/IMessagePreview";
import { IMESSAGE } from "@/components/imessage/theme";
import { AnimationPlaybackControls } from "./AnimationPlaybackControls";
import { ExportSpeedSelector } from "./ExportSpeedSelector";

const PREVIEW_SCALE = 0.85;
const CONTROLS_GAP_BELOW_SCREEN = 10;

const emptyAnim: AnimationState = { ...DEFAULT_ANIMATION_STATE };

export function PreviewPanel() {
  const settings = useEditorStore((s) => s.settings);
  const messages = useEditorStore((s) => s.messages);
  const setAnimation = useEditorStore((s) => s.setAnimation);
  const previewAnimation = usePreviewAnimation();

  const exportPreviewRef = useRef<HTMLDivElement>(null);
  const keyframesRef = useRef<TimelineKeyframe[]>([]);
  const durationMsRef = useRef(0);
  const currentTimeRef = useRef(0);
  const playbackRateRef = useRef(1);
  const pausedRef = useRef(false);
  const playingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);

  const [displayAnimation, setDisplayAnimation] =
    useState<AnimationState>(emptyAnim);
  const [exportAnimation, setExportAnimation] =
    useState<AnimationState>(emptyAnim);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState("");
  const [exportedBlob, setExportedBlob] = useState<Blob | null>(null);
  const [exportedExt, setExportedExt] = useState("mp4");

  const [showControls, setShowControls] = useState(false);
  const [currentMs, setCurrentMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const stopLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const applyTime = useCallback(
    (timeMs: number) => {
      const state = getStateAtTime(keyframesRef.current, timeMs);
      currentTimeRef.current = timeMs;
      setCurrentMs(timeMs);
      setDisplayAnimation(state);
      setAnimation(state);
    },
    [setAnimation]
  );

  const tick = useCallback(
    (now: number) => {
      if (!playingRef.current) return;

      if (!pausedRef.current) {
        const delta = now - lastFrameRef.current;
        lastFrameRef.current = now;
        const next = Math.min(
          currentTimeRef.current + delta * playbackRateRef.current,
          durationMsRef.current
        );
        applyTime(next);

        if (next >= durationMsRef.current) {
          playingRef.current = false;
          setIsPlaying(false);
          setIsPaused(false);
          return;
        }
      } else {
        lastFrameRef.current = now;
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [applyTime]
  );

  const startPlayback = useCallback(
    (fromMs = 0) => {
      stopLoop();
      const { keyframes, durationMs: totalMs } = buildAnimationTimeline(
        messages,
        settings
      );
      keyframesRef.current = keyframes;
      durationMsRef.current = totalMs;
      setDurationMs(totalMs);
      setShowControls(true);
      playingRef.current = true;
      setIsPlaying(true);
      pausedRef.current = false;
      setIsPaused(false);
      applyTime(fromMs);
      lastFrameRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    },
    [messages, settings, stopLoop, applyTime, tick]
  );

  useEffect(() => {
    return () => stopLoop();
  }, [stopLoop]);

  useEffect(() => {
    stopLoop();
    playingRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
    setShowControls(false);
    setCurrentMs(0);
    setDurationMs(0);
    keyframesRef.current = [];
    setDisplayAnimation(emptyAnim);
  }, [messages, settings, stopLoop]);

  const handlePreview = useCallback(() => {
    startPlayback(0);
  }, [startPlayback]);

  const handleTogglePlayPause = useCallback(() => {
    if (durationMsRef.current === 0) return;

    const atEnd = currentTimeRef.current >= durationMsRef.current;

    if (atEnd) {
      startPlayback(0);
      return;
    }

    if (playingRef.current && !pausedRef.current) {
      pausedRef.current = true;
      setIsPaused(true);
      return;
    }

    if (pausedRef.current) {
      pausedRef.current = false;
      setIsPaused(false);
      if (!playingRef.current) {
        playingRef.current = true;
        setIsPlaying(true);
        lastFrameRef.current = performance.now();
        rafRef.current = requestAnimationFrame(tick);
      }
      return;
    }

    startPlayback(currentTimeRef.current);
  }, [startPlayback, tick]);

  const handleSeekTo = useCallback(
    (timeMs: number) => {
      if (durationMsRef.current === 0) return;
      const next = Math.max(
        0,
        Math.min(timeMs, durationMsRef.current)
      );
      applyTime(next);
      if (next >= durationMsRef.current) {
        playingRef.current = false;
        setIsPlaying(false);
        setIsPaused(false);
        stopLoop();
      }
    },
    [applyTime, stopLoop]
  );

  const handleSeek = useCallback(
    (deltaMs: number) => {
      if (durationMsRef.current === 0) return;
      const next = Math.max(
        0,
        Math.min(currentTimeRef.current + deltaMs, durationMsRef.current)
      );
      applyTime(next);
      if (next >= durationMsRef.current) {
        playingRef.current = false;
        setIsPlaying(false);
        setIsPaused(false);
        stopLoop();
      }
    },
    [applyTime, stopLoop]
  );

  const handleSpeedChange = useCallback((rate: number) => {
    playbackRateRef.current = rate;
    setPlaybackRate(rate);
  }, []);

  const handleExport = async () => {
    const el = exportPreviewRef.current;
    if (!el) return;

    setIsExporting(true);
    setExportStatus("Initialisation…");
    setExportedBlob(null);
    setExportAnimation({ ...emptyAnim, isPlaying: true });

    try {
      await new Promise((r) => setTimeout(r, 300));

      const { blob, extension } = await exportConversationVideo(
        el,
        messages,
        settings,
        {
          playbackRate: playbackRateRef.current,
          onProgress: setExportStatus,
          onFrameUpdate: (partial) => {
            flushSync(() => {
              setExportAnimation((prev) => ({ ...prev, ...partial }));
            });
          },
        }
      );

      setExportedBlob(blob);
      setExportedExt(extension);
    } catch (e) {
      setExportStatus(
        e instanceof Error ? e.message : "Erreur lors de l'export"
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!exportedBlob) return;
    const result = await shareOrDownloadVideo(
      exportedBlob,
      `ifake-conversation.${exportedExt}`
    );
    setExportStatus(
      result === "shared" ? "Partagé avec succès" : "Téléchargement lancé"
    );
  };

  const anim =
    isPlaying || isPaused ? displayAnimation : previewAnimation;

  const previewBusy = isPlaying && !isPaused;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative shrink-0"
        style={{
          width: IMESSAGE.screenWidth * PREVIEW_SCALE,
          height: IMESSAGE.screenHeight * PREVIEW_SCALE,
        }}
      >
        <div
          className="absolute top-0 left-1/2 rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-white/10"
          style={{
            width: IMESSAGE.screenWidth,
            height: IMESSAGE.screenHeight,
            transform: `translateX(-50%) scale(${PREVIEW_SCALE})`,
            transformOrigin: "top center",
          }}
        >
          <IMessagePreview
            settings={settings}
            messages={messages}
            animation={anim}
            playbackRate={isPlaying || isPaused ? playbackRate : 1}
            playbackPaused={isPaused}
            bubbleEntranceEnabled={isPlaying || isPaused}
          />
        </div>
      </div>

      <div
        aria-hidden
        className="ifake-export-capture"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: EXPORT_PREVIEW_WIDTH,
          height: EXPORT_PREVIEW_HEIGHT,
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
          overflow: "hidden",
        }}
      >
        <div ref={exportPreviewRef}>
          <IMessagePreview
            settings={settings}
            messages={messages}
            animation={exportAnimation}
            playbackRate={playbackRateRef.current}
            bubbleEntranceEnabled={false}
            exportCaptureMode
          />
        </div>
      </div>

      <div
        className="w-full max-w-lg flex flex-col items-center gap-2.5"
        style={{ marginTop: CONTROLS_GAP_BELOW_SCREEN }}
      >
        <ExportSpeedSelector
          playbackRate={playbackRate}
          onSpeedChange={handleSpeedChange}
          disabled={isExporting || previewBusy}
        />

        <AnimationPlaybackControls
          currentMs={currentMs}
          durationMs={durationMs}
          isPlaying={isPlaying}
          isPaused={isPaused}
          visible={showControls}
          onTogglePlayPause={handleTogglePlayPause}
          onSeek={handleSeek}
          onSeekTo={handleSeekTo}
        />

        <div className="flex flex-wrap gap-2 justify-center">
          <button
            type="button"
            onClick={handlePreview}
            disabled={isExporting || previewBusy}
            className="px-5 py-2.5 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/15 disabled:opacity-50"
          >
            Prévisualiser l&apos;animation
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || previewBusy}
            className="px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium shadow-glow hover:bg-accent/90 disabled:opacity-50"
          >
            {isExporting ? "Export en cours…" : "Exporter en vidéo"}
          </button>
          {exportedBlob && (
            <button
              type="button"
              onClick={handleShare}
              className="px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium"
            >
              Partager / Télécharger
            </button>
          )}
        </div>

        {exportStatus && (
          <p className="text-xs text-white/50 text-center max-w-xs">
            {exportStatus}
          </p>
        )}
      </div>
    </div>
  );
}
