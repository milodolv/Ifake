"use client";

import { Message } from "@/lib/types";
import { useEditorStore } from "@/lib/store";
import { calculateAutoDelay, formatAutoDelayFormula } from "@/lib/autoDelay";
import { getContactTypingDurationMs } from "@/lib/keyboardTyping";
import { isSupabaseConfigured, uploadImage } from "@/lib/supabase/client";
import { readFileAsDataUrl } from "@/lib/utils";
import { VideoPlayOverlay } from "@/components/imessage/VideoPlayOverlay";

interface MessageConfigItemProps {
  message: Message;
  index: number;
  total: number;
}

export function MessageConfigItem({
  message,
  index,
  total,
}: MessageConfigItemProps) {
  const updateMessage = useEditorStore((s) => s.updateMessage);
  const removeMessage = useEditorStore((s) => s.removeMessage);
  const duplicateMessage = useEditorStore((s) => s.duplicateMessage);
  const moveMessage = useEditorStore((s) => s.moveMessage);
  const messages = useEditorStore((s) => s.messages);

  const previousContent =
    index > 0 ? messages[index - 1]?.content ?? "" : message.content;
  const autoDelayPreviewMs = calculateAutoDelay(previousContent);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isSupabaseConfigured) {
      try {
        const url = await uploadImage(file);
        updateMessage(message.id, {
          imageUrl: url,
          content: "",
          showVideoOverlay: true,
        });
        return;
      } catch {
        // fallback local
      }
    }

    const url = await readFileAsDataUrl(file);
    updateMessage(message.id, { imageUrl: url, content: "", showVideoOverlay: true });
  };

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white/70">
          Message {index + 1}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => moveMessage(message.id, "up")}
            disabled={index === 0}
            className="px-2 py-1 text-xs rounded bg-white/10 text-white/70 disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => moveMessage(message.id, "down")}
            disabled={index === total - 1}
            className="px-2 py-1 text-xs rounded bg-white/10 text-white/70 disabled:opacity-30"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => duplicateMessage(message.id)}
            className="px-2 py-1 text-xs rounded bg-white/10 text-white/70"
          >
            Dupliquer
          </button>
          <button
            type="button"
            onClick={() => removeMessage(message.id)}
            className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-400"
          >
            Suppr.
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {(["contact", "me"] as const).map((sender) => (
          <button
            key={sender}
            type="button"
            onClick={() =>
              updateMessage(message.id, {
                sender,
                ...(sender === "me"
                  ? { showKeyboardTyping: true, showTyping: false }
                  : { showTyping: true, showKeyboardTyping: false }),
              })
            }
            className={`flex-1 py-1.5 text-sm rounded-md transition ${
              message.sender === sender
                ? sender === "me"
                  ? "bg-accent text-white"
                  : "bg-white/20 text-white"
                : "bg-white/5 text-white/50"
            }`}
          >
            {sender === "me" ? "Moi" : "Contact"}
          </button>
        ))}
      </div>

      {!message.imageUrl ? (
        <textarea
          value={message.content}
          onChange={(e) =>
            updateMessage(message.id, { content: e.target.value })
          }
          placeholder="Texte du message…"
          rows={2}
          className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 resize-none"
        />
      ) : (
        <div className="relative inline-block overflow-hidden rounded-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={message.imageUrl}
            alt=""
            className="block max-h-24 object-cover"
          />
          {message.showVideoOverlay !== false ? (
            <VideoPlayOverlay size={32} />
          ) : null}
          <button
            type="button"
            onClick={() => updateMessage(message.id, { imageUrl: undefined })}
            className="absolute top-1 right-1 px-2 py-0.5 text-xs bg-black/60 rounded text-white"
          >
            Retirer
          </button>
        </div>
      )}

      <label className="block text-xs text-white/50 cursor-pointer hover:text-white/70">
        + Image
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </label>

      {message.imageUrl && (
        <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
          <input
            type="checkbox"
            checked={message.showVideoOverlay !== false}
            onChange={(e) =>
              updateMessage(message.id, { showVideoOverlay: e.target.checked })
            }
            className="accent-accent"
          />
          Afficher la pastille vidéo
        </label>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-white/60">Délai avant message</span>
          <div className="flex gap-1">
            {(["auto", "manual"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => updateMessage(message.id, { delayMode: mode })}
                className={`px-2 py-0.5 text-xs rounded ${
                  message.delayMode === mode
                    ? "bg-accent/30 text-accent"
                    : "bg-white/5 text-white/50"
                }`}
              >
                {mode === "auto" ? "Auto" : "Manuel"}
              </button>
            ))}
          </div>
        </div>
        {message.delayMode === "auto" ? (
          <p className="text-xs text-white/40">
            {index === 0
              ? "Premier message — pas de délai avant affichage"
              : `~${autoDelayPreviewMs} ms (${formatAutoDelayFormula()}, msg. précédent)`}
          </p>
        ) : (
          <input
            type="number"
            value={message.delayMs}
            onChange={(e) =>
              updateMessage(message.id, {
                delayMs: parseInt(e.target.value) || 0,
              })
            }
            className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-white text-sm"
            placeholder="ms"
          />
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-white/60">
        <input
          type="checkbox"
          checked={message.showTyping}
          onChange={(e) =>
            updateMessage(message.id, { showTyping: e.target.checked })
          }
          className="accent-accent"
        />
        Indicateur de frappe
        {message.sender === "me" && (
          <span className="text-white/30 text-xs">(Contact uniquement)</span>
        )}
      </label>
      {message.showTyping && message.sender === "contact" && (
        <>
          {!message.imageUrl && message.content.length > 0 ? (
            <p className="text-xs text-white/40">
              Durée auto :{" "}
              {(getContactTypingDurationMs(message) / 1000)
                .toFixed(1)
                .replace(".", ",")}
              s (même rythme que le clavier)
            </p>
          ) : (
            <input
              type="number"
              value={message.typingDurationMs}
              onChange={(e) =>
                updateMessage(message.id, {
                  typingDurationMs: parseInt(e.target.value) || 0,
                })
              }
              className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-white text-sm"
              placeholder="Durée frappe (ms)"
            />
          )}
          {!message.imageUrl && message.content.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Vitesse de frappe</span>
              <div className="flex gap-1">
                {(["slow", "normal", "fast"] as const).map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() =>
                      updateMessage(message.id, { typingSpeed: speed })
                    }
                    className={`px-2 py-0.5 text-xs rounded ${
                      (message.typingSpeed ?? "normal") === speed
                        ? "bg-accent/30 text-accent"
                        : "bg-white/5 text-white/50"
                    }`}
                  >
                    {speed === "slow"
                      ? "Lent"
                      : speed === "normal"
                        ? "Normal"
                        : "Rapide"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {message.sender === "me" && !message.imageUrl && (
        <>
          <label className="flex items-center gap-2 text-sm text-white/60">
            <input
              type="checkbox"
              checked={message.showKeyboardTyping ?? true}
              onChange={(e) =>
                updateMessage(message.id, {
                  showKeyboardTyping: e.target.checked,
                })
              }
              className="accent-accent"
            />
            Animation de frappe clavier
          </label>
          {(message.showKeyboardTyping ?? true) && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Vitesse de frappe</span>
              <div className="flex gap-1">
                {(["slow", "normal", "fast"] as const).map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() =>
                      updateMessage(message.id, { typingSpeed: speed })
                    }
                    className={`px-2 py-0.5 text-xs rounded ${
                      (message.typingSpeed ?? "normal") === speed
                        ? "bg-accent/30 text-accent"
                        : "bg-white/5 text-white/50"
                    }`}
                  >
                    {speed === "slow"
                      ? "Lent"
                      : speed === "normal"
                        ? "Normal"
                        : "Rapide"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <label className="flex items-center gap-2 text-sm text-white/60">
        <input
          type="checkbox"
          checked={message.showTimestamp}
          onChange={(e) =>
            updateMessage(message.id, { showTimestamp: e.target.checked })
          }
          className="accent-accent"
        />
        Timestamp avant message
      </label>
      {message.showTimestamp && (
        <div className="space-y-2">
          <div className="flex gap-1">
            {(["auto", "manual"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() =>
                  updateMessage(message.id, { timestampMode: mode })
                }
                className={`px-2 py-0.5 text-xs rounded ${
                  message.timestampMode === mode
                    ? "bg-accent/30 text-accent"
                    : "bg-white/5 text-white/50"
                }`}
              >
                {mode === "auto" ? "Auto" : "Manuel"}
              </button>
            ))}
          </div>
          {message.timestampMode === "manual" && (
            <input
              value={message.timestampText}
              onChange={(e) =>
                updateMessage(message.id, { timestampText: e.target.value })
              }
              className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-white text-sm"
              placeholder="Aujourd'hui 14:32"
            />
          )}
        </div>
      )}
    </div>
  );
}
