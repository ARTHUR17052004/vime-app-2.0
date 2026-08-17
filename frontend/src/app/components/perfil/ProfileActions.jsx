"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Settings, LogOut } from "lucide-react";

import DashboardCard from "../dashboard/DashboardCard";
import Button from "../ui/Button";
import AlterarSenhaModal from "./AlterarSenhaModal";

import { useAuth } from "../../../context/AuthContext";

export default function ProfileActions() {
  const { logout } = useAuth();
  const router = useRouter();

  const [senhaModalOpen, setSenhaModalOpen] = useState(false);

  return (
    <>
    <DashboardCard>

      <div>

        <p
          className="
            text-xs
            uppercase
            tracking-[0.35em]
            text-emerald-400
            font-semibold
          "
        >
          Segurança
        </p>

        <h2
          className="
            mt-2
            text-2xl
            font-bold
            text-[var(--text)]
          "
        >
          Ações da Conta
        </h2>

      </div>

      <div className="mt-8 space-y-5">

        <button
          onClick={() => setSenhaModalOpen(true)}
          className="
            w-full

            flex
            items-center
            gap-4

            rounded-2xl

            border
            border-[var(--border-token)]

            bg-[var(--surface-2)]

            px-6
            py-5

            hover:bg-[var(--surface-3)]

            transition
          "
        >

          <KeyRound
            size={22}
            className="text-emerald-400"
          />

          <div className="text-left">

            <p className="font-semibold text-[var(--text)]">
              Alterar Senha
            </p>

            <p className="text-sm text-[var(--text-subtle)]">
              Atualize sua senha de acesso.
            </p>

          </div>

        </button>

        <button
          onClick={() => router.push("/configuracoes")}
          className="
            w-full

            flex
            items-center
            gap-4

            rounded-2xl

            border
            border-[var(--border-token)]

            bg-[var(--surface-2)]

            px-6
            py-5

            hover:bg-[var(--surface-3)]

            transition
          "
        >

          <Settings
            size={22}
            className="text-emerald-400"
          />

          <div className="text-left">

            <p className="font-semibold text-[var(--text)]">
              Configurações
            </p>

            <p className="text-sm text-[var(--text-subtle)]">
              Preferências do sistema.
            </p>

          </div>

        </button>

        <Button
          onClick={logout}
          className="
            w-full

            flex
            items-center
            justify-center

            gap-3

            mt-6
          "
        >

          <LogOut size={18} />

          Sair do Sistema

        </Button>

      </div>

    </DashboardCard>

    <AlterarSenhaModal
      isOpen={senhaModalOpen}
      onClose={() => setSenhaModalOpen(false)}
    />
    </>
  );
}