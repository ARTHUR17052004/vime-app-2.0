"use client";

import { useEffect, useState } from "react";

import { FileWarning, Eye, Download, Loader2 } from "lucide-react";

import { ClicksignService } from "@/services/clicksign.service";
import { obterLinkClicksign } from "@/utils/clicksignLink";
import Button from "../ui/Button";

function extrairDocumentos(resposta) {
  const data = resposta?.data || resposta;
  const lista = data?.documents || data?.data || [];
  return Array.isArray(lista) ? lista : [];
}

function statusLegivel(doc) {
  if (doc.finished || doc.status === "closed") return "Concluído";
  if (doc.status === "canceled") return "Cancelado";
  if (doc.status === "running") return "Aguardando Assinatura";
  return "Rascunho";
}

// Documentos que existem de verdade na Clicksign (contratos gerados
// pelo VIME, a julgar pelo nome do arquivo) mas que não têm um
// Contrato correspondente no banco local — por exemplo, se o
// inquilino/contrato local foi apagado depois de já ter sido enviado
// pra assinatura.
export default function ContratoClicksignOrfaos({ contratosLocais = [] }) {

  const [documentos, setDocumentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [baixando, setBaixando] = useState(null);

  useEffect(() => {

    async function carregar() {

      try {

        const resposta = await ClicksignService.listarDocumentos();

        const chavesLocais = new Set(
          contratosLocais
            .map((c) => c.clicksignDocumentKey)
            .filter(Boolean)
        );

        const todos = extrairDocumentos(resposta);

        const orfaos = todos.filter((doc) => {

          const chave = doc.key || doc.id;

          const pareceContrato = (doc.filename || "").toLowerCase().startsWith("contrato-");

          return pareceContrato && chave && !chavesLocais.has(chave);

        });

        setDocumentos(orfaos);

      } catch (err) {

        console.error("Erro ao buscar documentos da Clicksign:", err);

      } finally {

        setCarregando(false);

      }

    }

    carregar();

  }, [contratosLocais]);

  async function abrir(doc) {
    const id = doc.key || doc.id;
    if (!id) return;
    const url = await obterLinkClicksign(id);
    window.open(url, "_blank");
  }

  async function baixar(doc) {
    const id = doc.key || doc.id;
    if (!id) return;

    setBaixando(id);

    try {

      const blob = await ClicksignService.baixarArquivo(id);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.filename || "contrato-clicksign.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {

      alert(err.message || "Erro ao baixar o documento.");

    } finally {

      setBaixando(null);

    }

  }

  if (carregando || documentos.length === 0) return null;

  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/5 backdrop-blur-xl p-6 shadow-xl mt-8">

      <div className="flex items-center gap-3 mb-2">

        <FileWarning className="text-yellow-400" size={22} />

        <h2 className="text-xl font-bold text-[var(--text)]">
          Contratos na Clicksign sem registro local
        </h2>

      </div>

      <p className="text-sm text-[var(--text-subtle)] mb-6">
        Esses documentos existem na Clicksign, mas o contrato/inquilino correspondente
        não está mais no VIME (provavelmente apagado depois de já enviado para assinatura).
        Ainda dá pra visualizar e baixar direto daqui.
      </p>

      <div className="space-y-4">

        {documentos.map((doc) => (

          <div
            key={doc.key || doc.id}
            className="flex flex-col gap-3 rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-4 md:flex-row md:items-center md:justify-between"
          >

            <div>
              <h3 className="font-semibold text-[var(--text)]">
                {doc.filename || "Documento"}
              </h3>
              <p className="text-sm text-[var(--text-subtle)]">
                {statusLegivel(doc)}
              </p>
            </div>

            <div className="flex gap-2">

              <Button variant="secondary" onClick={() => abrir(doc)}>
                <Eye size={16} />
                Ver na Clicksign
              </Button>

              <Button
                variant="secondary"
                onClick={() => baixar(doc)}
                disabled={baixando === (doc.key || doc.id)}
              >
                {baixando === (doc.key || doc.id) ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                Baixar
              </Button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );

}
