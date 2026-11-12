// Normaliza texto pra busca em qualquer barra de pesquisa do sistema --
// tira acento ("andré" == "andre"), colapsa espaço duplo/sobra (útil
// quando cola um nome de outro lugar, que às vezes traz espaço não-
// quebrável junto) e põe em minúsculo. Usar nos dois lados da
// comparação (o texto da linha E o termo digitado), nunca só um.
export const normalizarBusca = (texto) =>
  (texto || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
