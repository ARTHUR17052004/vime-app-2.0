"use client";

import { useMemo, useState } from "react";

import {
  Search,
  MessageCircle,
  Trash2,
} from "lucide-react";

import { usePermissao } from "../../../hooks/usePermissao";

export default function WhatsappConversations({

  conversas = [],

  conversaSelecionada,

  onSelecionar,

  onExcluir,

}) {

  const podeEnviar = usePermissao("whatsapp.enviar");

  const [pesquisa, setPesquisa] = useState("");

  const lista = useMemo(() => {

    return conversas.filter((conversa) => {

      const nome =
        conversa.nome?.toLowerCase() || "";

      return nome.includes(
        pesquisa.toLowerCase()
      );

    });

  }, [conversas, pesquisa]);

  return (

    <div
      className="
        rounded-3xl
        border
        border-[var(--border-token)]
        bg-[#101827]
        shadow-xl
        h-[650px]
        overflow-hidden
      "
    >

      <div className="p-6 border-b border-[var(--border-token)]">

        <h2 className="text-2xl font-bold text-[var(--text)]">

          Conversas

        </h2>

        <div
          className="
            mt-5
            flex
            items-center
            gap-3
            rounded-xl
            bg-[var(--surface-2)]
            px-4
            py-3
          "
        >

          <Search
            size={18}
            className="text-[var(--text-subtle)]"
          />

          <input

            value={pesquisa}

            onChange={(e) =>
              setPesquisa(e.target.value)
            }

            placeholder="Pesquisar conversa..."

            className="
              flex-1
              bg-transparent
              outline-none
              text-[var(--text)]
              placeholder:text-[var(--text-faint)]
            "

          />

        </div>

      </div>

      <div className="overflow-y-auto h-[520px]">

        {lista.length === 0 && (

          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              h-full
              text-center
              text-[var(--text-subtle)]
            "
          >

            <MessageCircle
              size={60}
              className="mb-5 text-green-500"
            />

            <p className="font-semibold">

              Nenhuma conversa encontrada

            </p>

            <p className="text-sm mt-2">

              Assim que o WhatsApp conectar,
              as conversas aparecerão aqui.

            </p>

          </div>

        )}

        {lista.map((conversa) => (

          <div key={conversa.id} className="relative group">

          <button

            onClick={() =>
              onSelecionar(conversa)
            }

            className={`
              w-full
              p-4
              border-b
              border-[var(--border-token)]
              transition-all
              hover:bg-[var(--surface-2)]
              text-left

              ${
                conversaSelecionada?.id ===
                conversa.id
                  ? "bg-green-600/20"
                  : ""
              }
            `}
          >

            <div className="flex items-center gap-4 pr-8">

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

                {conversa.nome
                  ?.charAt(0)
                  ?.toUpperCase()}

              </div>

              <div className="flex-1">

                <div className="flex justify-between">

                  <strong className="text-[var(--text)]">

                    {conversa.nome}

                  </strong>

                  <span className="text-xs text-[var(--text-subtle)]">

                    {conversa.horario}

                  </span>

                </div>

                <p
                  className="
                    text-sm
                    text-[var(--text-subtle)]
                    truncate
                  "
                >

                  {conversa.ultimaMensagem}

                </p>

              </div>

              {!!conversa.naoLidas && (

                <div
                  className="
                    h-6
                    min-w-[24px]
                    rounded-full
                    bg-green-600
                    flex
                    items-center
                    justify-center
                    text-xs
                    text-[var(--text)]
                    px-2
                  "
                >

                  {conversa.naoLidas}

                </div>

              )}

            </div>

          </button>

          {podeEnviar && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Excluir a conversa com ${conversa.nome}? Todo o histórico de mensagens dela some.`)) {
                  onExcluir?.(conversa.id);
                }
              }}
              title="Excluir conversa"
              className="
                absolute
                right-3
                top-4
                h-8
                w-8
                rounded-lg
                flex
                items-center
                justify-center
                text-[var(--text-faint)]
                opacity-0
                group-hover:opacity-100
                hover:bg-red-500/10
                hover:text-red-400
                transition
              "
            >
              <Trash2 size={16} />
            </button>
          )}

          </div>

        ))}

      </div>

    </div>

  );

}