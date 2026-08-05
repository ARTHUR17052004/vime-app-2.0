"use client";

import PageHeader from "../ui/PageHeader";
import Button from "../ui/Button";

import {
  UserPlus,
} from "lucide-react";

export default function UsuariosHeader({

  totalUsuarios = 0,

  onNovoUsuario,

}) {

  return (

    <PageHeader

      title="Usuários"

      subtitle="Gerencie todos os usuários do sistema."

      count={totalUsuarios}

      countLabel="usuário(s) cadastrado(s)"

      actions={

        <Button onClick={onNovoUsuario}>

          <UserPlus size={18} />

          Novo Usuário

        </Button>

      }

    />

  );

}