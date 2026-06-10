/* ============================================================
   Borderless — shared UI primitives (ui.jsx)
   Icons, cover placeholders, charts. Exports to window.
   ============================================================ */

/* ---------- icon set (lucide-style strokes) ---------- */
const ICONS = {
  calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  pin: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z M12 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13A4 4 0 0 1 16 11",
  ticket: "M3 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z M14 5v14",
  star: "M12 2l3 6.5 7 .9-5 4.8 1.3 7L12 17.8 5.4 21.2 6.7 14.2 2 9.4l7-.9z",
  check: "M20 6L9 17l-5-5",
  x: "M18 6L6 18M6 6l12 12",
  arrowR: "M5 12h14M13 6l6 6-6 6",
  arrowL: "M19 12H5M11 18l-6-6 6-6",
  arrowUp: "M12 19V5M6 11l6-6 6 6",
  arrowDown: "M12 5v14M6 13l6 6 6-6",
  heart: "M20.8 5.6a5 5 0 0 0-7-.1L12 7l-1.8-1.5a5 5 0 1 0-7 7.1L12 21l8.8-8.4a5 5 0 0 0 0-7z",
  trophy: "M6 9a6 6 0 0 0 12 0V4H6zM6 5H3v2a3 3 0 0 0 3 3M18 5h3v2a3 3 0 0 1-3 3M9 21h6M12 17v4",
  flame: "M12 2c1 4-2 5-2 8a4 4 0 0 0 8 0c0-1-.5-2-1-3 2 1 3 3 3 6a8 8 0 1 1-13-6c2-2 3-3 3-5z",
  gift: "M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  chart: "M3 3v18h18M7 16v-5M12 16V8M17 16v-9",
  wallet: "M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5M16 12h.01",
  yen: "M12 3l5 8M12 3L7 11M12 11v10M8 13h8M8 17h8",
  home: "M3 11l9-8 9 8M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  share: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  plus: "M12 5v14M5 12h14",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  globe: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z",
  sparkle: "M12 3l1.9 5.6L19 10l-5.1 1.4L12 17l-1.9-5.6L5 10l5.1-1.4z",
  leaf: "M11 20A7 7 0 0 1 4 13c0-6 7-9 16-9 0 9-3 16-9 16zM4 21c4-5 7-7 10-8",
  edit: "M12 20h9 M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z",
  copy: "M9 9h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z M5 15a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2",
  trash: "M3 6h18 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6 M10 11v6 M14 11v6",
  dots: "M12 6.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M12 19.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  checkCircle: "M9 12l2 2 4-4 M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z",
  scale: "M12 3v18 M5 7h14 M5 7l-3 6a3 3 0 0 0 6 0z M19 7l-3 6a3 3 0 0 0 6 0z M8 21h8",
};

function Icon({ name, size = 18, color = "currentColor", sw = 1.8, fill = "none", style }) {
  const d = ICONS[name];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}
      aria-hidden="true">
      {d.split(" M").map((seg, i) => <path key={i} d={(i ? "M" : "") + seg} />)}
    </svg>
  );
}

/* ---------- cover placeholder imagery ----------
   Layered warm gradient + a seasonal CSS motif (sun, moon,
   torii arc, ripples). No photos needed; reads as on-brand. */
function Cover({ seed, h = 200, radius = 0, label, children, dim = 0 }) {
  const pal = (window.BL_DATA.covers[seed]) || ["#8A3233", "#C4583B", "#E8A04A"];
  const [c1, c2, c3] = pal;
  const motif = {
    matsuri: <SunMotif a={c3} />, lantern: <SunMotif a={c3} moon />, sakura: <PetalMotif a={c3} />,
    night: <SunMotif a={c3} moon />, river: <RippleMotif a={c3} />, tea: <RippleMotif a={c3} />,
    food: <SunMotif a={c3} />, zen: <CircleMotif a={c3} />,
  }[seed] || <SunMotif a={c3} />;
  return (
    <div className="cover" style={{
      height: h, borderRadius: radius,
      background: `radial-gradient(120% 130% at 78% 18%, ${c3} 0%, ${c2} 42%, ${c1} 100%)`,
    }}>
      <div className="cover-motif">{motif}</div>
      <div className="cover-grain" />
      {dim > 0 && <div style={{ position: "absolute", inset: 0, background: `rgba(20,12,10,${dim})` }} />}
      {label && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: 0 }} className="scrim" />
      )}
      {children}
    </div>
  );
}
function SunMotif({ a, moon }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice">
      <circle cx="232" cy="58" r="40" fill={a} opacity={moon ? .55 : .85} />
      {moon && <circle cx="218" cy="50" r="40" fill="rgba(0,0,0,.18)" />}
      <path d="M0 168 Q75 138 150 162 T300 150 V200 H0 Z" fill="rgba(0,0,0,.16)" />
      <path d="M0 184 Q90 158 180 178 T300 172 V200 H0 Z" fill="rgba(0,0,0,.22)" />
    </svg>
  );
}
function PetalMotif({ a }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice">
      {[[40,40],[120,30],[210,60],[260,120],[80,140],[170,150],[30,110],[230,30]].map(([x,y],i)=>(
        <g key={i} transform={`translate(${x} ${y}) rotate(${i*40})`} opacity={.6}>
          <path d="M0 0 C6 -10 6 -10 0 -18 C-6 -10 -6 -10 0 0Z" fill={a} />
        </g>
      ))}
      <path d="M0 176 Q90 156 180 174 T300 168 V200 H0 Z" fill="rgba(0,0,0,.18)" />
    </svg>
  );
}
function RippleMotif({ a }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice">
      {[30,55,80,105,130].map((r,i)=>(
        <circle key={i} cx="236" cy="150" r={r} fill="none" stroke={a} strokeWidth="2" opacity={.32 - i*.045} />
      ))}
      <circle cx="236" cy="150" r="14" fill={a} opacity=".7" />
    </svg>
  );
}
function CircleMotif({ a }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice">
      <circle cx="150" cy="100" r="62" fill="none" stroke={a} strokeWidth="6" opacity=".75"
        strokeDasharray="370 30" strokeLinecap="round" transform="rotate(-30 150 100)" />
    </svg>
  );
}

/* ---------- tag / pill ---------- */
function CatTag({ cat, lang }) {
  const c = window.BL_DATA.categories[cat];
  if (!c) return null;
  return (
    <span className="tag" style={{ background: c.color + "1f", color: c.color }}>
      {window.BL_I18N.val(c, lang)}
    </span>
  );
}

/* ---------- charts ---------- */
function BarPairChart({ data, w = 560, h = 180, keys, colors, money }) {
  const pad = { l: 8, r: 8, t: 14, b: 26 };
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const max = Math.max(...data.flatMap((d) => keys.map((k) => d[k]))) * 1.1;
  const groupW = iw / data.length;
  const bw = Math.min(18, groupW / (keys.length + 1.4));
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      {[0, .5, 1].map((g, i) => (
        <line key={i} x1={pad.l} x2={w - pad.r} y1={pad.t + ih * g} y2={pad.t + ih * g}
          stroke="var(--line)" strokeWidth="1" strokeDasharray={i === 2 ? "0" : "3 4"} />
      ))}
      {data.map((d, di) => {
        const gx = pad.l + groupW * di + groupW / 2;
        return (
          <g key={di}>
            {keys.map((k, ki) => {
              const bh = (d[k] / max) * ih;
              const x = gx - (keys.length * bw + (keys.length - 1) * 4) / 2 + ki * (bw + 4);
              return <rect key={k} x={x} y={pad.t + ih - bh} width={bw} height={bh}
                rx="3" fill={colors[ki]} />;
            })}
            <text x={gx} y={h - 8} textAnchor="middle" fontSize="11" fontWeight="600"
              fill="var(--ink-faint)" fontFamily="var(--font-ui)">{d.m}</text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({ data, field, w = 560, h = 170, color = "var(--primary)", money }) {
  const pad = { l: 8, r: 8, t: 14, b: 26 };
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const vals = data.map((d) => d[field]);
  const max = Math.max(...vals) * 1.08, min = Math.min(...vals) * 0.9;
  const x = (i) => pad.l + (iw / (data.length - 1)) * i;
  const y = (v) => pad.t + ih - ((v - min) / (max - min)) * ih;
  const pts = data.map((d, i) => [x(i), y(d[field])]);
  const path = pts.map((p, i) => (i ? "L" : "M") + p[0] + " " + p[1]).join(" ");
  const area = path + ` L${x(data.length - 1)} ${pad.t + ih} L${x(0)} ${pad.t + ih} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id={"lg" + field} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, .5, 1].map((g, i) => (
        <line key={i} x1={pad.l} x2={w - pad.r} y1={pad.t + ih * g} y2={pad.t + ih * g}
          stroke="var(--line)" strokeWidth="1" strokeDasharray={i === 2 ? "0" : "3 4"} />
      ))}
      <path d={area} fill={`url(#lg${field})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="3.5" fill="#fff" stroke={color} strokeWidth="2" />
          <text x={p[0]} y={h - 8} textAnchor="middle" fontSize="11" fontWeight="600"
            fill="var(--ink-faint)" fontFamily="var(--font-ui)">{data[i].m}</text>
        </g>
      ))}
    </svg>
  );
}

function Ring({ value, size = 92, sw = 10, color = "var(--primary)", track = "var(--line)", children }) {
  const r = (size - sw) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)}
          style={{ transition: "stroke-dashoffset .8s cubic-bezier(.2,.7,.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}

function MiniBars({ rate, w = 60, h = 26 }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: h, width: w }}>
      {rate.map((v, i) => (
        <div key={i} style={{ flex: 1, height: `${v}%`, background: "var(--primary)",
          borderRadius: 2, opacity: .35 + (i / rate.length) * .65 }} />
      ))}
    </div>
  );
}

Object.assign(window, {
  Icon, Cover, CatTag, BarPairChart, LineChart, Ring, MiniBars,
});
