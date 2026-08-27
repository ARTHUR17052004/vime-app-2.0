/* eslint-disable @next/next/no-img-element */
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import MainLayout from "../../components/layout/MainLayout";
import SemPermissao from "../../components/ui/SemPermissao";

import { VistoriaService } from "@/services/vistoria.service";
import { AuditoriaService } from "@/services/auditoria.service";
import { formatDate, formatDateTime } from "@/utils/formatDate";
import { usePermissao } from "../../../hooks/usePermissao";

const ACAO_LABEL = {
  CRIAR: "Vistoria criada",
  ATUALIZAR: "Vistoria atualizada",
  EXCLUIR: "Vistoria excluída",
};

export default function DetalhesVistoriaPage() {

  const params = useParams();

  const podeVisualizar = usePermissao("vistorias.visualizar");

  const [vistoria, setVistoria] =
    useState(null);

  const [historico, setHistorico] =
    useState([]);

  const [carregando, setCarregando] =
    useState(true);

  useEffect(() => {

    async function carregar() {

      try {

        setCarregando(true);

        const [respostaVistoria, respostaAuditoria] = await Promise.all([
          VistoriaService.buscar(params.id),
          AuditoriaService.listar(),
        ]);

        setVistoria(respostaVistoria.data || respostaVistoria);

        const listaAuditoria = Array.isArray(respostaAuditoria)
          ? respostaAuditoria
          : respostaAuditoria.data || [];

        setHistorico(
          listaAuditoria.filter(
            (item) =>
              item.modulo === "VISTORIAS" &&
              item.registroId === params.id
          )
        );

      } catch (err) {

        console.error("Erro ao carregar vistoria:", err);

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

  if (!vistoria) {

    return (

      <MainLayout>

        <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-10">

          <h1 className="text-3xl font-bold text-[var(--text)]">
            Vistoria não encontrada
          </h1>

        </div>

      </MainLayout>

    );

  }

  return (

    <MainLayout>

      <div className="space-y-8">

        <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-10">

          <h1 className="text-4xl font-bold text-[var(--text)]">
            {vistoria.titulo}
          </h1>

          <p className="text-[var(--text-subtle)] mt-2">
            Informações completas da vistoria
          </p>

        </div>

        <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-8">

          <h2 className="text-2xl font-bold text-[var(--text)] mb-6">
            Dados da Vistoria
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            <div>
              <p className="text-[var(--text-subtle)]">Categoria</p>
              <h3 className="font-semibold text-[var(--text)]">
                {vistoria.categoria || "-"}
              </h3>
            </div>

            <div>
              <p className="text-[var(--text-subtle)]">Criticidade</p>
              <h3 className="font-semibold text-[var(--text)]">
                {vistoria.criticidade || "-"}
              </h3>
            </div>

            <div>
              <p className="text-[var(--text-subtle)]">Responsável</p>
              <h3 className="font-semibold text-[var(--text)]">
                {vistoria.responsavel || "-"}
              </h3>
            </div>

            <div>
              <p className="text-[var(--text-subtle)]">Periodicidade</p>
              <h3 className="font-semibold text-[var(--text)]">
                {vistoria.periodicidade || "-"}
              </h3>
            </div>

            <div>
              <p className="text-[var(--text-subtle)]">Status</p>
              <h3 className="font-semibold text-emerald-400">
                {vistoria.status}
              </h3>
            </div>

            <div>
              <p className="text-[var(--text-subtle)]">Última Execução</p>
              <h3 className="font-semibold text-[var(--text)]">
                {vistoria.dataUltima ? formatDate(vistoria.dataUltima) : "Ainda não executada"}
              </h3>
            </div>

            <div>
              <p className="text-[var(--text-subtle)]">Próxima Execução</p>
              <h3 className="font-semibold text-[var(--text)]">
                {formatDate(vistoria.dataProxima)}
              </h3>
            </div>

            <div>
              <p className="text-[var(--text-subtle)]">Baixa Registrada Em</p>
              <h3 className="font-semibold text-[var(--text)]">
                {formatDateTime(vistoria.concluidaEm)}
              </h3>
            </div>

            <div>
              <p className="text-[var(--text-subtle)]">Residência</p>
              <h3 className="font-semibold text-[var(--text)]">
                {vistoria.unidade?.nome || "-"}
              </h3>
            </div>

            <div>
              <p className="text-[var(--text-subtle)]">Kitnet</p>
              <h3 className="font-semibold text-[var(--text)]">
                {vistoria.kitnet?.nome || vistoria.kitnet?.numero || "-"}
              </h3>
            </div>

          </div>

        </div>

        <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-8">

          <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
            Observações
          </h2>

          <div className="bg-[var(--surface-2)] rounded-2xl p-6 text-[var(--text-1)]">

            {vistoria.observacoes ||
              "Nenhuma observação cadastrada."}

          </div>

        </div>

        {vistoria.fotos?.length > 0 && (

          <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-8">

            <h2 className="text-2xl font-bold text-[var(--text)] mb-6">
              Fotos e Vídeos da Vistoria
            </h2>

            <div className="grid md:grid-cols-3 gap-4">

              {vistoria.fotos.map((foto, index) =>
                foto.startsWith("data:video") ? (
                  <video
                    key={index}
                    src={foto}
                    controls
                    className="w-full h-52 object-cover rounded-2xl border border-[var(--border-token)]"
                  />
                ) : (
                  <a
                    key={index}
                    href={foto}
                    target="_blank"
                    rel="noreferrer"
                    download={`vistoria-${index + 1}.png`}
                  >

                    <img
                      src={foto}
                      alt={`Foto ${index + 1}`}
                      className="
                        w-full
                        h-52
                        object-cover
                        rounded-2xl
                        border
                        border-[var(--border-token)]
                        cursor-pointer
                        hover:scale-105
                        transition
                      "
                    />

                  </a>
                )
              )}

            </div>

          </div>

        )}

        {vistoria.fotosConclusao?.length > 0 && (

          <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-8">

            <h2 className="text-2xl font-bold text-[var(--text)] mb-6">
              Fotos e Vídeos da Baixa
            </h2>

            <div className="grid md:grid-cols-3 gap-4">

              {vistoria.fotosConclusao.map((midia, index) =>
                midia.startsWith("data:video") ? (
                  <video
                    key={index}
                    src={midia}
                    controls
                    className="w-full h-52 object-cover rounded-2xl border border-[var(--border-token)]"
                  />
                ) : (
                  <img
                    key={index}
                    src={midia}
                    alt={`Mídia ${index + 1}`}
                    className="w-full h-52 object-cover rounded-2xl border border-[var(--border-token)]"
                  />
                )
              )}

            </div>

          </div>

        )}

        <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-8">

          <h2 className="text-2xl font-bold text-[var(--text)] mb-6">
            Histórico de Movimentações
          </h2>

          <div className="space-y-4">

            {historico.length ? (

              historico.map((item) => (

                <div
                  key={item.id}
                  className="
                    border-l-4
                    border-green-600
                    bg-[var(--surface-2)]
                    rounded-r-2xl
                    p-5
                  "
                >

                  <div className="font-semibold text-[var(--text)]">
                    {ACAO_LABEL[item.acao] || item.acao}
                  </div>

                  <div className="text-sm text-[var(--text-subtle)] mt-2">
                    {new Date(item.createdAt).toLocaleString("pt-BR")}
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
