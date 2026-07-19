/* Shared Journal display bits: category pill + author byline. */
import { blogCats, avatarColor } from "@/lib/data";
import { val } from "@/lib/i18n";
import type { BlogCategory, Lang } from "@/lib/types";

export function CatPill({ catKey, lang, full = false }: { catKey: BlogCategory; lang: Lang; full?: boolean }) {
  const c = blogCats[catKey];
  if (!c) return null;
  return (
    <span
      style={{
        background: c.soft, color: c.color, display: "inline-flex", alignItems: "center", gap: 5,
        fontFamily: "var(--font-ui)", fontSize: 10.5, fontWeight: 800, letterSpacing: ".05em",
        textTransform: "uppercase", padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap",
      }}
    >
      {full ? val(c, lang) : val(c.short, lang)}
    </span>
  );
}

export function Byline({
  name,
  authorKey,
  role,
  lang,
  size = 24,
}: {
  name: string;
  authorKey: string;
  role?: string;
  lang: Lang;
  size?: number;
}) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0 }}>
      <span
        style={{
          width: size, height: size, borderRadius: "50%", background: avatarColor(authorKey || name || "b"),
          color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: size * 0.42, flex: "0 0 auto",
        }}
      >
        {(name || "B").charAt(0).toUpperCase()}
      </span>
      <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, fontWeight: 700, color: "var(--ink-soft)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {name}
        {role ? <span style={{ color: "var(--ink-faint)", fontWeight: 600 }}> · {role}</span> : null}
      </span>
    </span>
  );
}
