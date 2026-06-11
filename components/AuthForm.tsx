"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "./Icon";
import { createClient, isSupabaseConfigured } from "@/lib/supabase-browser";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

type Status = "idle" | "sending" | "sent" | "error";

export function AuthForm({ initialMode }: { initialMode: "login" | "signup" }) {
  const [lang, setLang] = useState<Lang>("en");
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const isLogin = mode === "login";

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    const supabase = createClient();
    if (!supabase) {
      setStatus("error");
      setErrorMsg(
        lang === "jp"
          ? "Supabase が未設定です（.env.local を確認）。"
          : "Supabase isn't connected yet (check .env.local)."
      );
      return;
    }
    setStatus("sending");
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=/me`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo,
        shouldCreateUser: true,
        data: !isLogin && name ? { name } : undefined,
      },
    });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("sent");
    }
  }

  async function signInWithGoogle() {
    setErrorMsg("");
    const supabase = createClient();
    if (!supabase) {
      setStatus("error");
      setErrorMsg(
        lang === "jp" ? "Supabase が未設定です。" : "Supabase isn't connected yet."
      );
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/me` },
    });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px 15px",
    borderRadius: 13,
    border: "1.5px solid var(--line)",
    background: "#fff",
    fontSize: 14.5,
    fontFamily: "var(--font-ui)",
    color: "var(--ink)",
    outline: "none",
  };

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
          {status === "sent" ? (
            <div style={{ textAlign: "center", padding: "20px 6px" }}>
              <div
                style={{
                  width: 64, height: 64, borderRadius: "50%", margin: "0 auto 16px",
                  background: "var(--success-soft)", display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Icon name="bell" size={28} color="var(--success)" />
              </div>
              <h2 style={{ fontSize: 22, marginBottom: 8 }}>
                {lang === "jp" ? "メールを確認してください" : "Check your email"}
              </h2>
              <p style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.6, margin: "0 0 18px" }}>
                {lang === "jp"
                  ? `${email} にサインイン用のリンクを送りました。リンクをタップするとログインできます。`
                  : `We sent a sign-in link to ${email}. Tap the link in that email to log in.`}
              </p>
              <button
                className="btn btn-ghost btn-block"
                onClick={() => { setStatus("idle"); }}
              >
                {lang === "jp" ? "別のメールを使う" : "Use a different email"}
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                <span className="bl-emblem" aria-hidden="true" style={{ width: 44, height: 44, flex: "0 0 44px" }}>
                  <Icon name="globe" size={22} color="#fff" />
                </span>
                <h2 style={{ fontSize: 22 }}>
                  {isLogin ? t("welcome", lang) : t("joinTitle", lang)}
                </h2>
              </div>
              <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.5, margin: "0 0 20px" }}>
                {t("authPerk", lang)}
              </p>

              <form onSubmit={sendMagicLink}>
                {!isLogin && (
                  <label style={{ display: "block", marginBottom: 13 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", display: "block", marginBottom: 6 }}>
                      {t("name", lang)}
                    </span>
                    <input
                      style={inputStyle}
                      placeholder="Aoi Tanaka"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </label>
                )}
                <label style={{ display: "block", marginBottom: 13 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", display: "block", marginBottom: 6 }}>
                    {t("email", lang)}
                  </span>
                  <input
                    style={inputStyle}
                    type="email"
                    required
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>

                <p style={{ fontSize: 12, color: "var(--ink-faint)", lineHeight: 1.5, margin: "2px 0 12px" }}>
                  {lang === "jp"
                    ? "パスワード不要。サインイン用のリンクをメールでお送りします。"
                    : "No password needed — we'll email you a secure sign-in link."}
                </p>

                {status === "error" && (
                  <div style={{ fontSize: 12.5, color: "var(--danger)", fontWeight: 600, marginBottom: 12 }}>
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  style={{ padding: "14px" }}
                  disabled={status === "sending"}
                >
                  {status === "sending"
                    ? lang === "jp" ? "送信中…" : "Sending…"
                    : lang === "jp" ? "サインインリンクを送る" : "Email me a sign-in link"}
                </button>
              </form>

              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
                <div className="hr" style={{ flex: 1 }} />
                <span style={{ fontSize: 11, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: ".1em" }}>
                  {t("or", lang)}
                </span>
                <div className="hr" style={{ flex: 1 }} />
              </div>
              <button className="btn btn-ghost btn-block" style={{ padding: "13px", background: "#fff" }} onClick={signInWithGoogle}>
                <span style={{ fontWeight: 700, color: "#4285F4" }}>G</span> {t("continueG", lang)}
              </button>

              <div style={{ textAlign: "center", fontSize: 13, color: "var(--ink-soft)", marginTop: 18 }}>
                {isLogin ? t("noAccount", lang) : t("haveAccount", lang)}{" "}
                <button
                  onClick={() => { setMode(isLogin ? "signup" : "login"); setStatus("idle"); }}
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
