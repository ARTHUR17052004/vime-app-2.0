"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";
import { socket } from "../services/socket";

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Sessão é por guia (sessionStorage): sobra de login antigo, que era
      // compartilhado entre guias, é descartada.
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      localStorage.removeItem("vime-remember");

      const usuarioStorage = sessionStorage.getItem("usuario");

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

  sessionStorage.setItem("token", token);

  sessionStorage.setItem(
    "usuario",
    JSON.stringify(usuario)
  );

  setUsuario(usuario);

  // Reconecta o tempo real já com o token desta guia.
  socket.disconnect().connect();
}

  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Erro ao fazer logout no servidor:", error);
    }

    sessionStorage.removeItem("usuario");
    sessionStorage.removeItem("token");

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