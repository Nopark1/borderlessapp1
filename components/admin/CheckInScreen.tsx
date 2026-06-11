"use client";

/* Door check-in (ported from admin.jsx). Toggle attendance, then record:
   completes the event and writes participation points + invite bonuses. */

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "../Icon";
import { Ring } from "../Ring";
import { StatusPill } from "./AdminShared";
import { pointsFor, yen, tierFor } from "@/lib/formulas";
import { t, val, fmtDate } from "@/lib/i18n";
import { finishCheckIn } from "@/app/admin/actions";
import type { Event, Lang } from "@/lib/types";

export type RosterMember = {
  id: string;
  name: string;
  country: string;
  points: number;
  attended: boolean;
};

export function CheckInScreen({ event, roster }: { event: Event; roster: RosterMember[] }) {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");
  const [present, setPresent] = useState<Set<string>>(
    () => new Set(roster.filter((m) => m.attended).map((m) => m.id))
  );
  const [q, setQ] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const invited = event.invited || roster.length || 0;
  const count = present.size;
  const price = Number(event.price) || 0;
  const cost = Number(event.cost) || 0;
  const revenue = count * price;
  const net = revenue - cost;
  const showUp = invited > 0 ? Math.round((count / invited) * 100) : 0;
  const pts = count * pointsFor(event);
  const done = event.attended != null;

  const tierColor: Record<string, string> = { Insider: "var(--primary)", Regular: "var(--gold)", Guest: "var(--ink-faint)" };

  const list = useMemo(
    () => roster.filter((m) => m.name.toLowerCase().includes(q.toLowerCase())),
    [roster, q]
  );

  const toggle = (id: string) =>
    setPresent((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  function finish() {
    setError("");
    startTransition(async () => {
      const res = await finishCheckIn(event.id, [...present]);
      if (res.error) setError(res.error);
      else router.push("/admin");
    });
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f7f1e8", display: "flex", flexDirection: "column" }}>
      {/* header */}
      <div style={{ padding: "18px 30px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13, minWidth: 0 }}>
          <Link href="/admin" style={{ width: 38, height: 38, borderRadius: 11, background: "#fff", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 38px" }}>
            <Icon name="arrowL" size={19} color="var(--ink)" />
          </Link>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <h1 style={{ fontSize: 22, whiteSpace: "nowrap" }}>{t("checkinTitle", lang)}</h1>
              {done && <StatusPill status="completed" lang={lang} />}
            </div>
            <div style={{ color: "var(--ink-faint)", fontSize: 13, fontWeight: 600, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {val(event.title, lang)} · {fmtDate(event.date, lang)}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="lang-toggle">
            <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
            <button className={lang === "jp" ? "on" : ""} onClick={() => setLang("jp")}>日本</button>
          </div>
          <button className="btn btn-primary" disabled={pending} onClick={finish} style={{ flex: "0 0 auto" }}>
            <Icon name="checkCircle" size={17} color="#fff" /> {pending ? (lang === "jp" ? "記録中…" : "Recording…") : t("finishRecord", lang)}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#f8e8e3", color: "var(--danger)", fontWeight: 600, fontSize: 13, padding: "10px 30px" }}>{error}</div>
      )}

      <div style={{ flex: 1, padding: "22px 30px 40px", display: "grid", gridTemplateColumns: "300px 1fr", gap: 22, alignItems: "start" }}>
        {/* stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 16, padding: "22px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Ring value={showUp} size={124} sw={11} color="var(--primary)">
              <div style={{ textAlign: "center" }}>
                <div className="stat-num" style={{ fontSize: 34, color: "var(--primary)" }}>{count}</div>
                <div style={{ fontSize: 12, color: "var(--ink-faint)", fontWeight: 700 }}>/ {invited}</div>
              </div>
            </Ring>
            <div style={{ marginTop: 13, fontSize: 14, fontWeight: 800, whiteSpace: "nowrap" }}>{count} {t("checkedIn", lang)}</div>
            <div style={{ fontSize: 12, color: "var(--ink-faint)", fontWeight: 600, whiteSpace: "nowrap" }}>{showUp}% {t("ofInvited", lang)}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
            <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 13, padding: "12px 13px" }}>
              <div style={{ fontSize: 10.5, color: "var(--ink-soft)", fontWeight: 700 }}>{t("actualRev", lang)}</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, marginTop: 4 }}>{yen(revenue)}</div>
            </div>
            <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 13, padding: "12px 13px" }}>
              <div style={{ fontSize: 10.5, color: "var(--ink-soft)", fontWeight: 700 }}>{t("actualNet", lang)}</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, marginTop: 4, color: net >= 0 ? "var(--success)" : "var(--danger)" }}>{yen(net)}</div>
            </div>
          </div>
          <div style={{ background: "var(--gold-soft)", borderRadius: 13, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="star" size={18} color="var(--gold)" fill="var(--gold)" />
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap" }}>{pts} {t("ptsAwarded", lang)}</div>
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-faint)", fontWeight: 600, lineHeight: 1.45, padding: "0 2px" }}>{t("recordHint", lang)}</div>
        </div>

        {/* guest list */}
        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "13px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginRight: "auto" }}>{t("doorList", lang)}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: "#fbf6ee", border: "1px solid var(--line)", borderRadius: 9, padding: "6px 11px", width: 190 }}>
              <Icon name="search" size={14} color="var(--ink-faint)" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchGuest", lang)} style={{ border: 0, background: "transparent", outline: "none", fontSize: 12.5, fontFamily: "var(--font-ui)", width: "100%", color: "var(--ink)" }} />
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => setPresent(new Set(roster.map((m) => m.id)))}>{t("markAll", lang)}</button>
            <button className="btn btn-sm btn-ghost" onClick={() => setPresent(new Set())}>{t("clearAll", lang)}</button>
          </div>
          <div>
            {list.length === 0 && (
              <div style={{ padding: "30px 16px", textAlign: "center", color: "var(--ink-faint)", fontSize: 13 }}>
                {lang === "jp" ? "RSVPした参加者がいません。" : "No one has RSVP'd to this event yet."}
              </div>
            )}
            {list.map((m, i) => {
              const on = present.has(m.id);
              const tier = tierFor(m.points);
              return (
                <div
                  key={m.id}
                  onClick={() => toggle(m.id)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderBottom: i < list.length - 1 ? "1px solid var(--line-soft)" : "0", cursor: "pointer", background: on ? "var(--success-soft)" : "transparent" }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: tierColor[tier.key] || "var(--ink-faint)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontFamily: "var(--font-display)", fontSize: 13, flex: "0 0 34px" }}>
                    {m.name[0]?.toUpperCase() || "?"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{m.name} <span style={{ marginLeft: 2 }}>{m.country}</span></div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-faint)", fontWeight: 600 }}>{tier.key} · {m.points} {t("points", lang)}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700, color: on ? "var(--success)" : "var(--ink-faint)" }}>
                    {on ? t("present", lang) : ""}
                    <div style={{ width: 26, height: 26, borderRadius: "50%", border: on ? "0" : "2px solid var(--line)", background: on ? "var(--success)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {on && <Icon name="check" size={15} color="#fff" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
