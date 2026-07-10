"use client";

import { useEffect, useState } from "react";
import { formatTime24 } from "@/lib/formatTime24";
import { STATUS_BAR_TIME_FONT, IMESSAGE } from "./theme";
import { CellularbarsIcon, WifiIcon } from "./icons/svgIcons";

interface StatusBarProps {
  time: string;
  darkMode: boolean;
  useLiveTime?: boolean;
  batteryLevel: number;
}

function useLiveTime24(enabled: boolean, fallback: string): string {
  const [liveTime, setLiveTime] = useState(fallback);

  useEffect(() => {
    if (!enabled) {
      setLiveTime(fallback);
      return;
    }

    const update = () => setLiveTime(formatTime24());
    update();

    const now = new Date();
    const msUntilNextMinute =
      (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const timeoutId = setTimeout(() => {
      update();
      intervalId = setInterval(update, 60_000);
    }, msUntilNextMinute);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [enabled, fallback]);

  return liveTime;
}

const TIME_STYLE = {
  fontFamily: STATUS_BAR_TIME_FONT,
  fontSize: 17,
  fontWeight: 800,
  fontVariationSettings: '"wght" 800',
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums" as const,
  fontFeatureSettings: '"tnum"',
  WebkitFontSmoothing: "antialiased" as const,
  display: "inline-flex" as const,
  alignItems: "baseline" as const,
  transform: "scaleY(1.035)",
  transformOrigin: "left bottom",
};

function StatusBarTime({
  time,
  color,
}: {
  time: string;
  color: string;
}) {
  const [hours, minutes] = time.split(":");

  if (minutes === undefined) {
    return (
      <span
        style={{
          ...TIME_STYLE,
          WebkitTextStroke: `0.15px ${color}`,
          paintOrder: "stroke fill",
          letterSpacing: "-0.038em",
          color,
        }}
      >
        {time}
      </span>
    );
  }

  const digitStyle = {
    WebkitTextStroke: `0.15px ${color}`,
    paintOrder: "stroke fill" as const,
    letterSpacing: "-0.038em",
    color,
  };

  return (
    <span style={{ ...TIME_STYLE, color }}>
      <span style={digitStyle}>{hours}</span>
      <span
        aria-hidden
        style={{
          ...digitStyle,
          display: "inline-block",
          transform: "translateY(-1px)",
          letterSpacing: 0,
        }}
      >
        :
      </span>
      <span style={digitStyle}>{minutes}</span>
    </span>
  );
}

const STATUS_ICON_SIZE = 15;
const STATUS_ICON_GAP_CELLULAR_WIFI = 11;
const STATUS_ICON_GAP_WIFI_BATTERY = 8;

function StatusBarBattery({
  level,
  darkMode,
}: {
  level: number;
  darkMode: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(level)));
  const fillColor = darkMode ? "#FFFFFF" : "#000000";
  const outlineColor = darkMode
    ? "rgba(255, 255, 255, 0.35)"
    : "rgba(0, 0, 0, 0.35)";
  const innerX = 2;
  const innerY = 2;
  const innerWidth = 19;
  const innerHeight = 9;
  const fillWidth = Math.max(2.5, (clamped / 100) * innerWidth);
  const height = STATUS_ICON_SIZE;
  const width = 32;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 28 13"
      fill="none"
      aria-hidden
      style={{ display: "block" }}
    >
      <rect
        x="0.5"
        y="0.5"
        width="23"
        height="12"
        rx="3.5"
        stroke={outlineColor}
        strokeWidth="1"
      />
      <rect
        x={innerX}
        y={innerY}
        width={fillWidth}
        height={innerHeight}
        rx="2"
        fill={fillColor}
      />
      <rect
        x="24.5"
        y="4.25"
        width="2"
        height="4.5"
        rx="1"
        fill={outlineColor}
      />
    </svg>
  );
}

export function StatusBar({
  time,
  darkMode,
  useLiveTime = true,
  batteryLevel,
}: StatusBarProps) {
  const liveTime = useLiveTime24(useLiveTime, time);
  const displayTime = useLiveTime ? liveTime : time;
  const c = darkMode ? "#FFFFFF" : "#000000";
  const timePaddingLeft =
    IMESSAGE.headerPaddingLeft +
    (IMESSAGE.headerButtonSize - IMESSAGE.headerBackChevronSize) / 2 +
    IMESSAGE.statusBarTimeNudgeX;

  return (
    <div
      className="relative"
      style={{
        height: 54,
        color: c,
      }}
    >
      <div
        className="flex items-end justify-between h-full"
        style={{
          paddingLeft: timePaddingLeft,
          paddingRight: 22,
          paddingBottom: 0,
          transform: `translateY(-${IMESSAGE.statusBarLift}px)`,
        }}
      >
        <div style={{ transform: `translateY(-${IMESSAGE.statusBarTimeNudgeY}px)` }}>
          <StatusBarTime time={displayTime} color={c} />
        </div>

        <div
          className="flex items-center"
          style={{
            transform: `translateY(-${IMESSAGE.statusBarIconsNudgeY}px) translateX(-${IMESSAGE.statusBarIconsNudgeX}px)`,
          }}
        >
          <CellularbarsIcon height={12} width={17} />
          <div
            style={{ width: STATUS_ICON_GAP_CELLULAR_WIFI, flexShrink: 0 }}
            aria-hidden
          />
          <WifiIcon height={11} width={16} />
          <div
            style={{ width: STATUS_ICON_GAP_WIFI_BATTERY, flexShrink: 0 }}
            aria-hidden
          />
          <StatusBarBattery level={batteryLevel} darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
}
