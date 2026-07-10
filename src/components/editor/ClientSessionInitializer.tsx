"use client";

import { useLayoutEffect, useRef } from "react";
import { useEditorStore } from "@/lib/store";
import { getInitialBatteryLevel } from "@/lib/batterySimulation";
import { formatTime24 } from "@/lib/formatTime24";
import { normalizeMessage } from "@/lib/types";
import { loadEditorDraft, saveEditorDraft } from "@/lib/editorPersistence";

export function ClientSessionInitializer() {
  const hydratedRef = useRef(false);

  useLayoutEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    const draft = loadEditorDraft();
    if (draft) {
      useEditorStore.getState().loadConversation(draft.settings, draft.messages);
      if (draft.importDraft) {
        useEditorStore.getState().setImportDraft(draft.importDraft);
      }
    } else {
      const { messages } = useEditorStore.getState();
      useEditorStore.setState({
        messages: messages.map((message) => normalizeMessage(message)),
      });
    }

    const { settings, setSettings } = useEditorStore.getState();
    if (settings.statusBarBatteryAuto) {
      const timeHint = settings.statusBarLiveTime
        ? formatTime24()
        : settings.statusBarTime;

      setSettings({
        statusBarBatteryLevel: getInitialBatteryLevel(timeHint),
      });
    }
  }, []);

  useLayoutEffect(() => {
    const unsubscribe = useEditorStore.subscribe((state) => {
      saveEditorDraft(state.settings, state.messages, state.importDraft);
    });

    const state = useEditorStore.getState();
    saveEditorDraft(state.settings, state.messages, state.importDraft);

    return unsubscribe;
  }, []);

  return null;
}
