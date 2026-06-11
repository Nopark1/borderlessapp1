/* "This weekend" horizontal-scroll strip (ported from public.jsx). */
import Link from "next/link";
import { Cover } from "./Cover";
import { Icon } from "./Icon";
import { yen } from "@/lib/formulas";
import { daysUntil, relDay, val, t } from "@/lib/i18n";
import type { Event, Lang } from "@/lib/types";

export function WeekendStrip({
  events,
  lang,
  playful,
}: {
  events: Event[];
  lang: Lang;
  playful?: boolean;
}) {
  if (!events.length) return null;
  return (
    <div style={{ paddingTop: 18 }}>
      <div style={{ padding: "0 18px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Icon name="sparkle" size={17} color="var(--gold)" fill="var(--gold)" />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 19, color: "var(--ink)", whiteSpace: "nowrap" }}>
            {t("thisWeekend", lang)}
          </span>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-faint)", fontWeight: 600, marginTop: 3 }}>{t("soonSub", lang)}</div>
      </div>
      <div className="wk-scroll">
        {events.map((e) => {
          const spots = e.capacity - (e.rsvp || 0);
          const soon = daysUntil(e.date) <= 3;
          return (
            <Link key={e.id} href={`/events/${e.slug}`} className="wk-card" style={{ display: "block" }}>
              <div
                style={{
                  background: "var(--surface)",
                  border: "1.5px solid var(--line)",
                  borderRadius: playful ? 22 : "var(--radius)",
                  overflow: "hidden",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <Cover seed={e.cover} h={116}>
                  <div style={{ position: "absolute", top: 10, left: 10 }}>
                    <span
                      className={"sticker " + (playful ? "tilt-l" : "")}
                      style={{ fontSize: 11.5, padding: "5px 10px", color: soon ? "var(--primary)" : "var(--ink)" }}
                    >
                      {soon && <Icon name="flame" size={12} color="var(--primary)" fill="var(--primary)" />} {relDay(e.date, lang)}
                    </span>
                  </div>
                </Cover>
                <div style={{ padding: "11px 13px 13px" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 15,
                      lineHeight: 1.22,
                      color: "var(--ink)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      minHeight: 37,
                    }}
                  >
                    {val(e.title, lang)}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-soft)", fontWeight: 600, margin: "6px 0 10px", display: "flex", alignItems: "center", gap: 5 }}>
                    <Icon name="pin" size={12} color="var(--primary)" /> {val(e.area, lang)}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, whiteSpace: "nowrap" }}>
                      {e.price ? yen(e.price) : t("free", lang)}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", color: spots <= 5 ? "var(--primary)" : "var(--ink-faint)" }}>
                      {spots <= 5 ? `${spots} ${t("spotsLeft", lang)}` : `${e.rsvp} ${t("going", lang)}`}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
