/* ============================================================
   Borderless — app shell (app.jsx)
   Context switch (Public / Member / Admin), EN-JP toggle,
   phone + desktop frames, tweaks. Mounts the whole product.
   ============================================================ */
const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "vibe": "playful",
  "brand": "#8A3233",
  "paper": "warm",
  "display": "mincho",
  "radius": 18,
  "cardStyle": "soft",
  "density": "regular"
}/*EDITMODE-END*/;

const PAPERS = {
  warm:  { paper: "#F4ECE0", surface: "#FBF6EE", surface2: "#F1E7D8", line: "#E2D5C2", lineSoft: "#ECE2D2", bg: "radial-gradient(120% 80% at 50% -10%, #efe4d4 0%, #e7dac6 55%, #ddcdb4 100%)" },
  sand:  { paper: "#F3EEE6", surface: "#FCFAF6", surface2: "#ECE5D9", line: "#E0D7C8", lineSoft: "#ECE5D9", bg: "radial-gradient(120% 80% at 50% -10%, #efe9df 0%, #e6ddcd 60%, #dcd1bd 100%)" },
  mist:  { paper: "#EEECE6", surface: "#FBFAF7", surface2: "#E6E3DB", line: "#DBD8CF", lineSoft: "#E8E5DD", bg: "radial-gradient(120% 80% at 50% -10%, #eceae4 0%, #e2dfd7 60%, #d4d0c6 100%)" },
};
const DISPLAYS = {
  mincho:  '"Shippori Mincho B1", serif',
  oldmin:  '"Zen Old Mincho", serif',
  gothic:  '"Zen Kaku Gothic New", sans-serif',
  maru:    '"Zen Maru Gothic", sans-serif',
};
const DENSITY = { compact: 0.86, regular: 1, comfy: 1.14 };

function applyTweaks(t) {
  const p = PAPERS[t.paper] || PAPERS.warm;
  const playful = t.vibe === "playful";
  const display = playful ? DISPLAYS.maru : (DISPLAYS[t.display] || DISPLAYS.mincho);
  const radius = playful ? Math.max(t.radius, 16) : t.radius;
  const v = {
    "--primary": t.brand,
    "--primary-d": shade(t.brand, -16),
    "--primary-soft": tint(t.brand, 0.86),
    "--paper": p.paper, "--surface": p.surface, "--surface-2": p.surface2,
    "--line": p.line, "--line-soft": p.lineSoft,
    "--radius": radius + "px",
    "--radius-sm": Math.max(8, radius - 6) + "px",
    "--radius-lg": (radius + 8) + "px",
    "--font-display": display,
  };
  if (t.cardStyle === "flat") {
    v["--shadow"] = "none"; v["--shadow-sm"] = "none"; v["--shadow-lg"] = "0 20px 50px -24px rgba(43,34,30,.4)";
  }
  return { vars: v, bg: p.bg, density: DENSITY[t.density] || 1, playful };
}
function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function shade(h, pct) { const [r, g, b] = hexToRgb(h); const f = (c) => Math.max(0, Math.min(255, Math.round(c * (1 + pct / 100)))); return `rgb(${f(r)},${f(g)},${f(b)})`; }
function tint(h, amt) { const [r, g, b] = hexToRgb(h); const f = (c) => Math.round(c + (255 - c) * amt); return `rgb(${f(r)},${f(g)},${f(b)})`; }

/* ---------- persistence backend (localStorage-backed store) ---------- */
const BL_STORE_KEY = "borderless_state_v1";
function blLoad() {
  try { return JSON.parse(localStorage.getItem(BL_STORE_KEY)) || {}; } catch (e) { return {}; }
}
function blSave(patch) {
  try {
    const cur = blLoad();
    localStorage.setItem(BL_STORE_KEY, JSON.stringify({ ...cur, ...patch, _t: Date.now() }));
  } catch (e) { /* storage unavailable — run in-memory */ }
}
function seedEvents() {
  const D = window.BL_DATA;
  const SEED_COST = { e10: 32000, e11: 30000, e12: 28000 };
  return D.events.map((e) => ({
    ...e,
    status: D.isPast(e) ? "completed" : "published",
    cost: D.isPast(e) ? (D.finance[e.id] ? D.finance[e.id].costs : 0) : (SEED_COST[e.id] || Math.round(e.price * e.capacity * 0.4)),
  }));
}

function StatusBar({ dark }) {
  const c = dark ? "#fff" : "var(--ink)";
  return (
    <div className="statusbar" style={{ color: c }}>
      <span>9:41</span>
      <div className="sb-r">
        <svg width="17" height="11" viewBox="0 0 17 11" fill={c}><rect x="0" y="6" width="3" height="5" rx="1"/><rect x="4.5" y="4" width="3" height="7" rx="1"/><rect x="9" y="2" width="3" height="9" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1"/></svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill={c}><path d="M8 2.5c2 0 3.8.8 5.2 2.1l1-1.1A9 9 0 0 0 8 .9 9 9 0 0 0 1.8 3.5l1 1.1A7.4 7.4 0 0 1 8 2.5zM8 6c1 0 2 .4 2.7 1.1l1-1.1A5.5 5.5 0 0 0 8 4.4 5.5 5.5 0 0 0 4.3 6l1 1.1A3.8 3.8 0 0 1 8 6zm0 2.4 1.5 1.6L8 11l-1.5-1z"/></svg>
        <svg width="25" height="11" viewBox="0 0 25 11" fill="none"><rect x=".5" y=".5" width="21" height="10" rx="2.6" stroke={c} opacity=".4"/><rect x="2" y="2" width="17" height="7" rx="1.4" fill={c}/><rect x="23" y="3.5" width="1.5" height="4" rx="1" fill={c} opacity=".5"/></svg>
      </div>
    </div>
  );
}

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ position: "absolute", left: "50%", bottom: 96, transform: "translateX(-50%)", zIndex: 90,
      background: "var(--ink)", color: "#f6efe2", padding: "11px 18px", borderRadius: 999, fontSize: 13.5, fontWeight: 700,
      boxShadow: "var(--shadow-lg)", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }} className="fade-up">
      <Icon name="sparkle" size={15} color="#FFD27A" fill="#FFD27A" /> {msg}
    </div>
  );
}

function BottomNav({ tab, setTab, lang }) {
  const T = window.BL_I18N;
  const items = [{ k: "home", i: "home", t: T.t("home", lang) }, { k: "events", i: "calendar", t: T.t("events", lang) }, { k: "you", i: "user", t: T.t("you", lang) }];
  return (
    <div style={{ flex: "0 0 auto", display: "flex", borderTop: "1px solid var(--line)", background: "var(--surface)", paddingBottom: 22 }}>
      {items.map((it) => (
        <button key={it.k} onClick={() => setTab(it.k)} style={{ all: "unset", flex: 1, textAlign: "center", padding: "11px 0 6px", cursor: "pointer" }}>
          <Icon name={it.i} size={22} color={tab === it.k ? "var(--primary)" : "var(--ink-faint)"} sw={tab === it.k ? 2.2 : 1.8} />
          <div style={{ fontSize: 10.5, fontWeight: 700, marginTop: 3, color: tab === it.k ? "var(--primary)" : "var(--ink-faint)" }}>{it.t}</div>
        </button>
      ))}
    </div>
  );
}

function PhoneShell({ children, dark }) {
  return (
    <div className="phone">
      <div className="phone-notch" />
      <div className="phone-screen">
        <StatusBar dark={dark} />
        {children}
      </div>
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [ctx, setCtx] = useState("public");
  const [lang, setLang] = useState("en");
  const T = window.BL_I18N, D = window.BL_DATA;

  // public state
  const [pubView, setPubView] = useState(null); // null=feed, else event
  const [joined, setJoined] = useState(() => { const s = blLoad(); return s.joined || { e10: true, e12: true }; });
  const [signedIn, setSignedIn] = useState(false);
  const [auth, setAuth] = useState(null); // null | "login" | "signup"
  const [toast, setToast] = useState("");

  // member state
  const [memTab, setMemTab] = useState("home");
  const [memView, setMemView] = useState(null);

  // shared event store (persisted to localStorage; seeded + persisted on first run)
  const [events, setEvents] = useState(() => {
    const s = blLoad();
    if (s.events && Array.isArray(s.events) && s.events.length) return s.events;
    const seeded = seedEvents();
    blSave({ events: seeded });
    return seeded;
  });
  const eventById = (id) => events.find((e) => e.id === id);
  const saveEvent = (ev) => {
    const list = Array.isArray(ev) ? ev : [ev];
    setEvents((es) => {
      let next = es;
      list.forEach((item) => {
        const exists = next.some((e) => e.id === item.id);
        next = exists ? next.map((e) => (e.id === item.id ? { ...e, ...item } : e)) : [{ ...item, isNew: true }, ...next];
      });
      return next;
    });
  };
  const deleteEvent = (id) => setEvents((es) => es.filter((e) => e.id !== id));

  const cfg = applyTweaks(t);
  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 2200); };

  useEffect(() => { document.body.style.background = cfg.bg; }, [cfg.bg]);
  useEffect(() => { blSave({ events }); }, [events]);
  useEffect(() => { blSave({ joined }); }, [joined]);

  function publicRSVP(e) {
    if (!signedIn) { setAuth("signup"); return; }
    setJoined((j) => {
      const nv = !j[e.id];
      showToast(nv ? (lang === "jp" ? `参加予定！当日${D.pointsFor(e)}pt獲得` : `You're in! Earn ${D.pointsFor(e)} pts at the door`) : (lang === "jp" ? "キャンセルしました" : "RSVP cancelled"));
      return { ...j, [e.id]: nv };
    });
  }
  function doAuth() { setSignedIn(true); setAuth(null); setCtx("member"); setMemTab("home"); showToast(lang === "jp" ? "ようこそ、ボーダレスへ！" : "Welcome to Borderless!"); }

  const rootStyle = { ...cfg.vars, fontSize: `calc(1rem * ${cfg.density})` };

  return (
    <div className={"bl-root" + (t.cardStyle === "flat" ? " flat" : "") + (cfg.playful ? " playful" : "")} style={rootStyle}>
      {/* shell bar */}
      <div className="shell-bar">
        <div className="shell-brand">
          <img src="uploads/logo-1781081301145.jpg" alt="Borderless" />
          <div className="bx">
            <b>BORDERLESS</b>
            <span>{T.t("tagline", lang)}</span>
          </div>
        </div>
        <div className="seg">
          {["public", "member", "admin"].map((c) => (
            <button key={c} className={ctx === c ? "on" : ""} onClick={() => setCtx(c)}>{T.t(c, lang)}</button>
          ))}
        </div>
        <div className="lang-toggle">
          <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
          <button className={lang === "jp" ? "on" : ""} onClick={() => setLang("jp")}>日本</button>
        </div>
      </div>

      {/* stage */}
      {ctx === "public" && (
        <PhoneShell dark={!pubView ? true : true}>
          {!pubView
            ? <PublicFeed lang={lang} events={events} playful={cfg.playful} joinedMap={joined} signedIn={signedIn} onJoin={() => setAuth("signup")} onLogin={() => setAuth("login")} onAccount={() => setCtx("member")} onOpen={(e) => setPubView(e)} />
            : <EventDetail event={eventById(pubView.id) || pubView} lang={lang} playful={cfg.playful} onBack={() => setPubView(null)} joined={joined[pubView.id]} signedIn={signedIn} onRSVP={publicRSVP} />}
          {auth && <AuthSheet lang={lang} mode={auth} setMode={setAuth} onClose={() => setAuth(null)} onAuth={doAuth} />}
          <Toast msg={toast} />
        </PhoneShell>
      )}

      {ctx === "member" && (
        <PhoneShell dark={memTab === "home" && !memView}>
          {memView
            ? <EventDetail event={eventById(memView.id) || memView} lang={lang} onBack={() => setMemView(null)} joined={joined[memView.id]} signedIn={true}
                onRSVP={(e) => { setJoined((j) => ({ ...j, [e.id]: !j[e.id] })); showToast(!joined[e.id] ? (lang === "jp" ? `参加予定！当日${D.pointsFor(e)}pt` : `You're in! Earn ${D.pointsFor(e)} pts at the door`) : "—"); }} />
            : <>
                {memTab === "home" && <MemberDashboard lang={lang} eventById={eventById} joinedMap={joined} onOpen={(e) => setMemView(e)} />}
                {memTab === "events" && <PublicFeed lang={lang} events={events} joinedMap={joined} signedIn={true} onJoin={() => {}} onLogin={() => {}} onAccount={() => setMemTab("you")} onOpen={(e) => setMemView(e)} />}
                {memTab === "you" && <MemberProfile lang={lang} />}
                <BottomNav tab={memTab} setTab={setMemTab} lang={lang} />
              </>}
          <Toast msg={toast} />
        </PhoneShell>
      )}

      {ctx === "admin" && (
        <div className="desktop">
          <div className="dt-chrome">
            <div className="dt-lights"><i style={{ background: "#e3776b" }} /><i style={{ background: "#e6b95a" }} /><i style={{ background: "#82b66d" }} /></div>
            <div className="dt-url"><Icon name="globe" size={13} color="var(--ink-faint)" style={{ marginRight: 8 }} /> borderless.kyoto/admin</div>
          </div>
          <AdminApp lang={lang} events={events} eventById={eventById} onSave={saveEvent} onDelete={deleteEvent} />
        </div>
      )}

      {/* tweaks */}
      <TweaksPanel>
        <TweakSection label={lang === "jp" ? "雰囲気" : "Vibe"} />
        <TweakRadio label={lang === "jp" ? "トーン" : "Personality"} value={t.vibe}
          options={[{ value: "playful", label: lang === "jp" ? "ポップ" : "Playful" }, { value: "refined", label: lang === "jp" ? "上品" : "Refined" }]}
          onChange={(v) => setTweak("vibe", v)} />

        <TweakSection label={lang === "jp" ? "ブランドカラー" : "Brand color"} />
        <TweakColor label={lang === "jp" ? "メイン" : "Primary"} value={t.brand}
          options={["#8A3233", "#2E4A6B", "#4E6B43", "#9B5B2E", "#3A332E"]}
          onChange={(v) => setTweak("brand", v)} />
        <TweakRadio label={lang === "jp" ? "背景" : "Paper"} value={t.paper}
          options={["warm", "sand", "mist"]} onChange={(v) => setTweak("paper", v)} />

        <TweakSection label={lang === "jp" ? "タイポグラフィ" : "Typography"} />
        <TweakSelect label={lang === "jp" ? "見出し書体" : "Display font"} value={t.display}
          options={[{ value: "mincho", label: "Shippori Mincho" }, { value: "oldmin", label: "Zen Old Mincho" }, { value: "gothic", label: "Zen Kaku Gothic" }]}
          onChange={(v) => setTweak("display", v)} />

        <TweakSection label={lang === "jp" ? "スタイル" : "Style"} />
        <TweakRadio label={lang === "jp" ? "カード" : "Cards"} value={t.cardStyle}
          options={[{ value: "soft", label: lang === "jp" ? "影あり" : "Soft" }, { value: "flat", label: lang === "jp" ? "枠線" : "Flat" }]}
          onChange={(v) => setTweak("cardStyle", v)} />
        <TweakSlider label={lang === "jp" ? "角丸" : "Corner radius"} value={t.radius} min={4} max={28} step={2} unit="px"
          onChange={(v) => setTweak("radius", v)} />
        <TweakRadio label={lang === "jp" ? "余白" : "Density"} value={t.density}
          options={["compact", "regular", "comfy"]} onChange={(v) => setTweak("density", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
