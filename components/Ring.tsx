/* Progress ring (ported from ui.jsx). */
import React from "react";

export function Ring({
  value,
  size = 92,
  sw = 10,
  color = "var(--primary)",
  track = "var(--line)",
  children,
}: {
  value: number;
  size?: number;
  sw?: number;
  color?: string;
  track?: string;
  children?: React.ReactNode;
}) {
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={sw} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          style={{ transition: "stroke-dashoffset .8s cubic-bezier(.2,.7,.2,1)" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}
