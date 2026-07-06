"use client";

import { useRef, useState, useCallback } from "react";
import { useEditorStore, usePreviewAnimation } from "@/lib/store";
import { playConversationAnimation } from "@/lib/animationEngine";
import { playSound } from "@/lib/audioManager";
import {
  exportConversationVideo,
  shareOrDownloadVideo,
} from "@/lib/videoExport";
import { AnimationState } from "@/lib/types";
import { IMessagePreview } from "@/components/imessage/IMessagePreview";

const emptyAnim: AnimationState = {
  visibleMessageIds: [],
  isTyping: false,
  typingSender: null,
  activeTimestamps: {},
  showReadReceipt: false,
  isPlaying: false,
  isComplete: false,
};

export function PreviewPanel() {
  const settings = useEditorStore((s) => s.settings);
  const messages = useEditorStore((s) => s.messages);
  const setAnimation = useEditorStore((s) => s.setAnimation);
  const previewAnimation = usePreviewAnimation();

  const exportPreviewRef = useRef<HTMLDivElement>(null);

  const [displayAnimation, setDisplayAnimation] =
    useState<AnimationState>(emptyAnim);
  const [exportAnimation, setExportAnimation] =
    useState<AnimationState>(emptyAnim);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState("");
  const [exportedBlob, setExportedBlob] = useState<Blob | null>(null);
  const [exportedExt, setExportedExt] = useState("webm");

  const handlePreview = useCallback(async () => {
    setIsAnimating(true);
    setDisplayAnimation({ ...emptyAnim, isPlaying: true });
    setAnimation({ isPlaying: true, isComplete: false });

    await playConversationAnimation(messages, settings, {
      onUpdate: (partial) => {
        setDisplayAnimation((prev) => ({ ...prev, ...partial }));
        setAnimation(partial);
      },
      onSound: (type) => playSound(type),
    });

    setIsAnimating(false);
  }, [messages, settings, setAnimation]);

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
        setExportStatus,
        (partial) => {
          setExportAnimation((prev) => ({ ...prev, ...partial }));
          return new Promise((r) => requestAnimationFrame(() => r()));
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
    isAnimating || displayAnimation.isComplete
      ? displayAnimation
      : previewAnimation;

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-white/10"
        style={{ transform: "scale(0.85)", transformOrigin: "top center" }}
      >
        <IMessagePreview
          settings={settings}
          messages={messages}
          animation={anim}
        />
      </div>

      <div
        className="fixed pointer-events-none opacity-0"
        style={{ left: 0, top: 0, zIndex: -1 }}
        aria-hidden
      >
        <div ref={exportPreviewRef}>
          <IMessagePreview
            settings={settings}
            messages={messages}
            animation={exportAnimation}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <button
          type="button"
          onClick={handlePreview}
          disabled={isExporting || isAnimating}
          className="px-5 py-2.5 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/15 disabled:opacity-50"
        >
          Prévisualiser l&apos;animation
        </button>
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting || isAnimating}
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
  );
}
