// Presets de período usados no Comparativo de Relatórios (ver
// RelatorioComparativo.jsx) -- "Personalizado" deixa a pessoa escolher
// duas datas na mão em vez de um preset.

export const PRESETS_PERIODO = [
  { chave: "ESTE_MES", rotulo: "Este mês" },
  { chave: "MES_PASSADO", rotulo: "Mês passado" },
  { chave: "ESTE_ANO", rotulo: "Este ano" },
  { chave: "ANO_PASSADO", rotulo: "Ano passado" },
  { chave: "PERSONALIZADO", rotulo: "Personalizado" },
];

const inicioDoMes = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const fimDoMes = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
const inicioDoAno = (d) => new Date(d.getFullYear(), 0, 1);
const fimDoAno = (d) => new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);

// null = "Personalizado" (quem chama usa as datas escolhidas na mão).
export function intervaloDoPreset(chave, hoje = new Date()) {

  switch (chave) {

    case "ESTE_MES":
      return { inicio: inicioDoMes(hoje), fim: fimDoMes(hoje) };

    case "MES_PASSADO": {
      const mesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      return { inicio: inicioDoMes(mesPassado), fim: fimDoMes(mesPassado) };
    }

    case "ESTE_ANO":
      return { inicio: inicioDoAno(hoje), fim: fimDoAno(hoje) };

    case "ANO_PASSADO": {
      const anoPassado = new Date(hoje.getFullYear() - 1, 0, 1);
      return { inicio: inicioDoAno(anoPassado), fim: fimDoAno(anoPassado) };
    }

    default:
      return null;

  }

}

export function dentroDoPeriodo(data, inicio, fim) {
  if (!data || !inicio || !fim) return false;
  const d = new Date(data);
  return d >= inicio && d <= fim;
}
