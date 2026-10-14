import { ContratoService } from "@/services/contratos.service";
import { SolicitacaoService } from "@/services/solicitacao.service";
import { VistoriaService } from "@/services/vistoria.service";
import { ReceitaService, DespesaService } from "@/services/financeiro.service";

import { dentroDoPeriodo } from "@/utils/periodos";

// Métricas disponíveis no Comparativo de Relatórios (ver
// RelatorioComparativo.jsx). Cada uma soma/conta os registros de um
// período e devolve linhas { rotulo, valor, formato } -- "formato" diz
// pro componente se mostra como moeda ou número puro. Reusa os mesmos
// endpoints que cada módulo já usa (mesmo escopo por locador de sempre).

function paraLista(resposta) {
  return Array.isArray(resposta) ? resposta : resposta?.data || [];
}

const somar = (lista, campo) =>
  lista.reduce((total, item) => total + Number(item[campo] || 0), 0);

export const CATALOGO_COMPARATIVOS = [

  {
    chave: "FINANCEIRO",
    rotulo: "Financeiro (Receitas x Despesas)",
    async calcular(inicio, fim) {

      const [receitas, despesas] = await Promise.all([
        ReceitaService.listar().then(paraLista).catch(() => []),
        DespesaService.listar().then(paraLista).catch(() => []),
      ]);

      const receitasPeriodo = receitas.filter((r) => dentroDoPeriodo(r.vencimento, inicio, fim));
      const despesasPeriodo = despesas.filter((d) => dentroDoPeriodo(d.vencimento, inicio, fim));

      const pagas = receitasPeriodo.filter((r) => r.status === "PAGO" || r.status === "PAGA");

      const totalLancado = somar(receitasPeriodo, "valor");
      const totalPago = somar(pagas, "valor");
      const totalDespesas = somar(despesasPeriodo, "valor");

      return [
        { rotulo: "Receitas lançadas", valor: totalLancado, formato: "moeda" },
        { rotulo: "Receitas recebidas", valor: totalPago, formato: "moeda" },
        { rotulo: "Despesas", valor: totalDespesas, formato: "moeda" },
        { rotulo: "Saldo (recebido - despesas)", valor: totalPago - totalDespesas, formato: "moeda" },
      ];

    },
  },

  {
    chave: "INADIMPLENCIA",
    rotulo: "Inadimplência",
    async calcular(inicio, fim) {

      const receitas = paraLista(await ReceitaService.listar());

      const atrasadasNoPeriodo = receitas.filter(
        (r) => r.status === "ATRASADA" && dentroDoPeriodo(r.vencimento, inicio, fim)
      );

      return [
        { rotulo: "Recebimentos em atraso", valor: atrasadasNoPeriodo.length, formato: "numero" },
        { rotulo: "Total em aberto", valor: somar(atrasadasNoPeriodo, "valor"), formato: "moeda" },
      ];

    },
  },

  {
    chave: "CONTRATOS_NOVOS",
    rotulo: "Contratos Novos",
    async calcular(inicio, fim) {

      const contratos = paraLista(await ContratoService.listar());
      const novos = contratos.filter((c) => dentroDoPeriodo(c.dataInicio, inicio, fim));

      return [
        { rotulo: "Contratos novos", valor: novos.length, formato: "numero" },
        { rotulo: "Valor total de aluguel", valor: somar(novos, "valorAluguel"), formato: "moeda" },
      ];

    },
  },

  {
    chave: "SOLICITACOES",
    rotulo: "Solicitações",
    async calcular(inicio, fim) {

      const solicitacoes = paraLista(await SolicitacaoService.listar());

      const abertas = solicitacoes.filter((s) => dentroDoPeriodo(s.createdAt, inicio, fim));
      const atendidas = solicitacoes.filter(
        (s) => s.status === "ATENDIDA" && dentroDoPeriodo(s.updatedAt, inicio, fim)
      );

      return [
        { rotulo: "Solicitações abertas", valor: abertas.length, formato: "numero" },
        { rotulo: "Solicitações atendidas", valor: atendidas.length, formato: "numero" },
      ];

    },
  },

  {
    chave: "VISTORIAS",
    rotulo: "Vistorias",
    async calcular(inicio, fim) {

      const vistorias = paraLista(await VistoriaService.listar());

      const criadas = vistorias.filter((v) => dentroDoPeriodo(v.createdAt, inicio, fim));
      const realizadas = vistorias.filter(
        (v) => v.status === "REALIZADA" && dentroDoPeriodo(v.concluidaEm, inicio, fim)
      );

      return [
        { rotulo: "Vistorias criadas", valor: criadas.length, formato: "numero" },
        { rotulo: "Vistorias realizadas", valor: realizadas.length, formato: "numero" },
      ];

    },
  },

];

export function comparativoPorChave(chave) {
  return CATALOGO_COMPARATIVOS.find((c) => c.chave === chave);
}
