"use client";

import { useEffect, useState } from "react";
import { AsaasService } from "../services/asaas.service";

export function useAsaas() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    async function carregar() {
      const response = await AsaasService.status();
      setStatus(response.data);
    }

    carregar();
  }, []);

  return status;
}