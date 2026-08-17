"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

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

  localStorage.setItem("token", token);

  localStorage.setItem(
    "usuario",
    JSON.stringify(usuario)
  );

  setUsuario(usuario);
}

  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Erro ao fazer logout no servidor:", error);
    }

    localStorage.removeItem("usuario");
    localStorage.removeItem("token");

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