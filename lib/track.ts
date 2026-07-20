/* Client-side Blog analytics beacon. Uses sendBeacon so events still fire as
   the page is being closed (for dwell time). Admin traffic is filtered out on
   the server, not here. */

const KEY = "bl_sid";

/** A stable-ish anonymous id for this browser, used to estimate unique readers. */
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

export function trackEvent(slug: string, type: "impression" | "view" | "dwell", ms?: number): void {
  if (typeof window === "undefined" || !slug) return;
  const payload = JSON.stringify({ slug, type, ms, session: clientSession() });
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
