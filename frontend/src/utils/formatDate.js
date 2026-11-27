export function formatDate(date) {
  if (!date) return "-";

  // "AAAA-MM-DD" sem hora (ex.: valor de <input type="date">) o
  // construtor do Date entende como meia-noite UTC -- num fuso atrás de
  // UTC (Brasil) isso "volta" um dia na exibição (19 virava 18). Só
  // nesse caso monta a data no fuso local, em vez de deixar o Date
  // decidir; datas com hora (timestamps normais do banco) seguem igual.
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [ano, mes, dia] = date.split("-").map(Number);
    return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR").split("/").join("-");
  }

  // Mesmo problema do caso acima, só que pro timestamp completo que
  // volta da API (ex.: "2026-11-27T00:00:00.000Z") -- todo campo de
  // "dia" do sistema (vencimento, dataInicio, dataFim...) é guardado
  // como meia-noite UTC, então formatar no fuso local (Brasil, UTC-3)
  // também "voltava" um dia aqui. Fixa a exibição em UTC pra bater
  // sempre com o dia guardado, não com o fuso de quem está vendo. Bug
  // relatado em 27/11/2026 (vencimento da 1ª cobrança do contrato da
  // Erika aparecia 26/11 em vez de 27/11).
  return new Date(date)
    .toLocaleDateString("pt-BR", { timeZone: "UTC" })
    .split("/")
    .join("-");
}

export function formatDateTime(date) {
  if (!date) return "-";

  // Diferente de formatDate: aqui o horário importa de verdade (ex.:
  // "enviado em", "vistoria realizada em") -- não é um campo de "dia"
  // guardado como meia-noite UTC, é um instante de verdade. Por isso
  // formata TUDO no fuso local (não chama formatDate, que agora força
  // UTC), senão o dia podia aparecer descolado do horário mostrado do
  // lado (ex.: 27/11 23h desse jeito vira 28/11 em UTC).
  const d = new Date(date);

  return `${d.toLocaleDateString("pt-BR").split("/").join("-")} ${d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}