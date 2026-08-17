"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { ConfiguracaoService } from "../services/configuracao.service";

const CACHE_KEY = "vime-config-publica";

const PADRAO = {
  tema: "escuro",
  corPrimaria: "#12d98b",
  corSecundaria: "#1f2937",
  nomeSistema: null,
  nomeEmpresa: null,
  textoLogin: null,
  textoRodape: null,
  mensagemBoasVindas: null,
};

export const ThemeContext = createContext({
  ...PADRAO,
  modoEfetivo: "escuro",
});

function resolverModo(tema) {

  if (tema === "automatico") {

    if (typeof window === "undefined") return "escuro";

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "escuro"
      : "claro";

  }

  return tema === "claro" ? "claro" : "escuro";

}

function sombrear(hex, quantidade) {

  try {

    const cor = hex.replace("#", "");

    const num = parseInt(cor, 16);

    let r = (num >> 16) + quantidade;
    let g = ((num >> 8) & 0x00ff) + quantidade;
    let b = (num & 0x0000ff) + quantidade;

    r = Math.max(Math.min(255, r), 0);
    g = Math.max(Math.min(255, g), 0);
    b = Math.max(Math.min(255, b), 0);

    return `#${(g | (b << 8) | (r << 16)).toString(16).padStart(6, "0")}`;

  } catch {

    return hex;

  }

}

function aplicarNoDocumento(config) {

  if (typeof document === "undefined") return;

  const modo = resolverModo(config.tema);

  document.documentElement.setAttribute(
    "data-theme",
    modo === "claro" ? "light" : "dark"
  );

  const root = document.documentElement.style;

  if (config.corPrimaria) {
    root.setProperty("--primary", config.corPrimaria);
    root.setProperty("--primary-dark", sombrear(config.corPrimaria, -30));
  }

  if (config.corSecundaria) {
    root.setProperty("--secondary", config.corSecundaria);
  }

  return modo;

}

export function ThemeProvider({ children }) {

  const [config, setConfig] = useState(PADRAO);
  const [modoEfetivo, setModoEfetivo] = useState("escuro");

  useEffect(() => {

    try {

      const cache = localStorage.getItem(CACHE_KEY);

      if (cache) {

        const configCache = { ...PADRAO, ...JSON.parse(cache) };

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setConfig(configCache);

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setModoEfetivo(aplicarNoDocumento(configCache));

      } else {

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setModoEfetivo(aplicarNoDocumento(PADRAO));

      }

    } catch (err) {

      console.error("Erro ao ler cache de tema:", err);

    }

    async function carregar() {

      try {

        const resposta = await ConfiguracaoService.buscarPublica();

        const dados = resposta?.data || resposta;

        const novoConfig = { ...PADRAO, ...dados };

        setConfig(novoConfig);

        setModoEfetivo(aplicarNoDocumento(novoConfig));

        localStorage.setItem(CACHE_KEY, JSON.stringify(novoConfig));

      } catch (err) {

        console.error("Erro ao carregar configuração pública:", err);

      }

    }

    carregar();

  }, []);

  useEffect(() => {

    if (config.tema !== "automatico" || typeof window === "undefined") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    function ouvir() {
      setModoEfetivo(aplicarNoDocumento(config));
    }

    media.addEventListener("change", ouvir);

    return () => media.removeEventListener("change", ouvir);

  }, [config]);

  return (
    <ThemeContext.Provider value={{ ...config, modoEfetivo }}>
      {children}
    </ThemeContext.Provider>
  );

}

export function useTheme() {
  return useContext(ThemeContext);
}
