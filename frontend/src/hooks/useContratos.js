"use client";

import { useEffect, useState } from "react";
import { ContratoService } from "../services/contratos.service";

export function useContratos() {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const response = await ContratoService.listar();
        setContratos(response.data);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  return {
    contratos,
    loading,
  };
}