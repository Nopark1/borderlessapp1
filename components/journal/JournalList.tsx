"use client";

import { useState } from "react";
import Link from "next/link";
import { Cover } from "../Cover";
import { CatPill, Byline } from "./JournalParts";
import { BlogHeader } from "./BlogHeader";
import { blogCats } from "@/lib/data";
import { t, val, fmtDate } from "@/lib/i18n";
import type { Article, BlogCategory, Lang } from "@/lib/types";

const CAT_KEYS = Object.keys(blogCats) as BlogCategory[];

export function JournalList({ articles }: { articles: Article[] }) {
  const [lang, setLang] = useState<Lang>("en");
  const [cat, setCat] = useState<"all" | BlogCategory>("all");
  const list = cat === "all" ? articles : articles.filter((a) => a.category === cat);

  return (
    <div className="bl-root">
      <BlogHeader lang={lang} setLang={setLang} />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "6px 20px 60px" }}>
        <div style={{ padding: "18px 0 6px" }}>
          <h1 style={{ fontSize: 34, lineHeight: 1.1 }}>{t("journalTitle", lang)}</h1>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.55, margin: "10px 0 0", maxWidth: 560 }}>{t("journalSub", lang)}</p>
        </div>

        {/* topic filter chips */}
        <div style={{ display: "flex", gap: 8, padding: "16px 0 8px", borderBottom: "1px solid var(--line)", flexWrap: "wrap" }}>
          <Chip on={cat === "all"} onClick={() => setCat("all")}>{t("allTopics", lang)}</Chip>
          {CAT_KEYS.map((k) => (
            <Chip key={k} on={cat === k} onClick={() => setCat(k)}>{val(blogCats[k].short, lang)}</Chip>
          ))}
        </div>

        {/* list (style B: text left, thumbnail right) */}
        {list.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--ink-faint)", fontSize: 13.5, fontWeight: 600, padding: "48px 0" }}>{t("emptyJournal", lang)}</div>
        ) : (
          list.map((a, i) => (
            <Link key={a.id} href={`/journal/${a.slug}`} className="tap-card" style={{ display: "block", textDecoration: "none" }}>
              <article style={{ display: "flex", gap: 16, padding: "22px 0", borderBottom: i < list.length - 1 ? "1px solid var(--ink)" : "0", alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <CatPill catKey={a.category} lang={lang} />
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, lineHeight: 1.26, color: "var(--ink)", margin: "10px 0 0" }}>{val(a.title, lang)}</div>
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.5, margin: "8px 0 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{val(a.excerpt, lang)}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                    <Byline name={a.authorName} authorKey={a.authorId || a.authorName} role={a.authorRole} lang={lang} size={24} />
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: 11.5, color: "var(--ink-faint)", fontWeight: 600 }}>· {fmtDate(a.date, lang)} · {a.readMin} {t("minRead", lang)}</span>
                  </div>
                </div>
                <div style={{ flex: "0 0 96px" }}>
                  <Cover seed={a.cover} h={96} radius={13} />
                </div>
              </article>
            </Link>
          ))
        )}
        <div style={{ textAlign: "center", color: "var(--ink-faint)", fontSize: 12, padding: "26px 0 4px", fontFamily: "var(--font-display)" }}>ボーダレス · Borderless Kyoto</div>
      </div>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        all: "unset", cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: 12.5, fontWeight: 700,
        padding: "7px 14px", borderRadius: 999, whiteSpace: "nowrap",
        background: on ? "var(--ink)" : "transparent", color: on ? "#f6efe2" : "var(--ink-soft)",
        border: on ? "1.5px solid var(--ink)" : "1.5px solid var(--line)",
      }}
    >
      {children}
    </button>
  );
}
