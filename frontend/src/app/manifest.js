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
        src: "/images/logo-vime.jpeg",
        sizes: "1024x1024",
        type: "image/jpeg",
      },
      {
        src: "/images/logo-vime.jpeg",
        sizes: "1024x1024",
        type: "image/jpeg",
        purpose: "maskable",
      },
    ],
  };
}
