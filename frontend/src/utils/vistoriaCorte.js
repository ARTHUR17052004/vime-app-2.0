// Vistoria automática de corte de água/energia por falta de pagamento
// (ver backend/src/jobs/verificarAtrasoCorteJob.js) -- é a única coisa
// que cria vistoria com essa categoria. O status dela (PENDENTE/
// ATRASADA) reflete o prazo da MISSÃO (3 dias úteis pro zelador agir),
// não o atraso da cobrança por trás -- por isso uma vistoria de corte
// pode estar com status PENDENTE e ainda assim representar uma dívida
// já vencida há horas/dias (ver RelogioAtrasoCorte em VistoriaCard.jsx).
// Mesma regra usada em VistoriaCard.jsx/VistoriasMobile.jsx/
// FinanceiroReceitas.jsx -- centralizada aqui pra quem precisa decidir
// se uma vistoria de corte ainda aberta deve contar como "atrasada"
// (ex.: aba Atrasadas de vistorias/page.js, pedido do usuário em
// 25/11/2026).
const STATUS_ENCERRADOS_CORTE = ["REALIZADA", "CANCELADA"];

export function ehVistoriaDeCorte(vistoria) {
  return (
    vistoria.categoria === "Cobrança" &&
    !STATUS_ENCERRADOS_CORTE.includes(vistoria.status)
  );
}
