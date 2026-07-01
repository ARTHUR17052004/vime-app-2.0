"use client";

import { useEffect, useState } from "react";
import { FinanceiroService } from "../services/financeiro.service";

export function useFinanceiro() {
  const [financeiro, setFinanceiro] = useState(null);

  useEffect(() => {
    async function carregar() {
      const response = await FinanceiroService.resumo();
      setFinanceiro(response.data);
    }

    carregar();
  }, []);

  return financeiro;
}