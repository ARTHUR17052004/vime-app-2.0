import { UnidadeService } from "@/services/unidades.service";
import { KitnetService } from "@/services/kitnets.service";
import { LocadorService } from "@/services/locadores.service";
import { InquilinoService } from "@/services/inquilinos.service";
import { ContratoService } from "@/services/contratos.service";
import { SolicitacaoService } from "@/services/solicitacao.service";
import { VistoriaService } from "@/services/vistoria.service";
import { ReceitaService, DespesaService } from "@/services/financeiro.service";

import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { formatStatus } from "@/utils/formatStatus";

// Catálogo dos relatórios de verdade (dados + colunas) -- o que fica ou
// não disponível pro usuário é escolhido em Administração > Relatórios
// (ver backend/src/utils/tiposRelatorio.js; as CHAVES aqui têm que ser
// EXATAMENTE as mesmas de lá). A geração roda aqui no navegador porque a
// exportação (jsPDF/xlsx, ver utils/exportar.js) já é 100% client-side --
// os dados em si vêm dos mesmos endpoints que cada módulo já usa, então
// o escopo por locador e as permissões continuam valendo normalmente.

function paraLista(resposta) {
  return Array.isArray(resposta) ? resposta : resposta?.data || [];
}

const nomeKitnet = (kitnet) =>
  kitnet ? (kitnet.nome || `Kitnet ${kitnet.numero}`) : "-";

const localDe = (unidade, kitnet) => {
  const partes = [];
  if (unidade?.nome) partes.push(unidade.nome);
  if (kitnet) partes.push(nomeKitnet(kitnet));
  return partes.join(" - ") || "-";
};

export const CATALOGO_RELATORIOS = [

  {
    chave: "RESUMO_GERAL",
    titulo: "Resumo Geral do Sistema",
    async gerar() {
      const [unidades, kitnets, locadores, inquilinos, contratos, solicitacoes, vistorias, receitas, despesas] =
        await Promise.all([
          UnidadeService.listar().then(paraLista).catch(() => []),
          KitnetService.listar().then(paraLista).catch(() => []),
          LocadorService.listar().then(paraLista).catch(() => []),
          InquilinoService.listar().then(paraLista).catch(() => []),
          ContratoService.listar().then(paraLista).catch(() => []),
          SolicitacaoService.listar().then(paraLista).catch(() => []),
          VistoriaService.listar().then(paraLista).catch(() => []),
          ReceitaService.listar().then(paraLista).catch(() => []),
          DespesaService.listar().then(paraLista).catch(() => []),
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
  },

  {
    chave: "RESIDENCIAS",
    titulo: "Residências",
    async gerar() {
      const unidades = paraLista(await UnidadeService.listar());
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
  },

  {
    chave: "KITNETS",
    titulo: "Kitnets",
    async gerar() {
      const kitnets = paraLista(await KitnetService.listar());
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
  },

  {
    chave: "OCUPACAO",
    titulo: "Ocupação por Residência",
    async gerar() {
      const kitnets = paraLista(await KitnetService.listar());

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
  },

  {
    chave: "LOCADORES",
    titulo: "Locadores",
    async gerar() {
      const locadores = paraLista(await LocadorService.listar());
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
  },

  {
    chave: "INQUILINOS",
    titulo: "Inquilinos",
    async gerar() {
      const inquilinos = paraLista(await InquilinoService.listar());
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
  },

  {
    chave: "CONTRATOS",
    titulo: "Contratos",
    async gerar() {
      const contratos = paraLista(await ContratoService.listar());
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
  },

  {
    chave: "CONTRATOS_VENCENDO",
    titulo: "Contratos a Vencer (30 dias)",
    async gerar() {
      const contratos = paraLista(await ContratoService.listar());

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
  },

  {
    chave: "SOLICITACOES",
    titulo: "Solicitações",
    async gerar() {
      const solicitacoes = paraLista(await SolicitacaoService.listar());
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
  },

  {
    chave: "VISTORIAS",
    titulo: "Vistorias",
    async gerar() {
      const vistorias = paraLista(await VistoriaService.listar());
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
  },

  {
    chave: "VISTORIAS_ATRASADAS",
    titulo: "Vistorias Atrasadas",
    async gerar() {
      const vistorias = paraLista(await VistoriaService.listar());

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
  },

  {
    chave: "RECEITAS_DESPESAS",
    titulo: "Receitas x Despesas",
    async gerar() {
      const [receitas, despesas] = await Promise.all([
        ReceitaService.listar().then(paraLista).catch(() => []),
        DespesaService.listar().then(paraLista).catch(() => []),
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
  },

  {
    chave: "INADIMPLENCIA",
    titulo: "Inadimplência",
    async gerar() {
      const receitas = paraLista(await ReceitaService.listar());
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
  },

];

export function relatorioPorChave(chave) {
  return CATALOGO_RELATORIOS.find((r) => r.chave === chave);
}
