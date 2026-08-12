/* eslint-disable @next/next/no-img-element */
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import MainLayout from "../../components/layout/MainLayout";

import { VistoriaService } from "@/services/vistoria.service";
import { AuditoriaService } from "@/services/auditoria.service";

function formatarData(data) {
  return data ? new Date(data).toLocaleDateString("pt-BR") : null;
}

const ACAO_LABEL = {
  CRIAR: "Vistoria criada",
  ATUALIZAR: "Vistoria atualizada",
  EXCLUIR: "Vistoria excluída",
};

export default function DetalhesVistoriaPage() {

  const params = useParams();

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

  if (carregando) {

    return (

      <MainLayout>
        <div className="py-32 text-center text-gray-400">
          Carregando...
        </div>
      </MainLayout>

    );

  }

  if (!vistoria) {

    return (

      <MainLayout>

        <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-10">

          <h1 className="text-3xl font-bold text-white">
            Vistoria não encontrada
          </h1>

        </div>

      </MainLayout>

    );

  }

  return (

    <MainLayout>

      <div className="space-y-8">

        <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-10">

          <h1 className="text-4xl font-bold text-white">
            {vistoria.titulo}
          </h1>

          <p className="text-gray-400 mt-2">
            Informações completas da vistoria
          </p>

        </div>

        <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-8">

          <h2 className="text-2xl font-bold text-white mb-6">
            Dados da Vistoria
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            <div>
              <p className="text-gray-400">Categoria</p>
              <h3 className="font-semibold text-white">
                {vistoria.categoria || "-"}
              </h3>
            </div>

            <div>
              <p className="text-gray-400">Criticidade</p>
              <h3 className="font-semibold text-white">
                {vistoria.criticidade || "-"}
              </h3>
            </div>

            <div>
              <p className="text-gray-400">Responsável</p>
              <h3 className="font-semibold text-white">
                {vistoria.responsavel || "-"}
              </h3>
            </div>

            <div>
              <p className="text-gray-400">Periodicidade</p>
              <h3 className="font-semibold text-white">
                {vistoria.periodicidade || "-"}
              </h3>
            </div>

            <div>
              <p className="text-gray-400">Status</p>
              <h3 className="font-semibold text-emerald-400">
                {vistoria.status}
              </h3>
            </div>

            <div>
              <p className="text-gray-400">Última Execução</p>
              <h3 className="font-semibold text-white">
                {formatarData(vistoria.dataUltima) || "Ainda não executada"}
              </h3>
            </div>

            <div>
              <p className="text-gray-400">Próxima Execução</p>
              <h3 className="font-semibold text-white">
                {formatarData(vistoria.dataProxima) || "-"}
              </h3>
            </div>

            <div>
              <p className="text-gray-400">Unidade</p>
              <h3 className="font-semibold text-white">
                {vistoria.unidade || "-"}
              </h3>
            </div>

            <div>
              <p className="text-gray-400">Kitnet</p>
              <h3 className="font-semibold text-white">
                {vistoria.kitnet || "-"}
              </h3>
            </div>

          </div>

        </div>

        <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-8">

          <h2 className="text-2xl font-bold text-white mb-4">
            Observações
          </h2>

          <div className="bg-white/5 rounded-2xl p-6 text-gray-200">

            {vistoria.observacoes ||
              "Nenhuma observação cadastrada."}

          </div>

        </div>

        {vistoria.fotos?.length > 0 && (

          <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-8">

            <h2 className="text-2xl font-bold text-white mb-6">
              Fotos da Vistoria
            </h2>

            <div className="grid md:grid-cols-3 gap-4">

              {vistoria.fotos.map((foto, index) => (

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
                      border-white/10
                      cursor-pointer
                      hover:scale-105
                      transition
                    "
                  />

                </a>

              ))}

            </div>

          </div>

        )}

        <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-8">

          <h2 className="text-2xl font-bold text-white mb-6">
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
                    bg-white/5
                    rounded-r-2xl
                    p-5
                  "
                >

                  <div className="font-semibold text-white">
                    {ACAO_LABEL[item.acao] || item.acao}
                  </div>

                  <div className="text-sm text-gray-400 mt-2">
                    {new Date(item.createdAt).toLocaleString("pt-BR")}
                  </div>

                </div>

              ))

            ) : (

              <div className="border border-white/10 rounded-2xl p-5">

                <div className="text-gray-300">
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
