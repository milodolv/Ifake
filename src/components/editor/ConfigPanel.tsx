"use client";

import { useEditorStore } from "@/lib/store";
import { ContactSettings } from "./ContactSettings";
import { MessageConfigItem } from "./MessageConfigItem";
import { TemplateManager } from "./TemplateManager";

export function ConfigPanel() {
  const settings = useEditorStore((s) => s.settings);
  const messages = useEditorStore((s) => s.messages);
  const setSettings = useEditorStore((s) => s.setSettings);
  const addMessage = useEditorStore((s) => s.addMessage);

  return (
    <div className="space-y-6 pb-8">
      <ContactSettings />

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
          <input
            value={settings.readReceiptTime}
            onChange={(e) =>
              setSettings({ readReceiptTime: e.target.value })
            }
            className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white"
            placeholder="14:32"
          />
        )}
      </section>

      <TemplateManager />
    </div>
  );
}
