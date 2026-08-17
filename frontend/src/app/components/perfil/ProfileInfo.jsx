"use client";

import DashboardCard from "../dashboard/DashboardCard";
import { useAuth } from "../../../context/AuthContext";

export default function ProfileInfo() {
  const { usuario } = useAuth();

  return (
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
          Informações
        </p>

        <h2
          className="
            mt-2
            text-2xl
            font-bold
            text-[var(--text)]
          "
        >
          Dados da Conta
        </h2>

      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">

        <InfoItem
          label="Nome"
          value={usuario?.nome || "-"}
        />

        <InfoItem
          label="E-mail"
          value={usuario?.email || "-"}
        />

        <InfoItem
          label="Perfil"
          value={usuario?.perfil || "-"}
        />

        <InfoItem
          label="Status"
          value={usuario?.ativo === false ? "Inativo" : "Ativo"}
          valueClass={
            usuario?.ativo === false
              ? "text-red-400"
              : "text-emerald-400"
          }
        />

      </div>

    </DashboardCard>
  );
}

function InfoItem({
  label,
  value,
  valueClass = "text-[var(--text)]",
}) {
  return (
    <div>

      <p
        className="
          text-xs
          uppercase
          tracking-wider
          text-[var(--text-faint)]
        "
      >
        {label}
      </p>

      <div
        className="
          mt-2

          rounded-2xl

          border
          border-[var(--border-token)]

          bg-[var(--surface-2)]

          px-5
          py-4
        "
      >
        <span
          className={`
            text-lg
            font-semibold
            ${valueClass}
          `}
        >
          {value}
        </span>

      </div>

    </div>
  );
}