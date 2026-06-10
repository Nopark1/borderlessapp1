/* ============================================================
   Borderless — public site (public.jsx)
   Hero + events feed + event detail. Lives in the phone frame.
   Shared by the logged-out public view and the member "Events" tab.
   ============================================================ */

function FauxMap({ event, lang, h = 150 }) {
  // stylized static map — streets + river + pin (offline, on-brand)
  return (
    <div style={{ position: "relative", height: h, borderRadius: "var(--radius-sm)", overflow: "hidden",
      background: "#e9e0cf", border: "1px solid var(--line)" }}>
      <svg width="100%" height="100%" viewBox="0 0 320 150" preserveAspectRatio="xMidYMid slice">
        <rect width="320" height="150" fill="#ece3d2" />
        <path d="M-10 110 Q120 90 200 120 T340 100 L340 160 L-10 160Z" fill="#cfe0dd" opacity=".8" />
        <path d="M-10 116 Q120 96 200 126 T340 106" fill="none" stroke="#a9c7c2" strokeWidth="2" />
        {[30, 90, 150, 210, 270].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="150" stroke="#ddd2bd" strokeWidth="6" />)}
        {[28, 70, 112].map((y) => <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="#ddd2bd" strokeWidth="6" />)}
        {[50, 110, 170, 230].map((x) => [12, 48, 90].map((y) => (
          <rect key={x + "-" + y} x={x} y={y} width="22" height="14" rx="2" fill="#ddd0b6" opacity=".8" />
        )))}
      </svg>
      <div style={{ position: "absolute", left: "50%", top: "46%", transform: "translate(-50%,-100%)" }}>
        <div style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,.3))" }}>
          <Icon name="pin" size={36} color="var(--primary)" fill="var(--primary)" sw={1.5} />
          <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)",
            width: 8, height: 8, background: "#fff", borderRadius: "50%" }} />
        </div>
      </div>
      <button className="btn btn-sm" style={{ position: "absolute", right: 10, bottom: 10,
        background: "#fff", color: "var(--ink)", boxShadow: "var(--shadow-sm)" }}>
        <Icon name="pin" size={13} color="var(--primary)" /> {lang === "jp" ? "地図で開く" : "Open in Maps"}
      </button>
    </div>
  );
}

function EventCard({ event, lang, onOpen, joined, playful }) {
  const D = window.BL_DATA, T = window.BL_I18N;
  const past = D.isPast(event);
  const spots = event.capacity - (event.rsvp || 0);
  return (
    <button onClick={onOpen} className="fade-up" style={{ all: "unset", cursor: "pointer", display: "block", width: "100%" }}>
      <div className="card" style={{ overflow: "hidden", marginBottom: 0 }}>
        <Cover seed={event.cover} h={past ? 132 : 158} label dim={past ? .12 : 0}>
          <div style={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", justifyContent: "space-between" }}>
            <span className={playful ? "tilt-l" : ""} style={{ display: "inline-block" }}><CatTag cat={event.category} lang={lang} /></span>
            {!past && spots <= 5 && spots > 0 && (
              <span className="tag" style={{ background: "rgba(255,255,255,.92)", color: "var(--primary)" }}>
                {spots} {T.t("spotsLeft", lang)}
              </span>
            )}
            {past && event.gallery > 0 && (
              <span className="tag" style={{ background: "rgba(0,0,0,.4)", color: "#fff" }}>
                <Icon name="grid" size={11} color="#fff" /> {event.gallery}
              </span>
            )}
          </div>
          <div style={{ position: "absolute", left: 14, bottom: 12, right: 14 }}>
            <div style={{ color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, lineHeight: 1.18,
              textShadow: "0 2px 12px rgba(0,0,0,.4)" }}>
              {T.val(event.title, lang)}
            </div>
          </div>
        </Cover>
        <div style={{ padding: "13px 15px 15px" }}>
          <div style={{ display: "flex", gap: 14, color: "var(--ink-soft)", fontSize: 12.5, fontWeight: 600, marginBottom: 9 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Icon name="calendar" size={13} color="var(--primary)" /> {T.fmtDate(event.date, lang)}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Icon name="pin" size={13} color="var(--primary)" /> {T.val(event.area, lang)}
            </span>
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.5, marginBottom: 12 }}>
            {T.val(event.blurb, lang)}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--ink)" }}>
              {event.price ? D.yen(event.price) : T.t("free", lang)}
            </span>
            {past ? (
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-faint)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Icon name="users" size={14} color="var(--ink-faint)" /> {event.attended} {T.t("came", lang)}
              </span>
            ) : joined ? (
              <span className="tag" style={{ background: "var(--success-soft)", color: "var(--success)" }}>
                <Icon name="check" size={12} color="var(--success)" /> {T.t("youreIn", lang)}
              </span>
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--primary)", fontWeight: 700, fontSize: 13 }}>
                {T.t("imComing", lang)} <Icon name="arrowR" size={15} color="var(--primary)" />
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function WeekendStrip({ events, lang, onOpen, playful }) {
  const D = window.BL_DATA, T = window.BL_I18N;
  if (!events.length) return null;
  return (
    <div style={{ paddingTop: 18 }}>
      <div style={{ padding: "0 18px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Icon name="sparkle" size={17} color="var(--gold)" fill="var(--gold)" />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 19, color: "var(--ink)", whiteSpace: "nowrap" }}>{T.t("thisWeekend", lang)}</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-faint)", fontWeight: 600, marginTop: 3 }}>{T.t("soonSub", lang)}</div>
      </div>
      <div className="wk-scroll">
        {events.map((e) => {
          const spots = e.capacity - (e.rsvp || 0);
          const soon = T.daysUntil(e.date) <= 3;
          return (
            <button key={e.id} className="wk-card" onClick={() => onOpen(e)}
              style={{ all: "unset", cursor: "pointer", display: "block" }}>
              <div style={{ background: "var(--surface)", border: "1.5px solid var(--line)", borderRadius: playful ? 22 : "var(--radius)",
                overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                <Cover seed={e.cover} h={116}>
                  <div style={{ position: "absolute", top: 10, left: 10 }}>
                    <span className={"sticker " + (playful ? "tilt-l" : "")} style={{ fontSize: 11.5, padding: "5px 10px", color: soon ? "var(--primary)" : "var(--ink)" }}>
                      {soon && <Icon name="flame" size={12} color="var(--primary)" fill="var(--primary)" />} {T.relDay(e.date, lang)}
                    </span>
                  </div>
                </Cover>
                <div style={{ padding: "11px 13px 13px" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, lineHeight: 1.22, color: "var(--ink)",
                    overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", minHeight: 37 }}>
                    {T.val(e.title, lang)}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-soft)", fontWeight: 600, margin: "6px 0 10px", display: "flex", alignItems: "center", gap: 5 }}>
                    <Icon name="pin" size={12} color="var(--primary)" /> {T.val(e.area, lang)}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, whiteSpace: "nowrap" }}>{e.price ? D.yen(e.price) : T.t("free", lang)}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", color: spots <= 5 ? "var(--primary)" : "var(--ink-faint)" }}>
                      {spots <= 5 ? `${spots} ${T.t("spotsLeft", lang)}` : `${e.rsvp} ${T.t("going", lang)}`}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PublicFeed({ lang, onOpen, joinedMap, signedIn, onJoin, playful, events, onLogin, onAccount }) {
  const D = window.BL_DATA, T = window.BL_I18N;
  const [filter, setFilter] = React.useState("upcoming");
  const all = events || D.events;
  const upcoming = all.filter((e) => !D.isPast(e) && e.status !== "draft").sort((a, b) => (a.date < b.date ? -1 : 1));
  const past = all.filter((e) => D.isPast(e)).sort((a, b) => (a.date < b.date ? 1 : -1));
  const list = filter === "past" ? past : upcoming;
  return (
    <div className="scroll">
      {/* hero */}
      <div style={{ position: "relative" }}>
        <Cover seed="lantern" h={336} />
        <image-slot id="borderless-hero-bg" shape="rect" fit="cover" src="uploads/borderless1.jpg"
          placeholder={lang === "jp" ? "ヒーロー画像をドロップ" : "Drop a hero photo"}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}></image-slot>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(to top, rgba(20,12,10,.92), rgba(20,12,10,.32) 55%, rgba(20,12,10,.45))" }} />
        <div style={{ position: "absolute", left: 22, right: 22, bottom: 24, pointerEvents: "none" }}>
            {playful ? (
              <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "nowrap", paddingRight: 74 }}>
                <span className="sticker wobble tilt-l" style={{ fontSize: 12.5, padding: "7px 13px", whiteSpace: "nowrap" }}>
                  <Icon name="sparkle" size={14} color="var(--primary)" fill="var(--primary)" /> {lang === "jp" ? "毎週開催！" : "new every week"}
                </span>
                <span className="sticker wobble tilt-r" style={{ color: "var(--primary)", fontSize: 12.5, padding: "7px 13px", whiteSpace: "nowrap", animationDelay: "-1.1s" }}>
                  <Icon name="users" size={14} color="var(--primary)" /> 100+ {lang === "jp" ? "仲間" : "friends"}
                </span>
              </div>
            ) : (
              <div className="chip-row" style={{ marginBottom: 14, paddingRight: 96 }}>
                <span className="tag" style={{ background: "rgba(255,255,255,.16)", color: "#fff", backdropFilter: "blur(4px)" }}>
                  <Icon name="users" size={12} color="#fff" /> {T.t("members100", lang)}
                </span>
                <span className="tag" style={{ background: "rgba(255,255,255,.16)", color: "#fff", backdropFilter: "blur(4px)" }}>
                  <Icon name="calendar" size={12} color="#fff" /> {T.t("weekly", lang)}
                </span>
              </div>
            )}
            <h1 style={{ color: "#fff", fontSize: 40, lineHeight: 1.08, whiteSpace: "pre-line", textShadow: "0 3px 18px rgba(0,0,0,.4)" }}>
              {T.t("heroTitle", lang)}
            </h1>
            <p style={{ color: "rgba(255,255,255,.88)", fontSize: 14, lineHeight: 1.55, margin: "12px 0 18px", maxWidth: 320 }}>
              {playful ? (lang === "jp" ? "京都で最も成長中の国際サークル。新しい文化に触れ、新しい仲間と出会おう✨️" : "Kyoto's fastest-growing international circle. Experience new cultures and meet new friends✨️") : T.t("heroSub", lang)}
            </p>
            <div style={{ display: "flex", gap: 10, pointerEvents: "auto" }}>
              <button className="btn btn-primary" onClick={() => onJoin && onJoin()}>{T.t("joinFree", lang)}</button>
              <button className="btn btn-ghost" style={{ color: "#fff", borderColor: "rgba(255,255,255,.4)" }}
                onClick={() => { const sc = document.querySelector(".phone .scroll"); if (sc) sc.scrollTo({ top: 330, behavior: "smooth" }); }}>
                {T.t("browse", lang)}
              </button>
            </div>
        </div>
        <div style={{ position: "absolute", top: 14, right: 16, zIndex: 6 }}>
          {signedIn ? (
            <button onClick={() => onAccount && onAccount()} title="Account" style={{ all: "unset", cursor: "pointer", width: 38, height: 38, borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, boxShadow: "0 2px 10px rgba(0,0,0,.35)" }}>A</button>
          ) : (
            <button onClick={() => onLogin && onLogin()} style={{ all: "unset", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 999, background: "rgba(255,255,255,.92)", color: "var(--ink)", fontWeight: 700, fontSize: 12.5, whiteSpace: "nowrap", boxShadow: "0 2px 10px rgba(0,0,0,.28)" }}>
              <Icon name="user" size={14} color="var(--primary)" /> {T.t("signIn", lang)}
            </button>
          )}
        </div>
      </div>

      {/* this weekend strip */}
      {filter === "upcoming" && <WeekendStrip events={upcoming.slice(0, 4)} lang={lang} playful={playful} onOpen={onOpen} />}

      {/* filter */}
      <div style={{ padding: "20px 18px 8px" }} className="pf-list">
        <div className="seg" style={{ marginBottom: 18 }}>
          <button className={filter === "upcoming" ? "on" : ""} onClick={() => setFilter("upcoming")}>
            {T.t("upcoming", lang)}
          </button>
          <button className={filter === "past" ? "on" : ""} onClick={() => setFilter("past")}>
            {T.t("past", lang)}
          </button>
        </div>
      </div>

      <div style={{ padding: "0 18px 30px", display: "flex", flexDirection: "column", gap: 16 }}>
        {list.map((e) => (
          <EventCard key={e.id} event={e} lang={lang} playful={playful} joined={joinedMap[e.id]} onOpen={() => onOpen(e)} />
        ))}
        <div style={{ textAlign: "center", color: "var(--ink-faint)", fontSize: 12, padding: "12px 0 4px", fontFamily: "var(--font-display)" }}>
          ボーダレス · Borderless Kyoto
        </div>
      </div>
    </div>
  );
}

function EventDetail({ event, lang, onBack, joined, signedIn, onRSVP }) {
  const D = window.BL_DATA, T = window.BL_I18N;
  const past = D.isPast(event);
  const spots = event.capacity - (event.rsvp || 0);
  const attendees = D.members.slice(0, past ? event.attended : (event.rsvp || 0)).slice(0, 18);
  return (
    <div className="scroll">
      <div style={{ position: "relative" }}>
        <Cover seed={event.cover} h={300} label dim={.1}>
          <button onClick={onBack} style={{ position: "absolute", top: 14, left: 14, width: 38, height: 38, borderRadius: "50%",
            background: "rgba(255,255,255,.92)", border: 0, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: "var(--shadow-sm)", zIndex: 5 }}>
            <Icon name="arrowL" size={19} color="var(--ink)" />
          </button>
          <button style={{ position: "absolute", top: 14, right: 14, width: 38, height: 38, borderRadius: "50%",
            background: "rgba(255,255,255,.92)", border: 0, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: "var(--shadow-sm)", zIndex: 5 }}>
            <Icon name="share" size={17} color="var(--ink)" />
          </button>
          <div style={{ position: "absolute", left: 18, right: 18, bottom: 18 }}>
            <CatTag cat={event.category} lang={lang} />
            <h1 style={{ color: "#fff", fontSize: 30, lineHeight: 1.14, marginTop: 10, textShadow: "0 2px 14px rgba(0,0,0,.4)" }}>
              {T.val(event.title, lang)}
            </h1>
          </div>
        </Cover>
      </div>

      <div style={{ padding: "18px 18px 130px" }}>
        {/* meta card */}
        <div className="card" style={{ padding: 16, marginBottom: 18 }}>
          <Row icon="calendar" main={T.fmtDate(event.date, lang)} sub={`${event.time}–${event.endTime}`} />
          <hr className="hr" style={{ margin: "13px 0" }} />
          <Row icon="pin" main={T.val(event.venue, lang)} sub={T.val(event.area, lang)} />
          <hr className="hr" style={{ margin: "13px 0" }} />
          <Row icon="ticket" main={event.price ? D.yen(event.price) + " " + T.t("perPerson", lang) : T.t("free", lang)}
            sub={<span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--gold)", whiteSpace: "nowrap" }}>
              <Icon name="star" size={12} color="var(--gold)" fill="var(--gold)" /> {T.t("earnPt", lang)} {D.pointsFor(event)} {D.pointsFor(event) === 1 ? T.t("point", lang) : T.t("points", lang)}
            </span>} />
        </div>

        {/* about */}
        <SectionTitle>{T.t("about", lang)}</SectionTitle>
        <p style={{ fontSize: 14, lineHeight: 1.72, color: "var(--ink-soft)", margin: "0 0 24px", textWrap: "pretty" }}>
          {T.val(event.desc, lang)}
        </p>

        {/* who's coming */}
        <SectionTitle>{past ? T.t("recap", lang) : T.t("whoscoming", lang)}</SectionTitle>
        <div style={{ display: "flex", alignItems: "center", marginBottom: past ? 16 : 24 }}>
          <div style={{ display: "flex" }}>
            {attendees.slice(0, 7).map((m, i) => (
              <div key={m.id} style={{ width: 36, height: 36, borderRadius: "50%", marginLeft: i ? -10 : 0,
                background: ["#8A3233", "#B4893C", "#4E8FA6", "#5B6B4A", "#C06A3C", "#5B3B6B", "#7A3050"][i % 7],
                border: "2px solid var(--surface)", display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: 13, fontFamily: "var(--font-display)", zIndex: 7 - i }}>
                {m.name[0]}
              </div>
            ))}
          </div>
          <span style={{ marginLeft: 12, fontSize: 13, color: "var(--ink-soft)", fontWeight: 600 }}>
            {past ? `${event.attended} ${T.t("came", lang)}` : `${event.rsvp} ${lang === "jp" ? "人が参加予定" : "going"}`}
          </span>
        </div>

        {past && event.gallery > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 24 }}>
            {["sakura", "river", "night", "tea", "food", "zen"].slice(0, 6).map((s, i) => (
              <Cover key={i} seed={s} h={92} radius={10} />
            ))}
          </div>
        )}

        {/* map */}
        <SectionTitle>{T.t("getThere", lang)}</SectionTitle>
        <FauxMap event={event} lang={lang} />
      </div>

      {/* sticky RSVP bar */}
      {!past && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "14px 18px 26px",
          background: "linear-gradient(to top, var(--paper) 72%, transparent)", display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ flex: "0 0 auto" }}>
            <div style={{ fontSize: 11, color: "var(--ink-faint)", fontWeight: 600 }}>{event.price ? "" : ""}{spots} {T.t("spotsLeft", lang)}</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19 }}>
              {event.price ? D.yen(event.price) : T.t("free", lang)}
            </div>
          </div>
          <button className={"btn btn-block " + (joined ? "btn-ghost" : "btn-primary")} style={{ flex: 1 }}
            onClick={() => onRSVP(event)}>
            {joined ? (<><Icon name="check" size={16} color="var(--ink)" /> {T.t("youreIn", lang)}</>) : T.t("imComing", lang)}
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ icon, main, sub }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <div style={{ width: 38, height: 38, borderRadius: 11, background: "var(--primary-soft)",
        display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 38px" }}>
        <Icon name={icon} size={18} color="var(--primary)" />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ fontWeight: 700, fontSize: 14.5, color: "var(--ink)", lineHeight: 1.3 }}>{main}</div>
        <div style={{ fontSize: 12.5, color: "var(--ink-faint)", fontWeight: 600, lineHeight: 1.3 }}>{sub}</div>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, marginBottom: 12, color: "var(--ink)" }}>{children}</div>;
}

Object.assign(window, { PublicFeed, EventDetail, FauxMap, EventCard, Row, SectionTitle });
