// Um passo da periodicidade a partir de uma data (null = "Única", não
// repete). Usado tanto pra calcular a "Data Próxima" sozinho no
// formulário quanto pra renovar o ciclo ao concluir uma vistoria.
export function avancarUmaVez(data, periodicidade) {

  const nova = new Date(data);

  switch (periodicidade) {

    case "Diária": nova.setDate(nova.getDate() + 1); break;
    case "Semanal": nova.setDate(nova.getDate() + 7); break;
    case "Quinzenal": nova.setDate(nova.getDate() + 15); break;
    case "Mensal": nova.setMonth(nova.getMonth() + 1); break;
    case "Bimestral": nova.setMonth(nova.getMonth() + 2); break;
    case "Trimestral": nova.setMonth(nova.getMonth() + 3); break;
    case "Semestral": nova.setMonth(nova.getMonth() + 6); break;
    case "Anual": nova.setFullYear(nova.getFullYear() + 1); break;
    default: return null;

  }

  return nova;

}
