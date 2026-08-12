"use client";

import { useEffect, useState } from "react";

import {
  History,
  CheckCircle2,
  XCircle,
  Clock3,
} from "lucide-react";

import { ClicksignService } from "@/services/clicksign.service";

function extrairDocumentos(resposta) {
  const data = resposta?.data || resposta;
  const lista = data?.documents || data?.data || [];
  return Array.isArray(lista) ? lista : [];
}

function infoEvento(doc) {
  if (doc.status === "canceled") {
    return { titulo: "Documento cancelado", cor: "text-red-400", icone: XCircle };
  }
  if (doc.finished || doc.status === "closed") {
    return { titulo: "Documento concluído", cor: "text-emerald-400", icone: CheckCircle2 };
  }
  return { titulo: "Aguardando assinatura", cor: "text-yellow-400", icone: Clock3 };
}

export default function HistoricoCard() {
  const [documentos, setDocumentos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const resposta = await ClicksignService.listarDocumentos();
        setDocumentos(extrairDocumentos(resposta));
      } catch (err) {
        console.error("Erro ao carregar histórico:", err);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  return (
    <div id="clicksign-historico" className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl">

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-white">

            <History
              size={25}
              className="text-emerald-400"
            />

            Histórico

          </h2>

          <p className="text-slate-400">

            Últimas movimentações da integração Clicksign.

          </p>

        </div>

      </div>

      {carregando ? (
        <p className="text-center text-slate-400 py-6">Carregando...</p>
      ) : documentos.length === 0 ? (
        <p className="text-center text-slate-500 py-6">
          Nenhuma movimentação registrada ainda. O histórico é preenchido conforme documentos são enviados e assinados.
        </p>
      ) : (
        <div className="space-y-5">

          {documentos.map((doc, index) => {

            const info = infoEvento(doc);
            const Icon = info.icone;

            return (

              <div
                key={doc.key || doc.id || index}
                className="flex gap-4"
              >

                <div className="flex flex-col items-center">

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">

                    <Icon
                      size={20}
                      className={info.cor}
                    />

                  </div>

                  {index !== documentos.length - 1 && (
                    <div className="mt-2 h-12 w-px bg-slate-700" />
                  )}

                </div>

                <div className="flex-1 rounded-2xl border border-white/10 bg-slate-800/30 p-4">

                  <h3 className="font-semibold text-white">

                    {info.titulo}

                  </h3>

                  <p className="mt-2 text-sm text-slate-400">

                    {doc.filename || doc.key || "Documento"}

                  </p>

                </div>

              </div>

            );

          })}

        </div>
      )}

    </div>
  );
}
