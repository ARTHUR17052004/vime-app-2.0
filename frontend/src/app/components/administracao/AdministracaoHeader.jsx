"use client";

import PageHeader from "../ui/PageHeader";
import Button from "../ui/Button";

import {
  UserPlus,
} from "lucide-react";

export default function AdministracaoHeader({
  totalUsuarios = 0,
  onNovoUsuario,
}) {
  return (
    <PageHeader
      title="Administração"
      subtitle="Centro de Controle do VIME."
      count={totalUsuarios}
      countLabel="usuário(s)"
      actions={
        <Button onClick={onNovoUsuario}>
          <UserPlus size={18} />
          Novo Usuário
        </Button>
      }
    />
  );
}