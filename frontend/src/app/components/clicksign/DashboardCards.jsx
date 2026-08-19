"use client";

import { useEffect, useState } from "react";

import {
  FileText,
  Clock3,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { ClicksignService } from "@/services/clicksign.service";

function extrairDocumentos(resposta) {
  const data = resposta?.data || resposta;
  const lista = data?.documents || data?.data || [];
  return Array.isArray(lista) ? lista : [];
}

export default function DashboardCards() {
  const [documentos, setDocumentos] = useState([]);
  const [modoMock, setModoMock] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const resposta = await ClicksignService.listarDocumentos();
        setModoMock(!!(resposta?.data || resposta)?.mock);
        setDocumentos(extrairDocumentos(resposta));
      } catch (err) {
        console.error("Erro ao carregar indicadores da Clicksign:", err);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  const concluidos = documentos.filter((d) => d.finished || d.status === "closed").length;
  // Só "running" conta como aguardando assinatura de verdade — bate
  // com o painel da própria Clicksign. Rascunho (nunca enviado) não é
  // "aguardando" ninguém, e cancelado obviamente também não.
  const aguardando = documentos.filter((d) => d.status === "running").length;

  const cards = [
    {
      titulo: "Documentos Enviados",
      valor: carregando ? "…" : String(documentos.length),
      descricao: modoMock ? "Modo mock (sem token configurado)" : "Total via Clicksign",
      cor: "bg-blue-500/10",
      texto: "text-blue-400",
      icone: FileText,
    },
    {
      titulo: "Aguardando Assinatura",
      valor: carregando ? "…" : String(aguardando),
      descricao: "Necessitam ação",
      cor: "bg-yellow-500/10",
      texto: "text-yellow-400",
      icone: Clock3,
    },
    {
      titulo: "Concluídos",
      valor: carregando ? "…" : String(concluidos),
      descricao: "Assinados com sucesso",
      cor: "bg-emerald-500/10",
      texto: "text-emerald-400",
      icone: CheckCircle2,
    },
    {
      titulo: "Status da Integração",
      valor: carregando ? "…" : modoMock ? "Mock" : "Real",
      descricao: modoMock ? "Configure um token para ativar" : "Conectado à Clicksign",
      cor: "bg-purple-500/10",
      texto: "text-purple-400",
      icone: AlertCircle,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      {cards.map((card, index) => {

        const Icon = card.icone;

        return (

          <div
            key={index}
            className="rounded-3xl border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl p-6 shadow-xl transition hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-2xl"
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-400">

                  {card.titulo}

                </p>

                <h2 className="mt-2 text-3xl font-bold text-[var(--text)]">

                  {card.valor}

                </h2>

                <p className="mt-2 text-sm text-slate-500">

                  {card.descricao}

                </p>

              </div>

              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${card.cor}`}
              >

                <Icon
                  size={28}
                  className={card.texto}
                />

              </div>

            </div>

          </div>

        );

      })}

    </div>
  );
}
