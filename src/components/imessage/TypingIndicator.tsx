"use client";

interface TypingIndicatorProps {
  darkMode: boolean;
}

export function TypingIndicator({ darkMode }: TypingIndicatorProps) {
  const bg = darkMode ? "#3A3A3C" : "#E9E9EB";

  return (
    <div className="flex justify-start px-3 mb-1">
      <div
        className="flex items-center gap-[5px] px-4 py-3 rounded-[18px]"
        style={{ backgroundColor: bg }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-[7px] h-[7px] rounded-full animate-bounce"
            style={{
              backgroundColor: darkMode ? "#8E8E93" : "#8E8E93",
              animationDelay: `${i * 0.15}s`,
              animationDuration: "0.8s",
            }}
          />
        ))}
      </div>
    </div>
  );
}
