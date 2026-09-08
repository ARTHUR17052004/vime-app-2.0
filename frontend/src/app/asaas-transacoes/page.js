/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useEffect, useMemo, useState } from "react";

import MainLayout from "../components/layout/MainLayout";

import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";
import FadeIn from "../components/ui/FadeIn";
import PageHeader from "../components/ui/PageHeader";
import PageSection from "../components/ui/PageSection";
import Button from "../components/ui/Button";

import AsaasResumoCards from "../components/asaas-transacoes/AsaasResumoCards";
import AsaasFiltros from "../components/asaas-transacoes/AsaasFiltros";
import AsaasTabela from "../components/asaas-transacoes/AsaasTabela";
import AsaasExportar from "../components/asaas-transacoes/AsaasExportar";
import AsaasDetalhesModal from "../components/asaas-transacoes/AsaasDetalhesModal";
import AsaasEditarModal from "../components/asaas-transacoes/AsaasEditarModal";
import AsaasNovaCobrancaModal from "../components/asaas-transacoes/AsaasNovaCobrancaModal";
import SemPermissao from "../components/ui/SemPermissao";

import { AsaasService } from "@/services/asaas.service";
import { ReceitaService } from "@/services/financeiro.service";
import { LocadorService } from "@/services/locadores.service";
import { usePermissao } from "../../hooks/usePermissao";

const STATUS_ROTULO_PARA_VALOR = {
  Recebido: "PAGA",
  Pendente: "PENDENTE",
  Atrasado: "ATRASADA",
  Cancelado: "CANCELADA",
};

export default function AsaasTransacoesPage() {

  const podeVisualizar = usePermissao("asaasTransacoes.visualizar");
  const podeCriar = usePermissao("asaasTransacoes.criar");
  const podeEditar = usePermissao("asaasTransacoes.editar");
  const podeEnviar = usePermissao("asaasTransacoes.enviar");
  const podeExportar = usePermissao("asaasTransacoes.exportar");

  const [transacoes, setTransacoes] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [filtros, setFiltros] =
    useState(null);

  const [enviandoId, setEnviandoId] =
    useState(null);

  const [transacaoSelecionada, setTransacaoSelecionada] =
    useState(null);

  const [detalhesOpen, setDetalhesOpen] =
    useState(false);

  const [novaCobrancaOpen, setNovaCobrancaOpen] =
    useState(false);

  const [editarOpen, setEditarOpen] =
    useState(false);

  const [salvandoEdicao, setSalvandoEdicao] =
    useState(false);

  const [selecionados, setSelecionados] =
    useState(new Set());

  const [enviandoLote, setEnviandoLote] =
    useState(false);

  const [locadores, setLocadores] =
    useState([]);

  const [locadorFiltro, setLocadorFiltro] =
    useState("");

  useEffect(() => {

    LocadorService.listar()
      .then((resposta) => {
        const lista = Array.isArray(resposta) ? resposta : resposta.data || [];
        setLocadores(lista);
      })
      .catch((err) => console.error("Erro ao carregar locadores:", err));

  }, []);

  async function carregarTransacoes() {

    try {

      setLoading(true);

      const resposta = await AsaasService.listarTransacoes();

      const lista = Array.isArray(resposta)
        ? resposta
        : resposta.data || [];

      setTransacoes(lista);

    } catch (error) {

      console.error("Erro ao carregar transações Asaas:", error);

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    carregarTransacoes();

  }, []);

  async function enviarCobranca(transacao) {

    try {

      setEnviandoId(transacao.id);

      const resposta = await AsaasService.enviarCobranca(transacao.id);

      // Confirma explicitamente qual banco recebeu -- a mensagem já
      // vem do backend nomeando o banco certo (ver
      // gatewayPagamentoService.js), então não tem chance de mostrar
      // um banco errado por engano aqui na tela.
      alert(resposta.message || "Cobrança enviada com sucesso.");

      await carregarTransacoes();

    } catch (error) {

      console.error("Erro ao enviar cobrança:", error);

      alert(error.message || "Erro ao enviar cobrança.");

    } finally {

      setEnviandoId(null);

    }

  }

  function alternarSelecionado(id) {

    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) {
        novo.delete(id);
      } else {
        novo.add(id);
      }
      return novo;
    });

  }

  function alternarTodos(ids) {

    setSelecionados((atual) => {
      const todosJaSelecionados = ids.every((id) => atual.has(id));
      return todosJaSelecionados ? new Set() : new Set(ids);
    });

  }

  async function enviarSelecionados() {

    setEnviandoLote(true);

    let sucesso = 0;
    let falha = 0;
    // Conta quantas foram pra cada banco, pra confirmar no resumo
    // final -- mesma lógica de segurança do envio individual.
    const porBanco = {};

    for (const id of selecionados) {

      try {

        const resposta = await AsaasService.enviarCobranca(id);

        if (resposta.success === false) {
          falha++;
          continue;
        }

        sucesso++;

        const banco = resposta.data?.gatewayProvider === "BB" ? "Banco do Brasil" : "Asaas";
        porBanco[banco] = (porBanco[banco] || 0) + 1;

      } catch (error) {
        console.error(`Erro ao enviar cobrança ${id}:`, error);
        falha++;
      }

    }

    setSelecionados(new Set());
    setEnviandoLote(false);

    await carregarTransacoes();

    const resumoBancos = Object.entries(porBanco)
      .map(([banco, qtd]) => `${qtd} pro ${banco}`)
      .join(", ");

    alert(
      falha > 0
        ? `${sucesso} cobrança(s) enviada(s)${resumoBancos ? ` (${resumoBancos})` : ""}. ${falha} falharam (confira o status delas na lista).`
        : `${sucesso} cobrança(s) enviada(s) com sucesso${resumoBancos ? ` -- ${resumoBancos}` : ""}.`
    );

  }

  function abrirDetalhes(transacao) {

    setTransacaoSelecionada(transacao);
    setDetalhesOpen(true);

  }

  function abrirEdicao(transacao) {

    setTransacaoSelecionada(transacao);
    setEditarOpen(true);

  }

  async function salvarEdicao(id, dados) {

    try {

      setSalvandoEdicao(true);

      await ReceitaService.atualizar(id, dados);

      setEditarOpen(false);

      await carregarTransacoes();

    } catch (error) {

      console.error("Erro ao editar cobrança:", error);

      alert(error.message || "Erro ao salvar a cobrança.");

    } finally {

      setSalvandoEdicao(false);

    }

  }

  const transacoesFiltradas = useMemo(() => {

    const porLocador = locadorFiltro
      ? transacoes.filter((item) => item.locadorId === locadorFiltro)
      : transacoes;

    if (!filtros) return porLocador;

    return porLocador.filter((item) => {

      const termo = filtros.busca?.toLowerCase().trim();

      if (termo) {

        const alvo = `${item.cliente || ""}`.toLowerCase();

        if (!alvo.includes(termo)) return false;

      }

      if (filtros.status && filtros.status !== "Todos") {

        const statusEsperado =
          STATUS_ROTULO_PARA_VALOR[filtros.status];

        if (item.status !== statusEsperado) return false;

      }

      if (filtros.forma && filtros.forma !== "Todas") {

        if (
          (item.formaPagamento || "").toLowerCase() !==
          filtros.forma.toLowerCase()
        )
          return false;

      }

      if (filtros.periodo) {

        if (!item.vencimento) return false;

        const vencimento = new Date(item.vencimento)
          .toISOString()
          .slice(0, 10);

        if (vencimento > filtros.periodo) return false;

      }

      return true;

    });

  }, [transacoes, filtros, locadorFiltro]);

  if (!podeVisualizar) {
    return <SemPermissao />;
  }

  return (

  <MainLayout>

    <Page>

      <PageContainer>

        <FadeIn>

          <PageHeader
            title="Transações"
            subtitle="Gerencie cobranças, recebimentos e sincronizações de qualquer banco."
            count={transacoesFiltradas.length}
            countLabel="cobrança(s)"
            actions={
              podeCriar && (
                <Button onClick={() => setNovaCobrancaOpen(true)}>
                  Nova Cobrança
                </Button>
              )
            }
          />

        </FadeIn>

        <FadeIn delay={0.08}>

          <PageSection spacing="lg">

            <div className="bg-[var(--surface)] backdrop-blur-[24px] rounded-2xl border border-[var(--border-token)] p-5 flex items-center gap-4 flex-wrap">

              <label className="text-sm font-semibold text-[var(--text-1)]">
                Selecione o locador
              </label>

              <select
                value={locadorFiltro}
                onChange={(e) => setLocadorFiltro(e.target.value)}
                className="border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-lg p-2 min-w-[220px]"
              >
                <option value="" className="bg-[#1b2430]">Todos os locadores</option>
                {locadores.map((locador) => (
                  <option key={locador.id} value={locador.id} className="bg-[#1b2430]">
                    {locador.nome}
                  </option>
                ))}
              </select>

            </div>

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.10}>

          <PageSection spacing="xl">

            <AsaasResumoCards transacoes={transacoesFiltradas} />

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.20}>

          <PageSection spacing="lg">

            <AsaasFiltros
              onFiltrar={setFiltros}
              onLimpar={() => setFiltros(null)}
            />

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.30}>

          <PageSection spacing="xxl">

            <AsaasTabela
              transacoes={transacoesFiltradas}
              loading={loading}
              onVisualizar={abrirDetalhes}
              onDetalhes={abrirDetalhes}
              onEditar={abrirEdicao}
              onEnviar={enviarCobranca}
              enviandoId={enviandoId}
              selecionados={selecionados}
              onAlternarSelecionado={alternarSelecionado}
              onAlternarTodos={alternarTodos}
              onEnviarSelecionados={enviarSelecionados}
              enviandoLote={enviandoLote}
              podeEditar={podeEditar}
              podeEnviar={podeEnviar}
            />

          </PageSection>

        </FadeIn>

        {podeExportar && (

          <FadeIn delay={0.40}>

            <PageSection spacing="xxl">

              <AsaasExportar transacoes={transacoesFiltradas} />

            </PageSection>

          </FadeIn>

        )}

        <AsaasDetalhesModal
          open={detalhesOpen}
          onClose={() => setDetalhesOpen(false)}
          transacao={transacaoSelecionada}
        />

        <AsaasEditarModal
          open={editarOpen}
          onClose={() => setEditarOpen(false)}
          transacaoOriginal={transacaoSelecionada}
          onSave={salvarEdicao}
          salvando={salvandoEdicao}
        />

        <AsaasNovaCobrancaModal
          open={novaCobrancaOpen}
          onClose={() => setNovaCobrancaOpen(false)}
          onCriada={() => {

            setNovaCobrancaOpen(false);

            carregarTransacoes();

          }}
        />

      </PageContainer>

    </Page>

  </MainLayout>

);
}
