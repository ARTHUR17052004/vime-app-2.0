export default function manifest() {
  return {
    name: "VIME 2.0 — Gestão de Locações",
    short_name: "VIME 2.0",
    description: "Sistema de gestão de locações, contratos e cobranças.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a1b13",
    theme_color: "#10B981",
    icons: [
      {
        src: "/images/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/images/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
