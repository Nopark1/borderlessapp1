/* Site language: auto-detect from the browser on first visit, remember a manual
   choice, and stay SSR-safe (renders "en" on the server, then resolves on the
   client to avoid hydration mismatches). Shared across the whole site so a
   choice persists between the homepage, events, member area and Blog. */

import { useEffect, useState } from "react";
import type { Lang } from "./types";

const LANG_KEY = "bl_lang";

/** Saved choice if present, else the browser's preferred language (ja → jp). */
export function detectSiteLang(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "en" || saved === "jp") return saved;
    const nav = (navigator.languages && navigator.languages[0]) || navigator.language || "";
    return /^ja/i.test(nav) ? "jp" : "en";
  } catch {
    return "en";
  }
}

export function useSiteLang(): [Lang, (l: Lang) => void] {
  const [lang, setLang] = useState<Lang>("en"); // matches SSR; resolved on mount
  useEffect(() => {
    const detected = detectSiteLang();
    if (detected !== "en") setLang(detected);
  }, []);
  const choose = (l: Lang) => {
    setLang(l);
    try { localStorage.setItem(LANG_KEY, l); } catch { /* ignore */ }
  };
  return [lang, choose];
}
