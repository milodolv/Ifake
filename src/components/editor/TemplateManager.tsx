"use client";

import { useState } from "react";
import { useEditorStore } from "@/lib/store";
import {
  isSupabaseConfigured,
  saveTemplate,
  fetchTemplates,
  deleteTemplate,
} from "@/lib/supabase/client";
import { Template } from "@/lib/types";

export function TemplateManager() {
  const settings = useEditorStore((s) => s.settings);
  const messages = useEditorStore((s) => s.messages);
  const loadConversation = useEditorStore((s) => s.loadConversation);
  const newConversation = useEditorStore((s) => s.newConversation);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showList, setShowList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    const name = prompt("Nom du template :");
    if (!name) return;

    if (!isSupabaseConfigured) {
      const local: Template = {
        id: crypto.randomUUID(),
        name,
        created_at: new Date().toISOString(),
        data: { settings, messages },
      };
      const stored = JSON.parse(
        localStorage.getItem("ifake_templates") ?? "[]"
      ) as Template[];
      stored.unshift(local);
      localStorage.setItem("ifake_templates", JSON.stringify(stored));
      alert("Template sauvegardé localement");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await saveTemplate(name, { settings, messages });
      alert("Template sauvegardé");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadList = async () => {
    setShowList(true);
    setError("");

    if (!isSupabaseConfigured) {
      const stored = JSON.parse(
        localStorage.getItem("ifake_templates") ?? "[]"
      ) as Template[];
      setTemplates(stored);
      return;
    }

    setLoading(true);
    try {
      const list = await fetchTemplates();
      setTemplates(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = (t: Template) => {
    loadConversation(t.data.settings, t.data.messages);
    setShowList(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce template ?")) return;

    if (!isSupabaseConfigured) {
      const stored = JSON.parse(
        localStorage.getItem("ifake_templates") ?? "[]"
      ) as Template[];
      localStorage.setItem(
        "ifake_templates",
        JSON.stringify(stored.filter((t) => t.id !== id))
      );
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      return;
    }

    await deleteTemplate(id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
        Templates
      </h3>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={newConversation}
          disabled={loading}
          className="flex-1 py-2 text-sm rounded-md bg-white/10 text-white hover:bg-white/15"
        >
          Nouvelle
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="flex-1 py-2 text-sm rounded-md bg-white/10 text-white hover:bg-white/15"
        >
          Sauvegarder
        </button>
        <button
          type="button"
          onClick={handleLoadList}
          disabled={loading}
          className="flex-1 py-2 text-sm rounded-md bg-white/10 text-white hover:bg-white/15"
        >
          Charger
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {!isSupabaseConfigured && (
        <p className="text-xs text-white/40">
          Supabase non configuré — stockage local
        </p>
      )}
      {showList && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {templates.length === 0 && (
            <p className="text-xs text-white/40">Aucun template</p>
          )}
          {templates.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between p-2 rounded bg-white/5 text-sm"
            >
              <button
                type="button"
                onClick={() => handleLoad(t)}
                className="text-left flex-1 text-white hover:text-accent"
              >
                <div>{t.name}</div>
                <div className="text-xs text-white/40">
                  {new Date(t.created_at).toLocaleDateString("fr-FR")}
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(t.id)}
                className="text-xs text-red-400 px-2"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
