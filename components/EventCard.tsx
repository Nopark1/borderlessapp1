/* Event feed card (ported from public.jsx). Links to the event detail page. */
import Link from "next/link";
import { Cover } from "./Cover";
import { CatTag } from "./CatTag";
import { Icon } from "./Icon";
import { isPast, yen, pointsFor } from "@/lib/formulas";
import { fmtDate, val, t } from "@/lib/i18n";
import type { Event, Lang } from "@/lib/types";

export function EventCard({
  event,
  lang,
  joined,
  playful,
}: {
  event: Event;
  lang: Lang;
  joined?: boolean;
  playful?: boolean;
}) {
  const past = isPast(event);
  const spots = event.capacity - (event.rsvp || 0);
  return (
    <Link href={`/events/${event.slug}`} className="fade-up tap-card" style={{ width: "100%" }}>
      <div className="card" style={{ overflow: "hidden", marginBottom: 0 }}>
        <Cover seed={event.cover} h={past ? 132 : 158} label dim={past ? 0.12 : 0}>
          <div style={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", justifyContent: "space-between" }}>
            <span className={playful ? "tilt-l" : ""} style={{ display: "inline-block" }}>
              <CatTag cat={event.category} lang={lang} />
            </span>
            {!past && spots <= 5 && spots > 0 && (
              <span className="tag" style={{ background: "rgba(255,255,255,.92)", color: "var(--primary)" }}>
                {spots} {t("spotsLeft", lang)}
              </span>
            )}
            {past && (event.gallery || 0) > 0 && (
              <span className="tag" style={{ background: "rgba(0,0,0,.4)", color: "#fff" }}>
                <Icon name="grid" size={11} color="#fff" /> {event.gallery}
              </span>
            )}
          </div>
          <div style={{ position: "absolute", left: 14, bottom: 12, right: 14 }}>
            <div
              style={{
                color: "#fff",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 21,
                lineHeight: 1.18,
                textShadow: "0 2px 12px rgba(0,0,0,.4)",
              }}
            >
              {val(event.title, lang)}
            </div>
          </div>
        </Cover>
        <div style={{ padding: "13px 15px 15px" }}>
          <div style={{ display: "flex", gap: 14, color: "var(--ink-soft)", fontSize: 12.5, fontWeight: 600, marginBottom: 9 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Icon name="calendar" size={13} color="var(--primary)" /> {fmtDate(event.date, lang)}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Icon name="pin" size={13} color="var(--primary)" /> {val(event.area, lang)}
            </span>
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.5, marginBottom: 12 }}>
            {val(event.blurb, lang)}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--ink)" }}>
              {event.price ? yen(event.price) : t("free", lang)}
            </span>
            {past ? (
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-faint)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Icon name="users" size={14} color="var(--ink-faint)" /> {event.attended} {t("came", lang)}
              </span>
            ) : joined ? (
              <span className="tag" style={{ background: "var(--success-soft)", color: "var(--success)" }}>
                <Icon name="check" size={12} color="var(--success)" /> {t("youreIn", lang)}
              </span>
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--primary)", fontWeight: 700, fontSize: 13 }}>
                {t("imComing", lang)} <Icon name="arrowR" size={15} color="var(--primary)" />
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
