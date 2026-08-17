"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {

  MoreVertical,

  Eye,

  Pencil,

  Mail,

  KeyRound,

  UserCheck,

  UserX,

  Trash2,

} from "lucide-react";

import ActionMenu from "../ui/ActionMenu";

export default function UsuariosActionsMenu({

  usuario,

  onEditar,

  onExcluir,

  onEnviarAcesso,

  onRedefinirSenha,

  onAlterarStatus,

}) {

  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [position, setPosition] = useState({

    top: 0,

    left: 0,

  });

  function abrirMenu(e) {

    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();

    const larguraMenu = 240;

    let left = rect.right - larguraMenu;

    let top = rect.bottom + 8;

    if (left < 16) {

      left = 16;

    }

    if (left + larguraMenu > window.innerWidth - 16) {

      left = window.innerWidth - larguraMenu - 16;

    }

    setPosition({

      top,

      left,

    });

    setOpen(true);

  }

  return (

    <>

      <button

        onClick={(e) => {

          e.preventDefault();
          e.stopPropagation();

          if (open) {

            setOpen(false);
            return;

          }

          abrirMenu(e);

        }}

        className="
          flex
          items-center
          justify-center

          w-10
          h-10

          rounded-xl

          bg-[var(--surface-2)]

          hover:bg-[var(--surface-3)]

          transition-all
        "

      >

        <MoreVertical

          size={18}

          className="text-[var(--text-muted)]"

        />

      </button>

      <ActionMenu

        open={open}

        position={position}

        onClose={() => setOpen(false)}

      >

        <MenuButton

          icon={<Eye size={18} />}

          label="Visualizar"

          onClick={() => {

            router.push(

              `/administracao/usuarios/${usuario.id}`

            );

            setOpen(false);

          }}

        />

        <MenuButton
          icon={<Pencil size={18} />}
          label="Editar"
          onClick={() => {

            console.log("EDITAR CLICADO", usuario);

            onEditar?.(usuario);

            setOpen(false);

          }}
        />

        <MenuButton

          icon={<Mail size={18} />}

          label="Enviar acesso"

          onClick={() => {

            onEnviarAcesso?.(usuario);

            setOpen(false);

          }}

        />

        <MenuButton

          icon={<KeyRound size={18} />}

          label="Redefinir senha"

          onClick={() => {

            onRedefinirSenha?.(usuario);

            setOpen(false);

          }}

        />

        <MenuButton

          icon={

            usuario.ativo

              ? <UserX size={18} />

              : <UserCheck size={18} />

          }

          label={

            usuario.ativo

              ? "Inativar"

              : "Ativar"

          }

          onClick={() => {

            onAlterarStatus?.(usuario);

            setOpen(false);

          }}

        />

        <MenuButton

          danger

          icon={<Trash2 size={18} />}

          label="Excluir"

          onClick={() => {

            onExcluir?.(usuario.id);

            setOpen(false);

          }}

        />

      </ActionMenu>

    </>

  );

}

function MenuButton({

  icon,

  label,

  danger,

  onClick,

}) {

  return (

    <button

      type="button"

      onClick={(e) => {

        e.preventDefault();

        e.stopPropagation();

        onClick?.();

      }}

      className={`
        flex
        items-center
        gap-3
        w-full
        px-5
        py-3
        transition

        ${
          danger
            ? `
              text-red-400
              hover:bg-red-500/10
            `
            : `
              text-[var(--text-muted)]
              hover:bg-[var(--surface-2)]
            `
        }
      `}
    >

      {icon}

      {label}

    </button>

  );

}