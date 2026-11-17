// `blob + <a download> + click()` (o padrão antigo usado nos botões de
// "Baixar PDF"/"Baixar arquivo") funciona bem no desktop, mas no
// celular (principalmente como PWA instalado) costuma falhar em
// silêncio -- o "download" dispara sem nenhum feedback visível e o
// usuário não acha o arquivo em lugar nenhum, então parece que "não
// abre, não visualiza, dá erro" quando na real nem erro deu.
//
// Abrir uma aba em branco ANTES do fetch (ainda dentro do clique,
// antes de qualquer await) e só trocar a URL dela depois que o blob
// chega é o jeito confiável de mostrar o arquivo de verdade (o
// navegador some com seu próprio visualizador de PDF) em vez de só
// arriscar baixar -- funciona em muito mais navegadores mobile do que
// o <a download>. Se a aba não abriu (bloqueio de pop-up), cai pro
// download forçado como antes.
//
// Uso: chamar `window.open("", "_blank")` como a PRIMEIRA linha do
// handler de clique (antes de qualquer await) e guardar o retorno;
// só então buscar o blob e chamar `mostrarBlobNaAba`.
export function mostrarBlobNaAba(aba, blob, { nomeArquivo } = {}) {

  const url = window.URL.createObjectURL(blob);

  if (aba && !aba.closed) {
    aba.location.href = url;
  } else {
    const link = document.createElement("a");
    link.href = url;
    link.download = nomeArquivo || "arquivo";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  // revoga só depois de um tempo -- a aba/viewer precisa de tempo pra
  // carregar o blob antes da URL ser invalidada.
  setTimeout(() => window.URL.revokeObjectURL(url), 60000);

}
