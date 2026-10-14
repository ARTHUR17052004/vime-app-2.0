// Catálogo dos relatórios que podem aparecer na tela Relatórios. O
// administrador escolhe quais ficam disponíveis em Administração >
// Relatórios (ver relatorioConfigService.js) -- mesmo espírito do
// catálogo de notificações (tiposNotificacao.js). A geração em si (quais
// colunas, de onde vêm os dados) mora no frontend, em
// config/catalogoRelatorios.js -- aqui é só o que liga/desliga o card.
//
// Sem linha na tabela RelatorioConfig, o relatório continua disponível
// (comportamento de sempre): só muda depois que o admin desliga.

const TIPOS = [
  { chave: "RESUMO_GERAL", grupo: "Geral", rotulo: "Resumo Geral do Sistema", descricao: "Total de registros de cada módulo." },

  { chave: "RESIDENCIAS", grupo: "Imóveis", rotulo: "Residências", descricao: "Lista de residências cadastradas, com cidade, locador e quantidade de kitnets." },
  { chave: "KITNETS", grupo: "Imóveis", rotulo: "Kitnets", descricao: "Lista de kitnets com status (ocupada/disponível) e residência." },
  { chave: "OCUPACAO", grupo: "Imóveis", rotulo: "Ocupação por Residência", descricao: "Quantas kitnets estão ocupadas e vazias em cada residência." },

  { chave: "LOCADORES", grupo: "Pessoas", rotulo: "Locadores", descricao: "Lista de locadores com contato e dados bancários." },
  { chave: "INQUILINOS", grupo: "Pessoas", rotulo: "Inquilinos", descricao: "Lista de inquilinos, ativos e inativos, com a kitnet de cada um." },

  { chave: "CONTRATOS", grupo: "Operação", rotulo: "Contratos", descricao: "Lista de contratos com valor, vigência e status." },
  { chave: "CONTRATOS_VENCENDO", grupo: "Operação", rotulo: "Contratos a Vencer", descricao: "Contratos ativos que vencem nos próximos 30 dias." },
  { chave: "SOLICITACOES", grupo: "Operação", rotulo: "Solicitações", descricao: "Lista de solicitações com status, prazo e responsável." },
  { chave: "VISTORIAS", grupo: "Operação", rotulo: "Vistorias", descricao: "Lista de vistorias com status e próxima data." },
  { chave: "VISTORIAS_ATRASADAS", grupo: "Operação", rotulo: "Vistorias Atrasadas", descricao: "Vistorias que passaram da data sem ser realizadas." },

  { chave: "RECEITAS_DESPESAS", grupo: "Financeiro", rotulo: "Receitas x Despesas", descricao: "Lançamentos de receitas e despesas, com valor e status." },
  { chave: "INADIMPLENCIA", grupo: "Financeiro", rotulo: "Inadimplência", descricao: "Recebimentos vencidos sem pagamento registrado." },
];

module.exports = { TIPOS };
