"use client";

import { useEffect, useState } from "react";
import { WhatsAppService } from "../services/whatsapp.service";

export function useWhatsapp() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    async function carregar() {
      const response = await WhatsAppService.status();
      setStatus(response.data);
    }

    carregar();
  }, []);

    return status;
}