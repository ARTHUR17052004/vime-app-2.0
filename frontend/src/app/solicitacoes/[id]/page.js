"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import MainLayout from "../../components/layout/MainLayout";
import SemPermissao from "../../components/ui/SemPermissao";

import { SolicitacaoService } from "@/services/solicitacao.service";
import { AuditoriaService } from "@/services/auditoria.service";
import SolicitacaoChat from "../../components/solicitacoes/SolicitacaoChat";
import { usePermissao } from "../../../hooks/usePermissao";

function formatarData(data) {
  return data ? new Date(data).toLocaleString("pt-BR") : "-";
}

const ACAO_LABEL = {
  CRIAR: "Solicitação criada",
  ATUALIZAR: "Solicitação atualizada",
  EXCLUIR: "Solicitação excluída",
};

export default function DetalhesSolicitacaoPage() {

  const params = useParams();

  const podeVisualizar = usePermissao("solicitacoes.visualizar");

  const [solicitacao, setSolicitacao] =
    useState(null);

  const [historico, setHistorico] =
    useState([]);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");

  useEffect(() => {

    async function carregar() {

      try {

        setCarregando(true);

        const [respostaSolicitacao, respostaAuditoria] = await Promise.all([
          SolicitacaoService.buscar(params.id),
          AuditoriaService.listar(),
        ]);

        const dadosSolicitacao =
          respostaSolicitacao.data || respostaSolicitacao;

        setSolicitacao(dadosSolicitacao);

        const listaAuditoria = Array.isArray(respostaAuditoria)
          ? respostaAuditoria
          : respostaAuditoria.data || [];

        setHistorico(
          listaAuditoria.filter(
            (item) =>
              item.modulo === "SOLICITACOES" &&
              item.registroId === params.id
          )
        );

      } catch (err) {

        console.error("Erro ao carregar solicitação:", err);

        setErro(
          err.message ||
          "Erro ao carregar solicitação."
        );

      } finally {

        setCarregando(false);

      }

    }

    carregar();

  }, [params.id]);

  if (!podeVisualizar) {
    return <SemPermissao />;
  }

  if (carregando) {

    return (

      <MainLayout>

        <div className="py-32 text-center text-[var(--text-subtle)]">
          Carregando...
        </div>

      </MainLayout>

    );

  }

  if (erro || !solicitacao) {

    return (

      <MainLayout>

        <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-10">

          <h1 className="text-3xl font-bold text-[var(--text)]">

            Solicitação não encontrada

          </h1>

          {erro && (
            <p className="text-red-400 mt-3">{erro}</p>
          )}

        </div>

      </MainLayout>

    );

  }

 return (

  <MainLayout>

    <div className="space-y-8">

      <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-10">

        <h1 className="text-4xl font-bold text-[var(--text)]">

          {solicitacao.titulo}

        </h1>

        <p className="text-[var(--text-subtle)] mt-2">

          Visualização completa da solicitação

        </p>

      </div>

      <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-8">

        <h2 className="text-2xl font-bold text-[var(--text)] mb-6">

          Dados Gerais

        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          <div>

            <p className="text-[var(--text-subtle)]">
              Número
            </p>

            <h3 className="font-semibold text-[var(--text)]">
              {solicitacao.numero}
            </h3>

          </div>

          <div>

            <p className="text-[var(--text-subtle)]">
              Status
            </p>

            <h3 className="font-semibold text-emerald-400">
              {solicitacao.status}
            </h3>

          </div>

          <div>

            <p className="text-[var(--text-subtle)]">
              Data de abertura
            </p>

            <h3 className="font-semibold text-[var(--text)]">
              {solicitacao.data
                ? new Date(solicitacao.data).toLocaleDateString("pt-BR")
                : "-"}
            </h3>

          </div>

          <div>

            <p className="text-[var(--text-subtle)]">
              Prazo
            </p>

            <h3 className="font-semibold text-[var(--text)]">
              {solicitacao.prazo
                ? new Date(solicitacao.prazo).toLocaleDateString("pt-BR")
                : "-"}
            </h3>

          </div>

          <div>

            <p className="text-[var(--text-subtle)]">
              Criado por
            </p>

            <h3 className="font-semibold text-[var(--text)]">
              {solicitacao.criadoPorNome || "-"}
            </h3>

            {solicitacao.criadoPorPerfil && (
              <p className="text-[var(--text-faint)] text-sm mt-0.5">
                Perfil: {solicitacao.criadoPorPerfil}
              </p>
            )}

          </div>

        </div>

      </div>

      <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-8">

        <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
          Descrição
        </h2>

        <div className="bg-[var(--surface-2)] rounded-2xl p-6 text-[var(--text-1)]">

          {solicitacao.descricao ||
            "Nenhuma descrição cadastrada."}

        </div>

      </div>

      <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-8">

        <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
          Observações
        </h2>

        <div className="bg-[var(--surface-2)] rounded-2xl p-6 text-[var(--text-1)]">

          {solicitacao.observacoes ||
            "Nenhuma observação cadastrada."}

        </div>

      </div>

      <SolicitacaoChat
        solicitacaoId={solicitacao.id}
        statusAtual={solicitacao.status}
        onStatusAlterado={(novoStatus) =>
          setSolicitacao((prev) => ({
            ...prev,
            status: novoStatus,
          }))
        }
      />

      <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-8">

        <h2 className="text-2xl font-bold text-[var(--text)] mb-6">
          Histórico
        </h2>

        <div className="space-y-4">

          {historico.length ? (

            historico.map((item) => (

              <div
                key={item.id}
                className="
                  border-l-4
                  border-green-700
                  bg-[var(--surface-2)]
                  rounded-r-2xl
                  p-5
                "
              >

                <div className="font-semibold text-[var(--text)]">
                  {ACAO_LABEL[item.acao] || item.acao}
                </div>

                <div className="text-sm text-[var(--text-subtle)] mt-2">
                  {formatarData(item.createdAt)}
                </div>

              </div>

            ))

          ) : (

            <div className="border border-[var(--border-token)] rounded-2xl p-5">

              <div className="text-[var(--text-muted)]">
                Nenhuma movimentação registrada.
              </div>

            </div>

          )}

        </div>

      </div>

    </div>

  </MainLayout>

);

}
