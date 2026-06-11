/* Real, interactive Google map for an event location (no API key needed).
   Geocodes from the venue/area text; falls back to coordinates. */
import { Icon } from "./Icon";
import type { Lang } from "@/lib/types";

export function EventMap({
  query,
  lat,
  lng,
  lang,
  h = 200,
}: {
  query?: string;
  lat?: number;
  lng?: number;
  lang: Lang;
  h?: number;
}) {
  const hasCoords = typeof lat === "number" && typeof lng === "number" && !(lat === 0 && lng === 0);
  const q = (query && query.trim()) || (hasCoords ? `${lat},${lng}` : "Kyoto, Japan");
  const enc = encodeURIComponent(q);
  const embedSrc = `https://maps.google.com/maps?q=${enc}&z=15&output=embed`;
  const openUrl = `https://www.google.com/maps/search/?api=1&query=${enc}`;

  return (
    <div style={{ position: "relative", height: h, borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid var(--line)", background: "#e9e0cf" }}>
      <iframe
        src={embedSrc}
        title="Event location"
        width="100%"
        height="100%"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        style={{ border: 0, display: "block" }}
      />
      <a
        href={openUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-sm"
        style={{ position: "absolute", right: 10, bottom: 10, background: "#fff", color: "var(--ink)", boxShadow: "var(--shadow-sm)" }}
      >
        <Icon name="pin" size={13} color="var(--primary)" /> {lang === "jp" ? "地図で開く" : "Open in Google Maps"}
      </a>
    </div>
  );
}
