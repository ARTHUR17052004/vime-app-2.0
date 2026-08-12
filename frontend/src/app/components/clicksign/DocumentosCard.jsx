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

  function lerArquivoComoBase64(arquivo) {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => resolve(String(leitor.result).split(",")[1] || "");
      leitor.onerror = reject;
      leitor.readAsDataURL(arquivo);
    });
  }

  async function enviarArquivos(event) {
    const arquivos = Array.from(event.target.files || []);
    if (!arquivos.length) return;

    setEnviando(true);
    setErro(null);

    try {
      for (const arquivo of arquivos) {
        const conteudoBase64 = await lerArquivoComoBase64(arquivo);

        await ClicksignService.enviarDocumento({
          nome: arquivo.name,
          conteudoBase64,
        });
      }

      await carregar();
    } catch (err) {
      setErro(err.message || "Erro ao enviar documento para a Clicksign.");
    } finally {
      setEnviando(false);
      if (inputRef.current) inputRef.current.value = "";
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

  async function visualizar(doc) {
    const id = doc.key || doc.id;
    if (!id) return;

    try {
      const resposta = await ClicksignService.buscarDocumento(id);
      console.log("Documento Clicksign:", resposta);
      alert("Detalhes do documento impressos no console.");
    } catch (err) {
      setErro(err.message || "Erro ao buscar documento.");
    }
  }

  const documentosFiltrados = documentos.filter((doc) => {
    const nome = doc.filename || doc.key || "";
    return nome.toLowerCase().includes(busca.toLowerCase());
  });

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl">

      {/* Cabeçalho */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">

        <div>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-white">

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
          className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          <Plus size={18} />
          Novo Documento
        </button>

      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple
        onChange={enviarArquivos}
        className="hidden"
      />

      {modoMock && (
        <div className="mb-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-300">
          Nenhum token da Clicksign configurado — operando em modo mock. Os envios não chegam à Clicksign de verdade.
        </div>
      )}

      {erro && (
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
          className="w-full rounded-2xl border border-white/10 bg-slate-800/40 py-3 pl-11 pr-4 text-white outline-none transition focus:border-emerald-500"
        />

      </div>

      {/* Upload */}

      <div
        onClick={abrirSeletorArquivo}
        className="mb-8 cursor-pointer rounded-3xl border-2 border-dashed border-white/10 bg-slate-800/30 p-10 text-center transition hover:border-emerald-500/40"
      >

        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">

          {enviando ? (
            <Loader2 size={36} className="animate-spin text-emerald-400" />
          ) : (
            <Upload size={36} className="text-emerald-400" />
          )}

        </div>

        <h3 className="text-xl font-semibold text-white">

          Adicionar documentos

        </h3>

        <p className="mt-2 text-slate-400">

          Clique aqui ou arraste arquivos PDF para envio.

        </p>

        <button
          onClick={(e) => { e.stopPropagation(); abrirSeletorArquivo(); }}
          disabled={enviando}
          className="mt-6 rounded-2xl bg-emerald-600 px-6 py-3 text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {enviando ? "Enviando..." : "Selecionar Arquivos"}
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
              className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-800/40 p-5 lg:flex-row lg:items-center lg:justify-between"
            >

              <div>

                <h3 className="font-semibold text-white">

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
                    className="rounded-xl bg-slate-700 p-2 text-white hover:bg-slate-600"
                  >

                    <Eye size={18} />

                  </button>

                  <button
                    onClick={() => excluir(doc)}
                    className="rounded-xl bg-red-600 p-2 text-white hover:bg-red-700"
                  >

                    <Trash2 size={18} />

                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}
