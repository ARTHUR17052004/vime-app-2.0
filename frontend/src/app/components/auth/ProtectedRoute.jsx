"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import { useAuth } from "../../../context/AuthContext";

import Loading from "../ui/Loading";

export default function ProtectedRoute({
  children,
}) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    autenticado,
    loading,
  } = useAuth();

  useEffect(() => {
    // Leva o destino original junto (?next=...) -- sem isso, o Modo TV
    // (ver /tv) nunca voltava sozinho pra tela certa depois de relogar,
    // e o login nem sabia que devia pedir uma sessão de 30 dias pra ele.
    if (!loading && !autenticado) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/")}`);
    }
  }, [
    autenticado,
    loading,
    pathname,
    router,
  ]);

  if (loading) {
    return <Loading />;
  }

  if (!autenticado) {
    return null;
  }

  return children;
}