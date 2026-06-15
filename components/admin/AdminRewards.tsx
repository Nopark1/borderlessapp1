"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "../Icon";
import { PageHead } from "./AdminShared";
import { t } from "@/lib/i18n";
import { saveReward, deleteReward, setTierThresholds } from "@/app/admin/actions";
import { buildTiers } from "@/lib/data";
import type { Lang, Reward } from "@/lib/types";

type Draft = { id: string; titleEn: string; titleJp: string; cost: number; tag: string };

function toDraft(r: Reward): Draft {
  return { id: r.id, titleEn: r.title.en, titleJp: r.title.jp, cost: r.cost, tag: r.tag ?? "" };
}
const blankDraft = (): Draft => ({ id: "", titleEn: "", titleJp: "", cost: 5, tag: "" });

export function AdminRewards({
  lang,
  rewards,
  tierRegularMin,
  tierInsiderMin,
}: {
  lang: Lang;
  rewards: Reward[];
  tierRegularMin: number;
  tierInsiderMin: number;
}) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Draft[]>(() => rewards.map(toDraft));
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  // ---- rank thresholds ----
  const [reg, setReg] = useState(tierRegularMin);
  const [ins, setIns] = useState(tierInsiderMin);
  const [savingTiers, setSavingTiers] = useState(false);
  const [tierMsg, setTierMsg] = useState("");
  const tierDirty = reg !== tierRegularMin || ins !== tierInsiderMin;
  const tierInvalid = !(reg >= 1) || !(ins > reg);
  const tierColors: Record<string, string> = { Guest: "var(--ink-faint)", Regular: "var(--gold)", Insider: "var(--primary)" };
  const ladder = buildTiers(reg, ins);

  const saveTiers = () =>
    startTransition(async () => {
      setTierMsg("");
      setSavingTiers(true);
      const res = await setTierThresholds(reg, ins);
      setSavingTiers(false);
      if (res.error) setTierMsg(res.error);
      else {
        setTierMsg(lang === "jp" ? "保存しました" : "Saved");
        router.refresh();
        setTimeout(() => setTierMsg(""), 1800);
      }
    });

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

      {/* rank thresholds */}
      <div className="metric" style={{ padding: "18px 20px", maxWidth: 760, marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <Icon name="trophy" size={18} color="var(--gold)" />
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>
            {lang === "jp" ? "ランクの必要ポイント" : "Rank thresholds"}
          </div>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 16 }}>
          {lang === "jp"
            ? "各ランクに到達するために必要なポイント数。変更はメンバーに即反映されます。"
            : "Points a member needs to reach each rank. Changes apply to members instantly."}
        </div>

        {/* visual ladder */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {ladder.map((tr) => (
            <div key={tr.key} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#fbf6ee", border: "1px solid var(--line)", borderRadius: 999, padding: "5px 12px 5px 8px" }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: tierColors[tr.key] || "var(--ink-faint)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, fontFamily: "var(--font-display)" }}>{tr.key[0]}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700 }}>{lang === "jp" ? tr.jp : tr.key}</span>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-faint)" }}>{tr.min}+ {lang === "jp" ? "pt" : "pts"}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <label style={{ width: 120 }}>
            <span style={lbl}>{lang === "jp" ? "ゲスト" : "Guest"}</span>
            <input type="number" style={{ ...fld, background: "#f1e7d8", color: "var(--ink-faint)" }} value={0} disabled />
          </label>
          <label style={{ width: 120 }}>
            <span style={{ ...lbl, color: "var(--gold)" }}>{lang === "jp" ? "レギュラー" : "Regular"}</span>
            <input type="number" min={1} style={fld} value={reg} onChange={(e) => setReg(Number(e.target.value))} />
          </label>
          <label style={{ width: 120 }}>
            <span style={{ ...lbl, color: "var(--primary)" }}>{lang === "jp" ? "インサイダー" : "Insider"}</span>
            <input type="number" min={reg + 1} style={fld} value={ins} onChange={(e) => setIns(Number(e.target.value))} />
          </label>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            {tierMsg && (
              <span style={{ fontSize: 12.5, fontWeight: 600, color: tierMsg === "Saved" || tierMsg === "保存しました" ? "var(--success)" : "var(--danger)" }}>{tierMsg}</span>
            )}
            <button className="btn btn-primary btn-sm" disabled={savingTiers || !tierDirty || tierInvalid} onClick={saveTiers}>
              <Icon name="check" size={14} color="#fff" /> {savingTiers ? (lang === "jp" ? "保存中…" : "Saving…") : lang === "jp" ? "保存" : "Save ranks"}
            </button>
          </div>
        </div>
        {tierInvalid && (
          <div style={{ fontSize: 11.5, color: "var(--danger)", fontWeight: 600, marginTop: 9 }}>
            {lang === "jp" ? "レギュラーは1以上、インサイダーはレギュラーより大きく設定してください。" : "Regular must be ≥ 1 and Insider must be greater than Regular."}
          </div>
        )}
      </div>

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
