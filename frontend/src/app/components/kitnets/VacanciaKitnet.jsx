"use client";

import SeloPrazo from "../ui/SeloPrazo";

// Relógio de vacância de uma kitnet: enquanto está DISPONIVEL, conta
// as 72h corridas desde que ficou vazia (kitnet.vazioDesde, mantido
// pela extensão do Prisma -- ver backend/src/config/prisma.js). Passadas
// as 72h sem locar, o relógio amarelo vira o aviso vermelho "vazia há N
// dia(s)", com N contando a partir daí -- 72h = dia 1, +24h = dia 2,
// +24h = dia 3... (o mesmo N que entra na notificação diária de
// verificarKitnetsVaziasJob.js). Some sozinho assim que a kitnet deixa
// de estar DISPONIVEL.
export default function VacanciaKitnet({ kitnet }) {

  const desde = kitnet.status === "DISPONIVEL" ? kitnet.vazioDesde : null;

  return (
    <SeloPrazo
      desde={desde}
      tituloContagem="Tempo restante até o alerta de vacância (72h)"
      tituloAlerta="Kitnet vazia há mais de 72h -- notificando todo dia"
      textoAlerta={(dias) => `Vazia há ${dias} ${dias === 1 ? "dia" : "dias"}`}
    />
  );

}
