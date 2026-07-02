"use client";

import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuarioStorage = localStorage.getItem("usuario");

    if (token && usuarioStorage) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUsuario(JSON.parse(usuarioStorage));
    }

    setLoading(false);
  }, []);

  function login(token, usuario) {
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));

    setUsuario(usuario);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    setUsuario(null);

    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
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