"use client";

import UnitActionsMenu from "./UnitActionsMenu";

export default function UnitCard({
  unidade,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 border hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">
            {unidade.nome}
          </h3>

          <span
            className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${
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

        <UnitActionsMenu
          unidade={unidade}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>

      <div className="space-y-3 text-gray-600">
        <p>
          📍 {unidade.endereco || "-"}
          {unidade.numero
            ? `, ${unidade.numero}`
            : ""}
        </p>

        <p>
          🏙 {unidade.cidade || "-"} - {unidade.uf || "-"}
        </p>

        <p>
          💰 R$ {unidade.aluguel || "0,00"}
        </p>
      </div>

      <div className="border-t my-4"></div>

      <div className="space-y-2 text-gray-700">
        <p>
          🏠 Kitnets: {unidade.kitnets || 0}
        </p>

        <p>
          📅 Vencimento: Dia {unidade.vencimento || "-"}
        </p>

        <p>
          👤 Locador: {unidade.locador || "-"}
        </p>
      </div>
    </div>
  );
}