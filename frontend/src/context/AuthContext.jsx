"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";
import { socket } from "../services/socket";
import { Sessao, emAppInstalado } from "../utils/sessao";

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // No navegador a sessão é por guia (ver utils/sessao.js): sobra de
      // login antigo, que era compartilhado entre guias, é descartada. No
      // app instalado o localStorage É a sessão, então fica.
      if (!emAppInstalado()) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
      }

      localStorage.removeItem("vime-remember");

      const usuarioSalvo = Sessao.usuario();

      if (usuarioSalvo) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUsuario(usuarioSalvo);
      }
    } catch (error) {
      console.error("Erro ao recuperar usuário:", error);
    } finally {
      setLoading(false);
    }
  }, []);

 function login(token, usuario) {

  Sessao.salvar(token, usuario);

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

    Sessao.limpar();

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