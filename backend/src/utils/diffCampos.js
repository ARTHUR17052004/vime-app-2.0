// Monta o "o que mudou" de um log/auditoria a partir do registro antes/depois,
// comparando só os campos que interessam (ids e relações completas ficam de
// fora -- quem chama escolhe explicitamente o que é relevante mostrar).

const formatarValor = (valor, tipo) => {

  if (valor === null || valor === undefined || valor === "") return "vazio";

  if (tipo === "moeda") {
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  if (tipo === "data") {
    const data = valor instanceof Date ? valor : new Date(valor);
    return Number.isNaN(data.getTime()) ? String(valor) : data.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  }

  if (typeof valor === "boolean") return valor ? "sim" : "não";

  return String(valor);

};

// campos: { nomeDoCampo: "Rótulo" | { rotulo: "Rótulo", tipo: "moeda"|"data" } }
const diffCampos = (anterior, novo, campos) => {

  if (!anterior || !novo) return "";

  const partes = [];

  for (const [campo, def] of Object.entries(campos)) {

    const rotulo = typeof def === "string" ? def : def.rotulo;
    const tipo = typeof def === "string" ? undefined : def.tipo;

    const antes = anterior[campo];
    const depois = novo[campo];

    const antesCmp = antes instanceof Date ? antes.toISOString() : antes;
    const depoisCmp = depois instanceof Date ? depois.toISOString() : depois;

    if (antesCmp === depoisCmp) continue;
    if ((antesCmp === null || antesCmp === undefined) && (depoisCmp === null || depoisCmp === undefined)) continue;

    partes.push(`${rotulo}: ${formatarValor(antes, tipo)} → ${formatarValor(depois, tipo)}`);

  }

  return partes.join("; ");

};

module.exports = { diffCampos, formatarValor };
