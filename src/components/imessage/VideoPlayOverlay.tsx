/** Icône lecture iMessage — cercle gris semi-transparent + triangle noir. */
export function VideoPlayOverlay({ size = 48 }: { size?: number }) {
  const circleSize = Math.round(size * 0.4 + 10);
  const triangleSize = Math.round(size * 0.45);

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: circleSize,
          height: circleSize,
          borderRadius: "50%",
          backgroundColor: "rgba(134, 134, 139, 0.58)",
        }}
      >
        <svg
          width={triangleSize}
          height={triangleSize}
          viewBox="0 0 24 24"
          fill="none"
          style={{ marginLeft: Math.round(triangleSize * 0.04) }}
        >
          <path
            d="M7 5.5v13l11-6.5-11-6.5z"
            fill="#000"
            stroke="#000"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
