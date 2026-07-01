"use client";

import Button from "../ui/Button";

export default function QuickActions() {
  return (
    <div className="space-y-3">

      <Button className="w-full">
        + Nova Unidade
      </Button>

      <Button className="w-full">
        + Novo Inquilino
      </Button>

      <Button className="w-full">
        + Novo Contrato
      </Button>

      <Button className="w-full">
        + Nova Solicitação
      </Button>

    </div>
  );
}