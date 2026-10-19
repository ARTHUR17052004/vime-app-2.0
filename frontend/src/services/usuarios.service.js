import { api } from "./api";

export const UsuarioService = {
  listar() {
    return api("/usuarios");
  },

  // Só id+nome dos zeladores ativos -- pro seletor de "Responsável" da
  // Vistoria, aberto pra qualquer usuário logado (não exige a
  // permissão de Administração > Usuários).
  listarZeladores() {
    return api("/usuarios/zeladores");
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