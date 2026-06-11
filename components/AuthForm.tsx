"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { createClient } from "@/lib/supabase-browser";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

type Screen = "form" | "magic-sent" | "confirm-sent";

export function AuthForm({ initialMode }: { initialMode: "login" | "signup" }) {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [screen, setScreen] = useState<Screen>("form");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isLogin = mode === "login";
  const redirectTo = () => `${window.location.origin}/auth/callback?next=/me`;

  function notConfigured() {
    setErrorMsg(lang === "jp" ? "Supabase が未設定です（.env.local を確認）。" : "Supabase isn't connected yet (check .env.local).");
  }

  // --- email + password ---
  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    const supabase = createClient();
    if (!supabase) return notConfigured();
    setBusy(true);
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) setErrorMsg(error.message);
      else {
        router.push("/me");
        router.refresh();
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: name ? { name } : undefined, emailRedirectTo: redirectTo() },
      });
      setBusy(false);
      if (error) setErrorMsg(error.message);
      else if (data.session) {
        router.push("/me");
        router.refresh();
      } else {
        setScreen("confirm-sent"); // email confirmation required
      }
    }
  }

  // --- magic link (passwordless) ---
  async function sendMagicLink() {
    setErrorMsg("");
    const supabase = createClient();
    if (!supabase) return notConfigured();
    if (!email) {
      setErrorMsg(lang === "jp" ? "メールアドレスを入力してください。" : "Enter your email first.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo(), shouldCreateUser: true, data: !isLogin && name ? { name } : undefined },
    });
    setBusy(false);
    if (error) setErrorMsg(error.message);
    else setScreen("magic-sent");
  }

  // --- google ---
  async function signInWithGoogle() {
    setErrorMsg("");
    const supabase = createClient();
    if (!supabase) return notConfigured();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    });
    if (error) setErrorMsg(error.message);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "13px 15px", borderRadius: 13, border: "1.5px solid var(--line)",
    background: "#fff", fontSize: 14.5, fontFamily: "var(--font-ui)", color: "var(--ink)", outline: "none",
  };
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", display: "block", marginBottom: 6 };

  function SentScreen({ title, body }: { title: string; body: string }) {
    return (
      <div style={{ textAlign: "center", padding: "20px 6px" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", margin: "0 auto 16px", background: "var(--success-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="bell" size={28} color="var(--success)" />
        </div>
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>{title}</h2>
        <p style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.6, margin: "0 0 18px" }}>{body}</p>
        <button className="btn btn-ghost btn-block" onClick={() => setScreen("form")}>
          {lang === "jp" ? "戻る" : "Back"}
        </button>
      </div>
    );
  }

  return (
    <div className="bl-root">
      <header className="bl-topbar">
        <Link href="/" className="shell-brand" style={{ marginRight: "auto" }}>
          <span className="bl-emblem" aria-hidden="true">
            <Icon name="globe" size={22} color="#fff" />
          </span>
          <span className="bx">
            <b>BORDERLESS</b>
            <span>{t("tagline", lang)}</span>
          </span>
        </Link>
        <div className="lang-toggle">
          <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
          <button className={lang === "jp" ? "on" : ""} onClick={() => setLang("jp")}>日本</button>
        </div>
      </header>

      <div className="auth-card">
        <div style={{ padding: "26px 22px 34px" }}>
          {screen === "magic-sent" ? (
            <SentScreen
              title={lang === "jp" ? "メールを確認してください" : "Check your email"}
              body={lang === "jp" ? `${email} にサインイン用のリンクを送りました。` : `We sent a sign-in link to ${email}. Tap it to log in.`}
            />
          ) : screen === "confirm-sent" ? (
            <SentScreen
              title={lang === "jp" ? "メールを確認してください" : "Confirm your email"}
              body={lang === "jp" ? `${email} に確認リンクを送りました。リンクをタップしてアカウントを有効化し、サインインしてください。` : `We sent a confirmation link to ${email}. Tap it to activate your account, then sign in.`}
            />
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                <span className="bl-emblem" aria-hidden="true" style={{ width: 44, height: 44, flex: "0 0 44px" }}>
                  <Icon name="globe" size={22} color="#fff" />
                </span>
                <h2 style={{ fontSize: 22 }}>{isLogin ? t("welcome", lang) : t("joinTitle", lang)}</h2>
              </div>
              <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.5, margin: "0 0 20px" }}>{t("authPerk", lang)}</p>

              <form onSubmit={submitPassword}>
                {!isLogin && (
                  <label style={{ display: "block", marginBottom: 13 }}>
                    <span style={labelStyle}>{t("name", lang)}</span>
                    <input style={inputStyle} placeholder="Aoi Tanaka" value={name} onChange={(e) => setName(e.target.value)} />
                  </label>
                )}
                <label style={{ display: "block", marginBottom: 13 }}>
                  <span style={labelStyle}>{t("email", lang)}</span>
                  <input style={inputStyle} type="email" required placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <label style={{ display: "block", marginBottom: 13 }}>
                  <span style={labelStyle}>{t("password", lang)}</span>
                  <input style={inputStyle} type="password" required minLength={6} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>

                {errorMsg && <div style={{ fontSize: 12.5, color: "var(--danger)", fontWeight: 600, marginBottom: 12 }}>{errorMsg}</div>}

                <button type="submit" className="btn btn-primary btn-block" style={{ padding: "14px" }} disabled={busy}>
                  {busy ? (lang === "jp" ? "処理中…" : "Working…") : isLogin ? t("signIn", lang) : t("createAcc", lang)}
                </button>
              </form>

              {/* magic link alternative */}
              <button
                onClick={sendMagicLink}
                disabled={busy}
                style={{ all: "unset", cursor: "pointer", display: "block", textAlign: "center", width: "100%", marginTop: 14, fontSize: 13, fontWeight: 700, color: "var(--primary)" }}
              >
                {lang === "jp" ? "パスワードなしでメールのリンクでログイン →" : "Email me a sign-in link instead →"}
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
                <div className="hr" style={{ flex: 1 }} />
                <span style={{ fontSize: 11, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: ".1em" }}>{t("or", lang)}</span>
                <div className="hr" style={{ flex: 1 }} />
              </div>
              <button className="btn btn-ghost btn-block" style={{ padding: "13px", background: "#fff" }} onClick={signInWithGoogle}>
                <span style={{ fontWeight: 700, color: "#4285F4" }}>G</span> {t("continueG", lang)}
              </button>

              <div style={{ textAlign: "center", fontSize: 13, color: "var(--ink-soft)", marginTop: 18 }}>
                {isLogin ? t("noAccount", lang) : t("haveAccount", lang)}{" "}
                <button
                  onClick={() => { setMode(isLogin ? "signup" : "login"); setErrorMsg(""); }}
                  style={{ all: "unset", color: "var(--primary)", fontWeight: 700, cursor: "pointer" }}
                >
                  {isLogin ? t("createAcc", lang) : t("signIn", lang)}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
