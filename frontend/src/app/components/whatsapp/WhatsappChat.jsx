"use client";

import { useEffect, useRef, useState } from "react";

import { WhatsappService } from "../../../services/whatsapp.service";
import { usePermissao } from "../../../hooks/usePermissao";

import {
  Bot,
  User,
  SendHorizontal,
} from "lucide-react";

export default function WhatsappChat({ conversa }) {

  const podeEnviar = usePermissao("whatsapp.enviar");

  const [texto, setTexto] = useState("");

  const [enviando, setEnviando] = useState(false);

  const [mensagens, setMensagens] = useState([]);

  const fimRef = useRef(null);

  useEffect(() => {

    setMensagens(conversa?.mensagens || []);

  }, [conversa]);

  useEffect(() => {

    fimRef.current?.scrollIntoView({

      behavior: "smooth",

    });

  }, [mensagens]);

  async function enviarMensagem() {

    if (!texto.trim()) return;

    const novaMensagem = {

      id: Date.now(),

      tipo: "enviada",

      texto,

      hora: new Date().toLocaleTimeString("pt-BR", {

        hour: "2-digit",

        minute: "2-digit",

      }),

    };

    setMensagens((old) => [

      ...old,

      novaMensagem,

    ]);

    const mensagem = texto;

    setTexto("");

    try {

      setEnviando(true);

      await WhatsappService.enviar({

        numero: conversa.numero,

        mensagem,

      });

    } catch (error) {

      console.error(error);

      alert("Erro ao enviar.");

    } finally {

      setEnviando(false);

    }

  }

  function handleKeyDown(e) {

    if (e.key === "Enter" && !e.shiftKey) {

      e.preventDefault();

      enviarMensagem();

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

              flex

              ${msg.tipo === "enviada"

                ? "justify-end"

                : "justify-start"}

            `}

          >

            <div
              className={`

                flex

                gap-3

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

                {msg.texto}

                <div
                  className="
                    mt-2
                    text-right
                    text-xs
                    text-[var(--text)]
                  "
                >

                  {msg.hora}

                </div>

              </div>

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

        <div
          className="
            flex
            items-center
            gap-4
          "
        >

          <input

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