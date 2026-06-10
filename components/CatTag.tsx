/* Category pill (ported from ui.jsx). */
import { categories } from "@/lib/data";
import { val } from "@/lib/i18n";
import type { Category, Lang } from "@/lib/types";

export function CatTag({ cat, lang }: { cat: Category; lang: Lang }) {
  const c = categories[cat];
  if (!c) return null;
  return (
    <span className="tag" style={{ background: c.color + "1f", color: c.color }}>
      {val(c, lang)}
    </span>
  );
}
