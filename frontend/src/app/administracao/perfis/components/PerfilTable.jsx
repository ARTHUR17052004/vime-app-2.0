"use client";

import { useState } from "react";

import {

  MoreVertical,
  Pencil,
  Trash2,
  UserCheck,
  UserX,

} from "lucide-react";

import Badge from "../../../components/ui/Badge";
import Table from "../../../components/ui/Table";
import ActionMenu from "../../../components/ui/ActionMenu";

export default function PerfilTable({

  perfis,

  onEditar,

  onExcluir,

  onStatus,

}) {

  const columns = [

    {

      key: "nome",

      title: "Perfil",

    },

    {

      key: "descricao",

      title: "Descrição",

      render: (perfil) =>

        perfil.descricao || "-",

    },

    {

      key: "usuarios",

      title: "Usuários",

      render: (perfil) =>

        perfil._count?.usuarios || 0,

    },

    {

      key: "status",

      title: "Status",

      render: (perfil) => (

        <Badge

          variant={

            perfil.ativo

              ? "emerald"

              : "red"

          }

        >

          {perfil.ativo

            ? "ATIVO"

            : "INATIVO"}

        </Badge>

      ),

    },

    {

      key: "acoes",

      title: "",

      render: (perfil) => (

        <Actions

          perfil={perfil}

          onEditar={onEditar}

          onExcluir={onExcluir}

          onStatus={onStatus}

        />

      ),

    },

  ];

  return (

    <Table

      columns={columns}

      data={perfis}

      emptyMessage="Nenhum perfil encontrado."

    />

  );

}

function Actions({

  perfil,

  onEditar,

  onExcluir,

  onStatus,

}) {

  const [open, setOpen] = useState(false);

  const [position, setPosition] = useState({

    top: 0,

    left: 0,

  });

  function abrir(e) {

    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();

    setPosition({

      top: rect.bottom + 8,

      left: rect.right - 220,

    });

    setOpen(true);

  }

  return (

    <>

      <button

        onClick={(e)=>{

          open

            ? setOpen(false)

            : abrir(e);

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

        "

      >

        <MoreVertical

          size={18}

          className="text-gray-300"

        />

      </button>

      <ActionMenu

        open={open}

        position={position}

        onClose={()=>setOpen(false)}

      >

        <MenuButton

          icon={<Pencil size={18}/>}

          label="Editar"

          onClick={()=>{

            onEditar(perfil);

            setOpen(false);

          }}

        />

        <MenuButton

          icon={

            perfil.ativo

            ? <UserX size={18}/>

            : <UserCheck size={18}/>

          }

          label={

            perfil.ativo

            ? "Inativar"

            : "Ativar"

          }

          onClick={()=>{

            onStatus(perfil);

            setOpen(false);

          }}

        />

        <MenuButton

          danger

          icon={<Trash2 size={18}/>}

          label="Excluir"

          onClick={()=>{

            onExcluir(perfil.id);

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

      onClick={onClick}

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

            ? "text-red-400 hover:bg-red-500/10"

            : "text-gray-300 hover:bg-white/5"

        }

      `}

    >

      {icon}

      {label}

    </button>

  );

}