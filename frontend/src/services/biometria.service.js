import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
} from "@simplewebauthn/browser";

import { api } from "./api";

// Login por digital/rosto (WebAuthn): quem reconhece o dono é o próprio
// celular/computador -- o sistema só recebe uma assinatura, nunca a
// biometria. O "vime-biometria" no localStorage só lembra que ESTE
// aparelho já cadastrou (pra mostrar/abrir o login por digital sozinho).

const CHAVE_APARELHO = "vime-biometria";

export const BiometriaService = {

  async suportado() {
    try {
      return browserSupportsWebAuthn() && (await platformAuthenticatorIsAvailable());
    } catch (e) {
      return false;
    }
  },

  aparelhoCadastrado() {
    try {
      return localStorage.getItem(CHAVE_APARELHO) === "1";
    } catch (e) {
      return false;
    }
  },

  esquecerAparelho() {
    try {
      localStorage.removeItem(CHAVE_APARELHO);
    } catch (e) {}
  },

  async listar() {
    const resposta = await api("/auth/biometria");
    return resposta.data || [];
  },

  async remover(id) {
    await api(`/auth/biometria/${id}`, { method: "DELETE" });
  },

  // Usuário já logado: pede a digital ao aparelho e guarda a chave pública.
  async cadastrar(nome) {

    const opcoes = await api("/auth/biometria/registro/opcoes", { method: "POST" });

    let resposta;

    try {
      resposta = await startRegistration({ optionsJSON: opcoes.data });
    } catch (erro) {
      throw new Error(mensagemDoNavegador(erro, "Não foi possível cadastrar a digital."));
    }

    await api("/auth/biometria/registro/verificar", {
      method: "POST",
      body: JSON.stringify({ resposta, nome }),
    });

    try {
      localStorage.setItem(CHAVE_APARELHO, "1");
    } catch (e) {}

  },

  // Tela de login: devolve { token, usuario } igual ao login por senha.
  async entrar() {

    const opcoes = await api("/auth/biometria/login/opcoes", { method: "POST" });

    let resposta;

    try {
      resposta = await startAuthentication({ optionsJSON: opcoes.data.opcoes });
    } catch (erro) {
      throw new Error(mensagemDoNavegador(erro, "Não foi possível ler a digital."));
    }

    const login = await api("/auth/biometria/login/verificar", {
      method: "POST",
      body: JSON.stringify({ desafioId: opcoes.data.desafioId, resposta }),
    });

    return login.data;

  },

};

// Cancelar o pedido de digital não é erro de verdade -- só não faz nada.
function mensagemDoNavegador(erro, padrao) {
  if (erro?.name === "NotAllowedError") return "Digital cancelada ou não reconhecida.";
  if (erro?.name === "InvalidStateError") return "Este aparelho já está cadastrado.";
  return erro?.message || padrao;
}
