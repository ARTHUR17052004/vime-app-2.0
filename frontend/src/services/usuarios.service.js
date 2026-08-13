import { api } from "./api";

export const UsuarioService = {
  listar() {
    return api("/usuarios");
  },

  buscar(id) {
    return api(`/usuarios/${id}`);
  },

  criar(dados) {
    return api("/usuarios", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  atualizar(id, dados) {
    return api(`/usuarios/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  excluir(id) {
    return api(`/usuarios/${id}`, {
      method: "DELETE",
    });
  },

  redefinirSenha(id, novaSenha, senhaAtual) {
    return api(`/usuarios/${id}/redefinir-senha`, {
      method: "POST",
      body: JSON.stringify({
        novaSenha,
        senhaAtual,
      }),
    });
  },

  enviarAcesso(id) {
    return api(`/usuarios/${id}/enviar-acesso`, {
      method: "POST",
    });
  },
};