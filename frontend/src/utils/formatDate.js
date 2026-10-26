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

  return new Date(date).toLocaleDateString("pt-BR").split("/").join("-");
}

export function formatDateTime(date) {
  if (!date) return "-";

  // Passa o valor original (string) pro formatDate, não um Date já
  // convertido -- senão a proteção contra "AAAA-MM-DD vira meia-noite
  // UTC" lá dentro nunca dispara, porque ela só reconhece esse formato
  // como string, não como Date.
  return `${formatDate(date)} ${new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}