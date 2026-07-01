"use client";

import { useRouter } from "next/navigation";
import UnitActionsMenu from "./UnitActionsMenu";

export default function UnitCard({
  unidade,
  onView,
  onEdit,
  onDelete,
}) {
  const router = useRouter();

  return (
    <div
      onClick={() =>
        router.push(`/unidades/${unidade.id}`)
      }
      className="
        bg-white
        rounded-2xl
        shadow-md
        border
        p-6
        cursor-pointer
        transition-all
        hover:shadow-xl
        hover:-translate-y-1
      "
    >
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            {unidade.nome}
          </h3>

          <span
            className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
              unidade.status === "Ativa"
                ? "bg-green-100 text-green-700"
                : unidade.status === "Manutenção"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {unidade.status}
          </span>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <UnitActionsMenu
            unidade={unidade}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </div>

      <div className="space-y-3 text-gray-800">

        <p className="font-medium">
          📍 {unidade.logradouro || "-"}
          {unidade.numero
            ? `, ${unidade.numero}`
            : ""}
        </p>

        <p>
          🏙 {unidade.cidade || "-"} -{" "}
          {unidade.uf || "-"}
        </p>

        <p className="font-semibold">
          💰 R$ {unidade.aluguel || "0,00"}
        </p>

      </div>

      <div className="border-t my-4"></div>

      <div className="space-y-3 text-gray-800">

        <p>
          🏠 <strong>Kitnets:</strong>{" "}
          {unidade.kitnets || 0}
        </p>

        <p>
          📅 <strong>Vencimento:</strong>{" "}
          Dia {unidade.vencimento || "-"}
        </p>

        <p>
          👤 <strong>Locador:</strong>{" "}
          {unidade.locador || "-"}
        </p>

      </div>
    </div>
  );
}