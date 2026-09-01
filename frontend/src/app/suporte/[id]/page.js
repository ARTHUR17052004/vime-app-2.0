"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import MainLayout from "../../components/layout/MainLayout";
import SemPermissao from "../../components/ui/SemPermissao";
import Badge from "../../components/ui/Badge";

import { ChamadoService } from "@/services/chamado.service";
import ChamadoChat from "../../components/suporte/ChamadoChat";
import { usePermissao } from "../../../hooks/usePermissao";

const STATUS_ROTULO = {
  ABERTO: "Aberto",
  EM_ANDAMENTO: "Em Andamento",
  RESOLVIDO: "Resolvido",
  FECHADO: "Fechado",
};

export default function DetalhesChamadoPage() {

  const params = useParams();
  const router = useRouter();

  const podeVisualizar = usePermissao("suporte.visualizar");

  const [chamado, setChamado] =
    useState(null);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");

  useEffect(() => {

    async function carregar() {

      try {

        setCarregando(true);

        const resposta = await ChamadoService.buscar(params.id);

        setChamado(resposta.data || resposta);

      } catch (err) {

        console.error("Erro ao carregar chamado:", err);

        setErro(
          err.message ||
          "Erro ao carregar chamado."
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

  if (erro || !chamado) {

    return (

      <MainLayout>

        <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-10">

          <h1 className="text-3xl font-bold text-[var(--text)]">
            Chamado não encontrado
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

        <button
          onClick={() => router.push("/suporte")}
          className="
            flex
            items-center
            gap-2
            text-[var(--text-subtle)]
            hover:text-[var(--text)]
            transition
          "
        >
          <ArrowLeft size={18} />
          Voltar para Suporte
        </button>

        <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-10">

          <div className="flex items-start justify-between gap-6 flex-wrap">

            <div>

              <p className="text-[var(--text-faint)] text-sm uppercase tracking-wide">
                {chamado.numero}
              </p>

              <h1 className="text-4xl font-bold text-[var(--text)] mt-1">
                {chamado.titulo}
              </h1>

            </div>

            <Badge variant={chamado.status === "RESOLVIDO" ? "emerald" : "blue"} size="lg">
              {STATUS_ROTULO[chamado.status] || chamado.status}
            </Badge>

          </div>

        </div>

        <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-8">

          <h2 className="text-2xl font-bold text-[var(--text)] mb-6">
            Dados Gerais
          </h2>

          <div className="grid md:grid-cols-4 gap-6">

            <div>
              <p className="text-[var(--text-subtle)]">Categoria</p>
              <h3 className="font-semibold text-[var(--text)]">
                {chamado.categoria || "-"}
              </h3>
            </div>

            <div>
              <p className="text-[var(--text-subtle)]">Criticidade</p>
              <h3 className="font-semibold text-[var(--text)]">
                {chamado.criticidade || "-"}
              </h3>
            </div>

            <div>
              <p className="text-[var(--text-subtle)]">Aberto por</p>
              <h3 className="font-semibold text-[var(--text)]">
                {chamado.criadoPorNome || "-"}
              </h3>
              {chamado.criadoPorPerfil && (
                <p className="text-[var(--text-faint)] text-sm mt-0.5">
                  {chamado.criadoPorPerfil}
                </p>
              )}
            </div>

            <div>
              <p className="text-[var(--text-subtle)]">Aberto em</p>
              <h3 className="font-semibold text-[var(--text)]">
                {new Date(chamado.createdAt).toLocaleString("pt-BR")}
              </h3>
            </div>

          </div>

        </div>

        <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-8">

          <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
            Descrição
          </h2>

          <div className="bg-[var(--surface-2)] rounded-2xl p-6 text-[var(--text-1)] whitespace-pre-wrap">
            {chamado.descricao || "Nenhuma descrição cadastrada."}
          </div>

        </div>

        <ChamadoChat
          chamadoId={chamado.id}
          statusAtual={chamado.status}
          onStatusAlterado={(novoStatus) =>
            setChamado((prev) => ({
              ...prev,
              status: novoStatus,
            }))
          }
        />

      </div>

    </MainLayout>

  );

}
