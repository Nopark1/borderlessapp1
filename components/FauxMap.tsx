/* Stylized static map (ported from public.jsx) — streets + river + pin. */
import { Icon } from "./Icon";
import type { Lang } from "@/lib/types";

export function FauxMap({ lang, h = 150 }: { lang: Lang; h?: number }) {
  return (
    <div style={{ position: "relative", height: h, borderRadius: "var(--radius-sm)", overflow: "hidden", background: "#e9e0cf", border: "1px solid var(--line)" }}>
      <svg width="100%" height="100%" viewBox="0 0 320 150" preserveAspectRatio="xMidYMid slice">
        <rect width="320" height="150" fill="#ece3d2" />
        <path d="M-10 110 Q120 90 200 120 T340 100 L340 160 L-10 160Z" fill="#cfe0dd" opacity=".8" />
        <path d="M-10 116 Q120 96 200 126 T340 106" fill="none" stroke="#a9c7c2" strokeWidth="2" />
        {[30, 90, 150, 210, 270].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="150" stroke="#ddd2bd" strokeWidth="6" />
        ))}
        {[28, 70, 112].map((y) => (
          <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="#ddd2bd" strokeWidth="6" />
        ))}
        {[50, 110, 170, 230].map((x) =>
          [12, 48, 90].map((y) => (
            <rect key={x + "-" + y} x={x} y={y} width="22" height="14" rx="2" fill="#ddd0b6" opacity=".8" />
          ))
        )}
      </svg>
      <div style={{ position: "absolute", left: "50%", top: "46%", transform: "translate(-50%,-100%)" }}>
        <div style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,.3))" }}>
          <Icon name="pin" size={36} color="var(--primary)" fill="var(--primary)" sw={1.5} />
          <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", width: 8, height: 8, background: "#fff", borderRadius: "50%" }} />
        </div>
      </div>
      <div className="btn btn-sm" style={{ position: "absolute", right: 10, bottom: 10, background: "#fff", color: "var(--ink)", boxShadow: "var(--shadow-sm)" }}>
        <Icon name="pin" size={13} color="var(--primary)" /> {lang === "jp" ? "地図で開く" : "Open in Maps"}
      </div>
    </div>
  );
}
