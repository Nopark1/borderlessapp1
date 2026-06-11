"use client";

import { useState } from "react";
import { Cover } from "../Cover";
import { Icon } from "../Icon";
import { PageHead, StatusPill, EventMenu } from "./AdminShared";
import { isPast, breakEven, finOf, pointsFor, yen } from "@/lib/formulas";
import { t, val, fmtDate } from "@/lib/i18n";
import type { Event, EventStatus, Lang } from "@/lib/types";

type Filter = "all" | "published" | "draft" | "completed";

export function AdminEvents({
  lang,
  events,
  onNew,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  lang: Lang;
  events: Event[];
  onNew: () => void;
  onEdit: (e: Event) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const past = events.filter((e) => isPast(e)).sort((a, b) => (a.date < b.date ? 1 : -1));
  const upcoming = events.filter((e) => !isPast(e)).sort((a, b) => (a.date < b.date ? -1 : 1));
  const upList = upcoming.filter((e) => filter === "all" || e.status === filter);
  const showU = (filter === "all" || filter === "published" || filter === "draft") && upList.length > 0;
  const showPast = filter === "all" || filter === "completed";

  return (
    <div style={{ padding: "26px 30px 40px" }}>
      <PageHead
        title={t("eventsAdm", lang)}
        sub={lang === "jp" ? "招待 vs 参加・収支" : "Invited vs. came · money in/out"}
        cta={t("newEvent", lang)}
        onCta={onNew}
      />

      <div className="seg" style={{ marginBottom: 22 }}>
        {(["all", "published", "draft", "completed"] as Filter[]).map((k) => (
          <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>
            {k === "all" ? t("allStatus", lang) : t(k, lang)}
          </button>
        ))}
      </div>

      {showU && (
        <div>
          <div style={{ marginBottom: 14, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--ink-soft)" }}>
            {t("upcoming", lang)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, marginBottom: 28 }}>
            {upList.map((e) => {
              const fill = e.capacity ? Math.round(((e.rsvp || 0) / e.capacity) * 100) : 0;
              const be = breakEven(e);
              const beOk = be <= e.capacity;
              return (
                <div
                  key={e.id}
                  onClick={() => onEdit(e)}
                  style={{ cursor: "pointer", position: "relative", background: "#fff", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}
                >
                  <div style={{ height: 90 }}>
                    <Cover seed={e.cover} h={90} dim={e.status === "draft" ? 0.32 : 0} />
                  </div>
                  <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
                    <StatusPill status={e.status as EventStatus} lang={lang} />
                  </div>
                  <div style={{ position: "absolute", top: 9, right: 9, zIndex: 20 }}>
                    <EventMenu e={e} lang={lang} onTop onEdit={() => onEdit(e)} onDuplicate={() => onDuplicate(e.id)} onDelete={() => onDelete(e.id)} />
                  </div>
                  <div style={{ padding: "13px 15px 15px" }}>
                    <div style={{ fontWeight: 700, fontFamily: "var(--font-display)", fontSize: 15 }}>{val(e.title, lang)}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-faint)", fontWeight: 600, margin: "3px 0 11px" }}>
                      {fmtDate(e.date, lang)} · {val(e.area, lang)}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12, fontWeight: 700, marginBottom: 5 }}>
                      <span style={{ color: "var(--ink-soft)", whiteSpace: "nowrap" }}>{e.rsvp || 0}/{e.capacity} {lang === "jp" ? "参加予定" : "RSVP'd"}</span>
                      <span style={{ color: "var(--primary)", whiteSpace: "nowrap" }}>{yen(e.price * e.capacity)} {lang === "jp" ? "見込" : "proj."}</span>
                    </div>
                    <div style={{ width: "100%", height: 6, borderRadius: 4, background: "var(--line)", overflow: "hidden", marginBottom: 11 }}>
                      <div style={{ width: fill + "%", height: "100%", background: "var(--primary)" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11.5, fontWeight: 700, paddingTop: 10, borderTop: "1px solid var(--line-soft)" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--ink-soft)", whiteSpace: "nowrap" }}>
                        <Icon name="scale" size={14} color="var(--ink-soft)" /> {t("breakEven", lang)}
                      </span>
                      <span style={{ color: beOk ? "var(--success)" : "var(--danger)", whiteSpace: "nowrap" }}>
                        {be} {lang === "jp" ? "人" : "ppl"} · {yen(e.cost || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showPast && (
        <div>
          <div style={{ marginBottom: 14, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--ink-soft)" }}>
            {t("past", lang)}
          </div>
          <div className="metric" style={{ padding: 0, overflow: "visible" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>{t("event", lang)}</th>
                  <th>{t("invited", lang)}</th>
                  <th>{t("came", lang)}</th>
                  <th>{t("showupRate", lang)}</th>
                  <th>{lang === "jp" ? "獲得pt" : "Pts"}</th>
                  <th style={{ textAlign: "right" }}>{t("revenue", lang)}</th>
                  <th style={{ textAlign: "right" }}>{t("costs", lang)}</th>
                  <th style={{ textAlign: "right" }}>{t("net", lang)}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {past.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", color: "var(--ink-faint)", padding: "22px 0" }}>
                      {lang === "jp" ? "終了したイベントはまだありません。" : "No past events yet."}
                    </td>
                  </tr>
                )}
                {past.map((e) => {
                  const f = finOf(e);
                  const rate = e.invited ? Math.round(((e.attended || 0) / e.invited) * 100) : 0;
                  return (
                    <tr key={e.id} onClick={() => onEdit(e)} style={{ cursor: "pointer" }}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                          <div style={{ flex: "0 0 40px", width: 40 }}>
                            <Cover seed={e.cover} h={32} radius={8} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>{val(e.title, lang)}</div>
                            <div style={{ fontSize: 11.5, color: "var(--ink-faint)", fontWeight: 600 }}>{fmtDate(e.date, lang)}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{e.invited}</td>
                      <td style={{ fontWeight: 600 }}>{e.attended}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{ width: 54, height: 6, borderRadius: 4, background: "var(--line)", overflow: "hidden" }}>
                            <div style={{ width: rate + "%", height: "100%", background: rate >= 80 ? "var(--success)" : rate >= 65 ? "var(--gold)" : "var(--danger)" }} />
                          </div>
                          <span style={{ fontWeight: 700, fontSize: 12.5 }}>{rate}%</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: "var(--gold)" }}>+{(e.attended || 0) * pointsFor(e)}</td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>{yen(f.revenue)}</td>
                      <td style={{ textAlign: "right", color: "var(--ink-soft)" }}>{yen(f.costs)}</td>
                      <td style={{ textAlign: "right", fontWeight: 800, color: f.net >= 0 ? "var(--success)" : "var(--danger)" }}>{yen(f.net)}</td>
                      <td style={{ textAlign: "right", width: 44 }}>
                        <EventMenu e={e} lang={lang} onEdit={() => onEdit(e)} onDuplicate={() => onDuplicate(e.id)} onDelete={() => onDelete(e.id)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
