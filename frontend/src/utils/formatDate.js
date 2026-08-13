export function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("pt-BR").split("/").join("-");
}

export function formatDateTime(date) {
  if (!date) return "-";

  const dataFormatada = new Date(date);

  return `${formatDate(dataFormatada)} ${dataFormatada.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}