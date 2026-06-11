/* Real, interactive Google map for an event location (no API key needed).
   Geocodes from the venue/area text; falls back to coordinates.
   Shows the address line + "Open in Maps" and "Get directions" actions. */
import { Icon } from "./Icon";
import type { Lang } from "@/lib/types";

export function EventMap({
  query,
  venueLabel,
  lat,
  lng,
  lang,
  h = 200,
}: {
  query?: string;
  venueLabel?: string;
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
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${enc}`;

  return (
    <div style={{ borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid var(--line)" }}>
      <div style={{ position: "relative", height: h, background: "#e9e0cf" }}>
        <iframe
          src={embedSrc}
          title="Event location"
          width="100%"
          height="100%"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ border: 0, display: "block" }}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
          padding: "11px 13px",
          background: "var(--surface)",
          borderTop: "1px solid var(--line)",
        }}
      >
        {venueLabel && (
          <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0, flex: "1 1 auto" }}>
            <Icon name="pin" size={15} color="var(--primary)" />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {venueLabel}
            </span>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, marginLeft: venueLabel ? "auto" : 0 }}>
          <a href={openUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
            <Icon name="pin" size={13} color="var(--primary)" /> {lang === "jp" ? "地図で開く" : "Open in Maps"}
          </a>
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
            <Icon name="arrowR" size={14} color="#fff" /> {lang === "jp" ? "経路を表示" : "Get directions"}
          </a>
        </div>
      </div>
    </div>
  );
}
