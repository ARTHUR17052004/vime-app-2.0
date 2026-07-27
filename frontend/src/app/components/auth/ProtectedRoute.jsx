"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "../../../context/AuthContext";

import Loading from "../ui/Loading";

export default function ProtectedRoute({
  children,
}) {
  const router = useRouter();

  const {
    autenticado,
    loading,
  } = useAuth();

  useEffect(() => {
    if (!loading && !autenticado) {
      router.replace("/login");
    }
  }, [
    autenticado,
    loading,
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