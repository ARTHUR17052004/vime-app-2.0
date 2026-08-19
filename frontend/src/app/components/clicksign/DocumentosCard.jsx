"use client";

import { useEffect, useRef, useState } from "react";

import {
  FileText,
  Upload,
  Search,
  Eye,
  Trash2,
  Plus,
  Loader2,
} from "lucide-react";

import { ClicksignService } from "@/services/clicksign.service";
import Modal from "../ui/Modal";
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
  return doc.status || "Aguardando Assinatura";
}

export default function DocumentosCard() {
  const inputRef = useRef(null);

  const [documentos, setDocumentos] = useState([]);
  const [modoMock, setModoMock] = useState(false);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [arquivosSelecionados, setArquivosSelecionados] = useState([]);
  const [signatarioNome, setSignatarioNome] = useState("");
  const [signatarioEmail, setSignatarioEmail] = useState("");
  const [linksAssinatura, setLinksAssinatura] = useState([]);

  async function carregar() {
    setCarregando(true);
    setErro(null);

    try {
      const resposta = await ClicksignService.listarDocumentos();
      setModoMock(!!(resposta?.data || resposta)?.mock);
      setDocumentos(extrairDocumentos(resposta));
    } catch (err) {
      setErro(err.message || "Não foi possível carregar os documentos.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirSeletorArquivo() {
    inputRef.current?.click();
  }

  function arquivosEscolhidos(event) {
    const arquivos = Array.from(event.target.files || []);
    if (!arquivos.length) return;

    setArquivosSelecionados(arquivos);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setArquivosSelecionados([]);
    setSignatarioNome("");
    setSignatarioEmail("");
    setLinksAssinatura([]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function lerArquivoComoBase64(arquivo) {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => resolve(String(leitor.result).split(",")[1] || "");
      leitor.onerror = reject;
      leitor.readAsDataURL(arquivo);
    });
  }

  async function confirmarEnvio() {

    if (!signatarioNome.trim() || !signatarioEmail.trim()) {
      setErro("Informe o nome e o e-mail de quem vai assinar o documento.");
      return;
    }

    setEnviando(true);
    setErro(null);

    const links = [];

    try {
      for (const arquivo of arquivosSelecionados) {
        const conteudoBase64 = await lerArquivoComoBase64(arquivo);

        const resposta = await ClicksignService.enviarDocumento({
          nome: arquivo.name,
          conteudoBase64,
          mensagem: `Olá ${signatarioNome}, segue o documento "${arquivo.name}" para assinatura.`,
          signatarios: [
            {
              name: signatarioNome,
              email: signatarioEmail,
              auth_mode: "email",
            },
          ],
        });

        const dados = resposta?.data || resposta;

        const url = dados?.signatariosAdicionados?.[0]?.lista?.list?.url;

        if (url) {
          links.push({ arquivo: arquivo.name, url });
        }
      }

      await carregar();

      if (links.length) {
        setLinksAssinatura(links);
      } else {
        fecharModal();
      }

    } catch (err) {
      setErro(err.message || "Erro ao enviar documento para a Clicksign.");
    } finally {
      setEnviando(false);
    }
  }

  async function excluir(doc) {
    const id = doc.key || doc.id;
    if (!id) return;

    try {
      await ClicksignService.cancelarDocumento(id);
      await carregar();
    } catch (err) {
      setErro(err.message || "Erro ao cancelar documento.");
    }
  }

  function visualizar() {
    // A Clicksign não expõe um link direto pro documento por aqui (só
    // no momento em que a lista/assinatura é criada) — manda pro
    // painel deles pra não cair em link quebrado.
    window.open("https://app.clicksign.com", "_blank");
  }

  const documentosFiltrados = documentos.filter((doc) => {
    const nome = doc.filename || doc.key || "";
    return nome.toLowerCase().includes(busca.toLowerCase());
  });

  return (
    <div className="rounded-3xl border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl p-6 shadow-xl">

      {/* Cabeçalho */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">

        <div>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--text)]">

            <FileText className="text-emerald-400" size={26} />

            Documentos

          </h2>

          <p className="text-slate-400">

            Gerencie todos os documentos enviados para assinatura.

          </p>

        </div>

        <button
          onClick={abrirSeletorArquivo}
          disabled={enviando}
          className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-[var(--text)] transition hover:bg-emerald-700 disabled:opacity-50"
        >
          <Plus size={18} />
          Novo Documento
        </button>

      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        multiple
        onChange={arquivosEscolhidos}
        className="hidden"
      />

      {modoMock && (
        <div className="mb-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-300">
          Nenhum token da Clicksign configurado — operando em modo mock. Os envios não chegam à Clicksign de verdade.
        </div>
      )}

      {erro && !modalAberto && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {erro}
        </div>
      )}

      {/* Pesquisa */}

      <div className="relative mb-6">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
        />

        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Pesquisar documento..."
          className="w-full rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] py-3 pl-11 pr-4 text-[var(--text)] outline-none transition focus:border-emerald-500"
        />

      </div>

      {/* Upload */}

      <div
        onClick={abrirSeletorArquivo}
        className="mb-8 cursor-pointer rounded-3xl border-2 border-dashed border-[var(--border-token)] bg-[var(--surface-2)] p-10 text-center transition hover:border-emerald-500/40"
      >

        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">

          <Upload size={36} className="text-emerald-400" />

        </div>

        <h3 className="text-xl font-semibold text-[var(--text)]">

          Adicionar documentos

        </h3>

        <p className="mt-2 text-slate-400">

          Clique aqui ou arraste arquivos PDF ou Word (.doc/.docx) para envio.

        </p>

        <button
          onClick={(e) => { e.stopPropagation(); abrirSeletorArquivo(); }}
          className="mt-6 rounded-2xl bg-emerald-600 px-6 py-3 text-[var(--text)] transition hover:bg-emerald-700"
        >
          Selecionar Arquivos
        </button>

      </div>

      {/* Lista */}

      {carregando ? (
        <p className="text-center text-slate-400 py-6">Carregando documentos...</p>
      ) : documentosFiltrados.length === 0 ? (
        <p className="text-center text-slate-500 py-6">
          Nenhum documento enviado ainda.
        </p>
      ) : (
        <div className="space-y-4">

          {documentosFiltrados.map((doc, index) => (

            <div
              key={doc.key || doc.id || index}
              className="flex flex-col gap-4 rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-5 lg:flex-row lg:items-center lg:justify-between"
            >

              <div>

                <h3 className="font-semibold text-[var(--text)]">

                  {doc.filename || doc.key || "Documento"}

                </h3>

                <p className="text-sm text-slate-400">

                  {statusLegivel(doc)}

                </p>

              </div>

              <div className="flex items-center gap-8">

                <div className="flex gap-2">

                  <button
                    onClick={() => visualizar(doc)}
                    className="rounded-xl bg-slate-700 p-2 text-[var(--text)] hover:bg-slate-600"
                  >

                    <Eye size={18} />

                  </button>

                  {doc.status === "running" && (

                    <button
                      onClick={() => excluir(doc)}
                      title="Cancelar assinatura"
                      className="rounded-xl bg-red-600 p-2 text-[var(--text)] hover:bg-red-700"
                    >

                      <Trash2 size={18} />

                    </button>

                  )}

                </div>

              </div>

            </div>

          ))}

        </div>
      )}

      {/* Modal: signatário do documento */}

      <Modal
        open={modalAberto}
        onClose={enviando ? undefined : fecharModal}
        title="Quem vai assinar?"
        subtitle={
          arquivosSelecionados.length === 1
            ? arquivosSelecionados[0]?.name
            : `${arquivosSelecionados.length} arquivo(s) selecionado(s)`
        }
        size="sm"
        persistent={enviando}
      >

        {linksAssinatura.length > 0 ? (

          <div className="space-y-5">

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              Documento enviado! A Clicksign já notificou {signatarioEmail} por e-mail. Você também pode compartilhar o link direto abaixo.
            </div>

            {linksAssinatura.map((item) => (
              <div key={item.url} className="space-y-2">
                <label className="text-sm text-[var(--text-muted)]">
                  {item.arquivo}
                </label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={item.url}
                    onClick={(e) => e.target.select()}
                    className="flex-1 rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-3 text-[var(--text)] text-sm"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => navigator.clipboard.writeText(item.url)}
                  >
                    Copiar
                  </Button>
                </div>
              </div>
            ))}

            <Button fullWidth onClick={fecharModal}>
              Concluir
            </Button>

          </div>

        ) : (

          <div className="space-y-5">

            {erro && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400">
                {erro}
              </div>
            )}

            <div>
              <label className="text-sm text-[var(--text-muted)]">
                Nome do signatário
              </label>
              <input
                value={signatarioNome}
                onChange={(e) => setSignatarioNome(e.target.value)}
                placeholder="Nome completo"
                className="mt-2 w-full rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-3 text-[var(--text)]"
              />
            </div>

            <div>
              <label className="text-sm text-[var(--text-muted)]">
                E-mail do signatário
              </label>
              <input
                type="email"
                value={signatarioEmail}
                onChange={(e) => setSignatarioEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="mt-2 w-full rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-3 text-[var(--text)]"
              />
            </div>

            <p className="text-xs text-slate-500">
              A Clicksign vai enviar o link de assinatura diretamente para esse e-mail.
            </p>

            <div className="flex gap-3">

              <Button
                variant="secondary"
                fullWidth
                onClick={fecharModal}
                disabled={enviando}
              >
                Cancelar
              </Button>

              <Button
                fullWidth
                onClick={confirmarEnvio}
                disabled={enviando}
              >
                {enviando ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar para assinatura"
                )}
              </Button>

            </div>

          </div>

        )}

      </Modal>

    </div>
  );
}
