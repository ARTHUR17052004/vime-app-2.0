"use client";

import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Home,
  Calendar,
  CreditCard,
} from "lucide-react";

import DashboardCard from "../dashboard/DashboardCard";
import InquilinoActionsMenu from "./InquilinoActionsMenu";

export default function InquilinoCard({
  inquilino,
  onEdit,
  onDelete,
}) {

  const router = useRouter();

  return (

    <DashboardCard
      onClick={() =>
        router.push(`/inquilinos/${inquilino.id}`)
      }
      className="
        h-full
        overflow-hidden

        transition-all
        duration-300

        hover:-translate-y-2
        hover:scale-[1.01]
        hover:shadow-2xl
        hover:shadow-emerald-900/20
      "
    >

      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-400" />

      <div className="flex justify-between items-start">

        <div>

          <h2 className="text-[32px] font-black text-white">
            {inquilino.nome}
          </h2>

          <span
            className={`
              inline-flex
              mt-4
              rounded-2xl
              px-4
              py-2
              text-[11px]
              uppercase
              tracking-[0.18em]
              font-bold

              ${
                inquilino.ativo
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/15 text-red-400 border border-red-500/20"
              }
            `}
          >
            {inquilino.ativo ? "Ativo" : "Inativo"}
          </span>

        </div>

        <div onClick={(e)=>e.stopPropagation()}>

          <InquilinoActionsMenu
            inquilino={inquilino}
            onEdit={onEdit}
            onDelete={onDelete}
          />

        </div>

      </div>

      <div className="mt-8 space-y-6">

        <InfoRow
          icon={<CreditCard size={18}/>}
          label={inquilino.cpf}
        />

        <InfoRow
          icon={<Mail size={18}/>}
          label={inquilino.email || "-"}
        />

        <InfoRow
          icon={<Phone size={18}/>}
          label={inquilino.telefone || "-"}
        />

      </div>

      <div className="my-7 border-t border-white/10"/>

      <div className="space-y-6">

        <InfoRow
          icon={<Home size={18}/>}
          label="Kitnet"
          value={inquilino.kitnetNome || "-"}
        />

        <InfoRow
          icon={<Calendar size={18}/>}
          label="Contrato"
          value={inquilino.dataFimContrato || "-"}
        />

        <InfoRow
          icon={<User size={18}/>}
          label="Unidade"
          value={inquilino.unidadeNome || "-"}
        />

      </div>

    </DashboardCard>

  );

}

function InfoRow({
  icon,
  label,
  value,
  valueClass="text-white",
}){

  return(

    <div className="grid grid-cols-[44px_1fr_auto] items-center gap-4">

      <div
        className="
          w-10
          h-10

          flex
          items-center
          justify-center

          rounded-xl

          bg-gradient-to-br
          from-emerald-500/15
          to-emerald-700/10

          border
          border-emerald-500/10

          text-emerald-400
        "
      >
        {icon}
      </div>

      <span className="text-gray-300 text-[15px] font-medium">
        {label}
      </span>

      {value!==undefined && (

        <span className={`text-[15px] font-semibold ${valueClass}`}>
          {value}
        </span>

      )}

    </div>

  );

}