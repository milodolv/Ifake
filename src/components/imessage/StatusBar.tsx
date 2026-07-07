"use client";

interface StatusBarProps {
  time: string;
  darkMode: boolean;
}

export function StatusBar({ time, darkMode }: StatusBarProps) {
  const c = darkMode ? "#FFFFFF" : "#000000";

  return (
    <div
      className="shrink-0 relative flex items-end justify-between"
      style={{
        height: 54,
        paddingLeft: 27,
        paddingRight: 22,
        paddingBottom: 4,
        color: c,
      }}
    >
      <span
        style={{
          fontSize: 16,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        {time}
      </span>

      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          width: 126,
          height: 37,
          borderRadius: 20,
          backgroundColor: darkMode ? "#000000" : "#000000",
          top: 11,
        }}
      />

      <div className="flex items-center" style={{ gap: 6 }}>
        <svg width="18" height="12" viewBox="0 0 18 12" fill={c}>
          <rect x="0" y="8" width="3" height="4" rx="0.5" />
          <rect x="4" y="5" width="3" height="7" rx="0.5" />
          <rect x="8" y="2" width="3" height="10" rx="0.5" />
          <rect x="12" y="0" width="3" height="12" rx="0.5" opacity="0.3" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill={c}>
          <path d="M8 9.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
          <path
            d="M8 6.5c1.5 0 2.9.6 3.9 1.6l1.1-1.1C11.5 5.4 9.8 4.7 8 4.7s-3.5.7-4.9 2.3l1.1 1.1c1-1 2.4-1.6 3.8-1.6z"
            opacity="0.85"
          />
          <path
            d="M8 3.5c2.5 0 4.8 1 6.5 2.7l1.1-1.1C13.5 2.4 10.9 1.3 8 1.3S2.5 2.4 1.4 4.1l1.1 1.1C4.2 4.5 6.1 3.5 8 3.5z"
            opacity="0.55"
          />
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
          <rect
            x="0.5"
            y="0.5"
            width="22"
            height="12"
            rx="2.8"
            stroke={c}
            strokeWidth="1"
          />
          <rect x="2" y="2" width="19" height="9" rx="1.5" fill={c} />
          <path
            d="M24 4.5v4a1.5 1.5 0 000-4z"
            fill={c}
            opacity="0.35"
          />
        </svg>
      </div>
    </div>
  );
}
