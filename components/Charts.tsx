/* Mini charts (ported from ui.jsx): grouped bars + line/area. */

type Datum = Record<string, number | string>;

export function BarPairChart({
  data,
  w = 560,
  h = 180,
  keys,
  colors,
}: {
  data: Datum[];
  w?: number;
  h?: number;
  keys: string[];
  colors: string[];
}) {
  const pad = { l: 8, r: 8, t: 14, b: 26 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;
  const max = Math.max(1, ...data.flatMap((d) => keys.map((k) => Number(d[k])))) * 1.1;
  const groupW = iw / Math.max(1, data.length);
  const bw = Math.min(18, groupW / (keys.length + 1.4));
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      {[0, 0.5, 1].map((g, i) => (
        <line key={i} x1={pad.l} x2={w - pad.r} y1={pad.t + ih * g} y2={pad.t + ih * g} stroke="var(--line)" strokeWidth="1" strokeDasharray={i === 2 ? "0" : "3 4"} />
      ))}
      {data.map((d, di) => {
        const gx = pad.l + groupW * di + groupW / 2;
        return (
          <g key={di}>
            {keys.map((k, ki) => {
              const bh = (Number(d[k]) / max) * ih;
              const x = gx - (keys.length * bw + (keys.length - 1) * 4) / 2 + ki * (bw + 4);
              return <rect key={k} x={x} y={pad.t + ih - bh} width={bw} height={bh} rx="3" fill={colors[ki]} />;
            })}
            <text x={gx} y={h - 8} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--ink-faint)" fontFamily="var(--font-ui)">{String(d.m)}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function LineChart({
  data,
  field,
  w = 560,
  h = 170,
  color = "var(--primary)",
}: {
  data: Datum[];
  field: string;
  w?: number;
  h?: number;
  color?: string;
}) {
  const pad = { l: 8, r: 8, t: 14, b: 26 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;
  const vals = data.map((d) => Number(d[field]));
  const max = Math.max(1, ...vals) * 1.08;
  const min = Math.min(...vals, 0) * 0.9;
  const span = max - min || 1;
  const x = (i: number) => pad.l + (iw / Math.max(1, data.length - 1)) * i;
  const y = (v: number) => pad.t + ih - ((v - min) / span) * ih;
  const pts = data.map((d, i) => [x(i), y(Number(d[field]))]);
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
      {[0, 0.5, 1].map((g, i) => (
        <line key={i} x1={pad.l} x2={w - pad.r} y1={pad.t + ih * g} y2={pad.t + ih * g} stroke="var(--line)" strokeWidth="1" strokeDasharray={i === 2 ? "0" : "3 4"} />
      ))}
      <path d={area} fill={`url(#lg${field})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="3.5" fill="#fff" stroke={color} strokeWidth="2" />
          <text x={p[0]} y={h - 8} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--ink-faint)" fontFamily="var(--font-ui)">{String(data[i].m)}</text>
        </g>
      ))}
    </svg>
  );
}
