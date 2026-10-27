// "AAAA-MM-DD" (data de <input type="date">, sem hora) no construtor
// do Date vira meia-noite UTC -- no fuso -03:00 do servidor/do
// navegador isso "volta" um dia quando lido de volta (05/10 salvo
// virava 04/10 na tela). Monta a data pelos componentes locais nesse
// caso; valores com hora (timestamps, ISO completo) seguem iguais.
const paraDataOuNull = (valor) => {
  if (valor === undefined) return undefined;
  if (valor === null || valor === "") return null;

  if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [ano, mes, dia] = valor.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
  }

  return new Date(valor);
};

module.exports = {
  paraDataOuNull
};
