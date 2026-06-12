"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Cover } from "../Cover";
import { Icon } from "../Icon";
import { PageHead } from "./AdminShared";
import { createClient } from "@/lib/supabase-browser";
import { setHeroImage, setSiteLinks } from "@/app/admin/actions";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

export function AdminSite({
  lang,
  heroImageUrl,
  lineUrl,
  instagramUrl,
}: {
  lang: Lang;
  heroImageUrl: string | null;
  lineUrl: string | null;
  instagramUrl: string | null;
}) {
  const router = useRouter();
  const [url, setUrl] = useState<string | null>(heroImageUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // social profile links
  const [line, setLine] = useState(lineUrl || "");
  const [insta, setInsta] = useState(instagramUrl || "");
  const [savingLinks, setSavingLinks] = useState(false);
  const [linksMsg, setLinksMsg] = useState("");
  async function saveLinks() {
    setLinksMsg("");
    setSavingLinks(true);
    const res = await setSiteLinks(line.trim() || null, insta.trim() || null);
    setSavingLinks(false);
    if (res.error) setLinksMsg(res.error);
    else {
      setLinksMsg(lang === "jp" ? "保存しました" : "Saved");
      router.refresh();
      setTimeout(() => setLinksMsg(""), 1800);
    }
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    const supabase = createClient();
    if (!supabase) {
      setError(lang === "jp" ? "Supabase が未設定です。" : "Supabase isn't connected.");
      return;
    }
    setBusy(true);
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `hero/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const up = await supabase.storage.from("images").upload(path, file, { upsert: false, cacheControl: "3600" });
    if (up.error) {
      setBusy(false);
      setError(up.error.message);
      return;
    }
    const pub = supabase.storage.from("images").getPublicUrl(path).data.publicUrl;
    const res = await setHeroImage(pub);
    setBusy(false);
    if (res.error) setError(res.error);
    else {
      setUrl(pub);
      router.refresh();
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  const fld: React.CSSProperties = {
    width: "100%", padding: "11px 13px", borderRadius: 10, border: "1.5px solid var(--line)",
    background: "#fbf6ee", fontSize: 13.5, fontFamily: "var(--font-ui)", color: "var(--ink)", outline: "none", boxSizing: "border-box",
  };

  async function removeImage() {
    setError("");
    setBusy(true);
    const res = await setHeroImage(null);
    setBusy(false);
    if (res.error) setError(res.error);
    else {
      setUrl(null);
      router.refresh();
    }
  }

  return (
    <div className="adm-pad" style={{ padding: "26px 30px 40px" }}>
      <PageHead
        title={lang === "jp" ? "サイト設定" : "Site"}
        sub={lang === "jp" ? "ホームページのヒーロー画像などを管理" : "Manage your homepage images"}
      />

      <div className="metric" style={{ padding: "20px 22px", maxWidth: 620 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
          {lang === "jp" ? "ホームページのヒーロー画像" : "Homepage hero image"}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 14 }}>
          {lang === "jp"
            ? "トップページ上部の背景画像。未設定の場合は標準のグラデーションになります。"
            : "The big background photo at the top of your homepage. If none is set, the default gradient is used."}
        </div>

        <div style={{ borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--line)", position: "relative" }}>
          <Cover seed={url || "lantern"} h={200} label>
            <div style={{ position: "absolute", left: 18, bottom: 16, color: "#fff" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, textShadow: "0 2px 12px rgba(0,0,0,.5)" }}>
                {lang === "jp" ? "京都を、みんなで。" : "Meet Kyoto. Together."}
              </div>
              <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>
                {url ? (lang === "jp" ? "アップロード画像" : "Your uploaded image") : (lang === "jp" ? "標準グラデーション" : "Default gradient")}
              </div>
            </div>
          </Cover>
        </div>

        {error && <div style={{ color: "var(--danger)", fontSize: 12.5, fontWeight: 600, marginTop: 12 }}>{error}</div>}

        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <input ref={fileRef} type="file" accept="image/*" onChange={onPick} style={{ display: "none" }} />
          <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => fileRef.current?.click()}>
            <Icon name="download" size={15} color="#fff" /> {busy ? (lang === "jp" ? "アップロード中…" : "Uploading…") : url ? (lang === "jp" ? "画像を変更" : "Replace image") : (lang === "jp" ? "画像をアップロード" : "Upload image")}
          </button>
          {url && (
            <button className="btn btn-ghost btn-sm" disabled={busy} onClick={removeImage} style={{ color: "var(--danger)" }}>
              <Icon name="trash" size={14} color="var(--danger)" /> {lang === "jp" ? "標準に戻す" : "Use default"}
            </button>
          )}
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 10 }}>
          {lang === "jp" ? "横長の写真がおすすめ（例：1600×900）。" : "Use a wide landscape photo (e.g. 1600×900) for best results."}
        </div>
      </div>

      {/* social profile links */}
      <div className="metric" style={{ padding: "20px 22px", maxWidth: 620, marginTop: 16 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
          {lang === "jp" ? "SNSリンク" : "Social links"}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 14 }}>
          {lang === "jp"
            ? "団体のLINE・Instagramのプロフィールリンク。ホームページのトップにボタンとして表示されます。"
            : "Your org's LINE & Instagram profile links — shown as buttons in the homepage hero."}
        </div>

        <label style={{ display: "block", marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Icon name="chat" size={14} color="#06C755" /> {lang === "jp" ? "LINE プロフィールのリンク" : "LINE profile link"}
          </span>
          <input style={fld} value={line} onChange={(e) => setLine(e.target.value)} placeholder="https://line.me/R/ti/p/@yourid" />
        </label>
        <label style={{ display: "block", marginBottom: 14 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Icon name="instagram" size={14} color="#d62976" /> {lang === "jp" ? "Instagram のリンク" : "Instagram link"}
          </span>
          <input style={fld} value={insta} onChange={(e) => setInsta(e.target.value)} placeholder="https://instagram.com/yourhandle" />
        </label>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-primary btn-sm" disabled={savingLinks} onClick={saveLinks}>
            <Icon name="check" size={15} color="#fff" /> {savingLinks ? (lang === "jp" ? "保存中…" : "Saving…") : lang === "jp" ? "保存" : "Save links"}
          </button>
          {linksMsg && <span style={{ fontSize: 12.5, fontWeight: 600, color: linksMsg === "Saved" || linksMsg === "保存しました" ? "var(--success)" : "var(--danger)" }}>{linksMsg}</span>}
        </div>
      </div>
    </div>
  );
}
