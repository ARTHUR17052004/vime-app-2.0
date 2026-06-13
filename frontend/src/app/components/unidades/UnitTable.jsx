"use client";

export default function UnitTable({
  unidades,
  onEdit,
  onDelete,
  onView,
}) {
  if (unidades.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
        Nenhuma unidade cadastrada.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {unidades.map((unidade) => (
        <div
          key={unidade.id}
          className="bg-white rounded-2xl shadow-md border p-6 hover:shadow-lg transition"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {unidade.nome}
              </h2>

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

            <button className="text-gray-500 text-xl hover:text-gray-800">
              ⋮
            </button>
          </div>

          <div className="space-y-3 text-gray-600">
            <p>
              📍 {unidade.endereco || "-"}
              {unidade.numero
                ? `, ${unidade.numero}`
                : ""}
            </p>

            <p>
              🏙 {unidade.cidade || "-"} -{" "}
              {unidade.uf || "-"}
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
              📅 Vencimento: Dia{" "}
              {unidade.vencimento || "-"}
            </p>

            <p>
              👤 Locador:{" "}
              {unidade.locador || "-"}
            </p>
          </div>

          <div className="flex gap-4 mt-6 text-sm">
            <button
              onClick={() => onView(unidade)}
              className="text-purple-600 hover:underline"
            >
              Visualizar
            </button>

            <button
              onClick={() => onEdit(unidade)}
              className="text-blue-600 hover:underline"
            >
              Editar
            </button>

            <button
              onClick={() => onDelete(unidade.id)}
              className="text-red-600 hover:underline"
            >
              Excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}