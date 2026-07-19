"use client";

import { useState } from "react";
import Link from "next/link";
import { Cover } from "../Cover";
import { Icon } from "../Icon";
import { CatPill } from "./JournalParts";
import { blogCats, avatarColor } from "@/lib/data";
import { t, val, fmtDate } from "@/lib/i18n";
import type { Article, Lang } from "@/lib/types";

export function ArticleReader({ article, more }: { article: Article; more: Article[] }) {
  const [lang, setLang] = useState<Lang>("en");
  const cat = blogCats[article.category];
  const paras = (val(article.body, lang) || "").split(/\n\n+/).filter(Boolean);

  function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = val(article.title, lang);
    if (typeof navigator !== "undefined" && (navigator as Navigator).share) {
      (navigator as Navigator).share({ title, url }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  }

  return (
    <div className="bl-root">
      <header className="bl-topbar">
        <Link href="/journal" className="shell-brand" style={{ display: "inline-flex", alignItems: "center", gap: 7, marginRight: "auto", textDecoration: "none" }}>
          <Icon name="arrowL" size={18} color="var(--ink-soft)" />
          <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13, color: "var(--ink-soft)" }}>{t("journalNav", lang)}</span>
        </Link>
        <div className="lang-toggle">
          <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
          <button className={lang === "jp" ? "on" : ""} onClick={() => setLang("jp")}>日本</button>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 0 60px" }}>
        {/* cover hero */}
        <div style={{ position: "relative", padding: "0 20px", marginTop: 8 }}>
          <div style={{ borderRadius: "var(--radius)", overflow: "hidden", position: "relative" }}>
            <Cover seed={article.cover} h={260} dim={0.12}>
              <button onClick={share} title="Share" style={{ position: "absolute", top: 14, right: 14, width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,.92)", border: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 5 }}>
                <Icon name="share" size={17} color="var(--ink)" />
              </button>
              <div style={{ position: "absolute", left: 18, bottom: 18 }}>
                <span style={{ background: "#fff", color: cat.color, display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-ui)", fontSize: 10.5, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", padding: "5px 11px", borderRadius: 999 }}>{val(cat, lang)}</span>
              </div>
            </Cover>
          </div>
        </div>

        <div style={{ padding: "22px 20px 0" }}>
          <h1 style={{ fontSize: 28, lineHeight: 1.2 }}>{val(article.title, lang)}</h1>

          {/* author block */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0 4px", paddingBottom: 18, borderBottom: "1px solid var(--line)" }}>
            <span style={{ width: 42, height: 42, borderRadius: "50%", background: avatarColor(article.authorId || article.authorName), color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, flex: "0 0 42px" }}>
              {(article.authorName || "B").charAt(0).toUpperCase()}
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>{article.authorName}</div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--ink-faint)", fontWeight: 600 }}>
                {article.authorRole ? `${article.authorRole} · ` : ""}{fmtDate(article.date, lang)} · {article.readMin} {t("minRead", lang)}
              </div>
            </div>
          </div>

          {/* body */}
          {paras.map((p, i) => (
            <p key={i} style={{ fontFamily: "var(--font-ui)", fontSize: 15.5, lineHeight: 1.78, color: "var(--ink)", margin: i ? "16px 0 0" : "18px 0 0" }}>{p}</p>
          ))}

          {/* more reading */}
          {more.length > 0 && (
            <div style={{ marginTop: 36, paddingTop: 24, borderTop: "1px solid var(--line)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, marginBottom: 14 }}>{t("moreReading", lang)}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {more.map((m) => (
                  <Link key={m.id} href={`/journal/${m.slug}`} className="tap-card" style={{ display: "flex", gap: 13, alignItems: "center", textDecoration: "none" }}>
                    <div style={{ flex: "0 0 68px" }}><Cover seed={m.cover} h={68} radius={11} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <CatPill catKey={m.category} lang={lang} />
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, lineHeight: 1.28, color: "var(--ink)", marginTop: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{val(m.title, lang)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
