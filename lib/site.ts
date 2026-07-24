/* Canonical public origin, used for sitemap/robots/canonical + OG URLs.
   Override with NEXT_PUBLIC_SITE_URL if the domain ever changes. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://borderless-circle.com").replace(/\/$/, "");
