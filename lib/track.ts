/* Client-side Blog analytics beacon. Uses sendBeacon so events still fire as
   the page is being closed (for dwell time). Admin traffic is filtered out on
   the server, not here. */

const KEY = "bl_sid";

export type EventType = "impression" | "view" | "dwell" | "complete" | "share" | "download" | "readnext" | "cta";
export type EventMeta = { ms?: number; source?: string; lang?: string };

/** A stable-ish anonymous id for this browser, used to estimate unique readers
 *  and new-vs-returning. */
export function clientSession(): string {
  if (typeof window === "undefined") return "";
  try {
    let s = localStorage.getItem(KEY);
    if (!s) {
      s = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(KEY, s);
    }
    return s;
  } catch {
    return "";
  }
}

/** Where this visit came from: UTM source if present, else a friendly label for
 *  the referring host (line / instagram / discord / search / …), else "direct". */
export function trafficSource(): string {
  if (typeof window === "undefined") return "";
  try {
    const utm = new URLSearchParams(window.location.search).get("utm_source");
    if (utm) return utm.toLowerCase().slice(0, 40);
    const ref = document.referrer;
    if (!ref) return "direct";
    const host = new URL(ref).hostname.replace(/^www\./, "");
    if (host === window.location.hostname) return "internal";
    if (host === "line.me" || host.endsWith(".line.me")) return "line";
    if (host.includes("instagram")) return "instagram";
    if (host.includes("discord")) return "discord";
    if (/(^|\.)(google|bing|duckduckgo|yahoo)\./.test(host)) return "search";
    if (host === "t.co" || host.includes("twitter") || host === "x.com") return "twitter";
    if (host.includes("facebook")) return "facebook";
    return host.slice(0, 40);
  } catch {
    return "direct";
  }
}

export function trackEvent(slug: string, type: EventType, meta: EventMeta = {}): void {
  if (typeof window === "undefined" || !slug) return;
  const payload = JSON.stringify({ slug, type, ms: meta.ms, source: meta.source, lang: meta.lang, session: clientSession() });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/journal/track", new Blob([payload], { type: "application/json" }));
    } else {
      fetch("/api/journal/track", { method: "POST", body: payload, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    }
  } catch {
    /* ignore */
  }
}
