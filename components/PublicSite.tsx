"use client";

/* Borderless — public site (Phase 1, static).
   Hero + this-weekend strip + events feed, bilingual EN/JP.
   Reads hard-coded seed data; Supabase reads arrive in Phase 2. */

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Cover } from "./Cover";
import { Icon } from "./Icon";
import { EventCard } from "./EventCard";
import { WeekendStrip } from "./WeekendStrip";
import { isPast } from "@/lib/formulas";
import { t } from "@/lib/i18n";
import type { Event, Lang } from "@/lib/types";

const playful = true; // the public site uses the youthful "playful" vibe

export function PublicSite({
  initialEvents,
  signedIn = false,
}: {
  initialEvents: Event[];
  signedIn?: boolean;
}) {
  const [lang, setLang] = useState<Lang>("en");
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");
  const feedRef = useRef<HTMLDivElement>(null);

  const { upcoming, past } = useMemo(() => {
    const up = initialEvents
      .filter((e) => !isPast(e) && e.status !== "draft")
      .sort((a, b) => (a.date < b.date ? -1 : 1));
    const pa = initialEvents
      .filter((e) => isPast(e))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    return { upcoming: up, past: pa };
  }, [initialEvents]);

  const list = filter === "past" ? past : upcoming;

  const scrollToFeed = () =>
    feedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className={"bl-root " + (playful ? "playful" : "")}>
      {/* top bar: brand + language toggle */}
      <header className="bl-topbar">
        <div className="shell-brand">
          <span className="bl-emblem" aria-hidden="true">
            <Icon name="globe" size={22} color="#fff" />
          </span>
          <span className="bx">
            <b>BORDERLESS</b>
            <span>{t("tagline", lang)}</span>
          </span>
        </div>
        <div className="lang-toggle">
          <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>
            EN
          </button>
          <button className={lang === "jp" ? "on" : ""} onClick={() => setLang("jp")}>
            日本
          </button>
        </div>
      </header>

      {/* mobile-first content column */}
      <div className="bl-screen">
        {/* hero */}
        <div className="pub-hero">
          <Cover seed="lantern" fill />
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "linear-gradient(to top, rgba(20,12,10,.92), rgba(20,12,10,.32) 55%, rgba(20,12,10,.45))",
            }}
          />
          <div className="pub-hero-inner">
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "nowrap", paddingRight: 74 }}>
              <span className="sticker wobble tilt-l" style={{ fontSize: 12.5, padding: "7px 13px", whiteSpace: "nowrap" }}>
                <Icon name="sparkle" size={14} color="var(--primary)" fill="var(--primary)" />{" "}
                {lang === "jp" ? "毎週開催！" : "new every week"}
              </span>
              <span
                className="sticker wobble tilt-r"
                style={{ color: "var(--primary)", fontSize: 12.5, padding: "7px 13px", whiteSpace: "nowrap", animationDelay: "-1.1s" }}
              >
                <Icon name="users" size={14} color="var(--primary)" /> 100+ {lang === "jp" ? "仲間" : "friends"}
              </span>
            </div>
            <h1 className="pub-hero-title">{t("heroTitle", lang)}</h1>
            <p style={{ color: "rgba(255,255,255,.88)", fontSize: 14, lineHeight: 1.55, margin: "12px 0 18px", maxWidth: 320 }}>
              {lang === "jp"
                ? "京都で最も成長中の国際サークル。新しい文化に触れ、新しい仲間と出会おう✨️"
                : "Kyoto's fastest-growing international circle. Experience new cultures and meet new friends✨️"}
            </p>
            <div style={{ display: "flex", gap: 10, pointerEvents: "auto" }}>
              <Link className="btn btn-primary" href={signedIn ? "/me" : "/login?mode=signup"}>
                {t("joinFree", lang)}
              </Link>
              <button
                className="btn btn-ghost"
                style={{ color: "#fff", borderColor: "rgba(255,255,255,.4)" }}
                onClick={scrollToFeed}
              >
                {t("browse", lang)}
              </button>
            </div>
          </div>
          <div style={{ position: "absolute", top: 14, right: 16, zIndex: 6 }}>
            {signedIn ? (
              <Link
                href="/me"
                style={{
                  all: "unset",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 999,
                  background: "var(--primary)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 12.5,
                  whiteSpace: "nowrap",
                  boxShadow: "0 2px 10px rgba(0,0,0,.3)",
                }}
              >
                <Icon name="user" size={14} color="#fff" /> {lang === "jp" ? "マイページ" : "My profile"}
              </Link>
            ) : (
              <Link
                href="/login"
                style={{
                  all: "unset",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,.92)",
                  color: "var(--ink)",
                  fontWeight: 700,
                  fontSize: 12.5,
                  whiteSpace: "nowrap",
                  boxShadow: "0 2px 10px rgba(0,0,0,.28)",
                }}
              >
                <Icon name="user" size={14} color="var(--primary)" /> {t("signIn", lang)}
              </Link>
            )}
          </div>
        </div>

        {/* this weekend strip */}
        {filter === "upcoming" && <WeekendStrip events={upcoming.slice(0, 4)} lang={lang} playful={playful} />}

        {/* filter */}
        <div ref={feedRef} style={{ padding: "20px 18px 8px", scrollMarginTop: 8 }}>
          <div className="seg" style={{ marginBottom: 18 }}>
            <button className={filter === "upcoming" ? "on" : ""} onClick={() => setFilter("upcoming")}>
              {t("upcoming", lang)}
            </button>
            <button className={filter === "past" ? "on" : ""} onClick={() => setFilter("past")}>
              {t("past", lang)}
            </button>
          </div>
        </div>

        <div className="feed-grid">
          {list.map((e) => (
            <EventCard key={e.id} event={e} lang={lang} playful={playful} />
          ))}
          <div className="feed-foot" style={{ textAlign: "center", color: "var(--ink-faint)", fontSize: 12, padding: "16px 0 4px", fontFamily: "var(--font-display)" }}>
            ボーダレス · Borderless Kyoto
          </div>
        </div>
      </div>
    </div>
  );
}
