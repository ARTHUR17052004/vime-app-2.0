"use client";

import { FileCheck2, UserPlus } from "lucide-react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";

export default function ExplicacaoInquilinoModal({
  isOpen,
  onClose,
  onEscolherNovo,
  onEscolherAdicionar,
}) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Qual opção usar?"
      subtitle="As duas cadastram o inquilino — a diferença é o que acontece depois."
      size="lg"
    >

      <div className="grid md:grid-cols-2 gap-5">

        <div
          className="
            rounded-2xl
            border
            border-emerald-500/20
            bg-emerald-500/10
            p-6
          "
        >
          <div className="flex items-center gap-3 mb-3">
            <FileCheck2 size={22} className="text-emerald-400" />
            <h3 className="font-bold text-[var(--text)]">
              Novo Inquilino
            </h3>
          </div>

          <p className="text-sm text-emerald-100/80">
            Cadastra o inquilino <strong>e</strong> gera o contrato automaticamente,
            enviando pra assinatura na Clicksign. Use quando é uma locação de verdade
            começando agora.
          </p>

          <Button
            className="w-full mt-5"
            onClick={onEscolherNovo}
          >
            Continuar com Novo Inquilino
          </Button>
        </div>

        <div
          className="
            rounded-2xl
            border
            border-[var(--border-token)]
            bg-[var(--surface-2)]
            p-6
          "
        >
          <div className="flex items-center gap-3 mb-3">
            <UserPlus size={22} className="text-[var(--text-muted)]" />
            <h3 className="font-bold text-[var(--text)]">
              Adicionar Inquilino
            </h3>
          </div>

          <p className="text-sm text-[var(--text-subtle)]">
            Só cadastra os dados da pessoa, <strong>sem</strong> gerar contrato nem
            mandar nada pra assinatura. Use pra registrar alguém sem iniciar uma
            locação agora (ex: cadastro prévio, histórico).
          </p>

          <Button
            variant="secondary"
            className="w-full mt-5"
            onClick={onEscolherAdicionar}
          >
            Continuar com Adicionar Inquilino
          </Button>
        </div>

      </div>

    </Modal>
  );
}
