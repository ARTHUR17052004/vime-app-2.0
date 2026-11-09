// Somar vários valores monetários em float (ex.: 790 + 850 + 2970 + ...)
// quase sempre acumula erro de arredondamento binário -- o resultado
// vira algo como 9669.949999999997 em vez de 9669.95, e aparece cru na
// tela assim. Qualquer total somado (reduce) em cima de dinheiro
// precisa passar por aqui antes de ser exibido ou comparado.
export function arredondarCentavos(valor) {
  return Math.round((Number(valor) || 0) * 100) / 100;
}

// "R$ 63930" não dá pra ler rápido -- formata com separador de milhar e
// 2 casas decimais, padrão BR ("63.930,00"). Já arredonda sozinho, não
// precisa chamar arredondarCentavos antes.
export function formatarMoeda(valor) {
  return arredondarCentavos(valor).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
