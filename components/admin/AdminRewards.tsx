"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "../Icon";
import { PageHead } from "./AdminShared";
import { t } from "@/lib/i18n";
import { saveReward, deleteReward } from "@/app/admin/actions";
import type { Lang, Reward } from "@/lib/types";

type Draft = { id: string; titleEn: string; titleJp: string; cost: number; tag: string };

function toDraft(r: Reward): Draft {
  return { id: r.id, titleEn: r.title.en, titleJp: r.title.jp, cost: r.cost, tag: r.tag ?? "" };
}
const blankDraft = (): Draft => ({ id: "", titleEn: "", titleJp: "", cost: 5, tag: "" });

export function AdminRewards({ lang, rewards }: { lang: Lang; rewards: Reward[] }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Draft[]>(() => rewards.map(toDraft));
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  const update = (i: number, patch: Partial<Draft>) =>
    setDrafts((d) => d.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  const save = (d: Draft) =>
    startTransition(async () => {
      setMsg("");
      const res = await saveReward({ id: d.id || undefined, titleEn: d.titleEn, titleJp: d.titleJp, cost: d.cost, tag: d.tag || null });
      if (res.error) setMsg(res.error);
      else router.refresh();
    });

  const remove = (d: Draft, i: number) =>
    startTransition(async () => {
      setMsg("");
      if (!d.id) {
        setDrafts((arr) => arr.filter((_, j) => j !== i));
        return;
      }
      const res = await deleteReward(d.id);
      if (res.error) setMsg(res.error);
      else router.refresh();
    });

  const fld: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid var(--line)",
    background: "#fbf6ee", fontSize: 13.5, fontFamily: "var(--font-ui)", color: "var(--ink)", outline: "none", boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 5, display: "block" };

  return (
    <div className="adm-pad" style={{ padding: "26px 30px 40px" }}>
      <PageHead
        title={t("rewardsT", lang)}
        sub={lang === "jp" ? "特典とポイント数を編集（メンバーに即反映）" : "Edit rewards & point costs — changes show to members instantly"}
        cta={lang === "jp" ? "特典を追加" : "Add reward"}
        ctaIcon="plus"
        onCta={() => setDrafts((d) => [...d, blankDraft()])}
      />

      {msg && (
        <div style={{ background: "#f8e8e3", color: "var(--danger)", fontWeight: 600, fontSize: 13, borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>{msg}</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14, maxWidth: 760 }}>
        {drafts.length === 0 && (
          <div className="metric" style={{ padding: "30px 20px", textAlign: "center", color: "var(--ink-faint)" }}>
            {lang === "jp" ? "特典がありません。「特典を追加」で作成してください。" : "No rewards yet. Click “Add reward” to create one."}
          </div>
        )}
        {drafts.map((d, i) => (
          <div key={d.id || `new-${i}`} className="metric" style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: "var(--gold-soft)", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 38px" }}>
                <Icon name="gift" size={19} color="var(--gold)" />
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>
                {d.titleEn || (lang === "jp" ? "新しい特典" : "New reward")}
              </div>
              {!d.id && <span className="tag" style={{ background: "var(--gold)", color: "#fff" }}>{lang === "jp" ? "未保存" : "unsaved"}</span>}
            </div>

            <div className="fg2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <label><span style={lbl}>{lang === "jp" ? "タイトル（英語）" : "Title (English)"}</span>
                <input style={fld} value={d.titleEn} onChange={(e) => update(i, { titleEn: e.target.value })} placeholder="Free entry to any paid event" />
              </label>
              <label><span style={lbl}>{lang === "jp" ? "タイトル（日本語）" : "Title (Japanese)"}</span>
                <input style={fld} value={d.titleJp} onChange={(e) => update(i, { titleJp: e.target.value })} placeholder="有料イベント1回無料" />
              </label>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
              <label style={{ width: 130 }}><span style={lbl}>{lang === "jp" ? "ポイント数" : "Point cost"}</span>
                <input type="number" min={0} style={fld} value={d.cost} onChange={(e) => update(i, { cost: Number(e.target.value) })} />
              </label>
              <label style={{ width: 150 }}><span style={lbl}>{lang === "jp" ? "タグ" : "Tag"}</span>
                <select style={fld} value={d.tag} onChange={(e) => update(i, { tag: e.target.value })}>
                  <option value="">{lang === "jp" ? "なし" : "None"}</option>
                  <option value="popular">popular</option>
                  <option value="limited">limited</option>
                </select>
              </label>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button className="btn btn-ghost btn-sm" disabled={pending} onClick={() => remove(d, i)} style={{ color: "var(--danger)" }}>
                  <Icon name="trash" size={14} color="var(--danger)" /> {t("deleteE", lang)}
                </button>
                <button className="btn btn-primary btn-sm" disabled={pending} onClick={() => save(d)}>
                  <Icon name="check" size={14} color="#fff" /> {lang === "jp" ? "保存" : "Save"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pending && (
        <div style={{ position: "fixed", bottom: 18, right: 18, background: "var(--ink)", color: "#f6efe2", padding: "8px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 700 }}>
          {lang === "jp" ? "更新中…" : "Working…"}
        </div>
      )}
    </div>
  );
}
