import html2canvas from "html2canvas";
import { Muxer, ArrayBufferTarget } from "mp4-muxer";
import { buildAnimationTimeline, getStateAtTime } from "./animationTimeline";
import { Message, ConversationSettings, AnimationState } from "./types";
import { sleep } from "./utils";
import { DEFAULT_ANIMATION_STATE } from "./animationDefaults";
import { IMESSAGE } from "@/components/imessage/theme";
import {
  applyScrollOffsetInClone,
  scrollConversationToBottom,
} from "./conversationScroll";

export const EXPORT_WIDTH = 1080;
export const EXPORT_HEIGHT = 1920;
export const EXPORT_FPS = 30;
export const EXPORT_BITRATE = 10_000_000;

/** Facteur html2canvas — capture native ~1080 px sans upscale flou. */
export const EXPORT_CAPTURE_SCALE = EXPORT_WIDTH / IMESSAGE.screenWidth;

export interface ExportVideoOptions {
  playbackRate?: number;
  onProgress?: (status: string) => void;
  onFrameUpdate?: (
    partial: Partial<AnimationState>
  ) => void | Promise<void>;
}

const H264_CODEC_CANDIDATES = [
  "avc1.42001f",
  "avc1.4d002a",
  "avc1.640028",
] as const;

/** État visuel — évite html2canvas quand rien n'a changé entre deux frames. */
function getCaptureSignature(state: AnimationState): string {
  return JSON.stringify({
    v: state.visibleMessageIds,
    ts: state.activeTimestamps,
    ty: state.isTyping,
    tsr: state.typingSender,
    rr: state.showReadReceipt,
    kb: state.showKeyboard,
    ko: state.keyboardOpen,
    d: state.draftText,
    pk: state.pressedKey,
    ss: state.showSendButton,
    kt: state.keyboardTargetText,
  });
}

async function waitForPaint(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function stabilizeClone(
  root: HTMLElement,
  doc: Document,
  scrollTop: number
): void {
  root.classList.add("ifake-export-capture");
  root.style.transform = "none";
  root.style.opacity = "1";

  root.querySelectorAll<HTMLElement>("[data-export-keyboard]").forEach((kb) => {
    const open = !kb.dataset.keyboardClosed;
    kb.style.transform = open ? "translateY(0)" : "translateY(100%)";
  });

  // html2canvas interprète mal flex-end / line-height — force le centrage vertical.
  root
    .querySelectorAll<HTMLElement>("[data-export-flex-center]")
    .forEach((el) => {
      el.style.alignItems = "center";
    });

  root
    .querySelectorAll<HTMLElement>("[data-export-input-inner]")
    .forEach((el) => {
      el.style.transform = "none";
    });

  if (!doc.getElementById("ifake-export-capture-styles")) {
    const style = doc.createElement("style");
    style.id = "ifake-export-capture-styles";
    style.textContent = `
      .ifake-export-capture {
        --ifake-export-text-nudge: -8px;
        --ifake-export-key-nudge: -8px;
        --ifake-export-bubble-nudge: -8px;
        --ifake-export-input-nudge: -10px;
        --ifake-export-suggestion-nudge: -11px;
        --ifake-export-contact-name-nudge: -4px;
        --ifake-export-avatar-nudge: -5px;
        --ifake-export-icon-nudge: -8px;
        --ifake-export-key-glyphs-nudge: -8px;
        --ifake-export-key-callout-nudge: -5px;
        --ifake-export-globe-icon-nudge: 3px;
        --ifake-export-bubble-weight: 508;
        --ifake-export-input-weight: 505;
        --ifake-export-body-weight: 505;
        --ifake-export-contact-weight: 620;
      }
      .ifake-export-capture .ifake-export-text {
        position: relative;
        top: var(--ifake-export-text-nudge);
        line-height: 1.1;
      }
      .ifake-export-capture [data-export-bubble-text] {
        position: relative;
        top: var(--ifake-export-bubble-nudge);
        line-height: 22px;
        font-weight: var(--ifake-export-bubble-weight) !important;
        font-variation-settings: normal !important;
      }
      .ifake-export-capture [data-export-input-field],
      .ifake-export-capture [data-export-input-draft],
      .ifake-export-capture [data-export-input-placeholder] {
        font-weight: var(--ifake-export-input-weight) !important;
        font-variation-settings: normal !important;
      }
      .ifake-export-capture [data-export-input-draft],
      .ifake-export-capture [data-export-input-placeholder] {
        position: relative;
        top: var(--ifake-export-input-nudge);
        line-height: 22px;
      }
      .ifake-export-capture [data-export-suggestion-text] {
        position: relative;
        top: var(--ifake-export-suggestion-nudge) !important;
        font-weight: var(--ifake-export-body-weight) !important;
        font-variation-settings: normal !important;
      }
      .ifake-export-capture [data-export-icon],
      .ifake-export-capture [data-export-key-glyphs] {
        position: relative;
        top: var(--ifake-export-icon-nudge) !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      .ifake-export-capture [data-export-key-glyphs] {
        top: var(--ifake-export-key-glyphs-nudge) !important;
      }
      .ifake-export-capture svg[data-export-icon] {
        position: relative;
        top: var(--ifake-export-icon-nudge) !important;
        display: block;
      }
      .ifake-export-capture [data-export-header-button] {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      .ifake-export-capture [data-export-space-label] {
        bottom: 7px !important;
      }
      .ifake-export-capture [data-export-contact-name] {
        position: relative;
        top: var(--ifake-export-contact-name-nudge) !important;
        font-weight: var(--ifake-export-contact-weight) !important;
        font-variation-settings: normal !important;
      }
      .ifake-export-capture [data-export-avatar-initial] {
        position: relative;
        top: var(--ifake-export-avatar-nudge);
        display: inline-block;
        line-height: 1;
      }
      .ifake-export-capture [data-export-contact-pill] {
        white-space: nowrap !important;
        width: max-content !important;
        align-items: center !important;
      }
      .ifake-export-capture [data-export-globe-row] {
        align-items: center !important;
      }
      .ifake-export-capture [data-export-globe-row] [data-export-globe-icon] {
        transform: translateY(var(--ifake-export-globe-icon-nudge)) !important;
      }
      .ifake-export-capture [data-export-globe-row] [data-export-icon] {
        top: 0 !important;
      }
      .ifake-export-capture [data-export-key-cap] {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      .ifake-export-capture [data-export-key-cap] .ifake-export-text {
        position: relative;
        top: var(--ifake-export-key-nudge);
      }
      .ifake-export-capture [data-export-key-callout-label] {
        transform: translateY(var(--ifake-export-key-callout-nudge)) !important;
      }
      .ifake-export-capture [data-keyboard-editor-icon] {
        visibility: hidden !important;
      }
    `;
    doc.head.appendChild(style);
  }

  applyScrollOffsetInClone(root, scrollTop);
}

let cachedForeignObjectRendering: boolean | null = null;

function reportExportProgress(
  frame: number,
  totalFrames: number,
  onProgress: ExportVideoOptions["onProgress"],
  label = "Export"
): void {
  const progress = Math.round(((frame + 1) / totalFrames) * 100);
  onProgress?.(`${label}… ${progress}%`);
}

function isBlankSnapshot(canvas: HTMLCanvasElement): boolean {
  const probe = document.createElement("canvas");
  probe.width = 8;
  probe.height = 8;
  const probeCtx = probe.getContext("2d");
  if (!probeCtx) return false;

  probeCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, 8, 8);
  const { data } = probeCtx.getImageData(0, 0, 8, 8);

  for (let i = 0; i < data.length; i += 4) {
    if (data[i] > 8 || data[i + 1] > 8 || data[i + 2] > 8) {
      return false;
    }
  }

  return true;
}

async function renderSnapshot(
  element: HTMLElement,
  foreignObjectRendering: boolean,
  scrollTop: number
): Promise<HTMLCanvasElement> {
  return html2canvas(element, {
    scale: EXPORT_CAPTURE_SCALE,
    useCORS: true,
    backgroundColor: "#000000",
    logging: false,
    foreignObjectRendering,
    width: element.offsetWidth,
    height: element.offsetHeight,
    scrollX: 0,
    scrollY: 0,
    windowWidth: element.offsetWidth,
    windowHeight: element.offsetHeight,
    imageTimeout: 0,
    onclone: (doc, cloned) => {
      stabilizeClone(cloned as HTMLElement, doc, scrollTop);
    },
  });
}

async function captureFrame(
  element: HTMLElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): Promise<void> {
  const scrollTop = scrollConversationToBottom(element);
  const preferForeignObject = cachedForeignObjectRendering ?? false;

  let snapshot = await renderSnapshot(element, preferForeignObject, scrollTop);

  if (cachedForeignObjectRendering === null) {
    if (isBlankSnapshot(snapshot) && preferForeignObject) {
      cachedForeignObjectRendering = false;
      snapshot = await renderSnapshot(element, false, scrollTop);
    } else {
      cachedForeignObjectRendering = preferForeignObject;
    }
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);

  const scale = Math.min(
    EXPORT_WIDTH / snapshot.width,
    EXPORT_HEIGHT / snapshot.height
  );
  const w = snapshot.width * scale;
  const h = snapshot.height * scale;
  const x = (EXPORT_WIDTH - w) / 2;
  const y = (EXPORT_HEIGHT - h) / 2;

  ctx.drawImage(snapshot, x, y, w, h);
}

async function syncVisualFrame(
  state: AnimationState,
  signature: string,
  lastSignature: { current: string },
  captureTarget: HTMLElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  onFrameUpdate: ExportVideoOptions["onFrameUpdate"]
): Promise<void> {
  if (signature === lastSignature.current) return;

  await onFrameUpdate?.(state);
  await waitForPaint();
  await captureFrame(captureTarget, canvas, ctx);
  lastSignature.current = signature;
}

async function resolveH264Codec(
  width: number,
  height: number
): Promise<string | null> {
  if (typeof VideoEncoder === "undefined") return null;

  for (const codec of H264_CODEC_CANDIDATES) {
    const result = await VideoEncoder.isConfigSupported({
      codec,
      width,
      height,
      bitrate: EXPORT_BITRATE,
      framerate: EXPORT_FPS,
    });
    if (result.supported) return codec;
  }

  return null;
}

async function exportWithWebCodecs(
  captureTarget: HTMLElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  totalFrames: number,
  frameDurationUs: number,
  keyframes: ReturnType<typeof buildAnimationTimeline>["keyframes"],
  durationMs: number,
  rate: number,
  onProgress: ExportVideoOptions["onProgress"],
  onFrameUpdate: ExportVideoOptions["onFrameUpdate"]
): Promise<Blob> {
  const codec = await resolveH264Codec(EXPORT_WIDTH, EXPORT_HEIGHT);
  if (!codec) {
    throw new Error("WebCodecs H.264 indisponible");
  }

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: {
      codec: "avc",
      width: EXPORT_WIDTH,
      height: EXPORT_HEIGHT,
    },
    fastStart: "in-memory",
  });

  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (error) => {
      throw error;
    },
  });

  encoder.configure({
    codec,
    width: EXPORT_WIDTH,
    height: EXPORT_HEIGHT,
    bitrate: EXPORT_BITRATE,
    framerate: EXPORT_FPS,
  });

  const frameIntervalMs = 1000 / EXPORT_FPS;
  const lastSignature = { current: "" };
  let lastReportedProgress = -1;

  for (let frame = 0; frame < totalFrames; frame++) {
    const wallMs = frame * frameIntervalMs;
    const animMs = Math.min(wallMs * rate, durationMs);
    const state = getStateAtTime(keyframes, animMs);
    const signature = getCaptureSignature(state);

    await syncVisualFrame(
      state,
      signature,
      lastSignature,
      captureTarget,
      canvas,
      ctx,
      onFrameUpdate
    );

    const videoFrame = new VideoFrame(canvas, {
      timestamp: Math.round(frame * frameDurationUs),
      duration: frameDurationUs,
    });

    encoder.encode(videoFrame, { keyFrame: frame % EXPORT_FPS === 0 });
    videoFrame.close();

    const progress = Math.round(((frame + 1) / totalFrames) * 100);
    if (
      frame === 0 ||
      frame === totalFrames - 1 ||
      progress !== lastReportedProgress
    ) {
      reportExportProgress(frame, totalFrames, onProgress);
      lastReportedProgress = progress;
    }
  }

  await encoder.flush();
  encoder.close();
  muxer.finalize();

  const buffer = muxer.target.buffer;
  return new Blob([buffer], { type: "video/mp4" });
}

function getWebmMimeType(): string | null {
  const types = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return null;
}

async function exportWithMediaRecorder(
  captureTarget: HTMLElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  totalFrames: number,
  keyframes: ReturnType<typeof buildAnimationTimeline>["keyframes"],
  durationMs: number,
  rate: number,
  onProgress: ExportVideoOptions["onProgress"],
  onFrameUpdate: ExportVideoOptions["onFrameUpdate"]
): Promise<Blob> {
  const mimeType = getWebmMimeType();
  if (!mimeType) {
    throw new Error("Votre navigateur ne supporte pas l'export vidéo.");
  }

  const stream = canvas.captureStream(0);
  const track = stream.getVideoTracks()[0] as MediaStreamTrack & {
    requestFrame?: () => void;
  };

  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: EXPORT_BITRATE,
  });

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const recorded = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
    recorder.onerror = () => reject(new Error("Erreur MediaRecorder"));
  });

  recorder.start(250);
  const frameIntervalMs = 1000 / EXPORT_FPS;
  const lastSignature = { current: "" };
  let lastReportedProgress = -1;

  for (let frame = 0; frame < totalFrames; frame++) {
    const wallMs = frame * frameIntervalMs;
    const animMs = Math.min(wallMs * rate, durationMs);
    const state = getStateAtTime(keyframes, animMs);
    const signature = getCaptureSignature(state);

    await syncVisualFrame(
      state,
      signature,
      lastSignature,
      captureTarget,
      canvas,
      ctx,
      onFrameUpdate
    );
    track.requestFrame?.();

    const progress = Math.round(((frame + 1) / totalFrames) * 100);
    if (
      frame === 0 ||
      frame === totalFrames - 1 ||
      progress !== lastReportedProgress
    ) {
      reportExportProgress(frame, totalFrames, onProgress, "Export WebM");
      lastReportedProgress = progress;
    }
  }

  recorder.stop();
  return recorded;
}

export async function exportConversationVideo(
  previewElement: HTMLElement,
  messages: Message[],
  settings: ConversationSettings,
  options: ExportVideoOptions = {}
): Promise<{ blob: Blob; extension: string }> {
  const { playbackRate = 1, onProgress, onFrameUpdate } = options;
  const rate = Math.max(playbackRate, 0.1);

  const captureTarget =
    previewElement.querySelector<HTMLElement>('[data-export-target="true"]') ??
    previewElement;

  const canvas = document.createElement("canvas");
  canvas.width = EXPORT_WIDTH;
  canvas.height = EXPORT_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Impossible de préparer le canvas d'export.");
  }

  const { keyframes, durationMs } = buildAnimationTimeline(messages, settings);
  const wallDurationMs = durationMs / rate;
  const totalFrames = Math.max(
    1,
    Math.ceil((wallDurationMs / 1000) * EXPORT_FPS)
  );
  const frameDurationUs = Math.round(1_000_000 / EXPORT_FPS);

  cachedForeignObjectRendering = null;
  onProgress?.("Préparation…");
  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready;
  }

  await onFrameUpdate?.({
    ...DEFAULT_ANIMATION_STATE,
    ...getStateAtTime(keyframes, 0),
    isPlaying: true,
  });
  await waitForPaint();
  await sleep(250);

  try {
    onProgress?.("Encodage MP4…");
    const mp4Blob = await exportWithWebCodecs(
      captureTarget,
      canvas,
      ctx,
      totalFrames,
      frameDurationUs,
      keyframes,
      durationMs,
      rate,
      onProgress,
      onFrameUpdate
    );

    onProgress?.("Export terminé");
    return { blob: mp4Blob, extension: "mp4" };
  } catch {
    onProgress?.("MP4 indisponible — export WebM…");
    const webmBlob = await exportWithMediaRecorder(
      captureTarget,
      canvas,
      ctx,
      totalFrames,
      keyframes,
      durationMs,
      rate,
      onProgress,
      onFrameUpdate
    );

    onProgress?.("Export terminé (WebM — ouvrir avec VLC ou convertir en MP4)");
    return { blob: webmBlob, extension: "webm" };
  }
}

export async function shareOrDownloadVideo(
  blob: Blob,
  filename: string
): Promise<"shared" | "downloaded"> {
  const file = new File([blob], filename, { type: blob.type });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: "iFake conversation" });
    return "shared";
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return "downloaded";
}

export const EXPORT_PREVIEW_WIDTH = IMESSAGE.screenWidth;
export const EXPORT_PREVIEW_HEIGHT = IMESSAGE.screenHeight;
