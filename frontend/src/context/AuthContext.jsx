"use client";

import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const usuarioStorage = localStorage.getItem("usuario");

      if (usuarioStorage) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUsuario(JSON.parse(usuarioStorage));
      }
    } catch (error) {
      console.error("Erro ao recuperar usuário:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  function login(token, usuario) {
    document.cookie = `token=${token}; path=/; max-age=86400`;

    localStorage.setItem(
      "usuario",
      JSON.stringify(usuario)
    );

    setUsuario(usuario);
  }

  function logout() {
    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    localStorage.removeItem("usuario");

    setUsuario(null);

    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        setUsuario,
        login,
        logout,
        autenticado: !!usuario,
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