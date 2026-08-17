import Script from "next/script";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";

// Evita flash de tema: aplica o data-theme (a partir do cache local)
// antes da primeira pintura, sincronamente.
const scriptTemaInicial = `
  (function () {
    try {
      var cache = localStorage.getItem("vime-config-publica");
      var tema = cache ? (JSON.parse(cache).tema || "escuro") : "escuro";
      var claro = tema === "claro" || (
        tema === "automatico" &&
        !window.matchMedia("(prefers-color-scheme: dark)").matches
      );
      document.documentElement.setAttribute("data-theme", claro ? "light" : "dark");
    } catch (e) {}
  })();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "VIME 2.0",
  description: "Sistema de Gestão de Locações",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <Script
          id="tema-inicial"
          strategy="beforeInteractive"
        >
          {scriptTemaInicial}
        </Script>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}