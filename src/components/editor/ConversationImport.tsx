"use client";

import { useState } from "react";
import { useEditorStore } from "@/lib/store";
import { parseConversationImport } from "@/lib/parseConversationImport";
import { isSupabaseConfigured, uploadImage } from "@/lib/supabase/client";
import { VideoPlayOverlay } from "@/components/imessage/VideoPlayOverlay";
import { readFileAsDataUrl } from "@/lib/utils";

const PLACEHOLDER = `Contact : Salut ! Comment ça va ?
Moi : Très bien merci, et toi ?
Moi : (image)
Contact : Super photo !
Moi : Merci !`;

export function ConversationImport() {
  const importMessages = useEditorStore((s) => s.importMessages);
  const importDraft = useEditorStore((s) => s.importDraft);
  const setImportDraft = useEditorStore((s) => s.setImportDraft);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setError(null);
    setSuccess(null);

    if (isSupabaseConfigured) {
      try {
        const url = await uploadImage(file);
        setImportDraft({ importedImageUrl: url });
        return;
      } catch {
        // fallback local
      }
    }

    try {
      const url = await readFileAsDataUrl(file);
      setImportDraft({ importedImageUrl: url });
    } catch {
      setError("Impossible de lire l'image.");
    }
  };

  const handleGenerate = () => {
    setError(null);
    setSuccess(null);

    const parsed = parseConversationImport(importDraft.importText);
    if (parsed.length === 0) {
      setError(
        "Aucun message détecté. Chaque message doit commencer par « Contact : » ou « Moi : »."
      );
      return;
    }

    const imageSlots = parsed.filter((entry) => entry.isImage);
    if (importDraft.importedImageUrl && imageSlots.length === 0) {
      setError(
        'Ajoutez une ligne « Moi : (image) » dans le texte pour placer l\'image importée.'
      );
      return;
    }
    if (imageSlots.length > 0 && !importDraft.importedImageUrl) {
      setError(
        "Importez une image pour les lignes « Moi : (image) » avant de générer les messages."
      );
      return;
    }

    importMessages(
      parsed.map((entry) => ({
        sender: entry.sender,
        content: entry.isImage ? "" : entry.content,
        imageUrl: entry.isImage ? importDraft.importedImageUrl : undefined,
        showVideoOverlay: entry.isImage ? importDraft.showVideoOverlay : undefined,
      }))
    );

    const imageNote =
      imageSlots.length > 0
        ? ` (${imageSlots.length} image${imageSlots.length > 1 ? "s" : ""})`
        : "";

    setSuccess(
      `${parsed.length} message${parsed.length > 1 ? "s" : ""} généré${parsed.length > 1 ? "s" : ""}${imageNote}.`
    );
  };

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
        Importer une conversation
      </h3>

      <p className="text-xs text-white/45 leading-relaxed">
        Collez votre discussion ici. Chaque message doit commencer par{" "}
        <span className="text-white/60">Contact :</span> ou{" "}
        <span className="text-white/60">Moi :</span> suivi du texte. Pour
        insérer l&apos;image importée ci-dessous, écrivez{" "}
        <span className="text-white/60">Moi : (image)</span> à l&apos;endroit
        voulu.
      </p>

      <textarea
        value={importDraft.importText}
        onChange={(e) => {
          setImportDraft({ importText: e.target.value });
          setError(null);
          setSuccess(null);
        }}
        rows={8}
        placeholder={PLACEHOLDER}
        className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/25 resize-y min-h-[140px]"
      />

      <div className="space-y-2">
        <span className="block text-xs text-white/50">Importer une image</span>
        <label className="block text-sm text-white/60 cursor-pointer hover:text-white/80">
          <span className="inline-block px-3 py-1.5 rounded-md bg-white/5 border border-white/10">
            Choisir une image
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
        {importDraft.importedImageUrl && (
          <>
            <div className="relative inline-block overflow-hidden rounded-md border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={importDraft.importedImageUrl}
                alt=""
                className="block max-h-24 object-cover"
              />
              {importDraft.showVideoOverlay ? (
                <VideoPlayOverlay size={32} />
              ) : null}
              <button
                type="button"
                onClick={() => setImportDraft({ importedImageUrl: undefined })}
                className="absolute top-1 right-1 px-2 py-0.5 text-xs bg-black/60 rounded text-white"
              >
                Retirer
              </button>
            </div>
            <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
              <input
                type="checkbox"
                checked={importDraft.showVideoOverlay}
                onChange={(e) =>
                  setImportDraft({ showVideoOverlay: e.target.checked })
                }
                className="accent-accent"
              />
              Afficher la pastille vidéo
            </label>
          </>
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
      {success && <p className="text-xs text-emerald-400">{success}</p>}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={!importDraft.importText.trim()}
        className="w-full py-2 text-sm rounded-md bg-accent text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Générer les messages
      </button>
    </section>
  );
}
