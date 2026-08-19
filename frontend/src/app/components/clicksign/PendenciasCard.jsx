"use client";

import { useEffect, useState } from "react";

import {
  Clock3,
  XCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import { ClicksignService } from "@/services/clicksign.service";
import { obterLinkClicksign } from "@/utils/clicksignLink";

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
  if (doc.status === "draft") {
    return { texto: "Rascunho (não enviado)", cor: "text-[var(--text-faint)]", icone: Clock3 };
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

  // Só "running" conta como pendência de verdade — bate com a aba "Em
  // processo" do painel da própria Clicksign. Rascunho (nunca enviado)
  // e cancelado não são "aguardando assinatura".
  const pendentes = documentos
    .filter((doc) => doc.status === "running")
    .sort((a, b) => {
      const dataA = new Date(a.uploaded_at || a.created_at || 0).getTime();
      const dataB = new Date(b.uploaded_at || b.created_at || 0).getTime();
      return dataB - dataA;
    });

  const visiveis = mostrarTodos ? pendentes : pendentes.slice(0, 4);

  return (
    <div className="rounded-3xl border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl p-6 shadow-xl">

      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-2xl font-bold text-[var(--text)]">

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
                onClick={async () => {
                  const id = doc.key || doc.id;
                  if (!id) return;
                  try {
                    const url = await obterLinkClicksign(id);
                    window.open(url, "_blank");
                  } catch {
                    window.open("https://app.clicksign.com", "_blank");
                  }
                }}
                className="flex items-center justify-between rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-4 transition hover:border-emerald-500/30 cursor-pointer"
              >

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-700">

                    <Icon
                      size={22}
                      className={info.cor}
                    />

                  </div>

                  <div>

                    <h3 className="font-semibold text-[var(--text)]">

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
