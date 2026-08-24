import { api } from "./api";

export const AuthService = {
  login(email, senha) {
    return api("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        senha,
      }),
    });
  },

  esqueciSenha(email) {
    return api("/auth/esqueci-senha", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  redefinirSenha(token, novaSenha) {
    return api("/auth/redefinir-senha", {
      method: "POST",
      body: JSON.stringify({ token, novaSenha }),
    });
  },

  atualizarPerfil(dados) {
    return api("/auth/me", {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },
};