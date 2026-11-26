// "PENDENTE" sozinho não diz se já foi mandada pro banco ou não -- olha
// gatewayReferencia (só fica preenchido depois do "Enviar Cobrança")
// pra separar "Pendente" (ainda não enviada) de "Em Aberto" (enviada,
// aguardando o inquilino pagar). Usado tanto pro badge da lista quanto
// pelo filtro de Status -- senão filtrar por "Pendente" também trazia
// quem já estava "Em Aberto" (mesmo status PENDENTE por baixo, só
// mostrado diferente).
// Rótulo de cada motivo de classificação final de inadimplência (botão
// "Inadimplência" nos 3 pontinhos) -- mesmos 3 valores de
// TerminoAntecipadoModal.jsx/MOTIVOS_TERMINO_ANTECIPADO, só reaproveitado
// aqui pro selo da Receita.
export const ROTULO_INADIMPLENCIA = {
  ABANDONO: "Abandono",
  INADIMPLENCIA: "Inadimplência",
  QUEBRA_DO_INQUILINO: "Quebra de Contrato",
};

// Selo de status "cru" -- Atrasada/Paga/Cancelada/etc. Antes a escalada
// de corte de água/energia (kitnetEsvaziadaEm/corteRealizadoEm/
// classificacaoInadimplencia) substituía esse selo por um só ("Corte de
// Água e Energia", "Esvaziar Kitnet"...), escondendo que a cobrança
// continua Atrasada o tempo todo. Pedido do usuário em 26/11/2026:
// "Atrasada" nunca some -- os selos da escalada (ver badgesEscaladaReceita
// abaixo) aparecem JUNTO, nunca no lugar dele.
export function statusExibidoReceita(item) {

  if (item.status === "PAGO" || item.status === "PAGA") {
    return { codigo: "PAGA", texto: "Pago", variant: "emerald" };
  }

  if (item.status === "ATRASADA") {
    return { codigo: "ATRASADA", texto: "Atrasada", variant: "red" };
  }

  if (item.status === "CANCELADA") {
    return { codigo: "CANCELADA", texto: "Cancelada", variant: "gray" };
  }

  if (item.gatewayReferencia) {
    return { codigo: "EM_ABERTO", texto: "Em Aberto", variant: "blue" };
  }

  return { codigo: "PENDENTE", texto: "Pendente", variant: "yellow" };

}

// Igual statusExibidoReceita, mas pro FILTRO de Status (Financeiro >
// Extratos) -- esse sim precisa saber o estágio mais avançado da
// escalada pra filtrar "só quem está em risco de corte" etc. (o selo
// visual da lista usa statusExibidoReceita + badgesEscaladaReceita
// empilhados; o filtro continua de um valor só).
export function codigoFiltroReceita(item) {

  if (item.classificacaoInadimplencia) return "INADIMPLENTE";
  if (item.kitnetEsvaziadaEm) return "ESVAZIAR_KITNET";
  if (item.corteRealizadoEm) return "CORTE_AGUA_ENERGIA";

  return statusExibidoReceita(item).codigo;

}

// Pilha de selos da escalada de corte de água/energia -> desocupação de
// imóvel (ver corteVistoriaService.js no backend) -- somam em cima do
// selo de status acima, nunca substituem ele: "Atrasada" fica vermelho
// o tempo todo, e cada etapa concluída vira um selo vermelho a mais;
// a etapa aberta no momento (aguardando corte/aguardando desocupação)
// já aparece como o relógio ao vivo (RelogioCorte), não precisa de selo
// estático aqui também. Pedido do usuário em 26/11/2026.
export function badgesEscaladaReceita(item) {

  const badges = [];

  if (item.corteRealizadoEm) {
    badges.push({ texto: "Corte realizado", variant: "red" });
  }

  if (item.kitnetEsvaziadaEm) {

    badges.push({ texto: "Desocupação realizada", variant: "red" });

    badges.push(
      item.classificacaoInadimplencia
        ? {
          texto: ROTULO_INADIMPLENCIA[item.classificacaoInadimplencia] || item.classificacaoInadimplencia,
          variant: "purple",
        }
        : { texto: "Aguardando tratativa", variant: "purple" }
    );

  }

  return badges;

}

function formatarDataBR(data) {
  if (!data) return null;
  return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

// Monta o "demonstrativo" de uma cobrança pro painel de Transações --
// cada status tem seu próprio resumo (datas e origem relevantes pra
// aquele estado), em vez de uma linha única igual pra tudo. Transações
// só mostra (não edita/envia -- isso é só no Financeiro agora), então
// aqui é puro texto derivado do que já está na receita.
export function demonstrativoReceita(item) {

  const enviada = item.enviadaAsaas || !!item.gatewayReferencia;
  const banco =
    item.gatewayProvider === "BB"
      ? "Banco do Brasil"
      : item.gatewayProvider === "ASAAS" || item.enviadaAsaas
      ? "Asaas"
      : null;

  const codigo = statusExibidoReceita(item).codigo;

  if (codigo === "CANCELADA") {
    return {
      tipo: "cancelada",
      titulo: "Cancelada",
      linhas: [],
    };
  }

  if (codigo === "PAGA") {

    const linhas = [];

    if (item.dataPagamento) {
      linhas.push(`Pago em ${formatarDataBR(item.dataPagamento)}`);
    }

    linhas.push(
      enviada
        ? `Via ${banco || "banco"}${item.gatewayReferencia ? ` · ${item.gatewayReferencia}` : ""}`
        : "Lançamento manual -- sem passar pelo banco"
    );

    if (item.dataCredito && formatarDataBR(item.dataCredito) !== formatarDataBR(item.dataPagamento)) {
      linhas.push(`Creditado em ${formatarDataBR(item.dataCredito)}`);
    }

    return { tipo: "paga", titulo: "Pago", linhas };

  }

  if (!enviada) {
    return {
      tipo: "aguardando",
      titulo: "Em aberto -- aguardando envio ao banco",
      linhas: item.createdAt ? [`Lançada em ${formatarDataBR(item.createdAt)}`] : [],
    };
  }

  if (codigo === "ATRASADA") {
    return {
      tipo: "atrasada",
      titulo: "Vencida -- aguardando pagamento",
      linhas: [
        item.vencimento && `Venceu em ${formatarDataBR(item.vencimento)}`,
        item.cobrancaEnviadaEm && `Enviada ao banco em ${formatarDataBR(item.cobrancaEnviadaEm)}${banco ? ` (${banco})` : ""}`,
      ].filter(Boolean),
    };
  }

  // EM_ABERTO -- já enviada, aguardando o inquilino pagar.
  return {
    tipo: "enviada",
    titulo: "Enviada ao banco -- aguardando pagamento",
    linhas: [
      `Via ${banco || "banco"}${item.gatewayReferencia ? ` · ${item.gatewayReferencia}` : ""}`,
      item.cobrancaEnviadaEm && `Enviada em ${formatarDataBR(item.cobrancaEnviadaEm)}`,
    ].filter(Boolean),
  };

}
