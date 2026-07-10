/** Première lettre du nom — ignore emojis, chiffres et symboles. */
export function getInitials(name: string): string {
  for (const char of name) {
    if (char.trim() === "") continue;
    const upper = char.toLocaleUpperCase("fr-FR");
    const lower = char.toLocaleLowerCase("fr-FR");
    if (upper !== lower) {
      return upper;
    }
  }
  return "";
}

const AVATAR_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #BF5AF2 0%, #5E5CE6 100%)",
  "linear-gradient(135deg, #FF6482 0%, #FF375F 100%)",
  "linear-gradient(135deg, #64D2FF 0%, #0A84FF 100%)",
  "linear-gradient(135deg, #30D158 0%, #34C759 100%)",
  "linear-gradient(135deg, #FFD60A 0%, #FF9F0A 100%)",
  "linear-gradient(135deg, #AC8E68 0%, #8E7CC3 100%)",
];

export function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

export function formatDate(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `Aujourd'hui ${hours}:${minutes}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
