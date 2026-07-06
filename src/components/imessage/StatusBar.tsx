"use client";

interface StatusBarProps {
  time: string;
  darkMode: boolean;
}

export function StatusBar({ time, darkMode }: StatusBarProps) {
  const textColor = darkMode ? "#FFFFFF" : "#000000";

  return (
    <div
      className="flex items-center justify-between px-6 pt-[14px] pb-1"
      style={{ color: textColor }}
    >
      <span className="text-[15px] font-semibold w-[54px]">{time}</span>

      <div className="flex-1 flex justify-center">
        <div
          className="rounded-full"
          style={{
            width: 126,
            height: 34,
            backgroundColor: darkMode ? "#1C1C1E" : "#000",
            borderRadius: 20,
          }}
        />
      </div>

      <div className="flex items-center gap-[5px] w-[54px] justify-end">
        {/* Signal */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill={textColor}>
          <rect x="0" y="8" width="3" height="4" rx="0.5" />
          <rect x="4" y="5" width="3" height="7" rx="0.5" />
          <rect x="8" y="2" width="3" height="10" rx="0.5" />
          <rect x="12" y="0" width="3" height="12" rx="0.5" />
        </svg>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill={textColor}>
          <path d="M8 9.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
          <path
            d="M8 6.5c1.5 0 2.9.6 3.9 1.6l1.1-1.1C11.5 5.4 9.8 4.7 8 4.7s-3.5.7-4.9 2.3l1.1 1.1c1-1 2.4-1.6 3.8-1.6z"
            fillOpacity="0.9"
          />
          <path
            d="M8 3.5c2.5 0 4.8 1 6.5 2.7l1.1-1.1C13.5 2.4 10.9 1.3 8 1.3S2.5 2.4 1.4 4.1l1.1 1.1C4.2 4.5 6.1 3.5 8 3.5z"
            fillOpacity="0.7"
          />
        </svg>
        {/* Battery */}
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
          <rect
            x="0.5"
            y="0.5"
            width="22"
            height="12"
            rx="3"
            stroke={textColor}
            strokeWidth="1"
          />
          <rect x="2" y="2" width="17" height="9" rx="1.5" fill={textColor} />
          <path
            d="M24 4.5v4a1.5 1.5 0 000-4z"
            fill={textColor}
            fillOpacity="0.4"
          />
        </svg>
      </div>
    </div>
  );
}
