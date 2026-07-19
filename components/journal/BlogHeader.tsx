"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "../Icon";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

/** Shared top bar for the Blog pages: brand → home, plus Events / Admin links
 *  and the language toggle. Admin status is resolved client-side (the pages are
 *  statically cached), matching the homepage. */
export function BlogHeader({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    let active = true;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (active && d) setIsAdmin(Boolean(d.isAdmin)); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const pill: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none",
    padding: "7px 12px", borderRadius: 999, border: "1.5px solid var(--line)",
    background: "var(--surface)", color: "var(--ink-soft)",
    fontFamily: "var(--font-ui)", fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap",
  };

  return (
    <header className="bl-topbar">
      <Link href="/" className="shell-brand" style={{ marginRight: "auto", textDecoration: "none" }} title={lang === "jp" ? "ホーム" : "Home"}>
        <span className="bl-emblem" aria-hidden="true">
          <Icon name="globe" size={22} color="#fff" />
        </span>
        <span className="bx">
          <b>BORDERLESS</b>
          <span>{t("tagline", lang)}</span>
        </span>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <Link href="/" style={pill}>
          <Icon name="home" size={14} color="var(--ink-soft)" /> {lang === "jp" ? "ホーム" : "Home"}
        </Link>
        <Link href="/#events" style={pill}>
          <Icon name="calendar" size={14} color="var(--ink-soft)" /> {t("eventsNav", lang)}
        </Link>
        {isAdmin && (
          <Link href="/admin" style={{ ...pill, borderColor: "var(--primary)", color: "var(--primary)" }}>
            <Icon name="grid" size={14} color="var(--primary)" /> {lang === "jp" ? "管理" : "Admin"}
          </Link>
        )}
        <div className="lang-toggle">
          <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
          <button className={lang === "jp" ? "on" : ""} onClick={() => setLang("jp")}>日本</button>
        </div>
      </div>
    </header>
  );
}
