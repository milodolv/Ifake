let audioContext: AudioContext | null = null;
const bufferCache: Record<string, AudioBuffer> = {};

async function getContext(): Promise<AudioContext> {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }
  return audioContext;
}

async function loadBuffer(
  ctx: AudioContext,
  path: string
): Promise<AudioBuffer> {
  if (bufferCache[path]) return bufferCache[path];
  const res = await fetch(path);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = await ctx.decodeAudioData(arrayBuffer);
  bufferCache[path] = buffer;
  return buffer;
}

export async function playSound(type: "send" | "receive"): Promise<void> {
  try {
    const ctx = await getContext();
    const path = type === "send" ? "/sounds/send.wav" : "/sounds/receive.wav";
    const buffer = await loadBuffer(ctx, path);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch {
    // Sons optionnels — ignorer si fichiers absents
  }
}

export async function createAudioDestination(): Promise<{
  context: AudioContext;
  destination: MediaStreamAudioDestinationNode;
}> {
  const ctx = await getContext();
  const destination = ctx.createMediaStreamDestination();
  return { context: ctx, destination };
}

export async function scheduleSound(
  ctx: AudioContext,
  destination: MediaStreamAudioDestinationNode,
  type: "send" | "receive",
  when: number
): Promise<void> {
  try {
    const path = type === "send" ? "/sounds/send.wav" : "/sounds/receive.wav";
    const buffer = await loadBuffer(ctx, path);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(destination);
    source.start(when);
  } catch {
    // ignore
  }
}

export function resetAudioContext(): void {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  Object.keys(bufferCache).forEach((k) => delete bufferCache[k]);
}
