"use client";

import { useEffect, useRef, useState } from "react";
import { Paperclip, Send, X, Download, Camera } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { SolicitacaoService } from "@/services/solicitacao.service";
import { usePermissao } from "@/hooks/usePermissao";
import { lerArquivoComoDataUrl } from "@/utils/arquivoMidia";
import CameraCapture, { cameraSuportada } from "../ui/CameraCapture";

const STATUS_OPCOES = [
  "SOLICITADA",
  "EM COTAÇÃO",
  "AGUARDANDO COMPRA",
  "ATENDIDA",
  "REJEITADA",
];

function formatarTamanho(base64) {

  if (!base64) return "";

  const bytes = Math.round((base64.length * 3) / 4);

  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

}

export default function SolicitacaoChat({
  solicitacaoId,
  statusAtual,
  onStatusAlterado,
}) {

  const { usuario } = useAuth();

  const podeClassificar = usePermissao("solicitacoes.classificar");

  const [mensagens, setMensagens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [texto, setTexto] = useState("");
  const [novoStatus, setNovoStatus] = useState("");
  const [anexo, setAnexo] = useState(null);

  const inputArquivoRef = useRef(null);
  const inputCameraRef = useRef(null);
  const fimRef = useRef(null);
  const [cameraAberta, setCameraAberta] = useState(false);

  const carregarMensagens = async () => {

    try {

      setCarregando(true);

      const resposta = await SolicitacaoService.listarMensagens(
        solicitacaoId
      );

      setMensagens(resposta.data || []);

    } catch (err) {

      console.error("Erro ao carregar mensagens:", err);

    } finally {

      setCarregando(false);

    }

  };

  useEffect(() => {

    carregarMensagens();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solicitacaoId]);

  useEffect(() => {

    fimRef.current?.scrollIntoView({ behavior: "smooth" });

  }, [mensagens]);

  async function selecionarArquivo(e) {

    const arquivo = e.target.files?.[0];
    e.target.value = "";

    if (!arquivo) return;

    try {

      const dados = await lerArquivoComoDataUrl(arquivo);

      setAnexo({
        nome: arquivo.name,
        tipo: arquivo.type || "application/octet-stream",
        dados,
      });

    } catch (erro) {

      alert(erro.message);

    }

  }

  function abrirCamera() {
    if (cameraSuportada()) {
      setCameraAberta(true);
    } else {
      inputCameraRef.current?.click();
    }
  }

  function aoCapturarFoto(arquivo) {
    setCameraAberta(false);
    selecionarArquivo({ target: { files: [arquivo], value: "" } });
  }

  async function enviar(e) {

    e.preventDefault();

    if (!texto.trim() && !anexo && !novoStatus) return;

    setEnviando(true);

    try {

      await SolicitacaoService.enviarMensagem(solicitacaoId, {
        texto: texto.trim() || null,
        statusAlterado: novoStatus || null,
        anexoNome: anexo?.nome || null,
        anexoTipo: anexo?.tipo || null,
        anexoDados: anexo?.dados || null,
      });

      setTexto("");
      setAnexo(null);

      if (inputArquivoRef.current) {
        inputArquivoRef.current.value = "";
      }

      if (inputCameraRef.current) {
        inputCameraRef.current.value = "";
      }

      if (novoStatus) {
        onStatusAlterado?.(novoStatus);
      }

      setNovoStatus("");

      await carregarMensagens();

    } catch (err) {

      alert(
        err.message ||
        "Erro ao enviar mensagem."
      );

    } finally {

      setEnviando(false);

    }

  }

  return (

    <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-8">

      <h2 className="text-2xl font-bold text-[var(--text)] mb-6">
        Conversa
      </h2>

      <div
        className="
          space-y-5
          max-h-[520px]
          overflow-y-auto
          pr-2
          mb-6
        "
      >

        {carregando ? (

          <p className="text-[var(--text-subtle)] text-center py-10">
            Carregando...
          </p>

        ) : mensagens.length === 0 ? (

          <p className="text-[var(--text-subtle)] text-center py-10">
            Nenhuma mensagem ainda. Comece a conversa abaixo.
          </p>

        ) : (

          mensagens.map((msg) => {

            const minhaMensagem = msg.autorId === usuario?.id;

            return (

              <div
                key={msg.id}
                className={`
                  flex
                  ${minhaMensagem ? "justify-end" : "justify-start"}
                `}
              >

                <div
                  className={`
                    max-w-[80%]
                    rounded-2xl
                    px-5
                    py-4
                    ${
                      minhaMensagem
                        ? "bg-emerald-600/20 border border-emerald-500/20"
                        : "bg-[var(--surface-2)] border border-[var(--border-token)]"
                    }
                  `}
                >

                  <div className="flex items-center gap-2 flex-wrap">

                    <span className="font-semibold text-[var(--text)] text-sm">
                      {msg.autorNome}
                    </span>

                    <span className="text-[var(--text-faint)] text-xs">
                      {new Date(msg.createdAt).toLocaleString("pt-BR")}
                    </span>

                  </div>

                  {msg.statusAlterado && (

                    <div
                      className="
                        mt-2
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-full
                        bg-sky-500/15
                        border
                        border-sky-500/30
                        px-3
                        py-1
                        text-xs
                        font-semibold
                        text-sky-300
                      "
                    >
                      Classificou como {msg.statusAlterado}
                    </div>

                  )}

                  {msg.texto && (
                    <p className="mt-2 text-[var(--text-1)] whitespace-pre-wrap">
                      {msg.texto}
                    </p>
                  )}

                  {msg.anexoDados && (

                    <a
                      href={msg.anexoDados}
                      download={msg.anexoNome}
                      className="
                        mt-3
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        border
                        border-[var(--border-token)]
                        bg-[var(--surface-inset)]
                        px-4
                        py-3
                        text-sm
                        text-emerald-300
                        hover:bg-[var(--surface-inset)]
                        transition
                      "
                    >

                      {msg.anexoTipo?.startsWith("image/") ? (

                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={msg.anexoDados}
                          alt={msg.anexoNome}
                          className="w-12 h-12 rounded-lg object-cover"
                        />

                      ) : (

                        <Download size={18} className="shrink-0" />

                      )}

                      <span className="truncate">
                        {msg.anexoNome}
                      </span>

                    </a>

                  )}

                </div>

              </div>

            );

          })

        )}

        <div ref={fimRef} />

      </div>

      <form onSubmit={enviar} className="space-y-4">

        {anexo && (

          <div
            className="
              flex
              items-center
              justify-between
              rounded-xl
              border
              border-[var(--border-token)]
              bg-[var(--surface-2)]
              px-4
              py-3
            "
          >

            <span className="text-sm text-[var(--text-muted)] truncate">
              📎 {anexo.nome} ({formatarTamanho(anexo.dados)})
            </span>

            <button
              type="button"
              onClick={() => {
                setAnexo(null);
                if (inputArquivoRef.current) {
                  inputArquivoRef.current.value = "";
                }
                if (inputCameraRef.current) {
                  inputCameraRef.current.value = "";
                }
              }}
              className="text-[var(--text-subtle)] hover:text-red-400 transition"
            >
              <X size={18} />
            </button>

          </div>

        )}

        <textarea
          rows={3}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escreva uma mensagem..."
          className="
            w-full
            rounded-2xl
            border
            border-[var(--border-token)]
            bg-[var(--surface-2)]
            px-5
            py-4
            text-[var(--text)]
            placeholder:text-[var(--text-faint)]
            outline-none
            focus:border-emerald-500
            resize-none
          "
        />

        <div className="flex items-center justify-between flex-wrap gap-3">

          <div className="flex items-center gap-3 flex-wrap">

            <button
              type="button"
              onClick={abrirCamera}
              title="Tirar foto"
              className="
                flex
                items-center
                justify-center
                rounded-xl
                border
                border-[var(--border-token)]
                bg-[var(--surface-2)]
                px-4
                py-3
                text-[var(--text-muted)]
                hover:bg-[var(--surface-3)]
                transition
              "
            >
              <Camera size={16} />
            </button>

            <button
              type="button"
              onClick={() => inputArquivoRef.current?.click()}
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-[var(--border-token)]
                bg-[var(--surface-2)]
                px-4
                py-3
                text-sm
                text-[var(--text-muted)]
                hover:bg-[var(--surface-3)]
                transition
              "
            >
              <Paperclip size={16} />
              Anexar arquivo
            </button>

            <input
              ref={inputCameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={selecionarArquivo}
              className="hidden"
            />

            <input
              ref={inputArquivoRef}
              type="file"
              onChange={selecionarArquivo}
              className="hidden"
            />

            <CameraCapture
              aberto={cameraAberta}
              onFechar={() => setCameraAberta(false)}
              onCapturar={aoCapturarFoto}
            />

            {podeClassificar && (

              <select
                value={novoStatus}
                onChange={(e) => setNovoStatus(e.target.value)}
                className="
                  rounded-xl
                  border
                  border-[var(--border-token)]
                  bg-[var(--surface-2)]
                  px-4
                  py-3
                  text-sm
                  text-[var(--text)]
                  outline-none
                  focus:border-emerald-500
                "
              >

                <option value="">
                  Classificar como...
                </option>

                {STATUS_OPCOES.map((status) => (

                  <option
                    key={status}
                    value={status}
                    disabled={status === statusAtual}
                  >
                    {status}
                  </option>

                ))}

              </select>

            )}

          </div>

          <button
            type="submit"
            disabled={enviando || (!texto.trim() && !anexo && !novoStatus)}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-emerald-600
              hover:bg-emerald-700
              disabled:opacity-40
              disabled:cursor-not-allowed
              px-6
              py-3
              text-sm
              font-semibold
              text-[var(--text)]
              transition
            "
          >
            <Send size={16} />
            {enviando ? "Enviando..." : "Enviar"}
          </button>

        </div>

      </form>

    </div>

  );

}
