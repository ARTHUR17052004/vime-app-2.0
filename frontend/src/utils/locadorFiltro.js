// "Locador de trabalho": Gerência/Operador (sem locador fixo no cadastro)
// podem focar a tela só num locador (ARA ou SH) por vez, em vez de ver
// tudo misturado. É uma preferência do aparelho (cada guia/computador
// escolhe o seu), não uma restrição de segurança -- quem pode ver tudo
// continua podendo, só filtra o que aparece. O backend aplica de verdade
// (ver authMiddleware.js), isso aqui só guarda a escolha e manda no header.

const CHAVE = "vime-locador-filtro";

export function locadorFiltroAtual() {
  try {
    return localStorage.getItem(CHAVE) || "";
  } catch (e) {
    return "";
  }
}

export function definirLocadorFiltro(locadorId) {
  try {
    if (locadorId) localStorage.setItem(CHAVE, locadorId);
    else localStorage.removeItem(CHAVE);
  } catch (e) {}
}
