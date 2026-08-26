"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Send, FileText } from "lucide-react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";

import { ContratoService } from "@/services/contratos.service";

export default function ContratoDemonstrativoModal({
  open,
  onClose,
  contratoId,
  onEnviado,
}) {

  const [pdfUrl, setPdfUrl] = useState(null);
  const [carregandoPdf, setCarregandoPdf] = useState(false);
  const [erroPdf, setErroPdf] = useState("");

  const [signatariosExtras, setSignatariosExtras] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState("");
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {

    if (!open || !contratoId) return;

    setEnviado(false);
    setErroEnvio("");
    setSignatariosExtras([]);

    let urlAtual = null;

    async function carregarDemonstrativo() {

      setCarregandoPdf(true);
      setErroPdf("");

      try {

        const blob = await ContratoService.baixarPdf(contratoId);
        urlAtual = window.URL.createObjectURL(blob);
        setPdfUrl(urlAtual);

      } catch (err) {

        setErroPdf(err.message || "Erro ao gerar o demonstrativo do contrato.");

      } finally {

        setCarregandoPdf(false);

      }

    }

    carregarDemonstrativo();

    return () => {
      if (urlAtual) window.URL.revokeObjectURL(urlAtual);
      setPdfUrl(null);
    };

  }, [open, contratoId]);

  function adicionarSignatario() {
    setSignatariosExtras((old) => [...old, { nome: "", email: "" }]);
  }

  function alterarSignatario(indice, campo, valor) {
    setSignatariosExtras((old) =>
      old.map((s, i) => (i === indice ? { ...s, [campo]: valor } : s))
    );
  }

  function removerSignatario(indice) {
    setSignatariosExtras((old) => old.filter((_, i) => i !== indice));
  }

  async function enviarClicksign() {

    setEnviando(true);
    setErroEnvio("");

    try {

      await ContratoService.enviarClicksign(
        contratoId,
        signatariosExtras.filter((s) => s.nome && s.email)
      );

      setEnviado(true);
      onEnviado?.();

    } catch (err) {

      setErroEnvio(err.message || "Erro ao enviar o contrato para a Clicksign.");

    } finally {

      setEnviando(false);

    }

  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Demonstrativo do Contrato"
      subtitle="Confira como o contrato vai ficar antes de enviar para assinatura."
      size="xl"
    >

      <div className="space-y-6">

        <div className="rounded-2xl border border-[var(--border-token)] overflow-hidden bg-[var(--surface-2)]">

          {carregandoPdf ? (
            <div className="flex items-center justify-center h-[60vh] text-[var(--text-subtle)]">
              Gerando demonstrativo...
            </div>
          ) : erroPdf ? (
            <div className="flex items-center justify-center h-[60vh] text-red-400 text-center px-6">
              {erroPdf}
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              title="Demonstrativo do contrato"
              className="w-full h-[60vh]"
            />
          ) : null}

        </div>

        {enviado ? (

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-emerald-400">
            Contrato enviado para a Clicksign com sucesso. O(s) signatário(s) vão receber o e-mail de assinatura em instantes.
          </div>

        ) : (

          <>

            <div className="rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-5">

              <div className="flex items-center justify-between mb-1">

                <div>
                  <p className="font-medium text-[var(--text)]">
                    Signatários adicionais
                  </p>
                  <p className="text-sm text-[var(--text-subtle)]">
                    Além do inquilino e dos signatários fixos, você pode incluir mais alguém só neste envio.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={adicionarSignatario}
                  className="flex shrink-0 items-center gap-2 rounded-xl border border-[var(--border-token)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text)] hover:border-emerald-500/50 transition"
                >
                  <Plus size={16} />
                  Adicionar
                </button>

              </div>

              {signatariosExtras.length > 0 && (

                <div className="mt-4 space-y-3">

                  {signatariosExtras.map((signatario, indice) => (

                    <div key={indice} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] items-center">

                      <input
                        className="w-full rounded-xl border border-[var(--border-token)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none focus:border-emerald-500"
                        placeholder="Nome"
                        value={signatario.nome}
                        onChange={(e) => alterarSignatario(indice, "nome", e.target.value)}
                      />

                      <input
                        className="w-full rounded-xl border border-[var(--border-token)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none focus:border-emerald-500"
                        type="email"
                        placeholder="E-mail"
                        value={signatario.email}
                        onChange={(e) => alterarSignatario(indice, "email", e.target.value)}
                      />

                      <button
                        type="button"
                        onClick={() => removerSignatario(indice)}
                        title="Remover"
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-token)] text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  ))}

                </div>

              )}

            </div>

            {erroEnvio && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm text-red-400">
                {erroEnvio}
              </div>
            )}

            <div className="flex justify-end gap-4 border-t border-[var(--border-token)] pt-6">

              <Button type="button" variant="secondary" onClick={onClose} disabled={enviando}>
                Fechar
              </Button>

              <Button
                type="button"
                onClick={enviarClicksign}
                disabled={enviando || carregandoPdf || !!erroPdf}
              >
                <span className="flex items-center gap-2">
                  <Send size={16} />
                  {enviando ? "Enviando..." : "Enviar à Clicksign"}
                </span>
              </Button>

            </div>

          </>

        )}

      </div>

    </Modal>
  );

}
