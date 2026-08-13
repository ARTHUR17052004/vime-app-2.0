"use client";

import { useEffect, useState } from "react";

import { AuditoriaService } from "@/services/auditoria.service";

const ACAO_LABEL = {
  CRIAR: "Contrato criado",
  ATUALIZAR: "Contrato atualizado",
  ENCERRAR: "Contrato encerrado",
  RENOVAR: "Contrato renovado",
  EXCLUIR: "Contrato excluído",
};

export default function ContratoHistoricoEventos({
  contrato,
}) {

  const [eventosContrato, setEventosContrato] =
    useState([]);

  const [carregando, setCarregando] =
    useState(true);

  useEffect(() => {

    async function carregar() {

      try {

        const resposta = await AuditoriaService.listar();

        const lista = Array.isArray(resposta)
          ? resposta
          : resposta.data || [];

        setEventosContrato(
          lista.filter(
            (evento) =>
              evento.modulo === "CONTRATOS" &&
              String(evento.registroId) === String(contrato.id)
          )
        );

      } catch (err) {

        console.error("Erro ao carregar eventos do contrato:", err);

      } finally {

        setCarregando(false);

      }

    }

    carregar();

  }, [contrato.id]);

  return (
    <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-8">

      <h2 className="text-2xl font-bold text-white mb-6">
        Histórico de Eventos
      </h2>

      {carregando ? (

        <div className="text-gray-400">
          Carregando...
        </div>

      ) : eventosContrato.length === 0 ? (

        <div className="text-gray-400">
          Nenhum evento encontrado.
        </div>

      ) : (

        <div className="space-y-4">

          {eventosContrato.map(
            (evento) => (

              <div
                key={evento.id}
                className="
                  border
                  border-white/10
                  rounded-2xl
                  p-5
                "
              >

                <div className="text-white font-semibold">
                  {ACAO_LABEL[evento.acao] || evento.acao}
                </div>

                <div className="text-sm text-gray-400 mt-2">
                  {new Date(evento.createdAt).toLocaleString("pt-BR")}
                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>
  );
}
