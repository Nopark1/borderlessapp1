"use client";

import { Cover } from "../Cover";
import { BarPairChart, LineChart } from "../Charts";
import { PageHead } from "./AdminShared";
import { finOf, pointsFor, yen } from "@/lib/formulas";
import { t, val, fmtDate } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import type { OverviewData } from "@/lib/admin-stats";

function Metric({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="metric">
      <div className="ml">{label}</div>
      <div className="mv" style={{ color: accent || "var(--ink)" }}>{value}</div>
      {sub && <div className="md" style={{ color: "var(--ink-faint)" }}>{sub}</div>}
    </div>
  );
}

function Legend({ items }: { items: [string, string][] }) {
  return (
    <div style={{ display: "flex", gap: 14 }}>
      {items.map(([l, c]) => (
        <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--ink-soft)" }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: c }} /> {l}
        </span>
      ))}
    </div>
  );
}

export function AdminOverview({ lang, data }: { lang: Lang; data: OverviewData }) {
  return (
    <div style={{ padding: "26px 30px 40px" }}>
      <PageHead title={t("overview", lang)} sub={lang === "jp" ? "全体の状況" : "Circle health"} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 16 }}>
        <Metric label={t("revenue", lang)} value={yen(data.revenue)} sub={lang === "jp" ? "終了イベント合計" : "completed events"} />
        <Metric label={t("costs", lang)} value={yen(data.costs)} sub={lang === "jp" ? "終了イベント合計" : "completed events"} />
        <Metric label={t("netProfit", lang)} value={yen(data.net)} accent={data.net >= 0 ? "var(--success)" : "var(--danger)"} sub={t("revenue", lang).toLowerCase() + " − " + t("costs", lang).toLowerCase()} />
        <Metric label={t("showupRate", lang)} value={data.showRate + "%"} accent="var(--primary)" sub={`${data.invitedTotal} → ${data.attendedTotal}`} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <Metric label={t("activeMembers", lang)} value={data.activeMembers} sub={lang === "jp" ? "登録会員" : "total members"} />
        <Metric label={t("invited", lang) + " → " + t("came", lang)} value={`${data.invitedTotal} → ${data.attendedTotal}`} sub={lang === "jp" ? "全終了イベント" : "all past events"} />
        <Metric label={t("ptsIssued", lang)} value={data.pointsIssued} sub={`${data.pointsRedeemed} ${t("ptsRedeemed", lang).toLowerCase()}`} />
        <Metric label={t("avgPerHead", lang)} value={yen(data.avgPerHead)} sub={lang === "jp" ? "参加者1人あたり売上" : "revenue per attendee"} />
      </div>

      {/* charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 16, marginBottom: 24 }}>
        <div className="metric" style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>{t("revVsCost", lang)}</div>
            <Legend items={[[t("revenue", lang), "var(--primary)"], [t("costs", lang), "var(--gold)"]]} />
          </div>
          <BarPairChart data={data.months} keys={["revenue", "costs"]} colors={["var(--primary)", "var(--gold)"]} w={560} h={190} />
        </div>
        <div className="metric" style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>{t("memberGrowth", lang)}</div>
          </div>
          <LineChart data={data.months} field="members" w={480} h={190} color="var(--info)" />
        </div>
      </div>

      {/* per-event table */}
      <div className="metric" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 22px 12px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>{t("perEvent", lang)}</div>
        <table className="tbl">
          <thead>
            <tr>
              <th>{t("event", lang)}</th><th>{t("invited", lang)}</th><th>{t("came", lang)}</th>
              <th>{t("showupRate", lang)}</th><th style={{ textAlign: "right" }}>{t("revenue", lang)}</th>
              <th style={{ textAlign: "right" }}>{t("costs", lang)}</th><th style={{ textAlign: "right" }}>{t("net", lang)}</th>
            </tr>
          </thead>
          <tbody>
            {data.past.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--ink-faint)", padding: "22px 0" }}>{lang === "jp" ? "データがまだありません。" : "No completed events yet."}</td></tr>
            )}
            {data.past.map((e) => {
              const f = finOf(e);
              const rate = e.invited ? Math.round(((e.attended || 0) / e.invited) * 100) : 0;
              return (
                <tr key={e.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <div style={{ flex: "0 0 40px", width: 40 }}><Cover seed={e.cover} h={32} radius={8} /></div>
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
                  <td style={{ textAlign: "right", fontWeight: 600 }}>{yen(f.revenue)}</td>
                  <td style={{ textAlign: "right", color: "var(--ink-soft)" }}>{yen(f.costs)}</td>
                  <td style={{ textAlign: "right", fontWeight: 800, color: f.net >= 0 ? "var(--success)" : "var(--danger)" }}>{yen(f.net)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
