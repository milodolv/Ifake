"use client";

import { useEffect } from "react";
import { useEditorStore } from "@/lib/store";
import { getInitialBatteryLevel } from "@/lib/batterySimulation";
import { formatTime24 } from "@/lib/formatTime24";

let clientSessionInitialized = false;

export function ClientSessionInitializer() {
  useEffect(() => {
    if (clientSessionInitialized) return;
    clientSessionInitialized = true;

    const { settings, setSettings } = useEditorStore.getState();
    if (!settings.statusBarBatteryAuto) return;

    const timeHint = settings.statusBarLiveTime
      ? formatTime24()
      : settings.statusBarTime;

    setSettings({
      statusBarBatteryLevel: getInitialBatteryLevel(timeHint),
    });
  }, []);

  return null;
}
