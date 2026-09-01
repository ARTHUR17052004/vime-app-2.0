"use client";

import { useRouter } from "next/navigation";
import { Trash2, MessageCircle } from "lucide-react";

import Badge from "../ui/Badge";
import { usePermissao } from "@/hooks/usePermissao";

const STATUS_CONFIG = {
  ABERTO: { badge: "gray", borda: "border-[var(--border-token)]", rotulo: "Aberto" },
  EM_ANDAMENTO: { badge: "blue", borda: "border-sky-500/40", rotulo: "Em Andamento" },
  RESOLVIDO: { badge: "emerald", borda: "border-emerald-500/40", rotulo: "Resolvido" },
  FECHADO: { badge: "gray", borda: "border-[var(--border-token)]", rotulo: "Fechado" },
};

const CRITICIDADE_COR = {
  Baixa: "gray",
  Média: "yellow",
  Alta: "yellow",
  Urgente: "red",
};

export default function ChamadoCard({
  chamados,
  onDelete,
}) {

  const router = useRouter();

  const podeExcluir = usePermissao("suporte.excluir");

  if (chamados.length === 0) {
    return (
      <div
        className="
          rounded-3xl
          border
          border-[var(--border-token)]
          bg-[var(--surface)]
          backdrop-blur-xl
          p-10
          text-center
        "
      >
        <p className="text-[var(--text-subtle)]">
          Nenhum chamado encontrado.
        </p>
      </div>
    );
  }

  return (

    <div className="space-y-4">

      {chamados.map((item) => {

        const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.ABERTO;

        return (

          <div
            key={item.id}
            onClick={() => router.push(`/suporte/${item.id}`)}
            className={`
              rounded-2xl
              border
              ${config.borda}
              bg-[var(--surface)]
              backdrop-blur-xl
              p-6
              cursor-pointer
              transition-all
              duration-300
              hover:-translate-y-0.5
            `}
          >

            <div className="flex items-start justify-between gap-6 flex-wrap">

              <div className="flex-1 min-w-[280px] grid sm:grid-cols-2 xl:grid-cols-5 gap-5">

                <div>
                  <p className="text-xs text-[var(--text-faint)] uppercase tracking-wide">
                    {item.numero}
                  </p>
                  <p className="text-[var(--text)] font-semibold mt-1">
                    {item.titulo}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[var(--text-faint)] uppercase tracking-wide">
                    Aberto por
                  </p>
                  <p className="text-[var(--text)] mt-1 text-sm">
                    {item.criadoPorNome || "-"}
                  </p>
                  <p className="text-[var(--text-faint)] text-xs mt-0.5">
                    {new Date(item.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>

                <div className="xl:col-span-2">
                  <p className="text-xs text-[var(--text-faint)] uppercase tracking-wide">
                    Descrição
                  </p>
                  <p className="text-[var(--text-muted)] mt-1 text-sm line-clamp-2">
                    {item.descricao || "Sem descrição."}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">

                  <Badge variant={config.badge}>
                    {config.rotulo}
                  </Badge>

                  {item.criticidade && (
                    <Badge variant={CRITICIDADE_COR[item.criticidade] || "gray"}>
                      {item.criticidade}
                    </Badge>
                  )}

                </div>

              </div>

              <div className="flex items-center gap-2 shrink-0">

                <MessageCircle size={18} className="text-[var(--text-faint)]" />

                {podeExcluir && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="
                      w-10
                      h-10
                      rounded-xl
                      bg-[var(--surface-2)]
                      hover:bg-red-500/10
                      flex
                      items-center
                      justify-center
                      transition
                    "
                  >
                    <Trash2 size={17} className="text-red-400" />
                  </button>
                )}

              </div>

            </div>

          </div>

        );

      })}

    </div>

  );

}
