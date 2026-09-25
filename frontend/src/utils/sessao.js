// Onde a sessão (token + usuário) fica guardada:
//  - navegador (site): sessionStorage -- cada guia tem a sua sessão, sobrevive
//    ao F5 e some ao fechar a guia (volta pro login), então dá pra ter
//    várias guias com contas diferentes;
//  - app instalado (tela inicial do celular): localStorage -- só sai quando o
//    usuário aperta em Sair ou a sessão vence, como os outros apps.

export function emAppInstalado() {

  if (typeof window === "undefined") return false;

  try {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  } catch (e) {
    return false;
  }

}

function armazem() {
  return emAppInstalado() ? window.localStorage : window.sessionStorage;
}

export const Sessao = {

  token() {
    if (typeof window === "undefined") return null;
    try { return armazem().getItem("token"); } catch (e) { return null; }
  },

  usuario() {
    if (typeof window === "undefined") return null;
    try {
      const bruto = armazem().getItem("usuario");
      return bruto ? JSON.parse(bruto) : null;
    } catch (e) {
      return null;
    }
  },

  salvar(token, usuario) {
    const a = armazem();
    a.setItem("token", token);
    a.setItem("usuario", JSON.stringify(usuario));
  },

  atualizarUsuario(usuario) {
    try { armazem().setItem("usuario", JSON.stringify(usuario)); } catch (e) {}
  },

  limpar() {
    try {
      ["token", "usuario"].forEach((k) => {
        window.sessionStorage.removeItem(k);
        window.localStorage.removeItem(k);
      });
    } catch (e) {}
  },

};
