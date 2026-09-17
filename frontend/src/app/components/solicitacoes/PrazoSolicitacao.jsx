"use client";

import SeloPrazo from "../ui/SeloPrazo";

// Solicitação atendida ou rejeitada não conta mais -- mesmo espírito
// de "sai de DISPONIVEL" nas kitnets.
const STATUS_ENCERRADOS = ["ATENDIDA", "REJEITADA"];

// Mesmo relógio das kitnets (ver VacanciaKitnet.jsx), mas o "desde" é
// direto o campo prazo da solicitação -- se o prazo for editado, o
// relógio já parte do valor novo sozinho, sem precisar de nenhum
// campo extra pra guardar "desde quando". 72h de tolerância depois do
// prazo vencido, depois disso "prazo vencido há N dia(s)" (o mesmo N
// da notificação diária de verificarSolicitacoesAtrasadasJob.js).
export default function PrazoSolicitacao({ solicitacao }) {

  const desde =
    !STATUS_ENCERRADOS.includes(solicitacao.status)
      ? solicitacao.prazo
      : null;

  return (
    <SeloPrazo
      desde={desde}
      tituloContagem="Tempo restante até o alerta de prazo vencido (72h)"
      tituloAlerta="Prazo vencido há mais de 72h -- notificando todo dia"
      textoAlerta={(dias) => `Prazo vencido há ${dias} ${dias === 1 ? "dia" : "dias"}`}
    />
  );

}
