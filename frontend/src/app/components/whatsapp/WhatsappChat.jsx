"use client";

import { useEffect, useRef, useState } from "react";

import { WhatsappService } from "../../../services/whatsapp.service";
import { usePermissao } from "../../../hooks/usePermissao";

import {
  Bot,
  User,
  SendHorizontal,
  Check,
  CheckCheck,
  AlertTriangle,
  Reply,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

// "controle se o inquilino recebeu ou não" -- status de entrega real,
// vindo do webhook de status da Meta (ver whatsappService.processarStatus
// no backend). Mensagem antiga, de antes dessa função existir, não tem
// status salvo -- cai no "enviada" (não dá pra saber mais que isso).
function StatusEntrega({ status, erroDetalhe }) {

  if (status === "falhou") {
    return (
      <span title={erroDetalhe || "Falha no envio."} className="inline-flex items-center gap-1 text-red-300">
        <AlertTriangle size={14} />
        Não entregue
      </span>
    );
  }

  if (status === "lida") {
    return <CheckCheck size={14} className="text-sky-300" />;
  }

  if (status === "entregue") {
    return <CheckCheck size={14} className="text-[var(--text)]/70" />;
  }

  return <Check size={14} className="text-[var(--text)]/70" />;

}

export default function WhatsappChat({ conversa }) {

  const podeEnviar = usePermissao("whatsapp.enviar");

  const [texto, setTexto] = useState("");

  const [enviando, setEnviando] = useState(false);

  const [mensagens, setMensagens] = useState([]);

  // Respondendo (citação de verdade, via Meta) ou editando (só conserta
  // o nosso histórico) -- os dois usam o mesmo campo de texto embaixo,
  // nunca os dois ao mesmo tempo.
  const [respondendoA, setRespondendoA] = useState(null);

  const [editando, setEditando] = useState(null);

  const fimRef = useRef(null);

  const inputRef = useRef(null);

  useEffect(() => {

    setMensagens(conversa?.mensagens || []);

    setRespondendoA(null);

    setEditando(null);

    setTexto("");

  }, [conversa]);

  useEffect(() => {

    fimRef.current?.scrollIntoView({

      behavior: "smooth",

    });

  }, [mensagens]);

  function cancelarAcao() {

    setRespondendoA(null);

    setEditando(null);

    setTexto("");

  }

  function iniciarResposta(msg) {

    setEditando(null);

    setRespondendoA(msg);

    inputRef.current?.focus();

  }

  function iniciarEdicao(msg) {

    setRespondendoA(null);

    setEditando(msg);

    setTexto(msg.texto);

    inputRef.current?.focus();

  }

  async function apagarMensagem(msg) {

    if (!confirm("Apagar essa mensagem? Some só do nosso histórico, não desfaz o que já chegou no WhatsApp de quem recebeu.")) {
      return;
    }

    try {

      await WhatsappService.excluirMensagem(msg.id);

      setMensagens((old) => old.filter((m) => m.id !== msg.id));

      if (respondendoA?.id === msg.id) setRespondendoA(null);
      if (editando?.id === msg.id) cancelarAcao();

    } catch (error) {

      alert(error.message || "Erro ao apagar mensagem.");

    }

  }

  async function enviarMensagem() {

    if (!texto.trim()) return;

    // Editar não manda nada pro WhatsApp -- só corrige o texto salvo
    // aqui (a Meta não deixa editar mensagem já entregue de verdade).
    if (editando) {

      const textoEditado = texto;

      try {

        setEnviando(true);

        await WhatsappService.editarMensagem(editando.id, textoEditado);

        setMensagens((old) =>
          old.map((m) =>
            m.id === editando.id ? { ...m, texto: textoEditado, editada: true } : m
          )
        );

        cancelarAcao();

      } catch (error) {

        alert(error.message || "Erro ao editar mensagem.");

      } finally {

        setEnviando(false);

      }

      return;

    }

    const mensagem = texto;

    const idTemporario = `temp-${Date.now()}`;

    const respostaDe = respondendoA;

    const novaMensagem = {

      id: idTemporario,

      tipo: "enviada",

      texto: mensagem,

      status: "enviada",

      respostaDeTexto: respostaDe?.texto || null,

      hora: new Date().toLocaleTimeString("pt-BR", {

        hour: "2-digit",

        minute: "2-digit",

      }),

    };

    setMensagens((old) => [

      ...old,

      novaMensagem,

    ]);

    setTexto("");
    setRespondendoA(null);

    try {

      setEnviando(true);

      const resposta = await WhatsappService.enviar({

        numero: conversa.numero,
        conversaId: conversa.id,
        mensagem,
        respostaA: respostaDe?.mensagemIdMeta || null,
        respostaDeId: respostaDe?.id || null,

      });

      const criada = resposta.data?.mensagem;

      if (criada) {

        setMensagens((old) =>
          old.map((m) =>
            m.id === idTemporario
              ? {
                  ...m,
                  id: criada.id,
                  mensagemIdMeta: criada.mensagemIdMeta,
                  hora: new Date(criada.createdAt).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                }
              : m
          )
        );

      }

    } catch (error) {

      console.error(error);

      alert("Erro ao enviar.");

      setMensagens((old) => old.filter((m) => m.id !== idTemporario));

    } finally {

      setEnviando(false);

    }

  }

  function handleKeyDown(e) {

    if (e.key === "Enter" && !e.shiftKey) {

      e.preventDefault();

      enviarMensagem();

    }

    if (e.key === "Escape" && (editando || respondendoA)) {
      cancelarAcao();
    }

  }

  if (!conversa) {

    return (

      <div
        className="
          rounded-3xl
          border
          border-[var(--border-token)]
          bg-[#101827]
          h-[650px]
          flex
          items-center
          justify-center
          text-[var(--text-subtle)]
        "
      >

        Selecione uma conversa.

      </div>

    );

  }

  return (

    <div
      className="
        rounded-3xl
        border
        border-[var(--border-token)]
        bg-[#101827]
        shadow-xl
        h-[650px]
        flex
        flex-col
      "
    >

      <div
        className="
          p-6
          border-b
          border-[var(--border-token)]
          flex
          items-center
          gap-4
        "
      >

        <div
          className="
            h-12
            w-12
            rounded-full
            bg-green-600
            flex
            items-center
            justify-center
            text-[var(--text)]
            font-bold
          "
        >

          {conversa.nome?.charAt(0)}

        </div>

        <div>

          <h2 className="text-xl font-bold text-[var(--text)]">

            {conversa.nome}

          </h2>

          <p className="text-sm text-[var(--text-subtle)]">

            {conversa.numero}

          </p>

        </div>

      </div>

      <div
        className="
          flex-1
          overflow-y-auto
          p-6
          space-y-5
        "
      >

        {mensagens.map((msg) => (

          <div

            key={msg.id}

            className={`

              group
              flex

              ${msg.tipo === "enviada"

                ? "justify-end"

                : "justify-start"}

            `}

          >

            <div
              className={`

                flex

                items-center
                gap-2

                ${msg.tipo === "enviada"

                  ? "flex-row-reverse"

                  : ""}

              `}
            >

              <div
                className={`

                  h-10

                  w-10

                  rounded-full

                  flex

                  items-center

                  justify-center
                  shrink-0

                  ${msg.tipo === "enviada"

                    ? "bg-blue-600"

                    : "bg-green-600"}

                `}
              >

                {msg.tipo === "enviada"

                  ? <User size={18} className="text-[var(--text)]"/>

                  : <Bot size={18} className="text-[var(--text)]"/>}

              </div>

              <div
                className={`

                  max-w-md

                  rounded-2xl

                  px-5

                  py-4

                  text-[var(--text)]

                  ${msg.tipo === "enviada"

                    ? "bg-blue-600"

                    : "bg-green-600"}

                `}
              >

                {msg.respostaDeTexto && (
                  <div className="mb-2 rounded-lg border-l-2 border-[var(--text)]/50 bg-black/15 px-3 py-1.5 text-sm text-[var(--text)]/80 truncate">
                    {msg.respostaDeTexto}
                  </div>
                )}

                {msg.texto}

                <div
                  className="
                    mt-2
                    flex
                    items-center
                    justify-end
                    gap-1.5
                    text-right
                    text-xs
                    text-[var(--text)]
                  "
                >

                  {msg.editada && <span className="text-[var(--text)]/60">editada</span>}

                  {msg.hora}

                  {msg.tipo === "enviada" && (
                    <StatusEntrega status={msg.status} erroDetalhe={msg.erroDetalhe} />
                  )}

                </div>

              </div>

              {podeEnviar && !String(msg.id).startsWith("temp-") && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">

                  <button
                    type="button"
                    title="Responder"
                    onClick={() => iniciarResposta(msg)}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-[var(--text-faint)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                  >
                    <Reply size={14} />
                  </button>

                  {msg.tipo === "enviada" && (
                    <button
                      type="button"
                      title="Editar"
                      onClick={() => iniciarEdicao(msg)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-[var(--text-faint)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                    >
                      <Pencil size={14} />
                    </button>
                  )}

                  <button
                    type="button"
                    title="Apagar"
                    onClick={() => apagarMensagem(msg)}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-[var(--text-faint)] hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>

                </div>
              )}

            </div>

          </div>

        ))}

        <div ref={fimRef} />

      </div>

      <div
        className="
          border-t
          border-[var(--border-token)]
          p-5
        "
      >

        {(respondendoA || editando) && (

          <div className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-[var(--surface-2)] px-4 py-2.5">

            <div className="min-w-0">
              <p className="text-xs font-semibold text-emerald-400">
                {editando ? "Editando mensagem" : `Respondendo a ${conversa.nome}`}
              </p>
              <p className="text-sm text-[var(--text-subtle)] truncate">
                {editando ? editando.texto : respondendoA.texto}
              </p>
            </div>

            <button
              type="button"
              onClick={cancelarAcao}
              className="shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-[var(--text-faint)] hover:bg-[var(--surface-3)] hover:text-[var(--text)]"
            >
              <X size={16} />
            </button>

          </div>

        )}

        <div
          className="
            flex
            items-center
            gap-4
          "
        >

          <input

            ref={inputRef}

            value={texto}

            onChange={(e)=>setTexto(e.target.value)}

            onKeyDown={handleKeyDown}

            placeholder={
              podeEnviar
                ? "Digite uma mensagem..."
                : "Você não tem permissão para enviar mensagens."
            }

            disabled={!podeEnviar}

            className="
              flex-1
              rounded-xl
              bg-[var(--surface-2)]
              px-5
              py-4
              text-[var(--text)]
              outline-none
              placeholder:text-[var(--text-faint)]
              disabled:opacity-50
            "

          />

          {podeEnviar && (
            <button

              onClick={enviarMensagem}

              disabled={enviando}

              className="
                h-14
                w-14
                rounded-xl
                bg-green-600
                flex
                items-center
                justify-center
                transition
                hover:bg-green-500
                disabled:opacity-50
              "

            >

              <SendHorizontal
                size={22}
                className="text-[var(--text)]"
              />

            </button>
          )}

        </div>

      </div>

    </div>

  );

}