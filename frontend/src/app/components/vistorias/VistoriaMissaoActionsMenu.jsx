"use client";

import { useState } from "react";
import { MoreVertical, Eye } from "lucide-react";

import ActionMenu from "../ui/ActionMenu";
import { usePermissao } from "../../../hooks/usePermissao";

// Só missões (vistoria "Geral") têm Editar/Excluir -- a última execução
// de uma vistoria normal é um campo dela mesma, não um registro à
// parte, então só dá pra ver.
export default function VistoriaMissaoActionsMenu({
  item,
  onVer,
  onEditar,
  onExcluir,
}) {

  const podeEditar = usePermissao("vistorias.editar");
  const podeExcluir = usePermissao("vistorias.excluir");

  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  function abrirMenu(e) {

    const rect = e.currentTarget.getBoundingClientRect();
    const largura = 200;

    let left = rect.right - largura;
    const top = rect.bottom + 8;

    if (left + largura > window.innerWidth - 16) {
      left = window.innerWidth - largura - 16;
    }

    if (left < 16) left = 16;

    setPosition({ top, left });
    setOpen(true);

  }

  const ehMissao = item.tipo === "missao";

  return (

    <div className="relative inline-block">

      <button
        onClick={(e) => {
          e.stopPropagation();
          if (open) { setOpen(false); return; }
          abrirMenu(e);
        }}
        className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[var(--surface-2)] transition"
      >
        <MoreVertical size={18} className="text-[var(--text-subtle)]" />
      </button>

      <ActionMenu open={open} position={position} onClose={() => setOpen(false)}>

        <button
          onClick={() => { onVer?.(item); setOpen(false); }}
          className="w-full flex items-center gap-2 text-left px-4 py-3 text-[var(--text-muted)] hover:bg-[var(--surface-2)] transition"
        >
          <Eye size={15} />
          Ver detalhes e imagens
        </button>

        {ehMissao && podeEditar && (
          <button
            onClick={() => { onEditar?.(item); setOpen(false); }}
            className="w-full text-left px-4 py-3 text-yellow-400 hover:bg-yellow-500/10 transition"
          >
            Editar
          </button>
        )}

        {ehMissao && podeExcluir && (
          <button
            onClick={() => { onExcluir?.(item); setOpen(false); }}
            className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 transition"
          >
            Excluir
          </button>
        )}

      </ActionMenu>

    </div>

  );

}
