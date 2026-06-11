"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "../Icon";
import { AdminEvents } from "./AdminEvents";
import { AdminOverview } from "./AdminOverview";
import { AdminMembers } from "./AdminMembers";
import { AdminRewards } from "./AdminRewards";
import { EventStudio } from "./EventStudio";
import { duplicateEvent, deleteEvent } from "@/app/admin/actions";
import { t } from "@/lib/i18n";
import type { Event, Lang, Reward } from "@/lib/types";
import type { OverviewData, MemberRow } from "@/lib/admin-stats";

type Tab = "overview" | "events" | "members" | "rewards";
type Editor = Event | "new" | null;

export function AdminApp({
  initialEvents,
  overview,
  members,
  rewards,
  email,
}: {
  initialEvents: Event[];
  overview: OverviewData;
  members: MemberRow[];
  rewards: Reward[];
  email: string;
}) {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");
  const [tab, setTab] = useState<Tab>("events");
  const [editor, setEditor] = useState<Editor>(null);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  const busy = editor !== null;

  const openNew = () => { setEditor("new"); };
  const onSaved = () => { setEditor(null); setTab("events"); router.refresh(); };
  const onCheckin = (id: string) => router.push(`/admin/checkin/${id}`);

  const onDuplicate = (id: string) =>
    startTransition(async () => {
      const r = await duplicateEvent(id);
      if (r.error) setMsg(r.error);
      router.refresh();
    });
  const onDelete = (id: string) =>
    startTransition(async () => {
      const r = await deleteEvent(id);
      if (r.error) setMsg(r.error);
      router.refresh();
    });

  const nav: { k: Tab; i: string; label: string }[] = [
    { k: "overview", i: "grid", label: t("overview", lang) },
    { k: "events", i: "calendar", label: t("eventsAdm", lang) },
    { k: "members", i: "users", label: t("membersAdm", lang) },
    { k: "rewards", i: "gift", label: t("rewardsT", lang) },
  ];

  return (
    <div className="admin-shell">
      {/* sidebar */}
      <div className="adm-side">
        <div className="adm-brand" style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 10px 18px" }}>
          <span className="bl-emblem" style={{ width: 34, height: 34, flex: "0 0 34px" }} aria-hidden="true">
            <Icon name="globe" size={18} color="#fff" />
          </span>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "#f6efe2", letterSpacing: ".1em", fontSize: 15 }}>BORDERLESS</div>
            <div style={{ fontSize: 9.5, letterSpacing: ".2em", color: "#9a8b7d", textTransform: "uppercase" }}>{lang === "jp" ? "管理画面" : "Admin"}</div>
          </div>
        </div>
        {nav.map((n) => (
          <div
            key={n.k}
            className={"nav-i" + (tab === n.k && !busy ? " on" : "")}
            onClick={() => { setEditor(null); setTab(n.k); }}
          >
            <Icon name={n.i} size={17} color={tab === n.k && !busy ? "#fff" : "#c9bcab"} /> {n.label}
          </div>
        ))}
        <button
          onClick={openNew}
          className="adm-newbtn"
          style={{ all: "unset", cursor: "pointer", marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", borderRadius: 11, background: busy ? "var(--primary)" : "rgba(255,255,255,.08)", color: "#fff", fontSize: 13, fontWeight: 700 }}
        >
          <Icon name="plus" size={16} color="#fff" /> {t("newEvent", lang)}
        </button>

        <div className="adm-foot">
          <div className="lang-toggle" style={{ marginBottom: 12 }}>
            <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
            <button className={lang === "jp" ? "on" : ""} onClick={() => setLang("jp")}>日本</button>
          </div>
          <div className="adm-foot-user" style={{ padding: "14px 12px 0", borderTop: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/me" title="Member view" style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, fontFamily: "var(--font-display)", flex: "0 0 30px" }}>
              {(email[0] || "B").toUpperCase()}
            </Link>
            <div style={{ lineHeight: 1.15, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#f2ebdd", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 130 }}>{email}</div>
              <form action="/auth/signout" method="post">
                <button type="submit" style={{ all: "unset", cursor: "pointer", fontSize: 10.5, color: "#9a8b7d" }}>
                  {lang === "jp" ? "ログアウト" : "Sign out"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* main */}
      <div className="adm-main">
        {msg && (
          <div style={{ background: "#f8e8e3", color: "var(--danger)", fontWeight: 600, fontSize: 13, padding: "10px 30px" }}>
            {msg} <button onClick={() => setMsg("")} style={{ all: "unset", cursor: "pointer", textDecoration: "underline", marginLeft: 8 }}>dismiss</button>
          </div>
        )}
        {editor !== null ? (
          <EventStudio lang={lang} initial={editor === "new" ? null : editor} onClose={() => setEditor(null)} onSaved={onSaved} />
        ) : tab === "events" ? (
          <AdminEvents lang={lang} events={initialEvents} onNew={openNew} onEdit={(e) => setEditor(e)} onCheckin={onCheckin} onDuplicate={onDuplicate} onDelete={onDelete} />
        ) : tab === "overview" ? (
          <AdminOverview lang={lang} data={overview} />
        ) : tab === "members" ? (
          <AdminMembers lang={lang} members={members} />
        ) : (
          <AdminRewards lang={lang} rewards={rewards} />
        )}
        {pending && (
          <div style={{ position: "fixed", bottom: 18, right: 18, background: "var(--ink)", color: "#f6efe2", padding: "8px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, boxShadow: "var(--shadow-lg)" }}>
            {lang === "jp" ? "更新中…" : "Working…"}
          </div>
        )}
      </div>
    </div>
  );
}
