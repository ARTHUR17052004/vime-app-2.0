"use client";

import { useEffect, useState } from "react";

import { FileWarning, Eye, Download, Loader2, MoreVertical, Trash2 } from "lucide-react";

import { ClicksignService } from "@/services/clicksign.service";
import { obterLinkClicksign } from "@/utils/clicksignLink";
import Button from "../ui/Button";
import ActionMenu from "../ui/ActionMenu";
import { usePermissao } from "../../../hooks/usePermissao";

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

  const podeExcluir = usePermissao("clicksign.cancelar");

  const [documentos, setDocumentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [baixando, setBaixando] = useState(null);
  const [excluindo, setExcluindo] = useState(null);
  const [menuAberto, setMenuAberto] = useState(null);
  const [posicaoMenu, setPosicaoMenu] = useState({ top: 0, left: 0 });

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

    // A listagem já traz o link do documento — evita uma segunda chamada
    // à Clicksign que falha sempre que o documento já foi cancelado ou
    // removido de lá (comum nesses órfãos antigos).
    if (doc.links?.self) {
      window.open(`https://app.clicksign.com${doc.links.self}`, "_blank");
      return;
    }

    try {
      const url = await obterLinkClicksign(id);
      window.open(url, "_blank");
    } catch (err) {
      alert(
        "Não foi possível abrir esse documento na Clicksign agora — provavelmente porque ele já foi cancelado ou removido de lá. Você ainda pode baixar o PDF pelo botão \"Baixar\"."
      );
    }
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

  function abrirMenu(e, id) {
    const rect = e.currentTarget.getBoundingClientRect();
    const largura = 180;

    let left = rect.right - largura;
    const top = rect.bottom + 8;

    if (left < 16) left = 16;
    if (left + largura > window.innerWidth - 16) {
      left = window.innerWidth - largura - 16;
    }

    setPosicaoMenu({ top, left });
    setMenuAberto(id);
  }

  // Cancela o envelope na própria Clicksign (não existe "excluir" na
  // API deles) -- o link de assinatura, se ainda estiver aberto, para
  // de funcionar. Some da lista aqui na hora, sem precisar recarregar.
  async function excluir(doc) {
    const id = doc.key || doc.id;
    if (!id) return;

    if (!confirm(`Cancelar/excluir "${doc.filename || "este documento"}" na Clicksign? Ninguém mais vai conseguir assinar nem abrir esse link.`)) {
      return;
    }

    setExcluindo(id);
    setMenuAberto(null);

    try {

      await ClicksignService.cancelarDocumento(id);

      setDocumentos((old) => old.filter((d) => (d.key || d.id) !== id));

    } catch (err) {

      alert(err.message || "Erro ao excluir o documento na Clicksign.");

    } finally {

      setExcluindo(null);

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

              {podeExcluir && (
                <button
                  type="button"
                  onClick={(e) => abrirMenu(e, doc.key || doc.id)}
                  disabled={excluindo === (doc.key || doc.id)}
                  className="h-10 w-10 shrink-0 rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-subtle)] hover:bg-[var(--surface-3)] hover:text-[var(--text)] disabled:opacity-50"
                >
                  {excluindo === (doc.key || doc.id) ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <MoreVertical size={16} />
                  )}
                </button>
              )}

              {podeExcluir && (
                <ActionMenu
                  open={menuAberto === (doc.key || doc.id)}
                  position={posicaoMenu}
                  onClose={() => setMenuAberto(null)}
                >
                  <button
                    type="button"
                    onClick={() => excluir(doc)}
                    className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Excluir
                  </button>
                </ActionMenu>
              )}

            </div>

          </div>

        ))}

      </div>

    </div>
  );

}
