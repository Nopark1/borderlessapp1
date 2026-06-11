import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Borderless — Kyoto Cultural Gathering",
  description:
    "An international circle in Kyoto hosting a new gathering every week — temples, ramen, rooftops and riverbanks. Come as you are.",
  applicationName: "Borderless",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Borderless" },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#8A3233",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Only the two families actually used (display serif + UI sans), trimmed weights */}
        <link
          href="https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@600;700;800&family=Zen+Kaku+Gothic+New:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
