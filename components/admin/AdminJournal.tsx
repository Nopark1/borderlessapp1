"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Cover } from "../Cover";
import { Icon } from "../Icon";
import { PageHead } from "./AdminShared";
import { CatPill, Byline } from "../journal/JournalParts";
import { deleteArticle } from "@/app/admin/actions";
import { blogCats } from "@/lib/data";
import { t, val, fmtDate, fmtDuration } from "@/lib/i18n";
import type { Article, ArticleStat, BlogAnalytics, BlogCategory, Lang, NameCount } from "@/lib/types";

export function AdminJournal({
  lang,
  articles,
  articleStats,
  blogAnalytics,
  onNew,
  onEdit,
}: {
  lang: Lang;
  articles: Article[];
  articleStats: Record<string, ArticleStat>;
  blogAnalytics: BlogAnalytics;
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

      <BlogOverview lang={lang} ba={blogAnalytics} />

      <div className="seg" style={{ marginBottom: 18 }}>
        {([["all", t("allArticles", lang)], ["published", t("publishedTab", lang)], ["draft", t("draftTab", lang)]] as const).map(([k, label]) => (
          <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 16, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 760, tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th style={{ ...th, width: "31%" }}>{t("articleTitle", lang)}</th>
              <th style={{ ...th, width: "10%", whiteSpace: "nowrap" }}>{t("topicField", lang)}</th>
              <th style={{ ...th, width: "17%", whiteSpace: "nowrap" }}>{t("authorField", lang)}</th>
              <th style={{ ...th, width: "9%", whiteSpace: "nowrap" }}>{lang === "jp" ? "言語" : "Lang"}</th>
              <th style={{ ...th, width: "11%", whiteSpace: "nowrap" }}>{lang === "jp" ? "日付" : "Date"}</th>
              <th style={{ ...th, width: "10%", whiteSpace: "nowrap" }}>{lang === "jp" ? "状態" : "Status"}</th>
              <th style={{ ...th, width: "12%", whiteSpace: "nowrap" }}>{lang === "jp" ? "操作" : "Actions"}</th>
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
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: "var(--ink)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{val(a.title, lang) || t("untitledArticle", lang)}</div>
                        {(() => {
                          const s = articleStats[a.slug];
                          return (
                            <div style={{ fontSize: 11, color: "var(--ink-faint)", fontWeight: 600, marginTop: 4, display: "flex", gap: 10, flexWrap: "wrap" }}>
                              <span><Icon name="user" size={11} color="var(--ink-faint)" /> {s?.views ?? 0} {lang === "jp" ? "閲覧" : "views"}</span>
                              <span><Icon name="clock" size={11} color="var(--ink-faint)" /> {fmtDuration(s?.avgMs ?? 0)}</span>
                              <span>{Math.round((s?.ctr ?? 0) * 100)}% {lang === "jp" ? "クリック率" : "CTR"}</span>
                            </div>
                          );
                        })()}
                      </div>
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

/* ---- blog-wide analytics overview ---- */
function BlogOverview({ lang, ba }: { lang: Lang; ba: BlogAnalytics }) {
  const box: React.CSSProperties = { background: "#fbf6ee", border: "1px solid var(--line)", borderRadius: 11, padding: "12px 14px" };
  const topics: NameCount[] = ba.byTopic.map((x) => ({ name: (blogCats[x.name as BlogCategory] ? (lang === "jp" ? blogCats[x.name as BlogCategory].short.jp : blogCats[x.name as BlogCategory].short.en) : x.name), count: x.count }));
  return (
    <div className="metric" style={{ padding: "18px 20px", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Icon name="chart" size={18} color="var(--primary)" />
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>{t("blogOverview", lang)}</div>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--ink-faint)", fontWeight: 600 }}>{t("statNote", lang)}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 16 }}>
        <div style={box}><Metric label={t("statViews", lang)} value={String(ba.totalViews)} /></div>
        <div style={box}><Metric label={t("statReaders", lang)} value={String(ba.readers)} /></div>
        <div style={box}><Metric label={t("statTime", lang)} value={fmtDuration(ba.avgMs)} /></div>
        <div style={box}><Metric label={t("statCompletion", lang)} value={`${Math.round(ba.completionRate * 100)}%`} /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16 }}>
        <Panel title={t("statNewReturning", lang)}>
          <SplitBar segs={[{ label: t("statNew", lang), value: ba.newReaders, color: "var(--primary)" }, { label: t("statReturning", lang), value: ba.returningReaders, color: "var(--gold)" }]} />
        </Panel>
        <Panel title={t("statDevice", lang)}>
          <SplitBar segs={[{ label: t("statMobile", lang), value: ba.device.mobile, color: "var(--primary)" }, { label: t("statDesktop", lang), value: ba.device.desktop + ba.device.tablet, color: "var(--gold)" }]} />
        </Panel>
        <Panel title={t("statSources", lang)}><BarList items={ba.topSources} /></Panel>
        <Panel title={t("statByTopic", lang)}><BarList items={topics} /></Panel>
      </div>
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>{lang === "jp" ? "閲覧数（14日間）" : "Views (14 days)"}</div>
        <Sparkline data={ba.trend.map((d) => d.views)} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <>
      <div style={{ fontSize: 10.5, color: "var(--ink-soft)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--ink)", marginTop: 4 }}>{value}</div>
    </>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

function SplitBar({ segs }: { segs: { label: string; value: number; color: string }[] }) {
  const total = segs.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div>
      <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", background: "var(--line)" }}>
        {segs.map((s) => <div key={s.label} style={{ width: `${(s.value / total) * 100}%`, background: s.color }} />)}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
        {segs.map((s) => (
          <span key={s.label} style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-soft)", display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} /> {s.label} {s.value}
          </span>
        ))}
      </div>
    </div>
  );
}

function BarList({ items }: { items: NameCount[] }) {
  if (!items.length) return <div style={{ fontSize: 12, color: "var(--ink-faint)", fontWeight: 600 }}>—</div>;
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((i) => (
        <div key={i.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", width: 76, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textTransform: "capitalize" }}>{i.name}</span>
          <span style={{ flex: 1, height: 8, borderRadius: 4, background: "var(--line)", overflow: "hidden" }}>
            <span style={{ display: "block", height: "100%", width: `${(i.count / max) * 100}%`, background: "var(--primary)" }} />
          </span>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-soft)", width: 34, textAlign: "right" }}>{i.count}</span>
        </div>
      ))}
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const w = 100, h = 28, n = data.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: 40, display: "block" }}>
      {data.map((v, i) => {
        const bw = w / n;
        const bh = (v / max) * (h - 2);
        return <rect key={i} x={i * bw + 0.6} y={h - bh} width={Math.max(1, bw - 1.2)} height={bh} rx="0.6" fill="var(--primary)" opacity={0.85} />;
      })}
    </svg>
  );
}
