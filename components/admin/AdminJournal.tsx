"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Cover } from "../Cover";
import { Icon } from "../Icon";
import { PageHead } from "./AdminShared";
import { CatPill, Byline } from "../journal/JournalParts";
import { deleteArticle } from "@/app/admin/actions";
import { t, val, fmtDate } from "@/lib/i18n";
import type { Article, Lang } from "@/lib/types";

export function AdminJournal({
  lang,
  articles,
  onNew,
  onEdit,
}: {
  lang: Lang;
  articles: Article[];
  onNew: () => void;
  onEdit: (a: Article) => void;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"all" | "published" | "draft">("all");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  const list = articles.filter((a) => (tab === "all" ? true : a.status === tab));

  const remove = (a: Article) =>
    startTransition(async () => {
      setMsg("");
      if (!confirm(t("deleteArticleQ", lang))) return;
      const res = await deleteArticle(a.id);
      if (res.error) setMsg(res.error);
      else router.refresh();
    });

  const th: React.CSSProperties = { textAlign: "left", fontWeight: 700, color: "var(--ink-soft)", fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", padding: "11px 14px", borderBottom: "1px solid var(--line)" };
  const td: React.CSSProperties = { padding: "12px 14px", borderBottom: "1px solid var(--line-soft)", verticalAlign: "middle" };

  return (
    <div className="adm-pad" style={{ padding: "26px 30px 40px" }}>
      <PageHead
        title={t("journalAdm", lang)}
        sub={lang === "jp" ? "記事の作成・編集・公開" : "Write, edit & publish articles"}
        cta={t("newArticle", lang)}
        ctaIcon="plus"
        onCta={onNew}
      />

      {msg && (
        <div style={{ background: "#f8e8e3", color: "var(--danger)", fontWeight: 600, fontSize: 13, borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>{msg}</div>
      )}

      <div className="seg" style={{ marginBottom: 18 }}>
        {([["all", t("allArticles", lang)], ["published", t("publishedTab", lang)], ["draft", t("draftTab", lang)]] as const).map(([k, label]) => (
          <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 16, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 760, tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th style={{ ...th, width: "36%" }}>{t("articleTitle", lang)}</th>
              <th style={{ ...th, width: "11%", whiteSpace: "nowrap" }}>{t("topicField", lang)}</th>
              <th style={{ ...th, width: "18%", whiteSpace: "nowrap" }}>{t("authorField", lang)}</th>
              <th style={{ ...th, width: "10%", whiteSpace: "nowrap" }}>{lang === "jp" ? "言語" : "Lang"}</th>
              <th style={{ ...th, width: "11%", whiteSpace: "nowrap" }}>{lang === "jp" ? "日付" : "Date"}</th>
              <th style={{ ...th, width: "10%", whiteSpace: "nowrap" }}>{lang === "jp" ? "状態" : "Status"}</th>
              <th style={{ ...th, width: "4%" }}></th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr><td style={{ ...td, textAlign: "center", color: "var(--ink-faint)", padding: "28px 14px" }} colSpan={7}>{t("noArticles", lang)}</td></tr>
            )}
            {list.map((a) => {
              const hasEn = !!(a.title.en && a.body.en);
              const hasJp = !!(a.title.jp && a.body.jp);
              return (
                <tr key={a.id} style={{ cursor: "pointer" }} onClick={() => onEdit(a)} className="tap-row">
                  <td style={td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: "0 0 52px", width: 52 }}><Cover seed={a.cover} h={38} radius={8} /></div>
                      <div style={{ flex: 1, minWidth: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: "var(--ink)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{val(a.title, lang) || t("untitledArticle", lang)}</div>
                    </div>
                  </td>
                  <td style={td}><CatPill catKey={a.category} lang={lang} /></td>
                  <td style={{ ...td, overflow: "hidden" }}><Byline name={a.authorName} authorKey={a.authorId || a.authorName} lang={lang} size={26} /></td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: 5 }}>
                      <LangDot on={hasEn} label="EN" />
                      <LangDot on={hasJp} label="日" />
                    </div>
                  </td>
                  <td style={{ ...td, whiteSpace: "nowrap", color: "var(--ink-soft)", fontWeight: 600 }}>{fmtDate(a.date, lang)}</td>
                  <td style={td}>
                    <span style={{ background: a.status === "published" ? "var(--success-soft)" : "#efe7d8", color: a.status === "published" ? "var(--success)" : "var(--ink-soft)", fontFamily: "var(--font-ui)", fontSize: 10.5, fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", padding: "4px 9px", borderRadius: 999, whiteSpace: "nowrap" }}>
                      {a.status === "published" ? (lang === "jp" ? "公開中" : "Published") : (lang === "jp" ? "下書き" : "Draft")}
                    </span>
                  </td>
                  <td style={{ ...td, textAlign: "right", whiteSpace: "nowrap" }}>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(a); }} title="Edit" style={iconBtn}><Icon name="edit" size={15} color="var(--ink-soft)" /></button>
                    <button disabled={pending} onClick={(e) => { e.stopPropagation(); remove(a); }} title="Delete" style={iconBtn}><Icon name="trash" size={15} color="var(--danger)" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const iconBtn: React.CSSProperties = { all: "unset", cursor: "pointer", width: 30, height: 30, borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", marginLeft: 4 };

function LangDot({ on, label }: { on: boolean; label: string }) {
  return <span style={{ fontFamily: "var(--font-ui)", fontSize: 10.5, fontWeight: 800, padding: "3px 7px", borderRadius: 6, background: on ? "var(--success-soft)" : "#f0e7d8", color: on ? "var(--success)" : "var(--ink-faint)" }}>{label}</span>;
}
