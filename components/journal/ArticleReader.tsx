"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Cover } from "../Cover";
import { Icon } from "../Icon";
import { CatPill } from "./JournalParts";
import { BlogHeader } from "./BlogHeader";
import { blogCats, avatarColor } from "@/lib/data";
import { t, val, fmtDate } from "@/lib/i18n";
import { trackEvent, trafficSource } from "@/lib/track";
import type { Article, Lang } from "@/lib/types";

export function ArticleReader({ article, more }: { article: Article; more: Article[] }) {
  const [lang, setLang] = useState<Lang>("en");
  const [shareMsg, setShareMsg] = useState("");
  const langRef = useRef<Lang>(lang);
  langRef.current = lang; // latest chosen language, read by beacons on leave
  const cat = blogCats[article.category];
  const paras = (val(article.body, lang) || "").split(/\n\n+/).filter(Boolean);
  const imgs = article.attachments.filter((a) => a.type.startsWith("image/"));
  const files = article.attachments.filter((a) => !a.type.startsWith("image/"));

  // Record a view (with traffic source + language) on open, and total *visible*
  // time on leave (dwell). Sent via sendBeacon so it survives tab close.
  // Admins are filtered out server-side.
  useEffect(() => {
    trackEvent(article.slug, "view", { source: trafficSource(), lang: langRef.current });
    let visibleStart = typeof document !== "undefined" && document.visibilityState === "visible" ? Date.now() : 0;
    let acc = 0;
    let done = false;
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        if (visibleStart) { acc += Date.now() - visibleStart; visibleStart = 0; }
      } else if (!visibleStart) {
        visibleStart = Date.now();
      }
    };
    const send = () => {
      if (done) return;
      if (visibleStart) { acc += Date.now() - visibleStart; visibleStart = 0; }
      if (acc >= 1000) trackEvent(article.slug, "dwell", { ms: acc, lang: langRef.current });
      done = true;
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", send);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", send);
      send();
    };
  }, [article.slug]);

  // Read completion: fire once when the reader scrolls near the bottom.
  useEffect(() => {
    let fired = false;
    const onScroll = () => {
      if (fired) return;
      const scrolled = window.scrollY + window.innerHeight;
      const full = document.documentElement.scrollHeight;
      if (full > 0 && scrolled >= full * 0.9) {
        fired = true;
        trackEvent(article.slug, "complete", { lang: langRef.current });
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [article.slug]);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = val(article.title, lang);
    trackEvent(article.slug, "share");
    // Native share sheet on mobile / Apple (Web Share API).
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return; // user dismissed — done
        // otherwise fall through to clipboard
      }
    }
    // Desktop / unsupported: copy the link and confirm.
    try {
      await navigator.clipboard.writeText(url);
      setShareMsg(lang === "jp" ? "リンクをコピーしました" : "Link copied!");
    } catch {
      setShareMsg(url);
    }
    setTimeout(() => setShareMsg(""), 2200);
  }

  return (
    <div className="bl-root">
      <BlogHeader lang={lang} setLang={setLang} />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 0 60px" }}>
        {/* cover hero */}
        <div style={{ position: "relative", padding: "0 20px", marginTop: 8 }}>
          <div style={{ borderRadius: "var(--radius)", overflow: "hidden", position: "relative" }}>
            <Cover seed={article.cover} h={260} dim={0.12}>
              <Link href="/journal" title={t("journalNav", lang)} style={{ position: "absolute", top: 14, left: 14, width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,.92)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5, textDecoration: "none" }}>
                <Icon name="arrowL" size={19} color="var(--ink)" />
              </Link>
              <button onClick={share} title={lang === "jp" ? "共有" : "Share"} style={{ position: "absolute", top: 14, right: 14, width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,.92)", border: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 5 }}>
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

          {/* attachments */}
          {(imgs.length > 0 || files.length > 0) && (
            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 14 }}>
              {imgs.map((att) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={att.url} src={att.url} alt={att.name} style={{ width: "100%", borderRadius: "var(--radius-sm)", display: "block", border: "1px solid var(--line)" }} />
              ))}
              {files.map((att) => (
                <a key={att.url} href={att.url} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent(article.slug, "download")} style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px" }}>
                  <span style={{ width: 40, height: 40, borderRadius: 9, background: "var(--primary-soft)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 40px" }}>
                    <Icon name="download" size={18} color="var(--primary)" />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 14, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.name}</span>
                    <span style={{ fontSize: 11.5, color: "var(--ink-faint)", fontWeight: 600 }}>{att.name.includes(".") ? att.name.split(".").pop()!.toUpperCase() : (att.type || "file")}</span>
                  </span>
                  <Icon name="arrowR" size={16} color="var(--ink-faint)" />
                </a>
              ))}
            </div>
          )}

          {/* call to action — join the circle */}
          <div style={{ marginTop: 34, background: "var(--primary)", borderRadius: "var(--radius)", padding: "22px 22px", color: "#fff", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, justifyContent: "space-between" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>{t("ctaTitle", lang)}</div>
              <div style={{ fontSize: 13, opacity: 0.92, marginTop: 4, maxWidth: 380 }}>{t("ctaText", lang)}</div>
            </div>
            <Link href="/#events" onClick={() => trackEvent(article.slug, "cta")} className="btn" style={{ background: "#fff", color: "var(--primary)", fontWeight: 800, whiteSpace: "nowrap" }}>
              <Icon name="calendar" size={15} color="var(--primary)" /> {t("browse", lang)}
            </Link>
          </div>

          {/* more reading */}
          {more.length > 0 && (
            <div style={{ marginTop: 36, paddingTop: 24, borderTop: "1px solid var(--line)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, marginBottom: 14 }}>{t("moreReading", lang)}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {more.map((m) => (
                  <Link key={m.id} href={`/journal/${m.slug}`} onClick={() => trackEvent(article.slug, "readnext")} className="tap-card" style={{ display: "flex", gap: 13, alignItems: "center", textDecoration: "none" }}>
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

      {shareMsg && (
        <div style={{ position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)", background: "var(--ink)", color: "#f6efe2", padding: "10px 18px", borderRadius: 999, fontSize: 13, fontWeight: 700, zIndex: 50, boxShadow: "var(--shadow-lg)" }}>
          {shareMsg}
        </div>
      )}
    </div>
  );
}
