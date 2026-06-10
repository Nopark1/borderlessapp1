/* ============================================================
   Borderless — internal admin (admin.jsx)
   Financial + attendance metrics. Desktop frame.
   ============================================================ */

function Metric({ label, value, delta, deltaDir, sub, accent }) {
  const up = deltaDir === "up";
  return (
    <div className="metric">
      <div className="ml">{label}</div>
      <div className="mv" style={{ color: accent || "var(--ink)" }}>{value}</div>
      {delta != null && (
        <div className="md" style={{ color: up ? "var(--success)" : "var(--danger)" }}>
          <Icon name={up ? "arrowUp" : "arrowDown"} size={13} color={up ? "var(--success)" : "var(--danger)"} />
          {delta} <span style={{ color: "var(--ink-faint)", fontWeight: 600 }}>{sub}</span>
        </div>
      )}
      {delta == null && sub && <div className="md" style={{ color: "var(--ink-faint)" }}>{sub}</div>}
    </div>
  );
}

function AdminOverview({ lang, events }) {
  const D = window.BL_DATA, T = window.BL_I18N, tot = D.totals;
  const src = events || D.events;
  const past = src.filter((e) => D.isPast(e)).sort((a, b) => a.date < b.date ? 1 : -1);
  return (
    <div style={{ padding: "26px 30px 40px" }}>
      <PageHead title={T.t("overview", lang)} sub={lang === "jp" ? "2026年・全体の状況" : "Circle health · 2026"} lang={lang} />

      {/* metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 16 }}>
        <Metric label={T.t("revenue", lang)} value={D.yen(tot.revenue)} delta="18%" deltaDir="up" sub={T.t("vsLast", lang)} />
        <Metric label={T.t("costs", lang)} value={D.yen(tot.costs)} delta="6%" deltaDir="up" sub={T.t("vsLast", lang)} />
        <Metric label={T.t("netProfit", lang)} value={D.yen(tot.net)} delta="29%" deltaDir="up" sub={T.t("vsLast", lang)} accent="var(--success)" />
        <Metric label={T.t("showupRate", lang)} value={tot.showRate + "%"} delta="4 pts" deltaDir="up" sub={T.t("vsLast", lang)} accent="var(--primary)" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <Metric label={T.t("activeMembers", lang)} value="100" delta="6" deltaDir="up" sub={T.t("thisMonth", lang)} />
        <Metric label={T.t("invited", lang) + " → " + T.t("came", lang)} value={`${tot.invited} → ${tot.attended}`} sub={lang === "jp" ? "過去5イベント" : "last 5 events"} />
        <Metric label={T.t("ptsIssued", lang)} value={tot.pointsIssued} sub={`${tot.pointsRedeemed} ${T.t("ptsRedeemed", lang).toLowerCase()}`} />
        <Metric label={T.t("avgPerHead", lang)} value={D.yen(Math.round(tot.revenue / tot.attended))} sub={lang === "jp" ? "参加者1人あたり売上" : "revenue per attendee"} />
      </div>

      {/* charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 16, marginBottom: 24 }}>
        <div className="metric" style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>{T.t("revVsCost", lang)}</div>
            <Legend items={[[T.t("revenue", lang), "var(--primary)"], [T.t("costs", lang), "var(--gold)"]]} />
          </div>
          <BarPairChart data={D.months} keys={["revenue", "costs"]} colors={["var(--primary)", "var(--gold)"]} w={560} h={190} />
        </div>
        <div className="metric" style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>{T.t("memberGrowth", lang)}</div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--success)" }}>+72% YTD</span>
          </div>
          <LineChart data={D.months} field="members" w={480} h={190} color="var(--info)" />
        </div>
      </div>

      {/* per-event table */}
      <div className="metric" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 22px 12px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>{T.t("perEvent", lang)}</div>
        <table className="tbl">
          <thead>
            <tr>
              <th>{T.t("event", lang)}</th><th>{T.t("invited", lang)}</th><th>{T.t("came", lang)}</th>
              <th>{T.t("showupRate", lang)}</th><th style={{ textAlign: "right" }}>{T.t("revenue", lang)}</th>
              <th style={{ textAlign: "right" }}>{T.t("costs", lang)}</th><th style={{ textAlign: "right" }}>{T.t("net", lang)}</th>
            </tr>
          </thead>
          <tbody>
            {past.map((e) => {
              const f = D.finOf(e);
              const rate = Math.round((e.attended / e.invited) * 100);
              return (
                <tr key={e.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <div style={{ flex: "0 0 40px", width: 40 }}><Cover seed={e.cover} h={32} radius={8} /></div>
                      <div>
                        <div style={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>{T.val(e.title, lang)}</div>
                        <div style={{ fontSize: 11.5, color: "var(--ink-faint)", fontWeight: 600 }}>{T.fmtDate(e.date, lang)}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{e.invited}</td>
                  <td style={{ fontWeight: 600 }}>{e.attended}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{ width: 54, height: 6, borderRadius: 4, background: "var(--line)", overflow: "hidden" }}>
                        <div style={{ width: rate + "%", height: "100%", background: rate >= 80 ? "var(--success)" : rate >= 65 ? "var(--gold)" : "var(--danger)" }} />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 12.5 }}>{rate}%</span>
                    </div>
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>{D.yen(f.revenue)}</td>
                  <td style={{ textAlign: "right", color: "var(--ink-soft)" }}>{D.yen(f.costs)}</td>
                  <td style={{ textAlign: "right", fontWeight: 800, color: "var(--success)" }}>{D.yen(f.net)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ status, lang }) {
  const T = window.BL_I18N;
  const map = {
    published: { t: T.t("published", lang), c: "var(--success)", bg: "var(--success-soft)" },
    draft: { t: T.t("draft", lang), c: "var(--ink-soft)", bg: "var(--surface-2)" },
    completed: { t: T.t("completed", lang), c: "var(--info)", bg: "#e3e9f0" },
  };
  const m = map[status] || map.published;
  return <span className="tag" style={{ background: m.bg, color: m.c }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: m.c }} /> {m.t}</span>;
}

function MenuItem({ icon, label, onClick, danger }) {
  return (
    <button onClick={onClick} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: danger ? "var(--danger)" : "var(--ink)", width: "100%", boxSizing: "border-box" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = danger ? "#f7e7e2" : "var(--surface-2)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
      <Icon name={icon} size={15} color={danger ? "var(--danger)" : "var(--ink-soft)"} /> {label}
    </button>
  );
}

function EventMenu({ e, lang, onEdit, onCheckin, onDuplicate, onDelete, onTop }) {
  const T = window.BL_I18N;
  const [open, setOpen] = React.useState(false);
  const [confirm, setConfirm] = React.useState(false);
  const past = window.BL_DATA.isPast(e);
  const stop = (fn) => (ev) => { ev.stopPropagation(); ev.preventDefault(); if (fn) fn(); };
  const close = () => { setOpen(false); setConfirm(false); };
  return (
    <div style={{ position: "relative" }} onClick={stop()}>
      <button onClick={stop(() => setOpen((o) => !o))} title="Actions" style={{ all: "unset", cursor: "pointer", width: 30, height: 30, borderRadius: 9, background: onTop ? "rgba(255,255,255,.92)" : "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: onTop ? "var(--shadow-sm)" : "none" }}>
        <Icon name="dots" size={17} color="var(--ink)" fill="var(--ink)" sw={0} />
      </button>
      {open && (
        <>
          <div onClick={stop(close)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
          <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 50, background: "#fff", border: "1px solid var(--line)", borderRadius: 12, boxShadow: "var(--shadow-lg)", minWidth: 178, padding: 6 }}>
            <MenuItem icon="edit" label={T.t("editEvent", lang)} onClick={stop(() => { close(); onEdit(); })} />
            {!past && <MenuItem icon="checkCircle" label={T.t("checkIn", lang)} onClick={stop(() => { close(); onCheckin(); })} />}
            <MenuItem icon="copy" label={T.t("duplicate", lang)} onClick={stop(() => { close(); onDuplicate(); })} />
            <div style={{ height: 1, background: "var(--line-soft)", margin: "5px 4px" }} />
            {!confirm
              ? <MenuItem icon="trash" label={T.t("deleteE", lang)} danger onClick={stop(() => setConfirm(true))} />
              : <MenuItem icon="trash" label={T.t("confirmDel", lang)} danger onClick={stop(() => { close(); onDelete(); })} />}
          </div>
        </>
      )}
    </div>
  );
}

function AdminEvents({ lang, events, onNew, onEdit, onCheckin, onDuplicate, onDelete }) {
  const D = window.BL_DATA, T = window.BL_I18N;
  const src = events || D.events;
  const [filter, setFilter] = React.useState("all");
  const past = src.filter((e) => D.isPast(e)).sort((a, b) => (a.date < b.date ? 1 : -1));
  const upcoming = src.filter((e) => !D.isPast(e)).sort((a, b) => (a.date < b.date ? -1 : 1));
  const upList = upcoming.filter((e) => filter === "all" || e.status === filter);
  const showU = (filter === "all" || filter === "published" || filter === "draft") && upList.length > 0;
  const showPast = filter === "all" || filter === "completed";

  return (
    <div style={{ padding: "26px 30px 40px" }}>
      <PageHead title={T.t("eventsAdm", lang)} sub={lang === "jp" ? "招待 vs 参加・収支" : "Invited vs. came · money in/out"} lang={lang} cta={T.t("newEvent", lang)} onCta={onNew} />

      <div className="seg" style={{ marginBottom: 22 }}>
        {["all", "published", "draft", "completed"].map((k) => (
          <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{k === "all" ? T.t("allStatus", lang) : T.t(k, lang)}</button>
        ))}
      </div>

      {showU && (
        <div>
          <div style={{ marginBottom: 14, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--ink-soft)" }}>{T.t("upcoming", lang)}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 28 }}>
            {upList.map((e) => {
              const fill = Math.round((e.rsvp / e.capacity) * 100);
              const be = D.breakEven(e), beOk = be <= e.capacity;
              return (
                <div key={e.id} onClick={() => onEdit(e)} style={{ cursor: "pointer", display: "block", position: "relative", background: "#fff", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                  <div style={{ height: 90 }}><Cover seed={e.cover} h={90} dim={e.status === "draft" ? 0.32 : 0} /></div>
                  <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
                    <StatusPill status={e.status} lang={lang} />
                    {e.isNew && <span className="tag" style={{ background: "var(--gold)", color: "#fff" }}>{T.t("newBadge", lang)}</span>}
                  </div>
                  <div style={{ position: "absolute", top: 9, right: 9, zIndex: 20 }}>
                    <EventMenu e={e} lang={lang} onTop onEdit={() => onEdit(e)} onCheckin={() => onCheckin(e)} onDuplicate={() => onDuplicate(e)} onDelete={() => onDelete(e.id)} />
                  </div>
                  <div style={{ padding: "13px 15px 15px" }}>
                    <div style={{ fontWeight: 700, fontFamily: "var(--font-display)", fontSize: 15 }}>{T.val(e.title, lang)}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-faint)", fontWeight: 600, margin: "3px 0 11px" }}>{T.fmtDate(e.date, lang)} · {T.val(e.area, lang)}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12, fontWeight: 700, marginBottom: 5 }}>
                      <span style={{ color: "var(--ink-soft)", whiteSpace: "nowrap" }}>{e.rsvp}/{e.capacity} {lang === "jp" ? "参加予定" : "RSVP'd"}</span>
                      <span style={{ color: "var(--primary)", whiteSpace: "nowrap" }}>{D.yen(e.price * e.capacity)} {lang === "jp" ? "見込" : "proj."}</span>
                    </div>
                    <div style={{ width: "100%", height: 6, borderRadius: 4, background: "var(--line)", overflow: "hidden", marginBottom: 11 }}>
                      <div style={{ width: fill + "%", height: "100%", background: "var(--primary)" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11.5, fontWeight: 700, paddingTop: 10, borderTop: "1px solid var(--line-soft)" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--ink-soft)", whiteSpace: "nowrap" }}><Icon name="scale" size={14} color="var(--ink-soft)" /> {T.t("breakEven", lang)}</span>
                      <span style={{ color: beOk ? "var(--success)" : "var(--danger)", whiteSpace: "nowrap" }}>{be} {lang === "jp" ? "人" : "ppl"} · {D.yen(e.cost || 0)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showPast && (
        <div>
          <div style={{ marginBottom: 14, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--ink-soft)" }}>{T.t("past", lang)}</div>
          <div className="metric" style={{ padding: 0, overflow: "visible" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>{T.t("event", lang)}</th><th>{T.t("invited", lang)}</th><th>{T.t("came", lang)}</th>
                  <th>{T.t("showupRate", lang)}</th><th>{lang === "jp" ? "獲得pt" : "Pts"}</th>
                  <th style={{ textAlign: "right" }}>{T.t("revenue", lang)}</th>
                  <th style={{ textAlign: "right" }}>{T.t("costs", lang)}</th><th style={{ textAlign: "right" }}>{T.t("net", lang)}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {past.map((e) => {
                  const f = D.finOf(e);
                  const rate = Math.round((e.attended / e.invited) * 100);
                  return (
                    <tr key={e.id} onClick={() => onEdit(e)} style={{ cursor: "pointer" }}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                          <div style={{ flex: "0 0 40px", width: 40 }}><Cover seed={e.cover} h={32} radius={8} /></div>
                          <div>
                            <div style={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>{T.val(e.title, lang)}</div>
                            <div style={{ fontSize: 11.5, color: "var(--ink-faint)", fontWeight: 600 }}>{T.fmtDate(e.date, lang)}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{e.invited}</td>
                      <td style={{ fontWeight: 600 }}>{e.attended}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{ width: 54, height: 6, borderRadius: 4, background: "var(--line)", overflow: "hidden" }}>
                            <div style={{ width: rate + "%", height: "100%", background: rate >= 80 ? "var(--success)" : rate >= 65 ? "var(--gold)" : "var(--danger)" }} />
                          </div>
                          <span style={{ fontWeight: 700, fontSize: 12.5 }}>{rate}%</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: "var(--gold)" }}>+{e.attended * D.pointsFor(e)}</td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>{D.yen(f.revenue)}</td>
                      <td style={{ textAlign: "right", color: "var(--ink-soft)" }}>{D.yen(f.costs)}</td>
                      <td style={{ textAlign: "right", fontWeight: 800, color: f.net >= 0 ? "var(--success)" : "var(--danger)" }}>{D.yen(f.net)}</td>
                      <td style={{ textAlign: "right", width: 44 }}>
                        <EventMenu e={e} lang={lang} onEdit={() => onEdit(e)} onCheckin={() => onCheckin(e)} onDuplicate={() => onDuplicate(e)} onDelete={() => onDelete(e.id)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminMembers({ lang, eventById }) {
  const D = window.BL_DATA, T = window.BL_I18N;
  const byId = eventById || D.eventById;
  const [q, setQ] = React.useState("");
  const tierColor = { Insider: "var(--primary)", Regular: "var(--gold)", Guest: "var(--ink-faint)" };
  const list = D.members.filter((m) => m.name.toLowerCase().includes(q.toLowerCase()));
  const repeat = Math.round((D.members.filter((m) => m.attended >= 3).length / D.members.length) * 100);
  return (
    <div style={{ padding: "26px 30px 40px" }}>
      <PageHead title={T.t("membersAdm", lang)} sub={`100 ${T.t("allMembers", lang)}`} lang={lang} cta={T.t("export", lang)} ctaIcon="download" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        <Metric label={T.t("activeMembers", lang)} value={D.members.filter((m) => m.status === "active").length} sub={lang === "jp" ? "過去30日" : "last 30 days"} />
        <Metric label={T.t("retention", lang)} value={repeat + "%"} sub={lang === "jp" ? "3回以上参加" : "attended 3+ events"} accent="var(--success)" />
        <Metric label={T.t("lifetimeSpend", lang)} value={D.yen(D.members.reduce((s, m) => s + m.spend, 0))} sub={lang === "jp" ? "全会員合計" : "all members"} />
        <Metric label={lang === "jp" ? "離脱傾向" : "Lapsing"} value={D.members.filter((m) => m.status === "lapsing").length} sub={lang === "jp" ? "再アプローチ推奨" : "worth re-inviting"} accent="var(--danger)" />
      </div>

      <div className="metric" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fbf6ee", border: "1px solid var(--line)", borderRadius: 9, padding: "7px 12px", flex: 1, maxWidth: 320 }}>
            <Icon name="search" size={15} color="var(--ink-faint)" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={T.t("search", lang)} style={{ border: 0, background: "transparent", outline: "none", fontSize: 13, fontFamily: "var(--font-ui)", width: "100%", color: "var(--ink)" }} />
          </div>
          <span style={{ fontSize: 12, color: "var(--ink-faint)", fontWeight: 600 }}>{list.length} {lang === "jp" ? "件" : "results"}</span>
        </div>
        <div style={{ maxHeight: 360, overflowY: "auto" }}>
          <table className="tbl">
            <thead style={{ position: "sticky", top: 0, background: "#fff", zIndex: 2 }}>
              <tr>
                <th>{T.t("member", lang) || "Member"}</th><th>{T.t("tier", lang)}</th>
                <th>{T.t("eventsAtt", lang)}</th><th>{T.t("yourPoints", lang)}</th>
                <th style={{ textAlign: "right" }}>{T.t("lifetimeSpend", lang)}</th>
                <th>{T.t("lastSeen", lang)}</th><th>{T.t("status", lang)}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((m) => {
                const le = byId(m.last);
                return (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: tierColor[m.tier], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontFamily: "var(--font-display)", fontSize: 13, flex: "0 0 32px" }}>{m.name[0]}</div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{m.name} <span style={{ marginLeft: 2 }}>{m.country}</span></div>
                        </div>
                      </div>
                    </td>
                    <td><span className="tag" style={{ background: tierColor[m.tier] + "1f", color: tierColor[m.tier] }}>{m.tier}</span></td>
                    <td style={{ fontWeight: 600 }}>{m.attended}</td>
                    <td style={{ fontWeight: 700, color: "var(--gold)" }}>{m.points}</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>{D.yen(m.spend)}</td>
                    <td style={{ color: "var(--ink-soft)", fontSize: 12 }}>{le ? T.val(le.title, lang) : "—"}</td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: m.status === "active" ? "var(--success)" : "var(--danger)" }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: m.status === "active" ? "var(--success)" : "var(--danger)" }} />
                        {m.status === "active" ? T.t("active", lang) : T.t("lapsing", lang)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PageHead({ title, sub, lang, cta, ctaIcon, onCta }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 22 }}>
      <div>
        <h1 style={{ fontSize: 28 }}>{title}</h1>
        <div style={{ color: "var(--ink-faint)", fontSize: 13.5, fontWeight: 600, marginTop: 4 }}>{sub}</div>
      </div>
      {cta && (
        <button className="btn btn-primary btn-sm" style={{ padding: "10px 16px" }} onClick={onCta}>
          <Icon name={ctaIcon || "plus"} size={15} color="#fff" /> {cta}
        </button>
      )}
    </div>
  );
}

function Legend({ items }) {
  return (
    <div style={{ display: "flex", gap: 14 }}>
      {items.map(([l, c]) => (
        <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--ink-soft)" }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: c }} /> {l}
        </span>
      ))}
    </div>
  );
}

function blFmtISO(d) { const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0"); return `${y}-${m}-${day}`; }
function blAddDays(iso, n) { const d = new Date(iso + "T00:00:00"); d.setDate(d.getDate() + n); return blFmtISO(d); }
function blAddMonths(iso, n) { const d = new Date(iso + "T00:00:00"); d.setMonth(d.getMonth() + n); return blFmtISO(d); }
function seriesDates(start, freq, count) {
  const out = [];
  for (let i = 0; i < count; i++) {
    if (freq === "weekly") out.push(blAddDays(start, 7 * i));
    else if (freq === "biweekly") out.push(blAddDays(start, 14 * i));
    else if (freq === "monthly") out.push(blAddMonths(start, i));
    else out.push(start);
  }
  return out;
}

function AdminCreateEvent({ lang, initial, onClose, onSave }) {
  const D = window.BL_DATA, T = window.BL_I18N;
  const init = initial && initial.id ? initial : null;
  const editing = !!init;
  const [f, setF] = React.useState(() => ({
    titleEn: init ? (init.title.en || "") : "", titleJp: init ? (init.title.jp || "") : "",
    category: init ? init.category : "cultural", cover: init ? init.cover : "matsuri",
    date: init ? init.date : "2026-07-04", start: init ? init.time : "18:30", end: init ? init.endTime : "22:00",
    venueEn: init ? (init.venue.en || "") : "", venueJp: init ? (init.venue.jp || "") : "",
    areaEn: init ? (init.area.en || "") : "", areaJp: init ? (init.area.jp || "") : "",
    price: init ? init.price : 2500, capacity: init ? init.capacity : 20, points: init ? init.points : 1, invited: init ? init.invited : 30,
    cost: init ? (init.cost || 0) : 30000,
    descEn: init && init.desc ? init.desc.en : "", descJp: init && init.desc ? init.desc.jp : "",
    repeat: "none", repeatCount: 4,
  }));
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const fld = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid var(--line)", background: "#fbf6ee", fontSize: 13.5, fontFamily: "var(--font-ui)", color: "var(--ink)", outline: "none", boxSizing: "border-box" };
  const lbl = { fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 6, display: "block" };
  const sec = { background: "#fff", border: "1px solid var(--line)", borderRadius: 16, padding: "18px 20px", marginBottom: 16 };
  const secTitle = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginBottom: 15, display: "flex", alignItems: "center", gap: 8 };
  const onF = (e) => (e.target.style.borderColor = "var(--primary)");
  const onB = (e) => (e.target.style.borderColor = "var(--line)");

  const ttl = { en: f.titleEn || T.t("untitled", lang), jp: f.titleJp || f.titleEn || T.t("untitled", lang) };
  const area = { en: f.areaEn || (lang === "jp" ? "エリア" : "Area"), jp: f.areaJp || f.areaEn || "エリア" };
  const cat = D.categories[f.category];
  const price = Number(f.price) || 0, cap = Number(f.capacity) || 0, cost = Number(f.cost) || 0;
  const revenue = price * cap;
  const pointsPer = Math.floor(price / 100);
  const ptsFull = cap * pointsPer;
  const be = price > 0 ? Math.ceil(cost / price) : 0;
  const beOver = be > cap;
  const profitFull = revenue - cost;
  const costPer = cap > 0 ? Math.round(cost / cap) : 0;
  const buildEvent = (status) => ({
    id: init ? init.id : ("e" + Date.now().toString().slice(-6)),
    slug: init ? init.slug : ((f.titleEn || "event").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")),
    cover: f.cover, category: f.category,
    title: { en: f.titleEn || "Untitled event", jp: f.titleJp || f.titleEn || "無題のイベント" },
    date: f.date, time: f.start, endTime: f.end,
    venue: { en: f.venueEn || "TBA", jp: f.venueJp || f.venueEn || "未定" },
    area: { en: f.areaEn || "Kyoto", jp: f.areaJp || f.areaEn || "京都" },
    price, capacity: cap, cost,
    blurb: { en: (f.descEn || "").slice(0, 90) || f.titleEn || "", jp: (f.descJp || "").slice(0, 60) || f.titleJp || "" },
    desc: { en: f.descEn, jp: f.descJp },
    invited: Number(f.invited) || 0,
    rsvp: init ? (init.rsvp != null ? init.rsvp : 0) : 0,
    gallery: init ? (init.gallery || 0) : 0,
    points: Math.floor((Number(f.price) || 0) / 100),
    lat: init ? init.lat : 35.0036, lng: init ? init.lng : 135.77,
    attended: init && init.attended != null ? init.attended : null,
    status,
  });
  const seriesN = (!editing && f.repeat !== "none") ? Math.max(1, Number(f.repeatCount) || 1) : 1;
  const previewDates = seriesDates(f.date, f.repeat, seriesN);
  const buildSeries = (status) => {
    const base = buildEvent(status);
    return seriesDates(f.date, f.repeat, seriesN).map((d, i) => ({
      ...base,
      id: i === 0 ? base.id : base.id + "-r" + i,
      slug: base.slug + (i ? "-" + (i + 1) : ""),
      date: d,
    }));
  };
  const doSave = (status) => onSave(seriesN > 1 ? buildSeries(status) : buildEvent(status));

  return (
    <div style={{ height: "100%", display: "flex", minHeight: 0 }}>
      {/* form column */}
      <div style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: "24px 30px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <button onClick={onClose} style={{ all: "unset", cursor: "pointer", width: 38, height: 38, borderRadius: 11, background: "#fff", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="arrowL" size={19} color="var(--ink)" />
            </button>
            <div>
              <h1 style={{ fontSize: 25 }}>{editing ? T.t("editEvent", lang) : T.t("createEvent", lang)}</h1>
              <div style={{ color: "var(--ink-faint)", fontSize: 13, fontWeight: 600, marginTop: 2 }}>{editing ? (init.status === "draft" ? T.t("draftHidden", lang) : init.status === "published" ? T.t("liveOnSite", lang) : (lang === "jp" ? "終了したイベント" : "Completed event")) : (lang === "jp" ? "公開すると、公開サイトに表示されます" : "Once published, this appears on the public site")}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {(!editing || init.status === "draft") && (
              <button className="btn btn-ghost btn-sm" onClick={() => doSave("draft")}>{T.t("saveDraft", lang)}</button>
            )}
            {editing && init.status === "published" && (
              <button className="btn btn-ghost btn-sm" onClick={() => doSave("draft")}>{T.t("unpublish", lang)}</button>
            )}
            <button className="btn btn-primary btn-sm" onClick={() => doSave(editing && init.status === "completed" ? "completed" : "published")}>
              <Icon name="check" size={15} color="#fff" /> {editing ? (init.status === "draft" ? T.t("publish", lang) : T.t("saveChanges", lang)) : T.t("publish", lang) + (seriesN > 1 ? " ×" + seriesN : "")}
            </button>
          </div>
        </div>

        {/* basics */}
        <div style={sec}>
          <div style={secTitle}><Icon name="sparkle" size={16} color="var(--primary)" /> {T.t("eventTitle", lang)}</div>
          <div style={{ marginBottom: 14 }}>
            <span style={lbl}>{T.t("coverStyle", lang)}</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {Object.keys(D.covers).map((k) => (
                <button key={k} onClick={() => set("cover", k)} style={{ all: "unset", cursor: "pointer", width: 64, height: 40, borderRadius: 9, overflow: "hidden", boxShadow: f.cover === k ? "0 0 0 2.5px var(--primary)" : "0 0 0 1.5px var(--line)" }}>
                  <Cover seed={k} h={40} />
                </button>
              ))}
              <span style={{ width: 64, height: 40, borderRadius: 9, border: "1.5px dashed var(--line)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--ink-faint)", fontSize: 9, fontWeight: 700, gap: 2, cursor: "pointer" }}>
                <Icon name="download" size={14} color="var(--ink-faint)" /> {T.t("uploadPhoto", lang)}
              </span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <label><span style={lbl}>{T.t("titleEnL", lang)}</span><input style={fld} value={f.titleEn} onChange={(e) => set("titleEn", e.target.value)} onFocus={onF} onBlur={onB} placeholder="Midsummer Yukata Night" /></label>
            <label><span style={lbl}>{T.t("titleJpL", lang)}</span><input style={fld} value={f.titleJp} onChange={(e) => set("titleJp", e.target.value)} onFocus={onF} onBlur={onB} placeholder="真夏の浴衣ナイト" /></label>
          </div>
          <div>
            <span style={lbl}>{T.t("category", lang)}</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.keys(D.categories).map((k) => {
                const c = D.categories[k], on = f.category === k;
                return <button key={k} onClick={() => set("category", k)} style={{ all: "unset", cursor: "pointer", padding: "7px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, background: on ? c.color : "#fbf6ee", color: on ? "#fff" : "var(--ink-soft)", boxShadow: "0 0 0 1.5px " + (on ? c.color : "var(--line)") }}>{T.val(c, lang)}</button>;
              })}
            </div>
          </div>
        </div>

        {/* when & where */}
        <div style={sec}>
          <div style={secTitle}><Icon name="pin" size={16} color="var(--primary)" /> {T.t("dateTime", lang)} · {T.t("location", lang)}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
            <label><span style={lbl}>{T.t("dateTime", lang)}</span><input type="date" style={fld} value={f.date} onChange={(e) => set("date", e.target.value)} onFocus={onF} onBlur={onB} /></label>
            <label><span style={lbl}>{T.t("startT", lang)}</span><input type="time" style={fld} value={f.start} onChange={(e) => set("start", e.target.value)} onFocus={onF} onBlur={onB} /></label>
            <label><span style={lbl}>{T.t("endT", lang)}</span><input type="time" style={fld} value={f.end} onChange={(e) => set("end", e.target.value)} onFocus={onF} onBlur={onB} /></label>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <label><span style={lbl}>{T.t("venueEnL", lang)} (EN)</span><input style={fld} value={f.venueEn} onChange={(e) => set("venueEn", e.target.value)} onFocus={onF} onBlur={onB} placeholder="Kamogawa Riverbank" /></label>
            <label><span style={lbl}>{T.t("venueEnL", lang)} (JP)</span><input style={fld} value={f.venueJp} onChange={(e) => set("venueJp", e.target.value)} onFocus={onF} onBlur={onB} placeholder="鴨川河川敷" /></label>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label><span style={lbl}>{T.t("areaL", lang)} (EN)</span><input style={fld} value={f.areaEn} onChange={(e) => set("areaEn", e.target.value)} onFocus={onF} onBlur={onB} placeholder="Pontocho" /></label>
            <label><span style={lbl}>{T.t("areaL", lang)} (JP)</span><input style={fld} value={f.areaJp} onChange={(e) => set("areaJp", e.target.value)} onFocus={onF} onBlur={onB} placeholder="先斎町" /></label>
          </div>
        </div>

        {/* recurrence */}
        {!editing && (
          <div style={sec}>
            <div style={secTitle}><Icon name="calendar" size={16} color="var(--primary)" /> {T.t("repeat", lang)}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[["none", "repeatNone"], ["weekly", "repeatWeekly"], ["biweekly", "repeatBiweekly"], ["monthly", "repeatMonthly"]].map(([k, key]) => {
                const on = f.repeat === k;
                return <button key={k} onClick={() => set("repeat", k)} style={{ all: "unset", cursor: "pointer", padding: "8px 15px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, background: on ? "var(--primary)" : "#fbf6ee", color: on ? "#fff" : "var(--ink-soft)", boxShadow: "0 0 0 1.5px " + (on ? "var(--primary)" : "var(--line)") }}>{T.t(key, lang)}</button>;
              })}
            </div>
            {f.repeat !== "none" && (
              <div style={{ marginTop: 15 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)" }}>{T.t("occurrences", lang)}</span>
                  <div style={{ display: "flex", alignItems: "center", border: "1.5px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
                    <button onClick={() => set("repeatCount", Math.max(2, (Number(f.repeatCount) || 2) - 1))} style={{ all: "unset", cursor: "pointer", width: 34, height: 34, textAlign: "center", fontWeight: 800, fontSize: 18, color: "var(--ink-soft)" }}>−</button>
                    <span style={{ minWidth: 40, textAlign: "center", fontWeight: 800, fontSize: 15, fontFamily: "var(--font-display)" }}>{f.repeatCount}</span>
                    <button onClick={() => set("repeatCount", Math.min(24, (Number(f.repeatCount) || 2) + 1))} style={{ all: "unset", cursor: "pointer", width: 34, height: 34, textAlign: "center", fontWeight: 800, fontSize: 18, color: "var(--ink-soft)" }}>+</button>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 7 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", marginRight: 2 }}>{T.t("willCreate", lang)} {seriesN} {T.t("eventsWord", lang)}:</span>
                  {previewDates.slice(0, 6).map((d, i) => (<span key={i} className="tag" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>{T.fmtDate(d, lang)}</span>))}
                  {previewDates.length > 6 && <span style={{ fontSize: 11, color: "var(--ink-faint)", fontWeight: 700 }}>+{previewDates.length - 6} {T.t("moreDates", lang)}</span>}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-faint)", fontWeight: 600, marginTop: 10 }}>{T.t("recurHint", lang)}</div>
              </div>
            )}
          </div>
        )}

        {/* pricing */}
        <div style={sec}>
          <div style={secTitle}><Icon name="ticket" size={16} color="var(--primary)" /> {T.t("pricingCap", lang)}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
            <label><span style={lbl}>{T.t("priceL", lang)}</span><input type="number" style={fld} value={f.price} onChange={(e) => set("price", e.target.value)} onFocus={onF} onBlur={onB} /></label>
            <label><span style={lbl}>{T.t("capacityL", lang)}</span><input type="number" style={fld} value={f.capacity} onChange={(e) => set("capacity", e.target.value)} onFocus={onF} onBlur={onB} /></label>
            <label><span style={lbl}>{T.t("autoPoints", lang)}</span>
              <div style={{ ...fld, background: "#f1e7d8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 800, color: "var(--gold)", display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="star" size={13} color="var(--gold)" fill="var(--gold)" /> {pointsPer}</span>
                <span style={{ fontSize: 10, color: "var(--ink-faint)", fontWeight: 600 }}>{T.t("perYenHint", lang)}</span>
              </div>
            </label>
            <label><span style={lbl}>{T.t("invitedL", lang)}</span><input type="number" style={fld} value={f.invited} onChange={(e) => set("invited", e.target.value)} onFocus={onF} onBlur={onB} /></label>
          </div>
        </div>

        {/* costs & break-even */}
        <div style={sec}>
          <div style={secTitle}><Icon name="scale" size={16} color="var(--primary)" /> {T.t("costsBreak", lang)}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr", gap: 14, alignItems: "end" }}>
            <label><span style={lbl}>{T.t("totalCost", lang)}</span><input type="number" style={fld} value={f.cost} onChange={(e) => set("cost", e.target.value)} onFocus={onF} onBlur={onB} /></label>
            <div style={{ background: beOver ? "#f8e8e3" : "var(--success-soft)", borderRadius: 11, padding: "10px 15px", display: "flex", alignItems: "center", gap: 13 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, color: beOver ? "var(--danger)" : "var(--success)", lineHeight: 1 }}>{be}</div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-soft)", lineHeight: 1.35 }}>
                {T.t("breakEvenAtt", lang)}
                <div style={{ color: beOver ? "var(--danger)" : "var(--ink-faint)", fontWeight: 600 }}>{beOver ? T.t("needMore", lang) : `${be} / ${cap} ${T.t("ofCapacity", lang)}`}</div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-faint)", fontWeight: 600, marginTop: 9 }}>{T.t("costHint", lang)}</div>
        </div>

        {/* description */}
        <div style={sec}>
          <div style={secTitle}><Icon name="chart" size={16} color="var(--primary)" /> {T.t("descL", lang)}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label><span style={lbl}>{T.t("descEnL", lang)}</span><textarea style={{ ...fld, minHeight: 96, resize: "vertical" }} value={f.descEn} onChange={(e) => set("descEn", e.target.value)} onFocus={onF} onBlur={onB} placeholder="Tell people what to expect…" /></label>
            <label><span style={lbl}>{T.t("descJpL", lang)}</span><textarea style={{ ...fld, minHeight: 96, resize: "vertical" }} value={f.descJp} onChange={(e) => set("descJp", e.target.value)} onFocus={onF} onBlur={onB} placeholder="イベントの内容を記入…" /></label>
          </div>
        </div>
      </div>

      {/* preview column */}
      <div style={{ width: 372, flex: "0 0 372px", borderLeft: "1px solid var(--line)", background: "#f1e7d8", overflowY: "auto", padding: "24px 22px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14, color: "var(--ink-soft)" }}>
          <Icon name="globe" size={15} color="var(--ink-soft)" />
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>{T.t("livePreview", lang)}</span>
        </div>

        {/* preview card */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, overflow: "hidden", boxShadow: "var(--shadow)" }}>
          <Cover seed={f.cover} h={150} label>
            <div style={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", justifyContent: "space-between" }}>
              <span className="tag" style={{ background: cat.color + "e0", color: "#fff" }}>{T.val(cat, lang)}</span>
              <span className="sticker" style={{ fontSize: 11, padding: "4px 9px" }}>{T.relDay(f.date, lang)}</span>
            </div>
            <div style={{ position: "absolute", left: 14, bottom: 12, right: 14 }}>
              <div style={{ color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, lineHeight: 1.18, textShadow: "0 2px 12px rgba(0,0,0,.45)" }}>{T.val(ttl, lang)}</div>
            </div>
          </Cover>
          <div style={{ padding: "13px 15px 15px" }}>
            <div style={{ display: "flex", gap: 14, color: "var(--ink-soft)", fontSize: 12, fontWeight: 600, marginBottom: 10, flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}><Icon name="calendar" size={13} color="var(--primary)" /> {T.fmtDate(f.date, lang)} · {f.start}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}><Icon name="pin" size={13} color="var(--primary)" /> {T.val(area, lang)}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, whiteSpace: "nowrap" }}>{Number(f.price) ? D.yen(Number(f.price)) : T.t("free", lang)}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--gold)", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}><Icon name="star" size={12} color="var(--gold)" fill="var(--gold)" /> +{pointsPer} {T.t("points", lang)}</span>
            </div>
          </div>
        </div>

        {/* projections */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginTop: 16 }}>
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 13, padding: "13px 14px" }}>
            <div style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 600 }}>{T.t("projRevenue", lang)}</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, color: "var(--ink)", marginTop: 5 }}>{D.yen(revenue)}</div>
            <div style={{ fontSize: 10.5, color: "var(--ink-faint)", fontWeight: 600, marginTop: 2 }}>{cap} × {D.yen(price)} {T.t("atCapacity", lang)}</div>
          </div>
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 13, padding: "13px 14px" }}>
            <div style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 600 }}>{T.t("profitFull", lang)}</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, color: profitFull >= 0 ? "var(--success)" : "var(--danger)", marginTop: 5 }}>{D.yen(profitFull)}</div>
            <div style={{ fontSize: 10.5, color: "var(--ink-faint)", fontWeight: 600, marginTop: 2 }}>{T.t("revenue", lang).toLowerCase()} − {T.t("costs", lang).toLowerCase()}</div>
          </div>
        </div>

        {/* break-even bar */}
        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 13, padding: "14px 15px", marginTop: 11 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 9 }}>
            <span style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}><Icon name="scale" size={14} color="var(--primary)" /> {T.t("breakEven", lang)}</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: beOver ? "var(--danger)" : "var(--success)" }}>{be} <span style={{ fontSize: 11, color: "var(--ink-faint)", fontWeight: 600 }}>/ {cap}</span></span>
          </div>
          <div style={{ position: "relative", height: 8, borderRadius: 5, background: "var(--line)", overflow: "hidden" }}>
            <div style={{ width: Math.min(100, cap > 0 ? (be / cap) * 100 : 0) + "%", height: "100%", background: beOver ? "var(--danger)" : "var(--success)" }} />
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-faint)", fontWeight: 600, marginTop: 7 }}>{beOver ? T.t("needMore", lang) : `${be} ${T.t("breakEvenAtt", lang)}`}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginTop: 11 }}>
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 13, padding: "13px 14px" }}>
            <div style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 600 }}>{T.t("ptsIfFull", lang)}</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, color: "var(--gold)", marginTop: 5 }}>{ptsFull}</div>
            <div style={{ fontSize: 10.5, color: "var(--ink-faint)", fontWeight: 600, marginTop: 2 }}>{cap} × {pointsPer} {T.t("point", lang)}</div>
          </div>
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 13, padding: "13px 14px" }}>
            <div style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 600 }}>{T.t("perHead", lang)}</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, color: "var(--ink)", marginTop: 5 }}>{D.yen(costPer)}</div>
            <div style={{ fontSize: 10.5, color: "var(--ink-faint)", fontWeight: 600, marginTop: 2 }}>{D.yen(cost)} ÷ {cap}</div>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 13, padding: "13px 14px", marginTop: 11, display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 38px" }}><Icon name="users" size={18} color="var(--primary)" /></div>
          <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, lineHeight: 1.25 }}>{f.invited || 0} {T.t("invited", lang).toLowerCase()} · {f.capacity || 0} {T.t("capacityL", lang).toLowerCase()}</div>
            <div style={{ fontSize: 11, color: "var(--ink-faint)", fontWeight: 600, lineHeight: 1.3 }}>{lang === "jp" ? "参加率は開催後に記録" : "Show-up rate tracked after the event"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminCheckIn({ lang, event, onClose, onComplete }) {
  const D = window.BL_DATA, T = window.BL_I18N;
  const invited = event.invited || 0;
  const roster = D.members.slice(0, invited);
  const [present, setPresent] = React.useState(() => {
    const s = new Set();
    if (event.attended != null) D.members.slice(0, event.attended).forEach((m) => s.add(m.id));
    return s;
  });
  const [q, setQ] = React.useState("");
  const toggle = (id) => setPresent((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const count = present.size;
  const price = Number(event.price) || 0, cost = Number(event.cost) || 0;
  const revenue = count * price, net = revenue - cost;
  const showUp = invited > 0 ? Math.round((count / invited) * 100) : 0;
  const pts = count * D.pointsFor(event);
  const tierColor = { Insider: "var(--primary)", Regular: "var(--gold)", Guest: "var(--ink-faint)" };
  const list = roster.filter((m) => m.name.toLowerCase().includes(q.toLowerCase()));
  const done = event.attended != null;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ padding: "20px 30px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13, minWidth: 0 }}>
          <button onClick={onClose} style={{ all: "unset", cursor: "pointer", width: 38, height: 38, borderRadius: 11, background: "#fff", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 38px" }}>
            <Icon name="arrowL" size={19} color="var(--ink)" />
          </button>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <h1 style={{ fontSize: 22, whiteSpace: "nowrap" }}>{T.t("checkinTitle", lang)}</h1>
              {done && <StatusPill status="completed" lang={lang} />}
            </div>
            <div style={{ color: "var(--ink-faint)", fontSize: 13, fontWeight: 600, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{T.val(event.title, lang)} · {T.fmtDate(event.date, lang)}</div>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => onComplete(event, count)} style={{ flex: "0 0 auto" }}>
          <Icon name="checkCircle" size={17} color="#fff" /> {T.t("finishRecord", lang)}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "22px 30px 40px", display: "grid", gridTemplateColumns: "300px 1fr", gap: 22, alignItems: "start" }}>
        {/* stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 13, position: "sticky", top: 0 }}>
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 16, padding: "22px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Ring value={showUp} size={124} sw={11} color="var(--primary)">
              <div style={{ textAlign: "center" }}>
                <div className="stat-num" style={{ fontSize: 34, color: "var(--primary)" }}>{count}</div>
                <div style={{ fontSize: 12, color: "var(--ink-faint)", fontWeight: 700 }}>/ {invited}</div>
              </div>
            </Ring>
            <div style={{ marginTop: 13, fontSize: 14, fontWeight: 800, whiteSpace: "nowrap" }}>{count} {T.t("checkedIn", lang)}</div>
            <div style={{ fontSize: 12, color: "var(--ink-faint)", fontWeight: 600, whiteSpace: "nowrap" }}>{showUp}% {T.t("ofInvited", lang)}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
            <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 13, padding: "12px 13px" }}>
              <div style={{ fontSize: 10.5, color: "var(--ink-soft)", fontWeight: 700 }}>{T.t("actualRev", lang)}</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, marginTop: 4 }}>{D.yen(revenue)}</div>
            </div>
            <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 13, padding: "12px 13px" }}>
              <div style={{ fontSize: 10.5, color: "var(--ink-soft)", fontWeight: 700 }}>{T.t("actualNet", lang)}</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, marginTop: 4, color: net >= 0 ? "var(--success)" : "var(--danger)" }}>{D.yen(net)}</div>
            </div>
          </div>
          <div style={{ background: "var(--gold-soft)", borderRadius: 13, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="star" size={18} color="var(--gold)" fill="var(--gold)" />
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap" }}>{pts} {T.t("ptsAwarded", lang)}</div>
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-faint)", fontWeight: 600, lineHeight: 1.45, padding: "0 2px" }}>{T.t("recordHint", lang)}</div>
        </div>

        {/* guest list */}
        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "13px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginRight: "auto" }}>{T.t("doorList", lang)}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: "#fbf6ee", border: "1px solid var(--line)", borderRadius: 9, padding: "6px 11px", width: 190 }}>
              <Icon name="search" size={14} color="var(--ink-faint)" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={T.t("searchGuest", lang)} style={{ border: 0, background: "transparent", outline: "none", fontSize: 12.5, fontFamily: "var(--font-ui)", width: "100%", color: "var(--ink)" }} />
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => setPresent(new Set(roster.map((m) => m.id)))}>{T.t("markAll", lang)}</button>
            <button className="btn btn-sm btn-ghost" onClick={() => setPresent(new Set())}>{T.t("clearAll", lang)}</button>
          </div>
          <div>
            {list.map((m, i) => {
              const on = present.has(m.id);
              return (
                <div key={m.id} onClick={() => toggle(m.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderBottom: i < list.length - 1 ? "1px solid var(--line-soft)" : "0", cursor: "pointer", background: on ? "var(--success-soft)" : "transparent" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: tierColor[m.tier], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontFamily: "var(--font-display)", fontSize: 13, flex: "0 0 34px" }}>{m.name[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{m.name} <span style={{ marginLeft: 2 }}>{m.country}</span></div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-faint)", fontWeight: 600 }}>{m.tier} · {m.points} {T.t("points", lang)}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700, color: on ? "var(--success)" : "var(--ink-faint)" }}>
                    {on ? T.t("present", lang) : ""}
                    <div style={{ width: 26, height: 26, borderRadius: "50%", border: on ? "0" : "2px solid var(--line)", background: on ? "var(--success)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {on && <Icon name="check" size={15} color="#fff" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminApp({ lang, events, eventById, onSave, onDelete }) {
  const T = window.BL_I18N;
  const [tab, setTab] = React.useState("overview");
  const [editor, setEditor] = React.useState(null); // null | {} (new) | event (edit)
  const [checkin, setCheckin] = React.useState(null); // null | event
  const busy = editor !== null || checkin !== null;
  const openNew = () => { setCheckin(null); setEditor({}); };
  const duplicate = (e) => {
    const id = "e" + Date.now().toString().slice(-6);
    onSave({ ...e, id, title: { en: (e.title.en || "") + T.t("copySuffix", lang), jp: (e.title.jp || "") + T.t("copySuffix", lang) }, status: "draft", attended: null, rsvp: 0, gallery: 0 });
    setEditor(null); setCheckin(null); setTab("events");
  };
  const nav = [
    { k: "overview", i: "grid", t: T.t("overview", lang) },
    { k: "events", i: "calendar", t: T.t("eventsAdm", lang) },
    { k: "members", i: "users", t: T.t("membersAdm", lang) },
  ];
  return (
    <div className="dt-body">
      <div className="adm-side">
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 10px 20px" }}>
          <img src="uploads/logo-1781081301145.jpg" style={{ width: 34, height: 34, borderRadius: "50%" }} />
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "#f6efe2", letterSpacing: ".1em", fontSize: 15 }}>BORDERLESS</div>
            <div style={{ fontSize: 9.5, letterSpacing: ".2em", color: "#9a8b7d", textTransform: "uppercase" }}>{lang === "jp" ? "管理画面" : "Admin"}</div>
          </div>
        </div>
        {nav.map((n) => (
          <div key={n.k} className={"nav-i" + (tab === n.k && !busy ? " on" : "")} onClick={() => { setEditor(null); setCheckin(null); setTab(n.k); }}>
            <Icon name={n.i} size={17} color={tab === n.k && !busy ? "#fff" : "#c9bcab"} /> {n.t}
          </div>
        ))}
        <button onClick={openNew} style={{ all: "unset", cursor: "pointer", marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", borderRadius: 11, background: editor ? "var(--primary)" : "rgba(255,255,255,.08)", color: "#fff", fontSize: 13, fontWeight: 700 }}>
          <Icon name="plus" size={16} color="#fff" /> {T.t("newEvent", lang)}
        </button>
        <div style={{ marginTop: "auto", padding: "14px 12px", borderTop: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, fontFamily: "var(--font-display)" }}>B</div>
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#f2ebdd" }}>{lang === "jp" ? "財務担当" : "Finance manager"}</div>
            <div style={{ fontSize: 10.5, color: "#9a8b7d" }}>borderless.kyoto</div>
          </div>
        </div>
      </div>
      <div className="adm-main">
        {checkin !== null ? (
          <AdminCheckIn lang={lang} event={checkin} onClose={() => setCheckin(null)}
            onComplete={(ev, count) => { onSave({ ...ev, status: "completed", attended: count }); setCheckin(null); setTab("events"); }} />
        ) : editor !== null ? (
          <AdminCreateEvent lang={lang} initial={editor} onClose={() => setEditor(null)}
            onSave={(ev) => { onSave(ev); setEditor(null); setTab("events"); }} />
        ) : <>
          {tab === "overview" && <AdminOverview lang={lang} events={events} />}
          {tab === "events" && <AdminEvents lang={lang} events={events} onNew={openNew} onEdit={(e) => setEditor(e)} onCheckin={(e) => setCheckin(e)} onDuplicate={duplicate} onDelete={onDelete} />}
          {tab === "members" && <AdminMembers lang={lang} eventById={eventById} />}
        </>}
      </div>
    </div>
  );
}

Object.assign(window, { AdminApp });
