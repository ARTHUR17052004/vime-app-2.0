"use client";

import { useEffect, useState } from "react";
import { DashboardService } from "../services/dashboard.service";
import { dashboardMock } from "../mock/dashboard";

export function useDashboard() {
  const [dados, setDados] = useState(dashboardMock);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregar() {
      try {
        const dashboard = await DashboardService.listar();

        setDados(dashboard);
      } catch (err) {
        console.warn("API indisponível. Utilizando mock.");
        console.error(err);

        setErro(err.message);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  return {
    dados,
    loading,
    erro,
  };
}