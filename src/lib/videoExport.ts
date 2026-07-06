import html2canvas from "html2canvas";
import { playConversationAnimation } from "./animationEngine";
import { createAudioDestination, scheduleSound } from "./audioManager";
import { Message, ConversationSettings, AnimationState } from "./types";
import { sleep } from "./utils";

export const EXPORT_WIDTH = 1080;
export const EXPORT_HEIGHT = 1920;
export const EXPORT_FPS = 30;

function getSupportedMimeType(): string {
  const types = [
    "video/mp4",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "video/webm";
}

function getExtension(mimeType: string): string {
  return mimeType.includes("mp4") ? "mp4" : "webm";
}

async function captureFrame(
  element: HTMLElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): Promise<void> {
  const snapshot = await html2canvas(element, {
    scale: 1,
    useCORS: true,
    backgroundColor: null,
    logging: false,
    width: element.offsetWidth,
    height: element.offsetHeight,
  });

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

export async function exportConversationVideo(
  previewElement: HTMLElement,
  messages: Message[],
  settings: ConversationSettings,
  onProgress?: (status: string) => void,
  onFrameUpdate?: (
    partial: Partial<AnimationState>
  ) => void | Promise<void>
): Promise<{ blob: Blob; extension: string }> {
  const canvas = document.createElement("canvas");
  canvas.width = EXPORT_WIDTH;
  canvas.height = EXPORT_HEIGHT;
  const ctx = canvas.getContext("2d")!;

  const mimeType = getSupportedMimeType();
  const { context: audioCtx, destination: audioDest } =
    await createAudioDestination();

  const canvasStream = canvas.captureStream(EXPORT_FPS);
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...audioDest.stream.getAudioTracks(),
  ]);

  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: 8_000_000,
  });

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const recorded = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
  });

  let capturing = true;

  const frameLoop = async () => {
    while (capturing) {
      await captureFrame(previewElement, canvas, ctx);
      const elapsed = performance.now();
      await sleep(Math.max(0, 1000 / EXPORT_FPS - (performance.now() - elapsed)));
    }
  };

  onProgress?.("Préparation de l'enregistrement…");
  onFrameUpdate?.({
    visibleMessageIds: [],
    isTyping: false,
    typingSender: null,
    activeTimestamps: {},
    showReadReceipt: false,
    isPlaying: true,
    isComplete: false,
  });

  await sleep(200);
  await captureFrame(previewElement, canvas, ctx);

  recorder.start(100);
  const framePromise = frameLoop();

  onProgress?.("Enregistrement de l'animation…");

  await playConversationAnimation(messages, settings, {
    onUpdate: async (partial) => {
      await onFrameUpdate?.(partial);
      await sleep(50);
    },
    onSound: (type) => {
      scheduleSound(audioCtx, audioDest, type, audioCtx.currentTime);
    },
  });

  await sleep(800);
  capturing = false;
  recorder.stop();
  await framePromise;

  const blob = await recorded;
  onProgress?.("Export terminé");

  return { blob, extension: getExtension(mimeType) };
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
