"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  MessageSquare,
  Tag,
} from "lucide-react";

import Badge from "../ui/Badge";
import ActionMenu from "../ui/ActionMenu";
import SolicitacaoRespostaRapidaModal from "./SolicitacaoRespostaRapidaModal";
import { usePermissao } from "@/hooks/usePermissao";

const STATUS_CONFIG = {
  SOLICITADA: {
    badge: "gray",
    borda: "border-white/15",
  },
  "EM COTAÇÃO": {
    badge: "yellow",
    borda: "border-yellow-500/40",
  },
  "AGUARDANDO COMPRA": {
    badge: "blue",
    borda: "border-sky-500/40",
  },
  ATENDIDA: {
    badge: "emerald",
    borda: "border-emerald-500/40",
  },
  REJEITADA: {
    badge: "red",
    borda: "border-red-500/40",
  },
};

export default function SolicitacaoCard({
  solicitacoes,
  onEdit,
  onDelete,
  onAtualizado,
}) {

  const router = useRouter();

  const podeClassificar = usePermissao("solicitacoes.classificar");

  const [menuAberto, setMenuAberto] = useState(null);

  const [posicaoMenu, setPosicaoMenu] = useState({ top: 0, left: 0 });

  const [respondendo, setRespondendo] = useState(null);

  function abrirMenu(e, id) {

    const rect = e.currentTarget.getBoundingClientRect();

    const larguraMenu = 200;

    let left = rect.right - larguraMenu;
    let top = rect.bottom + 8;

    if (left + larguraMenu > window.innerWidth - 16) {
      left = window.innerWidth - larguraMenu - 16;
    }

    if (left < 16) left = 16;

    setPosicaoMenu({ top, left });

    setMenuAberto(id);

  }

  if (solicitacoes.length === 0) {
    return (
      <div
        className="
          rounded-3xl
          border
          border-white/10
          bg-gradient-to-br
          from-[#202a36]/95
          via-[#1b2430]/96
          to-[#151c25]/96
          backdrop-blur-xl
          p-10
          text-center
        "
      >
        <p className="text-gray-400">
          Nenhuma solicitação encontrada.
        </p>
      </div>
    );
  }

  return (

    <div className="space-y-4">

      {solicitacoes.map((item) => {

        const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.SOLICITADA;

        return (

          <div
            key={item.id}
            className={`
              rounded-2xl
              border
              ${config.borda}
              bg-gradient-to-br
              from-[#202a36]/95
              via-[#1b2430]/96
              to-[#151c25]/96
              backdrop-blur-xl
              p-6
              transition-all
              duration-300
              hover:-translate-y-0.5
            `}
          >

            <div className="flex items-start justify-between gap-6 flex-wrap">

              <div className="flex-1 min-w-[280px] grid sm:grid-cols-2 xl:grid-cols-5 gap-5">

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Data
                  </p>
                  <p className="text-white mt-1 text-sm">
                    {item.data
                      ? new Date(item.data).toLocaleDateString("pt-BR")
                      : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {item.numero}
                  </p>
                  <p className="text-white font-semibold mt-1">
                    {item.titulo}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Criado por
                  </p>
                  <p className="text-white mt-1 text-sm">
                    {item.criadoPorNome || "-"}
                  </p>
                  {item.criadoPorPerfil && (
                    <p className="text-gray-500 text-xs mt-0.5">
                      {item.criadoPorPerfil}
                    </p>
                  )}
                </div>

                <div className="xl:col-span-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Descrição
                  </p>
                  <p className="text-gray-300 mt-1 text-sm line-clamp-2">
                    {item.descricao || "Sem descrição."}
                  </p>
                </div>

                <div className="flex items-center gap-3">

                  <Badge variant={config.badge}>
                    {item.status}
                  </Badge>

                </div>

              </div>

              <button
                onClick={(e) => {

                  e.stopPropagation();

                  if (menuAberto === item.id) {
                    setMenuAberto(null);
                    return;
                  }

                  abrirMenu(e, item.id);

                }}
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-white/5
                  hover:bg-white/10
                  flex
                  items-center
                  justify-center
                  transition
                  shrink-0
                "
              >
                <MoreVertical size={18} className="text-gray-300" />
              </button>

              <ActionMenu
                open={menuAberto === item.id}
                position={posicaoMenu}
                onClose={() => setMenuAberto(null)}
              >

                <button
                  onClick={() => {
                    setMenuAberto(null);
                    router.push(`/solicitacoes/${item.id}`);
                  }}
                  className="
                    w-full
                    flex
                    items-center
                    gap-3
                    px-5
                    py-3
                    text-gray-300
                    hover:bg-white/5
                    transition
                  "
                >
                  <Eye size={17} />
                  Visualizar
                </button>

                <button
                  onClick={() => {
                    setMenuAberto(null);
                    setRespondendo(item);
                  }}
                  className="
                    w-full
                    flex
                    items-center
                    gap-3
                    px-5
                    py-3
                    text-blue-400
                    hover:bg-blue-500/10
                    transition
                  "
                >
                  <MessageSquare size={17} />
                  Responder
                </button>

                {podeClassificar && (

                  <button
                    onClick={() => {
                      setMenuAberto(null);
                      setRespondendo(item);
                    }}
                    className="
                      w-full
                      flex
                      items-center
                      gap-3
                      px-5
                      py-3
                      text-sky-400
                      hover:bg-sky-500/10
                      transition
                    "
                  >
                    <Tag size={17} />
                    Classificar
                  </button>

                )}

                <button
                  onClick={() => {
                    setMenuAberto(null);
                    onEdit(item);
                  }}
                  className="
                    w-full
                    flex
                    items-center
                    gap-3
                    px-5
                    py-3
                    text-yellow-400
                    hover:bg-yellow-500/10
                    transition
                  "
                >
                  <Pencil size={17} />
                  Editar
                </button>

                <button
                  onClick={() => {
                    setMenuAberto(null);
                    onDelete(item.id);
                  }}
                  className="
                    w-full
                    flex
                    items-center
                    gap-3
                    px-5
                    py-3
                    text-red-400
                    hover:bg-red-500/10
                    transition
                  "
                >
                  <Trash2 size={17} />
                  Excluir
                </button>

              </ActionMenu>

            </div>

          </div>

        );

      })}

      <SolicitacaoRespostaRapidaModal
        solicitacao={respondendo}
        onClose={() => setRespondendo(null)}
        onAtualizado={() => onAtualizado?.()}
      />

    </div>

  );

}
