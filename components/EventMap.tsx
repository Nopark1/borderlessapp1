/* Real, interactive Google map for an event location (no API key needed).
   Prefers a pasted Google Maps link (extracts its coordinates/place);
   otherwise geocodes from the venue/area text or coordinates.
   Shows the address line + "Open in Maps" and "Get directions" actions. */
import { Icon } from "./Icon";
import type { Lang } from "@/lib/types";

/** Pull a map-able query (coords or place name) out of a pasted Google Maps URL.
 *  Short links (maps.app.goo.gl / goo.gl) can't be resolved without following a
 *  redirect, so those return nothing and we fall back to the venue text. */
function queryFromMapsUrl(url?: string): string | null {
  if (!url) return null;
  const u = url.trim();
  // explicit coordinates, in rough order of reliability
  const at = u.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (at) return `${at[1]},${at[2]}`;
  const bang = u.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (bang) return `${bang[1]},${bang[2]}`;
  const llq = u.match(/[?&](?:ll|q|query|destination)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (llq) return `${llq[1]},${llq[2]}`;
  // a named place: /place/<Name>/
  const place = u.match(/\/place\/([^/@?]+)/);
  if (place) return decodeURIComponent(place[1].replace(/\+/g, " "));
  // a free-text query param
  const qm = u.match(/[?&](?:q|query|destination)=([^&]+)/);
  if (qm) return decodeURIComponent(qm[1].replace(/\+/g, " "));
  return null;
}

export function EventMap({
  query,
  venueLabel,
  lat,
  lng,
  mapsUrl,
  lang,
  h = 200,
}: {
  query?: string;
  venueLabel?: string;
  lat?: number;
  lng?: number;
  mapsUrl?: string;
  lang: Lang;
  h?: number;
}) {
  const hasCoords = typeof lat === "number" && typeof lng === "number" && !(lat === 0 && lng === 0);
  // Prefer the pasted Maps link; fall back to venue text, then coordinates.
  const fromUrl = queryFromMapsUrl(mapsUrl);
  const q = fromUrl || (query && query.trim()) || (hasCoords ? `${lat},${lng}` : "Kyoto, Japan");
  const enc = encodeURIComponent(q);
  const embedSrc = `https://maps.google.com/maps?q=${enc}&z=15&output=embed`;
  // The action buttons use the admin's exact link when provided.
  const cleanMapsUrl = mapsUrl?.trim();
  const openUrl = cleanMapsUrl || `https://www.google.com/maps/search/?api=1&query=${enc}`;
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
