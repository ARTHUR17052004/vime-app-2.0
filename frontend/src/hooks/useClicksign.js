"use client";

import { useEffect, useState } from "react";
import { ClicksignService } from "../services/clicksign.service";

export function useClicksign() {
  const [configuracao, setConfiguracao] = useState(null);

  useEffect(() => {
    async function carregar() {
      const response = await ClicksignService.configuracao();
      setConfiguracao(response.data);
    }

    carregar();
  }, []);

  return configuracao;
}