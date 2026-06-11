"use client";

import { useState } from "react";
import { Icon } from "../Icon";
import { t } from "@/lib/i18n";
import { isPast } from "@/lib/formulas";
import type { Event, EventStatus, Lang } from "@/lib/types";

export function PageHead({
  title,
  sub,
  cta,
  ctaIcon,
  onCta,
}: {
  title: string;
  sub: string;
  cta?: string;
  ctaIcon?: string;
  onCta?: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 22, gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 28 }}>{title}</h1>
        <div style={{ color: "var(--ink-faint)", fontSize: 13.5, fontWeight: 600, marginTop: 4 }}>{sub}</div>
      </div>
      {cta && (
        <button className="btn btn-primary btn-sm" style={{ padding: "10px 16px", flex: "0 0 auto" }} onClick={onCta}>
          <Icon name={ctaIcon || "plus"} size={15} color="#fff" /> {cta}
        </button>
      )}
    </div>
  );
}

export function StatusPill({ status, lang }: { status: EventStatus; lang: Lang }) {
  const map: Record<EventStatus, { t: string; c: string; bg: string }> = {
    published: { t: t("published", lang), c: "var(--success)", bg: "var(--success-soft)" },
    draft: { t: t("draft", lang), c: "var(--ink-soft)", bg: "var(--surface-2)" },
    completed: { t: t("completed", lang), c: "var(--info)", bg: "#e3e9f0" },
  };
  const m = map[status] || map.published;
  return (
    <span className="tag" style={{ background: m.bg, color: m.c }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.c }} /> {m.t}
    </span>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 9,
        padding: "9px 11px", borderRadius: 8, fontSize: 13, fontWeight: 600,
        color: danger ? "var(--danger)" : "var(--ink)", width: "100%", boxSizing: "border-box",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = danger ? "#f7e7e2" : "var(--surface-2)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <Icon name={icon} size={15} color={danger ? "var(--danger)" : "var(--ink-soft)"} /> {label}
    </button>
  );
}

export function EventMenu({
  e,
  lang,
  onTop,
  onEdit,
  onCheckin,
  onDuplicate,
  onDelete,
}: {
  e: Event;
  lang: Lang;
  onTop?: boolean;
  onEdit: () => void;
  onCheckin: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const stop =
    (fn?: () => void) =>
    (ev: React.MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
      fn?.();
    };
  const close = () => {
    setOpen(false);
    setConfirm(false);
  };
  const past = isPast(e);
  return (
    <div style={{ position: "relative" }} onClick={stop()}>
      <button
        onClick={stop(() => setOpen((o) => !o))}
        title="Actions"
        style={{
          all: "unset", cursor: "pointer", width: 30, height: 30, borderRadius: 9,
          background: onTop ? "rgba(255,255,255,.92)" : "var(--surface-2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: onTop ? "var(--shadow-sm)" : "none",
        }}
      >
        <Icon name="dots" size={17} color="var(--ink)" fill="var(--ink)" sw={0} />
      </button>
      {open && (
        <>
          <div onClick={stop(close)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
          <div
            style={{
              position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 50,
              background: "#fff", border: "1px solid var(--line)", borderRadius: 12,
              boxShadow: "var(--shadow-lg)", minWidth: 178, padding: 6,
            }}
          >
            <MenuItem icon="edit" label={t("editEvent", lang)} onClick={() => { close(); onEdit(); }} />
            {!past && <MenuItem icon="checkCircle" label={t("checkIn", lang)} onClick={() => { close(); onCheckin(); }} />}
            <MenuItem icon="copy" label={t("duplicate", lang)} onClick={() => { close(); onDuplicate(); }} />
            <div style={{ height: 1, background: "var(--line-soft)", margin: "5px 4px" }} />
            {!confirm ? (
              <MenuItem icon="trash" label={t("deleteE", lang)} danger onClick={() => setConfirm(true)} />
            ) : (
              <MenuItem icon="trash" label={t("confirmDel", lang)} danger onClick={() => { close(); onDelete(); }} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
