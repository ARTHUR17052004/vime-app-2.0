// Matemática compartilhada do "relógio de vacância/atraso" -- usada
// por verificarKitnetsVaziasJob.js (kitnet vazia), e agora também por
// verificarSolicitacoesAtrasadasJob.js (prazo da solicitação) e
// verificarVistoriasAtrasadasJob.js (próxima vistoria). Um só lugar
// pra essa conta evita o que já aconteceu aqui: cada job reimplementar
// o "72h de tolerância, depois dia 1/2/3..." do jeito errado.
const HORAS_LIMITE = 72;
const MS_LIMITE = HORAS_LIMITE * 60 * 60 * 1000;
const MS_DIA = 24 * 60 * 60 * 1000;

// `desde`: quando a tolerância começou a contar (kitnet.vazioDesde,
// solicitacao.prazo, vistoria.dataProxima...). Sem status "em aberto"
// nenhum caller deveria nem chamar isso -- quem decide se o registro
// ainda conta é o próprio job/service, olhando o status dele.
function calcularAlerta(desde, agora = new Date()) {

  const decorridoMs = agora.getTime() - new Date(desde).getTime();

  if (decorridoMs < MS_LIMITE) {
    return { emAlerta: false, dias: 0 };
  }

  const dias = Math.floor((decorridoMs - MS_LIMITE) / MS_DIA) + 1;

  return { emAlerta: true, dias };

}

module.exports = { HORAS_LIMITE, MS_LIMITE, MS_DIA, calcularAlerta };
