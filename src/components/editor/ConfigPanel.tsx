"use client";

import { useEditorStore } from "@/lib/store";
import { ContactSettings } from "./ContactSettings";
import { ConversationImport } from "./ConversationImport";
import { MessageConfigItem } from "./MessageConfigItem";
import { TemplateManager } from "./TemplateManager";

export function ConfigPanel() {
  const settings = useEditorStore((s) => s.settings);
  const messages = useEditorStore((s) => s.messages);
  const setSettings = useEditorStore((s) => s.setSettings);
  const addMessage = useEditorStore((s) => s.addMessage);
  const clearAll = useEditorStore((s) => s.clearAll);

  const handleClearAll = () => {
    if (
      !confirm(
        "Tout effacer ? La conversation, les messages et l'import seront supprimés."
      )
    ) {
      return;
    }
    clearAll();
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between gap-3 pb-1 border-b border-white/10">
        <span className="text-xs text-white/40 uppercase tracking-wide">
          Brouillon
        </span>
        <button
          type="button"
          onClick={handleClearAll}
          className="px-3 py-1.5 text-xs rounded-md bg-red-500/15 text-red-400 hover:bg-red-500/25 font-medium"
        >
          Clear all
        </button>
      </div>

      <ContactSettings />

      <ConversationImport />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
            Messages
          </h3>
          <button
            type="button"
            onClick={addMessage}
            className="px-3 py-1 text-sm rounded-md bg-accent text-white font-medium"
          >
            + Ajouter
          </button>
        </div>
        <div className="space-y-3">
          {messages.map((msg, i) => (
            <MessageConfigItem
              key={msg.id}
              message={msg}
              index={i}
              total={messages.length}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
          Distribué / Lu
        </h3>
        <label className="flex items-center gap-2 text-sm text-white/60">
          <input
            type="checkbox"
            checked={settings.showReadReceipt}
            onChange={(e) =>
              setSettings({ showReadReceipt: e.target.checked })
            }
            className="accent-accent"
          />
          Afficher sous le dernier message envoyé
        </label>
        {settings.showReadReceipt && (
          <div className="flex gap-2">
            {(["delivered", "read"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSettings({ readReceiptType: type })}
                className={`flex-1 py-1.5 text-sm rounded-md ${
                  settings.readReceiptType === type
                    ? "bg-accent/30 text-accent"
                    : "bg-white/5 text-white/50"
                }`}
              >
                {type === "delivered" ? "Distribué" : "Lu"}
              </button>
            ))}
          </div>
        )}
        {settings.showReadReceipt && settings.readReceiptType === "read" && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-white/60">
              <input
                type="checkbox"
                checked={settings.readReceiptIsToday}
                onChange={(e) =>
                  setSettings({ readReceiptIsToday: e.target.checked })
                }
                className="accent-accent"
              />
              Lu aujourd&apos;hui (afficher l&apos;heure seule)
            </label>
            {settings.readReceiptIsToday ? (
              <input
                value={settings.readReceiptTime}
                onChange={(e) =>
                  setSettings({ readReceiptTime: e.target.value })
                }
                className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white"
                placeholder="14:32"
              />
            ) : (
              <input
                value={settings.readReceiptDate}
                onChange={(e) =>
                  setSettings({ readReceiptDate: e.target.value })
                }
                className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white"
                placeholder="05/05/2026"
              />
            )}
          </div>
        )}
      </section>

      <TemplateManager />
    </div>
  );
}
