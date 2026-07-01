export function formatCurrency(value) {
  if (value === null || value === undefined) return "R$ 0,00";

  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}