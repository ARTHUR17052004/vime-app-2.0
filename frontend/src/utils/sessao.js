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

// Modo TV (/tv): a tela fica num aparelho ligado 24h, sem ninguém pra
// relogar se a sessão cair. Marcado uma vez (ver ativarModoTv, chamado no
// login com next=/tv e também ao abrir /tv) e depois vale pra sempre nesse
// navegador -- faz a sessão se comportar como a do app instalado (token de
// 30 dias em vez de 1, guardado em localStorage pra sobreviver a reiniciar
// o navegador/aparelho, não só a sessionStorage por guia).
export function emModoTv() {

  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem("vime-tv-modo") === "true";
  } catch (e) {
    return false;
  }

}

export function ativarModoTv() {
  try { window.localStorage.setItem("vime-tv-modo", "true"); } catch (e) {}
}

function armazem() {
  return (emAppInstalado() || emModoTv()) ? window.localStorage : window.sessionStorage;
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
