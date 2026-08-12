"use client";

import { useEffect, useState } from "react";

import {
  Users,
  Mail,
  FileSignature,
} from "lucide-react";

import { ClicksignService } from "@/services/clicksign.service";

function extrairDocumentos(resposta) {
  const data = resposta?.data || resposta;
  const lista = data?.documents || data?.data || [];
  return Array.isArray(lista) ? lista : [];
}

export default function AssinantesCard() {
  const [documentos, setDocumentos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const resposta = await ClicksignService.listarDocumentos();
        setDocumentos(extrairDocumentos(resposta));
      } catch (err) {
        console.error("Erro ao carregar assinantes:", err);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  // Assinantes são derivados dos "signers" que a Clicksign devolve junto
  // de cada documento — quando não há documentos reais ainda, não há
  // como listar assinantes (evitamos inventar dados).
  const assinantes = documentos.flatMap((doc) =>
    Array.isArray(doc.signers)
      ? doc.signers.map((s) => ({ ...s, documento: doc.filename || doc.key }))
      : []
  );

  return (
    <div id="clicksign-assinantes" className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl">

      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-white">

            <Users
              size={25}
              className="text-emerald-400"
            />

            Assinantes

          </h2>

          <p className="text-slate-400">

            Pessoas adicionadas como signatárias nos documentos enviados.

          </p>

        </div>

      </div>

      {carregando ? (
        <p className="text-center text-slate-400 py-6">Carregando...</p>
      ) : assinantes.length === 0 ? (
        <p className="text-center text-slate-500 py-6">
          Nenhum assinante cadastrado ainda. Adicione signatários ao enviar um documento em "Documentos".
        </p>
      ) : (
        <div className="space-y-4">

          {assinantes.map((assinante, index) => (

            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-slate-800/40 p-5 transition hover:border-emerald-500/30"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-xl font-bold text-emerald-400">

                  {(assinante.name || assinante.email || "?").charAt(0).toUpperCase()}

                </div>

                <div>

                  <h3 className="text-lg font-semibold text-white">

                    {assinante.name || "Sem nome"}

                  </h3>

                  <p className="text-sm text-slate-400">

                    {assinante.documento}

                  </p>

                </div>

              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">

                <div className="flex items-center gap-2 text-slate-300">

                  <Mail
                    size={17}
                    className="text-emerald-400"
                  />

                  {assinante.email || "—"}

                </div>

                <div className="flex items-center gap-2 text-slate-300">

                  <FileSignature
                    size={17}
                    className="text-blue-400"
                  />

                  {assinante.documento}

                </div>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}
