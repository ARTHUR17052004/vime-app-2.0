"use client";

import SeloPrazo from "../ui/SeloPrazo";

// Vistoria realizada ou cancelada não conta mais.
const STATUS_ENCERRADOS = ["REALIZADA", "CANCELADA"];

// Mesmo relógio das kitnets (ver VacanciaKitnet.jsx), mas o "desde" é
// direto o campo dataProxima da vistoria -- se a periodicidade
// recalcular essa data (ou alguém editar na mão), o relógio já parte
// do valor novo sozinho. 72h de tolerância depois da data vencida,
// depois disso "atrasada há N dia(s)" (o mesmo N da notificação
// diária de verificarVistoriasAtrasadasJob.js).
export default function AtrasoVistoria({ vistoria }) {

  const desde =
    !STATUS_ENCERRADOS.includes(vistoria.status)
      ? vistoria.dataProxima
      : null;

  return (
    <SeloPrazo
      desde={desde}
      tituloContagem="Tempo restante até o alerta de vistoria atrasada (72h)"
      tituloAlerta="Vistoria atrasada há mais de 72h -- notificando todo dia"
      textoAlerta={(dias) => `Atrasada há ${dias} ${dias === 1 ? "dia" : "dias"}`}
    />
  );

}
