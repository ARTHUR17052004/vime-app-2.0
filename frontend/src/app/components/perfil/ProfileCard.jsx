"use client";

import { UserCircle2, ShieldCheck } from "lucide-react";

import DashboardCard from "../dashboard/DashboardCard";
import { useAuth } from "../../../context/AuthContext";

export default function ProfileCard() {
  const { usuario } = useAuth();

  const nome = usuario?.nome || "Visitante";
  const email = usuario?.email || "Sem e-mail";
  const perfil = usuario?.perfil || "SEM PERFIL";

  const inicial = nome.charAt(0).toUpperCase();

  return (
    <DashboardCard>

      <div className="flex flex-col items-center text-center">

        <div
          className="
            w-28
            h-28

            rounded-full

            bg-linear-to-br
            from-emerald-500
            to-green-700

            flex
            items-center
            justify-center

            text-5xl
            font-bold
            text-[var(--text)]

            shadow-xl
            shadow-emerald-900/40
          "
        >
          {inicial}
        </div>

        <h2
          className="
            mt-6

            text-2xl
            font-bold

            text-[var(--text)]
          "
        >
          {nome}
        </h2>

        <p className="mt-2 text-[var(--text-subtle)]">
          {email}
        </p>

        <div
          className="
            mt-6

            inline-flex

            items-center

            gap-2

            rounded-full

            bg-emerald-500/15

            border
            border-emerald-500/20

            px-4
            py-2

            text-emerald-400

            text-sm

            font-semibold
          "
        >
          <ShieldCheck size={16} />

          {perfil}
        </div>

      </div>

      <div className="mt-10 border-t border-[var(--border-token)] pt-8">

        <div className="flex items-center gap-3 text-[var(--text-muted)]">

          <UserCircle2 size={20} />

          Conta ativa

        </div>

      </div>

    </DashboardCard>
  );
}