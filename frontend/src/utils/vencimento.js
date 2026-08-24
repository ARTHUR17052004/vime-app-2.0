// Calcula a próxima data de vencimento a partir do dia do mês: se o
// dia deste mês já passou, cai no mesmo dia do mês seguinte.
export function proximoVencimento(diaVencimento) {
  if (!diaVencimento) return null;

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();

  let data = new Date(ano, mes, diaVencimento);

  if (data < hoje) {
    data = new Date(ano, mes + 1, diaVencimento);
  }

  return data;
}

export function formatarProximoVencimento(diaVencimento) {
  const data = proximoVencimento(diaVencimento);
  if (!data) return "-";

  return data.toLocaleDateString("pt-BR");
}
