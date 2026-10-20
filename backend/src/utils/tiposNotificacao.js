// Catálogo dos tipos de notificação que o administrador pode ligar/desligar
// (tela Administração > Notificações). O tipo é descoberto pelo título
// que cada serviço já usa em notificacaoService.criar() -- assim nenhum
// dos ~20 pontos que criam notificação precisou mudar.
//
// Sem linha na tabela NotificacaoConfig, o tipo continua ligado (é o
// comportamento de sempre): só muda algo depois que o admin desliga.

const TIPOS = [
  {
    chave: "KITNET_VAZIA", grupo: "Imóveis", rotulo: "Kitnet vazia",
    descricao: "Avisa todo dia enquanto uma kitnet passar de 72h sem ser locada.",
    titulos: ["Kitnet vazia"],
    variaveis: ["kitnet", "unidade", "dias"],
    mensagemPadrao: "{{kitnet}} ({{unidade}}) está vazia há {{dias}} dia(s) sem ser locada.",
  },
  {
    chave: "VISTORIA_NOVA", grupo: "Imóveis", rotulo: "Nova vistoria",
    descricao: "Quando uma vistoria é cadastrada.",
    titulos: ["Nova vistoria"],
    variaveis: ["titulo"],
    mensagemPadrao: "🔍 Nova vistoria na área: \"{{titulo}}\". Bora conferir quando der!",
  },
  {
    chave: "VISTORIA_PENDENTE", grupo: "Imóveis", rotulo: "Vistoria pendente",
    descricao: "Avisa assim que a vistoria entra nas últimas 72h antes do prazo, e todo dia enquanto continuar sem resposta.",
    titulos: ["Vistoria pendente"],
    variaveis: ["titulo", "local", "prazo"],
    mensagemPadrao: "🕒 Psst! A vistoria \"{{titulo}}\" ({{local}}) continua pendente -- o prazo é {{prazo}}.",
  },
  {
    chave: "VISTORIA_ATRASADA", grupo: "Imóveis", rotulo: "Vistoria atrasada",
    descricao: "Avisa assim que o prazo vence sem resposta, e todo dia enquanto continuar atrasada.",
    titulos: ["Vistoria atrasada"],
    variaveis: ["titulo", "local", "dias"],
    mensagemPadrao: "⏰ Psst! A vistoria \"{{titulo}}\" ({{local}}) já passou do prazo há {{dias}} dia(s). Dá um tempinho pra resolver isso hoje?",
  },
  {
    chave: "VISTORIA_ENTREGA_VAZIA", grupo: "Imóveis", rotulo: "Vistoria urgente (kitnet vazia)",
    descricao: "Toca um alerta mais forte: uma kitnet acabou de ficar vazia e já tem vistoria de entrega esperando (pro Zelador).",
    titulos: ["Vistoria urgente: kitnet vazia"],
    variaveis: ["kitnet", "unidade", "endereco"],
    mensagemPadrao: "🔑🚨 {{kitnet}} ({{unidade}}) acabou de ficar vazia! ({{endereco}}) Vai lá conferir a entrega assim que puder.",
  },

  {
    chave: "CONTRATO_VENCENDO", grupo: "Contratos", rotulo: "Contrato próximo do vencimento",
    descricao: "Contrato ativo que vence nos próximos dias.",
    titulos: ["Contrato próximo do vencimento"],
    variaveis: ["inquilino", "prazo", "data"],
    mensagemPadrao: "O contrato de {{inquilino}} vence {{prazo}} ({{data}}).",
  },
  {
    chave: "CONTRATO_NOVO", grupo: "Contratos", rotulo: "Novo contrato criado",
    descricao: "Quando um contrato é cadastrado.",
    titulos: ["Novo contrato criado"],
    variaveis: ["inquilino", "kitnet"],
    mensagemPadrao: "Contrato de {{inquilino}} na kitnet {{kitnet}} foi criado.",
  },
  {
    chave: "CONTRATO_ENCERRADO", grupo: "Contratos", rotulo: "Contrato encerrado",
    descricao: "Quando um contrato é encerrado.",
    titulos: ["Contrato encerrado"],
    variaveis: ["contrato"],
    mensagemPadrao: "Contrato {{contrato}} foi encerrado.",
  },
  {
    chave: "CONTRATO_ASSINATURA", grupo: "Contratos", rotulo: "Assinatura digital (Clicksign)",
    descricao: "Contrato enviado, assinado ou cancelado na Clicksign -- as 3 situações usam a mesma mensagem personalizada, se você definir uma.",
    titulos: ["Contrato enviado para assinatura", "Contrato assinado", "Contrato cancelado na Clicksign"],
    variaveis: ["inquilino", "situacao"],
    mensagemPadrao: "Contrato de {{inquilino}}: {{situacao}}.",
  },

  {
    chave: "COBRANCA_PAGA", grupo: "Financeiro", rotulo: "Cobrança paga",
    descricao: "Pagamento confirmado (Asaas, Banco do Brasil, EFI ou BRB).",
    titulos: ["Cobrança paga"],
    variaveis: ["descricao", "inquilino", "valor", "banco"],
    mensagemPadrao: "{{descricao}} ({{inquilino}}) -- R$ {{valor}} foi confirmado como pago no {{banco}}.",
  },
  {
    chave: "COBRANCA_ATRASADA", grupo: "Financeiro", rotulo: "Cobrança atrasada",
    descricao: "Cobrança que venceu sem pagamento.",
    titulos: ["Cobrança atrasada"],
    variaveis: ["descricao", "inquilino", "valor"],
    mensagemPadrao: "{{descricao}} ({{inquilino}}) -- R$ {{valor}} venceu e ainda não foi pago.",
  },

  {
    chave: "SOLICITACAO_NOVA", grupo: "Solicitações", rotulo: "Nova solicitação",
    descricao: "Quando alguém abre uma solicitação.",
    titulos: ["Nova solicitação"],
    variaveis: ["autor", "titulo", "numero"],
    mensagemPadrao: "🛠️ {{autor}} abriu a solicitação \"{{titulo}}\" ({{numero}}). Dá uma olhada quando puder!",
  },
  {
    chave: "SOLICITACAO_ATUALIZADA", grupo: "Solicitações", rotulo: "Solicitação classificada ou respondida",
    descricao: "Classificação e novas respostas nas solicitações -- as 2 situações usam a mesma mensagem personalizada, se você definir uma.",
    titulos: ["Solicitação classificada", "Nova resposta em solicitação"],
    variaveis: ["autor", "referencia", "situacao"],
    mensagemPadrao: "{{autor}}: {{situacao}} em {{referencia}}.",
  },
  {
    chave: "SOLICITACAO_PRAZO", grupo: "Solicitações", rotulo: "Solicitação com prazo vencido",
    descricao: "Solicitação que passou do prazo sem ser atendida.",
    titulos: ["Solicitação com prazo vencido"],
    variaveis: ["titulo", "numero", "dias"],
    mensagemPadrao: "⏰ Ei, a solicitação \"{{titulo}}\" ({{numero}}) está esperando há {{dias}} dia(s) além do prazo. Vamos dar aquela resolvida?",
  },

  {
    chave: "CHAMADO", grupo: "Suporte", rotulo: "Chamados de suporte",
    descricao: "Novo chamado e respostas no suporte técnico -- as situações usam a mesma mensagem personalizada, se você definir uma.",
    titulos: ["Novo chamado de suporte", "Chamado atualizado", "Nova resposta em chamado"],
    variaveis: ["autor", "titulo", "numero", "situacao"],
    mensagemPadrao: "{{autor}}: {{situacao}} ({{titulo}} -- {{numero}}).",
  },

  // Sem variaveis/mensagemPadrao de propósito -- a "mensagem" aqui É o
  // texto literal recebido no WhatsApp, não dá pra padronizar com
  // placeholder.
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
