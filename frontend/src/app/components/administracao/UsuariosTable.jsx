"use client";

import { useRouter } from "next/navigation";

import Badge from "../ui/Badge";
import Table from "../ui/Table";

import UsuariosActionsMenu from "./UsuariosActionsMenu";

export default function UsuariosTable({

  usuarios,

  onEditar,

  onExcluir,

  onEnviarAcesso,

  onRedefinirSenha,

  onAlterarStatus,

}) {

  const router = useRouter();

  const columns = [

    {
      key: "nome",
      title: "Nome",
    },

    {
      key: "email",
      title: "E-mail",
    },

    {
      key: "perfil",
      title: "Perfil",

      render: (usuario) =>
        usuario.perfil?.nome || "—",
    },

    {
      key: "status",
      title: "Status",

      render: (usuario) => (

        <Badge
          variant={
            usuario.ativo
              ? "emerald"
              : "red"
          }
        >

          {usuario.ativo
            ? "ATIVO"
            : "INATIVO"}

        </Badge>

      ),

    },

    {
      key: "ultimoAcesso",
      title: "Último Acesso",

      render: (usuario) =>

        usuario.ultimoAcesso ||

        "Nunca acessou",

    },

    {

      key: "acoes",

      title: "",

      render: (usuario) => (

        <UsuariosActionsMenu

          usuario={usuario}

          onEditar={onEditar}

          onExcluir={onExcluir}

          onEnviarAcesso={onEnviarAcesso}

          onRedefinirSenha={onRedefinirSenha}

          onAlterarStatus={onAlterarStatus}

        />

      ),

    },

  ];

  return (

    <Table

      columns={columns}

      data={usuarios}

      emptyMessage="Nenhum usuário encontrado."

      onRowClick={(usuario)=>{

        router.push(

          `/administracao/usuarios/${usuario.id}`

        );

      }}

    />

  );

}