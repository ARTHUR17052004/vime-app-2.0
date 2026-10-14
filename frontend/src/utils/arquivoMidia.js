// Fotos/vídeos de vistoria viram base64 dentro do próprio JSON da
// requisição (mesmo padrão de Usuario.foto/Contrato.arquivoDados -- sem
// disco/S3). O backend recusa corpo acima de 25MB (ver server.js), e
// base64 infla o arquivo original em ~37% -- por isso os limites aqui
// são bem mais apertados que 25MB: dá pra pegar o erro ANTES de tentar
// enviar (com uma mensagem que explica o motivo, em vez do genérico
// "request entity too large" que vinha do servidor).
export const LIMITE_MIDIA_MB = 15;
export const LIMITE_TOTAL_MIDIA_MB = 18;

function bytesDoDataUrl(dataUrl) {
  if (!dataUrl) return 0;
  const base64 = String(dataUrl).split(",")[1] || "";
  return Math.floor(base64.length * 0.75);
}

// Soma o que já foi anexado (fotos existentes, já em base64) -- usado
// pra saber quanto "espaço" ainda sobra antes do próximo arquivo.
export function tamanhoTotalMB(dataUrls) {
  const total = (dataUrls || []).reduce((soma, d) => soma + bytesDoDataUrl(d), 0);
  return total / 1024 / 1024;
}

export function lerArquivoComoDataUrl(arquivo, opcoes = {}) {

  const {
    limiteMB = LIMITE_MIDIA_MB,
    totalAtualMB = 0,
    limiteTotalMB = LIMITE_TOTAL_MIDIA_MB,
  } = opcoes;

  return new Promise((resolve, reject) => {

    const tipo = arquivo.type.startsWith("video") ? "vídeo" : "arquivo";
    const tamanhoMB = arquivo.size / 1024 / 1024;

    if (tamanhoMB > limiteMB) {
      reject(
        new Error(
          `O ${tipo} "${arquivo.name}" tem ${tamanhoMB.toFixed(1)}MB, acima do limite de ${limiteMB}MB por arquivo. Tente uma versão mais curta ou em qualidade menor.`
        )
      );
      return;
    }

    if (totalAtualMB + tamanhoMB > limiteTotalMB) {
      reject(
        new Error(
          `O ${tipo} "${arquivo.name}" não cabe mais -- o total de fotos/vídeos já anexados está no limite de ${limiteTotalMB}MB. Remova algum anexo antes de adicionar outro.`
        )
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Não foi possível ler o arquivo "${arquivo.name}".`));
    reader.readAsDataURL(arquivo);

  });

}
