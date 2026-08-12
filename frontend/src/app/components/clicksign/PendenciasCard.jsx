"use client";

import { useEffect, useState } from "react";

import {
  Clock3,
  XCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import { ClicksignService } from "@/services/clicksign.service";

function extrairDocumentos(resposta) {
  const data = resposta?.data || resposta;
  const lista = data?.documents || data?.data || [];
  return Array.isArray(lista) ? lista : [];
}

function infoStatus(doc) {
  if (doc.status === "canceled") {
    return { texto: "Recusado / Cancelado", cor: "text-red-400", icone: XCircle };
  }
  if (doc.finished || doc.status === "closed") {
    return { texto: "Concluído", cor: "text-emerald-400", icone: CheckCircle2 };
  }
  return { texto: "Aguardando Assinatura", cor: "text-yellow-400", icone: Clock3 };
}

export default function PendenciasCard() {
  const [documentos, setDocumentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        const resposta = await ClicksignService.listarDocumentos();
        setDocumentos(extrairDocumentos(resposta));
      } catch (err) {
        console.error("Erro ao carregar pendências:", err);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  const pendentes = documentos.filter((doc) => !doc.finished && doc.status !== "closed");
  const visiveis = mostrarTodos ? pendentes : pendentes.slice(0, 4);

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl">

      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-2xl font-bold text-white">

            Pendências

          </h2>

          <p className="text-slate-400">

            Acompanhe documentos que precisam de atenção.

          </p>

        </div>

        {pendentes.length > 4 && (
          <button
            onClick={() => setMostrarTodos(!mostrarTodos)}
            className="text-emerald-400 hover:text-emerald-300 transition"
          >
            {mostrarTodos ? "Ver menos" : "Ver tudo"}
          </button>
        )}

      </div>

      {carregando ? (
        <p className="text-center text-slate-400 py-4">Carregando...</p>
      ) : visiveis.length === 0 ? (
        <p className="text-center text-slate-500 py-4">
          Nenhuma pendência no momento.
        </p>
      ) : (
        <div className="space-y-4">

          {visiveis.map((doc, index) => {

            const info = infoStatus(doc);
            const Icon = info.icone;

            return (

              <div
                key={doc.key || doc.id || index}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-800/40 p-4 transition hover:border-emerald-500/30"
              >

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-700">

                    <Icon
                      size={22}
                      className={info.cor}
                    />

                  </div>

                  <div>

                    <h3 className="font-semibold text-white">

                      {doc.filename || doc.key || "Documento"}

                    </h3>

                  </div>

                </div>

                <div className="flex items-center gap-4">

                  <span className={`${info.cor} text-sm font-medium`}>

                    {info.texto}

                  </span>

                  <ArrowRight size={18} className="text-slate-500" />

                </div>

              </div>

            );

          })}

        </div>
      )}

    </div>
  );
}
