"use client";

import { useMemo, useState } from "react";
import { Icon } from "../Icon";
import { PageHead } from "./AdminShared";
import { yen } from "@/lib/formulas";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import type { MemberRow } from "@/lib/admin-stats";

function Metric({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="metric">
      <div className="ml">{label}</div>
      <div className="mv" style={{ color: accent || "var(--ink)" }}>{value}</div>
      {sub && <div className="md" style={{ color: "var(--ink-faint)" }}>{sub}</div>}
    </div>
  );
}

const tierColor: Record<string, string> = { Insider: "var(--primary)", Regular: "var(--gold)", Guest: "var(--ink-faint)" };

export function AdminMembers({ lang, members }: { lang: Lang; members: MemberRow[] }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => members.filter((m) => m.name.toLowerCase().includes(q.toLowerCase())), [members, q]);

  const active = members.filter((m) => m.status === "active").length;
  const lapsing = members.filter((m) => m.status === "lapsing").length;
  const totalSpend = members.reduce((s, m) => s + m.spend, 0);
  const repeat = members.length ? Math.round((members.filter((m) => m.attended >= 3).length / members.length) * 100) : 0;

  return (
    <div className="adm-pad" style={{ padding: "26px 30px 40px" }}>
      <PageHead title={t("membersAdm", lang)} sub={`${members.length} ${t("allMembers", lang)}`} />

      <div className="metric-grid" style={{ marginBottom: 22 }}>
        <Metric label={t("activeMembers", lang)} value={active} sub={lang === "jp" ? "直近60日に参加" : "active last 60 days"} />
        <Metric label={t("retention", lang)} value={repeat + "%"} sub={lang === "jp" ? "3回以上参加" : "attended 3+ events"} accent="var(--success)" />
        <Metric label={t("lifetimeSpend", lang)} value={yen(totalSpend)} sub={lang === "jp" ? "全会員合計" : "all members"} />
        <Metric label={lang === "jp" ? "離脱傾向" : "Lapsing"} value={lapsing} sub={lang === "jp" ? "再アプローチ推奨" : "worth re-inviting"} accent="var(--danger)" />
      </div>

      <div className="metric" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fbf6ee", border: "1px solid var(--line)", borderRadius: 9, padding: "7px 12px", flex: 1, maxWidth: 320 }}>
            <Icon name="search" size={15} color="var(--ink-faint)" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search", lang)} style={{ border: 0, background: "transparent", outline: "none", fontSize: 13, fontFamily: "var(--font-ui)", width: "100%", color: "var(--ink)" }} />
          </div>
          <span style={{ fontSize: 12, color: "var(--ink-faint)", fontWeight: 600 }}>{list.length} {lang === "jp" ? "件" : "results"}</span>
        </div>
        <div className="tbl-wrap" style={{ maxHeight: 420, overflowY: "auto" }}>
          <table className="tbl">
            <thead style={{ position: "sticky", top: 0, background: "#fff", zIndex: 2 }}>
              <tr>
                <th>{t("member", lang)}</th><th>{t("tier", lang)}</th>
                <th>{t("eventsAtt", lang)}</th><th>{t("yourPoints", lang)}</th>
                <th style={{ textAlign: "right" }}>{t("lifetimeSpend", lang)}</th>
                <th>{t("lastSeen", lang)}</th><th>{t("status", lang)}</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--ink-faint)", padding: "26px 0" }}>{lang === "jp" ? "会員がいません。" : "No members yet."}</td></tr>
              )}
              {list.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: tierColor[m.tier], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontFamily: "var(--font-display)", fontSize: 13, flex: "0 0 32px" }}>{m.name[0]?.toUpperCase() || "?"}</div>
                      <div style={{ fontWeight: 700 }}>{m.name} <span style={{ marginLeft: 2 }}>{m.country}</span></div>
                    </div>
                  </td>
                  <td><span className="tag" style={{ background: tierColor[m.tier] + "1f", color: tierColor[m.tier] }}>{m.tier}</span></td>
                  <td style={{ fontWeight: 600 }}>{m.attended}</td>
                  <td style={{ fontWeight: 700, color: "var(--gold)" }}>{m.points}</td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>{yen(m.spend)}</td>
                  <td style={{ color: "var(--ink-soft)", fontSize: 12 }}>{m.lastEvent}</td>
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: m.status === "active" ? "var(--success)" : "var(--danger)" }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: m.status === "active" ? "var(--success)" : "var(--danger)" }} />
                      {m.status === "active" ? t("active", lang) : t("lapsing", lang)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
