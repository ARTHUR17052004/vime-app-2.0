"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardService } from "../services/dashboard.service";
import { dashboardMock } from "../mock/dashboard";

// Mesmo intervalo do Modo TV -- atualiza sozinho em segundo plano, sem
// precisar dar F5, pra números e valores ficarem "ao vivo" também na
// tela inicial.
const INTERVALO_ATUALIZACAO_MS = 25000;

export function useDashboard() {
  const [dados, setDados] = useState(dashboardMock);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);

  const carregar = useCallback(async (primeiraVez) => {
    try {
      const dashboard = await DashboardService.listar();

      setDados(dashboard);
      setErro(null);
      setUltimaAtualizacao(new Date());
    } catch (err) {
      console.warn("API indisponível. Utilizando mock.");
      console.error(err);

      // Numa atualização em segundo plano, uma falha passageira não
      // deve derrubar os dados já exibidos na tela.
      if (primeiraVez) {
        setErro(err.message);
      }
    } finally {
      if (primeiraVez) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    carregar(true);

    const intervalo = setInterval(() => {
      // Não gasta requisição atualizando uma aba que não está sendo
      // vista no momento.
      if (document.visibilityState === "visible") {
        carregar(false);
      }
    }, INTERVALO_ATUALIZACAO_MS);

    return () => clearInterval(intervalo);
  }, [carregar]);

  return {
    dados,
    loading,
    erro,
    ultimaAtualizacao,
  };
}