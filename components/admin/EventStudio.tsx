"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { Cover } from "../Cover";
import { Icon } from "../Icon";
import { covers, categories } from "@/lib/data";
import { breakEven, pointsFor, yen } from "@/lib/formulas";
import { seriesDates } from "@/lib/recurrence";
import { t, val, fmtDate, relDay } from "@/lib/i18n";
import { saveEvent, listEventRsvps, removeRsvp, type RsvpMember } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase-browser";
import type { Category, Event, EventInput, EventStatus, Lang, RepeatFreq } from "@/lib/types";

export function EventStudio({
  lang,
  initial,
  onClose,
  onSaved,
}: {
  lang: Lang;
  initial: Event | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = Boolean(initial?.id);
  const initStatus = (initial?.status as EventStatus) || "draft";
  const isCompletedEdit = editing && initStatus === "completed";

  const [f, setF] = useState(() => ({
    titleEn: initial?.title.en || "",
    titleJp: initial?.title.jp || "",
    category: (initial?.category as Category) || "cultural",
    cover: initial?.cover || "matsuri",
    date: initial?.date || "2026-07-04",
    start: initial?.time || "18:30",
    end: initial?.endTime || "22:00",
    venueEn: initial?.venue.en || "",
    venueJp: initial?.venue.jp || "",
    areaEn: initial?.area.en || "",
    areaJp: initial?.area.jp || "",
    price: initial?.price ?? 2500,
    capacity: initial?.capacity ?? 20,
    invited: initial?.invited ?? 30,
    cost: initial?.cost ?? 30000,
    descEn: initial?.desc.en || "",
    descJp: initial?.desc.jp || "",
    attended: initial?.attended ?? 0,
    knownRsvp: initial?.knownRsvp ?? 0,
    lineUrl: initial?.lineUrl || "",
    formUrl: initial?.formUrl || "",
    mapsUrl: initial?.mapsUrl || "",
    repeat: "none" as RepeatFreq,
    repeatCount: 4,
  }));
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // cover photo upload
  const coverFileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const coverIsImage = typeof f.cover === "string" && (f.cover.startsWith("http") || f.cover.startsWith("/"));
  async function onCoverFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const supabase = createClient();
    if (!supabase) {
      setError(lang === "jp" ? "Supabase が未設定です。" : "Supabase isn't connected.");
      return;
    }
    setUploading(true);
    setError("");
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `events/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const up = await supabase.storage.from("images").upload(path, file, { upsert: false, cacheControl: "3600" });
    if (up.error) {
      setUploading(false);
      setError(up.error.message);
      return;
    }
    set("cover", supabase.storage.from("images").getPublicUrl(path).data.publicUrl);
    setUploading(false);
    if (coverFileRef.current) coverFileRef.current.value = "";
  }

  // real member accounts that RSVP'd to this event
  const [rsvps, setRsvps] = useState<RsvpMember[]>([]);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  useEffect(() => {
    if (!initial?.id) return;
    setRsvpLoading(true);
    listEventRsvps(initial.id).then((r) => {
      if (r.rsvps) setRsvps(r.rsvps);
      setRsvpLoading(false);
    });
  }, [initial?.id]);
  const doRemoveRsvp = (memberId: string) =>
    startTransition(async () => {
      if (!initial?.id) return;
      const res = await removeRsvp(initial.id, memberId);
      if (res.error) setError(res.error);
      else setRsvps((list) => list.filter((m) => m.memberId !== memberId));
    });

  const fld: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid var(--line)",
    background: "#fbf6ee", fontSize: 13.5, fontFamily: "var(--font-ui)", color: "var(--ink)",
    outline: "none", boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 6, display: "block" };
  const sec: React.CSSProperties = { background: "#fff", border: "1px solid var(--line)", borderRadius: 16, padding: "18px 20px", marginBottom: 16 };
  const secTitle: React.CSSProperties = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginBottom: 15, display: "flex", alignItems: "center", gap: 8 };
  const onF = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = "var(--primary)");
  const onB = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = "var(--line)");

  // live preview values
  const ttl = { en: f.titleEn || t("untitled", lang), jp: f.titleJp || f.titleEn || t("untitled", lang) };
  const area = { en: f.areaEn || (lang === "jp" ? "エリア" : "Area"), jp: f.areaJp || f.areaEn || "エリア" };
  const cat = categories[f.category];
  const price = Number(f.price) || 0;
  const cap = Number(f.capacity) || 0;
  const cost = Number(f.cost) || 0;
  // for past events the numbers reflect who actually came; otherwise capacity
  const headcount = isCompletedEdit ? Number(f.attended) || 0 : cap;
  const revenue = price * headcount;
  const pointsPer = pointsFor({ price });
  const ptsFull = headcount * pointsPer;
  const be = breakEven({ price, cost });
  const beOver = be > cap;
  const profitFull = revenue - cost;
  const costPer = cap > 0 ? Math.round(cost / cap) : 0;

  const seriesN = !editing && f.repeat !== "none" ? Math.max(1, Number(f.repeatCount) || 1) : 1;
  const previewDates = seriesDates(f.date, f.repeat, seriesN);

  function buildInput(): EventInput {
    return {
      id: initial?.id,
      slug: initial?.slug,
      cover: f.cover,
      category: f.category,
      titleEn: f.titleEn,
      titleJp: f.titleJp,
      date: f.date,
      time: f.start,
      endTime: f.end,
      venueEn: f.venueEn,
      venueJp: f.venueJp,
      areaEn: f.areaEn,
      areaJp: f.areaJp,
      price,
      capacity: cap,
      cost,
      invited: Number(f.invited) || 0,
      descEn: f.descEn,
      descJp: f.descJp,
      attended: isCompletedEdit ? Number(f.attended) || 0 : undefined,
      knownRsvp: Number(f.knownRsvp) || 0,
      lineUrl: f.lineUrl.trim(),
      formUrl: f.formUrl.trim(),
      mapsUrl: f.mapsUrl.trim(),
    };
  }

  function doSave(status: EventStatus) {
    setError("");
    startTransition(async () => {
      const res = await saveEvent(buildInput(), status, { freq: f.repeat, count: seriesN });
      if (res.error) setError(res.error);
      else onSaved();
    });
  }

  const headSub = editing
    ? initStatus === "draft"
      ? t("draftHidden", lang)
      : initStatus === "published"
      ? t("liveOnSite", lang)
      : lang === "jp" ? "終了したイベント" : "Completed event"
    : lang === "jp" ? "公開すると、公開サイトに表示されます" : "Once published, this appears on the public site";

  return (
    <div className="studio">
      {/* form column */}
      <div className="studio-form">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <button onClick={onClose} style={{ all: "unset", cursor: "pointer", width: 38, height: 38, borderRadius: 11, background: "#fff", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="arrowL" size={19} color="var(--ink)" />
            </button>
            <div>
              <h1 style={{ fontSize: 25 }}>{editing ? t("editEvent", lang) : t("createEvent", lang)}</h1>
              <div style={{ color: "var(--ink-faint)", fontSize: 13, fontWeight: 600, marginTop: 2 }}>{headSub}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {(!editing || initStatus === "draft") && (
              <button className="btn btn-ghost btn-sm" disabled={pending} onClick={() => doSave("draft")}>
                {t("saveDraft", lang)}
              </button>
            )}
            {editing && initStatus === "published" && (
              <button className="btn btn-ghost btn-sm" disabled={pending} onClick={() => doSave("draft")}>
                {t("unpublish", lang)}
              </button>
            )}
            <button
              className="btn btn-primary btn-sm"
              disabled={pending}
              onClick={() => doSave(editing && initStatus === "completed" ? "completed" : "published")}
            >
              <Icon name="check" size={15} color="#fff" />{" "}
              {pending
                ? lang === "jp" ? "保存中…" : "Saving…"
                : editing
                ? initStatus === "draft" ? t("publish", lang) : t("saveChanges", lang)
                : t("publish", lang) + (seriesN > 1 ? " ×" + seriesN : "")}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: "#f8e8e3", color: "var(--danger)", fontWeight: 600, fontSize: 13, borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* attendance — past events only */}
        {isCompletedEdit && (
          <div style={{ ...sec, borderColor: "var(--info)", background: "#eef3f8" }}>
            <div style={secTitle}>
              <Icon name="users" size={16} color="var(--info)" /> {lang === "jp" ? "参加実績" : "Attendance"}
            </div>
            <div className="fg2">
              <label>
                <span style={lbl}>{lang === "jp" ? "実際に来た人数" : "People who actually came"}</span>
                <input
                  type="number"
                  min={0}
                  style={fld}
                  value={f.attended}
                  onChange={(e) => set("attended", Number(e.target.value))}
                  onFocus={onF}
                  onBlur={onB}
                />
              </label>
              <div style={{ alignSelf: "end", fontSize: 12, color: "var(--ink-soft)", fontWeight: 600, lineHeight: 1.45, paddingBottom: 10 }}>
                {lang === "jp"
                  ? "更新すると、この過去イベントの売上・純益・ポイントが再計算されます。"
                  : "Updating this recalculates this past event's revenue, net, and points."}
              </div>
            </div>
          </div>
        )}

        {/* RSVPs: known (in-person) boost + the real online sign-ups */}
        <div style={sec}>
          <div style={secTitle}>
            <Icon name="users" size={16} color="var(--primary)" /> {lang === "jp" ? "参加予定者" : "RSVPs"}
          </div>
          <div className="fg2">
            <label>
              <span style={lbl}>{lang === "jp" ? "対面で確定した人数（既知）" : "Known RSVPs (confirmed in person)"}</span>
              <input type="number" min={0} style={fld} value={f.knownRsvp} onChange={(e) => set("knownRsvp", Number(e.target.value))} onFocus={onF} onBlur={onB} />
            </label>
            <div style={{ alignSelf: "end", paddingBottom: 8 }}>
              <div style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 700 }}>{lang === "jp" ? "メンバーに表示される人数" : "Members will see"}</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "var(--primary)", lineHeight: 1.1 }}>
                {rsvps.length + (Number(f.knownRsvp) || 0)} <span style={{ fontSize: 13, color: "var(--ink-faint)", fontWeight: 700 }}>{t("going", lang)}</span>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-faint)", fontWeight: 600, marginTop: 8 }}>
            {lang === "jp"
              ? "既知の参加者はオンライン申込に加算され、公開サイトの参加人数になります。"
              : "Known RSVPs are added to online sign-ups to set the count shown on the public site."}
          </div>

          <hr className="hr" style={{ margin: "14px 0" }} />
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 10 }}>
            {lang === "jp" ? `オンライン申込（${rsvps.length}）` : `Signed up online (${rsvps.length})`}
          </div>
          {!editing && (
            <div style={{ fontSize: 13, color: "var(--ink-faint)" }}>{lang === "jp" ? "保存後にオンライン申込が表示されます。" : "Online sign-ups appear here once the event is saved."}</div>
          )}
          {editing && rsvpLoading && <div style={{ fontSize: 13, color: "var(--ink-faint)" }}>{lang === "jp" ? "読み込み中…" : "Loading…"}</div>}
          {editing && !rsvpLoading && rsvps.length === 0 && (
            <div style={{ fontSize: 13, color: "var(--ink-faint)" }}>{lang === "jp" ? "まだオンライン申込はありません。" : "No members have signed up online yet."}</div>
          )}
          {editing && rsvps.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {rsvps.map((m) => (
                  <div key={m.memberId} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, background: "#fbf6ee", border: "1px solid var(--line)" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontFamily: "var(--font-display)", fontSize: 13, flex: "0 0 32px" }}>
                      {m.name[0]?.toUpperCase() || "?"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5 }}>{m.name} <span style={{ marginLeft: 2 }}>{m.country}</span></div>
                      {m.attended && (
                        <span className="tag" style={{ background: "var(--success-soft)", color: "var(--success)", marginTop: 3 }}>
                          <Icon name="check" size={11} color="var(--success)" /> {t("came", lang)}
                        </span>
                      )}
                    </div>
                    <button onClick={() => doRemoveRsvp(m.memberId)} disabled={pending} title="Remove RSVP" style={{ all: "unset", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8, color: "var(--danger)", fontSize: 12, fontWeight: 700 }}>
                      <Icon name="x" size={14} color="var(--danger)" /> {lang === "jp" ? "削除" : "Remove"}
                    </button>
                  </div>
                ))}
              </div>
            )}
            {editing && rsvps.length > 0 && (
              <div style={{ fontSize: 11, color: "var(--ink-faint)", fontWeight: 600, marginTop: 10 }}>
                {lang === "jp" ? "「削除」で誤った参加予定を取り除けます。" : "Use Remove to clear out any false or placeholder RSVPs."}
              </div>
            )}
          </div>

        {/* basics */}
        <div style={sec}>
          <div style={secTitle}><Icon name="sparkle" size={16} color="var(--primary)" /> {t("eventTitle", lang)}</div>
          <div style={{ marginBottom: 14 }}>
            <span style={lbl}>{t("coverStyle", lang)}</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {coverIsImage && (
                <div style={{ width: 64, height: 40, borderRadius: 9, overflow: "hidden", boxShadow: "0 0 0 2.5px var(--primary)" }} title={lang === "jp" ? "アップロード画像" : "Uploaded photo"}>
                  <Cover seed={f.cover} h={40} />
                </div>
              )}
              {Object.keys(covers).map((k) => (
                <button
                  key={k}
                  onClick={() => set("cover", k)}
                  style={{ all: "unset", cursor: "pointer", width: 64, height: 40, borderRadius: 9, overflow: "hidden", boxShadow: f.cover === k ? "0 0 0 2.5px var(--primary)" : "0 0 0 1.5px var(--line)" }}
                >
                  <Cover seed={k} h={40} />
                </button>
              ))}
              <input ref={coverFileRef} type="file" accept="image/*" onChange={onCoverFile} style={{ display: "none" }} />
              <button
                type="button"
                onClick={() => coverFileRef.current?.click()}
                style={{ all: "unset", cursor: "pointer", width: 64, height: 40, borderRadius: 9, border: "1.5px dashed var(--line)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--ink-faint)", fontSize: 9, fontWeight: 700, gap: 2 }}
              >
                {uploading ? (
                  <span>…</span>
                ) : (
                  <>
                    <Icon name="download" size={14} color="var(--ink-faint)" /> {t("uploadPhoto", lang)}
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="fg2" style={{ marginBottom: 14 }}>
            <label><span style={lbl}>{t("titleEnL", lang)}</span><input style={fld} value={f.titleEn} onChange={(e) => set("titleEn", e.target.value)} onFocus={onF} onBlur={onB} placeholder="Midsummer Yukata Night" /></label>
            <label><span style={lbl}>{t("titleJpL", lang)}</span><input style={fld} value={f.titleJp} onChange={(e) => set("titleJp", e.target.value)} onFocus={onF} onBlur={onB} placeholder="真夏の浴衣ナイト" /></label>
          </div>
          <div>
            <span style={lbl}>{t("category", lang)}</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(Object.keys(categories) as Category[]).map((k) => {
                const c = categories[k];
                const on = f.category === k;
                return (
                  <button key={k} onClick={() => set("category", k)} style={{ all: "unset", cursor: "pointer", padding: "7px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, background: on ? c.color : "#fbf6ee", color: on ? "#fff" : "var(--ink-soft)", boxShadow: "0 0 0 1.5px " + (on ? c.color : "var(--line)") }}>
                    {val(c, lang)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* when & where */}
        <div style={sec}>
          <div style={secTitle}><Icon name="pin" size={16} color="var(--primary)" /> {t("dateTime", lang)} · {t("location", lang)}</div>
          <div className="fg3" style={{ marginBottom: 14 }}>
            <label><span style={lbl}>{t("dateTime", lang)}</span><input type="date" style={fld} value={f.date} onChange={(e) => set("date", e.target.value)} onFocus={onF} onBlur={onB} /></label>
            <label><span style={lbl}>{t("startT", lang)}</span><input type="time" style={fld} value={f.start} onChange={(e) => set("start", e.target.value)} onFocus={onF} onBlur={onB} /></label>
            <label><span style={lbl}>{t("endT", lang)}</span><input type="time" style={fld} value={f.end} onChange={(e) => set("end", e.target.value)} onFocus={onF} onBlur={onB} /></label>
          </div>
          <div className="fg2" style={{ marginBottom: 14 }}>
            <label><span style={lbl}>{t("venueEnL", lang)} (EN)</span><input style={fld} value={f.venueEn} onChange={(e) => set("venueEn", e.target.value)} onFocus={onF} onBlur={onB} placeholder="Kamogawa Riverbank" /></label>
            <label><span style={lbl}>{t("venueEnL", lang)} (JP)</span><input style={fld} value={f.venueJp} onChange={(e) => set("venueJp", e.target.value)} onFocus={onF} onBlur={onB} placeholder="鴨川河川敷" /></label>
          </div>
          <div className="fg2">
            <label><span style={lbl}>{t("areaL", lang)} (EN)</span><input style={fld} value={f.areaEn} onChange={(e) => set("areaEn", e.target.value)} onFocus={onF} onBlur={onB} placeholder="Pontocho" /></label>
            <label><span style={lbl}>{t("areaL", lang)} (JP)</span><input style={fld} value={f.areaJp} onChange={(e) => set("areaJp", e.target.value)} onFocus={onF} onBlur={onB} placeholder="先斗町" /></label>
          </div>
          <label style={{ display: "block", marginTop: 14 }}>
            <span style={lbl}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Icon name="chat" size={13} color="#06C755" /> {lang === "jp" ? "LINEグループのリンク（任意）" : "LINE group link (optional)"}
              </span>
            </span>
            <input style={fld} value={f.lineUrl} onChange={(e) => set("lineUrl", e.target.value)} onFocus={onF} onBlur={onB} placeholder="https://line.me/ti/g/..." />
            <span style={{ fontSize: 11, color: "var(--ink-faint)", display: "block", marginTop: 5 }}>
              {lang === "jp" ? "参加者がこのイベントのLINEグループに参加できるリンク。" : "Attendees will get a button to join this event's LINE group."}
            </span>
          </label>
          <label style={{ display: "block", marginTop: 14 }}>
            <span style={lbl}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Icon name="edit" size={13} color="#7248B9" /> {lang === "jp" ? "申込フォームのリンク（任意）" : "Sign-up form link (optional)"}
              </span>
            </span>
            <input style={fld} value={f.formUrl} onChange={(e) => set("formUrl", e.target.value)} onFocus={onF} onBlur={onB} placeholder="https://forms.gle/..." />
            <span style={{ fontSize: 11, color: "var(--ink-faint)", display: "block", marginTop: 5 }}>
              {lang === "jp" ? "外部の申込フォーム（Googleフォームなど）。参加者にボタンが表示されます。" : "An external sign-up form (e.g. Google Forms). Attendees will get a button to open it."}
            </span>
          </label>
          <label style={{ display: "block", marginTop: 14 }}>
            <span style={lbl}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Icon name="pin" size={13} color="#EA4335" /> {lang === "jp" ? "Googleマップのリンク（任意）" : "Google Maps link (optional)"}
              </span>
            </span>
            <input style={fld} value={f.mapsUrl} onChange={(e) => set("mapsUrl", e.target.value)} onFocus={onF} onBlur={onB} placeholder="https://maps.app.goo.gl/..." />
            <span style={{ fontSize: 11, color: "var(--ink-faint)", display: "block", marginTop: 5 }}>
              {lang === "jp" ? "設定すると、イベントページの地図とリンクがこの場所になります。" : "When set, the map and links on the event page point to this exact place."}
            </span>
          </label>
        </div>

        {/* recurrence (new events only) */}
        {!editing && (
          <div style={sec}>
            <div style={secTitle}><Icon name="calendar" size={16} color="var(--primary)" /> {t("repeat", lang)}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {([["none", "repeatNone"], ["weekly", "repeatWeekly"], ["biweekly", "repeatBiweekly"], ["monthly", "repeatMonthly"]] as [RepeatFreq, string][]).map(([k, key]) => {
                const on = f.repeat === k;
                return (
                  <button key={k} onClick={() => set("repeat", k)} style={{ all: "unset", cursor: "pointer", padding: "8px 15px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, background: on ? "var(--primary)" : "#fbf6ee", color: on ? "#fff" : "var(--ink-soft)", boxShadow: "0 0 0 1.5px " + (on ? "var(--primary)" : "var(--line)") }}>
                    {t(key, lang)}
                  </button>
                );
              })}
            </div>
            {f.repeat !== "none" && (
              <div style={{ marginTop: 15 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)" }}>{t("occurrences", lang)}</span>
                  <div style={{ display: "flex", alignItems: "center", border: "1.5px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
                    <button onClick={() => set("repeatCount", Math.max(2, (Number(f.repeatCount) || 2) - 1))} style={{ all: "unset", cursor: "pointer", width: 34, height: 34, textAlign: "center", fontWeight: 800, fontSize: 18, color: "var(--ink-soft)" }}>−</button>
                    <span style={{ minWidth: 40, textAlign: "center", fontWeight: 800, fontSize: 15, fontFamily: "var(--font-display)" }}>{f.repeatCount}</span>
                    <button onClick={() => set("repeatCount", Math.min(24, (Number(f.repeatCount) || 2) + 1))} style={{ all: "unset", cursor: "pointer", width: 34, height: 34, textAlign: "center", fontWeight: 800, fontSize: 18, color: "var(--ink-soft)" }}>+</button>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 7 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", marginRight: 2 }}>{t("willCreate", lang)} {seriesN} {t("eventsWord", lang)}:</span>
                  {previewDates.slice(0, 6).map((d, i) => (
                    <span key={i} className="tag" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>{fmtDate(d, lang)}</span>
                  ))}
                  {previewDates.length > 6 && <span style={{ fontSize: 11, color: "var(--ink-faint)", fontWeight: 700 }}>+{previewDates.length - 6} {t("moreDates", lang)}</span>}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-faint)", fontWeight: 600, marginTop: 10 }}>{t("recurHint", lang)}</div>
              </div>
            )}
          </div>
        )}

        {/* pricing */}
        <div style={sec}>
          <div style={secTitle}><Icon name="ticket" size={16} color="var(--primary)" /> {t("pricingCap", lang)}</div>
          <div className="fg4">
            <label><span style={lbl}>{t("priceL", lang)}</span><input type="number" style={fld} value={f.price} onChange={(e) => set("price", Number(e.target.value))} onFocus={onF} onBlur={onB} /></label>
            <label><span style={lbl}>{t("capacityL", lang)}</span><input type="number" style={fld} value={f.capacity} onChange={(e) => set("capacity", Number(e.target.value))} onFocus={onF} onBlur={onB} /></label>
            <label>
              <span style={lbl}>{t("autoPoints", lang)}</span>
              <div style={{ ...fld, background: "#f1e7d8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 800, color: "var(--gold)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <Icon name="star" size={13} color="var(--gold)" fill="var(--gold)" /> {pointsPer}
                </span>
                <span style={{ fontSize: 10, color: "var(--ink-faint)", fontWeight: 600 }}>{t("perYenHint", lang)}</span>
              </div>
            </label>
            <label><span style={lbl}>{t("invitedL", lang)}</span><input type="number" style={fld} value={f.invited} onChange={(e) => set("invited", Number(e.target.value))} onFocus={onF} onBlur={onB} /></label>
          </div>
        </div>

        {/* costs & break-even */}
        <div style={sec}>
          <div style={secTitle}><Icon name="scale" size={16} color="var(--primary)" /> {t("costsBreak", lang)}</div>
          <div className="fgc">
            <label><span style={lbl}>{t("totalCost", lang)}</span><input type="number" style={fld} value={f.cost} onChange={(e) => set("cost", Number(e.target.value))} onFocus={onF} onBlur={onB} /></label>
            <div style={{ background: beOver ? "#f8e8e3" : "var(--success-soft)", borderRadius: 11, padding: "10px 15px", display: "flex", alignItems: "center", gap: 13 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, color: beOver ? "var(--danger)" : "var(--success)", lineHeight: 1 }}>{be}</div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-soft)", lineHeight: 1.35 }}>
                {t("breakEvenAtt", lang)}
                <div style={{ color: beOver ? "var(--danger)" : "var(--ink-faint)", fontWeight: 600 }}>{beOver ? t("needMore", lang) : `${be} / ${cap} ${t("ofCapacity", lang)}`}</div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-faint)", fontWeight: 600, marginTop: 9 }}>{t("costHint", lang)}</div>
        </div>

        {/* description */}
        <div style={sec}>
          <div style={secTitle}><Icon name="chart" size={16} color="var(--primary)" /> {t("descL", lang)}</div>
          <div className="fg2">
            <label><span style={lbl}>{t("descEnL", lang)}</span><textarea style={{ ...fld, minHeight: 96, resize: "vertical" }} value={f.descEn} onChange={(e) => set("descEn", e.target.value)} onFocus={onF} onBlur={onB} placeholder="Tell people what to expect…" /></label>
            <label><span style={lbl}>{t("descJpL", lang)}</span><textarea style={{ ...fld, minHeight: 96, resize: "vertical" }} value={f.descJp} onChange={(e) => set("descJp", e.target.value)} onFocus={onF} onBlur={onB} placeholder="イベントの内容を記入…" /></label>
          </div>
        </div>
      </div>

      {/* preview column */}
      <div className="studio-preview">
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14, color: "var(--ink-soft)" }}>
          <Icon name="globe" size={15} color="var(--ink-soft)" />
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>{t("livePreview", lang)}</span>
        </div>

        {/* preview card */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, overflow: "hidden", boxShadow: "var(--shadow)" }}>
          <Cover seed={f.cover} h={150} label>
            <div style={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", justifyContent: "space-between" }}>
              <span className="tag" style={{ background: cat.color + "e0", color: "#fff" }}>{val(cat, lang)}</span>
              <span className="sticker" style={{ fontSize: 11, padding: "4px 9px" }}>{relDay(f.date, lang)}</span>
            </div>
            <div style={{ position: "absolute", left: 14, bottom: 12, right: 14 }}>
              <div style={{ color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, lineHeight: 1.18, textShadow: "0 2px 12px rgba(0,0,0,.45)" }}>{val(ttl, lang)}</div>
            </div>
          </Cover>
          <div style={{ padding: "13px 15px 15px" }}>
            <div style={{ display: "flex", gap: 14, color: "var(--ink-soft)", fontSize: 12, fontWeight: 600, marginBottom: 10, flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}><Icon name="calendar" size={13} color="var(--primary)" /> {fmtDate(f.date, lang)} · {f.start}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}><Icon name="pin" size={13} color="var(--primary)" /> {val(area, lang)}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, whiteSpace: "nowrap" }}>{price ? yen(price) : t("free", lang)}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--gold)", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                <Icon name="star" size={12} color="var(--gold)" fill="var(--gold)" /> +{pointsPer} {t("points", lang)}
              </span>
            </div>
          </div>
        </div>

        {/* projections */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginTop: 16 }}>
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 13, padding: "13px 14px" }}>
            <div style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 600 }}>{isCompletedEdit ? t("actualRev", lang) : t("projRevenue", lang)}</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, color: "var(--ink)", marginTop: 5 }}>{yen(revenue)}</div>
            <div style={{ fontSize: 10.5, color: "var(--ink-faint)", fontWeight: 600, marginTop: 2 }}>{headcount} × {yen(price)} {isCompletedEdit ? (lang === "jp" ? "実績" : "actual") : t("atCapacity", lang)}</div>
          </div>
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 13, padding: "13px 14px" }}>
            <div style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 600 }}>{t("profitFull", lang)}</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, color: profitFull >= 0 ? "var(--success)" : "var(--danger)", marginTop: 5 }}>{yen(profitFull)}</div>
            <div style={{ fontSize: 10.5, color: "var(--ink-faint)", fontWeight: 600, marginTop: 2 }}>{t("revenue", lang).toLowerCase()} − {t("costs", lang).toLowerCase()}</div>
          </div>
        </div>

        {/* break-even bar */}
        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 13, padding: "14px 15px", marginTop: 11 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 9 }}>
            <span style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
              <Icon name="scale" size={14} color="var(--primary)" /> {t("breakEven", lang)}
            </span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: beOver ? "var(--danger)" : "var(--success)" }}>
              {be} <span style={{ fontSize: 11, color: "var(--ink-faint)", fontWeight: 600 }}>/ {cap}</span>
            </span>
          </div>
          <div style={{ position: "relative", height: 8, borderRadius: 5, background: "var(--line)", overflow: "hidden" }}>
            <div style={{ width: Math.min(100, cap > 0 ? (be / cap) * 100 : 0) + "%", height: "100%", background: beOver ? "var(--danger)" : "var(--success)" }} />
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-faint)", fontWeight: 600, marginTop: 7 }}>{beOver ? t("needMore", lang) : `${be} ${t("breakEvenAtt", lang)}`}</div>
        </div>

        {/* points-if-full + cost/head */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginTop: 11 }}>
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 13, padding: "13px 14px" }}>
            <div style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 600 }}>{t("ptsIfFull", lang)}</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, color: "var(--gold)", marginTop: 5 }}>{ptsFull}</div>
            <div style={{ fontSize: 10.5, color: "var(--ink-faint)", fontWeight: 600, marginTop: 2 }}>{cap} × {pointsPer} {t("point", lang)}</div>
          </div>
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 13, padding: "13px 14px" }}>
            <div style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 600 }}>{t("perHead", lang)}</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, color: "var(--ink)", marginTop: 5 }}>{yen(costPer)}</div>
            <div style={{ fontSize: 10.5, color: "var(--ink-faint)", fontWeight: 600, marginTop: 2 }}>{yen(cost)} ÷ {cap}</div>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 13, padding: "13px 14px", marginTop: 11, display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 38px" }}>
            <Icon name="users" size={18} color="var(--primary)" />
          </div>
          <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, lineHeight: 1.25 }}>
              {f.invited || 0} {t("invited", lang).toLowerCase()} · {f.capacity || 0} {lang === "jp" ? "目標" : "goal"}
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-faint)", fontWeight: 600, lineHeight: 1.3 }}>
              {lang === "jp" ? "参加率は開催後に記録" : "Show-up rate tracked after the event"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
