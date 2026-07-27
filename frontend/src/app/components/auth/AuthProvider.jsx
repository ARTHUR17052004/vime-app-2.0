"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const router = useRouter();

  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario");

    if (usuarioSalvo) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUsuario(JSON.parse(usuarioSalvo));
    }

    setLoading(false);
  }, []);

  function logout() {
    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    localStorage.removeItem("usuario");

    setUsuario(null);

    router.push("/login");
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        setUsuario,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}