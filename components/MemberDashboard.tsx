"use client";

/* Member dashboard (ported from member.jsx). Receives derived data from the
   server; handles its own language toggle, invite-copy, and sign-out. */

import { useState } from "react";
import Link from "next/link";
import { Icon } from "./Icon";
import { Ring } from "./Ring";
import { Cover } from "./Cover";
import { inviteBonus } from "@/lib/formulas";
import { t, val, fmtDate } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import type { DashboardData } from "@/lib/member";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, marginBottom: 12, color: "var(--ink)" }}>
      {children}
    </div>
  );
}

export function MemberDashboard({ data }: { data: DashboardData }) {
  const [lang, setLang] = useState<Lang>("en");
  const [copied, setCopied] = useState(false);

  const firstName = data.name.split(" ")[0];
  const tierLabel = lang === "jp" ? data.tier.jp : data.tier.key;

  return (
    <div className="bl-root">
      {/* top bar */}
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

      <div className="bl-screen" style={{ background: "var(--paper)" }}>
        {/* header */}
        <div
          style={{
            background: "linear-gradient(160deg, var(--primary) 0%, var(--primary-d) 100%)",
            padding: "20px 20px 70px",
            borderRadius: "0 0 30px 30px",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div style={{ color: "rgba(255,255,255,.85)", fontSize: 13, fontWeight: 600 }}>
              {t("hi", lang)}, <b style={{ color: "#fff", fontFamily: "var(--font-display)" }}>{firstName}</b> 🎐
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {data.isAdmin && (
                <Link
                  href="/admin"
                  style={{ all: "unset", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 999, background: "rgba(255,255,255,.15)", color: "#fff", fontSize: 12, fontWeight: 700 }}
                >
                  <Icon name="chart" size={14} color="#fff" /> {t("admin", lang)}
                </Link>
              )}
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  title="Sign out"
                  style={{ all: "unset", cursor: "pointer", width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Icon name="arrowR" size={17} color="#fff" />
                </button>
              </form>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Ring value={data.progress} size={104} sw={9} color="#fff" track="rgba(255,255,255,.25)">
              <div style={{ textAlign: "center", color: "#fff" }}>
                <div className="stat-num" style={{ fontSize: 32 }}>{data.points}</div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", opacity: 0.85 }}>
                  {t("yourPoints", lang).toUpperCase()}
                </div>
              </div>
            </Ring>
            <div style={{ color: "#fff" }}>
              <div className="tag" style={{ background: "rgba(255,255,255,.92)", color: data.tier.color, marginBottom: 8, whiteSpace: "nowrap" }}>
                <Icon name="trophy" size={12} color={data.tier.color} /> {tierLabel}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                <Icon name="flame" size={15} color="#FFD27A" fill="#FFD27A" /> {data.streak} {t("streak", lang)}
              </div>
              {data.nextTier && (
                <div style={{ fontSize: 12, opacity: 0.85 }}>
                  {data.ptsToNext} {t("lockedPts", lang)} · {data.nextTier.key}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dash-content">
         <div className="dash-grid">
          <div>
          {/* quick stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
            <div className="card" style={{ padding: "16px" }}>
              <div className="stat-num" style={{ fontSize: 28, color: "var(--primary)" }}>{data.attended}</div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 600, marginTop: 4 }}>{t("eventsAtt", lang)}</div>
            </div>
            <div className="card" style={{ padding: "16px", display: "flex", alignItems: "center", gap: 12 }}>
              <Ring value={data.showRate} size={52} sw={6} color="var(--success)">
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--success)" }}>{data.showRate}%</span>
              </Ring>
              <div style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 600 }}>{t("showRate", lang)}</div>
            </div>
          </div>

          {/* how points work */}
          <div className="card" style={{ padding: "13px 15px", marginBottom: 13, background: "var(--gold-soft)", border: "1px solid var(--gold)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <Icon name="star" size={15} color="var(--gold)" fill="var(--gold)" />
              <span style={{ fontWeight: 800, fontSize: 13.5, whiteSpace: "nowrap" }}>{t("howPoints", lang)}</span>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>{t("pointsRule", lang)}</div>
          </div>

          {/* invite a friend */}
          <div className="card" style={{ padding: "15px 16px", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 38px" }}>
                <Icon name="users" size={18} color="var(--primary)" />
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, fontFamily: "var(--font-display)", whiteSpace: "nowrap" }}>{t("inviteFriend", lang)}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 13 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12.5 }}>
                <span style={{ background: "var(--success)", color: "#fff", fontWeight: 800, fontSize: 11, padding: "3px 9px", borderRadius: 7, whiteSpace: "nowrap" }}>+{inviteBonus.fresh} pt</span>
                <span style={{ color: "var(--ink-soft)", fontWeight: 600 }}>{t("inviteRule1", lang)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12.5 }}>
                <span style={{ background: "var(--gold)", color: "#fff", fontWeight: 800, fontSize: 11, padding: "3px 9px", borderRadius: 7, whiteSpace: "nowrap" }}>+{inviteBonus.returning} pt</span>
                <span style={{ color: "var(--ink-soft)", fontWeight: 600 }}>{t("inviteRule2", lang)}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
              <div style={{ flex: 1, border: "1.5px dashed var(--line)", borderRadius: 10, padding: "9px 13px", fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: ".12em", color: "var(--primary)", fontSize: 14 }}>
                {data.inviteCode}
              </div>
              <button
                className="btn btn-dark btn-sm"
                onClick={() => {
                  try {
                    navigator.clipboard?.writeText(data.inviteCode);
                  } catch {}
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                {copied ? t("copied", lang) : t("copyCode", lang)}
              </button>
            </div>
          </div>

          {/* next events */}
          <SectionTitle>{t("nextUp", lang)}</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            {data.upcoming.length === 0 && (
              <div className="card" style={{ padding: "18px 16px", textAlign: "center", color: "var(--ink-faint)", fontSize: 13 }}>
                {lang === "jp" ? "参加予定はまだありません。" : "No upcoming events yet."}{" "}
                <Link href="/" style={{ color: "var(--primary)", fontWeight: 700 }}>
                  {t("browse", lang)}
                </Link>
              </div>
            )}
            {data.upcoming.map((e) => (
              <Link
                key={e.id}
                href="/"
                className="card"
                style={{ all: "unset", cursor: "pointer", display: "flex", gap: 13, padding: 11, alignItems: "center", border: "1px solid var(--line)", borderRadius: "var(--radius)", background: "var(--surface)" }}
              >
                <div style={{ flex: "0 0 62px", width: 62 }}>
                  <Cover seed={e.cover} h={62} radius={12} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, fontFamily: "var(--font-display)" }}>{val(e.title, lang)}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 600, marginTop: 3, display: "flex", gap: 10, whiteSpace: "nowrap" }}>
                    <span>
                      <Icon name="calendar" size={11} color="var(--primary)" /> {fmtDate(e.date, lang)}
                    </span>
                  </div>
                  <span className="tag" style={{ marginTop: 8, display: "inline-flex", background: "var(--success-soft)", color: "var(--success)" }}>
                    <Icon name="check" size={11} color="var(--success)" /> {t("youreIn", lang)}
                  </span>
                </div>
                <Icon name="arrowR" size={18} color="var(--ink-faint)" />
              </Link>
            ))}
          </div>
          </div>{/* end column A */}

          <div>
          {/* rewards */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17 }}>{t("rewardsT", lang)}</div>
            <span style={{ fontSize: 12, color: "var(--gold)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Icon name="star" size={13} color="var(--gold)" fill="var(--gold)" /> {data.points} {t("points", lang)}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.rewards.map((r) => {
              const can = data.points >= r.cost;
              return (
                <div key={r.id} className="card" style={{ padding: "13px 14px", display: "flex", alignItems: "center", gap: 12, opacity: can ? 1 : 0.62 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: can ? "var(--gold-soft)" : "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 42px" }}>
                    <Icon name="gift" size={20} color={can ? "var(--gold)" : "var(--ink-faint)"} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{val(r.title, lang)}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-faint)", fontWeight: 600, marginTop: 2 }}>{r.cost} {t("points", lang)}</div>
                  </div>
                  {r.tag && (
                    <span className="tag" style={{ background: r.tag === "limited" ? "var(--primary-soft)" : "var(--gold-soft)", color: r.tag === "limited" ? "var(--primary)" : "var(--gold)" }}>
                      {r.tag}
                    </span>
                  )}
                  <button
                    className="btn btn-sm"
                    disabled={!can}
                    style={{ background: can ? "var(--ink)" : "var(--surface-2)", color: can ? "#f6efe2" : "var(--ink-faint)", cursor: can ? "pointer" : "default" }}
                  >
                    {t("redeem", lang)}
                  </button>
                </div>
              );
            })}
          </div>

          {/* attendance history */}
          <div style={{ marginTop: 24 }}>
            <SectionTitle>{t("history", lang)}</SectionTitle>
          </div>
          <div className="card" style={{ padding: "6px 16px" }}>
            {data.history.length === 0 && (
              <div style={{ padding: "14px 0", textAlign: "center", color: "var(--ink-faint)", fontSize: 13 }}>
                {lang === "jp" ? "まだ参加履歴がありません。" : "No attendance history yet."}
              </div>
            )}
            {data.history.map((h, i) => (
              <div
                key={h.event.id}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < data.history.length - 1 ? "1px solid var(--line-soft)" : "0" }}
              >
                <div
                  style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 32px", background: h.went ? "var(--success-soft)" : "var(--surface-2)" }}
                >
                  <Icon name={h.went ? "check" : "x"} size={15} color={h.went ? "var(--success)" : "var(--ink-faint)"} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{val(h.event.title, lang)}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-faint)", fontWeight: 600 }}>{fmtDate(h.event.date, lang)}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: h.went ? "var(--success)" : "var(--ink-faint)" }}>
                  {h.went ? `+${h.points} ${t("points", lang)}` : t("missed", lang)}
                </span>
              </div>
            ))}
          </div>
          </div>{/* end column B */}
         </div>{/* end dash-grid */}
        </div>
      </div>
    </div>
  );
}
