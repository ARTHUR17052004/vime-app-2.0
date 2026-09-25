// Catálogo dos tipos de notificação que o administrador pode ligar/desligar
// (tela Administração > Notificações). O tipo é descoberto pelo título
// que cada serviço já usa em notificacaoService.criar() -- assim nenhum
// dos ~20 pontos que criam notificação precisou mudar.
//
// Sem linha na tabela NotificacaoConfig, o tipo continua ligado (é o
// comportamento de sempre): só muda algo depois que o admin desliga.

const TIPOS = [
  { chave: "KITNET_VAZIA", grupo: "Imóveis", rotulo: "Kitnet vazia", descricao: "Avisa todo dia enquanto uma kitnet passar de 72h sem ser locada.", titulos: ["Kitnet vazia"] },
  { chave: "VISTORIA_NOVA", grupo: "Imóveis", rotulo: "Nova vistoria", descricao: "Quando uma vistoria é cadastrada.", titulos: ["Nova vistoria"] },
  { chave: "VISTORIA_ATRASADA", grupo: "Imóveis", rotulo: "Vistoria atrasada", descricao: "Vistoria que passou da data sem ser realizada.", titulos: ["Vistoria atrasada"] },

  { chave: "CONTRATO_VENCENDO", grupo: "Contratos", rotulo: "Contrato próximo do vencimento", descricao: "Contrato ativo que vence nos próximos dias.", titulos: ["Contrato próximo do vencimento"] },
  { chave: "CONTRATO_NOVO", grupo: "Contratos", rotulo: "Novo contrato criado", descricao: "Quando um contrato é cadastrado.", titulos: ["Novo contrato criado"] },
  { chave: "CONTRATO_ENCERRADO", grupo: "Contratos", rotulo: "Contrato encerrado", descricao: "Quando um contrato é encerrado.", titulos: ["Contrato encerrado"] },
  { chave: "CONTRATO_ASSINATURA", grupo: "Contratos", rotulo: "Assinatura digital (Clicksign)", descricao: "Contrato enviado, assinado ou cancelado na Clicksign.", titulos: ["Contrato enviado para assinatura", "Contrato assinado", "Contrato cancelado na Clicksign"] },

  { chave: "COBRANCA_PAGA", grupo: "Financeiro", rotulo: "Cobrança paga", descricao: "Pagamento confirmado (Asaas ou Banco do Brasil).", titulos: ["Cobrança paga"] },
  { chave: "COBRANCA_ATRASADA", grupo: "Financeiro", rotulo: "Cobrança atrasada", descricao: "Cobrança que venceu sem pagamento.", titulos: ["Cobrança atrasada"] },

  { chave: "SOLICITACAO_NOVA", grupo: "Solicitações", rotulo: "Nova solicitação", descricao: "Quando alguém abre uma solicitação.", titulos: ["Nova solicitação"] },
  { chave: "SOLICITACAO_ATUALIZADA", grupo: "Solicitações", rotulo: "Solicitação classificada ou respondida", descricao: "Classificação e novas respostas nas solicitações.", titulos: ["Solicitação classificada", "Nova resposta em solicitação"] },
  { chave: "SOLICITACAO_PRAZO", grupo: "Solicitações", rotulo: "Solicitação com prazo vencido", descricao: "Solicitação que passou do prazo sem ser atendida.", titulos: ["Solicitação com prazo vencido"] },

  { chave: "CHAMADO", grupo: "Suporte", rotulo: "Chamados de suporte", descricao: "Novo chamado e respostas no suporte técnico.", titulos: ["Novo chamado de suporte", "Chamado atualizado", "Nova resposta em chamado"] },

  { chave: "WHATSAPP_MENSAGEM", grupo: "WhatsApp", rotulo: "Nova mensagem no WhatsApp", descricao: "Mensagem recebida de um contato.", prefixos: ["Nova mensagem de "] },
];

const POR_TITULO = new Map();
TIPOS.forEach((t) => (t.titulos || []).forEach((titulo) => POR_TITULO.set(titulo, t.chave)));

// Notificação que não bate com nenhum tipo do catálogo (ex.: as de
// teste) fica sempre ligada -- "OUTROS" não aparece pra configurar.
const tipoDe = ({ titulo }) => {

  if (POR_TITULO.has(titulo)) return POR_TITULO.get(titulo);

  const porPrefixo = TIPOS.find((t) => (t.prefixos || []).some((p) => (titulo || "").startsWith(p)));

  return porPrefixo ? porPrefixo.chave : "OUTROS";

};

module.exports = { TIPOS, tipoDe };
