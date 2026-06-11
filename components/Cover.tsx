/* Cover placeholder imagery (ported from ui.jsx).
   Layered warm gradient + a seasonal CSS motif. No photos needed. */
import React from "react";
import { covers } from "@/lib/data";

function SunMotif({ a, moon }: { a: string; moon?: boolean }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice">
      <circle cx="232" cy="58" r="40" fill={a} opacity={moon ? 0.55 : 0.85} />
      {moon && <circle cx="218" cy="50" r="40" fill="rgba(0,0,0,.18)" />}
      <path d="M0 168 Q75 138 150 162 T300 150 V200 H0 Z" fill="rgba(0,0,0,.16)" />
      <path d="M0 184 Q90 158 180 178 T300 172 V200 H0 Z" fill="rgba(0,0,0,.22)" />
    </svg>
  );
}

function PetalMotif({ a }: { a: string }) {
  const pts: [number, number][] = [
    [40, 40], [120, 30], [210, 60], [260, 120], [80, 140], [170, 150], [30, 110], [230, 30],
  ];
  return (
    <svg width="100%" height="100%" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice">
      {pts.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${i * 40})`} opacity={0.6}>
          <path d="M0 0 C6 -10 6 -10 0 -18 C-6 -10 -6 -10 0 0Z" fill={a} />
        </g>
      ))}
      <path d="M0 176 Q90 156 180 174 T300 168 V200 H0 Z" fill="rgba(0,0,0,.18)" />
    </svg>
  );
}

function RippleMotif({ a }: { a: string }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice">
      {[30, 55, 80, 105, 130].map((r, i) => (
        <circle key={i} cx="236" cy="150" r={r} fill="none" stroke={a} strokeWidth="2" opacity={0.32 - i * 0.045} />
      ))}
      <circle cx="236" cy="150" r="14" fill={a} opacity="0.7" />
    </svg>
  );
}

function CircleMotif({ a }: { a: string }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice">
      <circle
        cx="150" cy="100" r="62" fill="none" stroke={a} strokeWidth="6" opacity="0.75"
        strokeDasharray="370 30" strokeLinecap="round" transform="rotate(-30 150 100)"
      />
    </svg>
  );
}

export function Cover({
  seed,
  h = 200,
  radius = 0,
  label,
  children,
  dim = 0,
  fill = false,
}: {
  seed: string;
  h?: number;
  radius?: number | string;
  label?: boolean;
  children?: React.ReactNode;
  dim?: number;
  fill?: boolean;
}) {
  const pal = (covers as Record<string, [string, string, string]>)[seed] || ["#8A3233", "#C4583B", "#E8A04A"];
  const [c1, c2, c3] = pal;
  const motifs: Record<string, React.ReactNode> = {
    matsuri: <SunMotif a={c3} />,
    lantern: <SunMotif a={c3} moon />,
    sakura: <PetalMotif a={c3} />,
    night: <SunMotif a={c3} moon />,
    river: <RippleMotif a={c3} />,
    tea: <RippleMotif a={c3} />,
    food: <SunMotif a={c3} />,
    zen: <CircleMotif a={c3} />,
  };
  const motif = motifs[seed] || <SunMotif a={c3} />;
  return (
    <div
      className="cover"
      style={{
        height: fill ? "100%" : h,
        borderRadius: radius,
        background: `radial-gradient(120% 130% at 78% 18%, ${c3} 0%, ${c2} 42%, ${c1} 100%)`,
      }}
    >
      <div className="cover-motif">{motif}</div>
      <div className="cover-grain" />
      {dim > 0 && <div style={{ position: "absolute", inset: 0, background: `rgba(20,12,10,${dim})` }} />}
      {label && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: 0 }} className="scrim" />}
      {children}
    </div>
  );
}
