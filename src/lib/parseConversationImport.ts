import type { Sender } from "./types";

export interface ParsedImportMessage {
  sender: Sender;
  content: string;
  isImage?: boolean;
}

const CONTACT_LINE = /^Contact\s*:\s*(.*)$/i;
const ME_LINE = /^Moi\s*:\s*(.*)$/i;
const IMAGE_MARKER = /^\(\s*image\s*\)$/i;

export function isImageImportMarker(content: string): boolean {
  return IMAGE_MARKER.test(content.trim());
}

export function parseConversationImport(text: string): ParsedImportMessage[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const messages: ParsedImportMessage[] = [];
  let current: ParsedImportMessage | null = null;

  const pushCurrent = () => {
    if (!current) return;
    const trimmed = current.content.trim();
    if (isImageImportMarker(trimmed)) {
      messages.push({
        sender: current.sender,
        content: "",
        isImage: true,
      });
    } else if (trimmed.length > 0) {
      messages.push({
        sender: current.sender,
        content: trimmed,
      });
    }
    current = null;
  };

  for (const line of lines) {
    const contactMatch = line.match(CONTACT_LINE);
    const meMatch = line.match(ME_LINE);

    if (contactMatch) {
      pushCurrent();
      current = { sender: "contact", content: contactMatch[1] ?? "" };
      continue;
    }

    if (meMatch) {
      pushCurrent();
      current = { sender: "me", content: meMatch[1] ?? "" };
      continue;
    }

    if (current) {
      current.content = current.content ? `${current.content}\n${line}` : line;
    }
  }

  pushCurrent();

  return messages;
}
