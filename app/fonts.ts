import localFont from "next/font/local";

// Self-hosted — NUNCA depender de CDN (Google Fonts <link> proibido).
// woff2 copiados de @fontsource para /public/fonts.

export const spectral = localFont({
  variable: "--font-spectral",
  display: "swap",
  src: [
    { path: "../public/fonts/spectral-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/spectral-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/spectral-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
});

export const manrope = localFont({
  variable: "--font-manrope",
  display: "swap",
  src: [
    { path: "../public/fonts/manrope-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/manrope-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/manrope-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/manrope-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
});
