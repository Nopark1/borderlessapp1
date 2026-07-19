"use client";

import { useState, useTransition } from "react";
import { Cover } from "../Cover";
import { Icon } from "../Icon";
import { CatPill, Byline } from "../journal/JournalParts";
import { covers, blogCats } from "@/lib/data";
import { saveArticle } from "@/app/admin/actions";
import { t } from "@/lib/i18n";
import type { Article, ArticleInput, AdminAuthor, BlogCategory, Lang } from "@/lib/types";

const CAT_KEYS = Object.keys(blogCats) as BlogCategory[];
const COVER_KEYS = Object.keys(covers);

export function ArticleStudio({
  lang,
  initial,
  authors,
  onClose,
  onSaved,
}: {
  lang: Lang;
  initial: Article | null;
  authors: AdminAuthor[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = !!initial;
  const [f, setF] = useState(() => ({
    cover: initial?.cover || "lantern",
    category: (initial?.category || "living") as BlogCategory,
    authorId: initial?.authorId ?? (authors[0]?.id ?? null),
    authorName: initial?.authorName || authors[0]?.name || "Borderless",
    authorRole: initial?.authorRole || "",
    readMin: initial?.readMin || 6,
    titleEn: initial?.title.en || "", titleJp: initial?.title.jp || "",
    excEn: initial?.excerpt.en || "", excJp: initial?.excerpt.jp || "",
    bodyEn: initial?.body.en || "", bodyJp: initial?.body.jp || "",
  }));
  const [clang, setClang] = useState<Lang>("en");
  const [plang, setPlang] = useState<Lang>("en");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const set = (k: string, v: unknown) => setF((s) => ({ ...s, [k]: v }));

  const isEn = clang === "en";
  const suf = isEn ? "En" : "Jp";
  const hasEn = !!(f.titleEn && f.bodyEn);
  const hasJp = !!(f.titleJp && f.bodyJp);

  // author dropdown: keep the current author selectable even if not an admin now
  const knownIds = new Set(authors.map((a) => a.id));
  const currentUnlisted = !!f.authorName && (!f.authorId || !knownIds.has(f.authorId));
  const selectValue = currentUnlisted ? "__keep" : f.authorId || "";
  const onAuthor = (v: string) => {
    if (v === "__keep") return;
    const a = authors.find((x) => x.id === v);
    if (a) setF((s) => ({ ...s, authorId: a.id, authorName: a.name }));
  };

  const pTitle = plang === "en" ? f.titleEn || f.titleJp : f.titleJp || f.titleEn;
  const pExc = plang === "en" ? f.excEn || f.excJp : f.excJp || f.excEn;
  const pBody = plang === "en" ? f.bodyEn || f.bodyJp : f.bodyJp || f.bodyEn;
  const pFirst = (pBody || "").split(/\n\n+/)[0] || "";

  const buildInput = (status: "draft" | "published"): ArticleInput => ({
    id: initial?.id,
    slug: initial?.slug,
    cover: f.cover,
    category: f.category,
    authorId: f.authorId,
    authorName: f.authorName,
    authorRole: f.authorRole.trim(),
    readMin: Number(f.readMin) || 1,
    status,
    titleEn: f.titleEn, titleJp: f.titleJp,
    excerptEn: f.excEn, excerptJp: f.excJp,
    bodyEn: f.bodyEn, bodyJp: f.bodyJp,
  });

  const save = (status: "draft" | "published") =>
    startTransition(async () => {
      setError("");
      if (!f.titleEn && !f.titleJp) {
        setError(lang === "jp" ? "タイトルを入力してください。" : "Add a title first.");
        return;
      }
      const res = await saveArticle(buildInput(status));
      if (res.error) setError(res.error);
      else onSaved();
    });

  const fld: React.CSSProperties = { width: "100%", padding: "11px 13px", borderRadius: 10, border: "1.5px solid var(--line)", background: "#fbf6ee", fontSize: 14, fontFamily: "var(--font-ui)", color: "var(--ink)", outline: "none", boxSizing: "border-box" };
  const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 6, display: "block" };
  const sec: React.CSSProperties = { background: "#fff", border: "1px solid var(--line)", borderRadius: 16, padding: "18px 20px", marginBottom: 16 };
  const secTitle: React.CSSProperties = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 };

  return (
    <div className="studio">
      {/* form column */}
      <div className="studio-form">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <button onClick={onClose} style={{ all: "unset", cursor: "pointer", width: 38, height: 38, borderRadius: 11, background: "#fff", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="arrowL" size={19} color="var(--ink)" />
            </button>
            <div>
              <h1 style={{ fontSize: 24 }}>{editing ? t("editArticle", lang) : t("writePost", lang)}</h1>
              <div style={{ color: "var(--ink-faint)", fontSize: 12.5, fontWeight: 600, marginTop: 2 }}>
                {editing ? (initial!.status === "draft" ? t("articleDraftHidden", lang) : t("articleLive", lang)) : t("articleOnceLive", lang)}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {(!editing || initial!.status === "draft") && <button className="btn btn-ghost btn-sm" disabled={pending} onClick={() => save("draft")}>{t("saveDraft", lang)}</button>}
            {editing && initial!.status === "published" && <button className="btn btn-ghost btn-sm" disabled={pending} onClick={() => save("draft")}>{t("unpublish", lang)}</button>}
            <button className="btn btn-primary btn-sm" disabled={pending} onClick={() => save("published")}>
              <Icon name="check" size={15} color="#fff" /> {editing ? (initial!.status === "draft" ? t("publishArticle", lang) : t("saveChanges", lang)) : t("publishArticle", lang)}
            </button>
          </div>
        </div>

        {error && <div style={{ background: "#f8e8e3", color: "var(--danger)", fontWeight: 600, fontSize: 13, borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>{error}</div>}

        {/* content language switch */}
        <div style={sec}>
          <div style={secTitle}><Icon name="globe" size={16} color="var(--primary)" /> {t("contentLang", lang)}</div>
          <div className="seg" style={{ display: "flex" }}>
            <button className={isEn ? "on" : ""} onClick={() => setClang("en")} style={{ flex: 1 }}>English {hasEn && "✓"}</button>
            <button className={!isEn ? "on" : ""} onClick={() => setClang("jp")} style={{ flex: 1 }}>日本語 {hasJp && "✓"}</button>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ink-faint)", fontWeight: 600, marginTop: 10 }}>{t("bothLangsHint", lang)}</div>
        </div>

        {/* writing fields for the selected language */}
        <div style={sec}>
          <div style={secTitle}><Icon name="edit" size={16} color="var(--primary)" /> {isEn ? t("enVersion", lang) : t("jpVersion", lang)}</div>
          <label style={{ display: "block", marginBottom: 14 }}>
            <span style={lbl}>{t("titleField", lang)}</span>
            <input style={{ ...fld, fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }} value={f["title" + suf as "titleEn" | "titleJp"]} onChange={(e) => set("title" + suf, e.target.value)} placeholder={isEn ? "Cracking the Japanese résumé" : "日本の履歴書攻略"} />
          </label>
          <label style={{ display: "block", marginBottom: 14 }}>
            <span style={lbl}>{t("excerptField", lang)}</span>
            <textarea style={{ ...fld, height: 60, resize: "vertical" }} value={f["exc" + suf as "excEn" | "excJp"]} onChange={(e) => set("exc" + suf, e.target.value)} placeholder={isEn ? "One-line teaser shown in the list…" : "一覧に表示される一文の紹介…"} />
          </label>
          <label style={{ display: "block" }}>
            <span style={lbl}>{t("bodyField", lang)}</span>
            <textarea style={{ ...fld, height: 260, resize: "vertical", lineHeight: 1.6 }} value={f["body" + suf as "bodyEn" | "bodyJp"]} onChange={(e) => set("body" + suf, e.target.value)} placeholder={isEn ? "Write the article… (blank line = new paragraph)" : "記事を書く…（空行で段落）"} />
          </label>
        </div>

        {/* meta */}
        <div style={sec}>
          <div style={secTitle}><Icon name="sparkle" size={16} color="var(--primary)" /> {lang === "jp" ? "設定" : "Details"}</div>
          <span style={lbl}>{t("coverField", lang)}</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {COVER_KEYS.map((k) => (
              <button key={k} onClick={() => set("cover", k)} style={{ all: "unset", cursor: "pointer", width: 62, height: 40, borderRadius: 9, overflow: "hidden", boxShadow: f.cover === k ? "0 0 0 2.5px var(--primary)" : "0 0 0 1.5px var(--line)" }}>
                <Cover seed={k} h={40} />
              </button>
            ))}
          </div>
          <span style={lbl}>{t("topicField", lang)}</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {CAT_KEYS.map((k) => {
              const c = blogCats[k], on = f.category === k;
              return (
                <button key={k} onClick={() => set("category", k)} style={{ all: "unset", cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: 12.5, fontWeight: 700, padding: "8px 13px", borderRadius: 999, border: on ? "1.5px solid " + c.color : "1.5px solid var(--line)", background: on ? c.color : "#fff", color: on ? "#fff" : "var(--ink-soft)" }}>
                  {c.emoji} {lang === "jp" ? c.jp : c.en}
                </button>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14, marginBottom: 14 }}>
            <label>
              <span style={lbl}>{t("authorField", lang)}</span>
              <div style={{ ...fld, display: "flex", alignItems: "center", gap: 10, padding: "6px 10px 6px 6px" }}>
                <span style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, flex: "0 0 30px" }}>{(f.authorName || "B").charAt(0).toUpperCase()}</span>
                <select value={selectValue} onChange={(e) => onAuthor(e.target.value)} style={{ flex: 1, border: 0, background: "transparent", outline: "none", fontFamily: "var(--font-ui)", fontSize: 14, fontWeight: 700, color: "var(--ink)", cursor: "pointer" }}>
                  {currentUnlisted && <option value="__keep">{f.authorName}</option>}
                  {authors.length === 0 && !currentUnlisted && <option value="">{lang === "jp" ? "管理者なし" : "No admins"}</option>}
                  {authors.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}
                </select>
              </div>
            </label>
            <label>
              <span style={lbl}>{t("readTimeField", lang)}</span>
              <div style={{ ...fld, display: "flex", alignItems: "center", gap: 8, padding: "0 12px" }}>
                <input type="number" min={1} value={f.readMin} onChange={(e) => set("readMin", Number(e.target.value))} style={{ flex: 1, border: 0, background: "transparent", outline: "none", fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--ink)", padding: "11px 0" }} />
                <span style={{ fontSize: 12, color: "var(--ink-faint)", fontWeight: 700, whiteSpace: "nowrap" }}>{t("minRead", lang)}</span>
              </div>
            </label>
          </div>
          <label style={{ display: "block" }}>
            <span style={lbl}>{t("roleField", lang)}</span>
            <input style={fld} value={f.authorRole} onChange={(e) => set("authorRole", e.target.value)} placeholder={lang === "jp" ? "例：編集" : "e.g. Editor"} />
          </label>
        </div>
      </div>

      {/* preview column */}
      <div className="studio-preview">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Icon name="globe" size={15} color="var(--ink-soft)" />
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-soft)", marginRight: "auto" }}>{t("livePreview", lang)}</span>
          <div className="lang-toggle">
            <button className={plang === "en" ? "on" : ""} onClick={() => setPlang("en")}>EN</button>
            <button className={plang === "jp" ? "on" : ""} onClick={() => setPlang("jp")}>日本</button>
          </div>
        </div>

        {/* completeness */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <CompleteChip on={hasEn} label="English" />
          <CompleteChip on={hasJp} label="日本語" />
        </div>

        {/* article card preview */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow)" }}>
          <Cover seed={f.cover} h={140} />
          <div style={{ padding: "16px 18px 18px" }}>
            <CatPill catKey={f.category} lang={plang} />
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, lineHeight: 1.24, color: "var(--ink)", margin: "12px 0 0" }}>{pTitle || t("untitledArticle", plang)}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 0 14px", flexWrap: "wrap" }}>
              <Byline name={f.authorName} authorKey={f.authorId || f.authorName} role={f.authorRole} lang={plang} size={26} />
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 11.5, color: "var(--ink-faint)", fontWeight: 600 }}>· {f.readMin} {t("minRead", plang)}</span>
            </div>
            <div style={{ borderTop: "1px solid var(--line)", margin: "0 0 14px" }} />
            {pExc && <p style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.55, margin: 0, fontWeight: 600 }}>{pExc}</p>}
            {pFirst && <p style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.7, margin: "12px 0 0" }}>{pFirst}</p>}
          </div>
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-faint)", fontWeight: 600, marginTop: 12 }}>
          {t("previewLangHint", lang)}: <b>{plang === "en" ? "English" : "日本語"}</b>
        </div>
      </div>
    </div>
  );
}

function CompleteChip({ on, label }: { on: boolean; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-ui)", fontSize: 11.5, fontWeight: 700, padding: "6px 11px", borderRadius: 999, background: on ? "var(--success-soft)" : "#f0e7d8", color: on ? "var(--success)" : "var(--ink-faint)" }}>
      {on ? <Icon name="check" size={13} color="var(--success)" /> : <Icon name="edit" size={12} color="var(--ink-faint)" />} {label}
    </span>
  );
}
