"use client";

import { useEditorStore } from "@/lib/store";
import { isSupabaseConfigured, uploadImage } from "@/lib/supabase/client";

export function ContactSettings() {
  const settings = useEditorStore((s) => s.settings);
  const setSettings = useEditorStore((s) => s.setSettings);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isSupabaseConfigured) {
      try {
        const url = await uploadImage(file);
        setSettings({ contactPhotoUrl: url });
        return;
      } catch {
        // fallback
      }
    }

    setSettings({ contactPhotoUrl: URL.createObjectURL(file) });
  };

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
        Contact
      </h3>

      <div>
        <label className="block text-xs text-white/50 mb-1">Nom</label>
        <input
          value={settings.contactName}
          onChange={(e) => setSettings({ contactName: e.target.value })}
          className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white"
        />
      </div>

      <div>
        <label className="block text-xs text-white/50 mb-1">
          Photo de profil (optionnel)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="text-sm text-white/60 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-accent file:text-white file:text-sm"
        />
        {settings.contactPhotoUrl && (
          <button
            type="button"
            onClick={() => setSettings({ contactPhotoUrl: undefined })}
            className="mt-1 text-xs text-red-400"
          >
            Retirer la photo
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-white/60">Mode iMessage sombre</span>
        <button
          type="button"
          onClick={() =>
            setSettings({ imessageDarkMode: !settings.imessageDarkMode })
          }
          className={`w-11 h-6 rounded-full transition ${
            settings.imessageDarkMode ? "bg-accent" : "bg-white/20"
          }`}
        >
          <span
            className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
              settings.imessageDarkMode ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-white/60">Barre de statut iPhone</span>
        <button
          type="button"
          onClick={() =>
            setSettings({ showStatusBar: !settings.showStatusBar })
          }
          className={`w-11 h-6 rounded-full transition ${
            settings.showStatusBar ? "bg-accent" : "bg-white/20"
          }`}
        >
          <span
            className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
              settings.showStatusBar ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {settings.showStatusBar && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Heure automatique</span>
            <button
              type="button"
              onClick={() =>
                setSettings({ statusBarLiveTime: !settings.statusBarLiveTime })
              }
              className={`w-11 h-6 rounded-full transition ${
                settings.statusBarLiveTime ? "bg-accent" : "bg-white/20"
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  settings.statusBarLiveTime ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {!settings.statusBarLiveTime && (
            <div>
              <label className="block text-xs text-white/50 mb-1">
                Heure manuelle
              </label>
              <input
                value={settings.statusBarTime}
                onChange={(e) =>
                  setSettings({ statusBarTime: e.target.value })
                }
                className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white"
                placeholder="00:08"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Batterie automatique</span>
            <button
              type="button"
              onClick={() =>
                setSettings({
                  statusBarBatteryAuto: !settings.statusBarBatteryAuto,
                })
              }
              className={`w-11 h-6 rounded-full transition ${
                settings.statusBarBatteryAuto ? "bg-accent" : "bg-white/20"
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  settings.statusBarBatteryAuto
                    ? "translate-x-5"
                    : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {!settings.statusBarBatteryAuto && (
            <div>
              <label className="block text-xs text-white/50 mb-1">
                Niveau batterie (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={settings.statusBarBatteryLevel}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (!Number.isFinite(value)) return;
                  setSettings({
                    statusBarBatteryLevel: Math.max(0, Math.min(100, value)),
                  });
                }}
                className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white"
                placeholder="75"
              />
            </div>
          )}
        </>
      )}
    </section>
  );
}
