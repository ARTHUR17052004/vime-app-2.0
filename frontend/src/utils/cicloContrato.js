// Contratos do Arquivo (origem MANUAL) geralmente vêm de muito antes --
// o "Início" cadastrado pode ser de anos atrás, e o inquilino já
// renovou implicitamente várias vezes desde então (ciclos de 4 em 4
// meses, igual todo contrato novo do sistema). Calcular o fim batendo
// só "início + 4 meses" geraria uma data lá no passado, e o job de fim
// de contrato fecharia o contrato (e esvaziaria a kitnet!) na hora
// seguinte, mesmo o inquilino ainda morando lá. Em vez disso, acha em
// qual ciclo de 4 meses "hoje" cai e devolve o fim DESSE ciclo -- é daí
// que o contrato (e o job automático) retomam a vida normal: lembretes
// de vencimento, renovação, etc.
export function calcularFimCicloAtual(dataInicio, hoje = new Date()) {

  const inicio = new Date(dataInicio);

  if (Number.isNaN(inicio.getTime())) return null;

  let numeroCiclo = 1;
  let cicloInicio = new Date(inicio);

  while (true) {

    const proximoCicloInicio = new Date(cicloInicio);
    proximoCicloInicio.setMonth(proximoCicloInicio.getMonth() + 4);

    // "hoje" ainda está dentro do ciclo que começou em cicloInicio --
    // ele só termina no dia anterior ao início do próximo.
    if (proximoCicloInicio > hoje) {

      const fimCiclo = new Date(proximoCicloInicio);
      fimCiclo.setDate(fimCiclo.getDate() - 1);

      return { fimCiclo, numeroCiclo };

    }

    cicloInicio = proximoCicloInicio;
    numeroCiclo += 1;

  }

}
