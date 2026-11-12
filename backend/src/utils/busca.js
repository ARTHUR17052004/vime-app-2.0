// Mesma normalização do frontend (utils/busca.js) -- tira acento,
// colapsa espaço, põe em minúsculo. Usado pela busca global
// (buscaController.js), que filtra em JS em vez de "contains" do
// Prisma -- Postgres ILIKE é insensível a maiúscula/minúscula, mas
// não a acento, e os volumes aqui (dezenas/poucas centenas de linhas
// por tabela) não justificam reescrever tudo em SQL cru só por isso.
const normalizarBusca = (texto) =>
  (texto || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

module.exports = { normalizarBusca };
