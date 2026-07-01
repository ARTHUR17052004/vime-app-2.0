"use client";

import { useEffect, useState } from "react";
import { DashboardService } from "../services/dashboard.service";

export function useDashboard() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregar() {
      try {
        const response = await DashboardService.listar();
        setDados(response.data);
      } catch (err) {
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