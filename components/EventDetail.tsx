"use client";

/* Public event detail (ported from public.jsx) + live RSVP. */

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cover } from "./Cover";
import { Icon } from "./Icon";
import { FauxMap } from "./FauxMap";
import { isPast, yen, pointsFor } from "@/lib/formulas";
import { t, val, fmtDate } from "@/lib/i18n";
import { toggleRsvp } from "@/app/events/actions";
import type { Event, Lang } from "@/lib/types";

function Row({ icon, main, sub }: { icon: string; main: React.ReactNode; sub: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <div style={{ width: 38, height: 38, borderRadius: 11, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 38px" }}>
        <Icon name={icon} size={18} color="var(--primary)" />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ fontWeight: 700, fontSize: 14.5, color: "var(--ink)", lineHeight: 1.3 }}>{main}</div>
        <div style={{ fontSize: 12.5, color: "var(--ink-faint)", fontWeight: 600, lineHeight: 1.3 }}>{sub}</div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, marginBottom: 12, color: "var(--ink)" }}>{children}</div>;
}

const avatarColors = ["#8A3233", "#B4893C", "#4E8FA6", "#5B6B4A", "#C06A3C", "#5B3B6B", "#7A3050"];

export function EventDetail({
  event,
  signedIn,
  initialJoined,
}: {
  event: Event;
  signedIn: boolean;
  initialJoined: boolean;
}) {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");
  const [joined, setJoined] = useState(initialJoined);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const past = isPast(event);
  const spots = event.capacity - (event.rsvp || 0);
  const goingCount = past ? event.attended || 0 : event.rsvp || 0;
  const avatarN = Math.min(7, Math.max(0, goingCount));

  function onRsvp() {
    if (!signedIn) {
      router.push(`/login?mode=signup`);
      return;
    }
    setError("");
    startTransition(async () => {
      const res = await toggleRsvp(event.id, event.slug);
      if (res.needsLogin) router.push("/login?mode=signup");
      else if (res.error) setError(res.error);
      else setJoined(Boolean(res.joined));
    });
  }

  return (
    <div className="bl-root">
      <header className="bl-topbar">
        <Link href="/" className="shell-brand" style={{ marginRight: "auto" }}>
          <span className="bl-emblem" aria-hidden="true">
            <Icon name="globe" size={22} color="#fff" />
          </span>
          <span className="bx">
            <b>BORDERLESS</b>
            <span>{t("tagline", lang)}</span>
          </span>
        </Link>
        <div className="lang-toggle">
          <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
          <button className={lang === "jp" ? "on" : ""} onClick={() => setLang("jp")}>日本</button>
        </div>
      </header>

      <div className="bl-screen" style={{ position: "relative" }}>
        <div style={{ position: "relative" }}>
          <Cover seed={event.cover} h={300} label dim={0.1}>
            <Link href="/" style={{ position: "absolute", top: 14, left: 14, width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,.92)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-sm)", zIndex: 5 }}>
              <Icon name="arrowL" size={19} color="var(--ink)" />
            </Link>
            <div style={{ position: "absolute", left: 18, right: 18, bottom: 18 }}>
              <span className="tag" style={{ background: "rgba(255,255,255,.92)", color: "var(--primary)" }}>{val(event.area, lang)}</span>
              <h1 style={{ color: "#fff", fontSize: 30, lineHeight: 1.14, marginTop: 10, textShadow: "0 2px 14px rgba(0,0,0,.4)" }}>
                {val(event.title, lang)}
              </h1>
            </div>
          </Cover>
        </div>

        <div style={{ padding: past ? "18px 18px 40px" : "18px 18px 130px" }}>
          {/* meta */}
          <div className="card" style={{ padding: 16, marginBottom: 18 }}>
            <Row icon="calendar" main={fmtDate(event.date, lang)} sub={`${event.time}–${event.endTime}`} />
            <hr className="hr" style={{ margin: "13px 0" }} />
            <Row icon="pin" main={val(event.venue, lang)} sub={val(event.area, lang)} />
            <hr className="hr" style={{ margin: "13px 0" }} />
            <Row
              icon="ticket"
              main={event.price ? yen(event.price) + " " + t("perPerson", lang) : t("free", lang)}
              sub={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--gold)", whiteSpace: "nowrap" }}>
                  <Icon name="star" size={12} color="var(--gold)" fill="var(--gold)" /> {t("earnPt", lang)} {pointsFor(event)}{" "}
                  {pointsFor(event) === 1 ? t("point", lang) : t("points", lang)}
                </span>
              }
            />
          </div>

          {/* about */}
          <SectionTitle>{t("about", lang)}</SectionTitle>
          <p style={{ fontSize: 14, lineHeight: 1.72, color: "var(--ink-soft)", margin: "0 0 24px" }}>{val(event.desc, lang)}</p>

          {/* who's coming */}
          <SectionTitle>{past ? t("recap", lang) : t("whoscoming", lang)}</SectionTitle>
          <div style={{ display: "flex", alignItems: "center", marginBottom: past ? 16 : 24 }}>
            <div style={{ display: "flex" }}>
              {Array.from({ length: avatarN }).map((_, i) => (
                <div
                  key={i}
                  style={{ width: 36, height: 36, borderRadius: "50%", marginLeft: i ? -10 : 0, background: avatarColors[i % 7], border: "2px solid var(--surface)", zIndex: 7 - i }}
                />
              ))}
            </div>
            <span style={{ marginLeft: avatarN ? 12 : 0, fontSize: 13, color: "var(--ink-soft)", fontWeight: 600 }}>
              {past ? `${event.attended} ${t("came", lang)}` : `${goingCount} ${lang === "jp" ? "人が参加予定" : "going"}`}
            </span>
          </div>

          {past && (event.gallery || 0) > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 24 }}>
              {["sakura", "river", "night", "tea", "food", "zen"].map((s, i) => (
                <Cover key={i} seed={s} h={92} radius={10} />
              ))}
            </div>
          )}

          {/* map */}
          <SectionTitle>{t("getThere", lang)}</SectionTitle>
          <FauxMap lang={lang} />
        </div>

        {/* sticky RSVP bar (upcoming only) */}
        {!past && (
          <div style={{ position: "sticky", bottom: 0, left: 0, right: 0, padding: "14px 18px 18px", background: "linear-gradient(to top, var(--paper) 72%, transparent)" }}>
            {error && <div style={{ fontSize: 12, color: "var(--danger)", fontWeight: 600, marginBottom: 8 }}>{error}</div>}
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ flex: "0 0 auto" }}>
                <div style={{ fontSize: 11, color: "var(--ink-faint)", fontWeight: 600 }}>{spots} {t("spotsLeft", lang)}</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19 }}>{event.price ? yen(event.price) : t("free", lang)}</div>
              </div>
              <button className={"btn btn-block " + (joined ? "btn-ghost" : "btn-primary")} style={{ flex: 1 }} disabled={pending} onClick={onRsvp}>
                {joined ? (
                  <>
                    <Icon name="check" size={16} color="var(--ink)" /> {t("youreIn", lang)}
                  </>
                ) : pending ? (
                  lang === "jp" ? "処理中…" : "…"
                ) : (
                  t("imComing", lang)
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
