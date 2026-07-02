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
};