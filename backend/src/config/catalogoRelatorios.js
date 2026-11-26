const { TIPOS } = require("../utils/tiposRelatorio");

const unidadeService = require("../services/unidadeService");
const kitnetService = require("../services/kitnetService");
const locadorService = require("../services/locadorService");
const inquilinoService = require("../services/inquilinoService");
const contratoService = require("../services/contratoService");
const solicitacaoService = require("../services/solicitacaoService");
const vistoriaService = require("../services/vistoriaService");
const receitaService = require("../services/receitaService");
const despesaService = require("../services/despesaService");

// Mesmo catálogo que o navegador monta em
// frontend/src/config/catalogoRelatorios.js (mesmas CHAVES, colunas e
// transformações) -- essa cópia roda sem ninguém logado, pro envio
// agendado (ver relatorioEnvioService.js/enviarRelatoriosAgendadosJob.js).
// Por isso busca os dados direto pelos services com usuario=null: mesmo
// efeito de um admin sem locadorId (ver utils/escopoLocador.js -- enxerga
// todos os locadores), que é o escopo certo pra um envio agendado pelo
// administrador do sistema.
const formatCurrency = (valor) => {
  if (valor === null || valor === undefined) return "R$ 0,00";
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const formatDate = (data) => (data ? new Date(data).toLocaleDateString("pt-BR") : "-");

const formatStatus = (status) =>
  !status ? "-" : status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());

const nomeKitnet = (kitnet) => (kitnet ? kitnet.nome || `Kitnet ${kitnet.numero}` : "-");

const localDe = (unidade, kitnet) => {
  const partes = [];
  if (unidade?.nome) partes.push(unidade.nome);
  if (kitnet) partes.push(nomeKitnet(kitnet));
  return partes.join(" - ") || "-";
};

const GERAR_POR_CHAVE = {

  RESUMO_GERAL: async () => {
    const [unidades, kitnets, locadores, inquilinos, contratos, solicitacoes, vistorias, receitas, despesas] =
      await Promise.all([
        unidadeService.listar(null),
        kitnetService.listar(null),
        locadorService.listar(null),
        inquilinoService.listar(null),
        contratoService.listar(null),
        solicitacaoService.listar(null),
        vistoriaService.listar(null),
        receitaService.listar(null),
        despesaService.listar(null),
      ]);
    return {
      colunas: ["Módulo", "Total de Registros"],
      linhas: [
        ["Residências", unidades.length],
        ["Kitnets", kitnets.length],
        ["Locadores", locadores.length],
        ["Inquilinos", inquilinos.length],
        ["Contratos", contratos.length],
        ["Solicitações", solicitacoes.length],
        ["Vistorias", vistorias.length],
        ["Receitas", receitas.length],
        ["Despesas", despesas.length],
      ],
    };
  },

  RESIDENCIAS: async () => {
    const unidades = await unidadeService.listar(null);
    return {
      colunas: ["Nome", "Cidade/UF", "Locador", "Kitnets", "Status"],
      linhas: unidades.map((u) => [
        u.nome,
        `${u.cidade || "-"}/${u.uf || "-"}`,
        u.locadorRel?.nome || u.locador || "-",
        u.kitnets ?? 0,
        formatStatus(u.status),
      ]),
    };
  },

  KITNETS: async () => {
    const kitnets = await kitnetService.listar(null);
    return {
      colunas: ["Kitnet", "Residência", "Status", "Aluguel"],
      linhas: kitnets.map((k) => [
        nomeKitnet(k),
        k.unidade?.nome || "-",
        k.ocupada ? "Ocupada" : formatStatus(k.status),
        formatCurrency(k.aluguel),
      ]),
    };
  },

  OCUPACAO: async () => {
    const kitnets = await kitnetService.listar(null);

    const porUnidade = new Map();
    kitnets.forEach((k) => {
      const nome = k.unidade?.nome || "Sem residência";
      const atual = porUnidade.get(nome) || { total: 0, ocupadas: 0 };
      atual.total += 1;
      if (k.ocupada) atual.ocupadas += 1;
      porUnidade.set(nome, atual);
    });

    return {
      colunas: ["Residência", "Total de Kitnets", "Ocupadas", "Vazias", "Ocupação"],
      linhas: Array.from(porUnidade.entries()).map(([nome, dados]) => [
        nome,
        dados.total,
        dados.ocupadas,
        dados.total - dados.ocupadas,
        dados.total > 0 ? `${Math.round((dados.ocupadas / dados.total) * 100)}%` : "-",
      ]),
    };
  },

  LOCADORES: async () => {
    const locadores = await locadorService.listar(null);
    return {
      colunas: ["Nome", "CPF/CNPJ", "Email", "Telefone", "Banco", "Pix"],
      linhas: locadores.map((l) => [
        l.nome,
        l.cpfCnpj || "-",
        l.email || "-",
        l.telefone || "-",
        l.banco || "-",
        l.pix || "-",
      ]),
    };
  },

  INQUILINOS: async () => {
    const inquilinos = await inquilinoService.listar(null);
    return {
      colunas: ["Nome", "Kitnet", "Status", "Email", "Telefone", "Início do Contrato"],
      linhas: inquilinos.map((i) => [
        i.nome,
        localDe(i.kitnet?.unidade, i.kitnet),
        i.ativo ? "Ativo" : "Inativo",
        i.email || "-",
        i.telefone || "-",
        formatDate(i.dataInicioContrato),
      ]),
    };
  },

  CONTRATOS: async () => {
    const contratos = await contratoService.listar(null);
    return {
      colunas: ["Inquilino", "Kitnet", "Valor", "Início", "Fim", "Status"],
      linhas: contratos.map((c) => [
        c.inquilino?.nome || "-",
        localDe(c.unidade, c.kitnet),
        formatCurrency(c.valorAluguel),
        formatDate(c.dataInicio),
        formatDate(c.dataFim),
        formatStatus(c.status),
      ]),
    };
  },

  CONTRATOS_VENCENDO: async () => {
    const contratos = await contratoService.listar(null);

    const hoje = new Date();
    const limite = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);

    const vencendo = contratos.filter((c) => {
      if (c.status !== "ATIVO" || !c.dataFim) return false;
      const fim = new Date(c.dataFim);
      return fim >= hoje && fim <= limite;
    });

    return {
      colunas: ["Inquilino", "Kitnet", "Valor", "Vencimento"],
      linhas: vencendo.map((c) => [
        c.inquilino?.nome || "-",
        localDe(c.unidade, c.kitnet),
        formatCurrency(c.valorAluguel),
        formatDate(c.dataFim),
      ]),
    };
  },

  SOLICITACOES: async () => {
    const solicitacoes = await solicitacaoService.listar(null);
    return {
      colunas: ["Número", "Título", "Status", "Prazo", "Responsável"],
      linhas: solicitacoes.map((s) => [
        s.numero,
        s.titulo,
        formatStatus(s.status),
        formatDate(s.prazo),
        s.responsavel || "-",
      ]),
    };
  },

  VISTORIAS: async () => {
    const vistorias = await vistoriaService.listar(null);
    return {
      colunas: ["Título", "Local", "Status", "Próxima Vistoria"],
      linhas: vistorias.map((v) => [
        v.titulo,
        localDe(v.unidade, v.kitnet),
        formatStatus(v.status),
        formatDate(v.dataProxima),
      ]),
    };
  },

  VISTORIAS_ATRASADAS: async () => {
    const vistorias = await vistoriaService.listar(null);

    const hoje = new Date();
    const atrasadas = vistorias.filter((v) =>
      !["REALIZADA", "CANCELADA"].includes(v.status) &&
      v.dataProxima &&
      new Date(v.dataProxima) < hoje
    );

    return {
      colunas: ["Título", "Local", "Status", "Venceu em"],
      linhas: atrasadas.map((v) => [
        v.titulo,
        localDe(v.unidade, v.kitnet),
        formatStatus(v.status),
        formatDate(v.dataProxima),
      ]),
    };
  },

  RECEITAS_DESPESAS: async () => {
    const [receitas, despesas] = await Promise.all([
      receitaService.listar(null),
      despesaService.listar(null),
    ]);

    const linhasReceitas = receitas.map((r) => [
      "Receita",
      r.contrato?.inquilino?.nome || r.inquilino?.nome || r.descricao,
      r.categoria,
      formatCurrency(r.valor),
      formatDate(r.vencimento),
      formatStatus(r.status),
    ]);

    const linhasDespesas = despesas.map((d) => [
      "Despesa",
      d.descricao,
      d.categoria,
      formatCurrency(d.valor),
      formatDate(d.vencimento),
      formatStatus(d.status),
    ]);

    return {
      colunas: ["Tipo", "Descrição", "Categoria", "Valor", "Vencimento", "Status"],
      linhas: [...linhasReceitas, ...linhasDespesas],
    };
  },

  INADIMPLENCIA: async () => {
    const receitas = await receitaService.listar(null);
    const atrasadas = receitas.filter((r) => r.status === "ATRASADA");

    return {
      colunas: ["Inquilino/Descrição", "Categoria", "Valor", "Vencimento"],
      linhas: atrasadas.map((r) => [
        r.contrato?.inquilino?.nome || r.inquilino?.nome || r.descricao,
        r.categoria,
        formatCurrency(r.valor),
        formatDate(r.vencimento),
      ]),
    };
  },

};

const gerarRelatorio = async (chave) => {

  const tipo = TIPOS.find((t) => t.chave === chave);
  const gerar = GERAR_POR_CHAVE[chave];

  if (!tipo || !gerar) {
    throw new Error(`Relatório "${chave}" não existe.`);
  }

  const { colunas, linhas } = await gerar();

  return { titulo: tipo.rotulo, colunas, linhas };

};

module.exports = { gerarRelatorio };
