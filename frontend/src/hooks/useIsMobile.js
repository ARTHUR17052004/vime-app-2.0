"use client";

import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = "(max-width: 767px)";

// Decide entre a casca desktop (intocada) e a casca mobile. Começa
// como `false` (SSR/primeira pintura) pra nunca piscar o shell mobile
// em cima do desktop antes do JS carregar.
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_BREAKPOINT);

    setIsMobile(media.matches);

    function aoMudar(e) {
      setIsMobile(e.matches);
    }

    media.addEventListener("change", aoMudar);

    return () => media.removeEventListener("change", aoMudar);
  }, []);

  return isMobile;
}
