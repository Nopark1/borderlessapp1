/* ============================================================
   Borderless — member area (member.jsx)
   Auth sheet + points dashboard + profile. Phone frame.
   ============================================================ */

function AuthSheet({ lang, mode, setMode, onClose, onAuth }) {
  const T = window.BL_I18N;
  const isLogin = mode === "login";
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 80, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(20,12,10,.5)", backdropFilter: "blur(2px)" }} />
      <div className="fade-up" style={{ position: "relative", background: "var(--paper)", borderRadius: "28px 28px 0 0",
        padding: "10px 22px 30px", boxShadow: "0 -10px 40px rgba(0,0,0,.3)" }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: "var(--line)", margin: "0 auto 18px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <img src="uploads/logo-1781081301145.jpg" style={{ width: 44, height: 44, borderRadius: "50%", boxShadow: "var(--shadow-sm)" }} />
          <div>
            <h2 style={{ fontSize: 22 }}>{isLogin ? T.t("welcome", lang) : T.t("joinTitle", lang)}</h2>
          </div>
        </div>
        <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.5, margin: "0 0 20px" }}>{T.t("authPerk", lang)}</p>

        {!isLogin && <Field label={T.t("name", lang)} placeholder="Aoi Tanaka" />}
        <Field label={T.t("email", lang)} placeholder="you@email.com" />
        <Field label={T.t("password", lang)} placeholder="••••••••" type="password" />

        <button className="btn btn-primary btn-block" style={{ marginTop: 8, padding: "14px" }} onClick={onAuth}>
          {isLogin ? T.t("signIn", lang) : T.t("createAcc", lang)}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
          <div className="hr" style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: ".1em" }}>{T.t("or", lang)}</span>
          <div className="hr" style={{ flex: 1 }} />
        </div>
        <button className="btn btn-ghost btn-block" style={{ padding: "13px", background: "#fff" }} onClick={onAuth}>
          <span style={{ fontWeight: 700, color: "#4285F4" }}>G</span> {T.t("continueG", lang)}
        </button>

        <div style={{ textAlign: "center", fontSize: 13, color: "var(--ink-soft)", marginTop: 18 }}>
          {isLogin ? T.t("noAccount", lang) : T.t("haveAccount", lang)}{" "}
          <button onClick={() => setMode(isLogin ? "signup" : "login")} style={{ all: "unset", color: "var(--primary)", fontWeight: 700, cursor: "pointer" }}>
            {isLogin ? T.t("createAcc", lang) : T.t("signIn", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, placeholder, type = "text" }) {
  return (
    <label style={{ display: "block", marginBottom: 13 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", display: "block", marginBottom: 6 }}>{label}</span>
      <input type={type} placeholder={placeholder} style={{ width: "100%", padding: "13px 15px", borderRadius: 13,
        border: "1.5px solid var(--line)", background: "#fff", fontSize: 14.5, fontFamily: "var(--font-ui)", color: "var(--ink)", outline: "none" }}
        onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
        onBlur={(e) => e.target.style.borderColor = "var(--line)"} />
    </label>
  );
}

function MemberDashboard({ lang, onOpen, joinedMap, eventById }) {
  const D = window.BL_DATA, T = window.BL_I18N, me = D.me;
  const byId = eventById || D.eventById;
  const tiers = D.tiers;
  const curIdx = tiers.findIndex((x) => x.key === me.tier);
  const next = tiers[curIdx + 1];
  const tierColor = tiers[curIdx].color;
  const progress = next ? Math.min(100, ((me.points - tiers[curIdx].min) / (next.min - tiers[curIdx].min)) * 100) : 100;
  const ptsToNext = next ? next.min - me.points : 0;
  const myUpcoming = me.upcomingRsvp.map((id) => byId(id)).filter(Boolean);
  const showRate = Math.round((me.attended / me.invited) * 100);
  const [copied, setCopied] = React.useState(false);
  const inviteCode = (me.handle.replace("@", "").toUpperCase()) + "-KYOTO";

  return (
    <div className="scroll" style={{ background: "var(--paper)" }}>
      {/* header */}
      <div style={{ background: "linear-gradient(160deg, var(--primary) 0%, var(--primary-d) 100%)", padding: "20px 20px 70px",
        borderRadius: "0 0 30px 30px", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ color: "rgba(255,255,255,.85)", fontSize: 13, fontWeight: 600 }}>
            {T.t("hi", lang)}, <b style={{ color: "#fff", fontFamily: "var(--font-display)" }}>{me.name.split(" ")[0]}</b> 🎐
          </div>
          <button style={{ all: "unset", cursor: "pointer", width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="bell" size={17} color="#fff" />
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Ring value={progress} size={104} sw={9} color="#fff" track="rgba(255,255,255,.25)">
            <div style={{ textAlign: "center", color: "#fff" }}>
              <div className="stat-num" style={{ fontSize: 32 }}>{me.points}</div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", opacity: .85 }}>{T.t("yourPoints", lang).toUpperCase()}</div>
            </div>
          </Ring>
          <div style={{ color: "#fff" }}>
            <div className="tag" style={{ background: "rgba(255,255,255,.92)", color: tierColor, marginBottom: 8, whiteSpace: "nowrap" }}>
              <Icon name="trophy" size={12} color={tierColor} /> {lang === "jp" ? tiers[curIdx].jp : me.tier}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              <Icon name="flame" size={15} color="#FFD27A" fill="#FFD27A" /> {me.streak} {T.t("streak", lang)}
            </div>
            {next && <div style={{ fontSize: 12, opacity: .85 }}>{ptsToNext} {T.t("lockedPts", lang)} · {next.key}</div>}
          </div>
        </div>
      </div>

      <div style={{ padding: "0 18px 30px", marginTop: -48, position: "relative", zIndex: 2 }}>
        {/* quick stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
          <div className="card" style={{ padding: "16px" }}>
            <div className="stat-num" style={{ fontSize: 28, color: "var(--primary)" }}>{me.attended}</div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 600, marginTop: 4 }}>{T.t("eventsAtt", lang)}</div>
          </div>
          <div className="card" style={{ padding: "16px", display: "flex", alignItems: "center", gap: 12 }}>
            <Ring value={showRate} size={52} sw={6} color="var(--success)">
              <span style={{ fontSize: 13, fontWeight: 800, color: "var(--success)" }}>{showRate}%</span>
            </Ring>
            <div style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 600 }}>{T.t("showRate", lang)}</div>
          </div>
        </div>

        {/* how points work + invite */}
        <div className="card" style={{ padding: "13px 15px", marginBottom: 13, background: "var(--gold-soft)", border: "1px solid var(--gold)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <Icon name="star" size={15} color="var(--gold)" fill="var(--gold)" />
            <span style={{ fontWeight: 800, fontSize: 13.5, whiteSpace: "nowrap" }}>{T.t("howPoints", lang)}</span>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>{T.t("pointsRule", lang)}</div>
        </div>

        <div className="card" style={{ padding: "15px 16px", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 38px" }}><Icon name="users" size={18} color="var(--primary)" /></div>
            <div style={{ fontWeight: 800, fontSize: 15, fontFamily: "var(--font-display)", whiteSpace: "nowrap" }}>{T.t("inviteFriend", lang)}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 13 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12.5 }}>
              <span style={{ background: "var(--success)", color: "#fff", fontWeight: 800, fontSize: 11, padding: "3px 9px", borderRadius: 7, whiteSpace: "nowrap" }}>+{D.inviteBonus.fresh} pt</span>
              <span style={{ color: "var(--ink-soft)", fontWeight: 600 }}>{T.t("inviteRule1", lang)}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12.5 }}>
              <span style={{ background: "var(--gold)", color: "#fff", fontWeight: 800, fontSize: 11, padding: "3px 9px", borderRadius: 7, whiteSpace: "nowrap" }}>+{D.inviteBonus.returning} pt</span>
              <span style={{ color: "var(--ink-soft)", fontWeight: 600 }}>{T.t("inviteRule2", lang)}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
            <div style={{ flex: 1, border: "1.5px dashed var(--line)", borderRadius: 10, padding: "9px 13px", fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: ".12em", color: "var(--primary)", fontSize: 14 }}>{inviteCode}</div>
            <button className="btn btn-dark btn-sm" onClick={() => { try { navigator.clipboard && navigator.clipboard.writeText(inviteCode); } catch (e) {} setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
              {copied ? T.t("copied", lang) : T.t("copyCode", lang)}
            </button>
          </div>
        </div>

        {/* next events */}
        <SectionTitle>{T.t("nextUp", lang)}</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {myUpcoming.map((e) => (
            <button key={e.id} onClick={() => onOpen(e)} className="card" style={{ all: "unset", cursor: "pointer", display: "flex", gap: 13, padding: 11, alignItems: "center", border: "1px solid var(--line)", borderRadius: "var(--radius)", background: "var(--surface)" }}>
              <div style={{ flex: "0 0 62px", width: 62 }}><Cover seed={e.cover} h={62} radius={12} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5, fontFamily: "var(--font-display)" }}>{T.val(e.title, lang)}</div>
                <div style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 600, marginTop: 3, display: "flex", gap: 10, whiteSpace: "nowrap" }}>
                  <span><Icon name="calendar" size={11} color="var(--primary)" /> {T.fmtDate(e.date, lang)}</span>
                </div>
                <span className="tag" style={{ marginTop: 8, display: "inline-flex", background: "var(--success-soft)", color: "var(--success)" }}>
                  <Icon name="check" size={11} color="var(--success)" /> {T.t("youreIn", lang)}
                </span>
              </div>
              <Icon name="arrowR" size={18} color="var(--ink-faint)" />
            </button>
          ))}
        </div>

        {/* rewards */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17 }}>{T.t("rewardsT", lang)}</div>
          <span style={{ fontSize: 12, color: "var(--gold)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Icon name="star" size={13} color="var(--gold)" fill="var(--gold)" /> {me.points} {T.t("points", lang)}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {D.rewards.map((r) => {
            const can = me.points >= r.cost;
            return (
              <div key={r.id} className="card" style={{ padding: "13px 14px", display: "flex", alignItems: "center", gap: 12, opacity: can ? 1 : .62 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: can ? "var(--gold-soft)" : "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 42px" }}>
                  <Icon name="gift" size={20} color={can ? "var(--gold)" : "var(--ink-faint)"} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{T.val(r.title, lang)}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-faint)", fontWeight: 600, marginTop: 2 }}>{r.cost} {T.t("points", lang)}</div>
                </div>
                {r.tag && <span className="tag" style={{ background: r.tag === "limited" ? "var(--primary-soft)" : "var(--gold-soft)", color: r.tag === "limited" ? "var(--primary)" : "var(--gold)" }}>{r.tag}</span>}
                <button className="btn btn-sm" disabled={!can} style={{ background: can ? "var(--ink)" : "var(--surface-2)", color: can ? "#f6efe2" : "var(--ink-faint)", cursor: can ? "pointer" : "default" }}>
                  {T.t("redeem", lang)}
                </button>
              </div>
            );
          })}
        </div>

        {/* attendance history */}
        <div style={{ marginTop: 24 }}><SectionTitle>{T.t("history", lang)}</SectionTitle></div>
        <div className="card" style={{ padding: "6px 16px" }}>
          {me.history.map((h, i) => {
            const e = byId(h.id);
            return (
              <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < me.history.length - 1 ? "1px solid var(--line-soft)" : "0" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 32px",
                  background: h.went ? "var(--success-soft)" : "var(--surface-2)" }}>
                  <Icon name={h.went ? "check" : "x"} size={15} color={h.went ? "var(--success)" : "var(--ink-faint)"} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{T.val(e.title, lang)}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-faint)", fontWeight: 600 }}>{T.fmtDate(e.date, lang)}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: h.went ? "var(--success)" : "var(--ink-faint)" }}>
                  {h.went ? `+${D.pointsFor(e)} ${T.t("points", lang)}` : T.t("missed", lang)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MemberProfile({ lang }) {
  const D = window.BL_DATA, T = window.BL_I18N, me = D.me;
  const ci = D.tiers.findIndex((x) => x.key === me.tier);
  return (
    <div className="scroll" style={{ background: "var(--paper)", padding: "28px 20px 40px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 26 }}>
        <div style={{ width: 88, height: 88, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 36, boxShadow: "var(--shadow)" }}>
          {me.name[0]}
        </div>
        <h2 style={{ fontSize: 23, marginTop: 14 }}>{me.name}</h2>
        <div style={{ color: "var(--ink-faint)", fontSize: 13, fontWeight: 600 }}>{me.handle} · {lang === "jp" ? "2025年9月から" : "Member since Sep 2025"}</div>
        <span className="tag" style={{ marginTop: 10, background: D.tiers[ci].color + "1f", color: D.tiers[ci].color }}>
          <Icon name="trophy" size={12} color={D.tiers[ci].color} /> {me.tier}
        </span>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {[
          { i: "user", t: lang === "jp" ? "アカウント情報" : "Account details" },
          { i: "bell", t: lang === "jp" ? "通知設定" : "Notifications" },
          { i: "globe", t: lang === "jp" ? "言語" : "Language", v: lang === "jp" ? "日本語" : "English" },
          { i: "ticket", t: lang === "jp" ? "支払い方法" : "Payment methods" },
          { i: "star", t: T.t("rewardsT", lang), v: me.points + " " + T.t("points", lang) },
        ].map((r, i, arr) => (
          <div key={r.t} style={{ display: "flex", alignItems: "center", gap: 13, padding: "15px 16px", borderBottom: i < arr.length - 1 ? "1px solid var(--line-soft)" : "0", cursor: "pointer" }}>
            <Icon name={r.i} size={18} color="var(--ink-soft)" />
            <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{r.t}</span>
            {r.v && <span style={{ fontSize: 13, color: "var(--ink-faint)", fontWeight: 600 }}>{r.v}</span>}
            <Icon name="arrowR" size={16} color="var(--ink-faint)" />
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { AuthSheet, Field, MemberDashboard, MemberProfile });
